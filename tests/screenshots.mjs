import { chromium } from 'playwright'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const page = await context.newPage()
await page.goto('http://127.0.0.1:5173/app/prompts?task=academic_task1')
await page.locator('.academic-card').first().waitFor()
await page.waitForTimeout(1500)
const data = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.academic-card')]
  const hit = cards.filter(c => c.textContent?.includes('Lượng khách du lịch'))
  return hit.slice(0, 2).map(c => ({ title: c.querySelector('h3')?.textContent, hasImg: Boolean(c.querySelector('.chart-image img')), text: c.textContent?.slice(0, 120) }))
})
console.log(JSON.stringify(data, null, 2))
await browser.close()
