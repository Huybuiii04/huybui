# Agent Readiness Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa website để nội dung public đọc được không JavaScript, route sai trả 404 thật, Markdown/metadata/discovery trung thực và nghiệm thu được trên Vercel preview.

**Architecture:** Giữ Vite SPA cho app, dùng các entry HTML tĩnh cho landing và ba trust page. `middleware.ts` là lớp HTTP duy nhất xử lý negotiation/404; `src/agent/*` là nguồn nội dung và metadata dùng chung. Không tạo public REST/MCP/OpenAPI vì backend public chưa tồn tại.

**Tech Stack:** React 19 · Vite 7 · Vercel Routing Middleware (`middleware.ts`) · `node:test` · Playwright · Supabase Edge Functions (Deno)

---

## File map

| File | Trách nhiệm |
|---|---|
| `src/agent/content.ts` | Nội dung public landing/about/contact/privacy, dùng chung HTML + Markdown |
| `src/agent/landing.ts` | Copy và cấu trúc landing dùng chung cho raw HTML + React |
| `src/agent/html.ts` | Escape và renderer HTML tĩnh/404 |
| `src/agent/markdown.ts` | Renderer Markdown + 404 Markdown |
| `src/agent/site.ts` | Canonical/OG metadata + JSON-LD đã xác minh |
| `src/agent/routes.ts` | Allowlist route app, static file và content route |
| `src/agent/negotiation.ts` | Parse `Accept`, specificity/q-value, merge `Vary` |
| `middleware.ts` | 404/406, Markdown, JSON 404 `/api/*`, HEAD, Vary |
| `src/pages/Other.tsx` | React landing dùng shared landing copy + footer trust links |
| `vite.config.ts` | Inject metadata/static content vào các HTML entry |
| `pages/{about,contact,privacy}.html` | Trust page không React |
| `public/{robots.txt,sitemap.xml,llms.txt,og-image.png}` | Discovery resources thật |
| `scripts/generate-og-image.mjs` | Sinh OG image 1200×630 bằng Playwright |
| `supabase/functions/_shared/http.ts` | Edge error shape + hint, giữ requestId/Retry-After |
| `tests/agent.test.ts` | Unit content/routes/metadata/negotiation |
| `tests/build-output.mjs` | Kiểm tra raw HTML và trust pages trong `dist/` |
| `tests/discovery.test.ts` | Kiểm tra robots/sitemap/llms/OG image |
| `tests/agent-readiness.mjs` | HTTP smoke trên Vercel preview |
| `tests/landing-static.mjs` | Browser regression raw HTML ↔ React, desktop/mobile, VI/EN |

## Task 1: Khóa phạm vi public và nội dung trung thực

**Files:**
- Modify: `tests/agent.test.ts`
- Modify: `src/agent/routes.ts`
- Modify: `src/agent/content.ts`
- Modify: `src/agent/site.ts`
- Modify: `src/agent/markdown.ts`
- Modify: `vercel.json`
- Modify: `package.json`
- Delete: `src/agent/mcp.ts`
- Delete: `pages/developers.html`
- Delete: `pages/docs.html`

- [ ] **Step 1: Viết test đỏ cho phạm vi thật**

Trong `tests/agent.test.ts`, thay các kỳ vọng API/MCP/docs cũ bằng:

```ts
import { matchPath, spaRoutes, staticFiles, apiRoutes, markdownPageIds } from '../src/agent/routes.ts'

test('only real public routes and files are published', () => {
  assert.equal(matchPath('/about')?.id, '/about')
  assert.equal(matchPath('/contact')?.id, '/contact')
  assert.equal(matchPath('/privacy')?.id, '/privacy')
  assert.equal(matchPath('/docs'), null)
  assert.equal(matchPath('/developers'), null)
  assert.equal(matchPath('/openapi.json'), null)
  assert.equal(matchPath('/.well-known/mcp'), null)
  assert.deepEqual(apiRoutes, [])
  assert.deepEqual(staticFiles, [
    '/favicon.svg', '/donate-qr.png', '/og-image.png', '/robots.txt', '/sitemap.xml', '/llms.txt',
  ])
})

test('app and auth routes including dynamic paths stay routable', () => {
  for (const path of [
    '/', '/auth', '/auth/callback', '/auth/reset-password', '/donate', '/app', '/app/write',
    '/app/prompts', '/app/essays', '/app/essays/abc', '/app/vocabulary', '/app/review',
    '/app/errors', '/app/settings', '/admin', '/about', '/contact', '/privacy',
  ]) assert.equal(matchPath(path)?.id, path.replace('/abc', '/:id'), path)
  assert.equal(matchPath('/app/essays/abc')?.id, '/app/essays/:id')
})
```

