# Vocabulary Library (25 IELTS topics) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa 5.000 từ vựng IELTS (25 chủ đề × 200 từ) vào app dưới dạng tab "Thư viện 25 chủ đề" trong trang Sổ từ vựng, cho phép thêm từ vào sổ cá nhân để ôn tập.

**Architecture:** Dữ liệu nằm trong hai bảng Postgres mới (`vocabulary_topics`, `vocabulary_entries`) đọc công khai qua PostgREST, seed từ file JSON đã trích từ bundle của ForumFlash. Frontend có tầng logic thuần (`vocabularyLogic.ts`) + tầng đọc dữ liệu (`vocabularyRepository.ts`), UI là component `VocabularyLibrary.tsx` gắn vào trang `/app/vocabulary` qua 2 tab. Nút "Thêm vào sổ" tái dùng `addCard` của store (RPC `save_study_card`), gắn tag chủ đề để lọc được trong sổ.

**Tech Stack:** React 19 + TypeScript + Vite · Supabase (Postgres + PostgREST + RLS) · node:test · Playwright · Vercel

**Nguồn dữ liệu:** `data/forumflash-vocabulary.json` — trích từ bundle Next.js của `forumflashstudy.com` bằng REA (`scripts/ff-extract.mjs`). Mỗi mục: `term`, `pos`, `meaning` (VI), `definition` (VI, ghi chú cách dùng), `examples` (2 câu tiếng Anh), `ipa` (2.107/5.000 có). **Không** có gloss tiếng Anh — dùng nguyên nguồn, không sinh bằng AI.

---

## File Structure

| File | Vai trò |
|---|---|
| `supabase/migrations/018_vocabulary_library.sql` | 2 bảng + index + RLS công khai (đọc) |
| `supabase/seed/vocabulary-data.json` | 5.000 mục đã trích (nguồn cho seed) |
| `supabase/seed/seed-vocabulary.mjs` | Nạp topics + entries vào Postgres (upsert, theo lô 500) |
| `src/lib/vocabularyLogic.ts` | Logic thuần: map row→entry, lọc, tạo payload thẻ |
| `src/lib/vocabularyRepository.ts` | Đọc PostgREST: `loadVocabularyTopics`, `loadVocabularyEntries` |
| `src/components/VocabularyLibrary.tsx` | UI tab thư viện: lưới chủ đề → danh sách từ → thêm vào sổ |
| `src/pages/Learning.tsx` | Thêm 2 tab vào trang `Vocabulary` |
| `src/lib/store.tsx` | `addCard` nhận `tags` tuỳ chọn, truyền xuống RPC |
| `src/lib/sync.ts` | `StudyCardRow`/`studyCardRowToCard` giữ `tags` |
| `tests/vocabulary.test.ts` | Test logic thuần + repository (mock fetch) |

---

### Task 1: Lưu dữ liệu nguồn vào repo

**Files:**
- Create: `supabase/seed/vocabulary-data.json`
- Create: `scripts/ff-extract.mjs` (đã có từ lúc nghiên cứu — giữ lại, chỉnh output path)

- [ ] **Step 1: Copy dữ liệu đã trích vào thư mục seed**

```powershell
Copy-Item data\forumflash-vocabulary.json supabase\seed\vocabulary-data.json
```

- [ ] **Step 2: Kiểm tra cấu trúc file**

```powershell
node -e "const d=require('./supabase/seed/vocabulary-data.json');console.log(d.topics.length, d.topics.reduce((s,t)=>s+t.items.length,0), JSON.stringify(d.topics[24].items[0]))"
```

Expected: `25 5000 {"term":"personal finance",...}`

- [ ] **Step 3: Chỉnh `scripts/ff-extract.mjs` ghi đúng thư mục seed**

Sửa dòng `const outFile = process.argv[3] ?? 'data/forumflash-vocabulary.json'` thành `const outFile = process.argv[3] ?? 'supabase/seed/vocabulary-data.json'`.

- [ ] **Step 4: Commit**

