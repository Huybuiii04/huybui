/**
 * Kiểm tra ảnh đề Task 1: mọi thẻ academic_task1 phải có ảnh thật và ảnh phải tải được.
 *
 *   node tests/prompt-images.mjs
 *
 * Lưới dùng `loading="lazy"` nên phải cuộn hết trang rồi chờ mọi ảnh hoàn tất
 * trước khi kết luận ảnh hỏng — đếm `naturalWidth === 0` ngay sau khi render sẽ báo
 * sai (ảnh chưa tải chứ không phải ảnh hỏng).
 */
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const page = await context.newPage()

const failures = []
page.on('console', message => {
  if (message.type() === 'error') failures.push(`console: ${message.text()}`)
})
page.on('pageerror', error => failures.push(`pageerror: ${error.message}`))

await page.goto(`${base}/app/prompts?task=academic_task1`, { waitUntil: 'networkidle' })
await page.locator('.academic-card').first().waitFor()

// Cuộn toàn bộ lưới để kích hoạt lazy-load từng ảnh.
await page.evaluate(async () => {
  const step = window.innerHeight * 0.8
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y)
    await new Promise(resolve => setTimeout(resolve, 120))
  }
  window.scrollTo(0, 0)
})

// Chờ mọi ảnh settle (load hoặc error).
await page.evaluate(async () => {
  const images = [...document.querySelectorAll('.chart-image img')]
  await Promise.all(images.map(img => (img.complete
    ? null
    : new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true })
        img.addEventListener('error', resolve, { once: true })
      }))))
})

const result = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.academic-card')]
  const images = [...document.querySelectorAll('.chart-image img')]
  const broken = images.filter(img => !img.complete || img.naturalWidth === 0)
  return {
    cards: cards.length,
    images: images.length,
    broken: broken.map(img => img.getAttribute('src')),
    titles: cards.slice(0, 3).map(card => card.querySelector('h3')?.textContent?.trim()),
  }
})

console.log(`thẻ Task 1: ${result.cards} | ảnh: ${result.images} | ảnh hỏng: ${result.broken.length}`)
if (result.titles.length) console.log('ví dụ:', result.titles.join(' | '))
if (result.broken.length) console.log('ảnh hỏng:', result.broken.slice(0, 5).join('\n           '))

await page.screenshot({ path: 'test-results/task1-prompt-grid.png', fullPage: false })
await browser.close()

if (failures.length) {
  console.log('\nLỗi runtime trên trang:')
  for (const failure of failures) console.log('  -', failure)
}

if (result.broken.length || failures.length) process.exit(1)
console.log('Mọi ảnh đề Task 1 tải được.')
