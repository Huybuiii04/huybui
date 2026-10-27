# Reading Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lấy **toàn bộ đề Reading** từ repo `khanh020905/SWP391-PROJECT` vào IELTS Writing Studio, rồi xây kho đề + phòng làm bài + chấm điểm **viết mới theo kiến trúc web hiện có** (Vite + React Router + Supabase Edge Functions + design token `src/styles.css`).

**Architecture:** Không copy code Next.js của repo nguồn. Một script import đọc thẳng `public/data/reading/*.json` của repo nguồn (566 file) + catalogue `src/data/reading-data.ts`, gom thành dataset rồi nạp vào Postgres qua `skill_tests / skill_sections / skill_question_groups / skill_questions / skill_attempts`. Frontend đọc nội dung qua PostgREST với **quyền cột** ẩn đáp án; Edge Function `grade-skill` chấm bằng service role rồi ghi lịch sử. Logic chấm nằm ở một chỗ duy nhất (`supabase/functions/_shared/skillGrading.ts`).

**Phạm vi:** **chỉ Reading.** Phần Listening (kho đề, phòng làm bài, audio) để dành cho plan sau — bảng `skill_*` vẫn thiết kế sẵn để mở rộng.

**Tech Stack:** Vite · React 19 · React Router 7 · Tailwind 4 (design token trong `src/styles.css`) · Supabase (Postgres + Edge Functions/Deno) · i18next VI/EN · `node:test` · Playwright

---

## 1. Điều tra: kho đề thật nằm ở đâu

Repo nguồn là Next.js + Gemini, nhưng **toàn bộ nội dung đề nằm ở `public/data/reading/`** — đây mới là thứ cần lấy.

### Kiểm kê `public/data/reading/` (566 file)

| Nhóm | Số file | Cấu trúc id | Nội dung |
|---|---|---|---|
| Cambridge 9–20 | 144 | `cam-{book}-{test}-{passage}` | 48 test × 3 passage, **có câu hỏi + đáp án** |
| Essential Words | 30 | `ew-{unit}-{passage}` | 10 unit × 3 passage, có câu hỏi |
| TID Vol Siêu Chuẩn | 24 | `tid-vol-{test}-{passage}` | 8 test × 3 passage |
| TID Practice Set 20 | 12 | `tid-20-{test}-{passage}` | 4 test × 3 passage |
| TID Workbook | 23 | `tid-wb-{unit}-{passage}` | 6 unit × 3–4 passage |
| IELTS topic B1 | 10 | `IELTS_{Topic}` | đọc hiểu theo chủ đề, có câu hỏi |
| Ngân hàng đoạn văn | ~300 | `passage_p{1..16}_c{1..20}` | **chỉ có `content_html`, không có câu hỏi** |
| Stub rỗng | 30 | `ew-test.json`, `passage_32.json`, file 146–168 byte | bỏ qua |

**Tổng có câu hỏi: 234 file · 3004 câu · 2995 câu có đáp án · 2395 câu có giải thích (tiếng Việt).**

Sau khi loại 1 file (`passage_32.json` — 6 câu mà **không câu nào có đáp án**): **233 passage · 77 test · 2998 câu có đáp án.**

Catalogue (`src/data/reading-data.ts`) cho biết passage nào thuộc test nào:

| Mảng catalogue | Id test | File passage |
|---|---|---|
| `cambridgeTests` | `cam-9-1` … `cam-20-5` | `{testId}-1..3` |
| `deVolTests` | `tid-vol-1..8` | `{testId}-1..3` |
| `tidPracticeTests` | `tid-20-1..4` | `{testId}-1..3` |
| `essentialWordsUnits` | `ew-{unit}` | `ew-{unit}-1..3` |
| `workbookUnits` | `tid-wb-{unit}` | `tid-wb-{unit}-1..4` |

Catalogue **không** có Cambridge 7–8 (file rỗng 448 byte), Cambridge 20 Test 5 (không có file) → script import phải có đường dự phòng suy ra test từ tên file.

### Shape của một file đề (đã kiểm chứng)

```jsonc
{
  "youpass_id": "cam-10-1-1",
  "title": "Stepwells",
  "content_html": "<p>…nội dung passage…</p>",
  "questions": [
    {
      "id": 1,
      "type": "tfng",              // tfng|ynng|yes-no|multiple-choice|matching|matching-info|matching-feature|fill-blank|gap-filling
      "answer": "FALSE",
      "question": "Examples of ancient stepwells can be found all over the world.",
      "options": ["A. recognising talent.", "B. working as a team."],  // MCQ: "A. text"; matching: ["A","B","C"]
      "groupId": "group-qu4vyp8yn4", // nhóm câu hỏi dùng chung hướng dẫn
      "groupHtml": "<p><strong>Questions 14–17</strong></p>…",
      "questionHtml": "<p>… <strong>1_______</strong> …</p>",  // chỗ trống có số để chèn ô nhập
      "displayType": "note-completion",
      "_blockConfig": { "qStart": 1, "qEnd": 6, "wordLimit": "ONE WORD AND/OR A NUMBER", … },
      "explanation": "Bài 1: Keyword…"
    }
  ]
}
```

`displayType` có 14 biến thể: `tfng`, `ynng`, `multiple-choice`, `multiple-choice-2`, `matching-heading`, `matching-info`, `matching-feature`, `fill-blank`, `sentence-completion`, `note-completion`, `table-completion`, `summary-completion`, `sentence-ending`.

### Không port

`reading/bilingual/*`, `listening/dictation/*`, `listening/cam-test/*`, `reading/cam/*`, `MockAudioPlayer` (giả), mọi lời gọi Gemini, mọi route Next.js API. ⚠️ `scripts/db_listening_setup.ts` của repo nguồn **hard-code service role key** — tuyệt đối không copy.

---

## 2. Ranh giới (scope)

**Trong plan này (chỉ Reading)**

- Import **toàn bộ** 233 file đề có câu hỏi (2998 câu, 77 test) từ `public/data/reading/` của repo nguồn.
- Kho đề theo series (Cambridge 9–20 / Essential Words / TID Vol / TID Set 20 / TID Workbook / Chủ đề B1) và lọc theo mức band.
- Phòng làm bài: passage bên trái, câu hỏi bên phải; đồng hồ đếm ngược, đánh dấu câu, lưới rà soát, tiến độ.
- Render đủ 14 `displayType`: MCQ, TFNG, YNNG, matching (heading/info/feature), fill-blank, và các dạng completion (note/table/summary/sentence) với ô nhập **nội tuyến** trong HTML.
- Chấm điểm server-side, quy đổi band Cambridge, xem lại từng câu kèm đáp án đúng + giải thích có sẵn trong dữ liệu.
- Lịch sử làm bài lưu Postgres, hiện ở Tổng quan.
- Trang quản trị: đổi trạng thái đề (publish / draft / hidden).

**Ngoài plan này**

- **Listening**: kho đề, phòng làm bài, tải audio. Repo nguồn không có `public/data/listening/` cũng không có file mp3 — nội dung Listening nằm trong Supabase của project họ. Schema `skill_*` đã sẵn sàng để mở rộng sau.
- Ngân hàng ~300 đoạn văn `passage_p*_c*` (chỉ có passage, không có câu hỏi) — nạp được sau bằng cùng script, để dành cho tính năng "đọc hiểu không chấm". Script hiện bỏ qua chúng.
- Nội dung song ngữ cho Reading, luyện nghe chép, luyện nói, shadowing.
- AI giải thích câu sai (bản này dùng `explanation` có sẵn trong dữ liệu).
- Đưa Reading lên trang landing tĩnh (`src/agent/landing.ts` + `pages/index.html` + `tests/landing-static.mjs`).

---

## 3. File map

### Backend

| File | Vai trò |
|---|---|
| `supabase/migrations/021_reading_listening.sql` | 5 bảng `skill_*`, RLS, quyền cột ẩn đáp án |
| `supabase/functions/_shared/skillGrading.ts` | Logic chấm thuần: bảng band, so khớp đáp án IELTS — **nguồn sự thật duy nhất** |
| `supabase/functions/_shared/schemas.ts` | Thêm `parseGradeSkill`, `parseAdminSkills` |
| `supabase/functions/grade-skill/index.ts` | Handler: đọc đáp án (service role) → chấm → ghi `skill_attempts`; `GET` xem lại lần làm bài |
| `supabase/functions/_shared/tests/skillGrading.test.ts` | Unit test logic chấm |
| `scripts/import-source-reading.mjs` | **Đọc 566 file JSON + catalogue của repo nguồn → dataset** |
| `supabase/seed/skill-reading-data.json` | Dataset sinh ra (có commit, tái lập được) |
| `supabase/seed/seed-skills.mjs` | Nạp dataset vào Postgres (chia lô 500 dòng) |
| `supabase/scripts/verify-schema.mjs` | Thêm bảng mới + kiểm tra đáp án không lộ cho anon |

### Frontend

| File | Vai trò |
|---|---|
| `src/lib/skillLogic.ts` | Kiểu dữ liệu + helper thuần: đồng hồ, tiến độ, chuẩn hoá option, **lọc HTML**, **tách chỗ trống** |
| `src/lib/skillRepository.ts` | Đọc test/section/nhóm/câu hỏi từ PostgREST (không lấy cột đáp án) |
| `src/lib/skillApi.ts` | Gọi Edge Function `grade-skill`, đọc lịch sử làm bài |
| `src/lib/skillAdmin.ts` | Quản trị: đọc đề, đổi trạng thái đề |
| `src/components/skill/PassagePanel.tsx` | Render passage HTML đã lọc |
| `src/components/skill/QuestionGroup.tsx` | Render nhóm câu hỏi + ô nhập nội tuyến cho dạng completion |
| `src/components/skill/QuestionCard.tsx` | Thẻ câu hỏi dạng đơn (mcq / tfng / ynng / matching / fill) |
| `src/components/skill/TestTimer.tsx` | Đồng hồ đếm ngược |
| `src/components/skill/ReviewSheet.tsx` | Lưới đánh dấu câu đã trả lời / đã gắn cờ |
| `src/components/skill/SkillResult.tsx` | Khung kết quả sau khi nộp bài |
| `src/pages/Reading.tsx` · `ReadingTest.tsx` · `ReadingResult.tsx` | Kho đề, phòng làm bài, kết quả Reading |
| `src/pages/admin/SkillsTab.tsx` | Quản trị: trạng thái đề |

### Sửa

| File | Vai trò |
|---|---|
| `src/App.tsx` | Đăng ký route mới |
| `src/components/Layout.tsx` | Thêm menu Reading |
| `src/agent/routes.ts` | Bảng route (middleware + test dùng chung) |
| `src/pages/Dashboard.tsx` | Thẻ tiến độ Reading |
| `src/styles.css` | CSS cho màn hình mới (theo token sẵn có) |
| `package.json` | `npm test` + `db:seed:skills` + `db:import:reading` |
| `README.md`, `supabase/README.md` | Tài liệu |

---

## Task 1: Kiểu dữ liệu + helper thuần

**Files:**
- Create: `src/lib/skillLogic.ts`
- Create: `tests/skillLogic.test.ts`
- Modify: `package.json` (script `test`)

- [ ] **Step 1: Viết test đỏ**

