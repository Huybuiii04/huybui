import { readFileSync } from 'node:fs'
const base = process.env.TEMP + '\\task1docx\\x\\word'
const doc = readFileSync(base + '\\document.xml', 'utf8')
const rels = readFileSync(base + '\\_rels\\document.xml.rels', 'utf8')
const relMap = new Map([...rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map(m => [m[1], m[2]]))
const paras = [...doc.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)].map(m => m[0])
let shown = 0
for (const p of paras) {
  const text = [...p.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('')
  const embeds = [...p.matchAll(/r:embed="([^"]+)"/g)].map(m => m[1])
  if (embeds.length || (text && /\d\d_\d\d|cam_\d+/.test(text))) {
    console.log(JSON.stringify(text.slice(0, 90)), '->', embeds.map(e => relMap.get(e)).join(','))
    shown += 1
    if (shown > 12) break
  }
}
console.log('total paragraphs with images:', paras.filter(p => /r:embed=/.test(p)).length)
