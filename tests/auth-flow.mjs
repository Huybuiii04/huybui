/**
 * Kiểm tra luồng tài khoản: đăng ký → dùng app → đăng xuất → đăng nhập lại.
 *
 *   node tests/auth-flow.mjs
 *
 * Tài khoản test được tạo rồi xoá sau khi chạy (cần SUPABASE_SERVICE_ROLE_KEY).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'

function readEnvFile() {
  const candidates = [join(process.cwd(), '.env.local'), resolve(process.cwd(), '..', '.env.local')]
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    const values = {}
    for (const line of readFileSync(candidate, 'utf8').split('\n')) {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line)
      if (!match) continue
      values[match[1]] = match[2].replace(/^["']|["']$/g, '').trim()
    }
    return values
  }
  return {}
}

const env = { ...readEnvFile(), ...process.env }
const projectUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? ''
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY ?? ''
const email = `auth-flow-${Date.now()}@example.com`
const password = 'AuthFlow123!'
const displayName = 'Auth Flow Tester'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const problems = []
page.on('pageerror', error => problems.push(`pageerror: ${error.message}`))

const check = (label, condition) => { if (!condition) problems.push(label) }

// 1. Đăng ký → vào thẳng app.
await page.goto(`${base}/auth`)
await page.getByRole('button', { name: 'Create an account', exact: true }).click()
await page.getByLabel('Email').fill(email)
await page.getByLabel('Display name').fill(displayName)
await page.getByLabel('Password').fill(password)
await page.getByRole('button', { name: 'Create account', exact: true }).click()
await page.waitForURL(url => !url.pathname.startsWith('/auth'), { timeout: 30000 })
check('đăng ký phải vào thẳng app', !page.url().includes('/auth'))

// 2. Thanh trên cùng có nút đăng xuất.
const topbarSignOut = page.locator('.topbar-actions').getByRole('button', { name: 'Sign out', exact: true })
await page.locator('.dashboard-page').waitFor()
await topbarSignOut.waitFor()
check('thanh trên cùng phải có nút đăng xuất', await page.locator('.topbar-actions .icon-button[aria-label="Sign out"]').count() === 1)

// 3. Trang Cài đặt có panel tài khoản + email + nút đăng xuất.
await page.goto(`${base}/app/settings`)
await page.getByRole('heading', { name: 'Settings', exact: true }).waitFor()
const accountPanel = page.locator('.settings-panel').first()
check('trang cài đặt phải có panel tài khoản', (await accountPanel.innerText()).includes(email))
check('panel tài khoản phải có nút đăng xuất', await accountPanel.getByRole('button', { name: 'Sign out', exact: true }).count() === 1)

// 4. Đăng xuất → bị đưa về /auth.
await accountPanel.getByRole('button', { name: 'Sign out', exact: true }).click()
await page.waitForURL(url => url.pathname.startsWith('/auth'), { timeout: 30000 })
check('đăng xuất phải quay về trang đăng nhập', page.url().includes('/auth'))
check('sau khi đăng xuất không còn nút đăng xuất', await page.getByRole('button', { name: 'Sign out', exact: true }).count() === 0)
// 5. Đăng nhập lại được.
await page.getByLabel('Email').fill(email)
await page.getByLabel('Password').fill(password)
await page.getByRole('button', { name: 'Sign in', exact: true }).click()
await page.waitForURL(url => !url.pathname.startsWith('/auth'), { timeout: 30000 })
check('đăng nhập lại phải được', !page.url().includes('/auth'))
await page.locator('.topbar-actions').getByRole('button', { name: 'Sign out', exact: true }).waitFor()

// 6. Mobile: nút đăng xuất trong cài đặt vẫn dùng được.
await page.setViewportSize({ width: 375, height: 844 })
await page.goto(`${base}/app/settings`)
await page.getByRole('heading', { name: 'Settings', exact: true }).waitFor()
const mobileSignOut = page.locator('.settings-panel').first().getByRole('button', { name: 'Sign out', exact: true })
await mobileSignOut.waitFor()
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
check('trang cài đặt ở 375px không được tràn ngang', !overflow)
await mobileSignOut.click()
await page.waitForURL(url => url.pathname.startsWith('/auth'), { timeout: 30000 })
check('đăng xuất trên mobile phải hoạt động', page.url().includes('/auth'))

await browser.close()

// Dọn tài khoản test.
if (serviceKey && projectUrl) {
  const response = await fetch(`${projectUrl}/auth/v1/admin/users?per_page=200`, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
  const payload = await response.json()
  for (const user of payload.users ?? []) {
    if (user.email !== email) continue
    await fetch(`${projectUrl}/auth/v1/admin/users/${user.id}`, { method: 'DELETE', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
  }
}

if (problems.length) {
  console.log('VẤN ĐỀ:')
  for (const problem of problems) console.log(`  - ${problem}`)
  process.exitCode = 1
} else {
  console.log('PASS: đăng ký → đăng xuất (thanh trên cùng + cài đặt) → đăng nhập lại, kể cả trên mobile.')
}
