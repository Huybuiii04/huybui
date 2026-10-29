/**
 * Sinh kho câu hỏi Speaking Cambridge 12–20 từ 9 file DOCX (bản OCR trong Word).
 *
 *   node scripts/build-speaking-cambridge.mjs
 *
 * - Nguồn: `IELTS_Speaking_Cambridge_12-20_Word_Pack/Theo_tung_Cambridge/*.docx`.
 *   Ghi đè đường dẫn bằng biến môi trường `SPEAKING_DOCX_DIR`.
 * - Đọc DOCX không cần dependency: tự giải nén ZIP bằng `node:zlib`.
 * - Tự sửa lỗi OCR rõ ràng; dòng còn lỗi được ghi vào báo cáo flags để sửa tay.
 * - Idempotent: chạy lại cho kết quả giống hệt.
 *
 * Xuất:
 *   supabase/seed/speaking-cambridge.json       — dữ liệu chuẩn hoá để nạp DB
 *   supabase/seed/speaking-cambridge-flags.md   — dòng còn lỗi OCR cần kiểm tra
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateRawSync } from 'node:zlib'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const OUT_JSON = join(ROOT, 'supabase/seed/speaking-cambridge.json')
const OUT_FLAGS = join(ROOT, 'supabase/seed/speaking-cambridge-flags.md')

// ----------------------------------------------------------------- DOCX / ZIP

function findEndOfCentralDirectory(buf) {
  const min = Math.max(0, buf.length - 66000)
  for (let i = buf.length - 22; i >= min; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) return i
  }
  return -1
}

/** Đọc mục lục ZIP (central directory) → Map tên file → { method, compressedSize, localOffset }. */
function readZipIndex(buf) {
  const eocd = findEndOfCentralDirectory(buf)
  if (eocd < 0) throw new Error('không phải file ZIP hợp lệ')
  const count = buf.readUInt16LE(eocd + 10)
  let offset = buf.readUInt32LE(eocd + 16)
  const entries = new Map()
  for (let i = 0; i < count; i += 1) {
    if (buf.readUInt32LE(offset) !== 0x02014b50) throw new Error('central directory hỏng')
    const method = buf.readUInt16LE(offset + 10)
    const compressedSize = buf.readUInt32LE(offset + 20)
    const nameLen = buf.readUInt16LE(offset + 28)
    const extraLen = buf.readUInt16LE(offset + 30)
    const commentLen = buf.readUInt16LE(offset + 32)
    const localOffset = buf.readUInt32LE(offset + 42)
    const name = buf.toString('utf8', offset + 46, offset + 46 + nameLen)
    entries.set(name, { method, compressedSize, localOffset })
    offset += 46 + nameLen + extraLen + commentLen
  }
  return entries
}

/** Trả về nội dung (Buffer) của 1 entry trong ZIP. */
function readZipEntry(buf, index, name) {
  const entry = index.get(name)
  if (!entry) throw new Error(`thiếu ${name} trong DOCX`)
  const lo = entry.localOffset
  if (buf.readUInt32LE(lo) !== 0x04034b50) throw new Error('local header hỏng')
  const nameLen = buf.readUInt16LE(lo + 26)
  const extraLen = buf.readUInt16LE(lo + 28)
  const start = lo + 30 + nameLen + extraLen
  const raw = buf.subarray(start, start + entry.compressedSize)
  return entry.method === 0 ? Buffer.from(raw) : inflateRawSync(raw)
}

const XML_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

function decodeXml(value) {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (match, entity) => {
    if (entity[0] === '#') {
      const code = entity[1] === 'x' || entity[1] === 'X'
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    return XML_ENTITIES[entity] ?? match
  })
}

