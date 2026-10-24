import { chromium } from 'playwright'
const base = 'https://huybui.vercel.app'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
await page.goto(`${base}/app/prompts`, { waitUntil: 'networkidle' })
await page.waitForTimeout(4000)
const state = await page.evaluate(() => ({
  notices: [...document.querySelectorAll('.notice')].map(n => n.textContent?.trim().slice(0, 200)),
  topicCards: document.querySelectorAll('.topic-card').length,
  academicCards: document.querySelectorAll('.academic-card').length,
  h1: document.querySelector('h1')?.textContent?.trim(),
}))
console.log(JSON.stringify(state, null, 2))
console.log('page errors:', errors.length ? errors.slice(0,3) : 'khong co')
await page.screenshot({ path: 'test-results/vercel-production.png' })
await browser.close()
