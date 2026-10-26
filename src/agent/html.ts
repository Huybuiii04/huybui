import type { ContentPage, Copy } from './content.ts'
import { landingCopy } from './landing.ts'
import { publicLinks } from './routes.ts'

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Icon tĩnh: cùng viewBox, cùng stroke và cùng kích thước pixel với lucide-react
// để bản HTML tĩnh và bản React vẽ ra một hình, không nhảy layout khi app mount.
const staticIcons = {
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'clipboard-list':
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  lightbulb:
    '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  'pen-line':
    '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  'shield-check':
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  sparkles:
    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
} as const

type StaticIcon = keyof typeof staticIcons

function staticIcon(name: StaticIcon, size: number, strokeWidth = 2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name}">${staticIcons[name]}</svg>`
}

// Bản HTML tĩnh của landing: cùng cấu trúc, cùng class và cùng icon với
// component React. Mỗi chuỗi được render hai lần (vi/en) để CSS hiển thị đúng
// ngôn ngữ đang chọn mà không cần JavaScript.
export function renderLandingHtml() {
  const copy = landingCopy
  const bilingual = (pair: Copy) =>
    `<span data-copy="vi" lang="vi">${escapeHtml(pair[0])}</span><span data-copy="en" lang="en">${escapeHtml(pair[1])}</span>`
  const brand =
    `<a class="brand" href="/app" aria-label="IELTS Writing Studio">` +
    `<span class="brand-mark">${staticIcon('pen-line', 23, 2.4)}</span>` +
    `<span>${escapeHtml(copy.brandName)}<span class="brand-sub">${escapeHtml(copy.brandSub)}</span></span>` +
    `<span class="brand-dot"></span></a>`
  const featureIcons: Record<string, StaticIcon> = {
    pen: 'pen-line',
    clipboard: 'clipboard-list',
    lightbulb: 'lightbulb',
  }
  const features = copy.features
    .map((feature, index) => {
      const icon = staticIcon(featureIcons[feature.icon], 23)
      return (
        `<a class="landing-feature" href="${escapeHtml(feature.href)}">` +
        `<div class="feature-top">${icon}<span>0${index + 1}</span></div>` +
        `<h3>${bilingual(feature.title)}</h3>` +
        `<p>${bilingual(feature.body)}</p>` +
        `<span class="feature-action">${bilingual(feature.action)}${staticIcon('arrow-up-right', 17)}</span>` +
        `</a>`
      )
    })
    .join('')
  const perks = copy.perks
    .map(perk => `<span>${staticIcon('check', 15)}${bilingual(perk)}</span>`)
    .join('')
  const footerLinks = copy.footerLinks
    .map(link => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
    .join('')
  const languageButtons = copy.languageButtons
    .map(button =>
      `<button type="button" data-lang-switch="${escapeHtml(button.code)}" aria-pressed="${button.code === 'en' ? 'true' : 'false'}">${escapeHtml(button.label)}</button>`,
    )
    .join('')

  return (
    `<div class="landing">` +
    `<a href="#landing-main" class="skip-link">${bilingual(copy.skipToContent)}</a>` +
    `<span id="landing-nav-label" class="sr-only">${bilingual(copy.navLabel)}</span>` +
    `<span id="landing-language-label" class="sr-only">${bilingual(copy.languageSwitchLabel)}</span>` +
    `<header class="landing-nav">${brand}` +
    `<nav aria-labelledby="landing-nav-label">` +
    `<a href="/app/prompts">${bilingual(copy.navPromptLibrary)}</a>` +
    `<div class="language-switch" aria-labelledby="landing-language-label">${languageButtons}</div>` +
    `<a class="button outline" href="/app">${bilingual(copy.navOpenStudio)}${staticIcon('arrow-up-right', 16)}</a>` +
    `</nav></header>` +
    `<main id="landing-main">` +
    `<div class="landing-stage">` +
    `<section class="landing-intro">` +
    `<span class="landing-kicker"><span class="small-dot"></span>${bilingual(copy.heroKicker)}</span>` +
    `<h1>${bilingual(copy.heroTitle)}<br>${bilingual(copy.heroAccent)}<em>${bilingual(copy.heroEmphasis)}</em></h1>` +
    `<p>${bilingual(copy.heroBody)}</p>` +
    `<div class="button-row">` +
    `<a class="button primary large" href="/app/write">${bilingual(copy.primaryCta)}${staticIcon('arrow-right', 18)}</a>` +
    `<a class="button outline large" href="/app/essays/demo">${bilingual(copy.secondaryCta)}${staticIcon('arrow-up-right', 17)}</a>` +
    `</div>` +
    `<div class="landing-perks">${perks}</div>` +
    `<p class="landing-note">${bilingual(copy.signInNote)}</p>` +
    `<a class="landing-explore" href="#learning-path">${bilingual(copy.explore)}${staticIcon('arrow-right', 16)}</a>` +
    `</section>` +
    `<span id="landing-studio-label" class="sr-only">${bilingual(copy.studioLabel)}</span>` +
    `<section class="studio-preview" aria-labelledby="landing-studio-label">` +
    `<div class="studio-toolbar"><span><i></i><i></i><i></i></span><span>${escapeHtml(copy.studioToolbar)}</span>${staticIcon('pen-line', 15)}</div>` +
    `<div class="studio-body">` +
    `<div class="studio-meta"><span>${escapeHtml(copy.studioMetaLabel)}</span><span>${bilingual(copy.studioMeta)}</span></div>` +
    `<h2>${bilingual(copy.studioTitle)}<br><span>${bilingual(copy.studioTitleAccent)}</span></h2>` +
    `<p class="studio-prompt">${bilingual(copy.studioPrompt)}</p>` +
    `<div class="studio-excerpt" lang="en">${escapeHtml(copy.studioExcerptBefore)}<mark>${escapeHtml(copy.studioExcerptHighlight)}</mark>${escapeHtml(copy.studioExcerptAfter)}</div>` +
    `<div class="studio-insight">${staticIcon('sparkles', 19)}<div><strong>${bilingual(copy.studioInsightTitle)}</strong><p>${bilingual(copy.studioInsightBody)}</p></div></div>` +
    `<a class="button primary full" href="/app/write">${bilingual(copy.studioAction)}${staticIcon('arrow-right', 17)}</a>` +
    `</div>` +
    `<div class="studio-bottom"><span>${staticIcon('shield-check', 14)}${bilingual(copy.studioBottom)}</span><span>${escapeHtml(copy.studioBottomLabel)}</span></div>` +
    `</section>` +
    `</div>` +
    `<section class="landing-learning" id="learning-path">` +
    `<div class="landing-section-heading"><span class="eyebrow">${bilingual(copy.learningKicker)}</span><h2>${bilingual(copy.learningTitle)}</h2><p>${bilingual(copy.learningBody)}</p></div>` +
    `<div class="landing-features">${features}</div>` +
    `</section>` +
    `<section class="landing-cta">${staticIcon('heart', 24)}<span class="eyebrow">${bilingual(copy.ctaKicker)}</span>` +
    `<h2>${bilingual(copy.ctaTitle)}</h2><p>${bilingual(copy.ctaBody)}</p>` +
    `<a class="button outline" href="/donate">${bilingual(copy.donateCta)}${staticIcon('arrow-up-right', 16)}</a></section>` +
    `</main>` +
    `<footer class="landing-footer">${brand}<span>${escapeHtml(copy.footerCopyright)}</span>` +
    `<nav class="landing-footer-links" aria-label="Public information">${footerLinks}</nav>` +
    `<a href="/app">${bilingual(copy.footerStart)}${staticIcon('arrow-up-right', 16)}</a></footer>` +
    `</div>`
  )
}

// Bản HTML tĩnh của trang: cùng cấu trúc và class với component React để nội dung
// không đổi khi app mount (và đọc được khi JavaScript bị chặn).
export function renderStaticHtml(page: ContentPage): string {
  const parts: string[] = ['<div class="doc-shell">']
  parts.push(
    '<header class="doc-nav">',
    `<a class="brand" href="/" aria-label="IELTS Writing Studio"><span class="brand-mark">${staticIcon('pen-line', 23, 2.4)}</span><span>${escapeHtml(landingCopy.brandName)}<span class="brand-sub">${escapeHtml(landingCopy.brandSub)}</span></span><span class="brand-dot"></span></a>`,
    '<nav aria-label="Public pages">',
  )
  for (const link of publicLinks.filter(item => !item.href.endsWith('.xml') && !item.href.endsWith('.txt'))) {
    parts.push(`<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
  }
  parts.push('</nav>', '</header>')
  parts.push('<div class="doc-main">')
  parts.push(`<main class="doc-page" data-agent-page="${escapeHtml(page.id)}">`)
  parts.push(
    '<header class="doc-header">',
    '<p class="doc-eyebrow">IELTS Writing Studio</p>',
    `<h1>${escapeHtml(page.title[1])}</h1>`,
    `<p class="doc-summary">${escapeHtml(page.summary[1])}</p>`,
    '</header>',
  )
  for (const section of page.sections) {
    parts.push(`<section class="doc-section" id="${escapeHtml(section.id)}">`)
    parts.push(`<h2>${escapeHtml(section.heading[1])}</h2>`)
    for (const paragraph of section.body) parts.push(`<p>${escapeHtml(paragraph[1])}</p>`)
    if (section.list) {
      parts.push('<ul>')
      for (const item of section.list) parts.push(`<li>${escapeHtml(item[1])}</li>`)
      parts.push('</ul>')
    }
    parts.push('</section>')
  }
  parts.push('</main>', '</div>')
  parts.push(
    '<footer class="doc-footer">',
    '<span>IELTS Writing Studio</span>',
    '<a href="/">Home</a>',
    '<a href="/llms.txt">llms.txt</a>',
    '<a href="/sitemap.xml">Sitemap</a>',
    '</footer>',
    '</div>',
  )
  return parts.join('')
}

// Khung HTML dùng chung cho các trang lỗi tĩnh (404, 406).
const errorStyles = `
      :root { color-scheme: light dark; --bg: #f7f5ef; --surface: #ffffff; --border: #d4e1db; --text: #183c38; --muted: #496660; --brand: #00635e; }
      @media (prefers-color-scheme: dark) { :root { --bg: #090a0b; --surface: #131516; --border: #2b3032; --text: #edf1f0; --muted: #bac3c1; --brand: #4dd6bd; } }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 40px 20px; background: var(--bg); color: var(--text); font-family: 'Be Vietnam Pro', system-ui, -apple-system, 'Segoe UI', sans-serif; line-height: 1.65; }
      main { max-width: 640px; width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px; }
      p.code { margin: 0; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--brand); font-weight: 700; }
      h1 { margin: 12px 0 14px; font-size: clamp(26px, 5vw, 38px); letter-spacing: -.03em; line-height: 1.2; }
      p { margin: 0 0 14px; font-size: 14.5px; color: var(--muted); }
      code { background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 2px 6px; font-size: 13px; }
      ul { margin: 18px 0 0; padding-left: 20px; }
      li { font-size: 14px; color: var(--muted); margin-bottom: 8px; }
      a { color: var(--brand); }
`

function errorDocument(input: { code: string; title: string; heading: string; content: string }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(input.title)}</title>
    <meta name="robots" content="noindex" />
    <style>${errorStyles}    </style>
  </head>
  <body>
    <main>
      <p class="code">Error ${escapeHtml(input.code)}</p>
      <h1>${escapeHtml(input.heading)}</h1>
      ${input.content}
    </main>
  </body>
</html>
`
}

// Trang 404 tĩnh: dùng khi agent hoặc người dùng gõ sai đường dẫn.
export function renderNotFoundHtml(path: string) {
  return errorDocument({
    code: '404',
    title: '404 — Page not found — IELTS Writing Studio',
    heading: 'This page is not here',
    content: `<p>The address <code>${escapeHtml(path)}</code> does not exist on IELTS Writing Studio, so there is no page to read at this URL.</p>
      <p>If you are looking for machine-readable resources, use one of these:</p>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/llms.txt">llms.txt</a> and the <a href="/sitemap.xml">sitemap</a></li>
      </ul>`,
  })
}

// Trang 406: client không chấp nhận bất kỳ định dạng nào site này tạo ra.
export function renderNotAcceptableHtml() {
  return errorDocument({
    code: '406',
    title: '406 — Not Acceptable — IELTS Writing Studio',
    heading: 'This format is not available',
    content: `<p>The Accept header of this request does not allow any format this site can produce. Every public page is available in two formats:</p>
      <ul>
        <li><code>text/html</code> — the readable web page</li>
        <li><code>text/markdown</code> — the same page as plain Markdown for agents</li>
      </ul>
      <p>Ask for one of them explicitly, for example <code>Accept: text/markdown</code>.</p>`,
  })
}
