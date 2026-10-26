# Agent Readiness (Ora "Is Agentic" 29/100) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng `https://huybui.vercel.app` từ 29/100 lên mức "agent-ready": nội dung đọc được không cần JavaScript, 404 thật, OpenAPI spec, JSON error, Markdown negotiation, developer portal, JSON-LD, trust pages, llms.txt/sitemap, MCP server.

**Architecture:** 4 tầng, tất cả là *additive* — không đổi hành vi sản phẩm, không đổi visual design.
1. **Tầng tĩnh (không JS):** Vite build thành MPA — mỗi trang công khai (`/`, `/about`, `/contact`, `/privacy`, `/developers`, `/docs`) có 1 file HTML riêng chứa `<head>` (title/canonical/og/JSON-LD) + bản sao static của nội dung trang. React mount vào `#root` và ẩn bản static (`html[data-app=ready]`), nên không có nháy nháy nội dung.
2. **Tầng định tuyến:** Vercel Routing Middleware (`middleware.ts`) lo: Markdown negotiation (`Accept: text/markdown` → `text/markdown` + `Vary: Accept`), 404 thật (HTTP 404 + body Markdown/HTML), manifest `/.well-known/mcp`.
3. **Tầng API:** Vercel Functions trong `api/` — REST công khai (`/api/health`, `/api/prompts`, `/api/prompts/{slug}`, `/api/library`) trả lỗi JSON có `code`/`message`/`hint`, và MCP server Streamable HTTP tại `/api/mcp`.
4. **Tầng file máy đọc:** `public/openapi.json`, `public/llms.txt`, `public/robots.txt`, `public/sitemap.xml`, `public/og-image.png`.

**Tech Stack:** React 19 · Vite 7 (MPA + plugin `transformIndexHtml`) · Vercel Routing Middleware (Node runtime) · Vercel Functions (Node runtime) · `@vercel/functions` · Supabase PostgREST (publishable key) · node:test · Playwright

**Ràng buộc:** giữ nguyên UI/UX hiện tại; route cũ vẫn 200; nội dung song ngữ VI/EN như còn lại; mọi endpoint public phải verify bằng `curl` sau khi deploy.

---

## File Structure

| File | Vai trò |
|---|---|
| `src/agent/site.ts` | Metadata site (tên, url, mô tả, contact, socials) + `buildJsonLd()` + `buildHeadTags()` |
| `src/agent/content.ts` | Nội dung song ngữ (vi/en) dùng chung cho React page + bản static + Markdown |
| `src/agent/markdown.ts` | Render nội dung → Markdown (middleware, llms.txt) |
| `src/agent/routes.ts` | Bảng route duy nhất: SPA routes, trang tĩnh, trang công khai, API routes + `matchPath()` |
| `src/agent/mcp.ts` | Định nghĩa MCP tool dùng chung cho `/api/mcp` và manifest `/.well-known/mcp` |
| `src/agent/head.ts` | (nằm trong `site.ts`) sinh thẻ `<head>` cho từng trang |
| `middleware.ts` | Routing Middleware: markdown negotiation, 404 thật, `/.well-known/mcp`, `Vary: Accept` |
| `api/_shared/http.ts` | `jsonOk()`, `jsonError()` (code/message/hint/status/documentation) + `methodNotAllowed()` |
| `api/_shared/supabase.ts` | Đọc env `VITE_SUPABASE_*`, query PostgREST bằng publishable key |
| `api/health.ts` | `GET /api/health` |
| `api/prompts/index.ts` | `GET /api/prompts` (filter task/limit/offset/search) |
| `api/prompts/[slug].ts` | `GET /api/prompts/{slug}` (404 JSON nếu không có) |
| `api/library.ts` | `GET /api/library` (template + sample + vocabulary) |
| `api/mcp.ts` | MCP server Streamable HTTP (initialize / tools/list / tools/call) |
| `api/[...path].ts` | JSON 404 cho mọi `/api/*` khác |
| `public/openapi.json` | OpenAPI 3.1.0 spec (operationId duy nhất, typed params, response schemas) |
| `public/llms.txt` | Index cho agent: docs, API, MCP, trust pages |
| `public/robots.txt` | Cho phép agent + trỏ sitemap |
| `public/sitemap.xml` | Sitemap các trang công khai |
| `public/og-image.png` | Ảnh OG 1200×630 (sinh bằng `scripts/generate-og-image.mjs`) |
| `scripts/generate-og-image.mjs` | Sinh `public/og-image.png` từ template HTML (Playwright, chạy 1 lần, commit kết quả) |
| `vite.config.ts` | MPA inputs (`pages/*.html`) + plugin `agentPages` inject head + nội dung static |
| `pages/about.html` … | HTML entry mỏng cho từng trang công khai |
| `src/pages/Agent.tsx` | React page render từ `src/agent/content.ts` |
| `src/main.tsx` | Set `document.documentElement.dataset.app = 'ready'` sau khi mount |
| `src/styles.css` | CSS cho nội dung static + `.doc-page` (dùng chung static & React) |
| `src/App.tsx` | Thêm route `/about`, `/contact`, `/privacy`, `/developers`, `/docs` |
| `tests/agent.test.ts` | Unit: routes, markdown, content, JSON-LD, head tags |
| `tests/api.test.ts` | Unit: các handler API + shape lỗi JSON |
| `tests/middleware.test.ts` | Unit: middleware (markdown, 404, manifest, Vary) |
| `tests/openapi.test.ts` | Validate `public/openapi.json` + khớp với API thật |
| `tests/agent-readiness.mjs` | E2E: chấm 14 tiêu chí Ora trên base URL (local hoặc production) |
| `vercel.json` | `proxy` (middleware) + `rewrites` (trang công khai → file MPA, SPA fallback) + headers |

