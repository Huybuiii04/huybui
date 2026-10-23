import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const failures = []
try {
  for (const route of ['/app', '/app/write', '/library', '/app/vocabulary', '/guide', '/auth']) {
    await page.goto(`http://127.0.0.1:5173${route}`)
    await page.locator('h1').waitFor()
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    for (const violation of violations) {
      failures.push({ route, id: violation.id, count: violation.nodes.length, nodes: violation.nodes.slice(0, 5).map(node => ({ target: node.target, summary: node.failureSummary })) })
    }
  }
  console.log(JSON.stringify(failures, null, 2))
  assert.equal(failures.length, 0, 'Accessibility violations')
  console.log('PASS: six routes pass axe WCAG 2.1 AA checks.')
} finally { await browser.close() }
