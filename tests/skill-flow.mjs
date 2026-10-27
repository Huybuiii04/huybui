// Luồng Reading trên trình duyệt thật.
// Chạy: node tests/skill-flow.mjs  (cần dev server ở http://127.0.0.1:5173)
//
// Biến môi trường:
//   TEST_URL       — bản chạy (mặc định http://127.0.0.1:5173)
//   TEST_EMAIL     — tài khoản test (trong .env.test)
//   TEST_PASSWORD  — mật khẩu tài khoản test
//
// `/app/reading` nằm sau RouteGuard nên phải đăng nhập trước, nếu không
// trang chuyển về `/auth` và không có thẻ đề nào để kiểm tra.

import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()
let failures = 0

function check(label, ok) {
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
}

try {
  if (email && password) {
    await page.goto(`${base}/auth`, { waitUntil: 'domcontentloaded' })
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    // Nút gửi không khai báo `type` nên không match `button[type="submit"]`.
    await page.getByRole('button', { name: /Đăng nhập|Sign in/ }).click()
    await page.waitForURL('**/app', { timeout: 15000 })
  } else {
    console.log('SKIP: cần TEST_EMAIL / TEST_PASSWORD để chạy luồng Reading (route nằm sau RouteGuard).')
  }

  await page.goto(`${base}/app/reading`, { waitUntil: 'domcontentloaded' })
  check('reading route is not 404', !(await page.content()).includes('404'))
  // Kho đề tải bằng fetch nên phải chờ thẻ đề (hoặc ô trống) xuất hiện.
  await page.locator('.skill-card, .empty').first().waitFor({ timeout: 15000 })
  check('reading library renders', await page.locator('.skill-card, .empty').first().isVisible())

  if (email && password) {
    const card = page.locator('.skill-card').first()
    if (await card.count()) {
      await card.click()
      await page.waitForSelector('.skill-workspace', { timeout: 15000 })
      check('reading test room opens', await page.locator('.skill-workspace').isVisible())
      check('reading timer is visible', await page.locator('.skill-timer-value').isVisible())
      check('passage content is rendered', await page.locator('.skill-passage-body').isVisible())
      check('question cards are rendered', (await page.locator('.skill-question').count()) > 0)
    }
  }
} catch (error) {
  failures += 1
  console.log(`FAIL  lỗi khi chạy luồng Reading: ${error instanceof Error ? error.message : String(error)}`)
} finally {
  await browser.close()
}

console.log(failures ? `\n${failures} kiểm tra thất bại.` : '\nTất cả kiểm tra đạt.')
process.exit(failures ? 1 : 0)
