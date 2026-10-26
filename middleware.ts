import { next } from '@vercel/functions'
import { pageByPath } from './src/agent/content.ts'
import { renderNotAcceptableHtml, renderNotFoundHtml } from './src/agent/html.ts'
import { renderMarkdown, renderNotFoundMarkdown } from './src/agent/markdown.ts'
import { mergeVary, negotiateRepresentation } from './src/agent/negotiation.ts'
import { matchPath, staticFiles } from './src/agent/routes.ts'

// File do Vite build (thư mục /assets) và các file tĩnh trong public/ được Vercel
// phục vụ trực tiếp nên phải nằm ngoài matcher: middleware chỉ xử lý logic.
// Danh sách file tĩnh lấy từ routes.ts để không lệch với bảng route.
const assetPrefix = 'assets/'
const staticFilePatterns = staticFiles.map(file =>
  file.replace(/^\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
)

export const config = {
  runtime: 'nodejs',
  matcher: [`/((?!${[assetPrefix, ...staticFilePatterns].join('|')}).*)`],
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

// Đường dẫn chuẩn hoá: bỏ dấu gạch ngang cuối, giữ nguyên "/" để "/about/" và
// "/about" không khác nhau.
function normalizePath(path: string) {
  if (path.length <= 1) return '/'
  return path.replace(/\/+$/, '') || '/'
}

// Giải mã percent-encoding an toàn: một chuỗi escape hỏng không được làm hỏng
// request.
function decodePath(path: string) {
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

// Đường dẫn có thể bị mã hoá nhiều lớp ("%252E" -> "%2E" -> "."), nên giải mã lặp
// lại với giới hạn nhỏ để nhận ra đuôi file thật. Kết quả chỉ dùng để so khớp
// đuôi file và hiển thị trong body, không dùng để dựng đường dẫn hệ thống file
// hay để tạo redirect.
function decodePathLayers(path: string, rounds = 3) {
  let current = path
  for (let round = 0; round < rounds; round += 1) {
    const decoded = decodePath(current)
    if (decoded === current) break
    current = decoded
  }
  return current
}

function isTechnicalPath(path: string) {
  return technicalExtensions.some(extension => path.toLowerCase().endsWith(extension))
}

// Bỏ ký tự điều khiển khỏi đường dẫn trước khi đưa vào body để không phá vỡ HTML/Markdown.
function safePath(path: string) {
  return path.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 200)
}

// Response thay đổi theo Accept thì cần Vary: Accept. Vercel gộp header trả về
// qua next({ headers }), nên ở đây chỉ đặt giá trị này; mergeVary vẫn được export
// cho caller đã có sẵn giá trị Vary cần giữ lại.
function varyAccept() {
  return mergeVary(null, 'Accept')
}

type ResponseOptions = { vary?: boolean }

function respond(body: string, status: number, contentType: string, request: Request, options: ResponseOptions = {}) {
  const headers: Record<string, string> = {
    'content-type': contentType,
    'cache-control': 'public, max-age=0, must-revalidate',
    'x-content-type-options': 'nosniff',
  }
  // Chỉ response thực sự đổi theo Accept mới cần Vary, còn lại không để cache
  // bị phân mảnh theo từng giá trị Accept.
  if (options.vary !== false) headers.vary = varyAccept()
  return new Response(request.method === 'HEAD' ? null : body, { status, headers })
}

function notFoundHtml(request: Request, path: string, options: ResponseOptions = {}) {
  return respond(renderNotFoundHtml(safePath(path)), 404, 'text/html; charset=utf-8', request, options)
}

function notFoundMarkdown(request: Request, path: string) {
  return respond(renderNotFoundMarkdown(safePath(path)), 404, 'text/markdown; charset=utf-8', request)
}

function notAcceptable(request: Request) {
  return respond(renderNotAcceptableHtml(), 406, 'text/html; charset=utf-8', request)
}

export default function middleware(request: Request) {
  const url = new URL(request.url)
  // Đường dẫn được chuẩn hoá một lần rồi dùng cho mọi quyết định, để "/about/" và
  // "/about" cho cùng kết quả.
  const path = normalizePath(url.pathname)
  const decodedPath = normalizePath(decodePathLayers(path))

  // File tĩnh trong public/ và file build trong /assets do Vercel phục vụ trực tiếp.
  if (path.startsWith(`/${assetPrefix}`) || (staticFiles as readonly string[]).includes(path)) {
    return next()
  }

  // Không có endpoint công khai nào: /api/* luôn trả 404 JSON.
  if (path === '/api' || path.startsWith('/api/')) {
    return respond(JSON.stringify(apiErrorBody), 404, 'application/json; charset=utf-8', request, { vary: false })
  }

  if (!matchPath(path)) {
    // Tài nguyên kỹ thuật thiếu: luôn trả 404 HTML, không thương lượng sang Markdown.
    if (isTechnicalPath(decodedPath)) return notFoundHtml(request, decodedPath, { vary: false })
    const negotiation = negotiateRepresentation(request.headers.get('accept'))
    if (negotiation.kind === 'not-acceptable') return notAcceptable(request)
    if (negotiation.kind === 'markdown') return notFoundMarkdown(request, decodedPath)
    return notFoundHtml(request, decodedPath)
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