---

## Task 1: Nền tảng dữ liệu dùng chung (`src/agent/*`)

**Files:**
- Create: `src/agent/site.ts`, `src/agent/content.ts`, `src/agent/markdown.ts`, `src/agent/routes.ts`
- Test: `tests/agent.test.ts`

- [ ] **Step 1: Viết test đỏ**

`tests/agent.test.ts` phải assert:
- `matchPath('/app/essays/abc')` → khớp route động; `matchPath('/khong-ton-tai')` → `null`.
- `renderMarkdown(page)` chứa `# ` (H1) và link tới `/docs`.
- `renderNotFoundMarkdown()` ≥ 20 ký tự và chứa `/docs`, `/sitemap.xml`, `/llms.txt`.
- Mỗi trong `about`, `contact`, `privacy` có ≥ 500 ký tự tiếng Anh.
- `buildJsonLd()` có node `SoftwareApplication` (name/description/url/offers) và node `Organization` (contactPoint có email + contactType, address `PostalAddress`).
- `buildHeadTags('/about')` có `rel="canonical"`, `og:type`, `og:image`, `html lang`.

- [ ] **Step 2: Chạy test → FAIL** (`node --test tests/agent.test.ts` → module not found)

- [ ] **Step 3: Implement `src/agent/site.ts`**

```ts
export const site = {
  name: 'IELTS Writing Studio',
  url: 'https://huybui.vercel.app',
  description: 'Free IELTS Writing practice with AI feedback: Task 1 & Task 2 prompts, essay grading, vocabulary and learning progress.',
  locale: 'en',
  repository: 'https://github.com/Huybuiii04/huybui',
  contact: { email: 'buidinhanhhuy@gmail.com', phone: '', contactType: 'customer support' },
  address: { streetAddress: 'Ho Chi Minh City', addressLocality: 'Ho Chi Minh', addressRegion: 'Ho Chi Minh', postalCode: '700000', addressCountry: 'VN' },
  ogImage: 'https://huybui.vercel.app/og-image.png',
}
export function buildJsonLd(): string { /* @graph: SoftwareApplication + Organization */ }
export function buildHeadTags(path: string, page?: { title: string; description: string }): string { /* canonical + og:* + twitter */ }
```

- [ ] **Step 4: Implement `src/agent/content.ts`**

Kiểu nội dung: `{ id, path, title: [vi, en], summary: [vi, en], sections: [{ id, heading: [vi,en], body: [vi,en][], list?: [vi,en][] }] }`.
Trang: `home`, `about`, `contact`, `privacy`, `developers`, `docs`.

- [ ] **Step 5: Implement `src/agent/markdown.ts`**

`renderMarkdown(page, lang)` → `# Title\n\n> summary\n\n## Section\n\nbody…`; `renderNotFoundMarkdown(path)` → giải thích lỗi + link `/docs`, `/sitemap.xml`, `/llms.txt`, `/llms.txt`.

- [ ] **Step 6: Implement `src/agent/routes.ts`**