```bash
git add supabase/seed/vocabulary-data.json scripts/ff-extract.mjs scripts/ff-analyze.mjs scripts/ff-count.mjs scripts/ff-peek.mjs scripts/ff-stats.mjs data
git commit -m "feat(vocab): du lieu 5000 tu vung 25 chu de IELTS"
```

---

### Task 2: Schema Postgres

**Files:**
- Create: `supabase/migrations/018_vocabulary_library.sql`

- [ ] **Step 1: Viết migration**

```sql
-- Thư viện từ vựng IELTS: 25 chủ đề × 200 mục, đọc công khai.
begin;

create table if not exists public.vocabulary_topics (
  key text primary key,
  number integer not null,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.vocabulary_entries (
  id uuid primary key default gen_random_uuid(),
  topic_key text not null references public.vocabulary_topics (key) on delete cascade,
  term text not null,
  pos text not null default '',
  meaning text not null default '',
  definition text not null default '',
  examples text[] not null default '{}',
  ipa text,
  sort_order integer not null default 0,
  unique (topic_key, term)
);

create index if not exists vocabulary_entries_topic_idx on public.vocabulary_entries (topic_key, sort_order);
create index if not exists vocabulary_entries_term_idx on public.vocabulary_entries using gin (term gin_trgm_ops);

alter table public.vocabulary_topics enable row level security;
alter table public.vocabulary_entries enable row level security;

drop policy if exists vocabulary_topics_read on public.vocabulary_topics;
create policy vocabulary_topics_read on public.vocabulary_topics
for select to anon, authenticated
using (true);

drop policy if exists vocabulary_entries_read on public.vocabulary_entries;
create policy vocabulary_entries_read on public.vocabulary_entries
for select to anon, authenticated
using (true);

revoke all on public.vocabulary_topics from anon;
revoke all on public.vocabulary_entries from anon;
grant select on public.vocabulary_topics to anon, authenticated;
grant select on public.vocabulary_entries to anon, authenticated;

commit;
```

> `gin_trgm_ops` cần `pg_trgm`: nếu migration lỗi "operator does not exist", bỏ dòng index GIN đó (tìm 5.000 dòng bằng `ilike` vẫn đủ nhanh).

- [ ] **Step 2: Áp dụng migration**

```bash
npm run db:migrate
```

Expected: mọi câu `OK`; không có lỗi.

- [ ] **Step 3: Kiểm tra bảng đã tạo**

```bash
node --env-file-if-exists=.env.local -e "const t=process.env.SUPABASE_ACCESS_TOKEN;const r=await fetch('https://api.supabase.com/v1/projects/'+(/https:\/\/([a-z0-9-]+)\.supabase\.co/.exec(process.env.SUPABASE_URL)[1])+'/database/query',{method:'POST',headers:{Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({query:\"select table_name from information_schema.tables where table_name like 'vocabulary%'\"})});console.log(await r.text())"
```

Expected: `vocabulary_entries`, `vocabulary_topics`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/018_vocabulary_library.sql
git commit -m "feat(db): bang tu vung 25 chu de + RLS doc cong khai"
```

---

### Task 3: Seed script

**Files:**
- Create: `supabase/seed/seed-vocabulary.mjs`
- Modify: `package.json` (thêm script `db:seed:vocabulary`)

- [ ] **Step 1: Viết `supabase/seed/seed-vocabulary.mjs`**

```javascript
/**
 * Nạp thư viện từ vựng 25 chủ đề vào Postgres.
 *
 *   npm run db:seed:vocabulary
 *
 * Nguồn: supabase/seed/vocabulary-data.json (đọc trong repo, không cần mạng).
 */
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

function readEnvFile() {
  const candidates = [join(process.cwd(), '.env.local'), resolve(process.cwd(), '..', '.env.local')]
  for (const candidate of candidates) {
    try {
      const values = {}
      for (const line of readFileSync(candidate, 'utf8').split('\n')) {
        const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line)
        if (!match) continue
        values[match[1]] = match[2].replace(/^["']|["']$/g, '').trim()
      }
      return values
    } catch { /* thử candidate tiếp theo */ }
  }
  return {}
}

const env = { ...readEnvFile(), ...process.env }
const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL
const key = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong .env.local')
  process.exit(1)
}

