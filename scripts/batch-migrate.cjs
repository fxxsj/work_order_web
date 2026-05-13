#!/usr/bin/env node
/**
 * 批量迁移 Vue 2 → Vue 3 的辅助脚本
 * 
 * 处理常见的 API 替换:
 * - this.$message → ElMessage
 * - this.$store.getters['user/xxx'] → userStore.xxx
 * - this.$router → router
 * - this.$confirm → ElMessageBox.confirm
 * - this.$loading → ElLoading
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const replacements = [
  // Message 替换
  { pattern: /this\.\$message\.success/g, replacement: 'ElMessage.success' },
  { pattern: /this\.\$message\.error/g, replacement: 'ElMessage.error' },
  { pattern: /this\.\$message\.warning/g, replacement: 'ElMessage.warning' },
  { pattern: /this\.\$message\.info/g, replacement: 'ElMessage.info' },
  { pattern: /this\.\$message\(/g, replacement: 'ElMessage(' },
  
  // Confirm 替换
  { pattern: /this\.\$confirm\(/g, replacement: 'ElMessageBox.confirm(' },
  
  // Loading 替换
  { pattern: /this\.\$loading\(/g, replacement: 'ElLoading.service(' },
  
  // Store 替换 - 用户相关
  { pattern: /this\.\$store\.getters\['user\/currentUser'\]/g, replacement: 'userStore.currentUser' },
  { pattern: /this\.\$store\.getters\['user\/isAuthenticated'\]/g, replacement: 'userStore.isAuthenticated' },
  { pattern: /this\.\$store\.getters\['user\/authToken'\]/g, replacement: 'userStore.currentUser?.access_token' },
  { pattern: /this\.\$store\.getters\['user\/refreshToken'\]/g, replacement: 'userStore.currentUser?.refresh_token' },
  { pattern: /this\.\$store\.getters\['user\/hasPermission'\]\(/g, replacement: 'userStore.hasPermission(' },
  
  // Store Actions
  { pattern: /this\.\$store\.dispatch\('user\/initUser'/g, replacement: 'userStore.setUser' },
  { pattern: /this\.\$store\.dispatch\('user\/logout'/g, replacement: 'userStore.clearUser' },
  { pattern: /this\.\$store\.dispatch\('user\/updateTokens'/g, replacement: 'userStore.updateTokens' },
  
  // Router 替换
  { pattern: /this\.\$router\.push/g, replacement: 'router.push' },
  { pattern: /this\.\$router\.replace/g, replacement: 'router.replace' },
  { pattern: /this\.\$router\.go/g, replacement: 'router.go' },
  { pattern: /this\.\$router\.back/g, replacement: 'router.back' },
]

function migrateFile(filePath) {
  console.log(`Processing: ${filePath}`)
  
  let content = fs.readFileSync(filePath, 'utf-8')
  const originalContent = content
  
  for (const { pattern, replacement } of replacements) {
    content = content.replace(pattern, replacement)
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content)
    console.log(`  Updated: ${filePath}`)
    return true
  }
  
  return false
}

function main() {
  const args = process.argv.slice(2)
  const pattern = args[0] || 'src/views/**/*.vue'
  
  console.log(`Migration pattern: ${pattern}`)
  
  const files = glob.sync(pattern, { cwd: process.cwd() })
  console.log(`Found ${files.length} files`)
  
  let updated = 0
  for (const file of files) {
    if (migrateFile(file)) {
      updated++
    }
  }
  
  console.log(`\nUpdated ${updated} files`)
}

main()
