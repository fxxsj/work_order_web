#!/usr/bin/env node
/**
 * Vue 2 Options API → Vue 3 Composition API 批量转换工具
 * 
 * 使用方式:
 *   node scripts/migrate-to-composition.js src/views/Login.vue
 *   node scripts/migrate-to-composition.js "src/views/**/*.vue"
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// 简单的 Vue SFC 解析
function parseVueFile(content) {
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/)
  const styleMatch = content.match(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/)
  
  return {
    template: templateMatch ? templateMatch[1] : '',
    script: scriptMatch ? scriptMatch[1] : '',
    style: styleMatch ? styleMatch[1] : '',
    hasTemplate: !!templateMatch,
    hasScript: !!scriptMatch,
    hasStyle: !!styleMatch
  }
}

// 检测是否使用 Options API
function usesOptionsAPI(script) {
  const optionsKeywords = ['data()', 'methods:', 'computed:', 'watch:', 'mounted:', 'created:', 'beforeMount:', 'beforeCreate:']
  return optionsKeywords.some(keyword => script.includes(keyword))
}

// 转换 Options API 到 Composition API
function convertToCompositionAPI(script) {
  // 移除 "export default {" 和最后的 "}"
  let content = script.trim()
  
  if (!content.startsWith('export default')) {
    return script
  }
  
  content = content.replace(/export\s+default\s*\{/, '').replace(/\}\s*$/, '')
  
  // 提取各个选项
  const dataMatch = content.match(/data\s*\(\)\s*\{([\s\S]*?)\}\s*,/)
  const methodsMatch = content.match(/methods\s*:\s*\{([\s\S]*?)\}\s*,/)
  const computedMatch = content.match(/computed\s*:\s*\{([\s\S]*?)\}\s*,/)
  const watchMatch = content.match(/watch\s*:\s*\{([\s\S]*?)\}\s*,/)
  const mountedMatch = content.match(/mounted\s*\(\)\s*\{([s\S]*?)\}\s*,/)
  const createdMatch = content.match(/created\s*\(\)\s*\{([\s\S]*?)\}\s*,/)
  const beforeMountMatch = content.match(/beforeMount\s*\(\)\s*\{([\s\S]*?)\}\s*,/)
  const beforeCreateMatch = content.match(/beforeCreate\s*\(\)\s*\{([\s\S]*?)\}\s*,/)
  const componentsMatch = content.match(/components\s*:\s*\{([\s\S]*?)\}\s*,/)
  const propsMatch = content.match(/props\s*:\s*\{([\s\S]*?)\}\s*,/)
  const mixinsMatch = content.match(/mixins\s*:\s*\[([\s\S]*?)\]\s*,/)
  const nameMatch = content.match(/name\s*:\s*['"](\w+)['"]\s*,/)
  
  let result = []
  
  // imports
  result.push('import { ref, reactive, computed, watch, onMounted, onCreated } from \'vue\'')
  
  // name
  if (nameMatch) {
    result.push(`\nconst name = '${nameMatch[1]}'`)
  }
  
  // data -> reactive
  if (dataMatch) {
    result.push(`\nconst ${dataMatch[1].trim()}`)
  }
  
  // methods
  if (methodsMatch) {
    result.push(`\n${methodsMatch[1].trim()}`)
  }
  
  // computed
  if (computedMatch) {
    result.push(`\n${computedMatch[1].trim()}`)
  }
  
  // watch
  if (watchMatch) {
    result.push(`\n${watchMatch[1].trim()}`)
  }
  
  // lifecycle hooks
  if (mountedMatch) {
    result.push(`\nonMounted(() => { ${mountedMatch[1].trim()} })`)
  }
  if (createdMatch) {
    result.push(`\nonCreated(() => { ${createdMatch[1].trim()} })`)
  }
  
  // setup()
  result.push('\nconst setup = () => {')
  if (dataMatch) result.push(`  ${dataMatch[1].trim()}`)
  if (methodsMatch) result.push(`  ${methodsMatch[1].trim()}`)
  if (computedMatch) result.push(`  ${computedMatch[1].trim()}`)
  if (watchMatch) result.push(`  ${watchMatch[1].trim()}`)
  if (mountedMatch) result.push(`  onMounted(() => { ${mountedMatch[1].trim()} })`)
  if (createdMatch) result.push(`  onCreated(() => { ${createdMatch[1].trim()} })`)
  result.push('  return {')
  if (dataMatch) result.push('    // return data')
  if (methodsMatch) result.push('    // return methods')
  if (computedMatch) result.push('    // return computed')
  result.push('  }')
  result.push('}')
  
  return result.join('\n')
}

// 处理单个文件
function migrateFile(filePath) {
  console.log(`Processing: ${filePath}`)
  
  const content = fs.readFileSync(filePath, 'utf-8')
  const parsed = parseVueFile(content)
  
  if (!parsed.hasScript) {
    console.log(`  No script section, skipping...`)
    return false
  }
  
  if (!usesOptionsAPI(parsed.script)) {
    console.log(`  Already uses Composition API or no options, skipping...`)
    return false
  }
  
  console.log(`  Converting to Composition API...`)
  
  // 这里只是标记，实际上需要更复杂的转换
  // 当前脚本只是示范，实际使用时需要完整实现
  
  return true
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: node migrate-to-composition.js <file-or-pattern>')
    process.exit(1)
  }
  
  const pattern = args[0]
  
  if (pattern.includes('*')) {
    const files = glob.sync(pattern)
    console.log(`Found ${files.length} files to process`)
    files.forEach(migrateFile)
  } else {
    migrateFile(pattern)
  }
}

main()