const data = JSON.parse(readFileSync('supabase/seed/vocabulary-data.json', 'utf8'))

async function post(path, body) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status} ${text.slice(0, 400)}`)
}

const topics = data.topics.map(topic => ({
  key: topic.id,
  number: topic.number,
  title: topic.title,
  description: topic.description,
  sort_order: topic.number,
}))

await post('vocabulary_topics?on_conflict=key', topics)
console.log(`Da nap ${topics.length} chu de`)

let entries = []
for (const topic of data.topics) {
  topic.items.forEach((item, index) => {
    entries.push({
      topic_key: topic.id,
      term: item.term,
      pos: item.pos ?? '',
      meaning: item.meaning ?? '',
      definition: item.definition ?? '',
      examples: item.examples ?? [],
      ipa: item.ipa ?? null,
      sort_order: index,
    })
  })
}

const BATCH = 500
for (let index = 0; index < entries.length; index += BATCH) {
  const batch = entries.slice(index, index + BATCH)
  await post('vocabulary_entries?on_conflict=topic_key,term', batch)
  console.log(`  ${Math.min(index + BATCH, entries.length)}/${entries.length}`)
}

const countResponse = await fetch(`${url}/rest/v1/vocabulary_entries?select=id`, {
  headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
})
console.log('Tong muc tu trong DB:', countResponse.headers.get('content-range'))
```

- [ ] **Step 2: Thêm npm script**

Trong `package.json`, sau dòng `"db:seed:pricing"` thêm:

```json
"db:seed:vocabulary": "node --env-file-if-exists=.env.local supabase/seed/seed-vocabulary.mjs",
```

- [ ] **Step 3: Chạy seed**

```bash
npm run db:seed:vocabulary
```

Expected: `Da nap 25 chu de`, dòng tiến độ tới `5000/5000`, `Tong muc tu trong DB: 0-4999/5000`.

- [ ] **Step 4: Kiểm tra dữ liệu đọc được công khai**

```bash
node -e "const u='https://fjlyjaomuxotqqjvugtv.supabase.co/rest/v1/vocabulary_topics?select=key,title&order=number.asc';const r=await fetch(u,{headers:{apikey:'sb_publishable_x'}});console.log(r.status)"
```

Nếu chưa có publishable key trong tay: dùng key trong `.env.local` (`VITE_SUPABASE_PUBLISHABLE_KEY`).

Expected: `200` và 25 dòng.

- [ ] **Step 5: Commit**

```bash
git add supabase/seed/seed-vocabulary.mjs package.json package-lock.json
git commit -m "feat(seed): nap 5000 tu vung vao bang vocabulary_entries"
```

---

### Task 4: Logic thuần (TDD)

**Files:**
- Create: `src/lib/vocabularyLogic.ts`
- Create: `tests/vocabulary.test.ts`
- Modify: `package.json` (thêm `tests/vocabulary.test.ts` vào `npm test`)

- [ ] **Step 1: Viết test đỏ**

