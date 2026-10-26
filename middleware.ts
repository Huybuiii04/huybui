import { next } from '@vercel/functions'
import { pageByPath } from './src/agent/content.ts'
import { renderNotAcceptableHtml, renderNotFoundHtml } from './src/agent/html.ts'
import { renderMarkdown, renderNotFoundMarkdown } from './src/agent/markdown.ts'
import { mergeVary, negotiateRepresentation } from './src/agent/negotiation.ts'
import { matchPath } from './src/agent/routes.ts'

// Chỉ chạy cho request cần xử lý logic; file tĩnh trong /assets và file public đi thẳng tới CDN.
// Nhờ vậy một file thiếu trong /assets trả 404 thật của Vercel chứ không phải HTML của SPA.
export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!assets/|favicon\\.svg|donate-qr\\.png|og-image\\.png|robots\\.txt|sitemap\\.xml|llms\\.txt).*)'],
}

// Đuôi file của tài nguyên kỹ thuật: thiếu file thì trả 404 HTML, không bao giờ Markdown,
// để tài nguyên thiếu không bị thương lượng nội dung thành tài liệu khác.
const technicalExtensions = [
  '.json',
  '.xml',
  '.txt',
  '.css',
  '.js',
  '.mjs',
  '.map',
  '.png',
  '.svg',
  '.ico',
  '.webmanifest',
]

// Dự án không phát hành API công khai, nên mọi /api/* đều trả lỗi JSON có cấu trúc.
const apiErrorBody = {
  error: {
    code: 'unknown_endpoint',
    message: 'No API endpoint is published at this path.',
    hint: 'Use the website navigation for app features. This project does not currently offer a public REST API.',
    status: 404,
  },
}

// Giải mã percent-encoding an toàn: một chuỗi escape hỏng không được làm hỏng
// request. Kết quả chỉ dùng để hiển thị và để so khớp đuôi file, không dùng để
// dựng đường dẫn hệ thống file hay để tạo redirect.
function decodePath(path: string) {
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

// Đuôi file phải được nhận ra từ đường dẫn đã giải mã, nếu không
// "/missing%2Ejson" sẽ lọt qua và bị thương lượng thành Markdown.
function isTechnicalPath(path: string) {
  const candidates = [path, decodePath(path)]
  return candidates.some(candidate =>
    technicalExtensions.some(extension => candidate.toLowerCase().endsWith(extension)),
  )
}

// Đường dẫn trong body phải là đường dẫn người dùng thật sự gõ nên được giải mã
// percent-encoding, rồi bỏ ký tự điều khiển để không phá vỡ HTML/Markdown.
function safePath(path: string) {
  return decodePath(path).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 200)
}

// Mọi response do middleware tạo đều phụ thuộc Accept nên phải có Vary: Accept.
// mergeVary giữ lại mọi giá trị Vary đã có thay vì ghi đè.
function varyAccept(current?: string | null) {
  return mergeVary(current ?? null, 'Accept')
}

function respond(body: string, status: number, contentType: string, request: Request) {
  return new Response(request.method === 'HEAD' ? null : body, {
    status,
    headers: {
      'content-type': contentType,
      vary: varyAccept(),
      'cache-control': 'public, max-age=0, must-revalidate',
      'x-content-type-options': 'nosniff',
    },
  })
}

function notFoundHtml(request: Request, path: string) {
  return respond(renderNotFoundHtml(safePath(path)), 404, 'text/html; charset=utf-8', request)
}

function notFoundMarkdown(request: Request, path: string) {
  return respond(renderNotFoundMarkdown(safePath(path)), 404, 'text/markdown; charset=utf-8', request)
}

function notAcceptable(request: Request) {
  return respond(renderNotAcceptableHtml(), 406, 'text/html; charset=utf-8', request)
}

export default function middleware(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Không có endpoint công khai nào: /api/* luôn trả 404 JSON.
  if (path === '/api' || path.startsWith('/api/')) {
    return respond(JSON.stringify(apiErrorBody), 404, 'application/json; charset=utf-8', request)
  }

  if (!matchPath(path)) {
    // Tài nguyên kỹ thuật thiếu: luôn trả 404 HTML, không thương lượng sang Markdown.
    if (isTechnicalPath(path)) return notFoundHtml(request, path)
    const negotiation = negotiateRepresentation(request.headers.get('accept'))
    if (negotiation.kind === 'not-acceptable') return notAcceptable(request)
    if (negotiation.kind === 'markdown') return notFoundMarkdown(request, path)
    return notFoundHtml(request, path)
  }

  const page = pageByPath(path)
  if (page) {
    const negotiation = negotiateRepresentation(request.headers.get('accept'))
    if (negotiation.kind === 'not-acceptable') return notAcceptable(request)
    if (negotiation.kind === 'markdown') {
      return respond(renderMarkdown(page, 1), 200, 'text/markdown; charset=utf-8', request)
    }
  }

  return next({ headers: { Vary: varyAccept() } })
}
