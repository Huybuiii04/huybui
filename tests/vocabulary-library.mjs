/**
 * Luồng thư viện từ vựng 25 chủ đề: mở tab, chọn chủ đề, thêm từ vào sổ.
 *
 *   node --env-file-if-exists=.env.test tests/vocabulary-library.mjs
 *   TEST_URL=https://huybui.vercel.app node --env-file-if-exists=.env.test tests/vocabulary-library.mjs
 *
 * Cần đăng nhập (TEST_EMAIL / TEST_PASSWORD) vì trang nằm sau RouteGuard.
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD
if (!email || !password) {
  console.log('SKIP: cần TEST_EMAIL / TEST_PASSWORD để chạy luồng đã đăng nhập')
  process.exit(0)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))

try {
  await page.goto(`${base}/auth`)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel(/^Mật khẩu|Password/).fill(password)
  await page.getByRole('button', { name: /Đăng nhập|Sign in/ }).click()
  await page.waitForURL(url => !url.pathname.startsWith('/auth'), { timeout: 30000 })

  await page.goto(`${base}/app/vocabulary`)
  await page.getByRole('button', { name: /Thư viện 25 chủ đề|25-topic library/ }).click()
  await page.locator('.vocab-topic-card').first().waitFor({ timeout: 30000 })

  const topicCount = await page.locator('.vocab-topic-card').count()
  assert.equal(topicCount, 25, `Thư viện phải có 25 chủ đề, thấy ${topicCount}`)

  // Chọn chủ đề khác để chắc chắn dữ liệu được tải theo chủ đề.
  await page.locator('.vocab-topic-card').nth(23).click()
  await page.waitForTimeout(1500)
  const entries = await page.locator('.vocab-card').count()
  assert.ok(entries > 0, 'Chủ đề phải có danh sách từ')
  const firstTerm = await page.locator('.vocab-card h3').first().innerText()
  assert.ok(firstTerm.trim().length > 0, 'Mục từ phải có tên')

  // Thêm từ đầu tiên vào sổ.
  const addButton = page.getByRole('button', { name: /Thêm vào sổ|Add to notebook/ }).first()
  await addButton.click()
  await page.getByRole('button', { name: /Đã có trong sổ|In your notebook/ }).first().waitFor({ timeout: 20000 })

  // Thẻ phải xuất hiện ở tab "Sổ của tôi".
  await page.getByRole('button', { name: /Sổ của tôi|My notebook/ }).click()
  await page.locator('.vocab-card', { hasText: firstTerm.trim() }).first().waitFor({ timeout: 20000 })

  // Ô tìm kiếm lọc trong chủ đề.
  await page.getByRole('button', { name: /Thư viện 25 chủ đề|25-topic library/ }).click()
  await page.locator('.vocab-topic-card').first().click()
  await page.waitForTimeout(1200)
  const before = await page.locator('.vocab-card').count()
  await page.getByLabel(/Tìm trong chủ đề|Search this topic/).fill('zzzzkhongcot')
  await page.waitForTimeout(600)
  const after = await page.locator('.vocab-card').count()
  assert.equal(after, 0, 'Từ khoá không khớp phải lọc hết danh sách')
  assert.ok(before > 0, 'Danh sách phải có mục trước khi lọc')

  console.log(`PASS: thư viện 25 chủ đề hoạt động — thêm "${firstTerm.trim()}" vào sổ và lọc tìm kiếm đều đúng.`)
} finally {
  await browser.close()
}

if (errors.length) {
  console.log('Lỗi runtime:')
  for (const error of errors) console.log('  -', error)
  process.exit(1)
}