`tests/skillLogic.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as skillLogic from '../src/lib/skillLogic.ts'
import {
  answeredCount,
  formatClock,
  normalizeQuestionType,
  parseOptions,
  progressPercent,
  sanitizeHtml,
  splitHtmlByBlanks,
  splitParagraphs,
} from '../src/lib/skillLogic.ts'

test('formatClock renders minutes with padded seconds', () => {
  assert.equal(formatClock(0), '0:00')
  assert.equal(formatClock(65), '1:05')
  assert.equal(formatClock(3600), '60:00')
  assert.equal(formatClock(-5), '0:00')
})

test('answeredCount ignores blank answers', () => {
  const questions = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
  assert.equal(answeredCount({ a: 'TRUE', b: '   ' }, questions), 1)
  assert.equal(answeredCount({}, questions), 0)
})

test('progressPercent never divides by zero', () => {
  assert.equal(progressPercent(0, 0), 0)
  assert.equal(progressPercent(1, 4), 25)
  assert.equal(progressPercent(4, 4), 100)
})

test('splitParagraphs drops blank chunks and trims each paragraph', () => {
  assert.deepEqual(splitParagraphs('one\n\n\n  two  \n\n'), ['one', 'two'])
  assert.deepEqual(splitParagraphs(''), [])
})

test('parseOptions splits "A. text" and falls back to letters', () => {
  assert.deepEqual(parseOptions(['A. first', 'B. second']), [
    { key: 'A', text: 'first' },
    { key: 'B', text: 'second' },
  ])
  assert.deepEqual(parseOptions(['only one']), [{ key: 'A', text: 'only one' }])
  assert.deepEqual(parseOptions([{ key: 'X', text: 'custom' }]), [{ key: 'X', text: 'custom' }])
})

test('normalizeQuestionType maps every source type to an app type', () => {
  assert.equal(normalizeQuestionType('tfng'), 'tfng')
  assert.equal(normalizeQuestionType('T_F_NG'), 'tfng')
  assert.equal(normalizeQuestionType('ynng'), 'ynng')
  assert.equal(normalizeQuestionType('yes-no'), 'ynng')
  assert.equal(normalizeQuestionType('multiple-choice'), 'mcq')
  assert.equal(normalizeQuestionType('matching'), 'matching')
  assert.equal(normalizeQuestionType('matching-info'), 'matching')
  assert.equal(normalizeQuestionType('matching-feature'), 'matching')
  assert.equal(normalizeQuestionType('MATCHING_HEADING'), 'matching')
  assert.equal(normalizeQuestionType('fill-blank'), 'fill')
  assert.equal(normalizeQuestionType('gap-filling'), 'fill')
  assert.equal(normalizeQuestionType('khong-biết'), 'fill')
})

test('sanitizeHtml drops scripts and event handlers but keeps markup', () => {
  const html = '<p>Hello <strong>world</strong></p><script>alert(1)</script><p onclick="x()">Bye</p>'
  const clean = sanitizeHtml(html)
  assert.match(clean, /<strong>world<\/strong>/)
  assert.doesNotMatch(clean, /script/i)
  assert.doesNotMatch(clean, /onclick/i)
})

test('sanitizeHtml drops javascript: links', () => {
  assert.doesNotMatch(sanitizeHtml('<a href="javascript:alert(1)">x</a>'), /javascript:/i)
})

test('sanitizeHtml keeps safe attributes on allowed tags', () => {
  const clean = sanitizeHtml('<img src="/img/a.png" alt="A" width="100"><a href="https://example.com">link</a><td colspan="2">x</td>')
  assert.match(clean, /<img src="\/img\/a\.png" alt="A" width="100">/)
  assert.match(clean, /<a href="https:\/\/example\.com">link<\/a>/)
  assert.match(clean, /<td colspan="2">x<\/td>/)
})

test('sanitizeHtml drops attributes outside the allow list', () => {
  assert.equal(sanitizeHtml('<p id="intro" draggable="true">text</p>'), '<p>text</p>')
  assert.equal(sanitizeHtml('<p class="lead">text</p>'), '<p>text</p>')
})

test('sanitizeHtml drops unquoted javascript: links', () => {
  const clean = sanitizeHtml('<a href=javascript:alert(1) title="safe">x</a>')
  assert.doesNotMatch(clean, /javascript:/i)
  assert.match(clean, /<a title="safe">x<\/a>/)
})

test('sanitizeHtml drops javascript: href but keeps the tag', () => {
  const clean = sanitizeHtml('<a href="javascript:alert(1)" title="safe">x</a>')
  assert.doesNotMatch(clean, /javascript:/i)
  assert.match(clean, /<a title="safe">x<\/a>/)
})

test('sanitizeHtml drops dangerous url schemes', () => {
  const vbscript = sanitizeHtml('<a href="vbscript:msgbox(1)" title="safe">x</a>')
  assert.doesNotMatch(vbscript, /vbscript:/i)
  assert.match(vbscript, /<a title="safe">x<\/a>/)

  const data = sanitizeHtml('<img src="data:image/png;base64,AAA" alt="A">')
  assert.doesNotMatch(data, /data:/i)
  assert.match(data, /<img alt="A">/)

  const newline = sanitizeHtml('<a href="java\nscript:alert(1)" title="safe">x</a>')
  assert.doesNotMatch(newline, /javascript:/i)
  assert.match(newline, /<a title="safe">x<\/a>/)

  const mixedCase = sanitizeHtml('<a href="  JaVaScRiPt:alert(1)" title="safe">x</a>')
  assert.doesNotMatch(mixedCase, /javascript:/i)
  assert.match(mixedCase, /<a title="safe">x<\/a>/)
})

test('sanitizeHtml removes script blocks including their content', () => {
  const clean = sanitizeHtml('<div>keep</div><script>alert("x")</script><style>body{color:red}</style>')
  assert.match(clean, /<div>keep<\/div>/)
  assert.doesNotMatch(clean, /alert/)
  assert.doesNotMatch(clean, /script/i)
  assert.doesNotMatch(clean, /style/i)
})

test('sanitizeHtml removes dangerous and disallowed elements but keeps inner text', () => {
  assert.equal(
    sanitizeHtml('<p>a</p><iframe src="https://evil.test"></iframe><object data="x"></object><embed src="y">'),
    '<p>a</p>',
  )
  assert.equal(sanitizeHtml('<form>keep text</form>'), 'keep text')
})

test('sanitizeHtml keeps inline styles on allowed tags', () => {
  const clean = sanitizeHtml('<td style="border:1px solid #555">x</td>')
  assert.match(clean, /<td style="border:1px solid #555">x<\/td>/)
})

test('sanitizeHtml drops unsafe style values', () => {
  const url = sanitizeHtml('<td style="background:url(evil.png)" colspan="2">x</td>')
  assert.doesNotMatch(url, /url\(/i)
  assert.match(url, /<td colspan="2">x<\/td>/)

  const expression = sanitizeHtml('<td style="width:expression(alert(1))">x</td>')
  assert.doesNotMatch(expression, /expression/i)
  assert.match(expression, /<td>x<\/td>/)

  const scriptUrl = sanitizeHtml('<td style="background:JavaScript:alert(1)">x</td>')
  assert.doesNotMatch(scriptUrl, /javascript:/i)
  assert.match(scriptUrl, /<td>x<\/td>/)
})

test('sanitizeHtml drops class attributes', () => {
  assert.equal(sanitizeHtml('<p class="lead" id="x" data-word="y">t</p>'), '<p>t</p>')
})

test('sanitizeHtml decodes entities before checking the url scheme', () => {
  const decimal = sanitizeHtml('<a href="&#106;avascript:alert(1)" title="safe">x</a>')
  assert.doesNotMatch(decimal, /javascript:/i)
  assert.match(decimal, /<a title="safe">x<\/a>/)

  const hex = sanitizeHtml('<a href="jav&#x09;ascript:alert(1)" title="safe">x</a>')
  assert.match(hex, /<a title="safe">x<\/a>/)

  const named = sanitizeHtml('<a href="javascript&colon;alert(1)" title="safe">x</a>')
  assert.match(named, /<a title="safe">x<\/a>/)
})

test('sanitizeHtml still drops data attributes and id', () => {
  const clean = sanitizeHtml('<p data-word="x" id="y" data-testid="z">text</p>')
  assert.equal(clean, '<p>text</p>')
})

test('sanitizeHtml drops style values with css escapes or absolute positioning', () => {
  const escaped = sanitizeHtml('<td style="background:\\75 rl(evil.png)">x</td>')
  assert.doesNotMatch(escaped, /style=/i)
  assert.match(escaped, /<td>x<\/td>/)

  const absolute = sanitizeHtml('<td style="position:absolute">x</td>')
  assert.doesNotMatch(absolute, /style=/i)
  assert.match(absolute, /<td>x<\/td>/)

  const fixed = sanitizeHtml('<td style="position:fixed;top:0">x</td>')
  assert.match(fixed, /<td>x<\/td>/)

  const sticky = sanitizeHtml('<td style="position:sticky">x</td>')
  assert.match(sticky, /<td>x<\/td>/)

  const relative = sanitizeHtml('<td style="position:relative">x</td>')
  assert.match(relative, /<td style="position:relative">x<\/td>/)

  const staticPosition = sanitizeHtml('<td style="position:static">x</td>')
  assert.match(staticPosition, /<td style="position:static">x<\/td>/)
})

test('sanitizeHtml removes html comments including their content', () => {
  assert.equal(sanitizeHtml('<!-- secret --><p>x</p>'), '<p>x</p>')
  const hidden = sanitizeHtml('<p>a</p><!-- <script>alert(1)</script> --><p>b</p>')
  assert.doesNotMatch(hidden, /script/i)
  assert.doesNotMatch(hidden, /secret/i)
  assert.match(hidden, /<p>a<\/p>/)
  assert.match(hidden, /<p>b<\/p>/)
})

test('sanitizeHtml drops numeric character references without a trailing semicolon', () => {
  const clean = sanitizeHtml('<a href="&#106avascript:alert(1)" title="safe">x</a>')
  assert.doesNotMatch(clean, /javascript:/i)
  assert.match(clean, /<a title="safe">x<\/a>/)
})

test('sanitizeHtml rejects every obfuscated url scheme', () => {
  const payloads = [
    '&#106avascript:alert(1)',
    '&#106;avascript:alert(1)',
    'jav&#x09;ascript:alert(1)',
    'javascript&colon;alert(1)',
  ]
  for (const payload of payloads) {
    const clean = sanitizeHtml(`<a href="${payload}" title="safe">x</a>`)
    assert.doesNotMatch(clean, /javascript:/i, payload)
    assert.match(clean, /<a title="safe">x<\/a>/, payload)
  }
})

test('sanitizeHtml keeps plain urls untouched', () => {
  assert.equal(
    sanitizeHtml('<a href="https://example.com/x?a=1&b=2">x</a>'),
    '<a href="https://example.com/x?a=1&b=2">x</a>',
  )
  assert.equal(sanitizeHtml('<img src="/img/a.png">'), '<img src="/img/a.png">')
})

test('sanitizeHtml escapes markup it cannot parse', () => {
  const clean = sanitizeHtml('<a href="x onmouseover=alert(1)>')
  assert.doesNotMatch(clean, /<a/)
  assert.match(clean, /&lt;/)
})

test('sanitizeHtml removes an unclosed script block to the end of the content', () => {
  assert.equal(sanitizeHtml('<script>alert(1)'), '')
  assert.equal(sanitizeHtml('<p>a</p><style>body{}'), '<p>a</p>')
})

test('splitHtmlByBlanks finds numbered blanks', () => {
  const segments = splitHtmlByBlanks('<p>cost was <strong>1_______</strong> each</p>')
  assert.equal(segments.length, 3)
  assert.deepEqual(segments[1], { kind: 'blank', sourceNumber: 1 })
  assert.match(segments[0].html, /cost was/)
})

test('module exports exactly the 9 public helpers', () => {
  assert.deepEqual(Object.keys(skillLogic).sort(), [
    'answeredCount',
    'formatClock',
    'normalizeDisplayType',
    'normalizeQuestionType',
    'parseOptions',
    'progressPercent',
    'sanitizeHtml',
    'splitHtmlByBlanks',
    'splitParagraphs',
  ])
})

test('normalizeDisplayType keeps known types and falls back to fill-blank', () => {
  assert.equal(skillLogic.normalizeDisplayType('note-completion'), 'note-completion')
  assert.equal(skillLogic.normalizeDisplayType('NOTE-COMPLETION'), 'note-completion')
  assert.equal(skillLogic.normalizeDisplayType('bogus'), 'fill-blank')
  assert.equal(skillLogic.normalizeDisplayType(null), 'fill-blank')
})

test('parseOptions handles empty, invalid and unusual input', () => {
  assert.deepEqual(parseOptions([]), [])
  assert.deepEqual(parseOptions('A. x'), [])
  assert.deepEqual(parseOptions(null), [])
  assert.deepEqual(parseOptions(['.']), [{ key: 'A', text: '.' }])
  assert.deepEqual(parseOptions(['3.5 million']), [{ key: 'A', text: '3.5 million' }])
  assert.deepEqual(parseOptions([{ key: 'X' }]), [{ key: 'X', text: '' }])
  assert.deepEqual(parseOptions(['A', 'B', 'C']), [
    { key: 'A', text: 'A' },
    { key: 'B', text: 'B' },
    { key: 'C', text: 'C' },
  ])
})

test('progressPercent never exceeds 100', () => {
  assert.equal(progressPercent(5, 4), 100)
})

test('formatClock falls back to zero for invalid input', () => {
  assert.equal(formatClock(NaN), '0:00')
})

test('splitHtmlByBlanks returns plain html when there is no blank', () => {
  const segments = splitHtmlByBlanks('<p>no blanks here</p>')
  assert.equal(segments.length, 1)
  assert.equal(segments[0].kind, 'html')
})

test('splitHtmlByBlanks matches the documented placeholder examples', () => {
  const examples = [['<p>a 2____ b</p>', 2], ['<p>a 3…….. b</p>', 3]] as const
  for (const [html, number] of examples) {
    const segments = splitHtmlByBlanks(html)
    assert.equal(segments.length, 3)
    assert.deepEqual(segments[1], { kind: 'blank', sourceNumber: number })
  }
})

test('splitHtmlByBlanks finds a placeholder next to letters and to another placeholder', () => {
  const leading = splitHtmlByBlanks('1____abc')
  assert.equal(leading.length, 2)
  assert.deepEqual(leading[0], { kind: 'blank', sourceNumber: 1 })
  assert.deepEqual(leading[1], { kind: 'html', html: 'abc' })

  const trailing = splitHtmlByBlanks('abc 1____')
  assert.equal(trailing.length, 2)
  assert.deepEqual(trailing[0], { kind: 'html', html: 'abc ' })
  assert.deepEqual(trailing[1], { kind: 'blank', sourceNumber: 1 })

  const adjacent = splitHtmlByBlanks('1____2____')
  assert.equal(adjacent.length, 2)
  assert.deepEqual(adjacent[0], { kind: 'blank', sourceNumber: 1 })
  assert.deepEqual(adjacent[1], { kind: 'blank', sourceNumber: 2 })

  const spaced = splitHtmlByBlanks('1____ 2____')
  assert.equal(spaced.length, 3)
  assert.deepEqual(spaced[0], { kind: 'blank', sourceNumber: 1 })
  assert.deepEqual(spaced[1], { kind: 'html', html: ' ' })
  assert.deepEqual(spaced[2], { kind: 'blank', sourceNumber: 2 })

  const afterLetters = splitHtmlByBlanks('the answer is1____')
  assert.equal(afterLetters.length, 2)
  assert.deepEqual(afterLetters[0], { kind: 'html', html: 'the answer is' })
  assert.deepEqual(afterLetters[1], { kind: 'blank', sourceNumber: 1 })

  const longNumber = splitHtmlByBlanks('12345____')
  assert.equal(longNumber.length, 1)
  assert.equal(longNumber[0].kind, 'html')
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test tests/skillLogic.test.ts`
Expected: FAIL — `Cannot find module '.../src/lib/skillLogic.ts'`.

- [ ] **Step 3: Viết module**

`src/lib/skillLogic.ts`:

```ts
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
 * - không có `expression(`, `javascript:` hay `url(`,
 * - không khai báo `position` là `absolute`, `fixed` hoặc `sticky` (tránh tràn khung).
 */
function isSafeStyle(value: string): boolean {
  const normalized = normalizeForSchemeCheck(value)
  if (normalized.includes('\\')) return false
  if (normalized.includes('expression(')) return false
  if (normalized.includes('javascript:')) return false
  if (normalized.includes('url(')) return false
  const position = /(^|[^-\w])position:([-\w]+)/g
  let match = position.exec(normalized)
  while (match) {
    const declaration = match[2]
    if (declaration !== 'relative' && declaration !== 'static') return false
    match = position.exec(normalized)
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
  // Chỉ giữ thẻ an toàn, kèm thuộc tính an toàn và URL an toàn; dấu '<' lạ thì escape.
  clean = clean.replace(/<\/?([a-zA-Z0-9]+)((?:"[^"]*"|'[^']*'|[^'">])*)>|</g, (match, tag: string | undefined, rawAttributes: string | undefined) => {
    if (tag === undefined) return '&lt;'
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
```

- [ ] **Step 4: Chạy test xanh**

Run: `node --test tests/skillLogic.test.ts`
Expected: PASS — 36/36 test.

- [ ] **Step 5: Thêm file test vào `npm test`**

`package.json`, script `test`:

```json
"test": "node --test tests/learning.test.ts tests/auth.test.ts tests/sync.test.ts tests/ai.test.ts tests/vocabulary.test.ts tests/vocabularyRepository.test.ts tests/skillLogic.test.ts tests/agent.test.ts tests/negotiation.test.ts tests/middleware.test.ts tests/discovery.test.ts tests/admin.test.ts",
```

- [ ] **Step 6: Chạy toàn bộ test**

Run: `npm test`
Expected: PASS — không test nào đỏ (số test tăng thêm 36).

> **Ghi chú (cập nhật sau khi ship):** `sanitizeHtml` đã được siết lại sau khi spec review và code quality review phát hiện: (1) regex lấy thuộc tính không bao giờ khớp nên mọi attribute bị xoá hết — hỏng `<img src>`/ `<a href>`/ `<td colspan>`, quan trọng với dạng `table-completion`; (2) bypass XSS qua numeric entity không có `;` (`&#106avascript:`) đã được chứng minh bằng Chromium — sửa bằng cách cho phép `;` tuỳ chọn trong pattern số; (3) `splitHtmlByBlanks` dùng `(?<!\d)` thay `\b` để không bỏ sót chỗ trống dính liền nhau. Code block ở trên đã đồng bộ với implementation thực tế (36 test).

- [ ] **Step 7: Commit**

```bash
git add src/lib/skillLogic.ts tests/skillLogic.test.ts package.json
git commit -m "feat(skills): add shared types and pure helpers for reading and listening"
```

---
## Task 2: Migration — 5 bảng, RLS, bucket audio

**Files:**
- Create: `supabase/migrations/021_reading_listening.sql`
- Modify: `supabase/scripts/verify-schema.mjs`

- [ ] **Step 1: Viết migration**

`supabase/migrations/021_reading_listening.sql`:

```sql
-- 021_reading_listening.sql
-- Module: reading + listening (đề luyện và lịch sử làm bài)
--
-- Nội dung đề nằm trong Postgres; frontend đọc công khai qua PostgREST.
-- Cột đáp án (answer_key, accepted_answers) KHÔNG được cấp quyền cho client:
-- việc chấm điểm diễn ra ở Edge Function `grade-skill` bằng service role.

begin;

create table if not exists public.skill_tests (
  id uuid primary key default gen_random_uuid(),
  skill text not null check (skill in ('reading', 'listening')),
  slug text not null unique,
  series text not null default '',
  series_no integer not null default 0,
  title text not null,
  description text not null default '',
  level text not null default '',
  duration_minutes integer not null default 60 check (duration_minutes between 5 and 180),
  test_type text not null default 'academic' check (test_type in ('academic', 'general')),
  question_count integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_sections (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.skill_tests (id) on delete cascade,
  section_no integer not null check (section_no between 1 and 20),
  title text not null default '',
  topic text not null default '',
  content_html text not null default '',
  audio_path text not null default '',
  transcript text not null default '',
  source_id text not null default '',
  unique (test_id, section_no)
);

-- Nhóm câu hỏi: những câu dùng chung một hướng dẫn (groupHtml của repo nguồn).
create table if not exists public.skill_question_groups (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.skill_sections (id) on delete cascade,
  order_index integer not null check (order_index between 1 and 100),
  instruction_html text not null default '',
  display_type text not null default 'fill-blank',
  config jsonb not null default '{}'::jsonb,
  unique (section_id, order_index)
);

create table if not exists public.skill_questions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.skill_question_groups (id) on delete cascade,
  order_index integer not null check (order_index between 1 and 200),
  source_number integer not null default 0,
  question_type text not null check (question_type in ('tfng', 'ynng', 'mcq', 'matching', 'fill')),
  display_type text not null default 'fill-blank',
  prompt text not null default '',
  question_html text not null default '',
  options jsonb not null default '[]'::jsonb,
  answer_key text not null default '',
  accepted_answers text[] not null default '{}',
  explanation text not null default '',
  unique (group_id, order_index)
);

create table if not exists public.skill_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  test_id uuid not null references public.skill_tests (id) on delete cascade,
  skill text not null check (skill in ('reading', 'listening')),
  answers jsonb not null default '{}'::jsonb,
  correct_count integer not null default 0,
  total_count integer not null default 0,
  band numeric(3, 1),
  time_spent_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

-- skill luôn lấy từ skill_tests: không thể lệch với test_id.
create or replace function private.skill_attempts_sync_skill()
returns trigger
language plpgsql
security definer
set search_path = private, public
as $$
begin
  new.skill := (select skill from public.skill_tests where id = new.test_id);
  return new;
end;
$$;

revoke execute on function private.skill_attempts_sync_skill() from public, anon;
grant execute on function private.skill_attempts_sync_skill() to service_role;

drop trigger if exists skill_attempts_sync_skill on public.skill_attempts;
create trigger skill_attempts_sync_skill
before insert or update on public.skill_attempts
for each row execute function private.skill_attempts_sync_skill();

-- Cố ý không tạo GIN index cho accepted_answers (text[]) và answers (jsonb):
-- đường chấm điểm đọc theo group_id/test_id, không tìm theo containment.
create index if not exists skill_tests_skill_status_idx on public.skill_tests (skill, status, sort_order);
create index if not exists skill_tests_series_idx on public.skill_tests (series, series_no);
create index if not exists skill_sections_test_idx on public.skill_sections (test_id, section_no);
create index if not exists skill_question_groups_section_idx on public.skill_question_groups (section_id, order_index);
create index if not exists skill_questions_group_idx on public.skill_questions (group_id, order_index);
create index if not exists skill_attempts_user_idx on public.skill_attempts (user_id, skill, created_at desc);

drop trigger if exists skill_tests_set_updated_at on public.skill_tests;
create trigger skill_tests_set_updated_at
before update on public.skill_tests
for each row execute function private.set_updated_at();

alter table public.skill_tests enable row level security;
alter table public.skill_sections enable row level security;
alter table public.skill_question_groups enable row level security;
alter table public.skill_questions enable row level security;
alter table public.skill_attempts enable row level security;

-- Nội dung đề: ai cũng đọc được, nhưng chỉ đề đang published.
drop policy if exists skill_tests_read on public.skill_tests;
create policy skill_tests_read on public.skill_tests
for select to anon, authenticated
using (status = 'published' or private.is_admin());

drop policy if exists skill_sections_read on public.skill_sections;
create policy skill_sections_read on public.skill_sections
for select to anon, authenticated
using (exists (
  select 1 from public.skill_tests test
  where test.id = test_id and (test.status = 'published' or private.is_admin())
));

drop policy if exists skill_question_groups_read on public.skill_question_groups;
create policy skill_question_groups_read on public.skill_question_groups
for select to anon, authenticated
using (exists (
  select 1 from public.skill_sections section
  join public.skill_tests test on test.id = section.test_id
  where section.id = section_id and (test.status = 'published' or private.is_admin())
));

drop policy if exists skill_questions_read on public.skill_questions;
create policy skill_questions_read on public.skill_questions
for select to anon, authenticated
using (exists (
  select 1 from public.skill_question_groups question_group
  join public.skill_sections section on section.id = question_group.section_id
  join public.skill_tests test on test.id = section.test_id
  where question_group.id = group_id and (test.status = 'published' or private.is_admin())
));

-- Lịch sử làm bài: chủ sở hữu đọc, không ai thấy của người khác.
-- Ghi lần làm bài là việc của Edge Function `grade-skill` (service role) — xem grant bên dưới.
drop policy if exists skill_attempts_owner_read on public.skill_attempts;
create policy skill_attempts_owner_read on public.skill_attempts
for select to authenticated
using (user_id = auth.uid());

-- Dọn policy INSERT cũ nếu có: client không được tự ghi lần làm bài.
drop policy if exists skill_attempts_owner_insert on public.skill_attempts;

-- Quyền mặc định của Supabase cấp ALL cho `authenticated` trên bảng mới trong schema public.
-- RLS chặn INSERT/UPDATE/DELETE nhưng KHÔNG chặn TRUNCATE, nên phải thu hồi tường minh.
revoke all on public.skill_tests from anon;
revoke all on public.skill_sections from anon;
revoke all on public.skill_question_groups from anon;
revoke all on public.skill_questions from anon;
revoke all on public.skill_attempts from anon;
revoke all on public.skill_tests from authenticated;
revoke all on public.skill_sections from authenticated;
revoke all on public.skill_question_groups from authenticated;
revoke all on public.skill_questions from authenticated;
revoke all on public.skill_attempts from authenticated;

grant select on public.skill_tests to anon, authenticated;
grant select on public.skill_sections to anon, authenticated;
grant select on public.skill_question_groups to anon, authenticated;
-- skill_attempts chỉ được ghi bởi service role (Edge Function `grade-skill`).
-- Client KHÔNG có quyền insert: nếu không, người dùng tự khai điểm và band.
grant select on public.skill_attempts to authenticated;

-- Chỉ cấp quyền đọc các cột KHÔNG chứa đáp án cho skill_questions.
-- Client bắt buộc phải ghi tên cột rõ ràng, không dùng select=* cho bảng này.
revoke select on public.skill_questions from anon, authenticated;
grant select (id, group_id, order_index, source_number, question_type, display_type, prompt, question_html, options)
  on public.skill_questions to anon, authenticated;

-- Bucket audio cho Listening: private, audio được phục vụ qua signed URL
-- (đề còn draft/hidden không bị tải trực tiếp bằng URL), admin mới ghi được.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('skill-audio', 'skill-audio', false, 52428800, array['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists skill_audio_insert on storage.objects;
create policy skill_audio_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'skill-audio' and private.is_admin());

drop policy if exists skill_audio_update on storage.objects;
create policy skill_audio_update on storage.objects
for update to authenticated
using (bucket_id = 'skill-audio' and private.is_admin())
with check (bucket_id = 'skill-audio' and private.is_admin());

drop policy if exists skill_audio_delete on storage.objects;
create policy skill_audio_delete on storage.objects
for delete to authenticated
using (bucket_id = 'skill-audio' and private.is_admin());

commit;
```

- [ ] **Step 2: Cập nhật `verify-schema.mjs`**

Sửa hai danh sách và thêm hai kiểm tra:

```js
const expectedTables = [
  'profiles', 'user_access',
  'content_entries', 'content_translations',
  'prompts', 'prompt_topics', 'prompt_chart_types',
  'essays', 'essay_revisions', 'essay_assets', 'revision_assets',
  'ai_jobs', 'grading_results', 'essay_features', 'ai_tool_results', 'ai_usage',
  'study_cards', 'review_events', 'error_logs', 'guide_progress',
  'donation_settings', 'admin_audit_logs', 'rate_limit_buckets',
  'ai_pricing', 'user_prompts',
  'skill_tests', 'skill_sections', 'skill_question_groups', 'skill_questions', 'skill_attempts'
]
```

```js
const expectedBuckets = ['essay-images', 'content-media', 'donation-media', 'prompt-media', 'user-prompt-media', 'skill-audio']
```

Thêm ngay sau khối `promptRead`:

```js
// Đáp án của skill_questions phải KHÔNG đọc được bởi client (chấm ở Edge Function).
// has_table_privilege KHÔNG tính quyền cấp ở mức cột, nên từng quyền được kiểm riêng.
// Thứ tự: anon table | anon answer_key | anon prompt | authenticated answer_key | authenticated prompt
const skillQuestionPrivileges = query(\`select has_table_privilege('anon', 'public.skill_questions', 'SELECT')::text || has_column_privilege('anon', 'public.skill_questions', 'answer_key', 'SELECT')::text || has_column_privilege('anon', 'public.skill_questions', 'prompt', 'SELECT')::text || has_column_privilege('authenticated', 'public.skill_questions', 'answer_key', 'SELECT')::text || has_column_privilege('authenticated', 'public.skill_questions', 'prompt', 'SELECT')::text\`)
check('read on skill_questions (must be falsefalsetruefalsetrue)', skillQuestionPrivileges, 'falsefalsetruefalsetrue')
```

Thêm ngay sau đó:

```js
const attemptsInsert = query(\`select has_table_privilege('authenticated', 'public.skill_attempts', 'INSERT')::text\`)
check('authenticated INSERT on skill_attempts (must be false)', attemptsInsert, 'false')
```

- [ ] **Step 3: Áp dụng migration lên database**

Run: `npm run db:migrate`
Expected: In ra số file đã áp dụng, không có lỗi `already exists` (migration idempotent).

- [ ] **Step 4: Kiểm tra schema**

Run: `npm run db:verify`
Expected: `Tất cả kiểm tra schema đạt.` và `Tất cả kiểm tra RLS đạt.`

> **Ghi chú (cập nhật sau khi ship):** code review phát hiện `skill_attempts` cho phép client tự INSERT với `correct_count`/`band` tuỳ ý — tức là tự khai điểm. Đã sửa: bỏ policy INSERT của `authenticated`, thêm `revoke all … from authenticated` cho cả 5 bảng (Supabase mặc định grant ALL cho bảng mới trong `public`, và RLS không chặn TRUNCATE), trigger `skill_attempts_sync_skill` lấy `skill` từ `test_id`, bucket `skill-audio` chuyển sang private + thêm policy UPDATE. Chỉ service role (Edge Function `grade-skill`) ghi được lần làm bài.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/021_reading_listening.sql supabase/scripts/verify-schema.mjs
git commit -m "feat(skills): add reading and listening schema with RLS"
```

---

## Task 3: Script import — lấy toàn bộ đề từ repo nguồn

**Files:**
- Create: `scripts/import-source-reading.mjs`
- Create: `supabase/seed/skill-reading-data.json` (sinh ra)
- Modify: `package.json`

- [ ] **Step 1: Viết script import**

`scripts/import-source-reading.mjs`:

```js
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

/**
 * Kiểu đã chuẩn hoá -> kiểu hiển thị hợp lệ.
 * Khi câu hỏi không khai báo displayType, fallback phải là 1 trong 13 kiểu hợp lệ
 * (không dùng 'mcq'/'matching' vì đó là kiểu câu hỏi, không phải kiểu hiển thị).
 */
const DISPLAY_FOR_TYPE = {
  tfng: 'tfng',
  ynng: 'ynng',
  mcq: 'multiple-choice',
  matching: 'matching-info',
  fill: 'fill-blank',
}

/** Chỗ trống trong HTML: "31_______", "7 ………..", "12.____". */
const BLANK_PATTERN = /\b(\d{1,3})\s*[._…]{4,}/g

/** Đề nguồn để câu hỏi ở nhiều trường khác nhau; lấy biến thể đầu tiên dùng được. */
const PROMPT_KEYS = ['question', 'text', 'question_text', 'questionText', 'statement']

/**
 * Lấy nội dung câu hỏi. Một biến thể rỗng (hoặc chỉ toàn khoảng trắng) thì thử
 * biến thể kế tiếp — không chấp nhận chuỗi rỗng khi còn biến thể dùng được.
 */
function resolvePrompt(question) {
  for (const key of PROMPT_KEYS) {
    const value = question[key]
    if (value === null || value === undefined) continue
    const trimmed = String(value).trim()
    if (trimmed) return trimmed
  }
  return ''
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
    const displayType = normalizeDisplay(
      first.displayType ?? first._blockConfig?.type,
      DISPLAY_FOR_TYPE[normalizeType(first.type)] ?? 'fill-blank',
    )

    // ── Số câu gốc trong đề ──────────────────────────────────────────────────
    // Ưu tiên question.id khi nó là số. Nhưng đề nguồn có vài nhóm bị lỗi:
    //   - câu không có id (ew-1-1: 14 câu),
    //   - câu có id trùng nhau (cam-11-3-1: id "8" xuất hiện 2 lần, thiếu id 9).
    // Khi đó, số trong chỗ trống "N_______" của HTML chính là số câu gốc —
    // dùng chỗ trống để suy ra, miễn là chỗ trống khớp 1-1 với số câu của nhóm.
    const numericIds = items.map(question =>
      /^\d+$/.test(String(question.id ?? '')) ? Number(question.id) : null)
    const idsUsable = numericIds.every(value => value !== null)
      && new Set(numericIds).size === items.length
    const firstWithHtml = items.find(question => (question.questionHtml ?? '').trim().length > 0)
    const blankNumbers = [...(firstWithHtml?.questionHtml ?? '').matchAll(BLANK_PATTERN)]
      .map(match => Number(match[1]))
    // Chỉ dùng chỗ trống khi đủ số chỗ trống và chúng là dãy liên tiếp —
    // nếu không thì thứ tự chỗ trống có thể không khớp thứ tự câu hỏi.
    const blanksUsable = blankNumbers.length === items.length
      && blankNumbers.every((value, index) => index === 0 || value === blankNumbers[index - 1] + 1)
    const useBlankNumbers = !idsUsable && blanksUsable

    // Nhóm không có id dùng được mà cũng không có chỗ trống thì lấy qStart:
    // _blockConfig.qStart là số câu đầu tiên của nhóm trong đề gốc
    // (ew-1-1: 1-4, 5-8, 9-14). Nếu không có qStart thì mới dùng vị trí trong nhóm.
    const qStart = Number(first._blockConfig?.qStart)
    const hasQStart = Number.isInteger(qStart) && qStart > 0
    const useQStart = !idsUsable && !useBlankNumbers && hasQStart

    /** Thứ tự ưu tiên: id hợp lệ → chỗ trống → qStart → vị trí trong nhóm. */
    const sourceNumberFor = (question, questionIndex) => {
      const ownId = /^\d+$/.test(String(question.id ?? '')) ? Number(question.id) : null
      if (idsUsable) return ownId
      if (useBlankNumbers) return blankNumbers[questionIndex]
      if (useQStart) return ownId ?? qStart + questionIndex
      return ownId ?? questionIndex + 1
    }

    return {
      key: groupId,
      order: groupIndex + 1,
      instructionHtml: first.groupHtml ?? first.group_html ?? '',
      displayType,
      config: first._blockConfig ?? {},
      questions: items.map((question, questionIndex) => ({
        sourceId: String(question.id ?? ''),
        // Số câu gốc trong đề — dùng để ánh xạ chỗ trống "31_______" trong HTML.
        sourceNumber: sourceNumberFor(question, questionIndex),
        order: questionIndex + 1,
        type: normalizeType(question.type),
        displayType,
        prompt: resolvePrompt(question),
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
```

- [ ] **Step 2: Chạy script với clone thật của repo nguồn**

```bash
git clone --depth 1 https://github.com/khanh020905/SWP391-PROJECT.git ../SWP391-PROJECT
node scripts/import-source-reading.mjs ../SWP391-PROJECT
```

Expected:

```
Đã ghi D:\ielts\supabase\seed\skill-reading-data.json
  file: 566 | stub bỏ qua: 30 | passage không có câu hỏi: 303
  test: 77 | passage: 233 | câu hỏi: 2998
```

> Node sẽ in cảnh báo `MODULE_TYPELESS_PACKAGE_JSON` vì `package.json` của repo nguồn không khai báo `"type": "module"`. Đây là cảnh báo, không phải lỗi — script vẫn chạy đúng. Bỏ qua bằng `2>$null` nếu muốn sạch output.

> **Vì sao 77 test chứ không phải 84?** Cambridge 7–8 trong repo nguồn chỉ có file 448 byte (không có câu hỏi) nên bị bỏ; `cam-20-5` được catalogue liệt kê nhưng không có file; 9/10 file chủ đề B1 không có câu hỏi; `passage_32.json` có 6 câu mà **không câu nào có đáp án** nên bị bỏ. Còn lại: 48 Cambridge + 10 Essential Words + 8 TID Vol + 4 TID Set 20 + 6 TID Workbook + 1 chủ đề B1 = **77 test**.

- [ ] **Step 3: Kiểm tra dataset**

```bash
node -e "const d=require('./supabase/seed/skill-reading-data.json'); console.log(d.stats); console.log(d.tests.slice(0,3).map(t=>t.series+' | '+t.title+' | '+t.questionCount+' câu'))"
```

Expected: `tests: 77`, `questions: 2998`, và 3 dòng mẫu như `Cambridge | Cambridge 9 - Test 1 | 40 câu`.

Kiểm tra số câu có đáp án và có số thứ tự gốc:

```bash
node -e "const d=require('./supabase/seed/skill-reading-data.json'); const all=d.tests.flatMap(t=>t.passages.flatMap(p=>p.groups.flatMap(g=>g.questions))); console.log('câu:',all.length,'| có đáp án:',all.filter(q=>q.answerKey).length,'| có sourceNumber:',all.filter(q=>q.sourceNumber).length,'| có options:',all.filter(q=>q.options.length).length)"
```

Expected: `câu: 2998 | có đáp án: 2995 | có sourceNumber: 2998 | có options: 734`.

- [ ] **Step 4: Thêm script npm**

`package.json`, scripts:

```json
"db:import:reading": "node scripts/import-source-reading.mjs",
```

- [ ] **Step 5: Commit**

```bash
git add scripts/import-source-reading.mjs supabase/seed/skill-reading-data.json package.json
git commit -m "feat(skills): import the full reading library from the source repo"
```

---

## Task 4: Script nạp dữ liệu Reading vào Postgres

**Files:**
- Create: `supabase/seed/seed-skills.mjs`
- Modify: `package.json`

- [ ] **Step 1: Viết script nạp dữ liệu**

`supabase/seed/seed-skills.mjs`:

```js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const url = process.env.SUPABASE_URL ?? 'https://fjlyjaomuxotqqjvugtv.supabase.co'
const secret = process.env.SUPABASE_SECRET_KEY
if (!secret) {
  console.error('Thiếu SUPABASE_SECRET_KEY')
  process.exit(1)
}

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })
const here = dirname(fileURLToPath(import.meta.url))
const reading = JSON.parse(readFileSync(join(here, 'skill-reading-data.json'), 'utf8'))

/** Ghi theo lô để không vượt giới hạn payload của PostgREST. */
async function writeInBatches(table, rows, conflict) {
  let written = 0
  for (let index = 0; index < rows.length; index += 500) {
    const batch = rows.slice(index, index + 500)
    const { error } = await supabase.from(table).upsert(batch, { onConflict: conflict })
    if (error) throw new Error(\`Nạp \${table}: \${error.message}\`)
    written += batch.length
  }
  return written
}

async function seedReading() {
  const testRows = reading.tests.map(test => ({
    skill: 'reading',
    slug: test.slug,
    series: test.series,
    series_no: test.seriesNo,
    title: test.title,
    description: test.description,
    level: test.level,
    duration_minutes: test.durationMinutes,
    test_type: test.testType,
    question_count: test.questionCount,
    status: 'published',
    sort_order: test.sortOrder,
  }))
  await writeInBatches('skill_tests', testRows, 'slug')

  const { data: tests } = await supabase.from('skill_tests').select('id,slug')
  const idBySlug = new Map(tests.map(test => [test.slug, test.id]))

  const sectionRows = []
  for (const test of reading.tests) {
    const testId = idBySlug.get(test.slug)
    for (const passage of test.passages) {
      sectionRows.push({
        test_id: testId,
        section_no: passage.sectionNo,
        title: passage.title,
        topic: '',
        content_html: passage.contentHtml,
        source_id: passage.sourceId,
      })
    }
  }
  const writtenSections = await writeInBatches('skill_sections', sectionRows, 'test_id,section_no')

  const { data: sections } = await supabase.from('skill_sections').select('id,source_id')
  const sectionIdBySource = new Map(sections.map(section => [section.source_id, section.id]))

  const groupRows = []
  for (const test of reading.tests) {
    for (const passage of test.passages) {
      const sectionId = sectionIdBySource.get(passage.sourceId)
      for (const group of passage.groups) {
        groupRows.push({
          section_id: sectionId,
          order_index: group.order,
          instruction_html: group.instructionHtml,
          display_type: group.displayType,
          config: group.config,
        })
      }
    }
  }
  const writtenGroups = await writeInBatches('skill_question_groups', groupRows, 'section_id,order_index')

  const { data: groups } = await supabase.from('skill_question_groups').select('id,section_id,order_index')
  const groupIdByKey = new Map(groups.map(group => [`\`\${group.section_id}:\${group.order_index}\`, group.id]))

  const questionRows = []
  for (const test of reading.tests) {
    for (const passage of test.passages) {
      const sectionId = sectionIdBySource.get(passage.sourceId)
      for (const group of passage.groups) {
        const groupId = groupIdByKey.get(`\`\${sectionId}:\${group.order}\`)
        for (const question of group.questions) {
          questionRows.push({
            group_id: groupId,
            order_index: question.order,
            source_number: question.sourceNumber,
            question_type: question.type,
            display_type: question.displayType,
            prompt: question.prompt,
            question_html: question.questionHtml,
            options: question.options,
            answer_key: question.answerKey,
            accepted_answers: [],
            explanation: question.explanation,
          })
        }
      }
    }
  }
  const writtenQuestions = await writeInBatches('skill_questions', questionRows, 'group_id,order_index')

  return { tests: testRows.length, sections: writtenSections, groups: writtenGroups, questions: writtenQuestions }
}

const result = await seedReading()
console.log(\`Reading: \${result.tests} test · \${result.sections} passage · \${result.groups} nhóm · \${result.questions} câu\`)

const { count } = await supabase.from('skill_questions').select('id', { count: 'exact', head: true })
console.log(\`Tổng \${count ?? 0} câu hỏi trong skill_questions\`)
```

- [ ] **Step 2: Thêm script npm**

`package.json`, scripts:

```json
"db:seed:skills": "node --env-file-if-exists=.env.local supabase/seed/seed-skills.mjs",
```

- [ ] **Step 3: Nạp dữ liệu**

```bash
npm run db:migrate
npm run db:seed:skills
```

Expected:

```
Reading: 77 test · 233 passage · 582 nhóm · 2998 câu
Tổng 2998 câu hỏi trong skill_questions
```

> Lần đầu nạp mất vài chục giây (3000 câu, chia lô 500 dòng). Chạy lại là idempotent nhờ `upsert`.

- [ ] **Step 4: Kiểm tra đáp án không lộ ra ngoài**

```bash
node --env-file-if-exists=.env.local -e "
const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_PUBLISHABLE_KEY;
fetch(url + '/rest/v1/skill_questions?select=answer_key&limit=1', { headers: { apikey: key, Authorization: 'Bearer ' + key } })
  .then(r => r.text()).then(t => console.log('body:', t.slice(0, 200)))
"
```

Expected: body chứa lỗi quyền cột, **không** chứa giá trị đáp án.

- [ ] **Step 5: Commit**

```bash
git add supabase/seed/seed-skills.mjs package.json
git commit -m "feat(skills): seed the full reading library"
```

---

## Task 5: Logic chấm điểm + Edge Function `grade-skill`

**Files:**
- Create: `supabase/functions/_shared/skillGrading.ts`
- Create: `supabase/functions/_shared/tests/skillGrading.test.ts`
- Modify: `supabase/functions/_shared/schemas.ts`
- Modify: `supabase/functions/_shared/http.ts`
- Create: `supabase/functions/grade-skill/index.ts`
- Create: `supabase/functions/grade-skill/deno.json`

- [ ] **Step 1: Viết test đỏ cho logic chấm**

`supabase/functions/_shared/tests/skillGrading.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bandFromRaw, matchesAnswerKey } from '../skillGrading.ts'

test('bandFromRaw follows the Cambridge academic table', () => {
  assert.equal(bandFromRaw(40, 40), 9)
  assert.equal(bandFromRaw(37, 40), 8.5)
  assert.equal(bandFromRaw(35, 40), 8)
  assert.equal(bandFromRaw(30, 40), 7)
  assert.equal(bandFromRaw(23, 40), 6)
  assert.equal(bandFromRaw(0, 40), 2)
})

test('bandFromRaw uses the general table for general tests', () => {
  assert.equal(bandFromRaw(40, 40, 'general'), 9)
  assert.equal(bandFromRaw(39, 40, 'general'), 8.5)
  assert.equal(bandFromRaw(37, 40, 'general'), 8)
  assert.equal(bandFromRaw(30, 40, 'general'), 6)
})

test('bandFromRaw scales partial tests to 40 questions', () => {
  // 10/20 = 50% -> 20/40 -> band 5.5 theo bảng Cambridge
  assert.equal(bandFromRaw(10, 20), 5.5)
  assert.equal(bandFromRaw(0, 0), 0)
})

test('matchesAnswerKey accepts the tfng synonyms', () => {
  assert.equal(matchesAnswerKey('TRUE', 'TRUE'), true)
  assert.equal(matchesAnswerKey('true', 'TRUE'), true)
  assert.equal(matchesAnswerKey('YES', 'TRUE'), true)
  assert.equal(matchesAnswerKey('NO', 'FALSE'), true)
  assert.equal(matchesAnswerKey('NOT GIVEN', 'NOT GIVEN'), true)
  assert.equal(matchesAnswerKey('not given', 'NOT GIVEN'), true)
  assert.equal(matchesAnswerKey('TRUE', 'FALSE'), false)
  assert.equal(matchesAnswerKey('', 'TRUE'), false)
})

test('matchesAnswerKey accepts a single letter with or without a dot', () => {
  assert.equal(matchesAnswerKey('C', 'C'), true)
  assert.equal(matchesAnswerKey('c', 'C'), true)
  assert.equal(matchesAnswerKey('C.', 'C'), true)
  assert.equal(matchesAnswerKey('D', 'C'), false)
})

test('matchesAnswerKey expands the Cambridge optional-part notation', () => {
  assert.equal(matchesAnswerKey('answering the phone', 'answer(ing) (the) phone'), true)
  assert.equal(matchesAnswerKey('answer phone', 'answer(ing) (the) phone'), true)
  assert.equal(matchesAnswerKey('national holiday', 'national holidays'), false)
})

test('matchesAnswerKey accepts alternatives separated by a slash', () => {
  assert.equal(matchesAnswerKey('after eleven', "after 11(:00)/eleven (o'clock)"), true)
  assert.equal(matchesAnswerKey('after 11:00', "after 11(:00)/eleven (o'clock)"), true)
})

test('matchesAnswerKey accepts the [or] notation', () => {
  assert.equal(matchesAnswerKey('October 22', '22(nd) October [or] October 22(nd)'), true)
})

test('matchesAnswerKey requires every part of a multi-blank key', () => {
  assert.equal(matchesAnswerKey('Friday and Sunday', 'Friday + Sunday'), true)
  assert.equal(matchesAnswerKey('Sunday, Friday', 'Friday + Sunday'), true)
  assert.equal(matchesAnswerKey('Friday', 'Friday + Sunday'), false)
})

test('matchesAnswerKey ignores surrounding whitespace and letter case', () => {
  assert.equal(matchesAnswerKey('  pebble ', 'Pebble'), true)
  assert.equal(matchesAnswerKey('Pebbles', 'pebble'), false)
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test supabase/functions/_shared/tests/skillGrading.test.ts`
Expected: FAIL — `Cannot find module '.../skillGrading.ts'`.

- [ ] **Step 3: Viết module logic chấm**

`supabase/functions/_shared/skillGrading.ts`:

```ts
// Logic chấm điểm cho Reading / Listening.
//
// NGUỒN SỰ THẬT DUY NHẤT của quy tắc chấm. File này thuần (không import Deno,
// không import React) để chạy được trong Edge Function lẫn test của Node.
//
// Đáp án chỉ được đọc bằng service role trong Edge Function `grade-skill`;
// frontend không bao giờ nhận answer_key trước khi nộp bài.

export type SkillKind = "reading" | "listening";

export type GradingQuestion = {
  order: number;
  answerKey: string;
  acceptedAnswers: string[];
};

export type GradingResultItem = {
  order: number;
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
};

const ACADEMIC_BANDS: readonly (readonly [number, number])[] = [
  [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6],
  [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 2],
];

const GENERAL_BANDS: readonly (readonly [number, number])[] = [
  [40, 9], [39, 8.5], [37, 8], [36, 7.5], [34, 7], [32, 6.5], [30, 6],
  [27, 5.5], [23, 5], [19, 4.5], [15, 4], [12, 3.5], [9, 3], [6, 2.5], [0, 2],
];

/** Quy đổi số câu đúng sang band. Đề ngắn hơn 40 câu được quy về thang 40. */
export function bandFromRaw(
  correct: number,
  total: number,
  testType: "academic" | "general" = "academic",
): number {
  if (total <= 0) return 0;
  const scaled = Math.round((correct / total) * 40);
  const table = testType === "general" ? GENERAL_BANDS : ACADEMIC_BANDS;
  for (const [minimum, band] of table) {
    if (scaled >= minimum) return band;
  }
  return 0;
}

const normalize = (value: string): string => value.toLowerCase().replace(/\s+/g, " ").trim();

/** Expand mọi nhóm "(...)" thành biến thể có và không có phần trong ngoặc. */
function expandOptionalParens(text: string): string[] {
  const open = text.indexOf("(");
  if (open === -1) return [text];
  const close = text.indexOf(")", open);
  if (close === -1) return [text];
  const before = text.slice(0, open);
  const inner = text.slice(open + 1, close);
  const after = text.slice(close + 1);
  return [
    ...expandOptionalParens(before + inner + after),
    ...expandOptionalParens(before + after),
  ];
}

/**
 * "/" trong đáp án có thể thay cả cụm hoặc từng từ:
 * "after 11(:00)/eleven (o'clock)" = "after [11 | 11:00 | eleven | eleven o'clock]".
 */
function expandWordLevelSlashes(text: string): string[] {
  let phrases = [""];
  for (const token of text.split(/\s+/)) {
    const choices = token.includes("/") ? token.split("/").filter(Boolean) : [token];
    if (choices.length === 0) continue;
    phrases = phrases.flatMap((phrase) => choices.map((choice) => (phrase ? `${phrase} ${choice}` : choice)));
    if (phrases.length > 64) return [];
  }
  return phrases;
}

/** Tất cả dạng chuẩn hoá mà một đáp án kiểu Cambridge chấp nhận. */
export function expandAnswerKey(answerKey: string): string[] {
  const variants = new Set<string>();
  const addExpanded = (alternative: string) => {
    for (const variant of expandOptionalParens(alternative)) {
      const normalized = normalize(variant);
      if (normalized) variants.add(normalized);
    }
  };
  for (const phrase of answerKey.split(/\[or\]/i)) {
    for (const alternative of phrase.split("/")) addExpanded(alternative);
    if (phrase.includes("/")) {
      for (const alternative of expandWordLevelSlashes(phrase)) addExpanded(alternative);
    }
  }
  return [...variants];
}

/** Đáp án nhiều chỗ trống ("Friday + Sunday"): mọi phần đều phải có, thứ tự không quan trọng. */
function matchesMultiPartKey(userAnswer: string, keyParts: string[]): boolean {
  let userParts: string[] | null = null;
  for (const separator of [/\s*\+\s*/, /\s*&\s*/, /\s*,\s*/, /\s+and\s+/i]) {
    const parts = userAnswer.split(separator).map((part) => part.trim()).filter(Boolean);
    if (parts.length === keyParts.length) {
      userParts = parts;
      break;
    }
  }
  if (!userParts) return false;

  const used = new Array(keyParts.length).fill(false);
  const assign = (index: number): boolean => {
    if (index === userParts!.length) return true;
    for (let key = 0; key < keyParts.length; key += 1) {
      if (used[key]) continue;
      if (!matchesAnswerKey(userParts![index], keyParts[key])) continue;
      used[key] = true;
      if (assign(index + 1)) return true;
      used[key] = false;
    }
    return false;
  };
  return assign(0);
}

/** Các đáp án True/False/Not Given có nhóm từ đồng nghĩa. */
const TFNG_ALIASES: Readonly<Record<string, string>> = {
  true: "true",
  yes: "true",
  false: "false",
  no: "false",
  "not given": "not given",
  notgiven: "not given",
  "not-given": "not given",
};

/** So khớp câu trả lời của học viên với đáp án, không phân biệt hoa thường. */
export function matchesAnswerKey(
  userAnswer: string | null | undefined,
  answerKey: string | null | undefined,
): boolean {
  if (!userAnswer || !answerKey) return false;

  const multiParts = answerKey.split("+").map((part) => part.trim()).filter(Boolean);
  if (multiParts.length > 1) return matchesMultiPartKey(userAnswer.trim(), multiParts);

  const user = normalize(userAnswer.replace(/[()]/g, ""));
  if (!user) return false;

  const key = normalize(answerKey);
  if (!key) return false;

  const keyAlias = TFNG_ALIASES[key];
  if (keyAlias) return TFNG_ALIASES[user] === keyAlias;

  if (/^[a-f]$/.test(key)) {
    return user === key || user.startsWith(`${key} `) || user.startsWith(`${key}.`);
  }

  const keyParts = answerKey.split(",").map((part) => normalize(part)).filter(Boolean);
  if (keyParts.length > 1 && keyParts.every((part) => /^[a-z]$/.test(part))) {
    const userParts = user.split(",").map((part) => part.trim()).filter(Boolean);
    if (userParts.length > 1) {
      return [...userParts].sort().join(",") === [...keyParts].sort().join(",");
    }
    return keyParts.includes(user);
  }

  return expandAnswerKey(answerKey).includes(user);
}

/** Chấm một danh sách câu hỏi; trả về kết quả từng câu theo đúng thứ tự. */
export function gradeQuestions(
  questions: GradingQuestion[],
  answers: Record<string, string>,
): GradingResultItem[] {
  return questions.map((question) => {
    const userAnswer = (answers[String(question.order)] ?? "").trim();
    const key = question.answerKey ?? "";
    const accepted = question.acceptedAnswers ?? [];
    const isCorrect = Boolean(key) && (
      matchesAnswerKey(userAnswer, key) ||
      accepted.some((alternative) => matchesAnswerKey(userAnswer, alternative))
    );
    return {
      order: question.order,
      isCorrect,
      correctAnswer: key,
      userAnswer,
    };
  });
}
```

- [ ] **Step 4: Chạy test xanh**

Run: `node --test supabase/functions/_shared/tests/skillGrading.test.ts`
Expected: PASS — 10/10 test.

- [ ] **Step 5: Thêm `parseGradeSkill` vào schemas**

`supabase/functions/_shared/schemas.ts` — thêm vào cuối file:

```ts
export interface GradeSkillInput {
  testId: string;
  answers: Record<string, string>;
  timeSpentSeconds: number;
}

export function parseGradeSkill(input: unknown): GradeSkillInput {
  const record = asRecord(input);
  const testId = requiredUuid(record, "testId");
  const rawAnswers = record.answers;
  if (rawAnswers === null || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) {
    fail("answers", "answers must be an object");
  }
  const answers: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawAnswers as Record<string, unknown>)) {
    if (!/^\d{1,3}$/.test(key)) fail("answers", "answer keys must be question numbers");
    if (typeof value !== "string") fail("answers", "answer values must be strings");
    if (value.length > 200) fail("answers", "an answer is too long");
    answers[key] = value;
  }
  const timeSpentSeconds = record.timeSpentSeconds ?? 0;
  if (typeof timeSpentSeconds !== "number" || !Number.isFinite(timeSpentSeconds) || timeSpentSeconds < 0) {
    fail("timeSpentSeconds", "timeSpentSeconds must be a positive number");
  }
  return { testId, answers, timeSpentSeconds: Math.floor(timeSpentSeconds) };
}
```

- [ ] **Step 6: Thêm gợi ý cho các mã lỗi mới**

`supabase/functions/_shared/http.ts` — thêm vào `ERROR_HINTS`:

```ts
  test_not_found: "Reload the test list and open the test again.",
  test_unavailable: "This test is not available right now. Choose another one.",
  attempt_not_found: "Reload the attempt list and open the attempt again.",
```

- [ ] **Step 7: Viết Edge Function**

`supabase/functions/grade-skill/index.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAuthenticatedUser } from "../_shared/auth.ts";
import {
  AppError,
  databaseError,
  errorResponse,
  jsonResponse,
  preflightResponse,
  readJsonBody,
  requestId,
  requireMethod,
} from "../_shared/http.ts";
import { parseGradeSkill } from "../_shared/schemas.ts";
import { bandFromRaw, gradeQuestions, type GradingResultItem } from "../_shared/skillGrading.ts";

type QuestionRow = {
  id: string;
  group_id: string;
  order_index: number;
  answer_key: string | null;
  accepted_answers: string[] | null;
  explanation: string | null;
};

type GroupRow = { id: string; section_id: string; order_index: number };

/** Kết quả có kèm giải thích: cột `explanation` không mở cho client đọc. */
type GradedResultItem = GradingResultItem & { explanation: string };

/** Đọc nhóm + câu hỏi của một đề theo đúng thứ tự section → group → order. */
async function loadQuestions(service: SupabaseClient, testId: string): Promise<QuestionRow[]> {
  const sectionResult = await service
    .from("skill_sections")
    .select("id,section_no")
    .eq("test_id", testId)
    .order("section_no", { ascending: true });
  if (sectionResult.error) throw databaseError("load the test sections");
  const sections = (sectionResult.data ?? []) as { id: string; section_no: number }[];
  if (!sections.length) throw new AppError(404, "test_not_found", "This test has no sections");

  const groupResult = await service
    .from("skill_question_groups")
    .select("id,section_id,order_index")
    .in("section_id", sections.map(section => section.id))
    .order("order_index", { ascending: true });
  if (groupResult.error) throw databaseError("load the question groups");
  const groups = (groupResult.data ?? []) as GroupRow[];
  if (!groups.length) throw new AppError(404, "test_not_found", "This test has no questions");

  const questionResult = await service
    .from("skill_questions")
    .select("id,group_id,order_index,answer_key,accepted_answers,explanation")
    .in("group_id", groups.map(group => group.id))
    .order("order_index", { ascending: true });
  if (questionResult.error) throw databaseError("load the questions");

  const sectionNo = new Map(sections.map(section => [section.id, section.section_no]));
  const groupOrder = new Map(groups.map(group => [group.id, group.order_index]));
  return ((questionResult.data ?? []) as QuestionRow[]).slice().sort((left, right) => {
    const leftGroup = groups.find(group => group.id === left.group_id);
    const rightGroup = groups.find(group => group.id === right.group_id);
    const bySection = (sectionNo.get(leftGroup?.section_id ?? "") ?? 0) - (sectionNo.get(rightGroup?.section_id ?? "") ?? 0);
    if (bySection !== 0) return bySection;
    const byGroup = (groupOrder.get(left.group_id) ?? 0) - (groupOrder.get(right.group_id) ?? 0);
    if (byGroup !== 0) return byGroup;
    return left.order_index - right.order_index;
  });
}

/** Chấm và gắn thêm giải thích cho từng câu. */
function buildResults(rows: QuestionRow[], answers: Record<string, string>): GradedResultItem[] {
  const graded = gradeQuestions(
    rows.map((row, index) => ({
      order: index + 1,
      answerKey: row.answer_key ?? "",
      acceptedAnswers: row.accepted_answers ?? [],
    })),
    answers,
  );
  return graded.map((item, index) => ({
    ...item,
    explanation: rows[index].explanation ?? "",
  }));
}

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["GET", "POST"]);
    const context = await requireAuthenticatedUser(request);

    // GET /grade-skill với header x-attempt-id : xem lại một lần làm bài đã lưu.
    if (request.method === "GET") {
      const url = new URL(request.url);
      const attemptId = request.headers.get("x-attempt-id") ?? url.searchParams.get("attemptId") ?? "";
      if (!/^[0-9a-f-]{36}$/i.test(attemptId)) {
        throw new AppError(400, "invalid_request", "A valid attemptId is required");
      }
      const attemptResult = await context.service
        .from("skill_attempts")
        .select("id,test_id,skill,answers,correct_count,total_count,band")
        .eq("id", attemptId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (attemptResult.error) throw databaseError("load the attempt");
      const attempt = attemptResult.data;
      if (!attempt) throw new AppError(404, "attempt_not_found", "Attempt not found");

      const testResult = await context.service
        .from("skill_tests")
        .select("id,skill,title")
        .eq("id", attempt.test_id)
        .maybeSingle();
      if (testResult.error) throw databaseError("load the test");

      const rows = await loadQuestions(context.service, attempt.test_id as string);
      const results = buildResults(rows, (attempt.answers ?? {}) as Record<string, string>);
      return jsonResponse(
        request,
        200,
        {
          attemptId: attempt.id,
          skill: attempt.skill,
          title: testResult.data?.title ?? "",
          correctCount: attempt.correct_count,
          totalCount: attempt.total_count,
          band: attempt.band === null ? null : Number(attempt.band),
          results,
        },
        { requestId: id },
      );
    }

    // POST /grade-skill : chấm bài mới và lưu lịch sử.
    const input = parseGradeSkill(await readJsonBody(request));

    const testResult = await context.service
      .from("skill_tests")
      .select("id,skill,title,test_type,status")
      .eq("id", input.testId)
      .maybeSingle();
    if (testResult.error) throw databaseError("load the test");
    const test = testResult.data;
    if (!test) throw new AppError(404, "test_not_found", "Test not found");
    if (test.status !== "published") {
      throw new AppError(409, "test_unavailable", "This test is not available right now");
    }

    const rows = await loadQuestions(context.service, input.testId);
    const results = buildResults(rows, input.answers);

    const correctCount = results.filter(item => item.isCorrect).length;
    const band = results.length
      ? bandFromRaw(correctCount, results.length, test.test_type === "general" ? "general" : "academic")
      : null;

    const attemptResult = await context.service
      .from("skill_attempts")
      .insert({
        user_id: context.userId,
        test_id: input.testId,
        skill: test.skill,
        answers: input.answers,
        correct_count: correctCount,
        total_count: results.length,
        band,
        time_spent_seconds: input.timeSpentSeconds,
      })
      .select("id,created_at")
      .maybeSingle();
    if (attemptResult.error) throw databaseError("save the attempt");

    return jsonResponse(
      request,
      200,
      {
        attemptId: attemptResult.data?.id ?? null,
        skill: test.skill,
        title: test.title,
        correctCount,
        totalCount: results.length,
        band,
        results,
      },
      { requestId: id },
    );
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
```

`supabase/functions/grade-skill/deno.json` — copy nguyên văn từ `supabase/functions/admin-users/deno.json`:

```json
{
  "imports": {
    "@supabase/supabase-js": "npm:@supabase/supabase-js@2.118.0"
  },
  "compilerOptions": {
    "strict": true,
    "lib": ["deno.window", "deno.ns", "dom", "dom.iterable", "esnext"]
  },
  "tasks": {
    "test:node": "node --test \"supabase/functions/_shared/tests/*.test.ts\""
  }
}
```

- [ ] **Step 8: Chạy test edge**

Run: `npm run test:edge`
Expected: PASS — không test nào đỏ.

- [ ] **Step 9: Deploy Edge Function**

```bash
npm run db:deploy
```

Expected: `grade-skill` được liệt kê trong output deploy.

- [ ] **Step 9: Commit**

```bash
git add supabase/functions/_shared/skillGrading.ts supabase/functions/_shared/tests/skillGrading.test.ts supabase/functions/_shared/schemas.ts supabase/functions/_shared/http.ts supabase/functions/grade-skill
git commit -m "feat(skills): grade reading and listening attempts server-side"
```

---

## Task 6: Repository đọc đề + API client

**Files:**
- Create: `src/lib/skillRepository.ts`
- Create: `src/lib/skillApi.ts`
- Create: `tests/skillRepository.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Viết test đỏ**

`tests/skillRepository.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadSkillTest, loadSkillTests, type SkillSource } from '../src/lib/skillRepository.ts'

const source: SkillSource = { url: 'https://demo.test', key: 'test-key' }

/** Stub fetch trả body khác nhau theo bảng được truy vấn. */
function stubFetch(routes: Record<string, unknown>, capture?: (url: string) => void) {
  const original = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input)
    capture?.(url)
    const table = Object.keys(routes).find(name => url.includes(`/rest/v1/${name}?`))
    const body = table ? routes[table] : []
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }) as typeof fetch
  return () => { globalThis.fetch = original }
}

test('repository lists published tests of one skill', async () => {
  let seen = ''
  const restore = stubFetch(
    { skill_tests: [{ id: 't1', slug: 'cam-9-1', skill: 'reading', series: 'Cambridge', series_no: 9, title: 'Cambridge 9 - Test 1', description: '', level: 'Band 5.5-8.0', duration_minutes: 60, test_type: 'academic', question_count: 40, status: 'published' }] },
    url => { seen = url },
  )
  try {
    const tests = await loadSkillTests('reading', source)
    assert.equal(tests.length, 1)
    assert.equal(tests[0].slug, 'cam-9-1')
    assert.equal(tests[0].series, 'Cambridge')
    assert.equal(tests[0].questionCount, 40)
    assert.match(seen, /skill=eq\.reading/)
    assert.match(seen, /status=eq\.published/)
  } finally {
    restore()
  }
})

test('repository never asks for the answer columns', async () => {
  const seen: string[] = []
  const restore = stubFetch(
    {
      skill_tests: [{ id: 't1', slug: 'cam-9-1', skill: 'reading', series: 'Cambridge', series_no: 9, title: 'Cambridge 9 - Test 1', description: '', level: '', duration_minutes: 60, test_type: 'academic', question_count: 40, status: 'published' }],
      skill_sections: [{ id: 's1', test_id: 't1', section_no: 1, title: 'Stepwells', topic: '', content_html: '<p>x</p>', audio_path: '', transcript: '' }],
      skill_question_groups: [{ id: 'g1', section_id: 's1', order_index: 1, instruction_html: '<p>Questions 1–13</p>', display_type: 'tfng', config: {} }],
      skill_questions: [{ id: 'q1', group_id: 'g1', order_index: 1, question_type: 'tfng', display_type: 'tfng', prompt: 'Statement', question_html: '', options: [], locator: '' }],
    },
    url => { seen.push(url) },
  )
  try {
    await loadSkillTest('cam-9-1', source)
    assert.equal(seen.length, 4)
    for (const url of seen) {
      assert.doesNotMatch(url, /answer_key/)
      assert.doesNotMatch(url, /accepted_answers/)
      assert.doesNotMatch(url, /explanation/)
    }
  } finally {
    restore()
  }
})

test('repository maps a test with sections, groups and questions', async () => {
  const restore = stubFetch({
    skill_tests: [{ id: 't1', slug: 'cam-9-1', skill: 'reading', series: 'Cambridge', series_no: 9, title: 'Cambridge 9 - Test 1', description: '', level: '', duration_minutes: 60, test_type: 'academic', question_count: 1, status: 'published' }],
    skill_sections: [{ id: 's1', test_id: 't1', section_no: 1, title: 'Stepwells', topic: 'Culture', content_html: '<p>first</p>', audio_path: '', transcript: '' }],
    skill_question_groups: [{ id: 'g1', section_id: 's1', order_index: 1, instruction_html: '<p>Questions 1–13</p>', display_type: 'tfng', config: { qStart: 1 } }],
    skill_questions: [{ id: 'q1', group_id: 'g1', order_index: 1, question_type: 'tfng', display_type: 'tfng', prompt: 'Statement', question_html: '', options: [], locator: '' }],
  })
  try {
    const test = await loadSkillTest('cam-9-1', source)
    assert.ok(test)
    assert.equal(test.sections.length, 1)
    assert.equal(test.sections[0].groups.length, 1)
    assert.equal(test.sections[0].groups[0].questions.length, 1)
    assert.equal(test.sections[0].groups[0].questions[0].type, 'tfng')
    assert.equal(test.sections[0].groups[0].questions[0].options.length, 0)
  } finally {
    restore()
  }
})

test('repository returns null when the test does not exist', async () => {
  const restore = stubFetch({ skill_tests: [] })
  try {
    assert.equal(await loadSkillTest('missing', source), null)
  } finally {
    restore()
  }
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test tests/skillRepository.test.ts`
Expected: FAIL — `Cannot find module '.../src/lib/skillRepository.ts'`.

- [ ] **Step 3: Viết repository**

`src/lib/skillRepository.ts`:

```ts
// Đọc đề Reading từ PostgREST.
//
// Bảng skill_questions chỉ cấp quyền đọc cho các cột KHÔNG chứa đáp án, nên
// mọi truy vấn ở đây đều ghi tên cột tường minh — không dùng select=* cho bảng này.

import {
  parseOptions,
  type SkillDisplayType,
  type SkillKind,
  type SkillQuestion,
  type SkillQuestionGroup,
  type SkillQuestionType,
  type SkillSection,
  type SkillTest,
} from './skillLogic.ts'

export type SkillSource = { url: string; key: string }

type TestRow = {
  id: string
  slug: string
  skill: SkillKind
  series: string | null
  series_no: number | null
  title: string
  description: string | null
  level: string | null
  duration_minutes: number
  test_type: 'academic' | 'general'
  question_count: number | null
  status: string
}

type SectionRow = {
  id: string
  test_id: string
  section_no: number
  title: string | null
  topic: string | null
  content_html: string | null
  audio_path: string | null
  transcript: string | null
}

type GroupRow = {
  id: string
  section_id: string
  order_index: number
  instruction_html: string | null
  display_type: string | null
}

type QuestionRow = {
  id: string
  group_id: string
  order_index: number
  source_number: number | null
  question_type: string | null
  display_type: string | null
  prompt: string | null
  question_html: string | null
  options: unknown
}

const TEST_COLUMNS = 'id,slug,skill,series,series_no,title,description,level,duration_minutes,test_type,question_count,status'
const SECTION_COLUMNS = 'id,test_id,section_no,title,topic,content_html,audio_path,transcript'
const GROUP_COLUMNS = 'id,section_id,order_index,instruction_html,display_type'
const QUESTION_COLUMNS = 'id,group_id,order_index,source_number,question_type,display_type,prompt,question_html,options'

/** Nguồn mặc định lấy từ biến môi trường Vite (được inject lúc build). */
export function defaultSkillSource(): SkillSource | null {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {}
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
  return url && key ? { url, key } : null
}

async function request(source: SkillSource, path: string, params: URLSearchParams): Promise<unknown[]> {
  try {
    const response = await fetch(`${source.url}/rest/v1/${path}?${params.toString()}`, {
      headers: { apikey: source.key, Authorization: `Bearer ${source.key}` },
    })
    if (!response.ok) return []
    return (await response.json()) as unknown[]
  } catch {
    return []
  }
}

function toTest(row: TestRow): SkillTest {
  return {
    id: row.id,
    slug: row.slug,
    skill: row.skill,
    series: row.series ?? '',
    seriesNo: row.series_no ?? 0,
    title: row.title,
    description: row.description ?? '',
    level: row.level ?? '',
    durationMinutes: row.duration_minutes,
    testType: row.test_type,
    questionCount: row.question_count ?? 0,
    sections: [],
  }
}

/** Danh sách đề đang publish của một kỹ năng. */
export async function loadSkillTests(skill: SkillKind, source = defaultSkillSource()): Promise<SkillTest[]> {
  if (!source) return []
  const params = new URLSearchParams({ select: TEST_COLUMNS, skill: `eq.${skill}`, status: 'eq.published', order: 'sort_order.asc' })
  const rows = await request(source, 'skill_tests', params)
  return (rows as TestRow[]).map(toTest)
}

/** Một đề đầy đủ: passage, nhóm câu hỏi và câu hỏi. Trả về null nếu không tìm thấy. */
export async function loadSkillTest(slug: string, source = defaultSkillSource()): Promise<SkillTest | null> {
  if (!source) return null
  const testRows = await request(source, 'skill_tests', new URLSearchParams({ select: TEST_COLUMNS, slug: `eq.${slug}` }))
  const testRow = (testRows as TestRow[])[0]
  if (!testRow) return null

  const sectionRows = await request(source, 'skill_sections', new URLSearchParams({ select: SECTION_COLUMNS, test_id: `eq.${testRow.id}`, order: 'section_no.asc' }))
  const sections = sectionRows as SectionRow[]
  if (!sections.length) return { ...toTest(testRow), sections: [] }

  const groupRows = await request(source, 'skill_question_groups', new URLSearchParams({
    select: GROUP_COLUMNS,
    section_id: `in.(${sections.map(section => section.id).join(',')})`,
    order: 'order_index.asc',
  }))
  const groups = groupRows as GroupRow[]

  const questionRows = groups.length
    ? await request(source, 'skill_questions', new URLSearchParams({
      select: QUESTION_COLUMNS,
      group_id: `in.(${groups.map(group => group.id).join(',')})`,
      order: 'order_index.asc',
    }))
    : []
  const questions = questionRows as QuestionRow[]

  const mappedSections: SkillSection[] = sections.map(section => ({
    id: section.id,
    sectionNo: section.section_no,
    title: section.title ?? '',
    topic: section.topic ?? '',
    contentHtml: section.content_html ?? '',
    audioPath: section.audio_path ?? '',
    hasTranscript: Boolean((section.transcript ?? '').trim()),
    groups: groups
      .filter(group => group.section_id === section.id)
      .map<SkillQuestionGroup>(group => ({
        id: group.id,
        order: group.order_index,
        instructionHtml: group.instruction_html ?? '',
        displayType: (group.display_type ?? 'fill-blank') as SkillDisplayType,
        questions: questions
          .filter(question => question.group_id === group.id)
          .map<SkillQuestion>(question => ({
            id: question.id,
            order: question.order_index,
            sourceNumber: question.source_number ?? question.order_index,
            type: (question.question_type ?? 'fill') as SkillQuestionType,
            displayType: (question.display_type ?? 'fill-blank') as SkillDisplayType,
            prompt: question.prompt ?? '',
            questionHtml: question.question_html ?? '',
            options: parseOptions(question.options),
            explanation: '',
          })),
      })),
  }))

  return { ...toTest(testRow), sections: mappedSections }
}
```

> `explanation` không có trong `QUESTION_COLUMNS` vì cột đó chỉ dùng ở kết quả sau khi nộp (server trả về).

- [ ] **Step 4: Chạy test xanh**

Run: `node --test tests/skillRepository.test.ts`
Expected: PASS — 4/4 test.

- [ ] **Step 5: Viết API client**

`src/lib/skillApi.ts`:

```ts
// Gọi Edge Function `grade-skill` và đọc lịch sử làm bài.

import { supabase } from './supabase'

export type SkillResultItem = {
  order: number
  isCorrect: boolean
  correctAnswer: string
  userAnswer: string
  explanation: string
}

export type SkillGrade = {
  attemptId: string | null
  skill: 'reading' | 'listening'
  title: string
  correctCount: number
  totalCount: number
  band: number | null
  results: SkillResultItem[]
}

export type SkillAttempt = {
  id: string
  skill: 'reading' | 'listening'
  testId: string
  correctCount: number
  totalCount: number
  band: number | null
  createdAt: string
}

export type GradeResult = { ok: true; value: SkillGrade } | { ok: false; code: string }

/** Mã lỗi do Edge Function trả về; mất thì dùng 'unknown_error'. */
function errorCode(error: unknown): string {
  const context = (error as { context?: { code?: string } } | null)?.context
  return context?.code ?? 'unknown_error'
}

/** Nộp bài để chấm. Server chấm và lưu lịch sử, client không tự tính điểm. */
export async function gradeSkill(input: {
  testId: string
  answers: Record<string, string>
  timeSpentSeconds: number
}): Promise<GradeResult> {
  try {
    const { data, error } = await supabase.functions.invoke('grade-skill', {
      body: { testId: input.testId, answers: input.answers, timeSpentSeconds: input.timeSpentSeconds },
    })
    if (error) return { ok: false, code: errorCode(error) }
    return { ok: true, value: (data ?? null) as SkillGrade }
  } catch {
    return { ok: false, code: 'unknown_error' }
  }
}

/** Xem lại một lần làm bài đã lưu (server chấm lại từ đáp án đã lưu). */
export async function loadSkillGrade(attemptId: string): Promise<SkillGrade | null> {
  try {
    const { data, error } = await supabase.functions.invoke('grade-skill', {
      method: 'GET',
      headers: { 'x-attempt-id': attemptId },
    })
    if (error || !data) return null
    return data as SkillGrade
  } catch {
    return null
  }
}

/** Lịch sử làm bài của người dùng, mới nhất trước. */
export async function loadSkillAttempts(skill?: 'reading' | 'listening'): Promise<SkillAttempt[]> {
  const query = supabase
    .from('skill_attempts')
    .select('id,skill,test_id,correct_count,total_count,band,created_at')
    .order('created_at', { ascending: false })
    .limit(50)
  const { data, error } = skill ? await query.eq('skill', skill) : await query
  if (error) return []
  return (data ?? []).map(row => ({
    id: row.id as string,
    skill: row.skill as 'reading' | 'listening',
    testId: row.test_id as string,
    correctCount: row.correct_count as number,
    totalCount: row.total_count as number,
    band: row.band === null || row.band === undefined ? null : Number(row.band),
    createdAt: row.created_at as string,
  }))
}
```

- [ ] **Step 6: Thêm test vào `npm test`**

`package.json` — thêm `tests/skillRepository.test.ts` vào script `test`:

```json
"test": "node --test tests/learning.test.ts tests/auth.test.ts tests/sync.test.ts tests/ai.test.ts tests/vocabulary.test.ts tests/vocabularyRepository.test.ts tests/skillLogic.test.ts tests/skillRepository.test.ts tests/agent.test.ts tests/negotiation.test.ts tests/middleware.test.ts tests/discovery.test.ts tests/admin.test.ts",
```

- [ ] **Step 7: Chạy toàn bộ test**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/skillRepository.ts src/lib/skillApi.ts tests/skillRepository.test.ts package.json
git commit -m "feat(skills): read test content and submit attempts"
```

---

## Task 7: Thành phần giao diện dùng chung

**Files:**
- Create: `src/components/skill/PassagePanel.tsx`
- Create: `src/components/skill/QuestionGroup.tsx`
- Create: `src/components/skill/QuestionCard.tsx`
- Create: `src/components/skill/TestTimer.tsx`
- Create: `src/components/skill/ReviewSheet.tsx`
- Create: `src/components/skill/AudioPlayer.tsx`
- Create: `src/components/skill/SkillResult.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Viết `PassagePanel.tsx`**

`src/components/skill/PassagePanel.tsx`:

```tsx
import { useMemo } from 'react'
import { sanitizeHtml, type SkillSection } from '../../lib/skillLogic.ts'

export function PassagePanel({ section }: { section: SkillSection }) {
  const html = useMemo(() => sanitizeHtml(section.contentHtml), [section.contentHtml])
  return <div className="skill-passage">
    <header className="skill-passage-head">
      <p className="eyebrow">{section.title}</p>
      {section.topic && <p className="muted">{section.topic}</p>}
    </header>
    <div className="skill-passage-body" dangerouslySetInnerHTML={{ __html: html }} />
  </div>
}
```

- [ ] **Step 2: Viết `QuestionCard.tsx`**

`src/components/skill/QuestionCard.tsx`:

```tsx
import { Flag } from 'lucide-react'
import { useCopy } from '../../i18n'
import type { SkillQuestion } from '../../lib/skillLogic.ts'

const TFNG_OPTIONS = ['TRUE', 'FALSE', 'NOT GIVEN'] as const
const YNNG_OPTIONS = ['YES', 'NO', 'NOT GIVEN'] as const

export function QuestionCard({
  question,
  number,
  value,
  flagged,
  onAnswer,
  onToggleFlag,
}: {
  question: SkillQuestion
  number: number
  value: string
  flagged: boolean
  onAnswer: (value: string) => void
  onToggleFlag: () => void
}) {
  const { c } = useCopy()
  const selected = value ?? ''
  const chips = question.type === 'ynng' ? YNNG_OPTIONS : TFNG_OPTIONS
  return <article className="skill-question" id={`question-${number}`}>
    <header className="skill-question-head">
      <span className={`skill-question-number ${selected ? 'is-answered' : ''}`}>{number}</span>
      <div className="skill-question-text">
        {question.prompt && <p className="skill-question-prompt">{question.prompt}</p>}
      </div>
      <button
        type="button"
        className={`skill-flag ${flagged ? 'is-active' : ''}`}
        onClick={onToggleFlag}
        aria-pressed={flagged}
        aria-label={flagged ? c('Bỏ đánh dấu câu này', 'Remove the flag from this question') : c('Đánh dấu câu này để xem lại', 'Flag this question for review')}
      >
        <Flag size={16} />
      </button>
    </header>

    {(question.type === 'tfng' || question.type === 'ynng') && <div className="skill-tfng">
      {chips.map(option => <button
        key={option}
        type="button"
        className={`skill-chip ${selected === option ? 'is-selected' : ''}`}
        onClick={() => onAnswer(option)}
      >{option}</button>)}
    </div>}

    {question.type === 'mcq' && <div className="skill-options">
      {question.options.map(option => <label key={option.key} className={`skill-option ${selected === option.key ? 'is-selected' : ''}`}>
        <input type="radio" name={`question-${number}`} value={option.key} checked={selected === option.key} onChange={() => onAnswer(option.key)} />
        <span><strong>{option.key}.</strong> {option.text}</span>
      </label>)}
    </div>}

    {question.type === 'matching' && <div className="skill-options">
      <label className={`skill-option ${selected ? 'is-selected' : ''}`}>
        <select value={selected} onChange={event => onAnswer(event.target.value)} aria-label={c('Chọn đáp án', 'Choose an answer')}>
          <option value="">{c('— Chọn đáp án —', '— Choose an answer —')}</option>
          {question.options.map(option => <option key={option.key} value={option.key}>{option.key}. {option.text}</option>)}
        </select>
      </label>
    </div>}

    {question.type === 'fill' && <div className="skill-fill">
      <input
        type="text"
        value={selected}
        onChange={event => onAnswer(event.target.value)}
        placeholder={c('Nhập đáp án của bạn', 'Type your answer')}
        aria-label={c('Đáp án câu', 'Your answer')}
      />
    </div>}
  </article>
}
```

- [ ] **Step 3: Viết `QuestionGroup.tsx`**

Đây là phần xử lý các dạng completion (note/table/summary/sentence) có ô trống nằm trong HTML.

Hai điều đã kiểm chứng trên dữ liệu thật:
1. **Chỉ câu đầu nhóm mang `questionHtml` đầy đủ** — các câu sau có `questionHtml` rỗng. Vì vậy nhóm lấy HTML của câu đầu tiên *có* HTML.
2. **Số trong chỗ trống là số câu của đề gốc** (`31_______`), khớp `sourceNumber`. Số hiển thị của app lại là số thứ tự toàn đề (1..N) nên phải ánh xạ qua `sourceNumber`.

`src/components/skill/QuestionGroup.tsx`:

```tsx
import { useMemo } from 'react'
import { Flag } from 'lucide-react'
import { useCopy } from '../../i18n'
import { sanitizeHtml, splitHtmlByBlanks, type SkillQuestionGroup } from '../../lib/skillLogic.ts'
import { QuestionCard } from './QuestionCard.tsx'

/** Các dạng completion có ô trống nằm trong HTML của nhóm. */
const INLINE_TYPES = new Set([
  'note-completion', 'table-completion', 'summary-completion', 'sentence-completion', 'sentence-ending',
])

export function QuestionGroup({
  group,
  numbers,
  bySourceNumber,
  answers,
  flagged,
  onAnswer,
  onToggleFlag,
}: {
  group: SkillQuestionGroup
  numbers: Record<string, number>
  /** Số câu gốc -> id câu, dựng RIÊNG cho passage đang hiển thị. */
  bySourceNumber: Record<number, string>
  answers: Record<string, string>
  flagged: Set<string>
  onAnswer: (questionId: string, value: string) => void
  onToggleFlag: (questionId: string) => void
}) {
  const { c } = useCopy()
  const instruction = useMemo(() => sanitizeHtml(group.instructionHtml), [group.instructionHtml])
  const html = useMemo(() => {
    const first = group.questions.find(question => question.questionHtml.trim())
    return sanitizeHtml(first?.questionHtml ?? '')
  }, [group.questions])
  const segments = useMemo(() => splitHtmlByBlanks(html), [html])

  // Số trong chỗ trống là số câu của đề gốc.
  const blankIds = useMemo(() => {
    const ids = new Set<string>()
    for (const segment of segments) {
      if (segment.kind !== 'blank') continue
      const id = bySourceNumber[segment.questionId]
      if (id) ids.add(id)
    }
    return ids
  }, [segments, bySourceNumber])

  const inlineQuestions = group.questions.filter(question => blankIds.has(question.id))
  const fallbackQuestions = group.questions.filter(question => !blankIds.has(question.id))
  const useInline = INLINE_TYPES.has(group.displayType) && inlineQuestions.length > 0

  return <section className="skill-group">
    {instruction && <div className="skill-group-instruction" dangerouslySetInnerHTML={{ __html: instruction }} />}

    {useInline && <div className="skill-completion">
      {segments.map((segment, index) => {
        if (segment.kind === 'html') return <span key={index} dangerouslySetInnerHTML={{ __html: segment.html }} />
        const id = bySourceNumber[segment.questionId] ?? ''
        return <input
          key={index}
          className="skill-inline-input"
          type="text"
          value={id ? answers[id] ?? '' : ''}
          onChange={event => onAnswer(id, event.target.value)}
          aria-label={c(`Đáp án câu ${segment.questionId}`, `Answer for question ${segment.questionId}`)}
          placeholder="________"
        />
      })}
    </div>}

    {fallbackQuestions.map(question => <QuestionCard
      key={question.id}
      question={question}
      number={numbers[question.id] ?? 0}
      value={answers[question.id] ?? ''}
      flagged={flagged.has(question.id)}
      onAnswer={value => onAnswer(question.id, value)}
      onToggleFlag={() => onToggleFlag(question.id)}
    />)}

    {useInline && fallbackQuestions.length === 0 && <ul className="skill-group-list">
      {group.questions.map(question => <li key={question.id}>
        <span className="skill-question-number">{numbers[question.id] ?? 0}</span>
        <span className="skill-group-prompt">{question.prompt}</span>
        <button
          type="button"
          className={`skill-flag ${flagged.has(question.id) ? 'is-active' : ''}`}
          onClick={() => onToggleFlag(question.id)}
          aria-pressed={flagged.has(question.id)}
          aria-label={c('Đánh dấu câu này để xem lại', 'Flag this question for review')}
        >
          <Flag size={15} />
        </button>
      </li>)}
    </ul>}
  </section>
}
```

- [ ] **Step 4: Viết `TestTimer.tsx`**

`src/components/skill/TestTimer.tsx`:

```tsx
import { useCopy } from '../../i18n'
import { formatClock } from '../../lib/skillLogic.ts'

export function TestTimer({ seconds, durationMinutes }: { seconds: number; durationMinutes: number }) {
  const { c } = useCopy()
  const low = seconds <= 300
  const percent = durationMinutes > 0 ? Math.max(0, Math.min(100, (seconds / (durationMinutes * 60)) * 100)) : 0
  return <div className={`skill-timer ${low ? 'is-low' : ''}`}>
    <span className="skill-timer-label">{c('Thời gian còn lại', 'Time left')}</span>
    <span className="skill-timer-value">{formatClock(seconds)}</span>
    <span className="skill-timer-bar"><span style={{ width: `${percent}%` }} /></span>
  </div>
}
```

- [ ] **Step 5: Viết `ReviewSheet.tsx`**

`src/components/skill/ReviewSheet.tsx`:

```tsx
import { useCopy } from '../../i18n'

export function ReviewSheet({
  questions,
  numbers,
  answers,
  flagged,
  onJump,
}: {
  questions: { id: string }[]
  numbers: Record<string, number>
  answers: Record<string, string>
  flagged: Set<string>
  onJump: (number: number) => void
}) {
  const { c } = useCopy()
  return <div className="skill-review">
    <p className="eyebrow">{c('Rà soát câu trả lời', 'Answer review')}</p>
    <div className="skill-review-grid">
      {questions.map(question => {
        const number = numbers[question.id] ?? 0
        const answered = Boolean(answers[question.id]?.trim())
        const isFlagged = flagged.has(question.id)
        const state = isFlagged ? 'flagged' : answered ? 'answered' : 'empty'
        return <button
          key={question.id}
          type="button"
          className={`skill-review-cell is-${state}`}
          onClick={() => onJump(number)}
          aria-label={c(`Câu ${number}`, `Question ${number}`)}
        >{number}</button>
      })}
    </div>
    <ul className="skill-review-legend">
      <li><span className="is-answered" />{c('Đã trả lời', 'Answered')}</li>
      <li><span className="is-flagged" />{c('Đã gắn cờ', 'Flagged')}</li>
      <li><span className="is-empty" />{c('Chưa trả lời', 'Unanswered')}</li>
    </ul>
  </div>
}
```

- [ ] **Step 6: Viết `SkillResult.tsx`**

`src/components/skill/SkillResult.tsx`:

```tsx
import { Check, X } from 'lucide-react'
import { useCopy } from '../../i18n'
import type { SkillGrade } from '../../lib/skillApi.ts'

export function SkillResult({ grade }: { grade: SkillGrade }) {
  const { c } = useCopy()
  const percent = grade.totalCount ? Math.round((grade.correctCount / grade.totalCount) * 100) : 0
  return <div className="skill-result">
    <section className="panel skill-result-summary">
      <p className="eyebrow">{c('KẾT QUẢ', 'RESULT')}</p>
      <h2>{grade.title}</h2>
      <p className="skill-result-band">{grade.band === null ? '—' : grade.band.toFixed(1)}</p>
      <p className="muted">{c('Đúng', 'Correct')}: {grade.correctCount}/{grade.totalCount} ({percent}%)</p>
    </section>
    <section className="panel">
      <h3>{c('Xem lại từng câu', 'Review each question')}</h3>
      <ol className="skill-result-list">
        {grade.results.map(item => <li key={item.order} className={item.isCorrect ? 'is-correct' : 'is-wrong'}>
          <span className="skill-result-icon">{item.isCorrect ? <Check size={16} /> : <X size={16} />}</span>
          <div>
            <p className="skill-result-prompt">{c(`Câu ${item.order}`, `Question ${item.order}`)}</p>
            <p className="muted">{c('Bạn trả lời', 'Your answer')}: {item.userAnswer || c('(không trả lời)', '(no answer)')}</p>
            {!item.isCorrect && <p className="muted">{c('Đáp án đúng', 'Correct answer')}: {item.correctAnswer}</p>}
            {item.explanation && <p className="skill-explanation">{item.explanation}</p>}
          </div>
        </li>)}
      </ol>
    </section>
  </div>
}
```

- [ ] **Step 7: Thêm CSS**

`src/styles.css` — thêm vào cuối file:

```css
/* ── Reading ─────────────────────────────────────────────────────────── */
.skill-question {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.1rem;
  display: grid;
  gap: .75rem;
  box-shadow: var(--shadow-sm);
}
.skill-question-head { display: flex; gap: .75rem; align-items: flex-start; }
.skill-question-number {
  flex: 0 0 auto; width: 2rem; height: 2rem; border-radius: 10px;
  display: grid; place-items: center; font-weight: 700; font-size: .85rem;
  background: var(--surface-soft); color: var(--text-muted);
}
.skill-question-number.is-answered { background: var(--success-soft); color: var(--success); }
.skill-question-text { flex: 1; min-width: 0; display: grid; gap: .35rem; }
.skill-question-prompt { margin: 0; font-weight: 600; line-height: 1.55; }
.skill-flag { border: 1px solid transparent; background: transparent; color: var(--text-subtle); border-radius: 8px; padding: .3rem; cursor: pointer; }
.skill-flag.is-active { color: var(--accent); background: var(--accent-soft); border-color: var(--accent); }
.skill-options { display: grid; gap: .4rem; padding-left: 2.75rem; }
.skill-option { display: flex; gap: .6rem; align-items: flex-start; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: .5rem .7rem; cursor: pointer; }
.skill-option.is-selected { border-color: var(--brand); background: var(--brand-soft); }
.skill-option input { accent-color: var(--brand); margin-top: .2rem; }
.skill-option select { width: 100%; border: 1px solid var(--control-border); border-radius: var(--radius-sm); padding: .45rem .6rem; background: var(--surface); color: var(--text); }
.skill-tfng { display: flex; flex-wrap: wrap; gap: .4rem; padding-left: 2.75rem; }
.skill-chip { border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); border-radius: 999px; padding: .35rem .85rem; font-size: .75rem; font-weight: 700; cursor: pointer; }
.skill-chip.is-selected { background: var(--brand); border-color: var(--brand); color: var(--on-brand); }
.skill-fill { padding-left: 2.75rem; }
.skill-fill input { width: 100%; border: 1px solid var(--control-border); border-radius: var(--radius-sm); padding: .5rem .7rem; background: var(--surface); color: var(--text); }
.skill-group { display: grid; gap: .8rem; }
.skill-group-instruction { font-size: .9rem; line-height: 1.6; color: var(--text-muted); }
.skill-group-instruction p { margin: .2rem 0; }
.skill-group-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .35rem; }
.skill-group-list li { display: flex; gap: .6rem; align-items: center; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: .5rem .7rem; background: var(--surface); }
.skill-group-prompt { flex: 1; font-size: .85rem; }
.skill-completion { line-height: 2; font-size: .95rem; }
.skill-completion p { margin: .4rem 0; }
.skill-inline-input {
  display: inline-block; width: 8rem; margin: 0 .2rem; padding: .1rem .35rem;
  border: 0; border-bottom: 2px solid var(--control-border); background: var(--surface-soft);
  border-radius: 4px 4px 0 0; font-weight: 600; color: var(--brand-ink);
}
.skill-passage { display: flex; flex-direction: column; min-height: 0; }
.skill-passage-head { padding: 1rem 1.2rem; border-bottom: 1px solid var(--border); display: grid; gap: .3rem; }
.skill-passage-body { padding: 1.1rem 1.2rem; overflow-y: auto; line-height: 1.8; }
.skill-passage-body p { margin: 0 0 .9rem; }
.skill-passage-body h2 { font-size: 1.05rem; margin: 1rem 0 .5rem; }
.skill-timer { display: grid; gap: .2rem; min-width: 7rem; }
.skill-timer-label { font-size: .65rem; letter-spacing: .08em; text-transform: uppercase; color: var(--text-subtle); }
.skill-timer-value { font-size: 1.15rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.skill-timer-bar { display: block; height: .3rem; border-radius: 999px; background: var(--surface-soft); overflow: hidden; }
.skill-timer-bar span { display: block; height: 100%; background: var(--brand); transition: width .3s linear; }
.skill-timer.is-low .skill-timer-value { color: var(--danger); }
.skill-timer.is-low .skill-timer-bar span { background: var(--danger); }
.skill-review { display: grid; gap: .6rem; }
.skill-review-grid { display: flex; flex-wrap: wrap; gap: .3rem; }
.skill-review-cell { width: 2rem; height: 2rem; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); font-size: .75rem; font-weight: 700; cursor: pointer; }
.skill-review-cell.is-answered { background: var(--success-soft); border-color: var(--success); color: var(--success); }
.skill-review-cell.is-flagged { background: var(--accent-soft); border-color: var(--accent); color: var(--accent-ink); }
.skill-review-legend { display: flex; flex-wrap: wrap; gap: .8rem; list-style: none; margin: 0; padding: 0; font-size: .72rem; color: var(--text-subtle); }
.skill-review-legend li { display: flex; align-items: center; gap: .35rem; }
.skill-review-legend span { width: .8rem; height: .8rem; border-radius: 4px; border: 1px solid var(--border); display: inline-block; }
.skill-review-legend .is-answered { background: var(--success-soft); border-color: var(--success); }
.skill-review-legend .is-flagged { background: var(--accent-soft); border-color: var(--accent); }
.skill-audio { border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); padding: .9rem; }
.skill-audio-empty { display: flex; gap: .5rem; align-items: center; color: var(--warning); background: var(--warning-soft); border-color: var(--warning); font-size: .8rem; }
.skill-audio-row { display: flex; gap: .8rem; align-items: center; }
.skill-audio-track { flex: 1; min-width: 0; display: grid; gap: .3rem; }
.skill-audio-label { margin: 0; font-size: .78rem; font-weight: 600; }
.skill-audio-track input { width: 100%; accent-color: var(--brand); }
.skill-audio-time { margin: 0; font-size: .7rem; color: var(--text-subtle); font-variant-numeric: tabular-nums; }
.skill-result { display: grid; gap: 1rem; }
.skill-result-summary { text-align: center; display: grid; gap: .35rem; justify-items: center; }
.skill-result-band { margin: 0; font-size: 3rem; font-weight: 800; color: var(--brand); line-height: 1; }
.skill-result-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .6rem; }
.skill-result-list li { display: flex; gap: .7rem; align-items: flex-start; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: .7rem .8rem; background: var(--surface); }
.skill-result-list li.is-correct { border-color: var(--success); }
.skill-result-list li.is-wrong { border-color: var(--danger); }
.skill-result-icon { flex: 0 0 auto; display: grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: 999px; }
.skill-result-list li.is-correct .skill-result-icon { background: var(--success-soft); color: var(--success); }
.skill-result-list li.is-wrong .skill-result-icon { background: var(--danger-soft); color: var(--danger); }
.skill-result-prompt { margin: 0; font-weight: 600; }
.skill-explanation { margin: .3rem 0 0; font-size: .82rem; color: var(--text-muted); white-space: pre-line; }
```

- [ ] **Step 8: Kiểm tra kiểu**

Run: `npm run build`
Expected: build thành công, không lỗi TypeScript.

- [ ] **Step 10: Commit**

```bash
git add src/components/skill src/styles.css
git commit -m "feat(skills): add shared reading and listening components"
```

---

## Task 8: Kho đề + phòng làm bài + kết quả cho Reading

**Files:**
- Create: `src/pages/Reading.tsx`
- Create: `src/pages/ReadingTest.tsx`
- Create: `src/pages/ReadingResult.tsx`

- [ ] **Step 1: Viết trang kho đề**

`src/pages/Reading.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { BookOpen, Clock } from 'lucide-react'
import { Empty, PageHeader, Notice } from '../components/ui'
import { useCopy } from '../i18n'
import { loadSkillTests } from '../lib/skillRepository.ts'
import type { SkillTest } from '../lib/skillLogic.ts'

export default function Reading() {
  const { c } = useCopy()
  const [tests, setTests] = useState<SkillTest[]>([])
  const [series, setSeries] = useState('')
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    void loadSkillTests('reading').then(items => {
      if (!alive) return
      setTests(items)
      setLoading(false)
      setFailed(items.length === 0)
    })
    return () => { alive = false }
  }, [])

  const seriesOptions = useMemo(() => [...new Set(tests.map(test => test.series).filter(Boolean))], [tests])
  const visible = series ? tests.filter(test => test.series === series) : tests

  return <div className="page">
    <PageHeader
      eyebrow={c('LUYỆN ĐỌC', 'READING')}
      title={c('Kho đề Reading', 'Reading library')}
      description={c('Toàn bộ đề Reading của Cambridge 9–20, Essential Words và các bộ TID. Đọc với đồng hồ, đánh dấu câu khó và xem lại đáp án ngay sau khi nộp.', 'The full Reading library from Cambridge 9–20, Essential Words and the TID sets. Read under a timer, flag tricky questions and review the answers right after you submit.')}
    />
    {failed && <Notice error><div><strong>{c('Không tải được kho đề.', 'The library could not be loaded.')}</strong><p>{c('Kiểm tra kết nối tới backend rồi tải lại trang.', 'Check the backend connection and reload the page.')}</p></div></Notice>}
    {seriesOptions.length > 1 && <div className="filter-row">
      <button type="button" className={`filter-chip ${series === '' ? 'is-active' : ''}`} onClick={() => setSeries('')}>{c('Tất cả', 'All')}</button>
      {seriesOptions.map(item => <button key={item} type="button" className={`filter-chip ${series === item ? 'is-active' : ''}`} onClick={() => setSeries(item)}>{item}</button>)}
    </div>}
    {loading && <div className="loading-state" role="status">{c('Đang tải…', 'Loading…')}</div>}
    {!loading && !visible.length && <Empty title={c('Chưa có đề Reading', 'No reading tests yet')} description={c('Quản trị viên sẽ thêm đề vào kho.', 'An administrator will publish tests here.')} />}
    <div className="card-grid">
      {visible.map(test => <Link key={test.id} to={`/app/reading/${test.slug}`} className="skill-card">
        <span className="skill-card-icon"><BookOpen size={20} /></span>
        <div>
          <p className="eyebrow">{test.series}</p>
          <h3>{test.title}</h3>
          <p className="muted">{test.level}</p>
          <p className="skill-card-meta"><Clock size={14} />{test.durationMinutes} {c('phút', 'min')} · {test.questionCount} {c('câu', 'questions')}</p>
        </div>
      </Link>)}
    </div>
  </div>
}
```

- [ ] **Step 2: Viết phòng làm bài**

`src/pages/ReadingTest.tsx`:

```tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Send } from 'lucide-react'
import { Notice, PageHeader } from '../components/ui'
import { PassagePanel } from '../components/skill/PassagePanel.tsx'
import { QuestionGroup } from '../components/skill/QuestionGroup.tsx'
import { ReviewSheet } from '../components/skill/ReviewSheet.tsx'
import { TestTimer } from '../components/skill/TestTimer.tsx'
import { useCopy } from '../i18n'
import { gradeSkill } from '../lib/skillApi.ts'
import { loadSkillTest } from '../lib/skillRepository.ts'
import { answeredCount, progressPercent, type SkillQuestion, type SkillTest } from '../lib/skillLogic.ts'