Thay test JSON-LD cũ bằng:

```ts
test('json-ld exposes only the verified SoftwareApplication identity', () => {
  const graph = buildJsonLd()['@graph'] as Record<string, unknown>[]
  assert.equal(graph.length, 1)
  const app = graph[0]
  assert.equal(app['@type'], 'SoftwareApplication')
  assert.equal(app.name, site.name)
  assert.equal(app.url, `${site.url}/`)
  assert.equal(app.applicationCategory, 'EducationalApplication')
  assert.equal(app.operatingSystem, 'Web')
  assert.ok(!('author' in app))
  assert.ok(!('publisher' in app))
  assert.ok(!('offers' in app))
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test tests/agent.test.ts`
Expected: FAIL vì route/content/JSON-LD hiện tại vẫn chứa docs, developers, OpenAPI, MCP và Organization.

- [ ] **Step 3: Thu gọn allowlist và content**

`src/agent/routes.ts`:

```ts
export const spaRoutes = [
  '/', '/auth', '/auth/callback', '/auth/reset-password', '/donate', '/app', '/app/write',
  '/app/prompts', '/app/essays', '/app/essays/:id', '/app/vocabulary', '/app/review',
  '/app/errors', '/app/settings', '/admin', '/about', '/contact', '/privacy',
] as const

export const staticFiles = [
  '/favicon.svg', '/donate-qr.png', '/og-image.png', '/robots.txt', '/sitemap.xml', '/llms.txt',
] as const

export const apiRoutes = [] as const
export const markdownPageIds = ['home', 'about', 'contact', 'privacy'] as const
```

Giữ nguyên `matchPattern()` và `matchPath()`; bỏ `manifest.webmanifest` vì file không tồn tại.

Trong `src/agent/content.ts`, giữ `home`, `about`, `contact`, `privacy`; xóa `developers`, `docs`. Đổi `pages` thành:

```ts
export const pages: ContentPage[] = [home, about, contact, privacy]
```

Cập nhật `home` để nói rõ app features cần đăng nhập, và viết lại Privacy theo design spec: chỉ nêu Supabase/Postgres, AI provider do deployment cấu hình, IndexedDB/localStorage/sessionStorage, cascade khi xóa tài khoản hoàn tất; không nêu thời hạn lưu/xóa, tên provider hay cam kết provider không dùng để huấn luyện.

- [ ] **Step 4: Chỉ giữ JSON-LD đã xác minh**

`src/agent/site.ts` giữ metadata nhưng `buildJsonLd()` trả đúng một node:

```ts
export function buildJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [{
      '@type': 'SoftwareApplication',
      '@id': `${site.url}/#app`,
      name: site.name,
      description: site.description,
      url: `${site.url}/`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      browserRequirements: 'The landing page is readable without JavaScript; interactive practice requires JavaScript.',
      inLanguage: ['en', 'vi'],
    }],
  }
}
```

Bỏ `maintainer`, `contact`, `address`, `Organization`, `Person`, `PostalAddress`, `offers`, `author`, `publisher`.

- [ ] **Step 5: Sửa Markdown resources và 404 links**

`src/agent/markdown.ts` dùng links thật:

```ts
export const agentResourceLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Sitemap', href: '/sitemap.xml' },
  { label: 'llms.txt', href: '/llms.txt' },
]
```

`renderNotFoundMarkdown()` phải chứa `/`, `/llms.txt`, `/sitemap.xml` và escape path trước khi đặt trong code span.

- [ ] **Step 6: Gỡ rewrite/tài liệu giả**

`vercel.json` chỉ rewrite:

```json
"rewrites": [
  { "source": "/about", "destination": "/pages/about.html" },
  { "source": "/contact", "destination": "/pages/contact.html" },
  { "source": "/privacy", "destination": "/pages/privacy.html" },
  { "source": "/((?!api/|assets/).*)", "destination": "/index.html" }
]
```

Xóa `pages/developers.html`, `pages/docs.html`, `src/agent/mcp.ts`. Xóa `tests/api.test.ts` và `tests/openapi.test.ts` khỏi script `npm test`/`test:agent` vì các file đó không tồn tại.

- [ ] **Step 7: Chạy test xanh**

Run: `node --test tests/agent.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/agent/content.ts src/agent/site.ts src/agent/markdown.ts src/agent/routes.ts \
  src/agent/mcp.ts pages/developers.html pages/docs.html tests/agent.test.ts vercel.json package.json