```typescript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  entryRowToEntry,
  entryToCard,
  filterEntries,
  isInNotebook,
  type VocabularyEntry,
  type VocabularyEntryRow,
} from '../src/lib/vocabularyLogic.ts'

const row: VocabularyEntryRow = {
  id: 'e-1',
  topic_key: 'education',
  term: 'early childhood education',
  pos: 'np',
  meaning: 'giáo dục mầm non',
  definition: 'danh từ không đếm được; invest in/expand + early childhood education',
  examples: ['Early childhood education narrows the gap.', 'The city doubled spending on early childhood education.'],
  ipa: null,
}

const entry: VocabularyEntry = {
  id: 'e-1',
  topicKey: 'education',
  term: 'early childhood education',
  pos: 'np',
  meaning: 'giáo dục mầm non',
  definition: 'danh từ không đếm được',
  examples: row.examples,
  ipa: null,
}

test('entry rows map to the app entry shape', () => {
  assert.deepEqual(entryRowToEntry(row), entry)
})

test('missing optional columns fall back to empty values', () => {
  const mapped = entryRowToEntry({ id: 'e-2', topic_key: 'oceans', term: 'tide', pos: null, meaning: null, definition: null, examples: null, ipa: null })
  assert.equal(mapped.pos, '')
  assert.equal(mapped.meaning, '')
  assert.deepEqual(mapped.examples, [])
  assert.equal(mapped.ipa, null)
})

test('filter matches term, meaning and definition', () => {
  assert.deepEqual(filterEntries([entry], 'childhood').map(item => item.id), ['e-1'])
  assert.deepEqual(filterEntries([entry], 'giáo dục').map(item => item.id), ['e-1'])
  assert.deepEqual(filterEntries([entry], 'không đếm được').map(item => item.id), ['e-1'])
  assert.deepEqual(filterEntries([entry], 'xyz'), [])
})

test('a phrase becomes a collocation card, a word a vocabulary card', () => {
  assert.equal(entryToCard(entry).kind, 'vocabulary')
  const phrase = entryToCard({ ...entry, pos: 'phr', term: 'carve up' })
  assert.equal(phrase.kind, 'collocation')
})

test('a card carries the topic as tag and one example sentence', () => {
  const card = entryToCard(entry)
  assert.equal(card.term, 'early childhood education')
  assert.equal(card.meaning, 'giáo dục mầm non')
  assert.equal(card.example, 'Early childhood education narrows the gap.')
  assert.deepEqual(card.tags, ['education'])
})

test('notebook membership ignores case and surrounding spaces', () => {
  const cards = [{ term: 'Early Childhood Education', kind: 'vocabulary' }]
  assert.equal(isInNotebook(entry, cards), true)
  assert.equal(isInNotebook(entry, []), false)
})
```

- [ ] **Step 2: Chạy test để thấy fail**

```bash
node --test tests/vocabulary.test.ts
```

Expected: FAIL — `Cannot find module '../src/lib/vocabularyLogic.ts'`.

- [ ] **Step 3: Viết implementation**

`src/lib/vocabularyLogic.ts`:

```typescript
// Logic thuần cho thư viện từ vựng 25 chủ đề: map hàng DB, lọc, tạo thẻ ôn tập.

export type VocabularyTopic = {
  key: string
  number: number
  title: string
  description: string
}

export type VocabularyEntry = {
  id: string
  topicKey: string
  term: string
  pos: string
  meaning: string
  definition: string
  examples: string[]
  ipa: string | null
}

export type VocabularyEntryRow = {
  id: string
  topic_key: string
  term: string
  pos: string | null
  meaning: string | null
  definition: string | null
  examples: string[] | null
  ipa: string | null
}

export type VocabularyTopicRow = {
  key: string
  number: number
  title: string
  description: string | null
}

export type NotebookCard = { term: string; kind: string }

/** Hàng của bảng `vocabulary_entries` -> mục từ trong app. */
export function entryRowToEntry(row: VocabularyEntryRow): VocabularyEntry {
  return {
    id: row.id,
    topicKey: row.topic_key,
    term: row.term,
    pos: row.pos ?? '',
    meaning: row.meaning ?? '',
    definition: row.definition ?? '',
    examples: row.examples ?? [],
    ipa: row.ipa ?? null,
  }
}

/** Hàng của bảng `vocabulary_topics` -> chủ đề trong app. */
export function topicRowToTopic(row: VocabularyTopicRow): VocabularyTopic {
  return { key: row.key, number: row.number, title: row.title, description: row.description ?? '' }
}

/** Lọc theo từ, nghĩa hoặc ghi chú cách dùng. */
export function filterEntries(entries: VocabularyEntry[], query: string): VocabularyEntry[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return entries
  return entries.filter(entry => `${entry.term} ${entry.meaning} ${entry.definition}`.toLowerCase().includes(needle))
}

/** Cụm từ thành thẻ collocation, từ đơn thành thẻ vocabulary. */
export function entryToCard(entry: VocabularyEntry): { term: string; meaning: string; example: string; kind: 'vocabulary' | 'collocation'; tags: string[] } {
  const kind = entry.pos === 'phr' || entry.pos === 'id' ? 'collocation' : 'vocabulary'
  return {
    term: entry.term,
    meaning: entry.meaning,
    example: entry.examples[0] ?? '',
    kind,
    tags: [entry.topicKey],
  }
}

/** Từ đã có trong sổ cá nhân chưa (không phân biệt hoa thường). */
export function isInNotebook(entry: VocabularyEntry, cards: NotebookCard[]): boolean {
  const term = entry.term.trim().toLowerCase()
  const kind = entryToCard(entry).kind
  return cards.some(card => card.term.trim().toLowerCase() === term && card.kind === kind)
}
```

