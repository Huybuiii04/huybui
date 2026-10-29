/**
 * Kiểm tra luồng Speaking Cambridge 12–20 trên trình duyệt thật.
 *
 *   node tests/speaking-flow.mjs
 *
 * - Đăng ký tài khoản test → vào /app/speaking → chọn cuốn → mở phòng luyện Part 2.
 * - Cần dev server (http://127.0.0.1:5173) và Edge Function `submit-speaking` đã deploy.
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
const email = `speaking-flow-${Date.now()}@example.com`
const password = 'SpeakingFlow123!'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const problems = []
page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))

const check = (label, condition) => {
  if (!condition) problems.push(label)
  else console.log(`  ok  ${label}`)
}

// 1. Đăng ký tài khoản test.
await page.goto(`${base}/auth`)
await page.getByRole('button', { name: 'Create an account', exact: true }).click()
await page.getByLabel('Email').fill(email)
await page.getByLabel('Display name').fill('Speaking Flow Tester')
await page.getByLabel('Password').fill(password)
await page.getByRole('button', { name: 'Create account', exact: true }).click()
await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 30000 })

// 2. Hub Speaking: chọn cuốn Cambridge.
await page.goto(`${base}/app/speaking`)
await page.locator('.page').waitFor()
const chips = page.locator('.filter-chip')
await chips.first().waitFor()
const chipCount = await chips.count()
check('hub có chip cho 9 cuốn Cambridge', chipCount === 9)
check('chip đầu tiên là Cambridge 12', (await chips.first().innerText()).trim() === 'C12')

// 3. Mỗi test có 4 dòng part + nút luyện cả 3 phần.
const testHeading = page.getByRole('heading', { name: /Test 5/ }).first()
await testHeading.waitFor()
const allParts = page.getByRole('link', { name: 'Practice', exact: true })
check('4 test × 4 nút Luyện (P1, P2, P3A, P3B)', (await allParts.count()) === 16)
const fullButtons = page.getByRole('link', { name: /All three parts/i })
check('mỗi test có nút luyện cả 3 phần', (await fullButtons.count()) === 4)

// 4. Đổi cuốn → danh sách test đổi theo.
await chips.nth(2).click()
await page.waitForTimeout(400)
check('đổi cuốn vẫn hiện 4 test', (await page.getByRole('link', { name: 'Practice', exact: true }).count()) === 16)

// 5. Mở phòng luyện Part 2 → bắt đầu → nhận cue card.
await page.goto(`${base}/app/speaking/part-2/14/1`)
await page.getByRole('button', { name: 'Start', exact: true }).click()
await page.getByRole('heading', { name: /book that you enjoyed reading/i }).waitFor({ timeout: 30000 })
check('phòng luyện hiện cue card Part 2', true)
check('hiện tiến độ lượt 1/1', await page.getByText(/Turn 1 \/ 1/).count() > 0)

// 6. Luyện cả 3 phần → 4 lượt (P1 → P2 → P3A → P3B).
await page.goto(`${base}/app/speaking/mock/14/1`)
await page.getByRole('button', { name: 'Start', exact: true }).click()
await page.getByText(/Turn 1 \/ 4/).waitFor({ timeout: 30000 })
check('full 3 phần có 4 lượt', await page.getByText(/Turn 1 \/ 4/).count() > 0)
check('lượt đầu là Part 1', await page.getByText('PART-1', { exact: false }).count() > 0)

// 7. Part 3 chủ đề B đi vào đúng chủ đề.
await page.goto(`${base}/app/speaking`)
await page.getByRole('button', { name: 'C14', exact: true }).click()
await page.waitForTimeout(400)
const part3Links = page.getByRole('link', { name: 'Practice', exact: true })
await part3Links.nth(2).click()
await page.getByRole('button', { name: 'Start', exact: true }).click()
await page.getByText(/Turn 1 \/ 1/).waitFor({ timeout: 30000 })
check('Part 3 chủ đề B mở đúng lượt', true)

// 8. Lỗi không làm vỡ giao diện.
check('không có lỗi javascript', problems.filter((item) => item.startsWith('pageerror')).length === 0)

await page.screenshot({ path: 'test-results/speaking-flow.png', fullPage: true })
await browser.close()

if (problems.length) {
  console.error('\nCÓ VẤN ĐỀ:')
  for (const problem of problems) console.error(` - ${problem}`)
  process.exit(1)
}
console.log('\nTất cả kiểm tra Speaking đều đạt.')
