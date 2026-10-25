/**
 * Nạp thư viện từ vựng 25 chủ đề vào Postgres.
 *
 *   npm run db:seed:vocabulary
 *
 * Nguồn: supabase/seed/vocabulary-data.json (đọc trong repo, không cần mạng).
 * Script idempotent: upsert theo (key) và (topic_key, term).
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
    } catch {
      /* thử candidate tiếp theo */
    }
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
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
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
console.log(`Đã nạp ${topics.length} chủ đề`)

const entries = []
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
console.log('Tổng mục từ trong DB:', countResponse.headers.get('content-range'))
