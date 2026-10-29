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
  | 'matching' | 'matching-heading' | 'matching-info' | 'matching-feature'
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
  /** Dữ liệu gốc của nhóm (headings, featureOptions, sectionLabels…) từ repo nguồn. */
  config: Record<string, unknown>
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

/** Định dạng số giây thành mm:ss (phủ số 0 ở đầu phần giây). */
export function formatClock(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Số câu đã trả lời (bỏ qua câu trả lời rỗng hoặc chỉ khoảng trắng). */
export function answeredCount(answers: Record<string, string>, questions: { id: string }[]): number {
  return questions.filter(question => Boolean(answers[question.id]?.trim())).length
}

/** Tỉ lệ phần trăm đã trả lời; đề rỗng thì trả 0 thay vì NaN, không vượt quá 100. */
export function progressPercent(answered: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((answered / total) * 100))
}

/** Tách nội dung đoạn văn theo dòng trống. */
export function splitParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(Boolean)
}

/**
 * Đưa option dạng "A. text" về { key, text }.
 * Chỉ coi phần đầu là nhãn khi khớp `/^[A-Za-z0-9]{1,3}\.\s+/`, còn lại dùng chữ cái fallback.
 */
export function parseOptions(raw: unknown): SkillOption[] {
  if (!Array.isArray(raw)) return []
  return raw.map((option, index) => {
    const fallbackKey = String.fromCharCode(65 + (index % 26))
    if (typeof option === 'string') {
      const label = /^[A-Za-z0-9]{1,3}\.\s+/.exec(option)
      if (label) {
        const dot = option.indexOf('.')
        return { key: option.slice(0, dot).trim(), text: option.slice(label[0].length).trim() }
      }
      return { key: fallbackKey, text: option.trim() }
    }
    if (option && typeof option === 'object') {
      const item = option as { key?: string; text?: string }
      return { key: item.key ?? fallbackKey, text: item.text ?? '' }
    }
    return { key: fallbackKey, text: String(option) }
  })
}

/**
 * Nguồn danh sách lựa chọn cho từng kiểu câu matching — tên key trong `config` của nhóm.
 * Kiểu `matching` (không rõ) thử lần lượt từng nguồn.
 */
const MATCHING_OPTION_SOURCES: Record<string, readonly string[]> = {
  'summary-completion': ['phraseOptions'],
  'sentence-ending': ['sentenceEndings'],
  'matching-heading': ['headings'],
  'matching-feature': ['featureOptions'],
  'matching-info': ['sectionLabels'],
  matching: ['headings', 'featureOptions', 'sectionLabels'],
}

/**
 * Cách đặt nhãn cho mỗi lựa chọn:
 * - `roman`: số La Mã theo thứ tự (i, ii, iii…) — matching-heading yêu cầu "write the correct number, i–xi".
 * - `letter`: chữ cái theo thứ tự (A, B, C…) — matching-feature yêu cầu "match with the correct option, A–C".
 * - `own`: chính chuỗi có sẵn trong danh sách — matching-info đã là chữ cái A, B, C…
 */
type MatchingLabelStyle = 'roman' | 'letter' | 'own'

const MATCHING_LABEL_STYLE: Record<string, MatchingLabelStyle | undefined> = {
  phraseOptions: 'letter',
  sentenceEndings: 'letter',
  headings: 'roman',
  featureOptions: 'letter',
  sectionLabels: 'own',
}

/** Nhãn La Mã theo vị trí (0 → i, 1 → ii…). */
const ROMAN_LABELS = [
  '', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix',
  'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx',
]

function romanLabel(index: number): string {
  return ROMAN_LABELS[index + 1] ?? String.fromCharCode(65 + index)
}

function letterLabel(index: number): string {
  return String.fromCharCode(65 + (index % 26))
}

/**
 * Đọc một mảng lựa chọn thô trong `config` thành `SkillOption[]`.
 * Bỏ qua phần tử rỗng; phần tử dạng đối tượng `{ key, text }` dùng nguyên trạng.
 */