/** Chuẩn hoá style id của Word: "Heading1" → "heading1". */
function normalizeStyle(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/** Tách `word/document.xml` thành các đoạn văn { style, text }. */
function extractParagraphs(xml) {
  const paragraphs = []
  const pattern = /<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>|<w:p(?:\s[^>]*)?\/>/g
  let match = pattern.exec(xml)
  while (match !== null) {
    const body = match[1] ?? ''
    const styleMatch = /<w:pStyle\s+w:val="([^"]*)"/.exec(body)
    const style = normalizeStyle(styleMatch ? styleMatch[1] : '')
    const pieces = []
    const textPattern = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|(<w:br\s*\/>)|(<w:tab\s*\/>)/g
    let piece = textPattern.exec(body)
    while (piece !== null) {
      if (piece[1] !== undefined) pieces.push(decodeXml(piece[1]))
      else pieces.push(' ')
      piece = textPattern.exec(body)
    }
    paragraphs.push({ style, text: pieces.join('') })
    match = pattern.exec(xml)
  }
  return paragraphs
}

// ------------------------------------------------------------- làm sạch OCR

const BULLETS = '•»▪‣●·*+~«¢»'
const DASHES = '–—'

const FLAG_RULES = [
  { id: 'dot', test: (t) => /[·•»«]/.test(t) },
  { id: 'hyphen-word', test: (t) => /[A-Za-z]-[a-z]{1,2}\b/.test(t) },
  { id: 'stray-letter', test: (t) => /\s[a-z]$/.test(t) },
  { id: 'double-punct', test: (t) => /[?!.,]{2,}/.test(t) && !/e\.g\.,/.test(t) },
  { id: 'long-word', test: (t) => /[A-Za-z]{35,}/.test(t) },
  { id: 'unbalanced', test: (t) => (t.match(/\(/g) ?? []).length !== (t.match(/\)/g) ?? []).length },
  { id: 'unbalanced-bracket', test: (t) => (t.match(/\[/g) ?? []).length !== (t.match(/\]/g) ?? []).length },
  { id: 'page-number', test: (t) => /\s\d{1,3}$/.test(t) },
]

/** Từ hay bị OCR dính dấu phẩy — dùng để gộp lại thành một từ. */
const JOINED_WORDS = new Set([
  'important', 'opportunity', 'experience', 'information', 'environment', 'interesting',
  'communication', 'equipment', 'achievement', 'immediately', 'definitely', 'usually',
  'especially', 'completely', 'technology', 'development', 'government', 'professional',
  'responsibility', 'independent', 'favourite', 'comfortable', 'recommend', 'prefer',
  'organisation', 'celebration', 'announcement', 'decision', 'permission', 'experiment',
  'difference', 'intelligence', 'performance', 'successful', 'university', 'advertising',
  'sightseeing', 'photograph', 'encourage', 'memorable', 'temporary', 'available',
])

/** Bỏ watermark OCR ("gg com/touisquangvo", "ep com/LouisQuangvo"). */
function stripWatermark(text) {
  return text.replace(/\b[a-z]{2,}\s+com\/[a-z0-9_]+/gi, '').replace(/\s{2,}/g, ' ').trim()
}

/** Bỏ bullet đầu dòng ("• ", "» ", "- ", "— "). */
function stripBullet(text) {
  return text.replace(new RegExp(`^\\s*[${BULLETS}${DASHES}*+~.]+\\s*`), '')
}

/** Bỏ ký tự rác OCR ở đầu câu ("e What did you…" → "What did you…"). */
function stripStrayLetter(text) {
  return text.replace(/^[a-z]\s+(?=[A-Z])/, '')
}