export default function ReadingTest() {
  const { c } = useCopy()
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState<SkillTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [remaining, setRemaining] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const startedAt = useRef(Date.now())

  useEffect(() => {
    let alive = true
    void loadSkillTest(slug).then(item => {
      if (!alive) return
      if (!item) { setFailed(true); setLoading(false); return }
      setTest(item)
      setRemaining(item.durationMinutes * 60)
      setLoading(false)
    })
    return () => { alive = false }
  }, [slug])

  useEffect(() => {
    if (!test || loading) return
    const timer = setInterval(() => setRemaining(value => (value > 0 ? value - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [test, loading])

  const allQuestions = useMemo<SkillQuestion[]>(() => (test?.sections ?? []).flatMap(section => section.groups.flatMap(group => group.questions)), [test])
  const numbers = useMemo(() => {
    const map: Record<string, number> = {}
    allQuestions.forEach((question, index) => { map[question.id] = index + 1 })
    return map
  }, [allQuestions])
  /**
   * Số câu gốc -> id câu, dựng RIÊNG cho từng passage.
   *
   * Phải scope theo passage, không theo cả đề: 17/77 test đánh số câu lại
   * cho từng passage (ew-*, tid-wb-*), và `cam-11-2` có câu 14 ở cả hai
   * passage. Một map toàn đề sẽ âm thầm bỏ sót câu ở các test đó.
   */
  const bySourceNumberBySection = useMemo(() => {
    const map: Record<string, Record<number, string>> = {}
    for (const item of test?.sections ?? []) {
      const sectionMap: Record<number, string> = {}
      for (const group of item.groups) {
        for (const question of group.questions) {
          if (question.sourceNumber > 0) sectionMap[question.sourceNumber] = question.id
        }
      }
      map[item.id] = sectionMap
    }
    return map
  }, [test])
  const answered = answeredCount(answers, allQuestions)
  const section = test?.sections[activeSection] ?? null

  const setAnswer = (questionId: string, value: string) => setAnswers(previous => ({ ...previous, [questionId]: value }))
  const toggleFlag = (questionId: string) => setFlagged(previous => {
    const next = new Set(previous)
    if (next.has(questionId)) next.delete(questionId)
    else next.add(questionId)
    return next
  })

  const jumpTo = (number: number) => {
    const target = allQuestions.find(question => numbers[question.id] === number)
    if (!target) return
    const owner = test?.sections.findIndex(item => item.groups.some(group => group.questions.some(question => question.id === target.id))) ?? -1
    if (owner >= 0) setActiveSection(owner)
  }

  const submit = async () => {
    if (!test || submitting) return
    setSubmitting(true)
    setError('')
    const result = await gradeSkill({
      testId: test.id,
      answers,
      timeSpentSeconds: Math.round((Date.now() - startedAt.current) / 1000),
    })
    if (!result.ok) {
      setError(result.code)
      setSubmitting(false)
      return
    }
    navigate(`/app/reading/result/${result.value.attemptId ?? 'latest'}`, { state: { grade: result.value } })
  }

  if (loading) return <div className="loading-state" role="status">{c('Đang tải đề…', 'Loading the test…')}</div>
  if (failed || !test) return <div className="page">
    <PageHeader eyebrow={c('LUYỆN ĐỌC', 'READING')} title={c('Không tìm thấy đề', 'Test not found')} />
    <Notice error><div><strong>{c('Đề này không tồn tại hoặc đã bị ẩn.', 'This test does not exist or has been hidden.')}</strong></div></Notice>
  </div>

  return <div className="skill-workspace">
    <header className="skill-workspace-bar">
      <button type="button" className="icon-button" onClick={() => navigate('/app/reading')} aria-label={c('Quay lại kho đề', 'Back to the library')}><ArrowLeft size={19} /></button>
      <div className="skill-workspace-title">
        <p className="eyebrow">{test.series}</p>
        <h1>{test.title}</h1>
      </div>
      <div className="skill-workspace-progress">
        <span>{c('Đã trả lời', 'Answered')} {answered}/{allQuestions.length} ({progressPercent(answered, allQuestions.length)}%)</span>
        <span className="skill-timer-bar"><span style={{ width: `${progressPercent(answered, allQuestions.length)}%` }} /></span>
      </div>
      <TestTimer seconds={remaining} durationMinutes={test.durationMinutes} />
      <button type="button" className="button primary" onClick={() => void submit()} disabled={submitting}>
        <Send size={16} />{submitting ? c('Đang nộp…', 'Submitting…') : c('Nộp bài', 'Submit')}
      </button>
    </header>

    {error && <Notice error><div><strong>{c('Không nộp được bài.', 'The attempt could not be submitted.')}</strong><p>{c('Thử lại sau ít phút.', 'Please try again in a moment.')}</p></div></Notice>}

    <div className="skill-workspace-body">
      <aside className="skill-workspace-side">
        <ReviewSheet questions={allQuestions} numbers={numbers} answers={answers} flagged={flagged} onJump={jumpTo} />
        <nav className="skill-section-tabs" aria-label={c('Các passage của bài', 'Test passages')}>
          {test.sections.map((item, index) => <button key={item.id} type="button" className={`skill-section-tab ${index === activeSection ? 'is-active' : ''}`} onClick={() => setActiveSection(index)}>{item.title}</button>)}
        </nav>
      </aside>
      <section className="skill-workspace-passage">
        {section && <PassagePanel section={section} />}
      </section>
      <section className="skill-workspace-questions">
        {section?.groups.map(group => <QuestionGroup
          key={group.id}
          group={group}
          numbers={numbers}
          bySourceNumber={bySourceNumberBySection[section.id] ?? {}}
          answers={answers}
          flagged={flagged}
          onAnswer={setAnswer}
          onToggleFlag={toggleFlag}
        />)}
      </section>
    </div>
  </div>
}
```

- [ ] **Step 3: Viết trang kết quả**

`src/pages/ReadingResult.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { Empty, PageHeader } from '../components/ui'
import { SkillResult } from '../components/skill/SkillResult.tsx'
import { useCopy } from '../i18n'
import { loadSkillGrade, type SkillGrade } from '../lib/skillApi.ts'

export default function ReadingResult() {
  const { c } = useCopy()
  const { attemptId = '' } = useParams()
  const location = useLocation()
  const state = location.state as { grade?: SkillGrade } | null
  const [grade, setGrade] = useState<SkillGrade | null>(state?.grade ?? null)
  const [loading, setLoading] = useState(!state?.grade)

  useEffect(() => {
    if (grade) return
    let alive = true
    void loadSkillGrade(attemptId).then(value => {
      if (!alive) return
      setGrade(value)
      setLoading(false)
    })
    return () => { alive = false }
  }, [attemptId, grade])

  return <div className="page">
    <PageHeader
      eyebrow={c('LUYỆN ĐỌC', 'READING')}
      title={c('Kết quả bài Reading', 'Reading result')}
      action={<Link className="button outline" to="/app/reading">{c('Về kho đề', 'Back to the library')}</Link>}
    />
    {loading && <div className="loading-state" role="status">{c('Đang tải kết quả…', 'Loading the result…')}</div>}
    {!loading && (grade ? <SkillResult grade={grade} /> : <Empty title={c('Không tìm thấy kết quả', 'Result not found')} description={c('Lần làm bài này không tồn tại hoặc đã bị xoá.', 'This attempt does not exist or has been deleted.')} />)}
  </div>
}
```

- [ ] **Step 4: Kiểm tra kiểu**

Run: `npm run build`
Expected: build thành công.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Reading.tsx src/pages/ReadingTest.tsx src/pages/ReadingResult.tsx
git commit -m "feat(reading): add reading library, test room and result page"
```

---

## Task 9: Điều hướng, menu, bảng route, CSS bố cục, Tổng quan

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`
- Modify: `src/agent/routes.ts`
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Đăng ký route**

`src/App.tsx`:

```tsx
import { lazy, Suspense } from 'react'
import { createRoutesFromElements, Route } from 'react-router'
import Layout from './components/Layout'
import { RouteGuard } from './components/RouteGuard'
import Dashboard from './pages/Dashboard'
import { Landing, Donate, Settings, NotFound } from './pages/Other'
import { Auth } from './pages/Auth'
import { Admin } from './pages/Admin'
import { Essays, EssayDetail } from './pages/Essays'
import { Vocabulary, Review, Errors } from './pages/Learning'

const Prompts = lazy(() => import('./pages/Prompts'))
const Reading = lazy(() => import('./pages/Reading'))
const ReadingTest = lazy(() => import('./pages/ReadingTest'))
const ReadingResult = lazy(() => import('./pages/ReadingResult'))
import { useCopy } from './i18n'

const Writing = lazy(() => import('./pages/Writing'))

export function AppFallback() {
  const { c } = useCopy()
  return <div className="loading-state" role="status">{c('Đang tải…', 'Loading…')}</div>
}

export function routes() {
  return createRoutesFromElements(
    <>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<Auth />} />
      <Route path="/auth/reset-password" element={<Auth />} />
      <Route element={<Layout />}>
        <Route path="/donate" element={<Donate />} />
        <Route path="/app/prompts" element={<Suspense fallback={<AppFallback />}><Prompts /></Suspense>} />
        <Route element={<RouteGuard />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/write" element={<Suspense fallback={<AppFallback />}><Writing /></Suspense>} />
          <Route path="/app/essays" element={<Essays />} />
          <Route path="/app/essays/:id" element={<EssayDetail />} />
          <Route path="/app/vocabulary" element={<Vocabulary />} />
          <Route path="/app/review" element={<Review />} />
          <Route path="/app/errors" element={<Errors />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/reading" element={<Suspense fallback={<AppFallback />}><Reading /></Suspense>} />
          <Route path="/app/reading/result/:attemptId" element={<Suspense fallback={<AppFallback />}><ReadingResult /></Suspense>} />
          <Route path="/app/reading/:slug" element={<Suspense fallback={<AppFallback />}><ReadingTest /></Suspense>} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  )
}
```

> Thứ tự route quan trọng: `/app/reading/result/:attemptId` khai báo **trước** `/app/reading/:slug` để không bị bắt nhầm.

- [ ] **Step 2: Thêm route vào bảng route**

`src/agent/routes.ts` — thêm vào `spaRoutes`:

```ts
  '/app/reading',
  '/app/reading/result/:attemptId',
  '/app/reading/:slug',
```

- [ ] **Step 3: Thêm menu**

`src/components/Layout.tsx` — trong mảng `nav`, thêm hai mục mới ngay sau `/app/prompts`:

```tsx
    { path: '/app/reading', icon: BookMarked, label: c('Luyện đọc', 'Reading') },
```

Và thêm `BookMarked`, `Headphones` vào import `lucide-react` ở dòng đầu:

```tsx
import { ArrowUpRight, BookMarked, BookOpen, ChevronRight, CircleHelp, ClipboardList, FileText, Heart, LayoutDashboard, Lightbulb, LogOut, Menu, Moon, NotebookPen, PanelLeftClose, PenLine, RotateCcw, Settings, ShieldCheck, Sun, X } from 'lucide-react'
```

- [ ] **Step 4: Thêm CSS bố cục**

`src/styles.css` — thêm vào cuối file:

```css
.skill-workspace { display: grid; gap: 1rem; }
.skill-workspace-bar {
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
  padding: .85rem 1rem; border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--surface); box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 20;
}
.skill-workspace-title { flex: 1; min-width: 12rem; }
.skill-workspace-title h1 { margin: 0; font-size: 1.05rem; }
.skill-workspace-progress { display: grid; gap: .3rem; font-size: .78rem; color: var(--text-muted); min-width: 10rem; }
.skill-workspace-progress .skill-timer-bar { width: 10rem; }
.skill-workspace-body { display: grid; grid-template-columns: 16rem minmax(0, 1fr) minmax(0, 1.1fr); gap: 1rem; align-items: start; }
.skill-workspace-side { display: grid; gap: 1rem; position: sticky; top: 5.5rem; }
.skill-workspace-passage, .skill-workspace-questions {
  border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); box-shadow: var(--shadow-sm);
  padding: 1rem; display: grid; gap: .8rem; max-height: calc(100vh - 9rem); overflow-y: auto;
}
.skill-section-tabs { display: grid; gap: .3rem; }
.skill-section-tab { text-align: left; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); border-radius: var(--radius-sm); padding: .5rem .7rem; font-size: .78rem; font-weight: 600; cursor: pointer; }
.skill-section-tab.is-active { border-color: var(--brand); background: var(--brand-soft); color: var(--brand-ink); }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 1rem; }
.skill-card { display: flex; gap: .8rem; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); box-shadow: var(--shadow-sm); color: inherit; text-decoration: none; }
.skill-card h3 { margin: .15rem 0 .3rem; font-size: 1rem; }
.skill-card-icon { flex: 0 0 auto; width: 2.4rem; height: 2.4rem; border-radius: 12px; display: grid; place-items: center; background: var(--brand-soft); color: var(--brand); }
.skill-card-meta { display: flex; align-items: center; gap: .35rem; font-size: .75rem; color: var(--text-subtle); }
.filter-row { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: 1rem; }
.filter-chip { border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); border-radius: 999px; padding: .3rem .8rem; font-size: .78rem; font-weight: 600; cursor: pointer; }
.filter-chip.is-active { background: var(--brand); border-color: var(--brand); color: var(--on-brand); }
@media (max-width: 1080px) {
  .skill-workspace-body { grid-template-columns: minmax(0, 1fr); }
  .skill-workspace-side { position: static; }
  .skill-workspace-passage, .skill-workspace-questions { max-height: none; }
}
```

- [ ] **Step 5: Thêm thẻ tiến độ ở Tổng quan**

`src/pages/Dashboard.tsx` — thêm import:

```tsx
import { loadSkillAttempts, type SkillAttempt } from '../lib/skillApi.ts'
```

Thêm state và effect sau khối `useEffect` của `overview`:

```tsx
  const [skillAttempts, setSkillAttempts] = useState<SkillAttempt[]>([])
  useEffect(() => {
    let active = true
    void loadSkillAttempts().then(items => { if (active) setSkillAttempts(items) })
    return () => { active = false }
  }, [])