function optionsFromConfig(value: unknown, style: MatchingLabelStyle): SkillOption[] {
  if (!Array.isArray(value)) return []
  const options: SkillOption[] = []
  for (const entry of value) {
    if (typeof entry === 'string') {
      const raw = entry.trim()
      if (!raw) continue
      const index = options.length
      if (style === 'own') {
        // Danh sách đã là chữ cái sẵn có ("A", "B"…); lỡ không phải thì lấy theo thứ tự.
        options.push({ key: /^[A-Za-z]$/.test(raw) ? raw : letterLabel(index), text: raw })
        continue
      }
      const label = style === 'roman' ? romanLabel(index) : letterLabel(index)
      // Bỏ tiền tố "A. " khi nó trùng nhãn, khỏi hiện "A. A. nội dung".
      const text = raw.startsWith(`${label}. `) ? raw.slice(label.length + 2).trim() : raw
      options.push({ key: label, text })
      continue
    }
    if (entry && typeof entry === 'object') {
      const item = entry as { key?: unknown; text?: unknown }
      const key = typeof item.key === 'string' ? item.key.trim() : ''
      const text = typeof item.text === 'string' ? item.text.trim() : ''
      if (!key && !text) continue
      options.push({ key: key || text, text: text || key })
    }
  }
  return options
}

/**
 * Dải chữ cái nêu trong hướng dẫn của nhóm: "Choose the correct letter, A-I".
 * Chấp nhận cả gạch ngang, gạch en và gạch em.
 */
const LETTER_RANGE_PATTERN = /letter,?\s*([A-Za-z])\s*[–—-]\s*([A-Za-z])/i

/**
 * Sinh lựa chọn chữ cái từ dải nêu trong hướng dẫn của nhóm.
 * Một số nhóm matching không có danh sách lựa chọn trong config,
 * nhưng hướng dẫn vẫn nói rõ "choose the correct letter, A-I".
 */
function letterRangeOptions(instructionHtml: string): SkillOption[] {
  const text = (instructionHtml ?? '').replace(/<[^>]+>/g, ' ')
  const match = LETTER_RANGE_PATTERN.exec(text)
  if (!match) return []
  const start = match[1].toUpperCase().charCodeAt(0) - 65
  const end = match[2].toUpperCase().charCodeAt(0) - 65
  if (start < 0 || end < start || end - start > 25) return []
  const options: SkillOption[] = []
  for (let index = start; index <= end; index += 1) {
    const letter = String.fromCharCode(65 + index)
    options.push({ key: letter, text: letter })
  }
  return options
}

/**
 * Danh sách lựa chọn cho câu matching, lấy từ config của nhóm.
 * Nhiều câu matching trong dữ liệu gốc không mang options riêng —
 * danh sách nằm ở config của nhóm theo đúng kiểu câu hỏi.
 *
 * `key` là nhãn thí sinh ghi ra (La Mã cho matching-heading, chữ cái cho
 * matching-feature, chữ cái sẵn có cho matching-info) nên đáp án gửi lên
 * khớp với `answer_key` mà server dùng để chấm.
 *
 * Khi config không có danh sách nào dùng được, dải chữ cái trong hướng dẫn
 * của nhóm là nguồn cuối cùng.
 */
export function matchingOptionsFor(group: SkillQuestionGroup): SkillOption[] {
  const sources = MATCHING_OPTION_SOURCES[group.displayType]
  if (!sources) return []
  const config = group.config ?? {}
  for (const source of sources) {
    const options = optionsFromConfig(config[source], MATCHING_LABEL_STYLE[source] ?? 'own')
    if (options.length) return options
  }
  return letterRangeOptions(group.instructionHtml)
}

/**
 * Có phải nhóm matching không — câu hỏi của nhóm này chọn trong danh sách
 * (La Mã cho matching-heading, chữ cái cho matching-feature/matching-info).
 *
 * Dùng `displayType` chứ không dùng `type` của câu: nhiều câu trong nhóm
 * matching bị ghi nhầm kiểu `fill` nên sẽ rơi về ô nhập chữ thay vì danh sách.
 */
export function isMatchingDisplayType(displayType: SkillDisplayType): boolean {
  return displayType === 'summary-completion'
    || displayType === 'sentence-ending'
    || displayType === 'matching-heading'
    || displayType === 'matching-info'
    || displayType === 'matching-feature'
    || displayType === 'matching'
}

/** Số từ tiếng Anh nói số đáp án cần chọn. */
const ANSWER_COUNT_WORDS: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
}

