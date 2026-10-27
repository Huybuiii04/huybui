// Bảng route duy nhất của dự án: middleware, vercel.json và test cùng dùng file này.
export type RouteKind = 'spa' | 'static' | 'api'
export type RouteMatch = { kind: RouteKind; id: string }

// /about, /contact và /privacy KHÔNG phải route React: chúng được phục vụ bằng file
// HTML tĩnh qua rewrite của Vercel (vercel.json) và middleware chỉ dùng danh sách này
// để biết URL đó hợp lệ. Xoá chúng khỏi đây sẽ khiến ba trang này trả 404.
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
  '/app/reading',
  '/app/reading/result/:attemptId',
  '/app/reading/:slug',
  '/admin',
  '/about',
  '/contact',
  '/privacy',
] as const

// Chỉ liệt kê file public thật sự tồn tại trong thư mục public/.
export const staticFiles = [
  '/favicon.svg',
  '/donate-qr.png',
  '/og-image.png',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
] as const

// Link tới tài nguyên public thật: một danh sách duy nhất dùng chung cho bản
// Markdown và bản HTML để hai bản không lệch nhau.
export const publicLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Sitemap', href: '/sitemap.xml' },
  { label: 'llms.txt', href: '/llms.txt' },
] as const

// Không có API public: backend chưa phát hành endpoint nào cho bên thứ ba.
export const apiRoutes = [] as const

// Các trang có bản Markdown để agent đọc được.
export const markdownPageIds = ['home', 'about', 'contact', 'privacy'] as const

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
