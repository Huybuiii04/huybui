// Kiểu dữ liệu và helper thuần cho module Reading.
//
// KHÔNG có logic chấm điểm ở đây. Việc chấm nằm ở Edge Function `grade-skill`
// (supabase/functions/_shared/skillGrading.ts) để đáp án không bao giờ tới trình duyệt.

export type SkillKind = 'reading' | 'listening'

/** Dạng câu hỏi sau khi chuẩn hoá — dùng để chọn cách hiển thị ô trả lời. */
export type SkillQuestionType = 'tfng' | 'ynng' | 'mcq' | 'matching' | 'fill'

/** Kiểu câu hỏi gốc trong dữ liệu của repo nguồn (11 biến thể). */
export type SourceQuestionType =
  | 'tfng' | 'T_F_NG' | 'ynng' | 'yes-no'
  | 'multiple-choice' | 'matching' | 'matching-info' | 'matching-feature' | 'MATCHING_HEADING'
  | 'fill-blank' | 'gap-filling'

/**
 * Cách hiển thị nhóm câu hỏi.
 * `completion-*` và `sentence-ending` có chỗ trống nằm trong HTML nên cần ô nhập nội tuyến.
 */
export type SkillDisplayType =
  | 'tfng' | 'ynng'
  | 'multiple-choice' | 'multiple-choice-2'
  | 'matching-heading' | 'matching-info' | 'matching-feature'
  | 'fill-blank'
  | 'note-completion' | 'table-completion' | 'summary-completion' | 'sentence-completion' | 'sentence-ending'

export type SkillOption = { key: string; text: string }

export type SkillQuestion = {
  id: string
  order: number
  /** Số câu trong đề gốc — dùng để ánh xạ chỗ trống "31_______" trong HTML. */
  sourceNumber: number
  type: SkillQuestionType
  displayType: SkillDisplayType
  prompt: string
  questionHtml: string
  options: SkillOption[]
  explanation: string
}

export type SkillQuestionGroup = {
  id: string
  order: number
  instructionHtml: string
  displayType: SkillDisplayType
  questions: SkillQuestion[]
}

export type SkillSection = {
  id: string
  sectionNo: number
  title: string
  topic: string
  contentHtml: string
  audioPath: string
  hasTranscript: boolean
  groups: SkillQuestionGroup[]
}

export type SkillTest = {
  id: string
  slug: string
  skill: SkillKind
  series: string
  seriesNo: number
  title: string
  description: string
  level: string
  durationMinutes: number
  testType: 'academic' | 'general'
  questionCount: number
  sections: SkillSection[]
}

export type SkillAttempt = {
  id: string
  skill: SkillKind
  testId: string
  correctCount: number
  totalCount: number
  band: number | null
  createdAt: string
}

/** Định dạng số giây thành mm:ss (phủ số 0 ở đầu phần giây). */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Số câu đã trả lời (bỏ qua câu trả lời rỗng hoặc chỉ khoảng trắng). */
export function answeredCount(answers: Record<string, string>, questions: { id: string }[]): number {
  return questions.filter(question => Boolean(answers[question.id]?.trim())).length
}

/** Tỉ lệ phần trăm đã trả lời; đề rỗng thì trả 0 thay vì NaN. */
export function progressPercent(answered: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((answered / total) * 100)
}

/** Tách nội dung đoạn văn theo dòng trống. */
export function splitParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(Boolean)
}

/** Đưa option dạng "A. text" về { key, text }. */
export function parseOptions(raw: unknown): SkillOption[] {
  if (!Array.isArray(raw)) return []
  return raw.map((option, index) => {
    const fallbackKey = String.fromCharCode(65 + index)
    if (typeof option === 'string') {
      const dot = option.indexOf('.')
      if (dot !== -1) return { key: option.slice(0, dot).trim(), text: option.slice(dot + 1).trim() }
      return { key: fallbackKey, text: option.trim() }
    }
    if (option && typeof option === 'object') {
      const item = option as { key?: string; text?: string }
      return { key: item.key ?? fallbackKey, text: item.text ?? '' }
    }
    return { key: fallbackKey, text: String(option) }
  })
}

/** Chuẩn hoá 11 kiểu câu hỏi của repo nguồn về 5 kiểu của app. */
export function normalizeQuestionType(raw: string): SkillQuestionType {
  const type = (raw ?? '').toLowerCase()
  if (type === 'tfng' || type === 't_f_ng') return 'tfng'
  if (type === 'ynng' || type === 'yes-no' || type === 'yes_no') return 'ynng'
  if (type === 'multiple-choice' || type === 'multiple_choice') return 'mcq'
  if (type.startsWith('matching')) return 'matching'
  return 'fill'
}

/** Chuẩn hoá `displayType`; giá trị lạ thì coi như fill-blank. */
export function normalizeDisplayType(raw: string): SkillDisplayType {
  const type = (raw ?? '').toLowerCase()
  const known: SkillDisplayType[] = [
    'tfng', 'ynng', 'multiple-choice', 'multiple-choice-2',
    'matching-heading', 'matching-info', 'matching-feature', 'fill-blank',
    'note-completion', 'table-completion', 'summary-completion', 'sentence-completion', 'sentence-ending',
  ]
  return known.find(item => item === type) ?? 'fill-blank'
}

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'sup', 'sub',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4',
  'table', 'thead', 'tbody', 'tr', 'td', 'th', 'caption',
  'span', 'div', 'a', 'img', 'figure', 'figcaption',
])