/**
 * Số đáp án cần chọn, đọc từ đề bài: "Choose TWO correct answers",
 * "Which TWO are mentioned by the writer?", "Choose THREE …".
 *
 * Chỉ nhận số từ đứng ngay sau `choose`/`which` — "Choose NO MORE THAN THREE
 * WORDS" là giới hạn số từ, không phải số đáp án nên không được nhận nhầm.
 */
const ANSWER_COUNT_PATTERN = /\b(?:choose|which)\s+(two|three|four|five|six|seven)\b/i

/** Bóc số đáp án khỏi một đoạn text (bỏ thẻ HTML trước). */
function detectAnswerCount(text: string): number {
  const match = ANSWER_COUNT_PATTERN.exec((text ?? '').replace(/<[^>]+>/g, ' '))
  if (!match) return 0
  return ANSWER_COUNT_WORDS[match[1].toLowerCase()] ?? 0
}

/**
 * Số đáp án của một câu hỏi nhiều đáp án (0 = câu chỉ chọn một đáp án).
 *
 * Nhóm Cambridge nói số đáp án ở hướng dẫn nhóm ("Choose TWO correct answers,
 * A–E") hoặc ở đề bài của câu ("Which TWO are mentioned by the writer?"),
 * nên đề bài được ưu tiên, hướng dẫn nhóm là phương án dự phòng.
 */
export function multiAnswerCount(prompt: string, instructionHtml: string): number {
  return detectAnswerCount(prompt) || detectAnswerCount(instructionHtml)
}

/**
 * Số đáp án của cả nhóm: hướng dẫn nhóm trước, sau đó tới đề bài các câu MCQ.
 *
 * Nhóm `multiple-choice-2` luôn có hướng dẫn kiểu "Choose TWO correct answers",
 * nhưng vài nhóm chỉ nói số đáp án ở đề bài của một câu ("Which TWO are
 * mentioned by the writer?") — câu anh em trong nhóm phải mượn số đó.
 */
export function groupAnswerCount(group: SkillQuestionGroup): number {
  const fromInstruction = detectAnswerCount(group.instructionHtml)
  if (fromInstruction) return fromInstruction
  return group.questions.reduce((most, question) => {
    if (question.type !== 'mcq') return most
    return Math.max(most, detectAnswerCount(question.prompt))
  }, 0)
}

/**
 * Đề bài của câu bị mất (chỉ còn "Question 12" hoặc rỗng) — câu đó phải mượn
 * số đáp án của nhóm, không thể tự suy ra từ đề bài rỗng.
 */
export function isPlaceholderPrompt(prompt: string): boolean {
  const text = (prompt ?? '').trim()
  if (!text) return true
  return /^question\s*\d+$/i.test(text)
}

/**
 * Đề chỉ tải được đủ câu thì mới nộp được.
 *
 * Server chấm theo số thứ tự câu (1..N) nên nếu thiếu câu, mọi đáp án sẽ bị
 * gán nhầm câu mà vẫn được chấm điểm.
 */
export function hasCompleteQuestionSet(questionCount: number, loadedCount: number): boolean {
  if (questionCount <= 0) return true
  return loadedCount === questionCount
}

/** Chuẩn hoá 11 kiểu câu hỏi của repo nguồn về 5 kiểu của app. */
export function normalizeQuestionType(raw?: string | null): SkillQuestionType {
  const type = (raw ?? '').toLowerCase()
  if (type === 'tfng' || type === 't_f_ng') return 'tfng'
  if (type === 'ynng' || type === 'yes-no' || type === 'yes_no') return 'ynng'
  if (type === 'multiple-choice' || type === 'multiple_choice') return 'mcq'
  if (type.startsWith('matching')) return 'matching'
  return 'fill'
}

/**
 * Mọi kiểu hiển thị hợp lệ — khai báo dạng `Record` để TypeScript bắt buộc bổ sung
 * khi `SkillDisplayType` có thêm giá trị mới.
 */
const DISPLAY_TYPES: Record<SkillDisplayType, true> = {
  tfng: true,
  ynng: true,
  'multiple-choice': true,
  'multiple-choice-2': true,
  matching: true,
  'matching-heading': true,
  'matching-info': true,
  'matching-feature': true,
  'fill-blank': true,
  'note-completion': true,
  'table-completion': true,
  'summary-completion': true,
  'sentence-completion': true,
  'sentence-ending': true,
}

