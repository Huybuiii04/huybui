// Run against the local production preview: node tests/studio-ui.mjs
// All external requests are intercepted. No real account or database writes.
import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5180'
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'UI fixtures require a local server')
const out = process.env.UI_OUTPUT ?? 'test-results/reference-ui'
const reportName = process.env.UI_PATHS ? 'ui-targeted-report' : 'ui-report'
mkdirSync(out, { recursive: true })
const reading = JSON.parse(readFileSync('supabase/seed/skill-reading-data.json', 'utf8')).tests
const source = reading[0]
const speaking = JSON.parse(readFileSync('supabase/seed/speaking-cambridge.json', 'utf8')).rows.map(row => ({ ...row, id: row.slug }))
const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'preview@example.test', app_metadata: { provider: 'email' }, user_metadata: { display_name: 'Lan' }, created_at: '2026-10-29T00:00:00Z' }
const writingPrompts = ['task2', 'academic_task1', 'general_task1'].map(task => ({ slug: `preview-${task}`, task, subtype: task === 'task2' ? 'opinion' : 'line', type_label: task === 'task2' ? 'OPINION' : 'LINE', source: 'practice', difficulty: 'EASY', title_vi: `Preview ${task}`, title_en: `Preview ${task}`, text: `Preview prompt for ${task}`, topics: ['education'], minutes: task === 'task2' ? 40 : 20 }))
const legacyEssay = { id: '00000000-0000-4000-8000-000000000002', title: 'Saved letter', task_type: 'general_task1', subtype: 'formal', prompt_text: 'Original letter prompt', body_text: 'Original saved letter content', reference_data: 'Original reference', target_band: 7, draft: {}, draft_version: 1, updated_at: '2026-10-29T00:00:00Z' }
const token = ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'), 'ui-test-signature'].join('.')
const session = { access_token: token, refresh_token: 'ui-test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user }
const sections = source.passages.map((p, i) => ({ id: `section-${i}`, test_id: source.id, section_no: i + 1, title: p.title, content_html: p.contentHtml }))
const groups = source.passages.flatMap((p, i) => p.groups.map(g => ({ id: g.key, section_id: `section-${i}`, order_index: g.order, display_type: g.displayType, instruction_html: g.instructionHtml, config: g.config })))
const questions = source.passages.flatMap(p => p.groups.flatMap(g => g.questions.map(q => ({ id: `${g.key}-${q.sourceId}`, group_id: g.key, order_index: q.order, source_number: q.sourceNumber, question_type: q.type, display_type: q.displayType, prompt: q.prompt, question_html: q.questionHtml, options: q.options }))))
const dashboard = { users: { total: 1, new7d: 1, admins: 1, suspended: 0 }, essays: { total: 0, new7d: 0, distinctPrompts: 0 }, revisions: { total: 0 }, jobs: { queued: 0, processing: 0, succeeded: 0, retry_wait: 0, failed: 0, cancelled: 0 }, usage: { jobs: 0, inputTokens: 0, outputTokens: 0, costUsd: 0, costComplete: true }, topUsers: [], topPrompts: [], untouchedPrompts: [] }
const browser = await chromium.launch()
const errors = [], accessibility = [], checked = []
try {
  for (const width of [1440, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'reduce' })
    await context.addInitScript(() => {
      if (!localStorage.getItem('ielts-language')) localStorage.setItem('ielts-language', 'vi')
      if (!localStorage.getItem('ielts-theme-v2')) localStorage.setItem('ielts-theme-v2', 'light')
      sessionStorage.setItem('ielts-admin-session', JSON.stringify({ token: 'ui-only', expiresAt: Date.now() + 3600000 }))
    })
    await context.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin === new URL(base).origin) return route.continue()
      let body = []
      if (url.pathname.endsWith('/auth/v1/token')) body = session
      else if (url.pathname.endsWith('/auth/v1/user')) body = user
      else if (url.pathname.endsWith('/functions/v1/admin-data')) body = dashboard
      else if (url.pathname.endsWith('/rpc/save_draft')) body = { essay_id: user.id, draft_version: 1 }
      else if (url.pathname.includes('/rest/v1/')) {
        const table = url.pathname.split('/').pop()
        const rows = {
          profiles: [{ id: user.id, display_name: 'Lan', target_band: 7, feedback_language: 'vi' }],
          user_access: [{ user_id: user.id, role: 'admin', status: 'active' }],
          prompts: writingPrompts,
          essays: [legacyEssay],
          skill_tests: reading.map(test => ({ id: test.id, slug: test.slug, skill: 'reading', title: test.title, description: test.description, level: test.level, series: test.series, series_no: test.seriesNo, duration_minutes: test.durationMinutes, question_count: test.questionCount, test_type: test.testType, status: 'published' })),
          skill_sections: sections, skill_question_groups: groups, skill_questions: questions,
          speaking_questions: speaking,
          skill_attempts: [6, 5.5, null].map((band, i) => ({ id: `preview-attempt-${i}`, skill: 'reading', test_id: source.id, correct_count: band === null ? 0 : 25, total_count: 40, band, created_at: '2026-10-29T00:00:00Z' })),
        }
        body = rows[table] ?? []
        if (table === 'prompts') {
          if (url.searchParams.has('slug')) body = body.filter(row => row.slug === url.searchParams.get('slug').replace(/^eq\./, ''))
          const task = url.searchParams.get('task')
          // Simulate a stale backend returning retired rows despite task filters.
          if (task?.startsWith('eq.')) body = body.filter(row => row.task === task.slice(3) || row.task === 'general_task1')
        }
        if (table === 'skill_tests' && url.searchParams.has('slug')) body = body.filter(row => row.slug === url.searchParams.get('slug').replace(/^eq\./, ''))
        if (route.request().headers().accept?.includes('vnd.pgrst.object')) body = body[0] ?? null
      }
      await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'content-range': '0-0/1' }, body: JSON.stringify(body) })
    })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(`${width}: ${error.message}`))
    page.on('dialog', dialog => dialog.accept())
    await page.goto(base + '/auth')
    await page.getByLabel('Email', { exact: true }).fill(user.email)
    await page.locator('input[type=password]').fill('preview-password')
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
    await page.waitForURL(base + '/app')
    await page.locator('.overview-practice').waitFor()
    const paths = ['/', '/app', '/app/prompts', '/app/write', '/app/essays', '/app/essays/demo', '/app/vocabulary', '/app/review', '/app/errors', '/app/settings', '/app/reading', '/app/reading/' + source.slug, '/app/speaking', '/admin', '/donate', '/about', '/contact', '/privacy']
    for (const theme of ['dark', 'light']) {
      for (const path of paths.filter(path => !process.env.UI_PATHS || process.env.UI_PATHS.split(',').includes(path))) {
        await page.goto(base + path)
        await page.evaluate(value => { localStorage.setItem('ielts-theme-v2', value); document.documentElement.dataset.theme = value; document.documentElement.style.colorScheme = value }, theme)
        await page.locator('h1').first().waitFor()
        await page.evaluate(() => document.fonts.ready)
        // Let async library content settle; no arbitrary timer or backend access.
        await page.locator('.loading-state').waitFor({ state: 'hidden' }).catch(() => {})
        const state = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, title: document.querySelector('h1')?.textContent, background: getComputedStyle(document.body).backgroundColor }))
        if (path === '/app/prompts') {
          assert.equal(await page.getByRole('radio').count(), 2, 'Only Task 2 and Academic Task 1 remain')
          assert.equal(await page.getByText('Task 1 General', { exact: true }).count(), 0)
          assert.equal(await page.locator('.task-type-cards').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), width > 767 ? 2 : 1)
          assert.equal(await page.locator('.academic-card').count(), 1, 'Retired backend rows filtered out')
          await page.locator('.prompt-custom-card').click()
          assert.deepEqual(await page.locator('#custom-task option').evaluateAll(options => options.map(option => option.value)), ['task2', 'academic_task1'])
          await page.getByRole('dialog').getByRole('button', { name: 'Đóng', exact: true }).click()
          await page.evaluate(() => window.scrollTo(0, 0))
        }
        if (path === '/app/essays') {
          assert.deepEqual(await page.locator('select option').evaluateAll(options => options.map(option => option.value)), ['all', 'task2', 'academic_task1'])
          await page.getByText('Saved letter', { exact: true }).waitFor()
        }
        if (path === '/app') {
          assert.equal(await page.locator('.overview-practice > a').count(), 3, 'Overview must show Reading and both Writing tasks together')
          if (width < 861) assert.equal(await page.locator('.overview-practice').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), 1, 'Mobile practice cards must fill one column')
          assert.equal(await page.locator('.brand-mark').first().getAttribute('src'), '/brand/ielts-studio-mark.webp')
          await page.getByText('3 bài đã làm · Band cao nhất 6.0', { exact: true }).waitFor()
          assert.ok(await page.locator('.brand-mark').first().evaluate(el => el.complete && el.naturalWidth > 0), 'Logo must load successfully')
          assert.ok(await page.locator('.overview-practice p').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize) >= 16), 'Practice descriptions must remain readable')
          if (width === 1440 && theme === 'light') writeFileSync(`${out}/overview.html`, (await page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace('<head>', `<head><base href="${base}/">`))
        }
        if (path === '/app/reading') {
          const cards = page.locator('.library-card')
          assert.equal(await cards.count(), reading.length, 'All Reading tests retained')
          assert.equal(await page.locator('.library-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), width === 1440 ? 3 : width === 768 ? 2 : 1, 'Reading uses Speaking grid at every width')
          assert.equal(await page.locator('.library-page h1').evaluate(el => getComputedStyle(el).fontSize), '32px')
          assert.equal(await cards.first().locator('.library-badge').innerText(), 'READING')
          assert.equal(await cards.first().locator('.library-card-level').innerText(), source.level)
          assert.equal(await cards.first().getAttribute('href'), '/app/reading/' + source.slug)
          const collections = [...new Set(reading.map(test => test.series).filter(Boolean))]
          const filters = page.getByRole('group', { name: 'Bộ đề Reading', exact: true })
          assert.equal(await filters.getByRole('button').count(), collections.length + 1)
          for (const collection of collections) {
            await filters.getByRole('button', { name: collection, exact: true }).click()
            assert.equal(await cards.count(), reading.filter(test => test.series === collection).length, 'Every Reading collection remains available')
            assert.equal(await filters.getByRole('button', { name: collection, exact: true }).getAttribute('aria-pressed'), 'true')
          }
          const search = page.getByRole('searchbox', { name: 'Tìm đề Reading', exact: true })
          await search.fill(source.title)
          assert.equal(await cards.count(), 0, 'Search respects selected collection')
          await page.getByRole('heading', { name: 'Không tìm thấy đề', exact: true }).waitFor()
          await filters.getByRole('button', { name: 'Tất cả', exact: true }).click()
          assert.equal(await cards.count(), 1, 'Search finds a specific test across collections')
          await search.fill('no-matching-reading-title')
          assert.equal(await cards.count(), 0)
          await search.fill('')
          assert.equal(await cards.count(), reading.length)
          await page.locator('.library-filters .filter-row').evaluate(el => { el.scrollLeft = 0 })
          if (width === 1440 && theme === 'light') writeFileSync(`${out}/reading.html`, (await page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace('<head>', `<head><base href="${base}/">`))
        }
        if (path === '/app/speaking') {
          const cards = page.locator('.speaking-card')
          const testCount = new Set(speaking.map(row => `${row.book_number}-${row.test_number}`)).size
          assert.equal(await cards.count(), testCount, 'All Cambridge tests visible by default')
          assert.equal(await page.locator('.speaking-filters .filter-row').innerText(), 'Cambridge', 'One Cambridge collection replaces book filters')
          assert.equal(await page.locator('.speaking-filters button').count(), 0, 'No redundant book filter buttons')
          assert.equal(await page.locator('.speaking-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), width === 1440 ? 3 : width === 768 ? 2 : 1, 'Speaking grid must use 3/2/1 columns')
          const first = cards.first()
          assert.equal(await first.locator('h2').innerText(), 'Test 1')
          assert.equal(await page.locator('.speaking-dialog').count(), 0, 'Mode picker closed initially')
          await first.locator('.speaking-start').focus()
          await page.keyboard.press('Enter')
          const dialog = page.getByRole('dialog', { name: 'Cambridge 12 · Test 1', exact: true })
          await dialog.waitFor()
          assert.equal(await dialog.evaluate(el => el.matches(':modal')), true, 'Native dialog traps focus and makes background inert')
          assert.equal(new URL(page.url()).pathname, '/app/speaking', 'Choosing a test opens picker before navigating')
          assert.equal(await dialog.locator('input[value=mock]').isChecked(), true)
          assert.equal(await dialog.locator('.speaking-start').getAttribute('href'), '/app/speaking/mock/12/5')
          await dialog.locator('.speaking-dialog-source summary').click()
          assert.ok((await dialog.locator('.speaking-dialog-source p').innerText()).includes(speaking[0].source_label), 'Source attribution retained')
          await dialog.locator('.speaking-dialog-source summary').click()
          for (const part of ['part-1', 'part-2']) {
            await dialog.locator(`input[value=${part}]`).check()
            assert.equal(await dialog.locator('.speaking-start').getAttribute('href'), `/app/speaking/${part}/12/5`)
          }
          await dialog.locator('input[value=part-3]').check()
          const part3 = speaking.filter(row => row.book_number === 12 && row.test_number === 5 && row.part === 'part-3')
          for (const row of part3) {
            await dialog.getByLabel('Chủ đề Part 3').selectOption(row.id)
            assert.equal(await dialog.locator('.speaking-start').getAttribute('href'), `/app/speaking/part-3/12/5?question=${encodeURIComponent(row.id)}`, 'Every Part 3 topic remains selectable')
          }
          await dialog.getByRole('button', { name: 'Đóng', exact: true }).focus()
          await page.keyboard.press('Tab')
          assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true, 'Keyboard focus stays in modal')
          await page.locator('.speaking-search input').evaluate(el => el.focus())
          assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true, 'Background controls remain inert')
          await dialog.locator('.speaking-full-option').click()
          assert.equal(await dialog.locator('input[value=mock]').isChecked(), true, 'Full test can be selected after an individual part')
          await page.keyboard.press('Escape')
          await dialog.waitFor({ state: 'hidden' })
          assert.equal(await first.locator('.speaking-start').evaluate(el => el === document.activeElement), true, 'Closing restores focus to chosen card')
          await first.click({ position: { x: 24, y: 72 } })
          await dialog.waitFor()
          await page.screenshot({ path: `${out}/${theme}-${width}-speaking-mode-picker.png`, fullPage: false })
          const modalAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
          if (modalAxe.violations.length) accessibility.push({ width, theme, path: path + '#mode-picker', issues: modalAxe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) })
          await page.mouse.click(2, 2)
          await dialog.waitFor({ state: 'hidden' })
          assert.deepEqual((await cards.locator('h2').allTextContents()).slice(0, 4), ['Test 1', 'Test 2', 'Test 3', 'Test 4'], 'Cambridge 12 uses Test 1–4 labels')
          const renamedSearch = page.getByRole('searchbox', { name: 'Tìm chủ đề' })
          await renamedSearch.fill('Cambridge 12 · Test 3')
          assert.equal(await cards.count(), 1)
          await cards.first().locator('.speaking-start').click()
          const renamedDialog = page.getByRole('dialog', { name: 'Cambridge 12 · Test 3', exact: true })
          assert.equal(await renamedDialog.locator('.speaking-start').getAttribute('href'), '/app/speaking/mock/12/7', 'Renamed tests keep their original questions')
          await renamedDialog.getByRole('button', { name: 'Đóng', exact: true }).click()
          await renamedDialog.waitFor({ state: 'hidden' })
          await renamedSearch.fill('')
          await renamedSearch.fill('Cambridge 14')
          assert.equal(await cards.count(), 4, 'Search can still find a specific Cambridge book')
          assert.ok((await cards.first().innerText()).includes('CAMBRIDGE 14'))
          const search = page.getByRole('searchbox', { name: 'Tìm chủ đề' })
          await search.fill('Cambridge 14 · Test 2')
          assert.equal(await cards.count(), 1, 'Search matches test label')
          await search.fill('no-matching-speaking-topic')
          assert.equal(await cards.count(), 0)
          await page.getByRole('heading', { name: 'Chưa có đề', exact: true }).waitFor()
          await search.fill('')
          assert.equal(await cards.count(), testCount)
          if (width === 1440 && theme === 'light') writeFileSync(`${out}/speaking.html`, (await page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace('<head>', `<head><base href="${base}/">`))
        }
        assert.ok(state.overflow <= 1, `${width} ${theme} ${path}: horizontal overflow ${state.overflow}px`)
        assert.equal(state.background, theme === 'dark' ? 'rgb(29, 25, 22)' : 'rgb(245, 240, 230)', `${path}: wrong theme`)
        assert.ok(!state.title?.includes('không có ở đây'), `${path}: route reached 404`)
        if (['/app/reading', '/app/speaking', '/app/prompts'].includes(path) || (width !== 768 && ['/', '/app', '/app/write', '/app/reading/' + source.slug, '/admin'].includes(path))) await page.screenshot({ path: `${out}/${theme}-${width}-${path === '/' ? 'home' : path.split('/').filter(Boolean).join('-')}.png`, fullPage: false })
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
        if (result.violations.length) accessibility.push({ width, theme, path, issues: result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) })
        if (path === '/app/reading') {
          await page.locator('.library-card').first().click()
          await page.waitForURL(base + '/app/reading/' + source.slug)
          await page.locator('.skill-room').waitFor()
        }
        if (path === '/app/speaking') {
          await page.locator('.speaking-card .speaking-start').first().click()
          await page.getByRole('dialog').getByRole('link', { name: 'Bắt đầu đề đầy đủ', exact: true }).click()
          await page.waitForURL(base + '/app/speaking/mock/12/5')
          await page.getByText('Cambridge 12 · Test 1', { exact: true }).waitFor()
        }
        checked.push(`${width} ${theme} ${path}`)
        console.log(`Checked ${width} ${theme} ${path}`)
      }
    }
    // Use actual controls and confirm language/theme survive navigation and reload.
    await page.goto(base + '/')
    await page.locator('[data-lang-switch=en]').click()
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')
    assert.equal(await page.locator('[data-lang-switch=en]').getAttribute('aria-pressed'), 'true')
    await page.locator('[data-theme-switch]').click()
    const theme = await page.locator('html').getAttribute('data-theme')
    await page.reload()
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme)
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')
    if (process.env.UI_PATHS?.split(',').includes('/app/prompts')) {
      for (const path of ['/app/write?task=general_task1', '/app/write?prompt=preview-general_task1']) {
        await page.goto(base + path)
        await page.waitForURL(base + '/app/prompts')
        await page.getByRole('radio').first().waitFor()
        assert.equal(await page.getByRole('radio').count(), 2)
      }
      for (const task of ['task2', 'academic_task1']) {
        await page.goto(base + `/app/write?task=${task}&prompt=preview-${task}`)
        if (width < 768) await page.locator('.mobile-editor-tabs').getByRole('button', { name: 'Task prompt', exact: true }).click()
        await page.locator('.task-view').getByText(`Preview prompt for ${task}`, { exact: true }).waitFor()
        await page.locator('.editor-toolbar').getByText(task === 'task2' ? 'Task 2' : 'Task 1 Academic', { exact: true }).waitFor()
      }
      await page.goto(base + `/app/write?id=${legacyEssay.id}`)
      await page.getByRole('heading', { name: 'Saved letter', exact: true }).waitFor()
      await page.getByText(legacyEssay.body_text, { exact: true }).waitFor()
      await page.getByText(legacyEssay.reference_data, { exact: true }).waitFor()
      assert.equal(await page.locator('textarea').count(), 0, 'Legacy draft remains read-only')
    }
    if (process.env.UI_PATHS?.split(',').includes('/app/reading')) {
      await page.goto(base + '/app/reading')
      await page.getByRole('heading', { name: 'Reading library', exact: true }).waitFor()
      await page.getByRole('link', { name: 'Start ' + source.title, exact: true }).waitFor()
      await page.getByRole('searchbox', { name: 'Search reading tests', exact: true }).waitFor()
    }
    if (process.env.UI_PATHS?.split(',').includes('/app/speaking')) {
      await page.goto(base + '/app/speaking')
      await page.getByRole('heading', { name: 'Speaking practice', exact: true }).waitFor()
      await page.getByRole('button', { name: 'Start Cambridge 12 · Test 1', exact: true }).click()
      await page.getByRole('dialog').getByRole('link', { name: 'Start full test', exact: true }).waitFor()
      await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
      assert.equal(await page.locator('.speaking-filters .filter-row').innerText(), 'Cambridge')
    }
    await context.close()
  }
  writeFileSync(`${out}/${reportName}.json`, JSON.stringify({ checked, errors, accessibility }, null, 2))
  assert.deepEqual(errors, [], 'Browser runtime errors')
  assert.deepEqual(accessibility, [], 'Accessibility violations; inspect ui-report.json')
  console.log(`PASS: ${checked.length} route/theme/viewport checks; no horizontal overflow, runtime errors or WCAG AA violations. External requests mocked.`)
} finally { writeFileSync(`${out}/${reportName}.json`, JSON.stringify({ checked, errors, accessibility }, null, 2)); await browser.close() }
