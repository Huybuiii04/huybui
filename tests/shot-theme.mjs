/**
 * Chụp ảnh trang chủ + tổng quan để kiểm tra giao diện đen–trắng.
 *
 *   node tests/shot-theme.mjs
 */
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))

for (const theme of ['dark', 'light']) {
  await page.goto(base)
  await page.evaluate(value => localStorage.setItem('ielts-theme-v2', value), theme)
  await page.reload()
  await page.waitForTimeout(900)
  await page.screenshot({ path: `test-results/theme-landing-${theme}.png`, fullPage: true })
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
  const color = await page.evaluate(() => getComputedStyle(document.body).color)
  console.log(`${theme}: bg=${bg} | color=${color} | font=${font}`)
}

await page.evaluate(() => localStorage.setItem('ielts-theme-v2', 'dark'))
await page.goto(`${base}/app`)
await page.waitForTimeout(1200)
await page.screenshot({ path: 'test-results/theme-dashboard.png', fullPage: false })

console.log('page errors:', errors.length ? errors : 'không có')
await browser.close()
