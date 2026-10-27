// Sinh supabase/seed/skill-reading-data.json từ repo nguồn SWP391-PROJECT.
//
//   node scripts/import-source-reading.mjs <duong-dan-repo-nguon>
//
// Nguồn nội dung:
//   public/data/reading/*.json   566 file: content_html + questions[]
//   src/data/reading-data.ts     catalogue: test nào gồm passage nào
//
// Script KHÔNG chạy code của repo nguồn, chỉ import file dữ liệu của nó.
// Yêu cầu Node >= 22.6 (tự bỏ kiểu TypeScript khi import).

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const source = process.argv[2]
if (!source) {
  console.error('Thiếu đường dẫn repo nguồn. Ví dụ: node scripts/import-source-reading.mjs ../SWP391-PROJECT')
  process.exit(1)
}

const sourceRoot = resolve(source)
const readingDir = join(sourceRoot, 'public', 'data', 'reading')
const cataloguePath = join(sourceRoot, 'src', 'data', 'reading-data.ts')

if (!existsSync(readingDir) || !existsSync(cataloguePath)) {
  console.error(`Không thấy dữ liệu đọc trong ${sourceRoot}. Kiểm tra đường dẫn repo nguồn.`)
  process.exit(1)
}

let catalogue
try {
  catalogue = await import(pathToFileURL(cataloguePath).href)
} catch (error) {
  console.error('Không import được catalogue:', error)
  console.error('Cần Node >= 22.6 để bỏ kiểu TypeScript khi import.')
  process.exit(1)
}

/** Chuẩn hoá 11 kiểu câu hỏi của repo nguồn về 5 kiểu của app. */
function normalizeType(raw) {
  const type = String(raw ?? '').toLowerCase()
  if (type === 'tfng' || type === 't_f_ng') return 'tfng'
  if (type === 'ynng' || type === 'yes-no' || type === 'yes_no') return 'ynng'
  if (type === 'multiple-choice' || type === 'multiple_choice') return 'mcq'
  if (type.startsWith('matching')) return 'matching'
  return 'fill'
}

const DISPLAY_TYPES = new Set([
  'tfng', 'ynng', 'multiple-choice', 'multiple-choice-2',
  'matching-heading', 'matching-info', 'matching-feature', 'fill-blank',
  'note-completion', 'table-completion', 'summary-completion', 'sentence-completion', 'sentence-ending',
])

function normalizeDisplay(raw, fallback) {
  const type = String(raw ?? '').toLowerCase()
  if (DISPLAY_TYPES.has(type)) return type
  return fallback
}

// ── 1. Đọc catalogue: test nào gồm passage nào ───────────────────────────────
const testCatalogue = new Map()

function addTest({ id, title, level, series, seriesNo, passageIds }) {
  testCatalogue.set(id, { id, title, level, series, seriesNo, passageIds })
}

for (const test of catalogue.cambridgeTests ?? []) {
  addTest({
    id: test.id,
    title: test.title,
    level: test.level ?? '',
    series: 'Cambridge',
    seriesNo: test.book ?? 0,
    passageIds: test.passages.map((_, index) => `${test.id}-${index + 1}`),
  })
}

for (const test of catalogue.deVolTests ?? []) {
  addTest({
    id: test.id,
    title: test.title,
    level: test.level ?? '',
    series: 'TID Vol Siêu Chuẩn',
    seriesNo: test.test ?? 0,
    passageIds: test.passages.map((_, index) => `${test.id}-${index + 1}`),
  })
}

for (const test of catalogue.tidPracticeTests ?? []) {
  addTest({
    id: test.id,
    title: test.title,
    level: test.level ?? '',
    series: `TID Practice Set ${test.set ?? 0}`,
    seriesNo: test.set ?? 0,
    passageIds: test.passages.map((_, index) => `${test.id}-${index + 1}`),
  })
}

for (const unit of catalogue.essentialWordsUnits ?? []) {
  addTest({
    id: `ew-${unit.unit}`,
    title: `Essential Words · Unit ${unit.unit} — ${unit.topic ?? ''}`.trim(),
    level: 'Band 4.5-6.0',
    series: 'Essential Words for the IELTS',
    seriesNo: unit.unit ?? 0,
    passageIds: unit.passages.map(passage => passage.id),
  })
}

for (const unit of catalogue.workbookUnits ?? []) {
  addTest({
    id: `tid-wb-${unit.unit}`,
    title: `TID Workbook · Unit ${unit.unit} — ${unit.topic ?? ''}`.trim(),
    level: 'Band 5.0-7.0',
    series: 'TID Workbook',
    seriesNo: unit.unit ?? 0,
    passageIds: unit.passages.map(passage => passage.id),
  })
}

// ── 2. Đọc toàn bộ file đề ──────────────────────────────────────────────────
const passageFiles = readdirSync(readingDir).filter(name => name.endsWith('.json'))
const passages = new Map()
let skippedStubs = 0
let skippedWithoutQuestions = 0