```ts
export const spaRoutes = ['/', '/auth', '/auth/callback', '/auth/reset-password', '/donate', '/app', '/app/write', '/app/prompts', '/app/essays', '/app/essays/:id', '/app/vocabulary', '/app/review', '/app/errors', '/app/settings', '/admin', '/about', '/contact', '/privacy', '/developers', '/docs']
export const staticFiles = ['/favicon.svg', '/donate-qr.png', '/og-image.png', '/robots.txt', '/sitemap.xml', '/llms.txt', '/openapi.json']
export const apiRoutes = ['/api/health', '/api/prompts', '/api/prompts/:slug', '/api/library', '/api/mcp']
export function matchPath(path: string): { kind: 'spa' | 'static' | 'api'; id: string } | null
```

- [ ] **Step 7: Chạy test → PASS**, commit: `feat(agent): shared site metadata, content, markdown and route tables`

---

## Task 2: Nội dung tĩnh cho crawler + metadata + JSON-LD (MPA)

**Files:**
- Create: `pages/about.html`, `pages/contact.html`, `pages/privacy.html`, `pages/developers.html`, `pages/docs.html`
- Modify: `index.html`, `vite.config.ts`, `src/styles.css`, `src/main.tsx`
- Test: `tests/agent.test.ts` (bổ sung), `tests/build-output.mjs` (kiểm tra `dist/*.html`)

- [ ] **Step 1: Test đỏ** — `tests/build-output.mjs` build rồi assert mỗi `dist/pages/*.html` + `dist/index.html` có: ≥500 ký tự text, đúng 1 `<h1>`, heading levels không nhảy, `rel="canonical"`, `og:type`, `og:image`, `application/ld+json` chứa `SoftwareApplication` + `Organization`.

- [ ] **Step 2: `index.html` + `pages/*.html`** — file mỏng, chỉ có `<div id="root"></div>` + `<script type="module" src="/src/main.tsx">`; nội dung static được plugin inject.

- [ ] **Step 3: Plugin `agentPages` trong `vite.config.ts`**

```ts
function agentPages(): Plugin {
  return {
    name: 'agent-pages',
    transformIndexHtml(html, ctx) {
      const page = pageIdFromPath(ctx.path) // 'home' | 'about' | ...
      return { html, tags: [ ...head tags..., { tag: 'div', attrs: { id: 'agent-static', class: 'agent-static' }, children: staticMarkup(page), injectTo: 'body-prepend' } ] }
    },
  }
}
```
`build.rollupOptions.input` = `{ main: 'index.html', about: 'pages/about.html', … }`.

- [ ] **Step 4: CSS `.agent-static` + `.doc-*`** trong `src/styles.css` (dùng chung token `--brand`, `--surface`…).

- [ ] **Step 5: `src/main.tsx`** set `document.documentElement.dataset.app = 'ready'` sau `root.render()` → CSS ẩn `#agent-static`.

- [ ] **Step 6: Chạy test → PASS**, commit: `feat(agent): prerendered static content, canonical/og meta and JSON-LD`

---

## Task 3: Routing Middleware — Markdown negotiation + 404 thật + MCP manifest

**Files:**
- Create: `middleware.ts`, `vercel.json` (modify)
- Test: `tests/middleware.test.ts`

- [ ] **Step 1: Test đỏ** — gọi middleware bằng `new Request(...)`:
  - `Accept: text/markdown` tại `/` → status 200, `content-type` chứa `text/markdown`, `vary` chứa `Accept`, body có `#`.
  - `Accept: text/html` tại `/` → `next()` (header `x-middleware-next`) + `vary: Accept`.
  - `/khong-ton-tai` → status 404; bản markdown có `text/markdown` + link `/docs`; bản HTML có `text/html`.
  - `/.well-known/mcp` → 200 `application/json` + `transports[0].url`.
  - `/api/xyz` → `next()` (để function catch-all trả JSON 404).

- [ ] **Step 2: `middleware.ts`**

```ts
import { next } from '@vercel/functions'
export const config = { runtime: 'nodejs', matcher: ['/((?!assets/|favicon\\.svg|donate-qr\\.png|og-image\\.png).*)'] }
export default function middleware(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname
  if (path.startsWith('/api/')) return next()
  if (path === '/.well-known/mcp') return Response.json(buildMcpManifest(url.origin), { headers: { 'cache-control': 'public, max-age=3600' } })
  const match = matchPath(path)
  if (!match) return notFound(request, path)          // 404 + Markdown/HTML
  if (wantsMarkdown(request) && hasMarkdown(match)) return markdownResponse(renderMarkdown(page))
  return next({ headers: { Vary: 'Accept' } })
}
```