- [ ] **Step 4: Chạy test để thấy pass**

```bash
node --test tests/vocabulary.test.ts
```

Expected: 6/6 pass.

- [ ] **Step 5: Thêm test vào `npm test`**

Trong `package.json`, sửa `"test": "node --test tests/learning.test.ts tests/auth.test.ts tests/sync.test.ts tests/ai.test.ts"` thành:

```json
"test": "node --test tests/learning.test.ts tests/auth.test.ts tests/sync.test.ts tests/ai.test.ts tests/vocabulary.test.ts"
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/vocabularyLogic.ts tests/vocabulary.test.ts package.json
git commit -m "feat(vocab): logic thuần cho thu vien tu vung"
```

---

### Task 5: Repository đọc PostgREST

**Files:**
- Create: `src/lib/vocabularyRepository.ts`
- Modify: `tests/vocabulary.test.ts`

- [ ] **Step 1: Viết test đỏ (mock fetch)**

Thêm vào `tests/vocabulary.test.ts`:

```typescript
import { loadVocabularyEntries, loadVocabularyTopics } from '../src/lib/vocabularyRepository.ts'

test('repository loads topics and maps rows', async () => {
  const original = globalThis.fetch
  globalThis.fetch = (async () => new Response(JSON.stringify([
    { key: 'education', number: 1, title: 'Education & Learning', description: 'mo ta' },
  ]), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch
  try {
    const topics = await loadVocabularyTopics()
    assert.equal(topics.length, 1)
    assert.equal(topics[0].key, 'education')
  } finally {
    globalThis.fetch = original
  }
})

test('repository sends topic and search filters', async () => {
  const original = globalThis.fetch
  let seen = ''
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    seen = String(input)
    return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } })
  }) as typeof fetch
  try {
    const entries = await loadVocabularyEntries({ topic: 'oceans', search: 'tide', limit: 20 })
    assert.deepEqual(entries, [])
    assert.match(seen, /topic_key=eq\.oceans/)
    assert.match(seen, /ilike/i)
  } finally {
    globalThis.fetch = original
  }
})
```

- [ ] **Step 2: Chạy test để thấy fail**

```bash
node --test tests/vocabulary.test.ts
```

Expected: FAIL — `Cannot find module '../src/lib/vocabularyRepository.ts'`.

- [ ] **Step 3: Viết implementation**

`src/lib/vocabularyRepository.ts`:

```typescript
// Đọc thư viện từ vựng 25 chủ đề từ PostgREST (bảng public, đọc công khai).

import { entryRowToEntry, topicRowToTopic, type VocabularyEntry, type VocabularyEntryRow, type VocabularyTopic, type VocabularyTopicRow } from './vocabularyLogic'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

async function request(path: string, params: URLSearchParams): Promise<unknown[]> {
  if (!url || !key) return []
  const response = await fetch(`${url}/rest/v1/${path}?${params.toString()}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!response.ok) return []
  return (await response.json()) as unknown[]
}

export async function loadVocabularyTopics(): Promise<VocabularyTopic[]> {
  try {
    const rows = await request('vocabulary_topics', new URLSearchParams({ select: '*', order: 'number.asc' }))
    return (rows as VocabularyTopicRow[]).map(topicRowToTopic)
  } catch {
    return []
  }
}