/** Thuộc tính được giữ lại khi lọc HTML — mọi thuộc tính khác bị bỏ. */
const SAFE_ATTRIBUTES = new Set([
  'href', 'src', 'alt', 'title', 'class', 'style',
  'colspan', 'rowspan', 'width', 'height', 'lang', 'dir',
])

/** Entity HTML có tên cần giải mã khi kiểm tra scheme URL. */
const NAMED_ENTITIES: Record<string, string> = {
  '&colon;': ':',
  '&tab;': '\t',
  '&newline;': '\n',
}

/**
 * Giải mã entity HTML để không bị lách scheme độc
 * (ví dụ `&#106;avascript:` hay `jav&#x09;ascript:`).
 */
function decodeEntities(value: string): string {
  const fromCodePoint = (code: number): string => {
    if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return ''
    return String.fromCodePoint(code)
  }
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => fromCodePoint(parseInt(code, 10)))
    .replace(/&(colon|tab|newline);/gi, (_, name: string) => NAMED_ENTITIES[`&${name.toLowerCase()};`])
}

/**
 * Kiểm tra URL có an toàn để đặt trong `href`/`src` hay không.
 * Giải mã entity rồi bỏ ký tự điều khiển và khoảng trắng trước khi so khớp
 * để chặn cả `java\nscript:`, `&#106;avascript:` và ` JaVaScRiPt: `.
 */
function isSafeUrl(value: string): boolean {
  const normalized = decodeEntities(value).replace(/[\u0000-\u0020]/g, '').toLowerCase()
  if (normalized.startsWith('javascript:')) return false
  if (normalized.startsWith('vbscript:')) return false
  if (normalized.startsWith('data:')) return false
  return true
}

/**
 * Kiểm tra giá trị `style` trước khi giữ lại.
 * Đề dùng `style` cho định dạng bảng nên chỉ loại bỏ giá trị chứa
 * biểu thức hoặc URL độc, phần còn lại giữ nguyên.
 */
function isSafeStyle(value: string): boolean {
  const normalized = decodeEntities(value).replace(/[\u0000-\u0020]/g, '').toLowerCase()
  if (normalized.includes('expression(')) return false
  if (normalized.includes('javascript:')) return false
  if (normalized.includes('url(')) return false
  return true
}

type HtmlAttribute = { name: string; value: string }

/** Tách chuỗi thuộc tính thô thành các cặp { name, value }. */
function parseAttributes(raw: string): HtmlAttribute[] {
  const attributes: HtmlAttribute[] = []
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+)))?/g
  let match = pattern.exec(raw)
  while (match) {
    attributes.push({
      name: match[1].toLowerCase(),
      value: match[2] ?? match[3] ?? match[4] ?? '',
    })
    match = pattern.exec(raw)
  }
  return attributes
}

/**
 * Lọc HTML của đề trước khi render.
 * Nội dung đến từ seed nội bộ nhưng vẫn phải lọc: không cho script, style,
 * iframe, thuộc tính sự kiện (on*), thẻ không nằm trong `ALLOWED_TAGS`,
 * thuộc tính ngoài `SAFE_ATTRIBUTES` và URL có scheme nguy hiểm.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  let clean = html
  // Bỏ cả khối script/style/iframe/object/embed, kể cả nội dung bên trong.
  clean = clean.replace(/<\s*(script|style|iframe|object|embed)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
  clean = clean.replace(/<\s*(script|style|iframe|object|embed)\b[^>]*\/?>/gi, '')
  // Chỉ giữ thẻ an toàn, kèm thuộc tính an toàn và URL an toàn.
  clean = clean.replace(/<\/?([a-zA-Z0-9]+)((?:"[^"]*"|'[^']*'|[^'">])*)>/g, (match, tag: string, rawAttributes: string) => {
    const name = tag.toLowerCase()
    if (!ALLOWED_TAGS.has(name)) return ''
    if (match.startsWith('</')) return `</${name}>`
    const kept: string[] = []
    for (const attribute of parseAttributes(rawAttributes)) {
      if (attribute.name.startsWith('on')) continue
      if (!SAFE_ATTRIBUTES.has(attribute.name)) continue
      if ((attribute.name === 'href' || attribute.name === 'src') && !isSafeUrl(attribute.value)) continue
      if (attribute.name === 'style' && !isSafeStyle(attribute.value)) continue
      kept.push(` ${attribute.name}="${attribute.value.replace(/"/g, '&quot;')}"`)
    }
    return `<${name}${kept.join('')}>`
  })
  return clean
}

export type HtmlSegment =
  | { kind: 'html'; html: string }
  | { kind: 'blank'; questionId: number }

/**
 * Tách HTML thành các đoạn, chỗ trống có số (số + từ 4 ký tự gạch/dấu chấm trở lên,
 * ví dụ "2____" hoặc "3…….") thành segment riêng
 * để React chèn ô nhập nội tuyến — không dùng dangerouslySetInnerHTML cho phần có ô nhập.
 */
export function splitHtmlByBlanks(html: string): HtmlSegment[] {
  const segments: HtmlSegment[] = []
  const pattern = /\b(\d{1,3})\s*[._…]{4,}/g
  let lastIndex = 0
  let match = pattern.exec(html)
  while (match) {
    if (match.index > lastIndex) segments.push({ kind: 'html', html: html.slice(lastIndex, match.index) })
    segments.push({ kind: 'blank', questionId: Number(match[1]) })
    lastIndex = match.index + match[0].length
    match = pattern.exec(html)
  }
  if (lastIndex < html.length) segments.push({ kind: 'html', html: html.slice(lastIndex) })
  return segments.length ? segments : [{ kind: 'html', html }]
}
