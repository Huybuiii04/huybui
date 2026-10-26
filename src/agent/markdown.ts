import type { ContentPage } from './content.ts'
import { site } from './site.ts'

export const agentResourceLinks = [
  { label: 'API documentation', href: '/docs' },
  { label: 'Developer portal', href: '/developers' },
  { label: 'OpenAPI specification', href: '/openapi.json' },
  { label: 'MCP server manifest', href: '/.well-known/mcp' },
  { label: 'Sitemap', href: '/sitemap.xml' },
  { label: 'llms.txt', href: '/llms.txt' },
]

function escapeInline(value: string) {
  return value.replace(/([\[\]])/g, '\\$1')
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
  lines.push('---', '', 'Useful resources for agents:', '')
  for (const link of agentResourceLinks) lines.push(`- [${link.label}](${link.href})`)
  lines.push('', `Source: ${site.url}${page.path === '/' ? '/' : page.path}`, '')
  return lines.join('\n')
}

export function renderNotFoundMarkdown(path: string): string {
  return [
    `# 404 — Page not found`,
    '',
    `The path \`${path}\` does not exist on ${site.name}. The server answered with HTTP 404 because nothing is published at this address, so there is no page, prompt or endpoint to read here.`,
    '',
    'Try one of these instead:',
    '',
    ...agentResourceLinks.map(link => `- [${link.label}](${link.href})`),
    '',
    `Every public endpoint is listed in the OpenAPI specification at ${site.url}/openapi.json and in the sitemap at ${site.url}/sitemap.xml.`,
    '',
  ].join('\n')
}
