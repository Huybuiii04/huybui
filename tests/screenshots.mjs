import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
await mkdir('test-results', { recursive: true })
for (const [name, route] of [['writing', '/app/write?task=academic_task1'], ['library', '/library'], ['guide', '/guide'], ['landing', '/'], ['feedback', '/app/essays/demo'], ['vocabulary', '/app/vocabulary']]) {
  await page.goto(`http://127.0.0.1:5173${route}`)
  await page.locator('h1').waitFor()
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true })
}
await browser.close()
console.log('screenshots written')
