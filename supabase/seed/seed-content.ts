import { createClient } from '@supabase/supabase-js'
import { entries, guides } from '../../src/data/content.ts'

const url = process.env.SUPABASE_URL ?? 'https://fjlyjaomuxotqqjvugtv.supabase.co'
const secret = process.env.SUPABASE_SECRET_KEY
if (!secret) {
  console.error('Thiếu SUPABASE_SECRET_KEY')
  process.exit(1)
}

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })

type EntryRow = {
  kind: string
  slug: string
  task_type: string | null
  metadata: Record<string, unknown>
  sort_order: number
  status: 'published'
}

const rows: EntryRow[] = [
  ...entries.map((entry, index) => ({
    kind: entry.kind,
    slug: entry.slug,
    task_type: entry.task === 'all' ? null : entry.task,
    metadata: entry.expression ? { expression: entry.expression } : {},
    sort_order: index,
    status: 'published' as const
  })),
  ...guides.map((guide, index) => ({
    kind: 'guide',
    slug: guide.slug,
    task_type: null,
    metadata: { category: guide.category, minutes: guide.minutes },
    sort_order: entries.length + index,
    status: 'published' as const
  }))
]

const { data: inserted, error: insertError } = await supabase
  .from('content_entries')
  .upsert(rows, { onConflict: 'kind,slug' })
  .select('id,kind,slug')
if (insertError) {
  console.error('Lỗi nạp content_entries:', insertError.message)
  process.exit(1)
}
console.log(`Đã nạp ${inserted?.length ?? 0} content_entries`)

const translations = inserted?.flatMap(entry => {
  const source = rows.find(row => row.kind === entry.kind && row.slug === entry.slug)
  if (!source) return []
  const metadata = source.metadata as { category?: [string, string] }
  const guide = source.kind === 'guide'
  const item = guide
    ? guides.find(item => item.slug === entry.slug)
    : entries.find(item => item.slug === entry.slug)
  if (!item) return []
  const title = item.title
  const summary = guide
    ? (metadata.category ?? item.title)
    : (item.description ?? item.title)
  const body = item.body
  return [
    { entry_id: entry.id, locale: 'vi', title: title[0], summary: summary[0], body: body[0] },
    { entry_id: entry.id, locale: 'en', title: title[1], summary: summary[1], body: body[1] }
  ]
}) ?? []

const { error: translationError } = await supabase
  .from('content_translations')
  .upsert(translations, { onConflict: 'entry_id,locale' })
if (translationError) {
  console.error('Lỗi nạp content_translations:', translationError.message)
  process.exit(1)
}
console.log(`Đã nạp ${translations.length} content_translations`)

const { count: entryCount } = await supabase.from('content_entries').select('id', { count: 'exact', head: true })
const { count: translationCount } = await supabase.from('content_translations').select('entry_id', { count: 'exact', head: true })
console.log(`Tổng: ${entryCount} content_entries / ${translationCount} content_translations`)
