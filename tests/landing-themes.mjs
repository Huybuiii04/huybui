// TEST_URL=https://engloo.app node tests/landing-themes.mjs
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5181'
const out = 'test-results/landing-themes'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
const backgrounds = { light: 'rgb(245, 240, 230)', dark: 'rgb(29, 25, 22)' }
const themeLayouts = new Map()

try {
  for (const lang of ['en', 'vi']) for (const theme of ['light', 'dark']) for (const width of [1440, 768, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    await context.addInitScript(({ lang, theme }) => {
      if (!localStorage.getItem('ielts-language')) localStorage.setItem('ielts-language', lang)
      if (!localStorage.getItem('ielts-theme-v2')) localStorage.setItem('ielts-theme-v2', theme)
    }, { lang, theme })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const metrics = await page.evaluate(() => {
      const heading = document.querySelector('h1')
      return {
        background: getComputedStyle(document.querySelector('.landing')).backgroundColor,
        lines: heading.offsetHeight / parseFloat(getComputedStyle(heading).lineHeight),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      }
    })
    assert.equal(metrics.background, backgrounds[theme])
    assert.equal(metrics.overflow, false)
    assert.ok(metrics.lines < 2.1, `${lang} ${width}: heading exceeds two lines`)
    const layout = await page.locator('.landing-stage, .landing-intro, .skill-art, .landing-learning').evaluateAll(nodes => nodes.map(node => {
      const { x, y, width, height } = node.getBoundingClientRect()
      return [x, y, width, height].map(Math.round)
    }))
    const layoutKey = `${lang}-${width}`
    if (theme === 'light') themeLayouts.set(layoutKey, layout)
    else assert.deepEqual(layout, themeLayouts.get(layoutKey), 'Light and dark themes must preserve hero size and alignment')
    assert.match(await page.title(), /Engloo\.app/)
    assert.equal(await page.locator('.brand').first().innerText(), 'Engloo.app')
    assert.equal(await page.locator('.landing-nav a[href="/auth"]').count(), 1)
    assert.equal(await page.locator('.landing-nav .button.primary').getAttribute('href'), '/auth')
    assert.equal(await page.locator(`.landing-nav .button.primary [data-copy="${lang}"]`).textContent(), lang === 'vi' ? 'Đăng nhập' : 'Sign in')
    if (width === 1440) assert.equal(await page.locator('.landing-nav a[href="/app/prompts"]').innerText(), lang === 'vi' ? 'Thư viện' : 'Library')
    assert.deepEqual(await page.locator('.rhythm-skill h3').allInnerTexts(), ['Speaking', 'Reading', 'Listening', 'Writing'])
    assert.equal(await page.locator('.rhythm-skills').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), width === 1440 ? 4 : width === 768 ? 2 : 1)
    assert.equal(await page.getByText(/Sắp có|Coming soon/, { exact: true }).count(), 0)
    const logoSize = await page.locator('.brand').first().evaluate(el => ({ font: getComputedStyle(el).fontSize, icon: el.querySelector('img').getBoundingClientRect().width }))
    assert.doesNotMatch(await page.locator('body').innerText(), /IELTS (Writing )?Studio/)
    const image = page.locator('.skill-art img:visible')
    assert.equal(await image.count(), 1)
    assert.equal(await image.getAttribute('src'), `/images/english-study-${theme}.webp`)
    assert.ok(await image.evaluate(el => el.complete && el.naturalWidth > 0))
    const skillArt = page.locator('.rhythm-art:visible')
    assert.equal(await skillArt.count(), 4)
    await page.locator('.landing-rhythm').scrollIntoViewIfNeeded()
    await skillArt.evaluateAll(images => Promise.all(images.map(image => image.decode())))
    assert.deepEqual(await skillArt.evaluateAll(images => images.map(image => image.getAttribute('src'))), ['speaking', 'reading', 'listening', 'writing'].map(skill => `/images/skills/${skill}-${theme}.webp`))
    const feedback = page.locator('.landing-feedback')
    await feedback.scrollIntoViewIfNeeded()
    const feedbackArt = feedback.locator('.feedback-art img:visible')
    await feedbackArt.evaluate(image => image.decode())
    assert.equal(await feedbackArt.getAttribute('src'), `/images/feedback/${theme}.webp`)
    assert.ok(await feedback.locator('h2').evaluate(el => el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight) < 2.1), 'Feedback heading must fit two lines')
    for (const skill of ['writing', 'speaking', 'reading', 'listening']) {
      await feedback.locator(`input[value="${skill}"]`).check()
      assert.deepEqual(await feedback.locator('.sample-panel:visible').evaluateAll(nodes => nodes.map(node => node.dataset.feedbackPanel)), [skill])
      assert.equal(await feedback.locator('.sample-panel:visible .sample-criterion').count(), 4)
    }
    await feedback.locator('input[value="writing"]').focus()
    await page.keyboard.press('ArrowRight')
    assert.equal(await feedback.locator('input[value="speaking"]').isChecked(), true)
    await feedback.locator('input[value="writing"]').check()
    await feedback.screenshot({ path: `${out}/feedback-${lang}-${theme}-${width}.png`, style: '.landing-nav, .skip-link { visibility: hidden !important; }' })
    await page.evaluate(() => scrollTo(0, 0))
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    assert.deepEqual(axe.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })), [])
    await page.screenshot({ path: `${out}/${lang}-${theme}-${width}.png`, fullPage: true })
    await page.locator('[data-theme-switch]').click()
    const switched = theme === 'light' ? 'dark' : 'light'
    assert.equal(await page.locator('html').getAttribute('data-theme'), switched)
    assert.equal(await image.getAttribute('src'), `/images/english-study-${switched}.webp`)
    assert.equal(await feedbackArt.getAttribute('src'), `/images/feedback/${switched}.webp`)
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.locator('html').getAttribute('data-theme'), switched)
    assert.equal(await image.getAttribute('src'), `/images/english-study-${switched}.webp`)
    await page.goto(base + '/auth', { waitUntil: 'networkidle' })
    assert.equal(await page.getByRole('link', { name: /Explore without an account|Khám phá không cần tài khoản/ }).count(), 0)
    assert.deepEqual(await page.locator('.brand').first().evaluate(el => ({ font: getComputedStyle(el).fontSize, icon: el.querySelector('img').getBoundingClientRect().width })), logoSize, 'Sign-in and homepage logos must match')
    assert.deepEqual(errors, [])
    console.log(`PASS Engloo.app ${lang} ${theme} ${width}`)
    await context.close()
  }
  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const staticPage = await staticContext.newPage()
  await staticPage.goto(base, { waitUntil: 'networkidle' })
  for (const skill of ['writing', 'speaking', 'reading', 'listening']) {
    await staticPage.locator(`.sample-tab input[value="${skill}"]`).check()
    assert.deepEqual(await staticPage.locator('.sample-panel:visible').evaluateAll(nodes => nodes.map(node => node.dataset.feedbackPanel)), [skill])
  }
  console.log('PASS feedback controls without JavaScript')
  await staticContext.close()
} finally {
  await browser.close()
}
