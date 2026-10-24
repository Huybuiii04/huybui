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

/** Mô tả chủ đề song ngữ để lưới chủ đề không bị trộn ngôn ngữ. */
const TOPIC_DESCRIPTION = {
  education: ['Chương trình, giáo viên, học phí và cách học.', 'Curriculum, teachers, fees and how learning works.'],
  environment: ['Khí hậu, rác thải, năng lượng sạch và bảo tồn.', 'Climate, waste, clean energy and conservation.'],
  technology: ['AI, quyền riêng tư, chênh lệch số và tự động hoá.', 'AI, privacy, the digital divide and automation.'],
  work: ['Lương, cân bằng công việc, thất nghiệp và đào tạo.', 'Pay, work-life balance, unemployment and training.'],
  health: ['Phòng bệnh, dinh dưỡng, tâm lý và hệ thống y tế.', 'Prevention, nutrition, mental health and healthcare.'],
  society: ['Bất bình đẳng, di cư, nhà ở và dịch vụ công.', 'Inequality, migration, housing and public services.'],
  media: ['Kiểm duyệt, tin giả, mạng xã hội và quảng cáo nhắm đối tượng.', 'Censorship, misinformation, social media and targeted ads.'],
  transport: ['Giao thông công cộng, ùn tắc, an toàn và xe điện.', 'Public transport, congestion, safety and electric vehicles.'],
  family: ['Nuôi dạy con, vai trò gia đình và sự độc lập.', 'Parenting, family roles and growing independence.'],
  culture: ['Di sản, dịch thuật, tiếng bản địa và bảo tồn ngôn ngữ.', 'Heritage, translation, dialects and language preservation.'],
  crime: ['Hình sự, cải tạo, cảnh sát và hình phạt.', 'Punishment, rehabilitation, policing and sentencing.'],
  government: ['Chi tiêu công, thuế, bầu cử và hệ thống tòa án.', 'Public spending, taxation, voting and the courts.'],
  money: ['Tiết kiệm, tín dụng, lạm phát và bất bình đẳng.', 'Saving, credit, inflation and inequality.'],
  food: ['Thực phẩm chế biến, an toàn thực phẩm và lối sống.', 'Processed food, food security and everyday diets.'],
  art: ['Bảo tồn, tài trợ, phòng tranh và nghệ thuật công cộng.', 'Conservation, funding, galleries and public art.'],
  sport: ['Chuyên nghiệp, doping, tài trợ và thể thao trường học.', 'Professionalism, doping, sponsorship and school sport.'],
  travel: ['Du lịch quá tải, bền vững và ảnh hưởng tới cộng đồng.', 'Overtourism, sustainability and host communities.'],
  business: ['Khởi nghiệp, quản lý, marketing và đạo đức kinh doanh.', 'Startups, management, marketing and business ethics.'],
  communication: ['Mạng xã hội, ngôn ngữ cơ thể, email và rào cản giao tiếp.', 'Social media, body language, email and barriers.']
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
  description_vi: TOPIC_DESCRIPTION[key]?.[0] ?? '',
  description_en: TOPIC_DESCRIPTION[key]?.[1] ?? '',
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
    title_vi: `${item.question_type} · ${TOPIC_LABEL[key][0]}`,
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
