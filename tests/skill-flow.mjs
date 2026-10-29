// Luồng Reading trên trình duyệt thật.
// Chạy: node tests/skill-flow.mjs  (cần dev server ở http://127.0.0.1:5173)
//
// Biến môi trường:
//   TEST_URL       — bản chạy (mặc định http://127.0.0.1:5173)
//   TEST_EMAIL     — tài khoản test (trong .env.test)
//   TEST_PASSWORD  — mật khẩu tài khoản test
//
// `/app/reading` nằm sau RouteGuard nên phải đăng nhập trước, nếu không
// trang chuyển về `/auth` và không có thẻ đề nào để kiểm tra.

import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()
let failures = 0

function check(label, ok) {
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
}

try {
  if (email && password) {
    await page.goto(`${base}/auth`, { waitUntil: 'domcontentloaded' })
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    // Nút gửi không khai báo `type` nên không match `button[type="submit"]`.
    await page.getByRole('button', { name: /Đăng nhập|Sign in/ }).click()
    await page.waitForURL('**/app', { timeout: 15000 })
  } else {
    console.log('SKIP: cần TEST_EMAIL / TEST_PASSWORD để chạy luồng Reading (route nằm sau RouteGuard).')
  }

  await page.goto(`${base}/app/reading`, { waitUntil: 'domcontentloaded' })
  check('reading route is not 404', !(await page.content()).includes('404'))
  // Kho đề tải bằng fetch nên phải chờ thẻ đề (hoặc ô trống) xuất hiện.
  await page.locator('.skill-card, .empty').first().waitFor({ timeout: 15000 })
  check('reading library renders', await page.locator('.skill-card, .empty').first().isVisible())

  if (email && password) {
    check('Animals Biology is removed from the library', await page.locator('.skill-card[href$="IELTS_Animals_Biology_B1"]').count() === 0)
    const card = page.locator('.skill-card[href="/app/reading/cam-9-1"]')
    if (await card.count()) {
      await card.click()
      await page.waitForSelector('.skill-room', { timeout: 15000 })
      check('reading test room opens', await page.locator('.skill-room').isVisible())
      check('reading timer is visible', await page.locator('.skill-room-timer').isVisible())
      check('passage content is rendered', await page.locator('.skill-passage-body').isVisible())
      check('question cards are rendered', (await page.locator('.skill-question').count()) > 0)
      const groups = page.locator('.skill-room-pane-questions .skill-group')
      check('questions 1–7 use TRUE/FALSE/NOT GIVEN', await groups.nth(0).locator('.skill-tfng').count() === 7)
      check('questions 8–13 use short answers', await groups.nth(1).locator('input[type="text"]').count() === 6)
      check('questions 8–13 have a two-word limit', (await groups.nth(1).innerText()).includes('NO MORE THAN TWO WORDS'))
      await page.locator('.skill-room-part-tab').nth(1).click()
      check('questions 14–17 use heading choices', await groups.nth(0).locator('select').count() === 4)
      check('questions 18–20 use short answers', await groups.nth(1).locator('input[type="text"]').count() === 3)
      check('questions 21–26 use YES/NO/NOT GIVEN', await groups.nth(2).locator('.skill-tfng').count() === 6)
      await page.locator('.skill-room-part-tab').nth(2).click()
      check('questions 31–33 use TRUE/FALSE/NOT GIVEN', await groups.nth(1).locator('.skill-tfng').count() === 3)
      check('questions 34–39 use six flow-chart blanks', await groups.nth(2).locator('.skill-inline-input').count() === 6)
      check('question 40 has four choices', await groups.nth(3).locator('input[type="radio"]').count() === 4)
      await page.locator('.skill-room-part-tab').nth(0).click()
      // Bố cục hai cột: passage │ câu hỏi, có thanh kéo giữa.
      check('split panes are visible', await page.locator('.skill-room-split').isVisible())
      check('resize divider is present', (await page.locator('.skill-room-divider').count()) === 1)
      check('reading opens in focus automatically', await page.locator('html').getAttribute('data-reading-focus') === 'on')
      check('focus button is removed', await page.locator('.skill-room-focus').count() === 0)
      const sidebarToggle = page.locator('.sidebar-toggle:visible')
      for (const viewport of [{ width: 1920, height: 960 }, { width: 1280, height: 600 }, { width: 375, height: 812 }, { width: 812, height: 375 }]) {
        await page.setViewportSize(viewport)
        const geometry = await page.evaluate(() => {
          const room = document.querySelector('.skill-room').getBoundingClientRect()
          const split = document.querySelector('.skill-room-split').getBoundingClientRect()
          return { top: room.top, bottom: room.bottom, splitBottom: split.bottom, height: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth }
        })
        check(`focus fills ${viewport.width}x${viewport.height} without bottom gap`, Math.abs(geometry.top) < 1 && Math.abs(geometry.bottom - geometry.height) < 1 && Math.abs(geometry.splitBottom - geometry.bottom) < 1 && !geometry.overflow)
      }
      await page.setViewportSize({ width: 1920, height: 960 })
      await page.screenshot({ path: 'test-results/reading-focus.png' })
      check('sidebar toggle is hidden in focus', await sidebarToggle.count() === 0)
      await page.locator('#question-1').getByRole('button', { name: 'FALSE', exact: true }).click()
      await page.getByRole('button', { name: /Nộp bài|Submit/, exact: true }).click()
      await page.waitForURL('**/app/reading/result/*', { timeout: 30000 })
      await page.locator('.skill-result').waitFor()
      const results = page.locator('.skill-result-list > li')
      check('submission displays correct count out of total', (await page.locator('.skill-result-score').innerText()).replace(/\s/g, '').includes('1/40'))
      check('submission displays all 40 answers', await results.count() === 40 && await results.locator('p').filter({ hasText: /Đáp án đúng|Correct answer/ }).count() === 40)
      check('explanations are hidden initially', await results.locator('.skill-explanation:visible').count() === 0)
      const explanationToggle = results.first().getByRole('button')
      await explanationToggle.focus()
      await page.keyboard.press('Enter')
      check('explanation opens with keyboard', await results.first().locator('.skill-explanation').isVisible() && await explanationToggle.getAttribute('aria-expanded') === 'true')
      check('opening one explanation keeps others hidden', await results.locator('.skill-explanation:visible').count() === 1)
      await explanationToggle.click()
      check('explanation can be hidden again', !(await results.first().locator('.skill-explanation').isVisible()))
      await page.reload()
      await page.locator('.skill-result').waitFor({ timeout: 30000 })
      check('saved result survives reload', (await page.locator('.skill-result-score').innerText()).replace(/\s/g, '').includes('1/40') && await results.count() === 40)
      await page.setViewportSize({ width: 375, height: 812 })
      await page.waitForFunction(() => document.querySelector('.workspace').getBoundingClientRect().left < 1)
      check('result fits a small phone', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      await page.screenshot({ path: 'test-results/reading-result-mobile.png' })
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.waitForFunction(() => Math.abs(document.querySelector('.workspace').getBoundingClientRect().left - 252) < 1)
      await page.screenshot({ path: 'test-results/reading-result.png' })
      await page.getByRole('link', { name: /Về kho đề|Back to the library/ }).click()
      await page.locator('.skill-card, .empty').first().waitFor()
      check('focus clears when leaving reading', await page.locator('html').getAttribute('data-reading-focus') === null)
      check('sidebar toggle returns after reading', await sidebarToggle.isVisible())
      check('collapse button is inside sidebar', await page.locator('.sidebar .sidebar-toggle').isVisible())
      await sidebarToggle.click()
      check('sidebar collapses', await page.locator('.app-shell.is-sidebar-collapsed').count() === 1)
      await sidebarToggle.click()
      check('sidebar reopens', await page.locator('.app-shell.is-sidebar-collapsed').count() === 0)
      await page.goto(`${base}/app/reading/cam-9-2`)
      await page.locator('.skill-room').waitFor()
      check('Test 2 passage 1 restores labels A–I', (await page.locator('.skill-passage-body p > strong').allTextContents()).join('') === 'ABCDEFGHI')
      check('Test 2 questions 1–6 have section choices', await groups.nth(0).locator('select').count() === 6)
      check('Test 2 questions 7–10 have four short answers', await groups.nth(1).locator('input[type="text"]').count() === 4)
      check('Test 2 questions 11–12 share one set of six checkboxes', await groups.nth(2).locator('.skill-question').count() === 1 && await groups.nth(2).locator('input[type="checkbox"]').count() === 6)
      await page.locator('#question-1 select').selectOption('H')
      await page.locator('#question-7 input').fill('two decades')
      await groups.nth(2).locator('input[value="A"]').check()
      await groups.nth(2).locator('input[value="C"]').check()
      check('two choices fill two numbered answer slots', (await page.locator('.skill-room-progress').innerText()).includes('4/40'))
      check('a third choice is disabled', await groups.nth(2).locator('input[value="B"]').isDisabled())
      await groups.nth(2).locator('input[value="C"]').uncheck()
      check('unchecking a choice clears its answer slot', (await page.locator('.skill-room-progress').innerText()).includes('3/40'))
      await groups.nth(2).locator('input[value="C"]').check()
      await page.screenshot({ path: 'test-results/cam-9-2-part-1.png' })
      await page.locator('.skill-room-part-tab').nth(1).click()
      check('Test 2 passage 2 restores labels A–G', (await page.locator('.skill-passage-body p > strong').allTextContents()).join('') === 'ABCDEFG')
      check('Test 2 questions 14–17 have paragraph choices', await groups.nth(0).locator('select').count() === 4)
      check('Test 2 questions 18–21 have people choices', await groups.nth(1).locator('select').count() === 4)
      check('Test 2 questions 22–26 have TRUE/FALSE/NOT GIVEN', await groups.nth(2).locator('.skill-tfng').count() === 5)
      await page.locator('#question-18 select').selectOption('D')
      await page.locator('.skill-room-part-tab').nth(2).click()
      check('Test 2 questions 27–31 have four choices each', await groups.nth(0).locator('input[type="radio"]').count() === 20)
      check('Test 2 questions 32–37 have YES/NO/NOT GIVEN', await groups.nth(1).locator('.skill-tfng').count() === 6)
      check('Test 2 questions 38–40 have sentence endings', await groups.nth(2).locator('select').count() === 3 && await groups.nth(2).locator('select').first().locator('option').count() === 6)
      await page.locator('#question-38 select').selectOption('A')
      await page.getByRole('button', { name: /Nộp bài|Submit/, exact: true }).click()
      await page.waitForURL('**/app/reading/result/*', { timeout: 30000 })
      await page.locator('.skill-result').waitFor()
      check('Test 2 grades corrected answers and both answer slots', (await page.locator('.skill-result-score').innerText()).replace(/\s/g, '').includes('6/40'))
    }
  }
} catch (error) {
  failures += 1
  console.log(`FAIL  lỗi khi chạy luồng Reading: ${error instanceof Error ? error.message : String(error)}`)
} finally {
  await browser.close()
}

console.log(failures ? `\n${failures} kiểm tra thất bại.` : '\nTất cả kiểm tra đạt.')
process.exit(failures ? 1 : 0)
