import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? 'https://fjlyjaomuxotqqjvugtv.supabase.co'
const secret = process.env.SUPABASE_SECRET_KEY
if (!secret) {
  console.error('Thiếu SUPABASE_SECRET_KEY')
  process.exit(1)
}

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })

const source = JSON.parse(readFileSync('debai/IELTS_Task2_19_Topics_190_Prompts.json', 'utf8'))
const items = source.prompts ?? source.items ?? Object.values(source)[0]

/** slug trong bộ debai → key chuẩn của topicLibrary trong src/data/prompts.ts */
const TOPIC_KEY = {
  education: 'education',
  environment: 'environment',
  technology: 'technology',
  'work-employment': 'work',
  health: 'health',
  society: 'society',
  'media-advertising': 'media',
  transport: 'transport',
  'family-children': 'family',
  'culture-language': 'culture',
  crime: 'crime',
  'government-law': 'government',
  'money-economy': 'money',
  'food-diet': 'food',
  'art-creativity': 'art',
  'sport-fitness': 'sport',
  'travel-tourism': 'travel',
  business: 'business',
  communication: 'communication'
}

const TOPIC_LABEL = {
  education: ['Giáo dục', 'Education'],
  environment: ['Môi trường', 'Environment'],
  technology: ['Công nghệ', 'Technology'],
  work: ['Việc làm & Thị trường lao động', 'Work & Employment'],
  health: ['Sức khỏe', 'Health'],
  society: ['Xã hội', 'Society'],
  media: ['Truyền thông & Quảng cáo', 'Media & Advertising'],
  transport: ['Giao thông', 'Transport'],
  family: ['Gia đình & Trẻ em', 'Family & Children'],
  culture: ['Văn hóa & Ngôn ngữ', 'Culture & Language'],
  crime: ['Tội phạm', 'Crime'],
  government: ['Chính phủ & Pháp luật', 'Government & Law'],
  money: ['Tiền bạc & Kinh tế', 'Money & Economy'],
  food: ['Ẩm thực', 'Food & Diet'],
  art: ['Nghệ thuật & Sáng tạo', 'Art & Creativity'],
  sport: ['Thể thao & Thể lực', 'Sport & Fitness'],
  travel: ['Du lịch', 'Travel & Tourism'],
  business: ['Kinh doanh', 'Business'],
  communication: ['Giao tiếp', 'Communication']
}

const SUBTYPE = {
  'Discussion': 'discussion',
  'Advantages/Disadvantages': 'advantages-disadvantages',
  'Opinion': 'opinion',
  'Problems/Solutions or Two-part': 'problem-solution',
  'Positive/Negative': 'positive-negative',
  'Two-part / Evaluation': 'two-part-evaluation'
}

/**
 * subtopics của mỗi topic suy ra từ union keywords của các prompt thuộc topic đó
 * trong chính bộ debai → script không phụ thuộc file frontend.
 */
function collectSubtopics(items) {
  const map = new Map()
  for (const item of items) {
    const key = TOPIC_KEY[item.topic_slug] ?? item.topic_slug
    const list = map.get(key) ?? []
    for (const word of Array.isArray(item.keywords) ? item.keywords : []) {
      if (word && !list.includes(word)) list.push(word)
    }
    map.set(key, list)
  }
  return map
}

const subtopicsByTopic = collectSubtopics(items)

const topicOrder = Object.keys(TOPIC_KEY).map(slug => TOPIC_KEY[slug])
const topicRows = topicOrder.map((key, index) => ({
  key,
  label_vi: TOPIC_LABEL[key][0],
  label_en: TOPIC_LABEL[key][1],
  subtopics: subtopicsByTopic.get(key) ?? [],
  task: 'task2',
  sort_order: index
}))

const perTopicCounter = new Map()
const promptRows = items.map(item => {
  const key = TOPIC_KEY[item.topic_slug] ?? item.topic_slug
  const order = perTopicCounter.get(key) ?? 0
  perTopicCounter.set(key, order + 1)
  const keywords = Array.isArray(item.keywords) ? item.keywords : []
  return {
    slug: item.id,
    task: 'task2',
    subtype: SUBTYPE[item.question_type] ?? 'essay',
    type_label: item.question_type,
    source: item.origin === 'Cambridge Original' ? 'recalled' : 'practice',
    set_name: item.origin === 'Cambridge Original' ? item.source_name : null,
    difficulty: 'MEDIUM',
    topics: [key],
    title_vi: `${item.question_type} · ${item.topic}`,
    title_en: `${item.question_type} · ${item.topic}`,
    text: item.prompt,
    reference: '',
    chart: null,
    minutes: 40,
    hint_vi: '',
    hint_en: keywords.length ? `Keywords: ${keywords.join(', ')}` : '',
    status: 'published',
    sort_order: order
  }
})

const { data: topics, error: topicError } = await supabase
  .from('prompt_topics')
  .upsert(topicRows, { onConflict: 'key' })
  .select('key')
if (topicError) {
  console.error('Lỗi nạp prompt_topics:', topicError.message)
  process.exit(1)
}
console.log(`Đã nạp ${topics?.length ?? 0} prompt_topics`)

const { data: prompts, error: promptError } = await supabase
  .from('prompts')
  .upsert(promptRows, { onConflict: 'slug' })
  .select('id,slug')
if (promptError) {
  console.error('Lỗi nạp prompts:', promptError.message)
  process.exit(1)
}
console.log(`Đã nạp ${prompts?.length ?? 0} prompts`)

const { count: topicCount } = await supabase.from('prompt_topics').select('key', { count: 'exact', head: true })
const { count: promptCount } = await supabase.from('prompts').select('id', { count: 'exact', head: true })
console.log(`Tổng: ${promptCount} prompts / ${topicCount} topics`)
