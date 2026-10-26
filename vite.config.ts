import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { pageById } from './src/agent/content.ts'
import { buildHeadTags, buildJsonLd, htmlLang } from './src/agent/site.ts'
import { renderStaticHtml } from './src/agent/html.ts'

// Mỗi trang công khai là một entry HTML riêng: build ra file tĩnh có sẵn nội dung,
// title/canonical/og và JSON-LD để crawler đọc được không cần JavaScript.
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
      let output = html.replace(/<html[^>]*lang="[^"]*"/, `<html lang="${htmlLang}"`)
      output = output.replace(/<title>[\s\S]*?<\/title>/, head.match(/<title>[\s\S]*?<\/title>/)![0])
      output = output.replace('</head>', `    ${head.replace(/<title>[\s\S]*?<\/title>\s*/, '')}\n    <script type="application/ld+json">${jsonLd}</script>\n  </head>`)
      output = output.replace(
        '<div id="root"></div>',
        `<div id="root"></div>\n    <div id="agent-static" class="agent-static">${renderStaticHtml(page)}</div>`,
      )
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
