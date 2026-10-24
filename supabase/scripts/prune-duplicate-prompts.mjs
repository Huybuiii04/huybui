/**
 * Dọn đề Task 1 trùng: bộ cũ dựng SVG (chart JSON nội tuyến) đã bị thay bằng
 * bộ ảnh Cambridge thật (chart.url trỏ tới bucket `prompt-media`).
 *
 *   node --env-file-if-exists=.env.local supabase/scripts/prune-duplicate-prompts.mjs
 *   node --env-file-if-exists=.env.local supabase/scripts/prune-duplicate-prompts.mjs --apply
 *
 * - Không có `--apply` => chỉ báo cáo, không ghi gì.
 * - Chỉ xoá đúng nhóm thừa: task = 'academic_task1' và chart có dữ liệu nhưng không có `url`.
 * - `seed-library.mjs` đã lọc bỏ nhóm này nên chạy seed lại không tạo lại đề cũ.
 */
const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const secret = process.env.SUPABASE_SECRET_KEY
if (!url || !secret) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong .env.local')
  process.exit(1)
}
const apply = process.argv.includes('--apply')

const headers = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }

async function api(path, options = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, { ...options, headers })
  const text = await response.text()
  if (!response.ok) throw new Error(`${response.status} ${text}`)
  return text ? JSON.parse(text) : null
}

const stale = await api('prompts?select=id,slug,title_en,subtype,chart&task=eq.academic_task1&not(chart,is,null)')
const targets = stale.filter(row => !row.chart?.url)
const keepers = stale.filter(row => row.chart?.url)

console.log(`Đề Task 1 có ảnh thật (giữ): ${keepers.length}`)
console.log(`Đề Task 1 dựng SVG (dư thừa):  ${targets.length}`)
for (const row of targets) {
  console.log(`  - ${row.slug.padEnd(26)} ${String(row.subtype).padEnd(8)} ${row.title_en ?? ''}`)
}

if (!targets.length) {
  console.log('\nKhông có đề dư thừa. Không cần dọn.')
  process.exit(0)
}

if (!apply) {
  console.log('\nChạy lại với --apply để xoá.')
  process.exit(0)
}

const ids = targets.map(row => row.id)
// Chỉ xoá đúng các id đã liệt kê ở trên — không đụng tới đề ảnh thật.
for (const id of ids) await api(`prompts?id=eq.${id}`, { method: 'DELETE' })

async function count(query) {
  const response = await fetch(`${url}/rest/v1/${query}`, { headers: { ...headers, Prefer: 'count=exact' }, method: 'HEAD' })
  return Number(response.headers.get('content-range')?.split('/')[1] ?? 0)
}
const total = await count('prompts?select=id')
const task1 = await count('prompts?select=id&task=eq.academic_task1')
console.log(`\nĐã xoá ${ids.length} đề dư thừa. Còn ${total} đề, trong đó ${task1} đề Task 1 Academic.`)
process.exit(0)
