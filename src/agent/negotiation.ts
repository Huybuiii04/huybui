// Thương lượng nội dung HTTP: chọn giữa HTML và Markdown theo Accept header.
// Module thuần tuý (không phụ thuộc runtime) nên test được độc lập.

export type Representation = 'html' | 'markdown'
export type Negotiation = { kind: Representation } | { kind: 'not-acceptable' }

type MediaRange = { type: string; quality: number; specificity: 0 | 1 | 2 }

// Mỗi representation có thể được trả về bằng nhiều media type.
const representationTypes: Record<Representation, string[]> = {
  html: ['text/html', 'application/xhtml+xml'],
  markdown: ['text/markdown'],
}

// q-value theo RFC 7231: 0, 0.xyz (tối đa 3 chữ số) hoặc 1, 1.000.
// Giá trị sai định dạng hoặc ngoài khoảng [0, 1] được coi là 0 (không chấp nhận),
// tuyệt đối không được coi là 1.
function parseQuality(raw: string | undefined): number {
  if (raw === undefined) return 1
  const value = raw.trim()
  if (!/^(0(\.\d{0,3})?|1(\.0{0,3})?)$/.test(value)) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0
}

// 0 = */*, 1 = type/*, 2 = type/subtype khớp chính xác.
function specificityOf(type: string): 0 | 1 | 2 {
  if (type === '*/*' || type === '*') return 0
  if (type.endsWith('/*')) return 1
  return 2
}

function matches(type: string, range: string): boolean {
  if (range === '*/*' || range === '*') return true
  const [rangeType, rangeSubtype] = range.split('/')
  const [typeValue] = type.split('/')
  if (rangeType === '*') return true
  if (rangeSubtype === '*') return rangeType === typeValue
  return range === type
}

function parseRanges(accept: string): MediaRange[] {
  return accept.split(',').map(part => {
    const [rawType = '', ...parameters] = part.trim().split(';')
    const type = rawType.trim().toLowerCase()
    const qParameter = parameters
      .map(parameter => parameter.trim())
      .find(parameter => /^q\s*=/i.test(parameter))
    const quality = parseQuality(qParameter?.slice(qParameter.indexOf('=') + 1))
    return { type, quality, specificity: specificityOf(type) }
  })
}

// Chất lượng của một representation lấy từ media range cụ thể nhất khớp với nó:
// một range kém cụ thể hơn (ví dụ */*) không bao giờ ghi đè range cụ thể hơn,
// nên "text/markdown;q=0, */*;q=1" vẫn loại Markdown.
function qualityFor(ranges: MediaRange[], types: string[]): number {
  const matching = ranges.filter(range => types.some(type => matches(type, range.type)))
  if (!matching.length) return 0
  const best = Math.max(...matching.map(range => range.specificity))
  return Math.max(...matching.filter(range => range.specificity === best).map(range => range.quality))
}

export function negotiateRepresentation(accept: string | null): Negotiation {
  if (!accept || !accept.trim()) return { kind: 'html' }
  const ranges = parseRanges(accept)
  const html = qualityFor(ranges, representationTypes.html)
  const markdown = qualityFor(ranges, representationTypes.markdown)
  if (html <= 0 && markdown <= 0) return { kind: 'not-acceptable' }
  // Hoà điểm ưu tiên HTML để không đổi hành vi trình duyệt.
  return markdown > html ? { kind: 'markdown' } : { kind: 'html' }
}

// Gộp giá trị Vary mới mà không bỏ mất giá trị đang có. Tên header không phân
// biệt hoa thường nên "Accept" và "accept" là một giá trị.
export function mergeVary(current: string | null | undefined, value: string): string {
  const values: string[] = []
  const seen = new Set<string>()
  const add = (item: string) => {
    const trimmed = item.trim()
    if (!trimmed) return
    const key = trimmed.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    values.push(trimmed)
  }
  for (const item of (current ?? '').split(',')) add(item)
  add(value)
  return values.join(', ')
}