```

Thêm một panel trước `<div className="dashboard-columns">`:

```tsx
    <section className="panel">
      <div className="panel-heading"><h2>{c('Luyện đọc', 'Reading practice')}</h2></div>
      <p className="muted">{c('Bạn đã làm', 'You have completed')} {skillAttempts.filter(item => item.skill === 'reading').length} {c('bài Reading.', 'reading tests.')}</p>
      <div className="practice-grid">
        <Link to="/app/reading" className="practice-card">
          <div className="practice-card-top"><span className="task-icon teal"><BookMarked size={25} /></span><ArrowUpRight size={20} /></div>
          <span className="eyebrow">{c('LUYỆN ĐỌC', 'READING')}</span>
          <h3>Reading</h3>
          <p>{c('Đọc đạn với đồng hồ, đánh dấu câu khó và xem lại đáp án.', 'Read under a timer, flag tricky questions and review the answers.')}</p>
        </Link>
      </div>
    </section>
```

Và thêm `BookMarked`, `Headphones` vào import `lucide-react` ở dòng 2:

```tsx
import { ArrowRight, ArrowUpRight, BookMarked, BookOpen, Check, ChevronRight, Clock3, FileText, Flame, Leaf, PenLine, Plus, RotateCcw, Sparkles, Target } from 'lucide-react'
```

- [ ] **Step 6: Kiểm tra kiểu và test**

```bash
npm run build
npm test
```

Expected: build thành công; test PASS (route mới không làm hỏng `tests/agent.test.ts` vì test duyệt `spaRoutes` động).

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/components/Layout.tsx src/agent/routes.ts src/pages/Dashboard.tsx src/styles.css
git commit -m "feat(skills): wire reading and listening into navigation and overview"
```

