import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/app/prompts')
await page.getByRole('heading', { name: /Luyện đề thi thử IELTS Writing|IELTS Writing practice tests/ }).waitFor()
await page.getByRole('radio', { name: /Task 1 Academic/ }).click()
await page.locator('.topic-card').first().waitFor()
const labels = await page.locator('.topic-card h3').allInnerTexts()
const literal = 'Biểu đồ đường'
console.log('labels[0]:', JSON.stringify(labels[0]), [...labels[0]].map(c => c.codePointAt(0).toString(16)).join(' '))
console.log('literal  :', JSON.stringify(literal), [...literal].map(c => c.codePointAt(0).toString(16)).join(' '))
console.log('includes:', labels.includes(literal))
await browser.close()