/** Chuẩn hoá `displayType`; giá trị lạ thì coi như fill-blank. */
export function normalizeDisplayType(raw?: string | null): SkillDisplayType {
  const type = (raw ?? '').toLowerCase()
  if (Object.hasOwn(DISPLAY_TYPES, type)) return type as SkillDisplayType
  return 'fill-blank'
}

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'sup', 'sub',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4',
  'table', 'thead', 'tbody', 'tr', 'td', 'th', 'caption',
  'span', 'div', 'a', 'img', 'figure', 'figcaption',
])

/**
 * Thuộc tính được giữ lại khi lọc HTML — mọi thuộc tính khác bị bỏ.
 * `class` cố ý không có trong danh sách: class của repo nguồn trùng tên với
 * utility class của Tailwind trong app này, giữ lại sẽ cho nội dung tự định vị.
 */
const SAFE_ATTRIBUTES = new Set([
  'href', 'src', 'alt', 'title', 'style',
  'colspan', 'rowspan', 'width', 'height', 'lang', 'dir',
])

/** Entity HTML có tên cần giải mã khi kiểm tra scheme URL. */
const NAMED_ENTITIES: Record<string, string | undefined> = {
  '&colon;': ':',
  '&tab;': '\t',
  '&newline;': '\n',
}

/**
 * Giải mã entity dùng để lách scheme độc.
 * Chỉ giải mã entity số và ba entity có tên ở trên — không phải bộ giải mã HTML đầy đủ.
 * Dấu `;` ở entity số là tuỳ chọn vì trình duyệt cũng vậy (`&#106avascript:` vẫn ra `javascript:`),
 * còn entity có tên thì bắt buộc có `;`.
 */
function decodeObfuscatingEntities(value: string): string {
  const fromCodePoint = (code: number): string => {
    if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return ''
    return String.fromCodePoint(code)
  }
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, code: string) => fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);?/g, (_, code: string) => fromCodePoint(parseInt(code, 10)))
    .replace(/&(colon|tab|newline);/gi, (_, name: string) => NAMED_ENTITIES[`&${name.toLowerCase()};`] ?? '')
}

/**
 * Chuẩn hoá giá trị trước khi kiểm tra scheme: giải mã entity, bỏ ký tự điều khiển
 * và khoảng trắng, viết thường — để chặn `java\nscript:`, `&#106;avascript:` và ` JaVaScRiPt: `.
 */
function normalizeForSchemeCheck(value: string): string {
  return decodeObfuscatingEntities(value).replace(/[\u0000-\u0020]/g, '').toLowerCase()
}

/**
 * Kiểm tra URL có an toàn để đặt trong `href`/`src` hay không.
 */
function isSafeUrl(value: string): boolean {
  const normalized = normalizeForSchemeCheck(value)
  if (normalized.startsWith('javascript:')) return false
  if (normalized.startsWith('vbscript:')) return false
  if (normalized.startsWith('data:')) return false
  return true
}

/**
 * Kiểm tra giá trị `style` trước khi giữ lại.
 * Đề dùng `style` cho định dạng bảng nên chỉ loại bỏ giá trị nguy hiểm, phần còn lại giữ nguyên:
 * - không có dấu `\` (CSS escape như `\75 rl(...)` đều là kẻ lách),
 * - không có `expression`, `javascript:` hay `url`,
 * - không khai báo `position` là `absolute`, `fixed` hoặc `sticky` (tránh tràn khung).
 *
 * Comment CSS phải bị bỏ TRƯỚC khi kiểm tra: trình duyệt bỏ comment nên một
 * comment chen giữa `position:` và `absolute` vẫn được tính là `position:absolute`.
 */
