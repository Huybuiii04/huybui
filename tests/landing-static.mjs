/**
 * Regression cho landing tĩnh và các trang tin cậy (trust pages).
 *
 *   TEST_URL=http://127.0.0.1:5180 node tests/landing-static.mjs
 *   TEST_URL=https://huybui.vercel.app node tests/landing-static.mjs
 *
 * Không có server nào ở TEST_URL thì test bỏ qua (giống tests/production.mjs).
 *
 * TEST_TRUST_PATHS: danh sách trang tin cậy, phân tách bằng dấu phẩy.
 * Mặc định /about,/contact,/privacy — đúng các rewrite của Vercel. Vite preview
 * không có rewrite nên khi chạy local phải truyền:
 *   TEST_TRUST_PATHS=/pages/about.html,/pages/contact.html,/pages/privacy.html
 *
 * Kiểm tra:
 *  1. Landing đọc được khi JavaScript bị chặn (H1, link, hai ngôn ngữ, ghi chú
 *     đăng nhập).
 *  2. Bản HTML tĩnh và bản React không dịch chuyển quá 8px ở 1440×1000 và
 *     390×844, kể cả khi người dùng đã lưu tiếng Việt.
 *  3. Trang tin cậy trả 200 text/html, có đúng một H1, đủ chữ, heading tuần tự
 *     và không bị route wildcard của app thay thế.
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = (process.env.TEST_URL ?? 'http://127.0.0.1:5180').replace(/\/+$/, '')
const trustPaths = (process.env.TEST_TRUST_PATHS ?? '/about,/contact,/privacy')
  .split(',')
  .map(path => path.trim())
  .filter(Boolean)

const LANDING_SELECTORS = ['h1', '.landing-intro', '.skill-art', '.landing-learning', '.landing-cta', '.landing-footer']
const VIEWPORTS = [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]
const SHIFT_LIMIT_PX = 8
const MIN_TRUST_TEXT = 500

// Dấu tiếng Việt đặc trưng — dùng để chứng minh trang hiện đúng ngôn ngữ đã lưu.
const vietnameseChars = /[àáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵđĐăĂÂơƠưƯ]/i

// Chặn bundle React để đo bản HTML tĩnh. Chỉ chặn request script trỏ tới
// file build (/assets/); script inline (bootstrap ngôn ngữ + theme) vẫn chạy vì
// trình duyệt không gửi request cho script inline — và cần chạy để bản tĩnh đọc
// được ngôn ngữ/theme đã lưu.
async function blockBundle(context) {
  await context.route('**/*', route => {
    const request = route.request()
    if (request.resourceType() === 'script' && request.url().includes('/assets/')) return route.abort()
    return route.continue()
  })
}

// Chặn mọi script bên ngoài để kiểm tra "không JavaScript" một cách nghiêm ngặt.
async function blockEveryScript(context) {
  await context.route('**/*', route => {
    const request = route.request()
    if (request.resourceType() === 'script') return route.abort()
    return route.continue()
  })
}

async function reachable() {
  try {
    const response = await fetch(base, { signal: AbortSignal.timeout(8000) })
    return { ok: true, status: response.status }
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) }
  }
}

async function readBoxes(page) {
  return page.evaluate(selectors => {
    const boxes = {}
    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (!element) {
        boxes[selector] = null
        continue
      }
      const rect = element.getBoundingClientRect()
      boxes[selector] = { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    }
    return boxes
  }, LANDING_SELECTORS)
}

// React marks the enhanced copy of the exact same server-rendered markup.
async function waitForReact(page, url, pageErrors = []) {
  await page.locator('[data-landing-react]').waitFor({ timeout: 20000 }).catch(error => {
    throw new Error(`React failed to mount at ${url}: ${error.message}; ${pageErrors.join(' | ')}`)
  })
}

// Trang phải hiển thị đúng ngôn ngữ: bản tĩnh dùng data-lang, React dùng lang.
async function assertLanguage(page, attribute, expected, where) {
  assert.equal(
    await page.locator('html').getAttribute(attribute),
    expected,
    `${where}: thuộc tính ${attribute} của <html> phải là "${expected}"`,
  )
}

function compareBoxes(staticBoxes, reactBoxes, label, viewportLabel) {
  for (const selector of LANDING_SELECTORS) {
    const before = staticBoxes[selector]
    const after = reactBoxes[selector]
    assert.ok(before, `${label} ${viewportLabel}: bản HTML tĩnh không có ${selector}`)
    assert.ok(after, `${label} ${viewportLabel}: sau khi React mount không có ${selector}`)
    const parts = []
    for (const key of ['x', 'y', 'width', 'height']) {
      const delta = Math.abs(before[key] - after[key])
      parts.push(`${key} ${delta.toFixed(2)}px`)
      assert.ok(
        delta <= SHIFT_LIMIT_PX,
        `Layout shift ${selector} (${key}) tại ${viewportLabel} [${label}]: lệch ${delta.toFixed(2)}px ` +
          `(HTML tĩnh ${before[key].toFixed(2)}px → React ${after[key].toFixed(2)}px), vượt ngưỡng ${SHIFT_LIMIT_PX}px`,
      )
    }
    console.log(`   ${selector.padEnd(17)} ${parts.join('  ')}`)
  }
}

