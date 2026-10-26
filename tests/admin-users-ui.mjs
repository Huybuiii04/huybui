/**
 * Kiểm thử giao diện bảng quản trị → tab Người dùng:
 *   1. bảng có cột Email và hiện email của từng tài khoản;
 *   2. ô tìm kiếm lọc được theo tên / email / id;
 *   3. nút Xoá chỉ hiện với tài khoản user thường, không hiện với admin;
 *   4. modal xác nhận là hộp thoại chuẩn: focus bị khoá bên trong, Tab không
 *      thoát ra ngoài, cuộn nền bị khoá, focus quay lại nút Xoá khi đóng;
 *   5. nút xác nhận chỉ bật khi gõ đúng email và bị khoá khi đang xoá;
 *   6. bấm xác nhận gửi đúng 1 request `action: 'delete'` (không xoá hai lần);
 *   7. dòng thông báo không chứa email của user bị xoá;
 *   8. khi tải danh sách lỗi thì hiện dòng lỗi, không hiện empty state.
 *
 * Toàn bộ dữ liệu người dùng đều là dữ liệu giả: request tới Edge Function
 * `admin-users` bị intercept trước khi tới server, nên test KHÔNG xoá dữ liệu
 * thật và không gọi AI nào.
 *
 * Biến môi trường:
 *   TEST_URL            — địa chỉ dev server (mặc định http://127.0.0.1:5180).
 *   TEST_EMAIL          — email tài khoản test (trong .env.test).
 *   TEST_PASSWORD       — mật khẩu tài khoản test (trong .env.test).
 *   REQUIRE_ADMIN_UI_TEST=1 — bắt buộc chạy thật: nếu thiếu tài khoản hoặc
 *     không gọi được dev server thì script thoát với mã lỗi (thay vì SKIP) để
 *     CI không xanh giả. Không đặt biến này thì script SKIP + thoát mã 0.
 *
 *   node --env-file-if-exists=.env.test tests/admin-users-ui.mjs
 *   REQUIRE_ADMIN_UI_TEST=1 node --env-file-if-exists=.env.test tests/admin-users-ui.mjs
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5180'
const testEmail = process.env.TEST_EMAIL
const testPassword = process.env.TEST_PASSWORD
const required = ['1', 'true', 'yes'].includes(String(process.env.REQUIRE_ADMIN_UI_TEST ?? '').toLowerCase())

const ALPHA_ID = '11111111-1111-1111-1111-111111111111'
const BOSS_ID = '22222222-2222-2222-2222-222222222222'
const FAKE_USERS = [
  // Tài khoản không có tên hiển thị → thông báo phải dùng 8 ký tự đầu id,
  // tuyệt đối không đưa email vào trang.
  { user_id: ALPHA_ID, email: 'alpha@example.com', display_name: '', role: 'user', status: 'active', created_at: '2026-10-01T00:00:00.000Z' },
  { user_id: BOSS_ID, email: 'boss@example.com', display_name: 'Boss', role: 'admin', status: 'active', created_at: '2026-10-02T00:00:00.000Z' },
]

function skip(reason) {
  if (required) {
    console.error(`FAIL: ${reason}`)
    process.exit(1)
  }
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
/** Trễ (ms) của response xoá để kiểm tra trạng thái "đang xoá". */
let deleteDelayMs = 0
/** Bật lỗi cho request list để kiểm tra dòng lỗi thay cho empty state. */
let failList = false

