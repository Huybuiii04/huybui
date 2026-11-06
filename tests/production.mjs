/**
 * Smoke test bản deploy: Library yêu cầu đăng nhập; có TEST_EMAIL/TEST_PASSWORD
 * thì kiểm tra thêm đăng nhập và tải kho đề bài từ Supabase.
 *
 *   TEST_URL=https://engloo.app node tests/production.mjs
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

const libraryPath = '/app/prompts?task=academic_task1'
await page.goto(`${base}${libraryPath}`, { waitUntil: 'networkidle' })
await page.waitForURL(`${base}/auth`)
assert.equal(await page.locator('.topic-card, .academic-card').count(), 0, 'Library không được hiện trước khi đăng nhập')
assert.ok(!await page.getByText(/not configured|Chưa cấu hình kết nối máy chủ/).count(), 'Thiếu cấu hình đăng nhập trên bản deploy')

if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
  await page.getByLabel('Email', { exact: true }).fill(process.env.TEST_EMAIL)
  await page.locator('input[type=password]').fill(process.env.TEST_PASSWORD)
  await page.getByRole('button', { name: /Sign in|Đăng nhập/, exact: true }).click()
  await page.waitForURL(`${base}${libraryPath}`)
  await page.locator('.topic-card').first().waitFor()
  await page.locator('.academic-card').first().waitFor()
  console.log('PASS: đăng nhập quay lại đúng Library và tải được đề từ database.')
} else {
  console.log('SKIP: kiểm tra kho đề sau đăng nhập cần TEST_EMAIL/TEST_PASSWORD.')
}

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
console.log(`PASS: bản deploy ${base} chặn Library khi chưa đăng nhập, route sâu trả 200 và không lỗi runtime.`)
