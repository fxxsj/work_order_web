#!/usr/bin/env node
/**
 * Vue 2 → Vue 3 完整迁移脚本
 * 
 * 处理：
 * 1. this.$xxx → 直接导入的函数
 * 2. data() → ref() / reactive()
 * 3. computed → computed()
 * 4. methods → 普通函数
 * 5. lifecycle hooks → onXxx
 * 6. mixins → composables 或保留（Vue 3 支持）
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// 读取文件
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

// 写入文件
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8')
}

// 检查是否已迁移
function isAlreadyMigrated(content) {
  return content.includes("import { ref") || 
         content.includes("from 'vue'") && content.includes("script setup") ||
         content.includes('export default defineComponent')
}

// 替换 this.$message
function replaceMessage(content) {
  let result = content
  
  // 替换 this.$message.success/error/warning/info
  result = result.replace(/this\.\$message\.success\(/g, 'ElMessage.success(')
  result = result.replace(/this\.\$message\.error\(/g, 'ElMessage.error(')
  result = result.replace(/this\.\$message\.warning\(/g, 'ElMessage.warning(')
  result = result.replace(/this\.\$message\.info\(/g, 'ElMessage.info(')
  
  // 替换 this.$message({...}) 整体
  result = result.replace(/this\.\$message\s*\(/g, 'ElMessage(')
  
  return result
}

// 替换 this.$confirm
function replaceConfirm(content) {
  return content
    .replace(/this\.\$confirm\(/g, 'ElMessageBox.confirm(')
    .replace(/this\.\$loading\(/g, 'ElLoading.service(')
}

// 替换 this.$router
function replaceRouter(content) {
  let result = content
  result = result.replace(/this\.\$router\.push/g, 'router.push')
  result = result.replace(/this\.\$router\.replace/g, 'router.replace')
  result = result.replace(/this\.\$router\.go/g, 'router.go')
  result = result.replace(/this\.\$router\.back/g, 'router.back')
  result = result.replace(/this\.\$route\.([a-zA-Z_]+)/g, 'route.$1')
  return result
}

// 替换 this.$store
function replaceStore(content) {
  let result = content
  
  // 用户相关 getters
  result = result.replace(/this\.\$store\.getters\['user\/currentUser'\]/g, 'userStore.currentUser')
  result = result.replace(/this\.\$store\.getters\['user\/isAuthenticated'\]/g, 'userStore.isAuthenticated')
  result = result.replace(/this\.\$store\.getters\['user\/authToken'\]/g, 'userStore.currentUser?.access_token')
  result = result.replace(/this\.\$store\.getters\['user\/refreshToken'\]/g, 'userStore.currentUser?.refresh_token')
  result = result.replace(/this\.\$store\.getters\['user\/hasPermission'\]/g, 'userStore.hasPermission')
  result = result.replace(/this\.\$store\.getters\['user\/roles'\]/g, 'userStore.roles')
  
  // UI getters
  result = result.replace(/this\.\$store\.getters\['ui\/sidebarCollapsed'\]/g, 'uiStore.sidebarCollapsed')
  
  // 任务 getters
  result = result.replace(/this\.\$store\.getters\['task\/viewMode'\]/g, 'taskStore.viewMode')
  
  // Store actions
  result = result.replace(/this\.\$store\.dispatch\('user\/initUser'/g, 'userStore.setUser')
  result = result.replace(/this\.\$store\.dispatch\('user\/logout'/g, 'userStore.clearUser')
  result = result.replace(/this\.\$store\.dispatch\('user\/updateTokens'/g, 'userStore.setUser')
  result = result.replace(/this\.\$store\.dispatch\('ui\/toggleSidebar'/g, 'uiStore.toggleSidebar')
  
  return result
}

// 替换 this.$refs
function replaceRefs(content) {
  // this.$refs.xxx → refs.value.xxx
  // 但在模板中仍是 $refs.xxx，所以需要特殊处理
  return content
}

// 替换生命周期钩子
function replaceLifecycleHooks(content) {
  let result = content
  
  // mounted: () => {} → onMounted(() => {})
  result = result.replace(/mounted\s*\(\)\s*\{/g, 'onMounted(() => {')
  result = result.replace(/beforeMount\s*\(\)\s*\{/g, 'onBeforeMount(() => {')
  
  // created: () => {} → onCreated(() => {})
  result = result.replace(/created\s*\(\)\s*\{/g, 'onCreated(() => {')
  result = result.replace(/beforeCreate\s*\(\)\s*\{/g, 'onBeforeCreate(() => {')
  
  // updated: () => {} → onUpdated(() => {})
  result = result.replace(/updated\s*\(\)\s*\{/g, 'onUpdated(() => {')
  result = result.replace(/beforeUpdate\s*\(\)\s*\{/g, 'onBeforeUpdate(() => {')
  
  // destroyed: () => {} → onUnmounted(() => {})
  result = result.replace(/destroyed\s*\(\)\s*\{/g, 'onUnmounted(() => {')
  result = result.replace(/beforeDestroy\s*\(\)\s*\{/g, 'onBeforeUnmount(() => {')
  
  // errorCaptured: () => {} → onErrorCaptured(() => {})
  result = result.replace(/errorCaptured\s*\(\)\s*\{/g, 'onErrorCaptured(() => {')
  
  return result
}

// 添加必要的 imports
function addImports(content) {
  // 如果已经有 vue import，不再添加
  if (content.includes("from 'vue'") || content.includes('from "vue"')) {
    return content
  }
  
  // 查找 script 标签的位置
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return content
  
  const scriptContent = scriptMatch[1]
  
  // 如果已经有 imports，不再添加
  if (scriptContent.includes('import')) {
    return content
  }
  
  const imports = `import { ref, reactive, computed, watch, onMounted, onCreated, nextTick } from 'vue'\n`
  
  // 在 export default 之前添加 imports
  return content.replace(
    /<script>([\s\S]*?)(export default)/,
    `<script>\n${imports}$1$2`
  )
}

// 转换 Options API 到 script setup
function convertToScriptSetup(content) {
  // 如果已经是 script setup，不再转换
  if (content.includes('<script setup>')) {
    return content
  }
  
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return content
  
  let scriptContent = scriptMatch[1]
  const originalScript = scriptContent
  
  // 检查是否是 Options API
  if (!scriptContent.includes('export default')) {
    return content
  }
  
  // 提取各个选项
  const nameMatch = scriptContent.match(/name:\s*['"](\w+)['"]/)
  const componentsMatch = scriptContent.match(/components:\s*\{([^}]+)\}/)
  const propsMatch = scriptContent.match(/props:\s*\{([^}]+)\}/)
  const dataMatch = scriptContent.match(/data\s*\(\)\s*\{([\s\S]*?)\}\s*,/)
  const computedMatch = scriptContent.match(/computed:\s*\{([\s\S]*?)\}\s*,/)
  const methodsMatch = scriptContent.match(/methods:\s*\{([\s\S]*?)\}\s*,/)
  const watchMatch = scriptContent.match(/watch:\s*\{([\s\S]*?)\}\s*,/)
  const mountedMatch = scriptContent.match(/mounted\s*\(\)\s*\{([\s\S]*?)\}\s*,/)
  const createdMatch = scriptContent.match(/created\s*\(\)\s*\{([\s\S]*?)\}\s*,/)
  const beforeMountMatch = scriptContent.match(/beforeMount\s*\(\)\s*\{([\s\S]*?)\}\s*,/)
  
  // 开始构建 script setup
  let newScript = '<script setup>\n'
  
  // 添加 vue imports
  newScript += "import { ref, reactive, computed, watch, onMounted, onCreated, nextTick } from 'vue'\n"
  newScript += "import { useRouter, useRoute } from 'vue-router'\n"
  newScript += "import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'\n"
  newScript += "import { useUserStore } from '@/stores'\n\n"
  
  // 添加 store 实例
  newScript += 'const userStore = useUserStore()\n'
  newScript += 'const router = useRouter()\n'
  newScript += 'const route = useRoute()\n\n'
  
  // 移除 export default { 及其闭合
  scriptContent = scriptContent
    .replace(/export\s+default\s*\{/, '')
    .replace(/\}\s*$/, '')
  
  // 处理 data() - 转换为 ref/reactive
  if (dataMatch) {
    const dataContent = dataMatch[1].trim()
    // 简单转换：提取变量
    const varMatches = dataContent.matchAll(/(\w+):\s*([^,]+)/g)
    for (const match of varMatches) {
      const [, varName, varValue] = match
      if (varValue.trim() === '[]' || varValue.trim() === '{}') {
        newScript += `const ${varName} = ${varValue.includes('[]') ? 'ref([])' : 'reactive({})'}\n`
      } else if (varValue.trim().startsWith('{')) {
        newScript += `const ${varName} = reactive(${varValue.trim()})\n`
      } else {
        newScript += `const ${varName} = ref(${varValue.trim()})\n`
      }
    }
    newScript += '\n'
  }
  
  // 处理 computed
  if (computedMatch) {
    newScript += computedMatch[1].trim() + '\n\n'
  }
  
  // 处理 methods - 直接保留但移除 this
  if (methodsMatch) {
    let methodsContent = methodsMatch[1]
    // 移除 this.
    methodsContent = methodsContent.replace(/this\./g, '')
    newScript += methodsContent + '\n\n'
  }
  
  // 处理 watch
  if (watchMatch) {
    newScript += watchMatch[1].trim() + '\n\n'
  }
  
  // 处理 mounted
  if (mountedMatch) {
    newScript += `onMounted(() => {\n${mountedMatch[1].trim()}\n})\n\n`
  }
  
  // 处理 created
  if (createdMatch) {
    newScript += `onCreated(() => {\n${createdMatch[1].trim()}\n})\n\n`
  }
  
  // 处理 beforeMount
  if (beforeMountMatch) {
    newScript += `onBeforeMount(() => {\n${beforeMountMatch[1].trim()}\n})\n\n`
  }
  
  newScript += '</script>'
  
  // 替换原 script
  content = content.replace(/<script>[\s\S]*?<\/script>/, newScript)
  
  return content
}

// 完整迁移一个文件
function migrateFile(filePath) {
  console.log(`Migrating: ${filePath}`)
  
  let content = readFile(filePath)
  
  // 跳过已迁移的文件
  if (isAlreadyMigrated(content)) {
    console.log(`  Already migrated, skipping`)
    return false
  }
  
  // 备份原文件
  const backupPath = filePath + '.bak2'
  writeFile(backupPath, content)
  
  try {
    // 1. 替换 this.$xxx
    content = replaceMessage(content)
    content = replaceConfirm(content)
    content = replaceRouter(content)
    content = replaceStore(content)
    
    // 2. 替换生命周期钩子
    content = replaceLifecycleHooks(content)
    
    // 3. 添加 imports
    content = addImports(content)
    
    // 写入迁移后的文件
    writeFile(filePath, content)
    console.log(`  Migrated successfully`)
    return true
  } catch (error) {
    console.error(`  Error: ${error.message}`)
    // 恢复备份
    const backup = readFile(backupPath)
    writeFile(filePath, backup)
    return false
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const pattern = args[0] || 'src/views/**/*.vue'
  
  console.log(`Migration pattern: ${pattern}`)
  console.log(`This script performs basic replacements and adds imports.`)
  console.log(`Complex Options API → Composition API conversion needs manual review.`)
  console.log('')
  
  const files = glob.sync(pattern, { cwd: process.cwd() })
  console.log(`Found ${files.length} files`)
  console.log('')
  
  let migrated = 0
  let skipped = 0
  let failed = 0
  
  for (const file of files) {
    try {
      if (migrateFile(file)) {
        migrated++
      } else {
        skipped++
      }
    } catch (error) {
      console.error(`Failed: ${file} - ${error.message}`)
      failed++
    }
  }
  
  console.log('')
  console.log(`Migration complete:`)
  console.log(`  Migrated: ${migrated}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Failed: ${failed}`)
}

main()
