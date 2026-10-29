// Metadata dùng chung cho head tags, JSON-LD, sitemap và llms.txt.
import { escapeHtml } from './html.ts'

export const site = {
  name: 'IELTS Studio',
  url: 'https://huybui.vercel.app',
  description:
    'IELTS Studio is a free practice space for Reading, Writing, band feedback, personal vocabulary and review. Listening and Speaking are in development.',
} as const

export const ogImage = `${site.url}/og-image.png`

export function canonicalUrl(path: string) {
  if (path === '/' || path === '') return `${site.url}/`
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`
}

// JSON-LD chỉ mô tả đúng những gì đã kiểm chứng: ứng dụng web, không suy đoán
// tổ chức, địa chỉ, giá hay người xuất bản.
export function buildJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${site.url}/#app`,
        name: site.name,
        description: site.description,
        url: `${site.url}/`,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        browserRequirements: 'The public pages are readable without JavaScript; the interactive writing studio needs JavaScript.',
        inLanguage: ['en', 'vi'],
      },
    ],
  }
}

export const htmlLang = 'en'

export function buildHeadTags(input: { path: string; title: string; description: string }) {
  const url = canonicalUrl(input.path)
  const rawTitle = input.title.includes(site.name) ? input.title : `${input.title} — ${site.name}`
  const title = escapeHtml(rawTitle)
  const description = escapeHtml(input.description)
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escapeHtml(site.name)}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${ogImage}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta property="og:locale:alternate" content="vi_VN">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
    `<link rel="icon" href="/favicon.png" type="image/png">`,
  ].join('\n    ')
}
