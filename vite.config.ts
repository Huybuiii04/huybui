import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { pageById } from './src/agent/content.ts'
import { buildHeadTags, buildJsonLd, htmlLang } from './src/agent/site.ts'
import { renderLandingHtml, renderStaticHtml } from './src/agent/html.ts'
import { defaultTheme, themeBootstrapScript } from './src/agent/theme.ts'

// Mỗi trang công khai là một entry HTML riêng: build ra file tĩnh có sẵn nội dung,
// title/canonical/og và JSON-LD để crawler đọc được không cần JavaScript.
// Landing dùng bản HTML tĩnh song ngữ; ba trust page là tài liệu độc lập, không
// boot React nên không bị route wildcard của app thay thế.
const pageEntries = [
  { input: 'index.html', pageId: 'home' },
  { input: 'pages/about.html', pageId: 'about' },
  { input: 'pages/contact.html', pageId: 'contact' },
  { input: 'pages/privacy.html', pageId: 'privacy' },
]

function agentPages(): Plugin {
  return {
    name: 'agent-pages',
    transformIndexHtml(html, context) {
      const entry = pageEntries.find(item => context.path?.endsWith(item.input))
      if (!entry) return html
      const page = pageById(entry.pageId)
      if (!page) return html
      const head = buildHeadTags({ path: page.path, title: page.title[1], description: page.summary[1] })
      const jsonLd = JSON.stringify(buildJsonLd()).replace(/</g, '\\u003c')
      // Mọi trang đều nhận cùng một bootstrap theme: các trang tĩnh không boot
      // React nên không chạy src/theme.ts, mà vẫn phải dùng đúng theme của app.
      let output = html.replace(/<html([^>]*)>/, (_match, attributes: string) => {
        const rest = attributes.replace(/\slang="[^"]*"/, '').replace(/\sdata-theme="[^"]*"/, '')
        return `<html lang="${htmlLang}"${rest} data-theme="${defaultTheme}">`
      })
      output = output.replace(/<title>[\s\S]*?<\/title>/, head.match(/<title>[\s\S]*?<\/title>/)![0])
      output = output.replace(
        '</head>',
        `    <script>${themeBootstrapScript()}</script>\n    ${head.replace(/<title>[\s\S]*?<\/title>\s*/, '')}\n    <script type="application/ld+json">${jsonLd}</script>\n  </head>`,
      )
      const body = entry.pageId === 'home' ? renderLandingHtml() : renderStaticHtml(page)
      output = output.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
      return output
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), agentPages()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pageEntries.map(entry => [entry.pageId, entry.input])),
    },
  },
})