function isSafeStyle(value: string): boolean {
  // Bỏ comment CSS: trình duyệt bỏ comment nên một comment chen giữa
  // `position:` và `absolute` vẫn bị tính là position tuyệt đối.
  const withoutComments = value.replace(/\/\*[\s\S]*?\*\//g, '')
  // Bỏ khoảng trắng quanh dấu ':' để "position : absolute" không lọt.
  const normalized = withoutComments.replace(/\s*:\s*/g, ':')
  const compact = normalizeForSchemeCheck(normalized)
  if (compact.includes('\\')) return false
  if (compact.includes('expression')) return false
  if (compact.includes('javascript:')) return false
  if (compact.includes('url')) return false
  // "background-position" KHÔNG phải khai báo position — cần ranh giới trước tên.
  const position = /(^|[^-\w])position:([-\w]+)/g
  let match = position.exec(compact)
  while (match) {
    const declaration = match[2]
    if (declaration !== 'relative' && declaration !== 'static') return false
    match = position.exec(compact)
  }
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
  // Bỏ comment HTML kèm nội dung, kể cả comment chưa đóng.
  clean = clean.replace(/<!--[\s\S]*?-->/g, '')
  clean = clean.replace(/<!--[\s\S]*$/g, '')
  // Bỏ cả khối script/style/iframe/object/embed; thẻ chưa đóng thì bỏ tới cuối chuỗi.
  clean = clean.replace(/<\s*(script|style|iframe|object|embed)\b[\s\S]*?(?:<\s*\/\s*\1\s*>|$)/gi, '')
  // Chỉ giữ thẻ an toàn, kèm thuộc tính an toàn và URL an toàn.
  // Nhánh thứ hai bắt thẻ HỎNG (dấu nháy không đóng) và BỎ HẲN — nếu chỉ escape
  // '<' thì phần còn lại của thẻ lọt ra thành chữ hiển thị ("onerror=alert(1)").
  clean = clean.replace(/<\/?([a-zA-Z0-9]+)((?:"[^"]*"|'[^']*'|[^'">])*)>|<\/?[a-zA-Z][^<>]*>?|</g, (match, tag: string | undefined, rawAttributes: string | undefined) => {
    if (tag === undefined) return match === '<' ? '&lt;' : ''
    const name = tag.toLowerCase()
    if (!ALLOWED_TAGS.has(name)) return ''
    if (match.startsWith('</')) return `</${name}>`
    const kept: string[] = []
    for (const attribute of parseAttributes(rawAttributes ?? '')) {
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
  | { kind: 'blank'; sourceNumber: number }

/**
 * Tách HTML thành các đoạn, chỗ trống có số (số + từ 4 ký tự gạch/dấu chấm trở lên,
 * ví dụ "2____" hoặc "3……..") thành segment riêng
 * để React chèn ô nhập nội tuyến — không dùng dangerouslySetInnerHTML cho phần có ô nhập.
 */
export function splitHtmlByBlanks(html: string): HtmlSegment[] {
  const segments: HtmlSegment[] = []
  const pattern = /(?<!\d)(\d{1,3})\s*[._…]{4,}/g
  let lastIndex = 0
  let match = pattern.exec(html)
  while (match) {
    if (match.index > lastIndex) segments.push({ kind: 'html', html: html.slice(lastIndex, match.index) })
    segments.push({ kind: 'blank', sourceNumber: Number(match[1]) })
    lastIndex = match.index + match[0].length
    match = pattern.exec(html)
  }
  if (lastIndex < html.length) segments.push({ kind: 'html', html: html.slice(lastIndex) })
  return segments.length ? segments : [{ kind: 'html', html }]
}

/**
 * Tách tiêu đề nhóm câu hỏi ("Questions 27-30") ra khỏi phần hướng dẫn.
 *
 * Dữ liệu gốc viết tiêu đề ở đầu hướng dẫn, dạng `<p><strong>Questions 1–6</strong></p>`
 * hoặc `<h3>Questions 14–17</h3>`. Giao diện hiển thị tiêu đề này thành một dòng
 * riêng nên phần hướng dẫn còn lại phải tách ra.
 */
export function splitGroupHeading(instructionHtml: string): { heading: string; body: string } {
  if (!instructionHtml) return { heading: '', body: '' }
  const match = instructionHtml.match(
    /^\s*<(p|h2|h3|h4)>\s*(?:<strong>)?\s*(Questions?[^<]*?)\s*(?:<\/strong>)?\s*<\/\1>/i,
  )
  if (!match || match.index === undefined) return { heading: '', body: instructionHtml }
  return {
    heading: match[2].trim(),
    body: instructionHtml.slice(match.index + match[0].length),
  }
}

/** Bỏ thẻ HTML và gộp khoảng trắng, dùng để hiện một dòng tóm tắt. */
export function htmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
