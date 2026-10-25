/**
 * Quét VS Code Local History tìm bản gần nhất của src/styles.css.
 * Chạy: node scripts/find-css-history.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const historyRoot = join(homedir(), 'AppData', 'Roaming', 'Code', 'User', 'History')
const target = 'styles.css'
const hits = []

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) { walk(full); continue }
    if (entry.name !== 'entries.json') continue
    let raw
    try { raw = readFileSync(full, 'utf8') } catch { continue }
    if (!raw.includes(target)) continue
    let entries
    try { entries = JSON.parse(raw) } catch { continue }
    for (const item of entries) {
      if (!item.resource || !item.resource.endsWith(target)) continue
      hits.push({
        dir: full.replace(/entries\.json$/, ''),
        id: item.id,
        time: item.timestamp,
        resource: item.resource,
      })
    }
  }
}

walk(historyRoot)
hits.sort((a, b) => b.time - a.time)
console.log(`tìm thấy ${hits.length} phiên bản`)
for (const hit of hits.slice(0, 12)) {
  const file = join(hit.dir, hit.id)
  let size = 0
  let mtime = 0
  try { size = statSync(file).size; mtime = statSync(file).mtimeMs } catch {}
  console.log(`${new Date(hit.time).toISOString()}  size=${size}  ${file}`)
}
