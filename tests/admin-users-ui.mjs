/**
 * Kiểm thử giao diện bảng quản trị → tab Người dùng:
 *   1. bảng có cột Email và hiện email của từng tài khoản;
 *   2. ô tìm kiếm lọc được theo tên / email / id;
 *   3. nút Xoá chỉ hiện với tài khoản user thường, không hiện với admin;
 *   4. bấm Xoá mở modal, phải gõ lại đúng email mới bật nút xác nhận;
 *   5. bấm xác nhận gửi `action: 'delete'` kèm userId + confirmEmail đúng.
 *
 * Toàn bộ dữ liệu người dùng đều là dữ liệu giả: request tới Edge Function
 * `admin-users` bị intercept trước khi tới server, nên test KHÔNG xoá dữ liệu
 * thật và không gọi AI nào.
 *
 *   node --env-file-if-exists=.env.test tests/admin-users-ui.mjs
 *   TEST_URL=http://127.0.0.1:5180 node --env-file-if-exists=.env.test tests/admin-users-ui.mjs
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5180'
const testEmail = process.env.TEST_EMAIL
const testPassword = process.env.TEST_PASSWORD

const ALPHA_ID = '11111111-1111-1111-1111-111111111111'
const BOSS_ID = '22222222-2222-2222-2222-222222222222'
const FAKE_USERS = [
  { user_id: ALPHA_ID, email: 'alpha@example.com', display_name: 'Alpha', role: 'user', status: 'active', created_at: '2026-10-01T00:00:00.000Z' },
  { user_id: BOSS_ID, email: 'boss@example.com', display_name: 'Boss', role: 'admin', status: 'active', created_at: '2026-10-02T00:00:00.000Z' },
]

function skip(reason) {
  console.log(`SKIP: ${reason}`)
  process.exit(0)
}

async function serverReachable() {
  try {
    const response = await fetch(base, { signal: AbortSignal.timeout(8000) })
    return response.status < 500
  } catch {
    return false
  }
}

if (!testEmail || !testPassword) skip('thiếu TEST_EMAIL/TEST_PASSWORD trong .env.test — cần tài khoản test của ứng dụng.')
if (!(await serverReachable())) skip(`không gọi được dev server tại ${base} — hãy chạy "npx vite --host 127.0.0.1 --port 5180".`)

const browser = await chromium.launch()
const pageErrors = []
/** Mọi body gửi tới Edge Function admin-users (đều bị intercept). */
const handledBodies = []
/** Body của các request `action: 'delete'` đã gửi đi. */
const deleteBodies = []

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  // Lớp 2 của cổng quản trị: phiên token trong sessionStorage (token giả, không
  // dùng để gọi Edge Function nào ngoài request bị intercept).
  await context.addInitScript(() => {
    sessionStorage.setItem('ielts-admin-session', JSON.stringify({ token: 'ui-test-token', expiresAt: Date.now() + 60 * 60 * 1000 }))
  })

  const page = await context.newPage()
  page.on('pageerror', error => pageErrors.push(error.message))

  // Cổng quản trị hỏi role của chính mình: trả về admin để mở bảng quản trị.
  await page.route('**/rest/v1/user_access*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const filter = url.searchParams.get('user_id') ?? ''
    const userId = filter.replace(/^eq\./, '') || '00000000-0000-0000-0000-000000000000'
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ user_id: userId, role: 'admin', status: 'active' }]),
    })
  })

  // Edge Function admin-users: list trả dữ liệu giả, delete chỉ ghi lại body.
  await page.route('**/functions/v1/admin-users', async route => {
    const request = route.request()
    let body = {}
    try {
      body = request.postDataJSON() ?? {}
    } catch {
      body = {}
    }
    handledBodies.push(body)
    if (body.action === 'delete') {
      deleteBodies.push(body)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, userId: body.userId, deleted: true }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_USERS),
    })
  })

  // ---------- Đăng nhập bằng tài khoản test ----------
  await page.goto(`${base}/auth`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel(/^Email$/).fill(testEmail)
  await page.getByLabel(/Mật khẩu|Password/).fill(testPassword)
  await page.getByRole('button', { name: /Đăng nhập|Sign in/ }).click()
  try {
    await page.waitForURL(url => !url.pathname.startsWith('/auth'), { timeout: 30000 })
  } catch {
    const message = await page.locator('.notice-error').first().innerText().catch(() => '')
    await browser.close()
    skip(`tài khoản test không đăng nhập được (${message || 'không rõ lý do'}).`)
  }

  // ---------- Mở tab Người dùng ----------
  await page.goto(`${base}/admin?tab=users`, { waitUntil: 'domcontentloaded' })
  await page.locator('.usage-head').first().waitFor({ timeout: 30000 })
  const headText = await page.locator('.usage-head').first().innerText()
  assert.match(headText, /Email/i, 'bảng người dùng phải có cột Email')

  const rows = page.locator('.usage-table .usage-row:not(.usage-head)')
  await rows.first().waitFor({ timeout: 30000 })
  await page.getByText('alpha@example.com').first().waitFor({ timeout: 30000 })
  await page.getByText('boss@example.com').first().waitFor({ timeout: 30000 })
  assert.equal(await rows.count(), 2, 'bảng phải có 2 dòng user (1 user thường, 1 admin)')

  // ---------- Tìm kiếm theo email ----------
  const search = page.getByLabel(/Tìm người dùng|Search users/)
  await search.fill('alpha@')
  await page.waitForFunction(() => document.querySelectorAll('.usage-table .usage-row:not(.usage-head)').length === 1, null, { timeout: 10000 })
  assert.equal(await rows.count(), 1, 'tìm "alpha@" phải lọc còn đúng 1 dòng')
  assert.ok(await page.getByText('alpha@example.com').count() > 0, 'dòng còn lại phải là Alpha')
  await search.fill('')
  await page.waitForFunction(() => document.querySelectorAll('.usage-table .usage-row:not(.usage-head)').length === 2, null, { timeout: 10000 })

  // ---------- Nút Xoá: chỉ dòng user thường ----------
  const alphaRow = page.locator('.usage-table .usage-row:not(.usage-head)', { hasText: 'alpha@example.com' })
  const bossRow = page.locator('.usage-table .usage-row:not(.usage-head)', { hasText: 'boss@example.com' })
  assert.equal(await alphaRow.getByRole('button', { name: /Xoá tài khoản|Delete account/ }).count(), 1, 'dòng user thường phải có nút Xoá')
  assert.equal(await bossRow.getByRole('button', { name: /Xoá tài khoản|Delete account/ }).count(), 0, 'dòng admin không được có nút Xoá')

  // ---------- Modal xác nhận ----------
  await alphaRow.getByRole('button', { name: /Xoá tài khoản|Delete account/ }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor({ timeout: 10000 })
  const dialogText = await dialog.innerText()
  assert.match(dialogText, /alpha@example\.com/, 'modal phải hiện email cần xác nhận')

  const confirmButton = dialog.getByRole('button', { name: /Xoá vĩnh viễn|Delete permanently/ })
  const cancelButton = dialog.getByRole('button', { name: /Huỷ bỏ|Hủy bỏ|Cancel/ })
  assert.equal(await confirmButton.count(), 1, 'modal phải có nút xác nhận xoá')
  assert.equal(await cancelButton.count(), 1, 'modal phải có nút huỷ')
  assert.equal(await confirmButton.isDisabled(), true, 'nút xác nhận phải khoá khi chưa gõ email')

  const confirmInput = dialog.locator('input').first()
  await confirmInput.fill('wrong@example.com')
  assert.equal(await confirmButton.isDisabled(), true, 'nút xác nhận phải khoá khi gõ sai email')

  await confirmInput.fill('  ALPHA@Example.com  ')
  assert.equal(await confirmButton.isDisabled(), false, 'nút xác nhận phải bật khi gõ đúng email (không phân biệt hoa thường, bỏ khoảng trắng)')

  await confirmButton.click()
  const deadline = Date.now() + 10000
  while (deleteBodies.length === 0 && Date.now() < deadline) await page.waitForTimeout(100)
  await page.waitForTimeout(300)

  // ---------- Request xoá đã gửi đúng ----------
  assert.equal(deleteBodies.length, 1, `phải gửi đúng 1 request xoá, thấy ${deleteBodies.length}`)
  const sent = deleteBodies[0]
  assert.equal(sent.action, 'delete', 'request xoá phải có action "delete"')
  assert.equal(sent.userId, ALPHA_ID, 'request xoá phải nhắm đúng user thường')
  assert.equal(String(sent.confirmEmail ?? '').trim().toLowerCase(), 'alpha@example.com', 'request xoá phải gửi confirmEmail khớp email')

  // Không có request xoá nào lọt ra ngoài (mọi call admin-users đều bị intercept).
  const unexpected = handledBodies.filter(body => body?.action === 'delete' && body !== sent)
  assert.equal(unexpected.length, 0, 'không được có request xoá nào khác ngoài request đã kiểm tra')
  assert.ok(handledBodies.filter(body => body?.action === 'list').length >= 1, 'tab người dùng phải gọi list')

  console.log('PASS: cột Email, tìm kiếm theo email, nút Xoá và modal xác nhận đều hoạt động.')
  console.log(`Recorded delete body: ${JSON.stringify(sent)}`)
  await context.close()
} finally {
  await browser.close()
}

if (pageErrors.length) {
  console.log('Lỗi runtime:')
  for (const error of pageErrors) console.log('  -', error)
  process.exit(1)
}
