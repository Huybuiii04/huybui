import type { ContentPage, Copy } from './content.ts'
import { landingCopy, skillArtwork } from './landing.ts'
import { publicLinks } from './routes.ts'

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const bilingual = (pair: Copy) => `<span data-copy="vi" lang="vi">${escapeHtml(pair[0])}</span><span data-copy="en" lang="en">${escapeHtml(pair[1])}</span>`

// Trusted local content only; every copy value and URL is escaped here.
export function renderLandingHtml() {
  const copy = landingCopy
  const brand = `<a class="brand" href="/app" aria-label="IELTS Studio"><img class="brand-mark" src="/brand/ielts-studio-mark.webp" width="44" height="44" alt=""><span>${copy.brandName}</span></a>`
  const languageButtons = copy.languageButtons.map(button => `<button type="button" data-lang-switch="${button.code}" aria-pressed="${button.code === 'en'}">${button.label}</button>`).join('')
  const features = copy.features.map(item => `<a class="landing-feature" data-skill="${item.id}" href="${escapeHtml(item.href)}"><span class="feature-number">${item.number}</span><h3>${bilingual(item.title)}</h3><div class="feature-description"><p>${bilingual(item.body)}</p><span class="landing-label">${bilingual(item.action)}</span>${item.comingSoon ? `<span class="coming-soon">${bilingual(copy.comingSoon)}</span>` : ''}</div><span class="feature-arrow" aria-hidden="true">→</span></a>`).join('')
  const steps = copy.steps.map((item, index) => `<li><span class="step-number" aria-hidden="true">${index + 1}</span><h3>${bilingual(item.title)}</h3><p>${bilingual(item.body)}</p></li>`).join('')
  const criteria = copy.criteria.map(item => `<div class="sample-criterion"><div><span>${item.title}</span><span>${item.score}</span></div><div class="sample-bar"><i style="--score:${Number(item.score) / 9 * 100}%"></i></div></div>`).join('')
  return `<div class="landing">
<a href="#landing-main" class="skip-link">${bilingual(copy.skipToContent)}</a>
<span id="landing-nav-label" class="sr-only">${bilingual(copy.navLabel)}</span>
<span id="landing-language-label" class="sr-only">${bilingual(copy.languageSwitchLabel)}</span>
<header class="landing-nav"><div class="landing-wrap">${brand}<nav aria-labelledby="landing-nav-label"><a class="landing-nav-link" href="#skills">${bilingual(copy.navSkills)}</a><a class="landing-nav-link" href="/app/prompts">${bilingual(copy.navPromptLibrary)}</a><a class="landing-nav-link" href="/app/vocabulary">${bilingual(copy.navVocabulary)}</a><div class="language-switch" aria-labelledby="landing-language-label">${languageButtons}</div><button class="theme-toggle" type="button" data-theme-switch><span class="sr-only">${bilingual(copy.themeLabel)}</span><span aria-hidden="true">◐</span></button><a class="button primary" href="/app">${bilingual(copy.navOpenStudio)}</a></nav></div></header>
<main id="landing-main">
<div class="landing-hero"><div class="landing-stage landing-wrap">
<section class="landing-intro"><span class="landing-label">${bilingual(copy.heroKicker)}</span><h1>${bilingual(copy.heroTitle)}<br>${bilingual(copy.heroAccent)}<em>${bilingual(copy.heroEmphasis)}</em>${bilingual(copy.heroEnd)}</h1><p>${bilingual(copy.heroBody)}</p><div class="button-row"><a class="button primary large" href="/app">${bilingual(copy.primaryCta)}<span aria-hidden="true">→</span></a><a class="button outline large" href="/app/essays/demo">${bilingual(copy.secondaryCta)}</a></div><p class="landing-note">${bilingual(copy.signInNote)}</p></section>
<div class="skill-art" aria-hidden="true">${skillArtwork()}</div>
</div></div>
<section class="landing-learning landing-wrap" id="skills"><div class="landing-section-heading"><span class="landing-label">${bilingual(copy.learningKicker)}</span><h2>${bilingual(copy.learningTitle)}</h2></div><div class="landing-features">${features}</div></section>
<section class="landing-rhythm landing-wrap"><div class="landing-section-heading"><span class="landing-label">${bilingual(copy.rhythmKicker)}</span><h2>${bilingual(copy.rhythmTitle)}</h2></div><ol class="learning-steps">${steps}</ol></section>
<section class="landing-feedback"><div class="landing-wrap feedback-layout"><div><span class="landing-label">${bilingual(copy.feedbackKicker)}</span><h2>${bilingual(copy.feedbackTitle)}</h2><p>${bilingual(copy.feedbackBody)}</p><a class="button outline" href="/app/essays/demo">${bilingual(copy.feedbackAction)}<span aria-hidden="true">→</span></a></div><div class="sample-score"><header><span class="landing-label">${bilingual(copy.sampleLabel)}</span><b>7.0</b></header>${criteria}</div></div></section>
<section class="landing-cta"><div class="landing-wrap"><h2>${bilingual(copy.ctaTitle)}</h2><p>${bilingual(copy.ctaBody)}</p><a class="button outline" href="/donate">${bilingual(copy.donateCta)}</a></div></section>
</main><footer class="landing-footer landing-wrap">${brand}<span class="landing-footer-copyright">${copy.footerCopyright}</span><nav class="landing-footer-links" aria-label="Public information">${copy.footerLinks.map(link => `<a href="${link.href}">${link.label}</a>`).join('')}</nav><a class="landing-footer-start" href="/app">${bilingual(copy.primaryCta)}<span aria-hidden="true">↗</span></a></footer></div>`
}

