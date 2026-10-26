import type { ContentPage } from './content.ts'
import { site } from './site.ts'

// Chỉ liên kết tới tài nguyên thật sự tồn tại trên domain này.
export const agentResourceLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Sitemap', href: '/sitemap.xml' },
  { label: 'llms.txt', href: '/llms.txt' },
] as const

function escapeInline(value: string) {
  return value.replace(/([\[\]])/g, '\\$1')
}

// Đường dẫn do người dùng gõ vào phải được làm sạch trước khi nằm trong code span.
function escapeCodeSpan(value: string) {
  return value.replace(/[\r\n]+/g, ' ').replace(/`/g, '\\`')
}

export function renderMarkdown(page: ContentPage, lang: 0 | 1 = 1): string {
  const lines: string[] = [`# ${page.title[lang]}`, '', `> ${page.summary[lang]}`, '']
  for (const section of page.sections) {
    lines.push(`## ${section.heading[lang]}`, '')
    for (const paragraph of section.body) lines.push(escapeInline(paragraph[lang]), '')
    if (section.list) {
      for (const item of section.list) lines.push(`- ${escapeInline(item[lang])}`)
      lines.push('')
    }
  }
  lines.push('---', '', 'Public pages on this site:', '')
  for (const link of agentResourceLinks) lines.push(`- [${link.label}](${link.href})`)
  lines.push('', `Source: ${site.url}${page.path === '/' ? '/' : page.path}`, '')
  return lines.join('\n')
}

export function renderNotFoundMarkdown(path: string): string {
  return [
    `# 404 — Page not found`,
    '',
    `The path \`${escapeCodeSpan(path)}\` does not exist on ${site.name}. The server answered with HTTP 404 because nothing is published at this address, so there is no page to read here.`,
    '',
    'Try one of these instead:',
    '',
    ...agentResourceLinks.map(link => `- [${link.label}](${link.href})`),
    '',
    `The public pages are listed in the sitemap at ${site.url}/sitemap.xml, and ${site.url}/llms.txt is the index for agents.`,
    '',
  ].join('\n')
}
