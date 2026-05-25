const fs = require('fs')
const path = require('path')

function findFiles(dir, filter) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    file = path.join(dir, file)
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file, filter))
    } else if (filter.test(file)) {
      results.push(file)
    }
  })
  return results
}

const vueFiles = findFiles('./src/components', /\.vue$/)
let missing = []

const componentsDts = fs.readFileSync('./src/components.d.ts', 'utf-8').toLowerCase()

vueFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8')
  const contentNoScript = content.replace(/<script.*?>[\s\S]*?<\/script>/g, '').replace(/<style.*?>[\s\S]*?<\/style>/g, '')
  
  const tags = [...contentNoScript.matchAll(/<([a-zA-Z0-9-]+)/g)]
    .map(m => m[1])
    .filter(t => t.includes('-') || /^[A-Z]/.test(t))
    .map(t => t.toLowerCase())
    
  const uniqueTags = [...new Set(tags)]
  
  const ignore = ['router-link', 'router-view', 'transition', 'keep-alive', 'teleport', 'suspense']
  
  const scriptMatch = content.match(/<script.*?>([\s\S]*?)<\/script>/)
  const script = scriptMatch ? scriptMatch[1] : ''
  const scriptImports = script.replace(/\n/g, ' ')
  
  uniqueTags.forEach(tag => {
    if (ignore.includes(tag)) return
    const pascalTag = tag.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('').toLowerCase()
    
    if (componentsDts.includes(pascalTag + ': typeof import')) return
    const importRegex = new RegExp(`import\\s+.*?${pascalTag}\\b`, 'i')
    if (importRegex.test(scriptImports)) return
    
    missing.push({ file, tag })
  })
})

console.log(JSON.stringify(missing, null, 2))