git commit -m "fix(agent): publish only verified public routes"
```

## Task 2: Accept negotiation, 404/406 và JSON API errors

**Files:**
- Create: `src/agent/negotiation.ts`
- Modify: `middleware.ts`
- Modify: `tests/middleware.test.ts`

- [ ] **Step 1: Viết test đỏ**

Thêm vào `tests/middleware.test.ts`:

```ts
test('accept uses media specificity before q-value', async () => {
  const downgraded = await call('/', 'text/markdown;q=0, */*;q=1')
  assert.equal(downgraded.headers.get('x-middleware-next'), '1')
  const markdownOnly = await call('/', 'text/markdown')
  assert.match(markdownOnly.headers.get('content-type') ?? '', /text\/markdown/)
  const htmlOnly = await call('/', 'text/html')
  assert.equal(htmlOnly.headers.get('x-middleware-next'), '1')
})

test('unsupported accept returns 406', async () => {
  const response = await call('/', 'application/json')
  assert.equal(response.status, 406)
  assert.match(response.headers.get('content-type') ?? '', /text\/html/)
  assert.match(await response.text(), /text\/html|text\/markdown/)
})

test('technical resource paths are never rendered as markdown', async () => {
  const response = await call('/missing.json', 'text/markdown')
  assert.equal(response.status, 404)
  assert.match(response.headers.get('content-type') ?? '', /text\/html/)
})