---

## Task 10: Trang quản trị — trạng thái đề

**Files:**
- Create: `src/lib/skillAdmin.ts`
- Create: `src/pages/admin/SkillsTab.tsx`
- Modify: `src/pages/Admin.tsx`
- Modify: `supabase/functions/_shared/schemas.ts`
- Create: `supabase/functions/admin-skills/index.ts`
- Create: `supabase/functions/admin-skills/deno.json`
- Modify: `src/styles.css`

- [ ] **Step 1: Thêm `parseAdminSkills` vào schemas**

`supabase/functions/_shared/schemas.ts` — thêm vào cuối file:

```ts
export function parseAdminSkills(input: unknown): {
  action: "set-status";
  testId: string;
  status: "draft" | "published" | "hidden";
} {
  const record = asRecord(input);
  const action = requiredString(record, "action", { max: 40 });
  if (action !== "set-status") fail("action", "Unknown action");
  const status = requiredString(record, "status");
  if (status !== "draft" && status !== "published" && status !== "hidden") {
    fail("status", "Unknown status");
  }
  return { action: "set-status", testId: requiredUuid(record, "testId"), status };
}
```

- [ ] **Step 2: Tạo Edge Function `admin-skills`**

`supabase/functions/admin-skills/index.ts`:

```ts
import { requireAdmin } from "../_shared/auth.ts";
import {
  AppError,
  databaseError,
  errorResponse,
  jsonResponse,
  preflightResponse,
  readJsonBody,
  requestId,
  requireMethod,
} from "../_shared/http.ts";
import { parseAdminSkills } from "../_shared/schemas.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAdmin(request);
    const parsed = parseAdminSkills(await readJsonBody(request));

    const result = await context.service
      .from("skill_tests")
      .update({ status: parsed.status })
      .eq("id", parsed.testId)
      .select("id,status")
      .maybeSingle();
    if (result.error) throw databaseError("update the test status");
    if (!result.data) throw new AppError(404, "test_not_found", "Test not found");
    return jsonResponse(request, 200, { ok: true, test: result.data }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
```