export async function loadVocabularyEntries(query: { topic?: string; search?: string; limit?: number; offset?: number }): Promise<VocabularyEntry[]> {
  try {
    const params = new URLSearchParams({ select: '*', order: 'sort_order.asc' })
    if (query.topic) params.set('topic_key', `eq.${query.topic}`)
    if (query.search) params.set('or', `(term.ilike.*${query.search}*,meaning.ilike.*${query.search}*)`)
    if (query.limit) params.set('limit', String(query.limit))
    if (query.offset) params.set('offset', String(query.offset))
    const rows = await request('vocabulary_entries', params)
    return (rows as VocabularyEntryRow[]).map(entryRowToEntry)
  } catch {
    return []
  }
}
```

- [ ] **Step 4: Chạy test để thấy pass**

```bash
node --test tests/vocabulary.test.ts
```

Expected: 8/8 pass.

> Lưu ý: `import.meta.env` trong node:test là `undefined` — `import.meta.env?.VITE_SUPABASE_URL` sẽ ném lỗi. Nếu test fail vì vậy, đổi sang đọc biến môi trường an toàn:
> ```typescript
> const env = (import.meta as { env?: Record<string, string | undefined> }).env
> const url = env?.VITE_SUPABASE_URL
> const key = env?.VITE_SUPABASE_PUBLISHABLE_KEY
> ```

- [ ] **Step 5: Commit**

```bash
git add src/lib/vocabularyRepository.ts tests/vocabulary.test.ts
git commit -m "feat(vocab): repository doc tu vung qua PostgREST"
```

---

### Task 6: Store giữ tag chủ đề

**Files:**
- Modify: `src/lib/store.tsx` (dòng 43 + 411-440)
- Modify: `src/lib/sync.ts` (`StudyCardRow` + `studyCardRowToCard`)

- [ ] **Step 1: Mở rộng kiểu `Card` với `tags`**

Trong `src/lib/sync.ts`, sửa `StudyCardRow` thành có `tags`:

```typescript
export type StudyCardRow = {
  id: string
  kind: string
  front: string
  back: string
  example: string
  tags: string[] | null
  level: number
  due_at: string
}
```

Và `studyCardRowToCard` trả về kèm `tags: row.tags ?? []`.

- [ ] **Step 2: `addCard` nhận `tags`**

Trong `src/lib/store.tsx`:

```typescript
addCard: (card: Pick<Card, 'term' | 'meaning' | 'example' | 'kind'> & { tags?: string[] }) => Promise<void>
```

và trong hàm `addCard`:

```typescript
const tags = card.tags ?? []
...
const { data, error: failure } = await supabase.rpc('save_study_card', {
  p_kind: card.kind,
  p_front: card.term,
  p_back: card.meaning,
  p_example: card.example,
  p_dedupe_key: null,
  p_tags: tags,
})
```

Nhánh chưa đăng nhập (local) cũng phải giữ `tags` trong object thẻ mới.

- [ ] **Step 3: Test**

Thêm vào `tests/sync.test.ts`:

```typescript
test('card rows keep their topic tags', () => {
  const card = studyCardRowToCard({ id: 'c-1', kind: 'vocabulary', front: 'tide', back: 'thuỷ triều', example: '', tags: ['oceans'], level: 0, due_at: '2026-10-26T00:00:00Z' })
  assert.deepEqual(card.tags, ['oceans'])
})
```

- [ ] **Step 4: Chạy test**

```bash
npm test
```

Expected: tất cả pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/store.tsx src/lib/sync.ts tests/sync.test.ts
git commit -m "feat(vocab): the study card giu tag chu de"
```

---

### Task 7: UI thư viện 25 chủ đề

**Files:**
- Create: `src/components/VocabularyLibrary.tsx`
- Modify: `src/pages/Learning.tsx` (trang `Vocabulary`)
- Modify: `src/styles.css` (class mới)

- [ ] **Step 1: Viết component `VocabularyLibrary.tsx`**

