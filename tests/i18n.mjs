import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const routes = ['/', '/app', '/app/write', '/app/essays', '/app/essays/demo', '/app/prompts', '/app/prompts?task=academic_task1', '/app/vocabulary', '/app/review', '/app/errors', '/app/reading', '/app/reading/cam-9-1', '/donate', '/app/settings', '/admin', '/auth']

// Dấu tiếng Việt đặc trưng. Không kiểm tra "é" vì thường là chữ mượn trong dữ liệu
// biểu đồ tiếng Anh (café, cliché) — đề thi luôn dùng nhãn tiếng Anh.
const vietnameseChars = /[àáảãạằắẳẵặầấẩẫậèẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵđĐăĂÂơƠưƯ]/i
const englishUiPhrases = [
  'Choose a topic', 'Ready prompts', 'Your attempts', 'Writing space', 'My writing', 'Prompt library',
  'Vocabulary', 'Error logbook', 'Open menu', 'Close menu', 'Save draft', 'Get feedback',
  'Add a card', 'Save to collection', 'Your workspace', 'Review',
  'Settings', 'New essay', 'Search prompts', 'Bring your own question',
]

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const problems = []

async function visibleText(route) {
  await page.goto(`${base}${route}`)
  await page.locator('h1').first().waitFor()
  return page.locator('body').innerText()
}

try {
  // 1. Chế độ tiếng Anh: không được xuất hiện chữ tiếng Việt có dấu.
  await page.goto(`${base}/app`)
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  for (const route of routes) {
    const text = await visibleText(route)
    const lines = text.split('\n').filter(line => vietnameseChars.test(line))
    if (lines.length) problems.push({ mode: 'en', route, lines: lines.slice(0, 4) })
  }

  // 2. Chế độ tiếng Việt: không được sót câu tiếng Anh của giao diện.
  await page.goto(`${base}/app`)
  await page.getByRole('button', { name: 'VI', exact: true }).click()
  for (const route of routes) {
    const text = await visibleText(route)
    const found = englishUiPhrases.filter(phrase => text.includes(phrase))
    if (found.length) problems.push({ mode: 'vi', route, found })
  }

  console.log(JSON.stringify(problems, null, 2))
  assert.equal(problems.length, 0, 'Mixed-language UI detected')
  console.log(`PASS: ${routes.length} routes are monolingual in both VI and EN.`)
} finally { await browser.close() }