- [ ] **Step 3: `vercel.json`** — thêm `proxy.entrypoint = "middleware.ts"`, `rewrites` mapping `/about` → `/pages/about.html` … (đặt trước SPA fallback), giữ `Cache-Control` hiện có.

- [ ] **Step 4: Chạy test → PASS**, commit: `feat(agent): markdown negotiation, real 404s and MCP manifest`

---

## Task 4: API JSON + lỗi có cấu trúc

**Files:**
- Create: `api/_shared/http.ts`, `api/_shared/supabase.ts`, `api/health.ts`, `api/prompts/index.ts`, `api/prompts/[slug].ts`, `api/library.ts`, `api/[...path].ts`
- Test: `tests/api.test.ts`

- [ ] **Step 1: Test đỏ** — shape lỗi bắt buộc:

```json
{ "error": { "code": "prompt_not_found", "message": "…", "hint": "…", "status": 404, "documentation": "https://huybui.vercel.app/docs" } }
```
- `limit=abc` → 400 `invalid_parameter`; `limit=999` → 400; slug không tồn tại → 404 `prompt_not_found`; `/api/khong-co` → 404 `unknown_endpoint`; `POST /api/health` → 405 `method_not_allowed`; mọi response phải là `application/json`.

- [ ] **Step 2: `api/_shared/http.ts`** — `jsonOk(data, status?)`, `jsonError(status, code, message, hint)`, `methodNotAllowed(allowed)`.

- [ ] **Step 3: `api/_shared/supabase.ts`** — `supabaseEnv()` đọc `process.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`; `fetchPrompts(params)` gọi PostgREST `/rest/v1/prompts?select=…`.

- [ ] **Step 4: Implement các endpoint** theo spec ở Task 8.

- [ ] **Step 5: Chạy test → PASS**, commit: `feat(api): public REST API with structured JSON errors`

---

## Task 5: MCP server (Streamable HTTP) + `/.well-known/mcp`

**Files:**
- Create: `src/agent/mcp.ts`, `api/mcp.ts`
- Test: `tests/api.test.ts`

- [ ] **Step 1: Test đỏ** — POST JSON-RPC `initialize` → `protocolVersion`, `serverInfo`; `tools/list` → ≥3 tool có `name`/`description`/`inputSchema`; `tools/call` (`list_prompts`) → `content[0].type === 'text'`; method lạ → error `-32601`; GET → 405.

- [ ] **Step 2: `src/agent/mcp.ts`** — khai báo tool: `list_prompts`, `get_prompt`, `get_learning_template`, `list_writing_frameworks`.

- [ ] **Step 3: `api/mcp.ts`** — JSON-RPC 2.0, `initialize` / `notifications/initialized` (202) / `tools/list` / `tools/call`, trả `application/json`.

- [ ] **Step 4: Chạy test → PASS**, commit: `feat(mcp): streamable HTTP MCP server with prompt tools`

---

## Task 6: File máy đọc (`openapi.json`, `llms.txt`, `robots.txt`, `sitemap.xml`, `og-image.png`)

**Files:**
- Create: `public/openapi.json`, `public/llms.txt`, `public/robots.txt`, `public/sitemap.xml`, `scripts/generate-og-image.mjs`, `public/og-image.png`
- Test: `tests/openapi.test.ts`

- [ ] **Step 1: Test đỏ** — `tests/openapi.test.ts` assert: parse được JSON; `openapi` ≥ 3.1; mọi operation có `operationId` duy nhất, `summary`, `description`; mọi param có `schema` + `description`; có `components.schemas.Error`; `paths` khớp đúng các route trong `apiRoutes`.

- [ ] **Step 2: `public/openapi.json`** — mô tả `/api/health`, `/api/prompts`, `/api/prompts/{slug}`, `/api/library`, `/api/mcp` (POST JSON-RPC) + `servers: [{ url: "https://huybui.vercel.app" }]`.

- [ ] **Step 3: `public/llms.txt`, `public/robots.txt`, `public/sitemap.xml`**.

- [ ] **Step 4: `scripts/generate-og-image.mjs`** — Playwright render 1200×630 → `public/og-image.png` (chạy 1 lần, commit ảnh).