for (const name of passageFiles) {
  const path = join(readingDir, name)
  if (statSync(path).size < 200) { skippedStubs += 1; continue }
  let json
  try { json = JSON.parse(readFileSync(path, 'utf8')) } catch { skippedStubs += 1; continue }
  const sourceId = json.youpass_id ?? name.replace(/\.json$/, '')
  const questions = Array.isArray(json.questions) ? json.questions : []
  if (!questions.length) { skippedWithoutQuestions += 1; continue }
  // Câu không có đáp án thì không chấm được: bỏ passage nào mọi câu đều thiếu đáp án.
  if (questions.every(question => !String(question.answer ?? '').trim())) { skippedWithoutQuestions += 1; continue }

  // Gom câu hỏi theo groupId; câu không có groupId thì tự thành một nhóm.
  const groups = new Map()
  for (const question of questions) {
    const groupId = question.groupId ?? question.blockId ?? `group-${sourceId}`
    if (!groups.has(groupId)) groups.set(groupId, [])
    groups.get(groupId).push(question)
  }

  const groupList = [...groups.entries()].map(([groupId, items], groupIndex) => {
    const first = items[0]
    const displayType = normalizeDisplay(first.displayType ?? first._blockConfig?.type, normalizeType(first.type))
    return {
      key: groupId,
      order: groupIndex + 1,
      instructionHtml: first.groupHtml ?? first.group_html ?? '',
      displayType,
      config: first._blockConfig ?? {},
      questions: items.map((question, questionIndex) => ({
        sourceId: String(question.id ?? ''),
        // Số câu gốc trong đề — dùng để ánh xạ chỗ trống "31_______" trong HTML.
        sourceNumber: /^\d+$/.test(String(question.id ?? '')) ? Number(question.id) : questionIndex + 1,
        order: questionIndex + 1,
        type: normalizeType(question.type),
        displayType,
        prompt: question.question ?? question.text ?? question.statement ?? '',
        questionHtml: question.questionHtml ?? question.question_html ?? '',
        options: question.options ?? [],
        answerKey: String(question.answer ?? ''),
        explanation: question.explanation ?? '',
      })),
    }
  })

  passages.set(sourceId, {
    sourceId,
    title: json.title ?? '',
    contentHtml: json.content_html ?? '',
    bandLevel: json.band_level ?? '',
    groups: groupList,
  })
}

// ── 3. Gom passage thành test ───────────────────────────────────────────────
const SERIES_FROM_PREFIX = [
  [/^cam-/, 'Cambridge'],
  [/^ew-/, 'Essential Words for the IELTS'],
  [/^tid-vol-/, 'TID Vol Siêu Chuẩn'],
  [/^tid-20-/, 'TID Practice Set 20'],
  [/^tid-wb-/, 'TID Workbook'],
  [/^IELTS_/, 'Chủ đề B1'],
]

function inferSeries(sourceId) {
  for (const [pattern, series] of SERIES_FROM_PREFIX) {
    if (pattern.test(sourceId)) return series
  }
  return 'Khác'
}

/** "cam-10-1-1" -> "cam-10-1";  "tid-wb-5-3b" -> "tid-wb-5" */
function testIdOf(sourceId) {
  const parts = sourceId.split('-')
  if (parts.length < 2) return sourceId
  return parts.slice(0, -1).join('-')
}

const tests = new Map()
for (const passage of passages.values()) {
  const testId = testIdOf(passage.sourceId)
  const catalogueEntry = testCatalogue.get(testId)
  if (!tests.has(testId)) {
    tests.set(testId, {
      id: testId,
      title: catalogueEntry?.title ?? '',
      level: catalogueEntry?.level ?? '',
      series: catalogueEntry?.series ?? inferSeries(testId),
      seriesNo: catalogueEntry?.seriesNo ?? 0,
      passages: [],
    })
  }
  tests.get(testId).passages.push(passage)
}

// Thứ tự hiển thị: theo series, rồi số, rồi tên.
const orderedTests = [...tests.values()].sort((left, right) =>
  left.series.localeCompare(right.series)
  || left.seriesNo - right.seriesNo
  || left.id.localeCompare(right.id),
)

let sortOrder = 0
for (const test of orderedTests) {
  // Test không có trong catalogue (ví dụ chủ đề B1) lấy tên của passage đầu tiên.
  if (!test.title) test.title = test.passages[0]?.title ?? test.id
  test.passages.sort((left, right) => left.sourceId.localeCompare(right.sourceId))
  test.passages = test.passages.map((passage, index) => ({ ...passage, sectionNo: index + 1 }))
  test.questionCount = test.passages.reduce((sum, passage) => sum + passage.groups.reduce((inner, group) => inner + group.questions.length, 0), 0)
  test.sortOrder = sortOrder
  sortOrder += 1
  test.slug = test.id
  test.skill = 'reading'
  test.durationMinutes = 60
  test.testType = 'academic'
  test.description = `${test.passages.length} passage · ${test.questionCount} câu hỏi`
}

const dataset = {
  generatedFrom: 'khanh020905/SWP391-PROJECT · public/data/reading',
  stats: {
    filesScanned: passageFiles.length,
    skippedStubs,
    skippedWithoutQuestions,
    passages: passages.size,
    tests: orderedTests.length,
    questions: orderedTests.reduce((sum, test) => sum + test.questionCount, 0),
  },
  tests: orderedTests,
}

const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'seed', 'skill-reading-data.json')
mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, JSON.stringify(dataset), 'utf8')

console.log(`Đã ghi ${target}`)
console.log(`  file: ${dataset.stats.filesScanned} | stub bỏ qua: ${skippedStubs} | passage không có câu hỏi: ${skippedWithoutQuestions}`)
console.log(`  test: ${dataset.stats.tests} | passage: ${dataset.stats.passages} | câu hỏi: ${dataset.stats.questions}`)