Tạo `supabase/functions/admin-skills/deno.json` (copy từ `supabase/functions/admin-users/deno.json`).

- [ ] **Step 3: Viết helper quản trị**

`src/lib/skillAdmin.ts`:

```ts
// Quản lý nội dung Reading trong trang Quản trị.
//
// Client dùng publishable key + JWT của admin. Vì bảng `skill_sections` không cấp
// quyền sửa cho client, mọi thao tác ghi đều đi qua Edge Function `admin-skills`
// (service role), kể cả tải audio.

import { supabase } from './supabase'

export type AdminSkillTest = {
  id: string
  skill: 'reading' | 'listening'
  slug: string
  series: string
  title: string
  status: 'draft' | 'published' | 'hidden'
  questionCount: number
  sections: { id: string; sectionNo: number; title: string }[]
}

type TestRow = { id: string; skill: string; slug: string; series: string | null; title: string; status: string; question_count: number | null }
type SectionRow = { id: string; test_id: string; section_no: number; title: string | null; audio_path: string | null }

/** Đọc toàn bộ đề (kể cả draft) cho trang quản trị. */
export async function loadAdminSkillTests(): Promise<AdminSkillTest[]> {
  const { data: tests, error } = await supabase
    .from('skill_tests')
    .select('id,skill,slug,series,title,status,question_count')
    .order('skill')
    .order('sort_order')
  if (error || !tests?.length) return []

  const { data: sections } = await supabase
    .from('skill_sections')
    .select('id,test_id,section_no,title,audio_path')
    .order('section_no')
  const rows = (sections ?? []) as SectionRow[]
  const byTest = new Map<string, SectionRow[]>()
  for (const section of rows) {
    const list = byTest.get(section.test_id) ?? []
    list.push(section)
    byTest.set(section.test_id, list)
  }

  return (tests as TestRow[]).map(test => ({
    id: test.id,
    skill: test.skill as 'reading' | 'listening',
    slug: test.slug,
    series: test.series ?? '',
    title: test.title,
    status: test.status as 'draft' | 'published' | 'hidden',
    questionCount: test.question_count ?? 0,
    sections: (byTest.get(test.id) ?? []).map(section => ({
      id: section.id,
      sectionNo: section.section_no,
      title: section.title ?? '',
    })),
  }))
}

/** Đổi trạng thái hiển thị của một đề. */
export async function setSkillTestStatus(testId: string, status: 'draft' | 'published' | 'hidden'): Promise<boolean> {
  const { error } = await supabase.functions.invoke('admin-skills', {
    body: { action: 'set-status', testId, status },
  })
  return !error
}

```

