/**
 * Smoke test bản deploy: app phải nối được Supabase và hiện kho đề bài.
 *
 *   TEST_URL=https://huybui.vercel.app node tests/production.mjs
 *
 * Không set TEST_URL thì test bỏ qua (cần dev server cho bản local).
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.env.TEST_URL
if (!base) {
  console.log('SKIP: đặt TEST_URL để kiểm tra bản deploy (ví dụ https://<project>.vercel.app)')
  process.exit(0)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})

await page.goto(`${base}/app/prompts`, { waitUntil: 'networkidle' })
await page.waitForTimeout(4000)

const state = await page.evaluate(() => ({
  notices: [...document.querySelectorAll('.notice')].map(node => node.textContent?.trim() ?? ''),
  topicCards: document.querySelectorAll('.topic-card').length,
  academicCards: document.querySelectorAll('.academic-card').length,
}))

// Banner "chưa cấu hình" = thiếu biến VITE_* lúc build.
assert.ok(
  !state.notices.some(text => text.includes('chưa được cấu hình') || text.includes('not configured')),
  `Thiếu biến môi trường VITE_* khi build: ${state.notices.join(' | ')}`,
)
// Không có câu "chưa kết nối kho đề bài" = đã đọc được từ database.
assert.ok(
  !state.notices.some(text => text.includes('Chưa kết nối kho đề bài') || text.includes('prompt library is not connected')),
  'Kho đề bài chưa kết nối được database',
)
assert.ok(state.topicCards > 0, 'Không có nhóm chủ đề nào được tải')
assert.ok(state.academicCards > 0, 'Không có đề nào được tải')

// Route sâu phải trả về index.html (SPA fallback).
for (const route of ['/app/write', '/app/essays', '/auth']) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' })
  assert.equal(response?.status(), 200, `Route ${route} phải trả 200`)
}

await browser.close()

if (errors.length) {
  console.log('Lỗi runtime trên bản deploy:')
  for (const error of errors) console.log('  -', error)
  process.exit(1)
}
console.log(`PASS: bản deploy ${base} nối được database — ${state.topicCards} chủ đề, ${state.academicCards} đề.`)
