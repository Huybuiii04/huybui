/**
 * Nạp bảng giá AI vào `ai_pricing` (pricing_version = 'anthropic-pricing-v1').
 *
 *   node --env-file-if-exists=.env.local supabase/seed/seed-ai-pricing.mjs
 *
 * Giá tính theo USD / 1 triệu token. Model chưa có trong bảng => cost là null,
 * không ghi 0 giả. Đơn giá có thể đổi theo thời gian — sửa ở đây rồi chạy lại.
 */
const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const secret = process.env.SUPABASE_SECRET_KEY
if (!url || !secret) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong .env.local')
  process.exit(1)
}

const PRICING_VERSION = 'anthropic-pricing-v1'

/** input/output/cache-write/cache-read theo USD trên 1 triệu token. */
const pricing = [
  { model: 'claude-sonnet-4-6', input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  { model: 'claude-haiku-4-5', input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
  // Model đang dùng hiện tại (bên thứ 3) — cùng bậc giá Haiku.
  { model: 'claude-haiku-5-5', input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
]

const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=representation',
  Connection: 'close',
}

const rows = pricing.map(item => ({
  pricing_version: PRICING_VERSION,
  model: item.model,
  input_per_million: item.input,
  output_per_million: item.output,
  cache_write_per_million: item.cacheWrite,
  cache_read_per_million: item.cacheRead,
  currency: 'USD',
}))

const response = await fetch(`${url}/rest/v1/ai_pricing?on_conflict=pricing_version,model`, {
  method: 'POST',
  headers,
  body: JSON.stringify(rows),
})
if (!response.ok) {
  console.error('Lỗi nạp ai_pricing:', response.status, await response.text())
  process.exit(1)
}

const saved = await response.json()
console.log(`Đã nạp ${saved.length} dòng giá cho ${PRICING_VERSION}:`)
for (const row of saved) {
  console.log(`  ${row.model}: vào ${row.input_per_million}$ / ra ${row.output_per_million}$ / 1M token`)
}
// Không gọi process.exit: để vòng lặp sự kiện tự kết thúc, tránh lỗi uv_close trên Windows.