```tsx
import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Check, Plus, Search } from 'lucide-react'
import { useCopy } from '../i18n'
import { useStore } from '../lib/store'
import { Empty, Notice } from './ui'
import { loadVocabularyEntries, loadVocabularyTopics } from '../lib/vocabularyRepository'
import { entryToCard, filterEntries, isInNotebook, type VocabularyEntry, type VocabularyTopic } from '../lib/vocabularyLogic'

const PAGE_SIZE = 60

export function VocabularyLibrary() {
  const { c } = useCopy()
  const { state, addCard } = useStore()
  const [topics, setTopics] = useState<VocabularyTopic[]>([])
  const [topicKey, setTopicKey] = useState<string>('')
  const [entries, setEntries] = useState<VocabularyEntry[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string>('')

  useEffect(() => {
    let active = true
    void loadVocabularyTopics().then(items => {
      if (!active) return
      setTopics(items)
      setTopicKey(items[0]?.key ?? '')
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!topicKey) return
    let active = true
    void loadVocabularyEntries({ topic: topicKey, limit: 500 }).then(items => {
      if (active) setEntries(items)
    })
    return () => { active = false }
  }, [topicKey])

  const visible = useMemo(() => filterEntries(entries, query), [entries, query])
  const active = topics.find(topic => topic.key === topicKey)

  async function save(entry: VocabularyEntry) {
    setSaving(entry.id)
    try {
      await addCard(entryToCard(entry))
    } finally {
      setSaving('')
    }
  }

  if (!topics.length) {
    return <Notice error>{loading ? c('Đang tải thư viện từ vựng…', 'Loading the vocabulary library…') : c('Chưa tải được thư viện từ vựng.', 'The vocabulary library could not be loaded.')}</Notice>
  }

  return <>
    <div className="filter-bar"><div className="search-field"><Search size={18} /><input aria-label={c('Tìm trong chủ đề', 'Search this topic')} value={query} onChange={event => setQuery(event.target.value)} placeholder={c('Tìm từ hoặc nghĩa…', 'Search a word or meaning…')} /></div></div>
    <div className="vocab-topic-grid">{topics.map(topic => <button key={topic.key} className={`vocab-topic-card ${topic.key === topicKey ? 'active' : ''}`} aria-pressed={topic.key === topicKey} onClick={() => setTopicKey(topic.key)}><span className="number-dot">{String(topic.number).padStart(2, '0')}</span><strong>{topic.title}</strong><small>{topic.description}</small></button>)}</div>
    {active ? <section className="vocab-library-panel"><header className="panel-heading"><div><h2>{active.title}</h2><p className="muted">{active.description}</p></div><span className="badge teal">{visible.length} / {entries.length}</span></header>
      {visible.length ? <div className="vocab-grid">{visible.map(entry => {
        const added = isInNotebook(entry, state.cards)
        return <article className="panel vocab-card" key={entry.id}><div className="card-topline"><span className="badge teal">{entry.pos || c('Từ vựng', 'Word')}</span>{entry.ipa && <span className="muted">/{entry.ipa}/</span>}</div><h3>{entry.term}</h3><p>{entry.meaning}</p>{entry.definition && <p className="muted">{entry.definition}</p>}{entry.examples[0] && <blockquote>{entry.examples[0]}</blockquote>}<button className="button outline full" disabled={added || saving === entry.id} onClick={() => void save(entry)}>{added ? <><Check size={16} />{c('Đã có trong sổ', 'In your notebook')}</> : <><Plus size={16} />{c('Thêm vào sổ', 'Add to notebook')}</>}</button></article>
      })}</div> : <Empty title={c('Không tìm thấy từ nào', 'No words found')} description={c('Thử một từ khác trong chủ đề này.', 'Try another word in this topic.')} />}
    </section> : null}
  </>
}
```

- [ ] **Step 2: Gắn 2 tab vào trang `Vocabulary`**

Trong `src/pages/Learning.tsx`, sửa hàm `Vocabulary`:

```tsx
export function Vocabulary() {
  const { c } = useCopy()
  const { state, addCard, update } = useStore()
  const [tab, setTab] = useState<'mine' | 'library'>('mine')
  ...
  return <><PageHeader ... />
    <div className="tabs"><button className={tab === 'mine' ? 'active' : ''} aria-pressed={tab === 'mine'} onClick={() => setTab('mine')}>{c('Sổ của tôi', 'My notebook')}</button><button className={tab === 'library' ? 'active' : ''} aria-pressed={tab === 'library'} onClick={() => setTab('library')}>{c('Thư viện 25 chủ đề', '25-topic library')}</button></div>
    {tab === 'library' ? <VocabularyLibrary /> : <>...phần sổ hiện tại...</>}
  </>
}
```

