/**
 * Extract du lieu 25 chu de tu bundle ForumFlash ra JSON.
 *   node scripts/ff-extract.mjs [bundle.js] [out.json]
 *
 * Bundle la mot file JS cua Next.js; du lieu nam trong bien (mang) nen tach
 * bang balanced-bracket roi eval trong vm (chi literal, khong co quyen I/O).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'

const src = readFileSync(process.argv[2] ?? `${process.env.TEMP}/ff-chunks.js`, 'utf8')
const outFile = process.argv[3] ?? 'supabase/seed/vocabulary-data.json'

/** Tra ve chi so dau ngoac ngoac dung cho `open` (theo loai '[' hoac '{'). */
function matchBracket(text, start) {
  const open = text[start]
  const close = open === '[' ? ']' : '}'
  let depth = 0, inStr = false, quote = ''
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inStr) {
      if (ch === '\\') { i++; continue }
      if (ch === quote) inStr = false
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; quote = ch; continue }
    if (ch === open) depth++
    else if (ch === close) { depth--; if (depth === 0) return i }
  }
  return -1
}

// Mang chu de: [{id, eyebrow, title, accent, description, items:[[term,pos,vi,def,[ex...]],...]}]
const anchor = src.indexOf('eyebrow:"IELTS TOPIC 01"')
if (anchor === -1) throw new Error('khong tim thay mang chu de')
const arrStart = src.lastIndexOf('[', anchor)
const arrEnd = matchBracket(src, arrStart)
const topicsLiteral = src.slice(arrStart, arrEnd + 1)

const topics = vm.runInNewContext(`(${topicsLiteral})`, Object.create(null), { timeout: 10000 })

// Ban do phat am: {term: "ipa"} — tim object chua "settle:" gan truoc mang chu de
const pronStart = src.lastIndexOf('{', src.lastIndexOf('settle:', anchor))
let pronunciations = {}
if (pronStart !== -1 && pronStart < arrStart) {
  const pronEnd = matchBracket(src, pronStart)
  try {
    pronunciations = vm.runInNewContext(`(${src.slice(pronStart, pronEnd + 1)})`, Object.create(null), { timeout: 10000 })
  } catch { pronunciations = {} }
}

const payload = topics.map(topic => ({
  id: topic.id,
  number: Number(String(topic.eyebrow).replace(/\D+/g, '')),
  title: topic.title,
  description: topic.description,
  count: topic.items.length,
  items: topic.items.map(item => ({
    term: item[0],
    pos: item[1],
    meaning: item[2],
    definition: item[3],
    examples: item[4] ?? [],
    ipa: pronunciations[item[0]] ?? null,
  })),
}))

const total = payload.reduce((sum, t) => sum + t.items.length, 0)
const missingIpa = payload.reduce((sum, t) => sum + t.items.filter(i => !i.ipa).length, 0)

writeFileSync(outFile, JSON.stringify({ source: 'forumflashstudy.com', generatedAt: new Date().toISOString(), topics: payload }, null, 2), 'utf8')

console.log(`Da ghi ${outFile}`)
console.log(`Chu de: ${payload.length}`)
console.log(`Tong muc tu: ${total}`)
console.log(`Thieu IPA: ${missingIpa}`)
for (const t of payload) console.log(`  ${String(t.number).padStart(2)} ${t.id.padEnd(20)} ${t.count}`)
console.log('\nMau:', JSON.stringify(payload[0].items[0], null, 2))
