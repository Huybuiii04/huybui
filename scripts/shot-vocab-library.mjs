/** Chụp ảnh tab thư viện từ vựng để kiểm tra giao diện. */
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const page = await context.newPage()
await page.goto(`${base}/auth`)
await page.getByLabel('Email').fill(email)
await page.getByLabel(/^Mật khẩu|Password/).fill(password)
await page.getByRole('button', { name: /Đăng nhập|Sign in/ }).click()
await page.waitForURL(url => !url.pathname.startsWith('/auth'), { timeout: 30000 })

await page.goto(`${base}/app/vocabulary`)
await page.getByRole('button', { name: /Thư viện 25 chủ đề|25-topic library/ }).click()
await page.locator('.vocab-topic-card').first().waitFor({ timeout: 30000 })
await page.waitForTimeout(2500)
await page.screenshot({ path: 'test-results/vocab-library-desktop.png', fullPage: false })

await page.locator('.vocab-topic-card').nth(23).click()
await page.waitForTimeout(2000)
await page.screenshot({ path: 'test-results/vocab-library-topic.png', fullPage: false })

const mobile = await context.newPage()
await mobile.setViewportSize({ width: 390, height: 844 })
await mobile.goto(`${base}/app/vocabulary`)
await mobile.getByRole('button', { name: /Thư viện 25 chủ đề|25-topic library/ }).click()
await mobile.locator('.vocab-topic-card').first().waitFor({ timeout: 30000 })
await mobile.waitForTimeout(2500)
await mobile.screenshot({ path: 'test-results/vocab-library-mobile.png', fullPage: false })

console.log('da chup 3 anh')
await browser.close()
