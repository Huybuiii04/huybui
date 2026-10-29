// Plugin Vite dựng nội dung tĩnh cho từng trang công khai: chèn head tags,
// bootstrap theme, script chuyển ngôn ngữ và markup của trang. Thiếu marker
// HTML thì build phải dừng lại, không được ship một trang rỗng.
import type { Plugin } from 'vite'
import { pageById } from './content.ts'
import { buildHeadTags, buildJsonLd, htmlLang } from './site.ts'
import { renderLandingHtml, renderStaticHtml } from './html.ts'
import { defaultTheme, themeBootstrapScript } from './theme.ts'
import { renderLanguageScript } from './language.ts'

// Mỗi trang công khai là một entry HTML riêng: build ra file tĩnh có sẵn nội dung,
// title/canonical/og và JSON-LD để crawler đọc được không cần JavaScript.
// Landing dùng bản HTML tĩnh song ngữ; ba trust page là tài liệu độc lập, không
// boot React nên không bị route wildcard của app thay thế.
export const pageEntries = [
  { input: 'index.html', pageId: 'home' },
  { input: 'pages/about.html', pageId: 'about' },
  { input: 'pages/contact.html', pageId: 'contact' },
  { input: 'pages/privacy.html', pageId: 'privacy' },
]

// Marker #root: chấp nhận cả `<div id="root"></div>` lẫn biến thể có thuộc tính
// hoặc khoảng trắng bên trong.
const rootMarker = /<div id="root"[^>]*>\s*<\/div>/

export function agentPages(): Plugin {
  return {
    name: 'agent-pages',
    // Match public URLs locally too, including production-preview verification.
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url && /^\/(about|contact|privacy)(?:\?|$)/.test(request.url)) request.url = request.url.replace(/^\/(about|contact|privacy)/, '/pages/$1.html')
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url && /^\/(about|contact|privacy)(?:\?|$)/.test(request.url)) request.url = request.url.replace(/^\/(about|contact|privacy)/, '/pages/$1.html')
        next()
      })
    },
    transformIndexHtml(html, context) {
      const entry = pageEntries.find(item => context.path?.endsWith(item.input))
      if (!entry) return html
      const page = pageById(entry.pageId)
      if (!page) return html
      const isLanding = entry.pageId === 'home'
      const head = buildHeadTags({ path: page.path, title: page.title[1], description: page.summary[1] })
      const jsonLd = JSON.stringify(buildJsonLd()).replace(/</g, '\\u003c')
      // Mọi trang đều nhận cùng một bootstrap theme: các trang tĩnh không boot
      // React nên không chạy src/theme.ts, mà vẫn phải dùng đúng theme của app.
      let output = html.replace(/<html([^>]*)>/, (_match, attributes: string) => {
        const rest = attributes.replace(/\slang="[^"]*"/, '').replace(/\sdata-theme="[^"]*"/, '')
        return `<html lang="${htmlLang}"${rest} data-theme="${defaultTheme}">`
      })
      output = output.replace(/<title>[\s\S]*?<\/title>/, head.match(/<title>[\s\S]*?<\/title>/)![0])
      if (!output.includes('</head>')) {
        throw new Error(`[agent-pages] ${entry.input}: không tìm thấy </head> để chèn head tags.`)
      }
      const scripts = `<script>${themeBootstrapScript()}</script>\n    <script>${renderLanguageScript()}</script>\n    `
      output = output.replace(
        '</head>',
        `    ${scripts}${head.replace(/<title>[\s\S]*?<\/title>\s*/, '')}\n    <script type="application/ld+json">${jsonLd}</script>\n  </head>`,
      )
      if (!rootMarker.test(output)) {
        throw new Error(`[agent-pages] ${entry.input}: không tìm thấy <div id="root"></div> để chèn nội dung tĩnh.`)
      }
      const body = isLanding ? renderLandingHtml() : renderStaticHtml(page)
      output = output.replace(rootMarker, `<div id="root">${body}</div>`)
      return output
    },
  }
}
