// Đọc đề Reading / Listening từ PostgREST.
//
// Bảng skill_questions chỉ cấp quyền đọc cho các cột KHÔNG chứa đáp án, nên
// mọi truy vấn ở đây đều ghi tên cột tường minh — không dùng select=* cho bảng này.

import {
  matchingOptionsFor,
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
  config: unknown
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
const GROUP_COLUMNS = 'id,section_id,order_index,instruction_html,display_type,config'
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
      .map<SkillQuestionGroup>(group => {
        const mapped: SkillQuestionGroup = {
          id: group.id,
          order: group.order_index,
          instructionHtml: group.instruction_html ?? '',
          displayType: (group.display_type ?? 'fill-blank') as SkillDisplayType,
          config: (group.config ?? {}) as Record<string, unknown>,
          questions: [],
        }
        // Câu matching không có options riêng thì lấy danh sách lựa chọn của nhóm.
        const sharedOptions = matchingOptionsFor(mapped)
        mapped.questions = questions
          .filter(question => question.group_id === group.id)
          .map<SkillQuestion>(question => {
            const options = parseOptions(question.options)
            return {
              id: question.id,
              order: question.order_index,
              sourceNumber: question.source_number ?? question.order_index,
              type: (question.question_type ?? 'fill') as SkillQuestionType,
              displayType: (question.display_type ?? 'fill-blank') as SkillDisplayType,
              prompt: question.prompt ?? '',
              questionHtml: question.question_html ?? '',
              options: options.length ? options : sharedOptions,
              explanation: '',
            }
          })
        return mapped
      }),
  }))

  return { ...toTest(testRow), sections: mappedSections }
}