test('unknown api paths return structured JSON', async () => {
  const response = await call('/api/does-not-exist')
  assert.equal(response.status, 404)
  assert.match(response.headers.get('content-type') ?? '', /application\/json/)
  const body = await response.json() as { error: { code: string; message: string; hint: string; status: number } }
  assert.equal(body.error.code, 'unknown_endpoint')
  assert.ok(body.error.hint.length > 10)
  assert.equal(body.error.status, 404)
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test tests/middleware.test.ts`
Expected: FAIL vì parser hiện tại dùng `Math.max`, không xử lý specificity/406 và `/api/*` chỉ `next()`.

- [ ] **Step 3: Tạo negotiation helper thuần**

`src/agent/negotiation.ts`:

```ts
export type Representation = 'html' | 'markdown'
export type Negotiation = { kind: Representation } | { kind: 'not-acceptable' }

type Range = { type: string; quality: number; specificity: 0 | 1 | 2 }

function parseQuality(raw: string | undefined): number {
  if (!raw) return 1
  const match = raw.trim().match(/^(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/)
  if (!match) return 0
  const value = Number(match[0])
  return Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0
}

function matches(type: string, range: string) {
  if (range === '*/*') return true
  const [rangeType, rangeSubtype] = range.split('/')
  const [typeValue] = type.split('/')
  if (rangeType === '*') return true
  if (rangeSubtype === '*') return rangeType === typeValue
  return range === type
}

export function negotiateRepresentation(accept: string | null): Negotiation {
  if (!accept?.trim()) return { kind: 'html' }
  const ranges: Range[] = accept.split(',').map(part => {
    const [rawType = '', ...params] = part.trim().split(';')
    const type = rawType.trim().toLowerCase()
    const qParam = params.map(p => p.trim()).find(p => /^q\s*=/i.test(p))
    const quality = parseQuality(qParam?.split('=').slice(1).join('='))
    const specificity: 0 | 1 | 2 = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2
    return { type, quality, specificity }
  })
  const qualityFor = (types: string[]) => {
    const candidates = ranges.filter(range => types.some(type => matches(type, range.type)))
    if (!candidates.length) return 0
    const bestSpecificity = Math.max(...candidates.map(candidate => candidate.specificity))
    return Math.max(...candidates.filter(candidate => candidate.specificity === bestSpecificity).map(candidate => candidate.quality))
  }
  const html = qualityFor(['text/html', 'application/xhtml+xml'])
  const markdown = qualityFor(['text/markdown'])
  if (html === 0 && markdown === 0) return { kind: 'not-acceptable' }
  return markdown > html ? { kind: 'markdown' } : { kind: 'html' }
}

export function mergeVary(current: string | null | undefined, value: string) {
  const values = new Set((current ?? '').split(',').map(item => item.trim()).filter(Boolean))
  values.add(value)
  return [...values].join(', ')
}
```

- [ ] **Step 4: Viết middleware theo semantics mới**

Trong `middleware.ts`:

- `/api/*` trả JSON 404 với `unknown_endpoint`, không có docs URL giả.
- Không còn MCP manifest.
- `Accept` dùng `negotiateRepresentation()`.
- Không có representation được chấp nhận → 406 HTML.
- Technical path (`.json`, `.xml`, `.css`, `.js`, `.mjs`, `.map`, `.txt`) trả 404 HTML, không negotiate Markdown.
- Markdown/HTML/404 dùng `respond()` với HEAD body rỗng.
- `next()` dùng `mergeVary()`.

JSON body cố định:

```ts
const body = {
  error: {
    code: 'unknown_endpoint',
    message: 'No API endpoint is published at this path.',
    hint: 'Use the website navigation for app features. This project does not currently offer a public REST API.',
    status: 404,
  },
}
```

- [ ] **Step 5: Chạy test xanh**

Run: `node --test tests/middleware.test.ts tests/agent.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/agent/negotiation.ts middleware.ts tests/middleware.test.ts
git commit -m "feat(agent): negotiate formats and return truthful errors"
```

## Task 3: Landing tĩnh thật và trust pages không React

**Files:**
- Create: `src/agent/landing.ts`
- Modify: `src/agent/html.ts`
- Modify: `src/pages/Other.tsx`
- Modify: `index.html`
- Modify: `pages/about.html`
- Modify: `pages/contact.html`
- Modify: `pages/privacy.html`
- Modify: `vite.config.ts`
- Modify: `src/styles.css`
- Modify: `src/main.tsx`
- Modify: `tests/build-output.mjs`

- [ ] **Step 1: Viết test build đỏ**

Trong `tests/build-output.mjs`, kiểm tra landing và từng trust page:

```js
for (const file of files) {
  const html = readFileSync(join(dist, file.path), 'utf8')
  const text = textOf(html)
  assert.ok(text.length >= 500)
  const headings = [...html.matchAll(/<h([1-6])[\s>]/g)].map(match => Number(match[1]))
  assert.equal(headings.filter(level => level === 1).length, 1)
  let previous = 0
  for (const level of headings) {
    assert.ok(level <= previous + 1)
    previous = level
  }
  assert.match(html, /<html lang="en">/)
  assert.match(html, /rel="canonical"/)
  assert.match(html, /application\/ld\+json/)
}

const trust = ['about.html', 'contact.html', 'privacy.html']
for (const name of trust) {
  const html = readFileSync(join(dist, 'pages', name), 'utf8')
  assert.ok(!html.includes('/src/main.tsx'), `${name} must not boot React`)
  assert.match(html, /<main class="doc-page"/)
}
```

- [ ] **Step 2: Tạo shared landing copy**

`src/agent/landing.ts` export nội dung landing hiện tại, mỗi chuỗi là cặp `[vi, en]`:

```ts
export type LandingCopy = {
  kicker: readonly [string, string]
  heroTitle: readonly [string, string]
  heroAccent: readonly [string, string]
  heroEmphasis: readonly [string, string]
  heroBody: readonly [string, string]
  primaryCta: readonly [string, string]
  secondaryCta: readonly [string, string]
  explore: readonly [string, string]
  learningKicker: readonly [string, string]
  learningTitle: readonly [string, string]
  learningBody: readonly [string, string]
  ctaKicker: readonly [string, string]
  ctaTitle: readonly [string, string]
  ctaBody: readonly [string, string]
  donateCta: readonly [string, string]
  features: readonly {
    href: string
    title: readonly [string, string]
    body: readonly [string, string]
    action: readonly [string, string]
  }[]
}

export const landingCopy: LandingCopy = {
  kicker: ['KHÔNG GIAN CHO BƯỚC TIẾN MỚI', 'A LITTLE BETTER. EVERY DAY.'],
  heroTitle: ['Ý tưởng của bạn.', 'Your ideas.'],
  heroAccent: ['Diễn đạt ', 'Beautifully '],
  heroEmphasis: ['tốt hơn.', 'expressed.'],
  heroBody: [
    'Từ ý tưởng đầu tiên đến bài viết bạn tự hào. Luyện IELTS Writing, khám phá cách viết hay và xây dựng vốn từ của riêng bạn.',
    'From your first idea to an essay you are proud of. Practise IELTS Writing, discover great writing and build a vocabulary of your own.',
  ],
  primaryCta: ['Bắt đầu viết', 'Start writing'],
  secondaryCta: ['Xem bài mẫu', 'Explore sample feedback'],
  explore: ['Khám phá cách học', 'Find your learning flow'],
  learningKicker: ['TỪNG BƯỚC, MỖI NGÀY', 'BUILD YOUR WRITING RITUAL'],
  learningTitle: ['Một nơi. Trọn vẹn hành trình.', 'Your whole journey, in one place.'],
  learningBody: ['Viết, khám phá, ghi nhớ. Chọn bước tiếp theo của bạn.', 'Write, explore, remember. Choose your next step.'],
  ctaKicker: ['CÙNG NHAU TIẾN XA', 'ROOM FOR EVERYONE'],
  ctaTitle: ['Tri thức tốt hơn khi được sẻ chia.', 'Learning is better when it is shared.'],
  ctaBody: ['Không gói Premium. Không rào cản học tập. Một không gian để bạn tiến bộ mỗi ngày.', 'No premium tiers. No learning paywalls. A space to grow a little every day.'],
  donateCta: ['Ủng hộ dự án', 'Support the project'],
  features: [
    {
      href: '/app/write',
      title: ['Viết với mục đích', 'Write with purpose'],
      body: ['Luyện biểu đồ, thư và luận. Giữ dòng ý tưởng với nháp tự lưu.', 'Practise charts, letters and essays. Keep your ideas flowing with autosaved drafts.'],
      action: ['Mở không gian viết', 'Open your writing space'],
    },
    {
      href: '/app/prompts',
      title: ['Chọn đề ngay', 'Pick a prompt'],
      body: ['Kho đề bài sẵn có đề Task 1 và Task 2 kèm hình ảnh và đề bài đầy đủ.', 'The prompt library holds ready Task 1 and Task 2 questions with charts and full task text.'],
      action: ['Mở kho đề bài', 'Open the prompt library'],
    },
    {
      href: '/app/vocabulary',
      title: ['Biến từ mới thành vốn riêng', 'Make new words yours'],
      body: ['Lưu cụm từ, cấu trúc và ôn tập theo lịch để ghi nhớ lâu hơn.', 'Save phrases and structures, then revisit them over time to remember more.'],
      action: ['Mở sổ từ vựng', 'Build your vocabulary'],
    },
  ],
}
```

- [ ] **Step 3: Render landing HTML song ngữ**

`src/agent/html.ts` thêm `renderLandingHtml()`:

- Dùng đúng class `.landing`, `.landing-nav`, `.landing-stage`, `.landing-intro`, `.studio-preview`, `.landing-learning`, `.landing-features`, `.landing-cta`, `.landing-footer` như React.
- Mỗi chuỗi VI/EN dùng `<span data-copy="vi">` và `<span data-copy="en">`.
- Không dùng class bot-only; cả hai bản là nội dung localization thật.
- Link dùng `<a href>` để không phụ thuộc router.

`index.html` đặt `data-lang="en"` trên `<html>` và thêm inline preference script trước body:

```html
<script>
  try {
    const language = localStorage.getItem('ielts-language')
    if (language === 'vi' || language === 'en') {
      document.documentElement.lang = language
      document.documentElement.dataset.lang = language
    }
  } catch {}
</script>
```

- [ ] **Step 4: Dùng cùng copy trong React**

`src/pages/Other.tsx` import `landingCopy` và thay chuỗi hero/features/CTA/footer bằng `c(landingCopy.field[0], landingCopy.field[1])`. Giữ icon hiện tại. Footer thêm link HTML thường:

```tsx
<nav className="landing-footer-links" aria-label="Public information">
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
  <a href="/privacy">Privacy</a>
</nav>
```

- [ ] **Step 5: Biến trust pages thành MPA không React**

Mỗi `pages/{about,contact,privacy}.html` có cấu trúc:

```html
<link rel="stylesheet" href="/src/styles.css" />
<body><div id="root"></div></body>
```

Không có `/src/main.tsx`. `vite.config.ts` inject `renderStaticHtml(page)` vào `#root` cho ba file này; inject `renderLandingHtml()` cho `index.html`.

- [ ] **Step 6: Bảo đảm font/CSS tải không cần JS**

Chuyển bốn import font từ `src/main.tsx` vào đầu `src/styles.css`:

```css
@import "tailwindcss";
@import "@fontsource/be-vietnam-pro/latin-400.css";
@import "@fontsource/be-vietnam-pro/latin-500.css";
@import "@fontsource/be-vietnam-pro/latin-600.css";
@import "@fontsource/be-vietnam-pro/latin-700.css";
```

Thêm CSS ẩn/hiện localization:

```css
[data-copy] { display: none; }
html[data-lang='en'] [data-copy='en'], html[data-lang='vi'] [data-copy='vi'] { display: inline; }
```

- [ ] **Step 7: Build và kiểm tra output**

Run: `npm run build && node tests/build-output.mjs`
Expected: PASS; trust pages không chứa `/src/main.tsx`; landing có nội dung thật và metadata.

- [ ] **Step 8: Commit**

```bash
git add src/agent/landing.ts src/agent/html.ts src/pages/Other.tsx src/main.tsx src/styles.css \
  index.html pages/about.html pages/contact.html pages/privacy.html vite.config.ts tests/build-output.mjs
git commit -m "feat(agent): prerender readable landing and trust pages"
```

## Task 4: Metadata, discovery files và OG image

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Create: `public/llms.txt`
- Create: `public/og-image.png`
- Create: `scripts/generate-og-image.mjs`
- Create: `tests/discovery.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Viết test đỏ**

`tests/discovery.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const publicDir = new URL('../public/', import.meta.url)

test('robots and sitemap publish only canonical public pages', () => {
  const robots = readFileSync(new URL('robots.txt', publicDir), 'utf8')
  assert.match(robots, /Sitemap: https:\/\/huybui\.vercel\.app\/sitemap\.xml/)
  const sitemap = readFileSync(new URL('sitemap.xml', publicDir), 'utf8')
  for (const path of ['/', '/about', '/contact', '/privacy']) assert.match(sitemap, new RegExp(`https://huybui\\.vercel\\.app${path === '/' ? '/' : path}`))
  for (const path of ['/admin', '/auth/callback', '/app/essays']) assert.ok(!sitemap.includes(path))
})

test('llms.txt points only to resources that exist', () => {
  const llms = readFileSync(new URL('llms.txt', publicDir), 'utf8')
  assert.match(llms, /^# IELTS Writing Studio/m)
  for (const path of ['/', '/about', '/contact', '/privacy', '/llms.txt', '/sitemap.xml']) assert.match(llms, new RegExp(path.replace('/', '\\/')))
  assert.ok(!llms.includes('/openapi.json'))
  assert.ok(!llms.includes('/api/mcp'))
})

test('og image is a real png', () => {
  const bytes = readFileSync(new URL('og-image.png', publicDir))
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  assert.equal(bytes.readUInt32BE(16), 1200)
  assert.equal(bytes.readUInt32BE(20), 630)
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test tests/discovery.test.ts`
Expected: FAIL vì các discovery files chưa tồn tại.

- [ ] **Step 3: Tạo discovery files**

`public/robots.txt`:

```text
User-agent: *
Allow: /
Disallow: /app/
Disallow: /admin
Disallow: /auth/

Sitemap: https://huybui.vercel.app/sitemap.xml
```

`public/sitemap.xml` chứa đúng bốn URL canonical. `public/llms.txt` theo format:

```markdown
# IELTS Writing Studio

> Free IELTS Writing Task 1 and Task 2 practice with AI feedback, vocabulary review and a personal learning history.

## Public pages

- [IELTS Writing Studio](https://huybui.vercel.app/): Overview and links to the writing studio.
- [About](https://huybui.vercel.app/about): Purpose, audience, AI limitations and project independence.
- [Contact](https://huybui.vercel.app/contact): Verified support channels and what to include.
- [Privacy policy](https://huybui.vercel.app/privacy): Data flows, AI processing and account deletion behavior.

## Discovery

- [Sitemap](https://huybui.vercel.app/sitemap.xml): Canonical public pages.
- [llms.txt](https://huybui.vercel.app/llms.txt): This agent index.

## Access

The overview, About, Contact and Privacy pages are public. Writing, essays, vocabulary review, progress and account settings require a signed-in session. There is currently no public REST API or MCP server.
```

- [ ] **Step 4: Sinh OG image**

`scripts/generate-og-image.mjs` dùng `chromium.launch()` từ Playwright, `page.setViewportSize({ width: 1200, height: 630 })`, render HTML inline với màu/token hiện tại và chụp `public/og-image.png`. Script phải tạo parent directory nếu cần.

Run: `node scripts/generate-og-image.mjs`
Expected: file PNG 1200×630 được tạo.

- [ ] **Step 5: Chạy test xanh**

Run: `node --test tests/discovery.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/robots.txt public/sitemap.xml public/llms.txt public/og-image.png \
  scripts/generate-og-image.mjs tests/discovery.test.ts package.json
git commit -m "feat(agent): add truthful discovery resources"
```

## Task 5: Edge error hints, giữ requestId và Retry-After

**Files:**
- Modify: `supabase/functions/_shared/http.ts`
- Create: `supabase/functions/_shared/tests/http.test.ts`

- [ ] **Step 1: Viết test đỏ**

Test handler errors và generic errors:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AppError, errorResponse } from '../http.ts'

test('actionable errors include a safe hint and keep request id', async () => {
  const response = errorResponse(new Request('https://example.test'), new AppError(429, 'rate_limited', 'Too many requests', 30), 'req-1')
  const body = await response.json() as { error: { code: string; hint?: string; requestId: string; retryAfter?: number }; requestId: string }
  assert.equal(body.error.code, 'rate_limited')
  assert.match(body.error.hint ?? '', /wait|retry/i)
  assert.equal(body.error.requestId, 'req-1')
  assert.equal(body.requestId, 'req-1')
  assert.equal(response.headers.get('retry-after'), '30')
})

test('unexpected errors do not leak raw details', async () => {
  const response = errorResponse(new Request('https://example.test'), new Error('SECRET SQL'), 'req-2')
  const body = await response.json() as { error: { code: string; message: string } }
  assert.equal(body.error.code, 'internal_error')
  assert.ok(!body.error.message.includes('SECRET'))
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test supabase/functions/_shared/tests/http.test.ts`
Expected: FAIL vì `hint` chưa tồn tại.

- [ ] **Step 3: Thêm hint map an toàn**

Trong `http.ts`, thêm map chỉ gồm action cụ thể:

```ts
const ERROR_HINTS: Record<string, string> = {
  unauthenticated: 'Sign in again and retry the request.',
  forbidden: 'Use an account with permission for this operation.',
  rate_limited: 'Wait for the retry delay and try again.',
  too_many_ai_jobs: 'Wait for an existing AI job to finish before submitting another.',
  draft_conflict: 'Reload the latest draft, merge your changes and submit again.',
  essay_empty: 'Add text to the essay before requesting feedback.',
  text_required: 'Provide the text required by this writing tool.',
  image_not_ready: 'Wait for the image upload to finish and try again.',
  invalid_request: 'Check the request fields against the endpoint contract.',
  method_not_allowed: 'Use one of the HTTP methods supported by this endpoint.',
}
```

Trong `errorResponse()`, thêm `...(hint ? { hint } : {})` vào nested `error`; không thay đổi `code`, `message`, `requestId`, top-level `requestId` hoặc `retryAfter`.

- [ ] **Step 4: Chạy Edge tests xanh**

Run: `npm run test:edge`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/http.ts supabase/functions/_shared/tests/http.test.ts
git commit -m "feat(api): add actionable edge error hints"
```

## Task 6: Browser regression cho raw HTML, layout shift và trust pages

**Files:**
- Create: `tests/landing-static.mjs`
- Modify: `package.json`

- [ ] **Step 1: Viết browser test**

`tests/landing-static.mjs` phải:

1. Mở `/` với JavaScript module bị chặn nhưng inline preference script được phép; kiểm tra H1, link và nội dung tĩnh.
2. Đo bounding box của `h1`, `.landing-intro`, `.studio-preview`, `.landing-learning`, `.landing-cta` trước và sau React mount; mỗi `x`, `y`, `width`, `height` lệch tối đa 8 px.
3. Chạy case `localStorage['ielts-language']='vi'`; static và React sau mount đều phải là tiếng Việt.
4. Chạy desktop 1440×1000 và mobile 390×844.
5. Mở `/about`, `/contact`, `/privacy`; kiểm tra status 200, một H1, ít nhất 500 ký tự text và heading tuần tự.

Dùng `page.route('**/*', route => route.request().resourceType() === 'script' && route.request().url().includes('/assets/') ? route.abort() : route.continue())` để chặn bundle React nhưng không chặn inline script.

Script đọc `TEST_TRUST_PATHS` (phân tách bằng dấu phẩy) để hỗ trợ cả local Vite preview lẫn Vercel rewrite. Mặc định là `/about,/contact,/privacy`.

- [ ] **Step 2: Chạy local test**

Run: `npm run build && npm run preview` (background), rồi:

```powershell
$env:TEST_URL='http://127.0.0.1:4173'
$env:TEST_TRUST_PATHS='/pages/about.html,/pages/contact.html,/pages/privacy.html'
node tests/landing-static.mjs
```

Expected: PASS. Deep-link `/about` vẫn là acceptance bắt buộc ở Vercel preview.

- [ ] **Step 3: Commit**

```bash
git add tests/landing-static.mjs package.json
git commit -m "test(agent): cover static landing and trust pages"
```

## Task 7: HTTP smoke bắt buộc trên Vercel preview

**Files:**
- Create: `tests/agent-readiness.mjs`
- Modify: `package.json`

- [ ] **Step 1: Viết HTTP smoke**

`tests/agent-readiness.mjs` nhận `TEST_URL`, dùng `fetch` và kiểm tra:

- `/` HTML: 200, `text/html`, body có H1.
- `/` Markdown: 200, `text/markdown; charset=utf-8`, `Vary` có `Accept`.
- `Accept: text/markdown;q=0, */*;q=1`: HTML.
- `Accept: application/json`: 406.
- Unknown path HTML/Markdown: 404; body có `/`, `/llms.txt`, `/sitemap.xml`.
- `/app/essays/does-not-exist`: 200 vì route động hợp lệ.
- `/auth/callback?code=test`: 200.
- `/assets/does-not-exist.js`: 404 và không phải HTML.
- `/robots.txt`, `/llms.txt`: `text/plain`; `/sitemap.xml`: XML; `/og-image.png`: PNG 1200×630.
- `/api/does-not-exist`: JSON 404 có `code/message/hint/status`.
- Thứ tự HTML → Markdown → HTML phải cho đúng body/MIME từng lần, không bị CDN trộn.

- [ ] **Step 2: Kiểm tra syntax script**

Run: `node --check tests/agent-readiness.mjs`
Expected: exit 0. HTTP assertions chỉ chạy trên Vercel preview vì local Vite không chạy Routing Middleware/CDN.

- [ ] **Step 3: Deploy Vercel preview**

Run: `npx vercel --yes`
Expected: command trả preview URL. Nếu CLI chưa được auth, dừng bước này và báo cáo rõ thay vì deploy production.

- [ ] **Step 4: Chạy smoke trên preview**

Run: `TEST_URL=<preview-url> node tests/agent-readiness.mjs`
Expected: PASS toàn bộ, gồm status 404, Vary và MIME thực tế qua Vercel.

- [ ] **Step 5: Commit**

```bash
git add tests/agent-readiness.mjs package.json
git commit -m "test(agent): add vercel preview readiness smoke"
```

## Task 8: Verification cuối và báo cáo

**Files:**
- Modify only if a verified fix is required.

- [ ] **Step 1: Chạy toàn bộ test logic**

Run: `npm test`
Expected: PASS.

- [ ] **Step 2: Chạy Edge tests**

Run: `npm run test:edge`
Expected: PASS.

- [ ] **Step 3: Build production**

Run: `npm run build`
Expected: PASS; không có lỗi TypeScript.

- [ ] **Step 4: Chạy agent/build tests**

Run: `npm run test:agent`
Expected: PASS.

- [ ] **Step 5: Chạy browser regression phù hợp**

Run: `node tests/landing-static.mjs`, `node tests/landing-ui.mjs`, `node tests/i18n.mjs`, `node tests/accessibility.mjs`, `node tests/browser.mjs` với `TEST_URL` trỏ preview/local server phù hợp.
Expected: PASS; test cần tài khoản thật chỉ chạy khi có `TEST_EMAIL`/`TEST_PASSWORD`.

- [ ] **Step 6: Chạy preview smoke lần cuối theo thứ tự cache**

Run: `TEST_URL=<preview-url> node tests/agent-readiness.mjs`
Expected: PASS sau HTML → Markdown → HTML và HEAD checks.

- [ ] **Step 7: Kiểm tra diff và trạng thái git**

Run: `git diff --check && git status --short`
Expected: không có whitespace error; chỉ còn file có chủ đích.

- [ ] **Step 8: Commit verification fixes nếu có**

```bash
git add <files-that-were-fixed-during-verification>
git commit -m "fix(agent): close readiness verification gaps"
```

## Self-review

- Spec coverage: giai đoạn 0–3 và phần lỗi JSON của giai đoạn 4 được Tasks 1–6; Vercel preview/cache là Task 7; MCP/public API bị deferred đúng quyết định.
- Acceptance điều chỉnh: specificity trước q-value và 406 ở Task 2; ngưỡng 8 px + VI đã lưu ở Task 6; trust page 500 ký tự/H1/heading ở Tasks 3/6; wording xóa dữ liệu ở Tasks 1/5.
- Không có public API/MCP/OpenAPI giả; mọi discovery link có file thật.
- Route động/auth callback giữ 200; URL sai 404; technical assets không bị Markdown hóa.
- TDD, lệnh kiểm tra và commit boundary rõ ràng ở từng task.
