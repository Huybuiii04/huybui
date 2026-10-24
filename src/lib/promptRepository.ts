import type { PromptItem, Source, TaskKind } from '../data/prompts'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export function backendConfigured() {
  return Boolean(url && key)
}

export type PromptQuery = { task?: TaskKind; source?: Source; set?: string; search?: string; topic?: string; subtype?: string }

export type PromptTopic = { key: string; labelVi: string; labelEn: string; descriptionVi: string; descriptionEn: string; subtopics: string[]; task: TaskKind | null; sortOrder: number }
export type PromptChartType = { key: string; labelVi: string; labelEn: string; descriptionVi: string; descriptionEn: string; sortOrder: number }

type PromptRow = {
  slug: string
  task: TaskKind
  subtype: string
  type_label: string
  source: Source
  set_name: string | null
  difficulty: PromptItem['difficulty']
  topics: string[] | null
  title_vi: string
  title_en: string
  text: string
  reference: string | null
  chart: PromptItem['chart'] | null
  minutes: number
  hint_vi: string | null
  hint_en: string | null
}

type TopicRow = {
  key: string
  label_vi: string
  label_en: string
  description_vi: string | null
  description_en: string | null
  subtopics: string[] | null
  task: TaskKind | null
  sort_order: number
}

type ChartTypeRow = {
  key: string
  label_vi: string
  label_en: string
  description_vi: string
  description_en: string
  sort_order: number
}

function toItem(row: PromptRow): PromptItem {
  return {
    slug: row.slug,
    task: row.task,
    subtype: row.subtype,
    typeLabel: row.type_label,
    source: row.source,
    setName: row.set_name ?? undefined,
    difficulty: row.difficulty,
    topics: row.topics ?? [],
    title: [row.title_vi, row.title_en],
    text: row.text,
    reference: row.reference ?? undefined,
    chart: row.chart ?? undefined,
    minutes: row.minutes,
    hint: [row.hint_vi ?? '', row.hint_en ?? ''],
  }
}

function toTopic(row: TopicRow): PromptTopic {
  return { key: row.key, labelVi: row.label_vi, labelEn: row.label_en, descriptionVi: row.description_vi ?? '', descriptionEn: row.description_en ?? '', subtopics: row.subtopics ?? [], task: row.task, sortOrder: row.sort_order }
}

function toChartType(row: ChartTypeRow): PromptChartType {
  return { key: row.key, labelVi: row.label_vi, labelEn: row.label_en, descriptionVi: row.description_vi, descriptionEn: row.description_en, sortOrder: row.sort_order }
}

async function request(path: string, params: URLSearchParams): Promise<unknown[]> {
  if (!url || !key) return []
  const response = await fetch(`${url}/rest/v1/${path}?${params.toString()}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!response.ok) return []
  return (await response.json()) as unknown[]
}

export async function loadPrompts(query: PromptQuery) {
  try {
    const params = new URLSearchParams({ select: '*', order: 'title_en.asc' })
    if (query.task) params.set('task', `eq.${query.task}`)
    if (query.source) params.set('source', `eq.${query.source}`)
    if (query.set) params.set('set_name', `like.${query.set}*`)
    if (query.topic) params.set('topics', `cs.{${query.topic}}`)
    if (query.subtype) params.set('subtype', `eq.${query.subtype}`)
    if (query.search) params.set('or', `(title_vi.ilike.*${query.search}*,title_en.ilike.*${query.search}*,text.ilike.*${query.search}*)`)
    const rows = await request('prompts', params)
    return (rows as PromptRow[]).map(toItem)
  } catch {
    return []
  }
}

export async function loadTopics() {
  try {
    const rows = await request('prompt_topics', new URLSearchParams({ select: '*', order: 'sort_order.asc' }))
    return (rows as TopicRow[]).map(toTopic)
  } catch {
    return []
  }
}

export async function loadChartTypes() {
  try {
    const rows = await request('prompt_chart_types', new URLSearchParams({ select: '*', order: 'sort_order.asc' }))
    return (rows as ChartTypeRow[]).map(toChartType)
  } catch {
    return []
  }
}

export async function loadPromptBySlug(slug: string) {
  if (!url || !key) return undefined
  try {
    const rows = await request('prompts', new URLSearchParams({ slug: `eq.${slug}`, select: '*' }))
    const row = (rows as PromptRow[])[0]
    return row ? toItem(row) : undefined
  } catch {
    return undefined
  }
}
