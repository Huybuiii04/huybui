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
    if (error) throw new Error(`Nạp ${table}: ${error.message}`)
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
  const groupIdByKey = new Map(groups.map(group => [`${group.section_id}:${group.order_index}`, group.id]))

  const questionRows = []
  for (const test of reading.tests) {
    for (const passage of test.passages) {
      const sectionId = sectionIdBySource.get(passage.sourceId)
      for (const group of passage.groups) {
        const groupId = groupIdByKey.get(`${sectionId}:${group.order}`)
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
            accepted_answers: question.acceptedAnswers ?? [],
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
console.log(`Reading: ${result.tests} test · ${result.sections} passage · ${result.groups} nhóm · ${result.questions} câu`)

const { count } = await supabase.from('skill_questions').select('id', { count: 'exact', head: true })
console.log(`Tổng ${count ?? 0} câu hỏi trong skill_questions`)