/** Bỏ số thứ tự đầu dòng ("1. ", "2) ", "'3. ", "4, "). */
function stripNumbering(text) {
  return text.replace(/^\s*['"‘’]?\d{1,2}\s*[.,;)]?\s+(?=\S)/, '').replace(/^\s*['"‘’]?\d{1,2}\s*[.)]\s*/, '')
}

/**
 * Sửa dấu câu dính trong từ do OCR:
 *   "im,portant" → "important" · "have,a healthier" → "have a healthier"
 *   "h:ome" → "home" · "Th·e" → "The"
 */
function fixInnerPunctuation(text) {
  return text
    .replace(/([A-Za-z]),([A-Za-z]+)/g, (match, left, right) => {
      const joined = `${left}${right}`.toLowerCase()
      return JOINED_WORDS.has(joined) ? joined : `${left} ${right}`
    })
    .replace(/([A-Za-z]):([A-Za-z]{2,})/g, '$1$2')
    .replace(new RegExp(`([A-Za-z])[${BULLETS}]([A-Za-z])`, 'g'), '$1$2')
    .replace(new RegExp(`\\s*[${BULLETS}]\\s*`, 'g'), ' ')
}

/** Chuẩn hoá khoảng trắng, dấu nháy và khoảng trắng quanh dấu câu. */
function tidy(text) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    // Khoảng trắng bị chèn trong dạng rút gọn ("it' s" → "it's").
    .replace(/'\s+(s|t|re|ve|ll|d|m)\b/g, "'$1")
    .replace(/\s+'(s|t|re|ve|ll|d|m)\b/g, "'$1")
    // Ký tự rời bị OCR dính cuối câu ("...balance? z") → bỏ.
    .replace(/\s+[a-z](?=\s*$)/, '')
    // Số trang bị OCR dính cuối câu ("...companies? 95") → bỏ.
    .replace(/\s+\d{1,3}$/, '')
    .trim()
}

/** Làm sạch một dòng; trả về { text, flags }. */
function cleanLine(raw) {
  let text = stripWatermark(raw)
  text = stripBullet(text)
  text = stripNumbering(text)
  text = stripStrayLetter(text)
  text = fixInnerPunctuation(text)
  text = tidy(text)
  const flags = FLAG_RULES.filter((rule) => rule.test(text)).map((rule) => rule.id)
  return { text, flags }
}

/** Dòng bỏ qua hoàn toàn (intro của Part 1, watermark, marker). */
function isNoiseLine(text) {
  const lower = text.toLowerCase()
  if (!text) return true
  if (lower.startsWith('please answer')) return true
  if (lower.startsWith('the examiner asks')) return true
  if (lower.includes('familiar topics')) return true
  if (/^(topics|familiar topics|example|discussion topics|example questions|you should say)\.?$/.test(lower)) {
    return true
  }
  if (/^[a-z]{1,2}$/.test(text)) return true
  return false
}

/** Dòng câu hỏi bị cắt dòng: dòng trước chưa kết thúc câu, dòng sau bắt đầu bằng chữ thường. */
function needsMerge(current, next) {
  if (!current || !next) return false
  // Nhãn "[Why?/Why not?]" bị OCR tách thành nhiều dòng → nối vào câu trước.
  if (/^\[/.test(next)) return true
  if ((current.match(/\[/g) ?? []).length > (current.match(/\]/g) ?? []).length) return true
  if (/[?!.\]"']$/.test(current)) return false
  if (current.length < 24) return false
  return /^[a-z]/.test(next)
}

/** Gộp các dòng bị cắt giữa câu trong một danh sách câu hỏi. */
function mergeWrapped(lines) {
  const merged = []
  for (const line of lines) {
    const previous = merged[merged.length - 1]
    if (previous && needsMerge(previous.text, line.text)) {
      previous.text = tidy(`${previous.text} ${line.text}`)
      previous.flags = [...new Set([...previous.flags, ...line.flags])]
      continue
    }
    merged.push({ ...line })
  }
  return merged
}

/** Câu hỏi hay nhãn chủ đề? */
function looksLikeQuestion(text) {
  return text.includes('?')
}

// ------------------------------------------------------------------ parsing

/** Tách cue card: prompt + bullet + mệnh đề "and explain ...". */
function parseCueCard(lines) {
  const cleaned = lines.map((line) => cleanLine(line)).filter((line) => line.text)
  const sayIndex = cleaned.findIndex((line) => /^you should say:?$/i.test(line.text))
  const flags = cleaned.flatMap((line) => line.flags)
  if (sayIndex < 0) {
    const describe = cleaned.find((line) => /^describe\b/i.test(line.text))
    return { prompt: describe ? describe.text : (cleaned[0]?.text ?? ''), bullets: [], explain: '', flags }
  }
  const head = cleaned.slice(0, sayIndex)
  const describe = head.find((line) => /^describe\b/i.test(line.text))
  const prompt = describe ? describe.text : (head[0]?.text ?? '')
  const tail = cleaned.slice(sayIndex + 1)
  const explainIndex = tail.findIndex((line) => /^and explain/i.test(line.text))
  const bulletLines = explainIndex >= 0 ? tail.slice(0, explainIndex) : tail
  const bullets = bulletLines.map((line) => line.text).filter((line) => !/^and explain/i.test(line))
  const explain = explainIndex >= 0 ? tail.slice(explainIndex).map((line) => line.text).join(' ') : ''
  return { prompt, bullets, explain: explain.replace(/^and explain\s+/i, ''), flags }
}

/** Tên chủ đề: bỏ dấu chấm cuối và khoảng trắng thừa. */
function topicName(text) {
  return String(text ?? '').replace(/[.\s]+$/, '').trim()
}

/** Tên chủ đề của cue card: bỏ "Describe ", bỏ dấu chấm cuối. */
function cueCardTopic(prompt) {
  const stripped = prompt.replace(/^describe\s+/i, '').replace(/\s*\[.*$/, '').trim()
  const withoutPeriod = stripped.replace(/[.\s]+$/, '')
  if (!withoutPeriod) return 'Speaking Part 2'
  return withoutPeriod.charAt(0).toUpperCase() + withoutPeriod.slice(1)
}

/** Part 1: Cambridge 12–19 có "EXAMPLE" + tên topic; Cambridge 20 không có tên topic. */
function parsePart1(lines) {
  const cleaned = lines.map((line) => cleanLine(line)).filter((line) => line.text)
  let topic = ''
  const content = []
  let expectTopic = false
  for (const line of cleaned) {
    const text = line.text
    if (/^example$/i.test(text)) {
      expectTopic = true
      continue
    }
    if (isNoiseLine(text)) continue
    if (expectTopic) {
      topic = text
      expectTopic = false
      continue
    }
    content.push(line)
  }
  const merged = mergeWrapped(content)
  const questions = merged.map((line) => line.text).filter(Boolean)
  const flags = merged.flatMap((line) => line.flags)
  if (!topic) topic = 'Speaking Part 1'
  return { topic: topicName(topic), questions, flags }
}

/**
 * Part 3: Cambridge 12–19 có 2 chủ đề (tên + "Example questions:" + 3 câu);
 * Cambridge 20 không có tên chủ đề → tách 6 câu thành 2 nhóm 3 câu.
 */
function parsePart3(lines) {
  const cleaned = lines.map((line) => cleanLine(line)).filter((line) => line.text)
  const flags = cleaned.flatMap((line) => line.flags)
  const sequence = []
  for (const line of cleaned) {
    const text = line.text
    if (/^example questions:?$/i.test(text)) {
      sequence.push({ ...line, marker: true })
      continue
    }
    if (isNoiseLine(text)) continue
    sequence.push(line)
  }
  const merged = []
  for (const line of sequence) {
    // Marker "Example questions:" là ranh giới nhóm — không gộp qua marker.
    if (line.marker) {
      merged.push({ ...line })
      continue
    }
    const previous = merged[merged.length - 1]
    if (previous && !previous.marker && needsMerge(previous.text, line.text)) {
      previous.text = tidy(`${previous.text} ${line.text}`)
      previous.flags = [...new Set([...previous.flags, ...line.flags])]
      continue
    }
    merged.push({ ...line })
  }
  const groups = []
  let pendingTopic = ''
  let current = null
  for (const line of merged) {
    if (line.marker) {
      current = { topic: pendingTopic, questions: [] }
      pendingTopic = ''
      groups.push(current)
      continue
    }
    if (looksLikeQuestion(line.text)) {
      if (!current) {
        current = { topic: pendingTopic, questions: [] }
        pendingTopic = ''
        groups.push(current)
      }
      current.questions.push(line.text)
      continue
    }
    pendingTopic = line.text
  }
  // Cambridge 20: 1 nhóm 6 câu → tách thành 2 nhóm 3 câu.
  if (groups.length === 1 && groups[0].questions.length >= 6) {
    const questions = groups[0].questions
    const half = Math.ceil(questions.length / 2)
    groups.length = 0
    groups.push({ topic: 'Discussion topic 1', questions: questions.slice(0, half) })
    groups.push({ topic: 'Discussion topic 2', questions: questions.slice(half) })
  }
  return { groups, flags }
}

/** Parse toàn bộ 1 file DOCX → danh sách test. */
function parseDocx(filePath) {
  const buf = readFileSync(filePath)
  const index = readZipIndex(buf)
  const xml = readZipEntry(buf, index, 'word/document.xml').toString('utf8')
  const paragraphs = extractParagraphs(xml)

  let book = null
  let part = null
  const tests = []

  for (const paragraph of paragraphs) {
    const text = paragraph.text.trim()
    if (paragraph.style === 'heading1') {
      const digits = /(\d{2})/.exec(text)
      if (digits) book = Number(digits[1])
      continue
    }
    if (paragraph.style === 'heading2') {
      const digits = /(\d+)/.exec(text)
      if (book !== null && digits) {
        tests.push({ book, test: Number(digits[1]), source: '', part1: [], part2: [], part3: [] })
      }
      continue
    }
    if (paragraph.style === 'sourceline') {
      const last = tests[tests.length - 1]
      if (last) last.source = text.replace(/^Nguồn:\s*/i, '').replace(/\s+/g, ' ').trim()
      continue
    }
    if (paragraph.style === 'heading3') {
      if (/part\s*1/i.test(text)) part = 'part1'
      else if (/part\s*2/i.test(text)) part = 'part2'
      else if (/part\s*3/i.test(text)) part = 'part3'
      else part = null
      continue
    }
    if (book === null || !part) continue
    const last = tests[tests.length - 1]
    if (!last) continue
    last[part].push(text)
  }

  return tests
}

/** Chuyển test đã parse thành các dòng DB. */
function toRows(entry, flags) {
  const { book, test, source } = entry
  const base = `cambridge-${book}-test-${test}`
  const rows = []

  const part1 = parsePart1(entry.part1)
  part1.flags.forEach((flag) => flags.push({ book, test, part: 'part-1', flag }))
  rows.push({
    part: 'part-1',
    slug: `${base}-part-1`,
    topic: part1.topic,
    prompt_text: part1.questions[0] ?? part1.topic,
    questions: part1.questions,
    cue_card: null,
    related_part3_slug: null,
    book_number: book,
    test_number: test,
    sub_index: 0,
    source_label: source,
  })

  const part2 = parseCueCard(entry.part2)
  part2.flags.forEach((flag) => flags.push({ book, test, part: 'part-2', flag }))
  rows.push({
    part: 'part-2',
    slug: `${base}-part-2`,
    topic: cueCardTopic(part2.prompt),
    prompt_text: part2.prompt,
    questions: [],
    cue_card: {
      topic: cueCardTopic(part2.prompt),
      bullets: part2.bullets,
      explain: part2.explain,
      time_limit_seconds: 120,
    },
    related_part3_slug: `${base}-part-3-t1`,
    book_number: book,
    test_number: test,
    sub_index: 0,
    source_label: source,
  })

  const part3 = parsePart3(entry.part3)
  part3.flags.forEach((flag) => flags.push({ book, test, part: 'part-3', flag }))
  part3.groups.forEach((group, index) => {
    rows.push({
      part: 'part-3',
      slug: `${base}-part-3-t${index + 1}`,
      topic: topicName(group.topic) || `Discussion topic ${index + 1}`,
      prompt_text: group.questions[0] ?? group.topic ?? '',
      questions: group.questions,
      cue_card: null,
      related_part3_slug: null,
      book_number: book,
      test_number: test,
      sub_index: index,
      source_label: source,
    })
  })

  return rows
}

// ---------------------------------------------------------- sửa thủ công

/**
 * Bảng sửa thủ công cho những câu OCR hỏng nặng (không đoán được bằng quy tắc).
 * Khoá là `slug` của dòng trong `speaking_questions`.
 */
const MANUAL_FIXES = {
  'cambridge-12-test-6-part-1': {
    questions: [
      'Did you enjoy singing when you were younger? [Why?/Why not?]',
      'How often do you sing now? [Why?]',
      'Do you have a favourite song you like to listen to? [Why?/Why not?]',
      'How important is singing in your culture? [Why?]',
    ],
  },
  'cambridge-12-test-6-part-3-t1': {
    questions: [
      'What are the most popular types of films in your country?',
      'What is the difference between watching a film in the cinema and watching a film at home?',
      'Do you think cinemas will close in the future?',
    ],
  },
  'cambridge-12-test-6-part-3-t2': {
    questions: [
      'How important is the theatre in your country\'s history?',
      'How strong a tradition is it today in your country to go to the theatre?',
      'Do you think the theatre should be run as a business or as a public service?',
    ],
  },
  'cambridge-12-test-7-part-3-t1': {
    questions: [
      'Why do some parents give their children money to spend each week?',
      'Do you agree that schools should teach children how to manage money?',
      'Do you think it is a good idea for students to earn money while studying?',
    ],
  },
  'cambridge-12-test-5-part-1': {
    questions: [
      'Is it important to you to eat healthy food? [Why?/Why not?]',
      'If you catch a cold, what do you do to help you feel better? [Why?]',
      'Do you pay attention to public information about health? [Why?/Why not?]',
      'What could you do to have a healthier lifestyle?',
    ],
  },
  'cambridge-14-test-1-part-3-t2': {
    questions: [
      'How popular are electronic books in your country?',
      'What are the advantages of parents reading electronic books (compared to printed books)?',
      'Will electronic books ever completely replace printed books in the future?',
    ],
  },
  'cambridge-15-test-4-part-1': {
    questions: [
      'How often do you wear jewellery? [Why?/Why not?]',
      'What type of jewellery do you like best? [Why?/Why not?]',
      'When do people like to give jewellery in your country? [Why?]',
      'Have you ever given jewellery to someone as a gift? [Why?/Why not?]',
    ],
  },
  'cambridge-18-test-2-part-3-t1': {
    questions: [
      'What are the most popular museums and art galleries in the area where you live?',
      'Do you believe that all museums and art galleries should be free?',
      'What kinds of things make a museum or art gallery an interesting place to visit?',
    ],
  },
  'cambridge-18-test-4-part-1': {
    questions: [
      'How many hours do you usually sleep at night?',
      'Do you sometimes sleep during the day? [Why/Why not?]',
      'What do you do if you can\'t get to sleep at night? [Why?/Why not?]',
      'Do you ever remember the dreams you\'ve had while you were asleep?',
    ],
  },
  'cambridge-19-test-2-part-1': {
    questions: [
      'Have you travelled a lot by plane? [To where?/Why not?]',
      'Why do you think some people enjoy travelling by plane?',
      'Would you like to live near an airport? [Why/Why not?]',
      'In the future, do you think that you will travel by plane more often? [Why/Why not?]',
    ],
  },
}

/** Áp dụng MANUAL_FIXES cho 1 dòng. */
function applyManualFix(row) {
  const fix = MANUAL_FIXES[row.slug]
  if (!fix) return
  if (fix.topic) row.topic = fix.topic
  if (fix.questions) {
    row.questions = fix.questions
    row.prompt_text = fix.questions[0] ?? row.prompt_text
  }
  if (fix.cue && row.cue_card) {
    row.cue_card = { ...row.cue_card, ...fix.cue }
    if (fix.cue.topic) row.topic = fix.cue.topic
  }
}

// ------------------------------------------------------------------- main

function resolveDocxDir() {
  const fromEnv = process.env.SPEAKING_DOCX_DIR
  if (fromEnv && existsSync(fromEnv)) return resolve(fromEnv)
  const oneDrive = join(homedir(), 'OneDrive')
  if (!existsSync(oneDrive)) throw new Error('không tìm thấy thư mục OneDrive')
  const candidates = []
  for (const entry of readdirSync(oneDrive, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const candidate = join(oneDrive, entry.name, 'IELTS_Speaking_Cambridge_12-20_Word_Pack', 'Theo_tung_Cambridge')
    if (existsSync(candidate)) candidates.push(candidate)
  }
  if (!candidates.length) throw new Error('không tìm thấy thư mục nguồn; đặt SPEAKING_DOCX_DIR')
  return candidates[0]
}

function main() {
  const dir = resolveDocxDir()
  const files = readdirSync(dir)
    .filter((name) => /^Cambridge_\d+_Speaking_OCR_Word\.docx$/i.test(name))
    .sort((a, b) => {
      const numA = Number(/Cambridge_(\d+)/i.exec(a)?.[1] ?? 0)
      const numB = Number(/Cambridge_(\d+)/i.exec(b)?.[1] ?? 0)
      return numA - numB
    })
  if (!files.length) throw new Error(`không có file DOCX trong ${dir}`)

  const rows = []
  const flags = []
  for (const file of files) {
    for (const entry of parseDocx(join(dir, file))) rows.push(...toRows(entry, flags))
  }
  for (const row of rows) applyManualFix(row)

  const payload = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: 'Cambridge IELTS 12–20 Speaking (OCR Word pack)',
    rows,
  }
  writeFileSync(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  // Báo cáo: chỉ liệt kê câu/bullet còn lỗi, kèm nhãn lỗi.
  const flagged = []
  for (const row of rows) {
    const items = [
      ...row.questions.map((text) => ({ kind: 'question', text })),
      ...(row.cue_card
        ? row.cue_card.bullets.map((text) => ({ kind: 'bullet', text }))
        : []),
    ]
    for (const item of items) {
      const hits = FLAG_RULES.filter((rule) => rule.test(item.text)).map((rule) => rule.id)
      if (hits.length) {
        flagged.push({ book: row.book_number, test: row.test_number, part: row.part, sub: row.sub_index, hits, text: item.text })
      }
    }
  }

  const flagLines = [
    '# Báo cáo lỗi OCR — Speaking Cambridge 12–20',
    '',
    `Sinh tự động: ${payload.generatedAt}`,
    '',
    'Những dòng dưới đây vẫn còn dấu hiệu lỗi OCR. Nội dung đã nạp vào DB nguyên trạng —',
    'muốn sửa thì thêm vào `MANUAL_FIXES` trong `scripts/build-speaking-cambridge.mjs` rồi chạy lại.',
    '',
  ]
  const books = [...new Set(rows.map((row) => row.book_number))].sort((a, b) => a - b)
  for (const book of books) {
    flagLines.push(`## Cambridge ${book}`, '')
    const bookFlags = flagged.filter((flag) => flag.book === book)
    if (!bookFlags.length) {
      flagLines.push('- Không phát hiện lỗi rõ ràng.', '')
      continue
    }
    for (const flag of bookFlags) {
      flagLines.push(`- Test ${flag.test} · ${flag.part}${flag.part === 'part-3' ? ` (chủ đề ${flag.sub + 1})` : ''} · \`${flag.hits.join('`, `')}\``)
      flagLines.push(`  - ${flag.text}`)
    }
    flagLines.push('')
  }
  writeFileSync(OUT_FLAGS, `${flagLines.join('\n')}\n`, 'utf8')

  const byBook = new Map()
  for (const row of rows) {
    const key = `Cambridge ${row.book_number}`
    byBook.set(key, (byBook.get(key) ?? 0) + 1)
  }
  console.log(`Doc ${files.length} file DOCX tu ${dir}`)
  console.log(`Sinh ${rows.length} dong cau hoi:`)
  for (const [key, count] of byBook) console.log(`  ${key}: ${count}`)
  console.log(`Bao cao OCR: ${OUT_FLAGS}`)
}

main()