// Bỏ head/script/style rồi bỏ thẻ để đếm chữ hiển thị của trang tĩnh.
function visibleText(html) {
  const withoutBlocks = html
    .replace(/<head\b[\s\S]*?<\/head>/gi, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  const withoutTags = withoutBlocks.replace(/<[^>]+>/g, ' ')
  const decoded = withoutTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
  return decoded.replace(/\s+/g, ' ').trim()
}

const probe = await reachable()
if (!probe.ok) {
  console.log(`SKIP: không kết nối được ${base} (${probe.reason}) — cần server đang chạy để kiểm tra landing tĩnh.`)
  process.exit(0)
}

const browser = await chromium.launch()
try {
  // ---------- 1. Landing đọc được khi JavaScript bị chặn ----------
  console.log(`• Landing tĩnh (${base}/, không JavaScript):`)
  const rawContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  })
  await blockEveryScript(rawContext)
  const rawPage = await rawContext.newPage()
  const rawResponse = await rawPage.goto(`${base}/`, { waitUntil: 'load' })
  assert.ok(rawResponse, `Không nhận được phản hồi cho ${base}/`)
  await rawPage.evaluate(async () => {
    await document.fonts.ready
  })
  const rawHtml = await rawResponse.text()

  assert.equal(await rawPage.locator('h1').count(), 1, 'Landing tĩnh phải có đúng một <h1>')
  const staticH1 = (await rawPage.locator('h1').first().innerText()).replace(/\s+/g, ' ').trim()
  assert.ok(staticH1.length > 0, 'Landing tĩnh phải có <h1> chứa chữ')
  assert.ok(await rawPage.locator('a[href="/app/prompts"]').count() > 0, 'Landing tĩnh phải có link tới /app/prompts')
  assert.ok(await rawPage.locator('a[href="/app/write"]').count() > 0, 'Landing tĩnh phải có link tới /app/write')
  const heroText = (await rawPage.locator('.landing-intro > p').first().innerText()).replace(/\s+/g, ' ').trim()
  assert.match(heroText, /Listening, Reading, Writing/, 'Landing tĩnh phải có nội dung hero')
  assert.ok(/data-copy=["']vi["']/.test(rawHtml), 'Bản HTML tĩnh phải chứa bản tiếng Việt (data-copy="vi")')
  assert.ok(/data-copy=["']en["']/.test(rawHtml), 'Bản HTML tĩnh phải chứa bản tiếng Anh (data-copy="en")')
  const note = (await rawPage.locator('.landing-note').innerText()).replace(/\s+/g, ' ').trim()
  assert.match(note, /need an account|cần tài khoản/i, 'Landing tĩnh phải nói rõ tính năng cần tài khoản')
  console.log(`   1 h1 (${staticH1.slice(0, 40)}…), link /app/prompts + /app/write, data-copy vi+en, ghi chú đăng nhập`)

  // Thiếu (hoặc sai) thuộc tính data-lang thì tiếng Anh vẫn phải hiện.
  await rawPage.evaluate(() => {
    document.documentElement.removeAttribute('data-lang')
  })
  const fallbackH1 = (await rawPage.locator('h1').first().innerText()).replace(/\s+/g, ' ').trim()
  assert.ok(
    fallbackH1.includes('Four skills'),
    `Thiếu data-lang thì phải hiện tiếng Anh (h1: "${fallbackH1.slice(0, 60)}")`,
  )
  assert.equal(
    await rawPage.locator('[data-copy="en"]:visible').count() > 0,
    true,
    'Thiếu data-lang thì bản tiếng Anh vẫn phải hiện',
  )
  console.log(`   thiếu data-lang → vẫn hiện tiếng Anh (${fallbackH1.slice(0, 32)}…)`)
  await rawContext.close()

  // ---------- 2. Không dịch chuyển giữa HTML tĩnh và React ----------
  for (const language of ['en', 'vi']) {
    const label = language === 'vi' ? 'VI đã lưu' : 'EN mặc định'
    console.log(`• Không dịch chuyển (${label}):`)
    for (const viewport of VIEWPORTS) {
      const viewportLabel = `${viewport.width}×${viewport.height}`

      const staticContext = await browser.newContext({
        viewport,
        reducedMotion: 'reduce',
        colorScheme: 'dark',
      })
      await blockBundle(staticContext)
      if (language === 'vi') {
        await staticContext.addInitScript(value => {
          try {
            localStorage.setItem('ielts-language', value)
          } catch {
            /* Bộ nhớ trình duyệt có thể bị chặn. */
          }
        }, language)
      }
      const staticPage = await staticContext.newPage()
      await staticPage.goto(`${base}/`, { waitUntil: 'load' })
      await staticPage.evaluate(async () => {
        await document.fonts.ready
      })
      const staticBoxes = await readBoxes(staticPage)
      await assertLanguage(staticPage, 'data-lang', language, `Bản HTML tĩnh (${label})`)
      if (language === 'vi') {
        const heading = (await staticPage.locator('h1').first().innerText()).replace(/\s+/g, ' ').trim()
        assert.ok(vietnameseChars.test(heading), `Bản HTML tĩnh phải hiện tiếng Việt (h1: ${heading.slice(0, 60)})`)
      }
      await staticContext.close()

      const reactContext = await browser.newContext({
        viewport,
        reducedMotion: 'reduce',
        colorScheme: 'dark',
      })
      if (language === 'vi') {
        await reactContext.addInitScript(value => {
          try {
            localStorage.setItem('ielts-language', value)
          } catch {
            /* Bộ nhớ trình duyệt có thể bị chặn. */
          }
        }, language)
      }
      const reactPage = await reactContext.newPage()
      const pageErrors = []
      reactPage.on('pageerror', error => pageErrors.push(error.message))
      await reactPage.goto(`${base}/`, { waitUntil: 'load' })
      await waitForReact(reactPage, `${base}/`, pageErrors)
      await reactPage.evaluate(async () => {
        await document.fonts.ready
      })
      const reactBoxes = await readBoxes(reactPage)
      await assertLanguage(reactPage, 'lang', language, `React sau khi mount (${label})`)
      if (language === 'vi') {
        const heading = (await reactPage.locator('h1').first().innerText()).replace(/\s+/g, ' ').trim()
        assert.ok(vietnameseChars.test(heading), `React phải hiện tiếng Việt (h1: ${heading.slice(0, 60)})`)
        assert.ok(!heading.includes('Four skills'), 'React không được ghi đè tiếng Việt đã lưu')
      }
      await reactContext.close()

      console.log(`  ${viewportLabel}`)
      compareBoxes(staticBoxes, reactBoxes, label, viewportLabel)
    }
  }

  // ---------- 3. Trang tin cậy ----------
  console.log('• Trang tin cậy:')
  const trustContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  })
  const trustPage = await trustContext.newPage()
  for (const path of trustPaths) {
    const response = await trustPage.goto(`${base}${path}`, { waitUntil: 'load' })
    assert.ok(response, `Không nhận được phản hồi cho ${path}`)
    assert.equal(response.status(), 200, `Trang tin cậy ${path} phải trả 200 (nhận ${response.status()})`)
    const contentType = response.headers()['content-type'] ?? ''
    assert.ok(contentType.includes('text/html'), `Trang tin cậy ${path} phải trả text/html (nhận "${contentType}")`)
    const raw = await response.text()

    const headings = await trustPage.evaluate(() =>
      [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(element => ({
        level: Number(element.tagName.slice(1)),
        text: (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
      })),
    )
    assert.equal(
      headings.filter(heading => heading.level === 1).length,
      1,
      `Trang tin cậy ${path} phải có đúng một <h1>`,
    )
    const text = visibleText(raw)
    assert.ok(
      text.length >= MIN_TRUST_TEXT,
      `Trang tin cậy ${path} chỉ có ${text.length} ký tự chữ hiển thị (cần ít nhất ${MIN_TRUST_TEXT})`,
    )
    let previous = 0
    for (const heading of headings) {
      if (previous === 0) {
        assert.equal(heading.level, 1, `Trang tin cậy ${path} phải bắt đầu bằng <h1>`)
      } else {
        assert.ok(
          heading.level <= previous + 1,
          `Trang tin cậy ${path} nhảy heading từ h${previous} lên h${heading.level} ("${heading.text.slice(0, 48)}")`,
        )
      }
      previous = heading.level
    }

    // Route wildcard của app không được thay thế trang tĩnh.
    assert.ok(!raw.includes('/src/main.tsx'), `Trang tin cậy ${path} không được tham chiếu entry React /src/main.tsx`)
    for (const [, attributes, body] of raw.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const src = attributes.match(/\bsrc=["']([^"']+)["']/i)?.[1]
      if (src) {
        assert.ok(!src.includes('/assets/'), `Trang tin cậy ${path} không được boot bundle React (${src})`)
      } else {
        assert.ok(!/createRoot|react-dom/i.test(body), `Trang tin cậy ${path} không được có script mount app`)
      }
    }
    assert.equal(
      await trustPage.locator('.doc-page[data-agent-page]').count(),
      1,
      `Trang tin cậy ${path} bị route wildcard của app thay thế`,
    )
    console.log(`   ${path}: 200 text/html, 1 h1, ${text.length} ký tự, ${headings.length} heading, không boot React`)
  }
  await trustContext.close()

  console.log(
    `PASS: landing tĩnh đọc được không JavaScript, không dịch chuyển quá ${SHIFT_LIMIT_PX}px ` +
      `(${VIEWPORTS.map(viewport => `${viewport.width}×${viewport.height}`).join(' + ')} × EN + VI đã lưu), ` +
      `${trustPaths.length} trang tin cậy (${trustPaths.join(', ')}).`,
  )
} catch (error) {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
} finally {
  await browser.close()
}
