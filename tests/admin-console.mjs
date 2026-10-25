/**
 * Luồng bảng quản trị 2 lớp: đăng nhập app → nhập mật khẩu quản trị →
 * dashboard → danh sách user → chi tiết user (đề đã làm / đề còn lại).
 *
 *   node --env-file-if-exists=.env.test tests/admin-console.mjs
 *   TEST_URL=https://huybui.vercel.app node --env-file-if-exists=.env.test tests/admin-console.mjs
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@gmail.com'
const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'
const userEmail = process.env.TEST_EMAIL
const userPassword = process.env.TEST_PASSWORD

const browser = await chromium.launch()
const errors = []

async function signIn(context, email, password) {
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/auth`)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel(/^Mật khẩu|Password/).fill(password)
  await page.getByRole('button', { name: /Đăng nhập|Sign in/ }).click()
  await page.waitForURL(url => !url.pathname.startsWith('/auth'), { timeout: 30000 })
  return page
}

try {
  // ---------- Người thường không vào được bảng quản trị ----------
  if (userEmail && userPassword) {
    const guestContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
    const guest = await signIn(guestContext, userEmail, userPassword)
    await guest.goto(`${base}/app`)
    await guest.locator('.dashboard-hero').waitFor({ timeout: 30000 })
    // Không có mục quản trị trong menu, cũng không có thẻ quản trị trên dashboard.
    assert.equal(await guest.getByRole('link', { name: /Bảng quản trị|Administration/ }).count(), 0, 'Người thường không được thấy mục quản trị')
    assert.equal(await guest.locator('.admin-quick-panel').count(), 0, 'Người thường không được thấy thẻ quản trị trên dashboard')
    await guest.goto(`${base}/admin`)
    await guest.getByText(/không có quyền quản trị|do not have administrator access/i).first().waitFor({ timeout: 30000 })
    console.log('PASS: tài khoản thường bị chặn ở cổng quản trị.')
    await guestContext.close()
  }

  // ---------- Admin: lớp 1 đăng nhập + lớp 2 mật khẩu ----------
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await signIn(adminContext, adminEmail, adminPassword)

  // Menu bên có mục "Bảng quản trị" và dashboard có thẻ số liệu quản trị.
  await page.goto(`${base}/app`)
  await page.locator('.dashboard-hero').waitFor({ timeout: 30000 })
  await page.locator('.admin-quick-panel').waitFor({ timeout: 30000 })
  const miniStats = await page.locator('.admin-mini-stat').count()
  assert.ok(miniStats >= 4, `Thẻ quản trị trên dashboard phải có ít nhất 4 số liệu, thấy ${miniStats}`)
  await page.getByRole('link', { name: /Bảng quản trị|Administration/ }).first().waitFor({ timeout: 30000 })
  console.log('PASS: menu có mục "Bảng quản trị" và dashboard hiện thẻ số liệu quản trị.')

  await page.goto(`${base}/admin`)

  // Lớp 2: phải yêu cầu mật khẩu quản trị.
  const unlock = page.getByLabel(/Mật khẩu quản trị|Admin password/)
  await unlock.waitFor({ timeout: 30000 })

  // Sai mật khẩu phải báo lỗi, không mở được bảng.
  await unlock.fill('wrong-password')
  await page.getByRole('button', { name: /Mở bảng quản trị|Unlock/ }).click()
  await page.getByText(/Mật khẩu quản trị không đúng|admin password is incorrect/i).first().waitFor({ timeout: 30000 })

  // Mật khẩu đúng → dashboard có số liệu.
  await unlock.fill(adminPassword)
  await page.getByRole('button', { name: /Mở bảng quản trị|Unlock/ }).click()
  await page.locator('.admin-stats .stat-card').first().waitFor({ timeout: 30000 })
  const cards = await page.locator('.admin-stats .stat-card').count()
  assert.ok(cards >= 4, `Dashboard phải có ít nhất 4 thẻ số liệu, thấy ${cards}`)
  console.log(`PASS: dashboard hiển thị ${cards} thẻ số liệu.`)

  // ---------- Danh sách người dùng ----------
  await page.getByRole('button', { name: /Người dùng|Users/, exact: true }).click()
  await page.locator('.usage-row').first().waitFor({ timeout: 30000 })
  const userRows = await page.locator('.usage-table .usage-row').count()
  assert.ok(userRows > 1, 'Danh sách người dùng phải có dữ liệu')

  // ---------- Chi tiết người dùng: đề đã làm + đề còn lại ----------
  await page.locator('.usage-table .text-link').first().click()
  await page.getByText(/Đề đã làm|Prompts written/).first().waitFor({ timeout: 30000 })
  await page.getByText(/Đề còn lại|Prompts not written yet/).first().waitFor({ timeout: 30000 })
  const coverage = await page.locator('.admin-stats .stat-value').last().innerText()
  assert.match(coverage, /%/, 'Ô độ phủ phải hiện phần trăm')
  console.log(`PASS: chi tiết người dùng có "đề đã làm" và "đề còn lại" (độ phủ ${coverage}).`)

  // ---------- Tab khác tải được ----------
  await page.getByRole('button', { name: /Đề bài|Prompts/, exact: true }).click()
  await page.locator('.usage-table .usage-row').first().waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: /Từ vựng|Vocabulary/, exact: true }).click()
  await page.locator('.usage-table .usage-row').first().waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: /Tác vụ AI|AI jobs/, exact: true }).click()
  await page.locator('.usage-table .usage-row').first().waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: /Nhật ký|Audit log/, exact: true }).click()
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: /Ủng hộ|Donate/, exact: true }).click()
  await page.locator('.admin-donate').first().waitFor({ timeout: 30000 })
  const qrPreview = await page.locator('.admin-donate-preview img').count()
  assert.ok(qrPreview === 1, 'Tab ủng hộ phải hiện ảnh QR hiện tại')
  console.log('PASS: các tab đề bài, từ vựng, tác vụ AI, nhật ký, ủng hộ đều mở được.')
} finally {
  await browser.close()
}

if (errors.length) {
  console.log('Lỗi runtime:')
  for (const error of errors) console.log('  -', error)
  process.exit(1)
}
console.log('PASS: bảng quản trị hoạt động đầy đủ.')
