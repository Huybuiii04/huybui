import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const url = new URL('./index.html', import.meta.url).href
  const shots = new URL('./.taste-skill/verified/', import.meta.url)
  await mkdir(shots, { recursive: true })
  await page.goto(url)
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.evaluate(() => document.fonts.ready)
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    for (const dark of [false, true]) {
      if (await page.locator('html').getAttribute('data-theme') !== (dark ? 'dark' : 'light')) await page.locator('#theme').click()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow ${width}`)
      await page.screenshot({ path: fileURLToPath(new URL(`${width}-${dark ? 'dark' : 'light'}.png`, shots)), fullPage: true, animations: 'disabled' })
    }
  }
  await page.locator('#menu').click()
  assert.equal(await page.locator('#menu').getAttribute('aria-expanded'), 'true')
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('#menu').getAttribute('aria-expanded'), 'false')
  await page.locator('#save-word').click()
  await page.reload()
  assert.equal(await page.locator('#save-word').getAttribute('aria-pressed'), 'true')
  for (let i = 0; i < 4; i++) {
    await page.locator(`[data-criterion="${i}"]`).click()
    assert.equal(await page.locator('#criterion-count').textContent(), `${i + 1} / 4`)
  }
  await page.locator('#criterion-range').focus()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowRight')
  assert.equal(await page.locator('#criterion-title').textContent(), 'Coherence & Cohesion')
  await page.locator('[data-task="1"]').click()
  await page.locator('[data-topic="A local library"]').click()
  await page.locator('#draft').fill('Please extend the library opening hours.')
  assert.match(await page.locator('#word-count').textContent(), /^6 từ/)
  await page.locator('#done').click()
  await page.reload()
  await page.locator('.hero-actions [data-write]').click()
  assert.equal(await page.locator('#draft').inputValue(), 'Please extend the library opening hours.')
  const downloadPromise = page.waitForEvent('download')
  await page.locator('#download').click()
  assert.equal((await downloadPromise).suggestedFilename(), 'ielts-writing-draft.txt')
  await page.keyboard.press('Escape')
  await page.locator('[data-task="2"]').click()
  await page.locator('[data-topic="Online learning"]').click()
  assert.equal(await page.locator('#draft').inputValue(), '')
  await page.locator('#draft').fill('Online learning helps me study at my own pace.')
  await page.keyboard.press('Escape')
  await page.reload()
  await page.locator('.hero-actions [data-write]').click()
  assert.equal(await page.locator('#draft').inputValue(), 'Online learning helps me study at my own pace.')
  await page.keyboard.press('Escape')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(await page.locator('.notebook').evaluate(el => getComputedStyle(el).animationName), 'none')
  await page.locator('.hero-actions [data-write]').click()
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Quota exceeded', 'QuotaExceededError') } })
  await page.locator('#draft').fill('This draft must remain available when storage fails.')
  await page.locator('#done').click()
  assert.equal(await page.locator('#writer').evaluate(el => el.open), true)
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('#writer').evaluate(el => el.open), true)
  assert.match(await page.locator('#save-status').textContent(), /Hãy tải bản nháp/)
  assert.deepEqual(errors, [])
  console.log('PASS: 3 widths × 2 themes; menu, vocabulary, 4 criteria, keyboard, per-topic drafts, reload, download, reduced motion, storage failure protection; no JS errors.')
} finally {
  await browser.close()
}
