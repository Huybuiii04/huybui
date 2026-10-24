import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const failures = []
try {
  for (const theme of ['light', 'dark']) {
    for (const route of ['/app', '/app/write', '/app/prompts', '/library', '/app/vocabulary', '/guide', '/auth']) {
      await page.goto(`${base}${route}`)
      await page.evaluate(value => { localStorage.setItem('ielts-theme', value) }, theme)
      await page.reload()
      await page.locator('h1').waitFor()
      const applied = await page.evaluate(() => document.documentElement.dataset.theme)
      assert.equal(applied, theme, `Theme not applied on ${route}`)
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      for (const violation of violations) {
        failures.push({ theme, route, id: violation.id, count: violation.nodes.length, nodes: violation.nodes.slice(0, 4).map(node => ({ target: node.target, summary: node.failureSummary })) })
      }
    }
  }
  console.log(JSON.stringify(failures, null, 2))
  assert.equal(failures.length, 0, 'Accessibility violations')
  console.log('PASS: light and dark themes pass axe WCAG 2.1 AA on six routes.')
} finally { await browser.close() }
