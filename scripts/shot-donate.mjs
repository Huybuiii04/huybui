import { chromium } from 'playwright'
const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))

await page.goto(`${base}/donate`)
await page.waitForTimeout(3000)
const hasQr = await page.locator('.donate-qr-image').count()
console.log('có khối QR:', hasQr)
if (hasQr) {
  const box = await page.locator('.donate-qr-image').boundingBox()
  console.log('ảnh hiển thị:', box ? `${Math.round(box.width)}x${Math.round(box.height)}` : '?')
  console.log('src:', (await page.locator('.donate-qr-image').getAttribute('src'))?.slice(0, 110))
  const loaded = await page.evaluate(() => { const img = document.querySelector('.donate-qr-image'); return img instanceof HTMLImageElement ? img.complete && img.naturalWidth > 0 : false })
  console.log('ảnh tải thành công:', loaded)
  console.log('thông tin TK:', (await page.locator('.donate-method').allInnerTexts()).join(' | '))
}
await page.screenshot({ path: 'test-results/donate-qr.png', fullPage: false })
console.log('lỗi runtime:', errors.length ? errors.join(' | ') : 'không có')
await browser.close()
