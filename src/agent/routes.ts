// Bảng route duy nhất của dự án: middleware, vercel.json và test cùng dùng file này.
export type RouteKind = 'spa' | 'static' | 'api'
export type RouteMatch = { kind: RouteKind; id: string }

export const spaRoutes = [
  '/',
  '/auth',
  '/auth/callback',
  '/auth/reset-password',
  '/donate',
  '/app',
  '/app/write',
  '/app/prompts',
  '/app/essays',
  '/app/essays/:id',
  '/app/vocabulary',
  '/app/review',
  '/app/errors',
  '/app/settings',
  '/admin',
  '/about',
  '/contact',
  '/privacy',
  '/developers',
  '/docs',
] as const

export const staticFiles = [
  '/favicon.svg',
  '/donate-qr.png',
  '/og-image.png',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/openapi.json',
  '/manifest.webmanifest',
] as const

export const apiRoutes = [
  '/api/health',
  '/api/prompts',
  '/api/prompts/:slug',
  '/api/library',
  '/api/mcp',
] as const

// Các trang có bản Markdown để agent đọc được.
export const markdownPageIds = ['home', 'about', 'contact', 'privacy', 'developers', 'docs'] as const

function matchPattern(path: string, pattern: string) {
  if (pattern === path) return pattern
  if (!pattern.includes(':')) return null
  const pathParts = path.split('/')
  const patternParts = pattern.split('/')
  if (pathParts.length !== patternParts.length) return null
  for (let index = 0; index < patternParts.length; index += 1) {
    const expected = patternParts[index]
    const actual = pathParts[index]
    if (expected.startsWith(':')) {
      if (!actual) return null
      continue
    }
    if (expected !== actual) return null
  }
  return pattern
}

export function matchPath(path: string): RouteMatch | null {
  if (!path.startsWith('/')) return null
  const clean = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
  for (const file of staticFiles) if (matchPattern(clean, file)) return { kind: 'static', id: file }
  for (const route of apiRoutes) if (matchPattern(clean, route)) return { kind: 'api', id: route }
  for (const route of spaRoutes) if (matchPattern(clean, route)) return { kind: 'spa', id: route }
  return null
}
