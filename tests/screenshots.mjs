/**
 * Chụp ảnh màn hình các trang chính vào test-results/ để đối chiếu giao diện.
 *
 *   node tests/screenshots.mjs
 *
 * Cần dev server đang chạy (npm run dev). Ảnh được ghi vào test-results/ (đã gitignore).
 */
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'

const SHOTS = [
  { name: 'landing', path: '/' },
  { name: 'prompts', path: '/app/prompts' },
  { name: 'prompts-task1', path: '/app/prompts?task=academic_task1' },
  { name: 'writing', path: '/app/write' },
  { name: 'essays', path: '/app/essays' },
  { name: 'library', path: '/library' },
  { name: 'guide', path: '/guide' },
  { name: 'tools', path: '/app/tools' },
  { name: 'auth', path: '/auth' },
]

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const page = await context.newPage()

const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})

for (const shot of SHOTS) {
  await page.goto(`${base}${shot.path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `test-results/${shot.name}.png` })
  console.log(`đã chụp ${shot.name} (${shot.path})`)
}

// Bản tối cho trang kho đề bài.
await page.emulateMedia({ colorScheme: 'dark' })
await page.goto(`${base}/app/prompts?task=academic_task1`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await page.screenshot({ path: 'test-results/prompts-dark.png' })
console.log('đã chụp prompts-dark')

await browser.close()

if (errors.length) {
  console.log('\nLỗi runtime gặp phải:')
  for (const error of errors) console.log('  -', error)
  process.exit(1)
}
console.log('\nKhông có lỗi runtime.')
