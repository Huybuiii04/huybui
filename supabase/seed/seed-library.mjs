import { createClient } from '@supabase/supabase-js'
import { seedPrompts } from './prompt-data.ts'
import { seedTopics } from './topic-data.ts'
import { seedChartTypes } from './chart-type-data.ts'

const url = process.env.SUPABASE_URL ?? 'https://fjlyjaomuxotqqjvugtv.supabase.co'
const secret = process.env.SUPABASE_SECRET_KEY
if (!secret) {
  console.error('Thiếu SUPABASE_SECRET_KEY')
  process.exit(1)
}

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })

const topicRows = seedTopics.map(topic => ({
  key: topic.key,
  label_vi: topic.labelVi,
  label_en: topic.labelEn,
  description_vi: topic.descriptionVi ?? '',
  description_en: topic.descriptionEn ?? '',
  subtopics: topic.subtopics ?? [],
  task: topic.task ?? null,
  sort_order: topic.sortOrder ?? 0
}))

const promptRows = seedPrompts
  .filter(prompt => prompt.task !== 'academic_task1') // Task 1 Academic nạp bằng seed-task1.mjs (có ảnh đề)
  .map((prompt, index) => ({
  slug: prompt.slug,
  task: prompt.task,
  subtype: prompt.subtype ?? '',
  type_label: prompt.typeLabel ?? 'ESSAY',
  source: prompt.source ?? 'practice',
  set_name: prompt.setName ?? null,
  difficulty: prompt.difficulty ?? 'MEDIUM',
  topics: prompt.topics ?? [],
  title_vi: prompt.titleVi ?? '',
  title_en: prompt.titleEn ?? '',
  text: prompt.text ?? '',
  reference: prompt.reference ?? '',
  chart: prompt.chart ?? null,
  minutes: prompt.minutes ?? 40,
  hint_vi: prompt.hintVi ?? '',
  hint_en: prompt.hintEn ?? '',
  status: 'published',
  sort_order: index
}))

const chartRows = seedChartTypes.map(type => ({
  key: type.key,
  label_vi: type.labelVi,
  label_en: type.labelEn,
  description_vi: type.descriptionVi ?? '',
  description_en: type.descriptionEn ?? '',
  sort_order: type.sortOrder ?? 0,
  status: 'published'
}))

const { data: topics, error: topicError } = await supabase
  .from('prompt_topics')
  .upsert(topicRows, { onConflict: 'key' })
  .select('key')
if (topicError) {
  console.error('Lỗi nạp prompt_topics:', topicError.message)
  process.exit(1)
}
console.log(`Đã nạp ${topics?.length ?? 0} prompt_topics`)

const { data: chartTypes, error: chartError } = await supabase
  .from('prompt_chart_types')
  .upsert(chartRows, { onConflict: 'key' })
  .select('key')
if (chartError) {
  console.error('Lỗi nạp prompt_chart_types:', chartError.message)
  process.exit(1)
}
console.log(`Đã nạp ${chartTypes?.length ?? 0} prompt_chart_types`)

const { data: prompts, error: promptError } = await supabase
  .from('prompts')
  .upsert(promptRows, { onConflict: 'slug' })
  .select('id,slug')
if (promptError) {
  console.error('Lỗi nạp prompts:', promptError.message)
  process.exit(1)
}
console.log(`Đã nạp ${prompts?.length ?? 0} prompts`)

const { count: promptCount } = await supabase.from('prompts').select('id', { count: 'exact', head: true })
const { count: chartCount } = await supabase.from('prompts').select('id', { count: 'exact', head: true }).eq('chart', 'not', 'null')
console.log(`Tổng: ${promptCount} prompts (${chartCount} có biểu đồ) / ${chartTypes?.length ?? 0} dạng biểu đồ`)
