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
      skill_questions: [{ id: 'q1', group_id: 'g1', order_index: 1, source_number: 1, question_type: 'tfng', display_type: 'tfng', prompt: 'Statement', question_html: '', options: [], locator: '' }],
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
    skill_questions: [{ id: 'q1', group_id: 'g1', order_index: 1, source_number: 1, question_type: 'tfng', display_type: 'tfng', prompt: 'Statement', question_html: '', options: [], locator: '' }],
  })
  try {
    const test = await loadSkillTest('cam-9-1', source)
    assert.ok(test)
    assert.equal(test.sections.length, 1)
    assert.equal(test.sections[0].groups.length, 1)
    assert.equal(test.sections[0].groups[0].questions.length, 1)
    assert.equal(test.sections[0].groups[0].questions[0].type, 'tfng')
    assert.equal(test.sections[0].groups[0].questions[0].sourceNumber, 1)
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
