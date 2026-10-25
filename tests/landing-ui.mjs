import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5180'
const browser = await chromium.launch()
try {
  const context = await browser.newContext()
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(base)
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
  await page.getByRole('button', { name: 'VI', exact: true }).click()
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.evaluate(() => document.fonts.ready)
    assert.match(await page.locator('h1').evaluate(el => getComputedStyle(el).fontFamily), /Be Vietnam Pro/)
    assert.ok(await page.evaluate(() => document.fonts.check('400 16px "Be Vietnam Pro"', 'Tiếng Việt')), 'Vietnamese font loaded')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`)
    assert.match(await page.locator('h1').innerText(), /\u00dd t\u01b0\u1edfng/)
    await page.screenshot({ path: `test-results/redesign-${width}.png`, fullPage: true, animations: 'disabled' })
  }
  for (const theme of ['dark', 'light']) {
    await page.evaluate(theme => localStorage.setItem('ielts-theme', theme), theme)
    await page.reload()
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.evaluate(() => document.fonts.ready)
    assert.match(await page.locator('h1').evaluate(el => getComputedStyle(el).fontFamily), /Be Vietnam Pro/)
    assert.ok(await page.evaluate(() => document.fonts.check('400 16px "Be Vietnam Pro"', 'Tiếng Việt')), 'Vietnamese font loaded')
    assert.equal(await page.locator('.studio-preview').evaluate(el => getComputedStyle(el).animationName), 'none')
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    assert.deepEqual(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], `${theme} accessibility`)
  }
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  assert.match(await page.locator('h1').innerText(), /Your ideas/)
  await page.locator('.landing-feature[href="/app/prompts"]').click()
  await page.waitForURL('**/app/prompts')
  await page.locator('h1').waitFor()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light')
  await page.goto(base)
  await page.locator('.landing-intro a[href="/app/write"]').click()
  await page.waitForURL('**/app/write')
  await page.locator('h1').waitFor()
  assert.deepEqual(errors, [])
  console.log('PASS: responsive 320/390/768/1440, VI/EN, light/dark, reduced motion, WCAG AA, navigation, no page errors')
} finally { await browser.close() }