Import thêm: `import { VocabularyLibrary } from '../components/VocabularyLibrary'`.

- [ ] **Step 3: Thêm CSS**

Thêm vào cuối `src/styles.css`:

```css
.vocab-topic-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin: 16px 0 24px; }
.vocab-topic-card { display: grid; gap: 6px; text-align: left; padding: 14px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; }
.vocab-topic-card.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
.vocab-topic-card strong { font-size: 0.98rem; }
.vocab-topic-card small { color: var(--muted); font-size: 0.8rem; line-height: 1.35; }
.vocab-library-panel { display: grid; gap: 16px; }
```

(Điều chỉnh tên token nếu `styles.css` dùng bộ token khác — kiểm tra trước khi thêm.)

- [ ] **Step 4: Build + test**

```bash
npm run build
npm test
```

Expected: build exit 0, test pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/VocabularyLibrary.tsx src/pages/Learning.tsx src/styles.css
git commit -m "feat(vocab): tab thu vien 25 chu de trong so tu vung"
```

---

### Task 8: Test trình duyệt + smoke test

**Files:**
- Modify: `tests/production.mjs`
- Create: `tests/vocabulary-library.mjs`

- [ ] **Step 1: Thêm kiểm tra vào smoke test production**

Trong `tests/production.mjs`, thêm vào cuối (trước `await browser.close()`):

```javascript
// Tab thư viện từ vựng phải tải được 25 chủ đề từ database.
await page.goto(`${base}/app/vocabulary`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const library = await page.evaluate(() => ({
  tabs: [...document.querySelectorAll('.tabs button')].map(node => node.textContent?.trim() ?? ''),
  topics: document.querySelectorAll('.vocab-topic-card').length,
}))
await page.click('.tabs button:nth-child(2)')
await page.waitForTimeout(2000)
const topicCount = await page.evaluate(() => document.querySelectorAll('.vocab-topic-card').length)
assert.ok(topicCount === 25, `Thư viện từ vựng phải có 25 chủ đề, thấy ${topicCount}`)
```

- [ ] **Step 2: Chạy smoke test local (dev server)**

```bash
npm run dev
TEST_URL=http://127.0.0.1:5173 node tests/production.mjs
```

Expected: `PASS`.

- [ ] **Step 3: Commit**

```bash
git add tests/production.mjs
git commit -m "test(vocab): kiem tra thu vien 25 chu de tren ban deploy"
```

---

### Task 9: Deploy

- [ ] **Step 1: Push**

```bash
git push origin main
```

> Bắt buộc: Vercel map commit author qua GitHub — commit chưa push sẽ bị chặn deployment.

- [ ] **Step 2: Deploy**

```bash
npx vercel --prod --yes
```

- [ ] **Step 3: Smoke test bản live**

```bash
TEST_URL=https://huybui.vercel.app node tests/production.mjs
```

Expected: `PASS: bản deploy https://huybui.vercel.app nối được database — ...`

- [ ] **Step 4: Kiểm tra thủ công tab mới trên bản live**

Mở `https://huybui.vercel.app/app/vocabulary`, bấm tab "Thư viện 25 chủ đề", chọn 1 chủ đề, bấm "Thêm vào sổ", xác nhận thẻ xuất hiện ở tab "Sổ của tôi".

---

## Ghi chú

- **Bản quyền:** dữ liệu lấy từ `forumflashstudy.com` (The Forum Center). Trước khi phát hành công khai, cần xác nhận quyền dùng hoặc ghi nguồn trong UI. Có thể thêm dòng "Nguồn: ForumFlash" ở chân tab thư viện.
- **Nội dung EN:** nguồn không có gloss tiếng Anh; UI tiếng Anh sẽ hiện nghĩa tiếng Việt kèm 2 câu ví dụ tiếng Anh. Không tốn token AI.
- **IPA:** 2.107/5.000 mục có IPA (đa từ vựng đa âm tiết thường không có).
