/**
 * So moi tat ca link noi bo trong src voi bang route trong App.tsx.
 *   node scripts/check-links.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(tsx?|jsx?)$/.test(entry)) out.push(full)
  }
  return out
}

const app = readFileSync('src/App.tsx', 'utf8')
const routes = [...app.matchAll(/path="([^"]+)"/g)].map(m => m[1])

function matches(path) {
  if (routes.includes(path)) return true
  if (path.includes(':')) return false
  // route co tham so: /app/essays/:id -> /app/essays/abc
  return routes.some(route => {
    if (route === '*') return false // catch-all: NotFound -> link chet
    const pattern = '^' + route.replace(/:[^/]+/g, '[^/]+') + '$'
    return new RegExp(pattern).test(path)
  })
}

const bad = []
for (const file of walk('src')) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(/to="([^"]+)"/g)) {
    const target = m[1].split('?')[0].split('#')[0]
    if (!target.startsWith('/')) continue
    if (!matches(target)) bad.push({ file, target })
  }
  for (const m of text.matchAll(/navigate\('([^']+)'/g)) {
    const target = m[1].split('?')[0].split('#')[0]
    if (!target.startsWith('/')) continue
    if (!matches(target)) bad.push({ file, target: `${target} (navigate)` })
  }
}

console.log('Routes:', routes.join(', '))
console.log(bad.length ? `\nLINK CHET (${bad.length}):` : '\nKhong co link chet.')
for (const item of bad) console.log(`  ${item.file} -> ${item.target}`)
