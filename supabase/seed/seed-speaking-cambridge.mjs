/**
 * Nạp đề Speaking Cambridge 12–20 vào bảng `speaking_questions`.
 *
 *   node --env-file-if-exists=.env.local supabase/seed/seed-speaking-cambridge.mjs
 *
 * - Nguồn dữ liệu: `supabase/seed/speaking-cambridge.json` (sinh bởi
 *   `npm run build:speaking:cambridge` từ 9 file DOCX OCR).
 * - Idempotent: upsert theo `slug`, chạy lại nhiều lần vẫn an toàn.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !secret) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong .env.local')
  process.exit(1)
}

const file = resolve(process.cwd(), 'supabase/seed/speaking-cambridge.json')
const { rows } = JSON.parse(readFileSync(file, 'utf8'))

const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=representation',
  Connection: 'close',
}

async function post(path, body) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    console.error(`Lỗi nạp ${path}:`, response.status, await response.text())
    process.exit(1)
  }
  return response.json()
}

const payload = rows.map((row) => ({
  part: row.part,
  slug: row.slug,
  topic: row.topic,
  prompt_text: row.prompt_text,
  questions: row.questions,
  cue_card: row.cue_card,
  related_part3_slug: row.related_part3_slug ?? null,
  book_number: row.book_number,
  test_number: row.test_number,
  sub_index: row.sub_index ?? 0,
  source_label: row.source_label ?? '',
  is_active: true,
}))

const saved = await post('speaking_questions?on_conflict=slug', payload)
const counts = saved.reduce((acc, row) => {
  const key = `Cambridge ${row.book_number} · Test ${row.test_number}`
  acc[key] = (acc[key] ?? 0) + 1
  return acc
}, {})
console.log(`Đã nạp ${saved.length} câu hỏi:`)
for (const [key, count] of Object.entries(counts).sort()) console.log(`  ${key}: ${count}`)

// Không gọi process.exit: để event loop tự tắt, tránh lỗi uv_close trên Windows.