- [ ] **Step 5: Chạy test → PASS**, commit: `feat(agent): openapi spec, llms.txt, robots, sitemap and og image`

---

## Task 7: Trang React `/about`, `/contact`, `/privacy`, `/developers`, `/docs`

**Files:**
- Create: `src/pages/Agent.tsx`
- Modify: `src/App.tsx`, `src/styles.css`, `src/components/Layout.tsx` (link footer), `tests/i18n.mjs` (danh sách route)
- Test: `tests/i18n.mjs`, `tests/agent.test.ts`

- [ ] **Step 1: Test đỏ** — thêm 5 route mới vào `routes` của `tests/i18n.mjs` (bắt buộc song ngữ, không trộn ngôn ngữ).

- [ ] **Step 2: `src/pages/Agent.tsx`** — render `content.ts` theo `lang` hiện tại, dùng class `.doc-page` (giống bản static).

- [ ] **Step 3: `src/App.tsx`** — thêm route (ngoài `RouteGuard`): `/about`, `/contact`, `/privacy`, `/developers`, `/docs`.

- [ ] **Step 4: Link điều hướng** — footer landing + mục "Tài liệu" trong sidebar (không đổi layout hiện có).

- [ ] **Step 5: Chạy `node tests/i18n.mjs` + `npm test` → PASS**, commit: `feat(pages): about, contact, privacy, developers and api docs pages`

---

## Task 8: Script kiểm tra readiness + cập nhật `tests/production.mjs`

**Files:**
- Create: `tests/agent-readiness.mjs`
- Modify: `tests/production.mjs`, `package.json` (script `test:agent`)

- [ ] **Step 1: `tests/agent-readiness.mjs`** — chấm 14 tiêu chí (text ≥500 ký tự, H1, 404 status + markdown, `openapi.json` parse, JSON error, markdown negotiation + `Vary: Accept`, `/developers`, JSON-LD 2 type, 3 trust page ≥500 ký tự, llms.txt/sitemap, MCP manifest + handshake, metadata 4/4).

- [ ] **Step 2: `tests/production.mjs`** — thêm assert route mới trả 200 và `/openapi.json`, `/llms.txt` trả 200.

- [ ] **Step 3: `package.json`** — `test` thêm `tests/agent.test.ts tests/api.test.ts tests/middleware.test.ts tests/openapi.test.ts`; thêm script `test:agent`.

---

## Task 9: Deploy + verify

- [ ] **Step 1: `npm run build` + `npm test` + `tests/agent-readiness.mjs` trên preview** (`npx vercel` → URL preview) — kiểm tra markdown/404/openapi/MCP.
- [ ] **Step 2: `npx vercel --prod --yes`** (push commit lên `origin/main` trước nếu Vercel chặn do commit chưa có trên GitHub).
- [ ] **Step 3: Verify production** bằng `curl`:
  - `curl -sS -L -i -H 'Accept: text/markdown' https://huybui.vercel.app/`
  - `curl -sS -L -i -H 'Accept: text/html' https://huybui.vercel.app/`
  - `curl -sS -L -i -H 'Accept: text/markdown' https://huybui.vercel.app/some-path-that-does-not-exist`
  - `curl -sS https://huybui.vercel.app/openapi.json`, `/llms.txt`, `/.well-known/mcp`, `/api/health`, `/api/prompts?limit=2`, `/api/prompts/khong-co`
- [ ] **Step 4: `TEST_URL=https://huybui.vercel.app node tests/agent-readiness.mjs`** → PASS toàn bộ tiêu chí có thể kiểm tự động.
- [ ] **Step 5: Báo cáo**: điểm Ora dự kiến, phần còn lại cần quyết định sản phẩm (API key thật, số điện thoại, địa chỉ đầy đủ).

---

## Self-review

- **Spec coverage:** 14 mục audit → Task 1 (nội dung dùng chung), Task 2 (mục 1, 7, 8, 13), Task 3 (mục 2, 5, 14-manifest), Task 4 (mục 4), Task 5 (mục 14), Task 6 (mục 3, 10, 11, 12), Task 7 (mục 6, 9), Task 8–9 (verify).
- **Không có placeholder:** mọi bước có file path cụ thể, code mẫu và lệnh chạy.
- **Tính nhất quán:** `src/agent/routes.ts` là nguồn duy nhất; `vercel.json` và `middleware.ts` cùng dùng nó, test `tests/agent.test.ts` kiểm tra đồng bộ.
