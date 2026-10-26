// Metadata dùng chung cho head tags, JSON-LD, sitemap, llms.txt và manifest MCP.
export const site = {
  name: 'IELTS Writing Studio',
  url: 'https://huybui.vercel.app',
  description:
    'IELTS Writing Studio is a free practice space for IELTS Writing Task 1 and Task 2: ready-made prompts, AI grading with band feedback, a personal vocabulary and a review loop that keeps your progress visible.',
  locale: 'en',
  repository: 'https://github.com/Huybuiii04/huybui',
  contact: {
    email: 'buidinhanhhuy@gmail.com',
    phone: '',
    contactType: 'customer support',
    availableLanguage: ['vi', 'en'],
  },
  address: {
    streetAddress: 'Ho Chi Minh City',
    addressLocality: 'Ho Chi Minh',
    addressRegion: 'Ho Chi Minh',
    postalCode: '700000',
    addressCountry: 'VN',
  },
} as const

export const ogImage = `${site.url}/og-image.png`

export function canonicalUrl(path: string) {
  if (path === '/' || path === '') return `${site.url}/`
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`
}

export function buildJsonLd(): Record<string, unknown> {
  const contactPoint: Record<string, unknown> = {
    '@type': 'ContactPoint',
    contactType: site.contact.contactType,
    email: site.contact.email,
    availableLanguage: [...site.contact.availableLanguage],
  }
  if (site.contact.phone) contactPoint.telephone = site.contact.phone
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
        browserRequirements: 'Requires JavaScript for the interactive writing studio.',
        inLanguage: ['en', 'vi'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND', availability: 'https://schema.org/InStock' },
        author: { '@id': `${site.url}/#organization` },
        publisher: { '@id': `${site.url}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${site.url}/#organization`,
        name: site.name,
        alternateName: 'IELTS Studio',
        url: `${site.url}/`,
        description: site.description,
        logo: `${site.url}/favicon.svg`,
        image: ogImage,
        email: site.contact.email,
        sameAs: [site.repository],
        contactPoint: [contactPoint],
        address: { '@type': 'PostalAddress', ...site.address },
      },
    ],
  }
}

export const htmlLang = 'en'

export function buildHeadTags(input: { path: string; title: string; description: string }) {
  const url = canonicalUrl(input.path)
  const fullTitle = input.title.includes(site.name) ? input.title : `${input.title} — ${site.name}`
  return [
    `<title>${fullTitle}</title>`,
    `<meta name="description" content="${input.description}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${site.name}">`,
    `<meta property="og:title" content="${fullTitle}">`,
    `<meta property="og:description" content="${input.description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${ogImage}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta property="og:locale:alternate" content="vi_VN">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${fullTitle}">`,
    `<meta name="twitter:description" content="${input.description}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
  ].join('\n    ')
}
