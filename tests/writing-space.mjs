/**
 * Kiểm tra nhanh các thay đổi: ngôn ngữ mặc định EN, đăng ký là đăng nhập
 * được ngay, cột trái hiện ảnh đề Task 1, tiêu đề đề bài theo ngôn ngữ,
 * và không còn thanh chuyển task.
 *
 *   node tests/writing-space.mjs
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
const email = `writing-space-${Date.now()}@example.com`
const password = 'WritingSpace123!'
const displayName = 'Writing Space Tester'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const problems = []
page.on('pageerror', error => problems.push(`pageerror: ${error.message}`))

const check = (label, condition) => { if (!condition) problems.push(label) }

// 1. Mặc định là EN (không có localStorage).
await page.goto(`${base}/app/prompts?task=academic_task1`)
await page.locator('.academic-card').first().waitFor()
check('mặc định phải là EN', await page.locator('html').getAttribute('lang') === 'en')
const cardTitles = await page.locator('.academic-card h3').allInnerTexts()
check('tiêu đề đề bài phải là tiếng Anh', cardTitles.some(title => title.includes('Cinema ticket sales')))
check('tiêu đề đề bài không lẫn tiếng Việt', !cardTitles.some(title => /[àáảãạăâđêôơư]/i.test(title)))

// 2. Đăng ký xong phải vào thẳng app (không cần xác nhận email).
await page.goto(`${base}/auth`)
await page.getByRole('button', { name: 'Create an account', exact: true }).click()
await page.getByLabel('Email').fill(email)
await page.getByLabel('Display name').fill(displayName)
await page.getByLabel('Password').fill(password)
await page.getByRole('button', { name: 'Create account', exact: true }).click()
await page.waitForURL(url => !url.pathname.startsWith('/auth'), { timeout: 30000 })
check('đăng ký phải vào thẳng app', !page.url().includes('/auth'))

// 3. Mở đề Task 1 Academic: ảnh đề hiện ở cột trái, không còn thanh chuyển task.
await page.goto(`${base}/app/write?task=academic_task1&prompt=t1-w1-009`)
await page.locator('.task-image img').waitFor()
check('cột trái phải có ảnh đề', await page.locator('.task-image img').count() === 1)
check('không còn thanh chuyển task', await page.locator('.editor-toolbar .segmented').count() === 0)
check('thanh công cụ chỉ hiện loại bài đang làm', (await page.locator('.editor-task').innerText()).includes('Task 1 Academic'))
check('câu hỏi phải hiện ở cột trái', (await page.locator('.task-text').innerText()).includes('cinema ticket sales'))
check('tiêu đề đề phải theo ngôn ngữ', (await page.locator('.task-title').innerText()).includes('Cinema ticket sales'))
await page.waitForFunction(() => { const img = document.querySelector('.task-image img'); return Boolean(img && img.complete && img.naturalWidth > 0) }, null, { timeout: 30000 })
check('ảnh đề phải tải được', await page.evaluate(() => { const img = document.querySelector('.task-image img'); return Boolean(img && img.complete && img.naturalWidth > 0) }))

// 4. Đổi sang VI: tiêu đề đề bài đổi theo.
await page.getByRole('button', { name: 'VI', exact: true }).click()
await page.waitForTimeout(400)
check('tiêu đề đề phải đổi sang tiếng Việt', (await page.locator('.task-title').innerText()).includes('Số vé xem phim'))
await page.getByRole('button', { name: 'EN', exact: true }).click()
await page.waitForTimeout(400)
check('tiêu đề đề phải quay lại tiếng Anh', (await page.locator('.task-title').innerText()).includes('Cinema ticket sales'))

// 5. Bấm ảnh đề → xem ảnh đầy đủ.
await page.locator('.task-image').click()
await page.locator('.image-lightbox img').waitFor()
check('lightbox phải mở', await page.locator('.image-lightbox').count() === 1)
await page.locator('.image-lightbox-close').click()

await page.screenshot({ path: 'test-results/writing-space-task1.png', fullPage: false })
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
  console.log('PASS: ngôn ngữ mặc định EN, đăng ký là đăng nhập được, cột trái hiện ảnh đề, tiêu đề đổi theo ngôn ngữ, không còn thanh chuyển task.')
}