// Bản HTML tĩnh của trang: cùng cấu trúc và class với component React để nội dung
// không đổi khi app mount (và đọc được khi JavaScript bị chặn).
export function renderStaticHtml(page: ContentPage): string {
  const parts: string[] = ['<div class="doc-shell">']
  parts.push(
    '<header class="doc-nav">',
    `<a class="brand" href="/" aria-label="IELTS Studio"><img class="brand-mark" src="/brand/ielts-studio-mark.webp" width="44" height="44" alt=""><span>${escapeHtml(landingCopy.brandName)}</span></a>`,
    '<nav aria-label="Public pages">',
  )
  for (const link of publicLinks.filter(item => !item.href.endsWith('.xml') && !item.href.endsWith('.txt'))) {
    parts.push(`<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
  }
  parts.push('</nav>', `<div class="doc-controls"><div class="language-switch" aria-label="Language">${landingCopy.languageButtons.map(button => `<button type="button" data-lang-switch="${button.code}" aria-pressed="${button.code === 'en'}">${button.label}</button>`).join('')}</div><button class="theme-toggle" type="button" data-theme-switch><span class="sr-only">${bilingual(landingCopy.themeLabel)}</span><span aria-hidden="true">◐</span></button></div>`, '</header>')
  parts.push('<div class="doc-main">')
  parts.push(`<main class="doc-page" data-agent-page="${escapeHtml(page.id)}">`)
  parts.push(
    '<header class="doc-header">',
    '<p class="doc-eyebrow">IELTS Studio</p>',
    `<h1>${bilingual(page.title)}</h1>`,
    `<p class="doc-summary">${bilingual(page.summary)}</p>`,
    '</header>',
  )
  for (const section of page.sections) {
    parts.push(`<section class="doc-section" id="${escapeHtml(section.id)}">`)
    parts.push(`<h2>${bilingual(section.heading)}</h2>`)
    for (const paragraph of section.body) parts.push(`<p>${bilingual(paragraph)}</p>`)
    if (section.list) {
      parts.push('<ul>')
      for (const item of section.list) parts.push(`<li>${bilingual(item)}</li>`)
      parts.push('</ul>')
    }
    parts.push('</section>')
  }
  parts.push('</main>', '</div>')
  parts.push(
    '<footer class="doc-footer">',
    '<span>IELTS Studio</span>',
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
      :root { color-scheme: light dark; --bg: #F5F0E6; --surface: #FFFBF3; --border: #d2c6b6; --text: #2A2420; --muted: #65594f; --brand: #b44719; }
      @media (prefers-color-scheme: dark) { :root { --bg: #1D1916; --surface: #28231F; --border: #51463c; --text: #F0E9DD; --muted: #c6b8a8; --brand: #F0A560; } }
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
