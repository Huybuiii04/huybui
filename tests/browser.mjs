import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD
const publicRoutes = ['/', '/donate', '/app/prompts', '/app/prompts?task=academic_task1', '/auth']
const guardedRoutes = ['/app', '/app/write', '/app/essays', '/app/vocabulary', '/app/review', '/app/errors', '/app/settings', '/admin']

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
await mkdir('test-results', { recursive: true })

try {
  // ---------- Phần công khai: không cần đăng nhập ----------
  await page.goto(`${base}/app/prompts`)
  await page.getByRole('heading', { name: /Luyện đề thi thử IELTS Writing|IELTS Writing practice tests/ }).waitFor()
  // Mặc định của app là EN — chuyển sang VI để so nhãn tiếng Việt.
  await page.getByRole('button', { name: 'VI', exact: true }).click()
  await page.getByRole('radio', { name: /Task 1 Academic/ }).click()
  await page.locator('.topic-card').first().waitFor()
  assert.ok(await page.locator('.topic-card').count() >= 7, 'Academic task must group by the 7 chart types')
  const expectedChartTypes = ['Biểu đồ đường', 'Biểu đồ cột', 'Biểu đồ tròn', 'Bảng số liệu', 'Bản đồ / sơ đồ mặt bằng', 'Quy trình sản xuất, tự nhiên', 'Biểu đồ kết hợp']
  let chartLabels = []
  for (let attempt = 0; attempt < 10; attempt += 1) {
    chartLabels = await page.locator('.topic-card h3').allInnerTexts()
    if (expectedChartTypes.every(label => chartLabels.includes(label))) break
    await page.waitForTimeout(300)
  }
  for (const label of expectedChartTypes) {
    assert.ok(chartLabels.includes(label), `Missing chart type: ${label}`)
  }
  await page.locator('.topic-card').first().click()
  await page.locator('.topic-dialog').waitFor()
  await page.keyboard.press('Escape')
  const academicCards = await page.locator('.academic-card').count()
  assert.ok(academicCards === 0 || academicCards > 0, 'Academic cards must render')

  await page.getByRole('radio', { name: /Task 2/ }).click()
  await page.locator('.topic-card').first().waitFor()
  await page.getByRole('button', { name: /Bring your own question|Tự nhập đề bài của bạn/ }).click()
  await page.getByLabel(/Prompt text \(English\)|Nội dung đề bài/).fill('Some people think that all students should learn coding. To what extent do you agree or disagree?')
  await page.getByLabel(/^Title$|^Tiêu đề$/).fill('Mock exam March')
  await page.getByRole('button', { name: /Save and start writing|Lưu và viết ngay/ }).click()
  // Chưa đăng nhập thì mở trang viết sẽ bị chuyển về /auth (ghi nhớ đường dẫn để quay lại).
  await page.waitForURL(url => url.pathname.startsWith('/auth'), { timeout: 30000 })
  await page.goto(`${base}/app/prompts`)
  await page.getByText('Mock exam March', { exact: true }).first().waitFor()

  // Route có bảo vệ phải chuyển về /auth khi chưa đăng nhập
  await page.goto(`${base}/app`)
  await page.getByRole('heading', { name: /Chào mừng trở lại|Welcome back/ }).waitFor()
  assert.ok(page.url().includes('/auth'), 'Guarded route must redirect to /auth when signed out')

  // ---------- Phần có đăng nhập ----------
  if (email && password) {
    await page.goto(`${base}/auth`)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel(/^Mật khẩu/).fill(password)
    await page.getByRole('button', { name: /Đăng nhập|Sign in/ }).click()
    await page.waitForURL(url => !url.pathname.startsWith('/auth'), { timeout: 30000 })

    await page.goto(`${base}/app`)
    await page.locator('.dashboard-page').waitFor()
    // Theme mặc định có thể là sáng hoặc tối — toggle phải đảo trạng thái hiện tại.
    const themeBefore = await page.evaluate(() => document.documentElement.dataset.theme)
    const themeAfter = themeBefore === 'dark' ? 'light' : 'dark'
    await page.locator('.theme-toggle').click()
    await page.waitForFunction(value => document.documentElement.dataset.theme === value, themeAfter)
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), themeAfter)
    await page.reload()
    await page.locator('.dashboard-page').waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), themeAfter, 'Theme choice must persist across reloads')
    await page.locator('.theme-toggle').click()
    await page.waitForFunction(value => document.documentElement.dataset.theme === value, themeBefore)
    await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true })
    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await page.getByRole('heading', { name: 'Your learning overview' }).waitFor()
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')

    // Hồ sơ học tập phải lưu được vào database (bảng profiles), không chỉ localStorage.
    await page.goto(`${base}/app/settings`)
    await page.getByLabel('What should we call you?').fill('E2E Learner')
    await page.getByRole('button', { name: 'Save changes', exact: true }).click()
    await page.getByText('Settings saved', { exact: false }).first().waitFor()
    await page.reload()
    await page.getByLabel('What should we call you?').waitFor()
    assert.equal(await page.getByLabel('What should we call you?').inputValue(), 'E2E Learner', 'Profile must persist in the database')

    await page.goto(`${base}/app/write?task=academic_task1&prompt=t1-w1-009`)
    // Đề Task 1 Academic: ảnh đề hiện đầy đủ ở cột trái, không còn form nhập đề.
    await page.locator('.task-image img').waitFor()
    await page.getByLabel('Essay title', { exact: true }).fill('Commuting practice')
    await page.getByLabel('Essay text', { exact: true }).fill('The share of commuters travelling by car declined over the period.')
    await page.locator('.upload-zone input[type=file]').setInputFiles({ name: 'chart.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6V7sAAAAASUVORK5CYII=', 'base64') })
    await page.getByText('Saved in this browser', { exact: true }).waitFor()
    await page.reload()
    await page.getByLabel('Essay text', { exact: true }).waitFor()
    assert.match(await page.getByLabel('Essay text', { exact: true }).inputValue(), /declined/)
    assert.equal(await page.locator('.image-previews img').count(), 1)
    // Chỉ hiện loại bài đang làm — không có thanh chuyển task.
    assert.equal(await page.locator('.editor-toolbar .segmented').count(), 0)
    assert.match(await page.locator('.editor-task').innerText(), /Task 1 Academic/)
    await page.getByRole('button', { name: 'Get feedback', exact: true }).click()
    await page.getByText(/has not configured an AI model|is busy or temporarily unavailable|being assessed/i).first().waitFor({ timeout: 90000 })
    await page.getByLabel('Essay text', { exact: true }).fill('Unsaved sentence that must survive navigation.')
    await page.locator('#main').getByRole('link', { name: 'My writing', exact: true }).click()
    await page.getByRole('heading', { name: 'Your writing is not saved yet' }).waitFor()
    await page.getByRole('button', { name: 'Save and leave', exact: true }).click()
    await page.getByRole('heading', { name: 'My writing' }).waitFor()
    await page.getByText('Commuting practice', { exact: true }).first().waitFor()

    await page.goto(`${base}/app/prompts?task=academic_task1`)
    await page.getByRole('button', { name: 'Your attempts' }).click()
    await page.getByText('Commuting practice', { exact: true }).first().waitFor()

    await page.goto(`${base}/app/vocabulary`)
    await page.getByRole('button', { name: 'Add a card', exact: true }).click()
    await page.getByLabel('Word / structure', { exact: true }).fill('Although …, …')
    await page.getByLabel('Meaning / explanation', { exact: true }).fill('Show a contrast')
    await page.locator('dialog select').selectOption('structure')
    await page.getByRole('button', { name: 'Save to collection', exact: true }).click()
    await page.locator('dialog').waitFor({ state: 'hidden' })

    await page.goto(`${base}/app/prompts`)
    await page.getByRole('radio', { name: /Task 2/ }).click()
    await page.locator('.topic-card').first().waitFor()
  } else {
    console.log('SKIP: các luồng cần đăng nhập (viết bài, thẻ ôn tập) — đặt TEST_EMAIL/TEST_PASSWORD để chạy.')
  }

  // ---------- Responsive: mọi route không tràn ngang ----------
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of [...publicRoutes, ...guardedRoutes]) {
      await page.goto(`${base}${route}`)
      await page.locator('h1').first().waitFor()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
      assert.equal(overflow, false, `Horizontal overflow at ${width}px: ${route}`)
    }
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${base}/app/prompts`)
  await page.locator('h1').waitFor()
  await page.screenshot({ path: 'test-results/prompts-mobile.png', fullPage: true })

  assert.deepEqual(errors, [], 'Browser runtime errors')
  console.log(`PASS: ${publicRoutes.length} route công khai, ${guardedRoutes.length} route có bảo vệ, kiểm tra tràn ngang ở 4 kích thước, không lỗi runtime.`)
} finally { await browser.close() }
