import { next } from '@vercel/functions'
import { pageByPath } from './src/agent/content.ts'
import { renderNotFoundHtml } from './src/agent/html.ts'
import { renderMarkdown, renderNotFoundMarkdown } from './src/agent/markdown.ts'
import { buildMcpManifest } from './src/agent/mcp.ts'
import { matchPath } from './src/agent/routes.ts'

// Chỉ chạy cho request cần xử lý logic; file tĩnh trong /assets và file public đi thẳng tới CDN.
export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!assets/|favicon\\.svg|donate-qr\\.png|og-image\\.png|robots\\.txt|sitemap\\.xml|llms\\.txt|openapi\\.json|manifest\\.webmanifest).*)'],
}

function wantsMarkdown(request: Request) {
  return (request.headers.get('accept') ?? '').includes('text/markdown')
}

function notFound(request: Request, path: string) {
  const headers = {
    vary: 'Accept',
    'cache-control': 'public, max-age=0, must-revalidate',
    'x-content-type-options': 'nosniff',
  }
  if (wantsMarkdown(request)) {
    return new Response(renderNotFoundMarkdown(path), { status: 404, headers: { ...headers, 'content-type': 'text/markdown; charset=utf-8' } })
  }
  return new Response(renderNotFoundHtml(path), { status: 404, headers: { ...headers, 'content-type': 'text/html; charset=utf-8' } })
}

export default function middleware(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname

  // API do Vercel Functions phục vụ, gồm cả lỗi JSON 404 của catch-all.
  if (path.startsWith('/api/')) return next()

  if (path === '/.well-known/mcp') {
    return Response.json(buildMcpManifest(url.origin), { headers: { 'cache-control': 'public, max-age=3600' } })
  }

  if (!matchPath(path)) return notFound(request, path)

  const page = pageByPath(path)
  if (page && wantsMarkdown(request)) {
    return new Response(renderMarkdown(page, 1), {
      status: 200,
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        vary: 'Accept',
        'cache-control': 'public, max-age=0, must-revalidate',
        'x-content-type-options': 'nosniff',
      },
    })
  }

  return next({ headers: { Vary: 'Accept' } })
}