- [ ] **Step 4: Viết tab quản trị**

`src/pages/admin/SkillsTab.tsx`:

```tsx
import { useCallback, useEffect, useState } from 'react'
import { useCopy } from '../../i18n'
import { loadAdminSkillTests, setSkillTestStatus, type AdminSkillTest } from '../../lib/skillAdmin.ts'

export default function SkillsTab({ onError, onBusy }: { onError: (message: string) => void; onBusy: (busy: boolean) => void }) {
  const { c } = useCopy()
  const [tests, setTests] = useState<AdminSkillTest[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    void loadAdminSkillTests().then(items => {
      setTests(items)
      setLoading(false)
    })
  }, [])

  useEffect(() => { reload() }, [reload])

  const changeStatus = async (test: AdminSkillTest, status: 'draft' | 'published' | 'hidden') => {
    onBusy(true)
    const ok = await setSkillTestStatus(test.id, status)
    onBusy(false)
    if (!ok) { onError(c('Không đổi được trạng thái đề.', 'The test status could not be changed.')); return }
    reload()
  }

  return <section className="panel">
    <h2>{c('Kho đề Reading', 'Reading test library')}</h2>
    {loading && <div className="loading-state" role="status">{c('Đang tải…', 'Loading…')}</div>}
    {!loading && !tests.length && <p className="muted">{c('Chưa có đề nào.', 'No tests yet.')}</p>}
    <div className="admin-skill-list">
      {tests.map(test => <article key={test.id} className="admin-skill">
        <header>
          <div>
            <p className="eyebrow">{test.series} · {test.skill}</p>
            <h3>{test.title}</h3>
            <p className="muted">{test.slug} · {test.status} · {test.questionCount} {c('câu', 'questions')}</p>
          </div>
          <div className="admin-skill-actions">
            <button type="button" className="button outline" onClick={() => void changeStatus(test, 'published')}>{c('Publish', 'Publish')}</button>
            <button type="button" className="button outline" onClick={() => void changeStatus(test, 'draft')}>{c('Bản nháp', 'Draft')}</button>
            <button type="button" className="button outline" onClick={() => void changeStatus(test, 'hidden')}>{c('Ẩn khỏi kho', 'Hide')}</button>
          </div>
        </header>
        {test.sections.length > 0 && <ul>
          {test.sections.map(section => <li key={section.id}>
            <span>{section.sectionNo}. {section.title}</span>
            <span className="muted">{section.questionCount} {c('câu', 'questions')}</span>
          </li>)}
        </ul>}
      </article>)}
    </div>
  </section>
}
```

- [ ] **Step 5: Gắn tab vào trang Quản trị**

`src/pages/Admin.tsx` — thêm import:

```tsx
import SkillsTab from './admin/SkillsTab'
```

Thêm vào mảng `tabs`:

```tsx
    ['skills', c('Kho đề Reading', 'Reading tests')],
```

Thêm vào khối render:

```tsx
    {tab === 'skills' && <SkillsTab onError={setError} onBusy={setBusy} />}
```

- [ ] **Step 6: Thêm CSS quản trị**

`src/styles.css` — thêm vào cuối file:

```css
.admin-skill-list { display: grid; gap: 1rem; margin-top: 1rem; }
.admin-skill { border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; display: grid; gap: .7rem; background: var(--surface); }
.admin-skill header { display: flex; gap: 1rem; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; }
.admin-skill h3 { margin: .1rem 0; font-size: 1rem; }
.admin-skill-actions { display: flex; gap: .4rem; flex-wrap: wrap; }
.admin-skill ul { list-style: none; margin: 0; padding: 0; display: grid; gap: .5rem; }
.admin-skill li { display: flex; gap: .8rem; align-items: center; flex-wrap: wrap; border-top: 1px solid var(--border); padding-top: .5rem; font-size: .85rem; }
.admin-skill li .button { margin-left: auto; }
```

- [ ] **Step 7: Deploy Edge Function**

```bash
npm run db:deploy
```

Expected: `admin-skills` được deploy.

- [ ] **Step 8: Kiểm tra kiểu**

Run: `npm run build`
Expected: build thành công.

- [ ] **Step 9: Commit**

```bash
git add src/lib/skillAdmin.ts src/pages/admin/SkillsTab.tsx src/pages/Admin.tsx supabase/functions/admin-skills supabase/functions/_shared/schemas.ts src/styles.css
git commit -m "feat(admin): manage reading and listening tests and audio"
```

---

## Task 11: Test trình duyệt, tài liệu, deploy

**Files:**
- Create: `tests/skill-flow.mjs`
- Modify: `README.md`
- Modify: `supabase/README.md`

- [ ] **Step 1: Viết test trình duyệt**

`tests/skill-flow.mjs`:

```js
// Luồng Reading trên trình duyệt thật.
// Chạy: node tests/skill-flow.mjs  (cần dev server ở http://127.0.0.1:5173)

import { chromium } from 'playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5173'
const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()
let failures = 0

function check(label, ok) {
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
}

try {
  await page.goto(`${base}/app/reading`, { waitUntil: 'domcontentloaded' })
  check('reading library renders', await page.locator('.skill-card, .empty').first().isVisible())
  check('reading route is not 404', !(await page.content()).includes('404'))

  if (email && password) {
    await page.goto(`${base}/auth`, { waitUntil: 'domcontentloaded' })
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/app', { timeout: 15000 })

    await page.goto(`${base}/app/reading`, { waitUntil: 'domcontentloaded' })
    const card = page.locator('.skill-card').first()
    if (await card.count()) {
      await card.click()
      await page.waitForSelector('.skill-workspace', { timeout: 15000 })
      check('reading test room opens', await page.locator('.skill-workspace').isVisible())
      check('reading timer is visible', await page.locator('.skill-timer-value').isVisible())
      check('passage content is rendered', await page.locator('.skill-passage-body').isVisible())
      check('question cards are rendered', (await page.locator('.skill-question').count()) > 0)
    }
  }
} finally {
  await browser.close()
}

console.log(failures ? `\n${failures} kiểm tra thất bại.` : '\nTất cả kiểm tra đạt.')
process.exit(failures ? 1 : 0)
```

- [ ] **Step 2: Chạy test trình duyệt**

```bash
npm run dev
# ở cửa sổ khác:
node tests/skill-flow.mjs
```

Expected: `Tất cả kiểm tra đạt.`

- [ ] **Step 3: Cập nhật `README.md`**

Thêm vào mục *Cấu trúc*:

```
| `src/pages/Reading*.tsx` | Kho đề, phòng làm bài và kết quả cho Reading |
| `src/lib/skillLogic.ts` · `skillRepository.ts` · `skillApi.ts` | Kiểu dữ liệu + helper thuần, đọc đề từ PostgREST, gọi Edge Function chấm điểm |
```

Thêm vào mục *Backend*:

```bash
npm run db:import:reading    # sinh lại dataset đề từ repo nguồn (cần clone repo nguồn)
npm run db:seed:skills        # nạp toàn bộ đề Reading
```

Thêm mục mới:

```markdown
## Reading

- **Đề nằm trong Postgres**: `skill_tests` → `skill_sections` → `skill_question_groups` → `skill_questions`, lịch sử ở `skill_attempts`.
- **Toàn bộ kho đề** được sinh từ `public/data/reading/` của repo `khanh020905/SWP391-PROJECT`: 77 test · 233 passage · 2998 câu hỏi (Cambridge 9–20, Essential Words, TID Vol / Set 20 / Workbook, chủ đề B1).
- **Đáp án không lộ ra trình duyệt**: `skill_questions` chỉ cấp quyền đọc cho các cột không phải đáp án; Edge Function `grade-skill` chấm điểm bằng service role rồi ghi lịch sử.
- **Quy đổi band**: bảng Cambridge trong `supabase/functions/_shared/skillGrading.ts`.
```

- [ ] **Step 4: Cập nhật `supabase/README.md`**

Thêm vào danh sách bảng:

```
| `skill_tests` · `skill_sections` · `skill_question_groups` · `skill_questions` | Đề Reading; cột đáp án chỉ service role đọc |
| `skill_attempts` | Lịch sử làm bài, RLS theo chủ sở hữu |
```

Và vào danh sách function:

```
| `grade-skill` | Chấm bài Reading, ghi `skill_attempts` |
| `admin-skills` | Đổi trạng thái đề, tải audio lên bucket `skill-audio` |
```

- [ ] **Step 5: Chạy toàn bộ kiểm thử**

```bash
npm test
npm run test:edge
npm run build
```

Expected: tất cả PASS, build thành công.

- [ ] **Step 6: Deploy**

```bash
npm run db:deploy
npm run db:migrate
npm run db:seed:skills
git push origin main
npx vercel --prod --yes
```

Expected: bản deploy chạy được tại `https://huybui.vercel.app`.

Kiểm tra bản live:

```bash
TEST_URL=https://huybui.vercel.app node tests/skill-flow.mjs
```

- [ ] **Step 7: Commit**

```bash
git add tests/skill-flow.mjs README.md supabase/README.md
git commit -m "docs(skills): document reading and listening modules"
```

---

## Kiểm tra tự thân

**0. Đã kiểm chứng chạy thật (Node 24.14)**

| Hạng mục | Cách kiểm | Kết quả |
|---|---|---|
| Logic chấm (`skillGrading.ts`) + 9 unit test | `node --test tests/skillGrading.test.ts` | 9/9 PASS |
| Helper giao diện + 25 unit test | `node --test tests/skillLogic.test.ts` | 25/25 PASS |
| Repository + 4 unit test | `node --test tests/skillRepository.test.ts` | 4/4 PASS |
| Script import đọc repo nguồn thật | `node scripts/import-source-skills.mjs <clone>` | 3 section · 40 câu · 40 đáp án |
| Kiểm kê kho đề | đọc trực tiếp 566 file JSON | 234 file có câu hỏi · 3004 câu · 2995 đáp án · 738 câu có options |
| Script import đọc repo nguồn thật | `node scripts/import-source-reading.mjs <clone>` | 77 test · 233 passage · 2998 câu · 233/233 passage có câu có đáp án |
| Ánh xạ chỗ trống "31_______" | đối chiếu `questionHtml` với `question.id` | số trong chỗ trống khớp `sourceNumber` của câu |

Ba điều chỉnh rút ra từ lần kiểm chứng: câu *matching* ở repo nguồn dùng `headings` chứ không phải `options`; `bandFromRaw(10, 20)` là **5.5** không phải 6; và **chỉ câu đầu nhóm mang `questionHtml` đầy đủ** — các câu sau có `questionHtml` rỗng, nên phải lấy HTML của câu đầu nhóm và ánh xạ số chỗ trống qua `source_number`.

**1. Độ phủ yêu cầu**

| Yêu cầu | Task |
|---|---|
| Lấy **toàn bộ đề** (77 test · 233 passage · 2998 câu) | 3.1–3.3, 4.2 |
| Code viết theo web hiện có (Vite + design token + i18n + Edge Function) | 1, 5, 6, 7, 8, 9 |
| Kho đề + lọc theo series | 8.1, 9.1 |
| Phòng làm bài: passage, đồng hồ, đánh dấu, rà soát | 6, 8.2 |
| Render đủ 14 dạng câu hỏi | 6.2 (QuestionCard) + 6.3 (QuestionGroup) |
| Chấm điểm + band Cambridge | 5 |
| Lịch sử lưu Postgres | 2, 5, 9.5 |
| Admin: trạng thái + tải audio | 11 |
| Đáp án không lộ | 2.1 (quyền cột), 5 (service role) |

**2. Còn thiếu**

- Chưa có test trình duyệt cho luồng nộp bài có điểm (cần tài khoản test + đề trong DB) — Task 12.2 chỉ kiểm tra mở được phòng làm bài.
- Ngân hàng ~300 đoạn văn `passage_p*_c*` (chỉ có passage, không có câu hỏi) — nạp được sau bằng cùng script, để dành cho tính năng "đọc hiểu không chấm". Script hiện bỏ qua chúng.
- Chưa có link điều hướng từ Tổng quan tới lịch sử làm bài cũ (API `GET /grade-skill` đã có).

**3. Kiểu dữ liệu**

- `SkillTest.skill` là `SkillKind` = `'reading' | 'listening'` — khớp `skill` trong DB và `grade.skill` trong Edge Function.
- `SkillQuestion.id` là uuid của `skill_questions`; `SkillQuestion.sourceNumber` là số câu của **đề gốc** (cột `source_number`) — dùng để ánh xạ chỗ trống trong HTML. Số thứ tự hiển thị do frontend đánh lại theo thứ tự section → group → order_index.
- `SkillGrade.results[].order` là số thứ tự **toàn đề** (1..N) do server tính — khớp với `numbers` trong frontend.
- `SkillGrade.band` là `number | null` (null khi đề không có câu nào) — `SkillResult` hiển thị `—` cho null.
- `AdminSkillTest.status` là `'draft' | 'published' | 'hidden'` — khớp `check` trong migration.
- `parseAdminSkills` trả về discriminated union `{ action: 'set-status' } | { action: 'upload-audio' }`; `admin-skills/index.ts` hẹp kiểu bằng `if (parsed.action === 'set-status')`.