async function waitUntilDisabled(locator, timeout = 5000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await locator.isDisabled().catch(() => false)) return true
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  return false
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  // Lớp 2 của cổng quản trị: phiên token trong sessionStorage (token giả, không
  // dùng để gọi Edge Function nào ngoài request bị intercept).
  await context.addInitScript(() => {
    sessionStorage.setItem('ielts-admin-session', JSON.stringify({ token: 'ui-test-token', expiresAt: Date.now() + 60 * 60 * 1000 }))
  })

  const page = await context.newPage()
  page.on('pageerror', error => pageErrors.push(error.message))
  // Cho phép waitForFunction theo dõi các body đã ghi lại ở Node.
  await page.exposeFunction('__adminUiDeleteBodies', () => deleteBodies.map(body => ({ ...body })))

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
      if (deleteDelayMs) await new Promise(resolve => setTimeout(resolve, deleteDelayMs))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, userId: body.userId, deleted: true }),
      })
      return
    }
    if (failList) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'server_error', message: 'boom' } }),
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
  await page.getByRole('columnheader', { name: /Email/i }).waitFor({ timeout: 30000 })
  assert.equal(await page.getByRole('columnheader', { name: /Email/i }).count(), 1, 'bảng người dùng phải có đúng một cột Email')

  const bodyRows = page.getByRole('row').filter({ has: page.getByRole('cell') })
  await bodyRows.first().waitFor({ timeout: 30000 })
  await page.getByText('alpha@example.com').first().waitFor({ timeout: 30000 })
  await page.getByText('boss@example.com').first().waitFor({ timeout: 30000 })
  assert.equal(await bodyRows.count(), 2, 'bảng phải có 2 dòng user (1 user thường, 1 admin)')

  // ---------- Tìm kiếm theo email ----------
  const search = page.getByLabel(/Tìm người dùng|Search users/)
  await search.fill('alpha@')
  await bodyRows.first().waitFor({ timeout: 10000 })
  await page.waitForFunction(() => {
    const rows = [...document.querySelectorAll('[role="row"]')].filter(row => row.querySelector('[role="cell"]'))
    return rows.length === 1
  }, null, { timeout: 10000 })
  assert.equal(await bodyRows.count(), 1, 'tìm "alpha@" phải lọc còn đúng 1 dòng')
  assert.ok(await page.getByText('alpha@example.com').count() > 0, 'dòng còn lại phải là dòng alpha@example.com')
  await search.fill('')
  await page.waitForFunction(() => {
    const rows = [...document.querySelectorAll('[role="row"]')].filter(row => row.querySelector('[role="cell"]'))
    return rows.length === 2
  }, null, { timeout: 10000 })

  // ---------- Nút Xoá: chỉ dòng user thường ----------
  const alphaRow = bodyRows.filter({ hasText: 'alpha@example.com' })
  const bossRow = bodyRows.filter({ hasText: 'boss@example.com' })
  const deleteName = /Xoá tài khoản|Delete account/
  assert.equal(await alphaRow.getByRole('button', { name: deleteName }).count(), 1, 'dòng user thường phải có nút Xoá')
  assert.equal(await bossRow.getByRole('button', { name: deleteName }).count(), 0, 'dòng admin không được có nút Xoá')

  // ---------- Modal xác nhận ----------
  await alphaRow.getByRole('button', { name: deleteName }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor({ timeout: 10000 })
  const dialogText = await dialog.innerText()
  assert.match(dialogText, /alpha@example\.com/, 'modal phải hiện email cần xác nhận')
  assert.equal(await page.locator('.usage-table [role="dialog"]').count(), 0, 'modal không được nằm trong bảng')
  assert.equal(await page.locator('body > [role="dialog"]').count(), 1, 'modal phải được render ra ngoài bảng (portal)')

  // Focus phải vào trong modal ngay khi mở.
  const focusedId = await page.evaluate(() => document.activeElement?.id ?? '')
  assert.equal(focusedId, 'admin-delete-email', 'focus phải rơi vào ô nhập email trong modal')
  // Nền không được cuộn khi modal mở.
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'phải khoá cuộn nền khi mở modal')

  // Tab (và Shift+Tab) không được thoát khỏi modal.
  for (let index = 0; index < 6; index += 1) {
    await page.keyboard.press('Tab')
    const inside = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))
    assert.ok(inside, `Tab lần ${index + 1} phải giữ focus trong modal`)
  }
  await page.keyboard.press('Shift+Tab')
  assert.ok(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))), 'Shift+Tab phải giữ focus trong modal')

  // Nhãn của nút xác nhận đổi sang "Đang xoá…" khi đang gửi request, nên locator
  // phải khớp cả hai trạng thái.
  const confirmButton = dialog.getByRole('button', { name: /Xoá vĩnh viễn|Delete permanently|Đang xoá|Deleting/ })
  const cancelButton = dialog.getByRole('button', { name: /Huỷ bỏ|Hủy bỏ|Cancel/ })
  assert.equal(await confirmButton.count(), 1, 'modal phải có nút xác nhận xoá')
  assert.equal(await cancelButton.count(), 1, 'modal phải có nút huỷ')
  assert.equal(await confirmButton.isDisabled(), true, 'nút xác nhận phải khoá khi chưa gõ email')

  const confirmInput = dialog.getByLabel(/Gõ lại email|Type the email to confirm/)
  await confirmInput.fill('wrong@example.com')
  assert.equal(await confirmButton.isDisabled(), true, 'nút xác nhận phải khoá khi gõ sai email')

  // ---------- Đóng modal: focus phải quay lại nút Xoá ----------
  await cancelButton.click()
  await dialog.waitFor({ state: 'detached', timeout: 10000 })
  assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'phải mở lại cuộn nền sau khi đóng modal')
  const restoredLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '')
  assert.match(restoredLabel, deleteName, 'focus phải quay lại nút Xoá sau khi đóng modal')

  // ---------- Mở lại modal và xoá ----------
  await alphaRow.getByRole('button', { name: deleteName }).click()
  await dialog.waitFor({ timeout: 10000 })
  await dialog.getByLabel(/Gõ lại email|Type the email to confirm/).fill('  ALPHA@Example.com  ')
  assert.equal(await confirmButton.isDisabled(), false, 'nút xác nhận phải bật khi gõ đúng email (không phân biệt hoa thường, bỏ khoảng trắng)')

  // Bấm hai lần liền: chỉ được gửi đúng một request xoá.
  deleteDelayMs = 1200
  await confirmButton.evaluate(element => { element.click(); element.click() })
  assert.ok(await waitUntilDisabled(confirmButton, 3000), 'nút xác nhận phải khoá trong lúc request xoá đang chạy')

  await page.waitForFunction(async () => (await window.__adminUiDeleteBodies()).length >= 1, null, { timeout: 20000 })

  // ---------- Request xoá đã gửi đúng ----------
  assert.equal(deleteBodies.length, 1, `phải gửi đúng 1 request xoá, thấy ${deleteBodies.length}`)
  const sent = deleteBodies[0]
  assert.equal(sent.action, 'delete', 'request xoá phải có action "delete"')
  assert.equal(sent.userId, ALPHA_ID, 'request xoá phải nhắm đúng user thường')
  assert.equal(String(sent.confirmEmail ?? '').trim().toLowerCase(), 'alpha@example.com', 'request xoá phải gửi confirmEmail khớp email')

  // Modal đóng, nền cuộn lại được, focus không bị bỏ lơ lửng.
  await dialog.waitFor({ state: 'detached', timeout: 10000 })
  assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'phải mở lại cuộn nền sau khi đóng modal')
  // Dòng bị xoá đã biến mất nên focus phải chuyển về ô tìm kiếm.
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Tìm người dùng' || document.activeElement?.getAttribute('aria-label') === 'Search users', null, { timeout: 10000 })

  // Dòng thông báo không được chứa email của user bị xoá.
  const notice = page.getByRole('status').first()
  await notice.waitFor({ timeout: 10000 })
  const noticeText = await notice.innerText()
  assert.ok(noticeText.length > 0, 'phải hiện dòng thông báo sau khi xoá')
  assert.ok(!noticeText.toLowerCase().includes('alpha@example.com'), 'dòng thông báo không được chứa email của user bị xoá')
  assert.match(noticeText, new RegExp(ALPHA_ID.slice(0, 8)), 'dòng thông báo phải dùng tên hiển thị hoặc 8 ký tự đầu id')

  // Không có request xoá nào lọt ra ngoài (mọi call admin-users đều bị intercept).
  const unexpected = handledBodies.filter(body => body?.action === 'delete' && body !== sent)
  assert.equal(unexpected.length, 0, 'không được có request xoá nào khác ngoài request đã kiểm tra')
  assert.ok(handledBodies.filter(body => body?.action === 'list').length >= 1, 'tab người dùng phải gọi list')

  // ---------- Danh sách lỗi: hiện dòng lỗi, không hiện empty state ----------
  failList = true
  await page.reload({ waitUntil: 'domcontentloaded' })
  const alert = page.getByRole('alert')
  await alert.waitFor({ timeout: 30000 })
  const alertText = await alert.innerText()
  assert.match(alertText, /Không tải được|Could not load/i, 'lỗi tải danh sách phải hiện dòng lỗi')
  assert.equal(await page.getByText(/Không có người dùng|No users yet/).count(), 0, 'lỗi tải danh sách không được hiện empty state')

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
