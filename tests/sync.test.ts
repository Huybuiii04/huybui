import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSupportedWritingTask } from '../src/data/prompts.ts'
import {
  cardKindToDb,
  dbCardKindToCard,
  draftClientId,
  draftToSaveArgs,
  essayRowToDraft,
  mergeImages,
  splitImages,
  studyCardRowToCard,
  toTask,
  UNSYNCED_IMAGE_LABEL,
  type EssayRow,
} from '../src/lib/sync.ts'

const row: EssayRow = {
  id: 'essay-1',
  title: 'Bài 1',
  task_type: 'academic_task1',
  subtype: 'line',
  prompt_text: 'Mô tả biểu đồ',
  body_text: 'Nội dung bài',
  reference_data: 'dữ liệu',
  target_band: 7.5,
  draft: { client_id: 'local-1' },
  draft_version: 3,
  updated_at: '2026-10-24T10:00:00Z',
}

test('only Academic Task 1 and Task 2 can start new writing; legacy drafts keep their task', () => {
  assert.equal(isSupportedWritingTask('task2'), true)
  assert.equal(isSupportedWritingTask('academic_task1'), true)
  for (const task of ['general_task1', 'task1_general', 'unknown', '', null, undefined]) {
    assert.equal(isSupportedWritingTask(task), false)
  }
  assert.equal(essayRowToDraft({ ...row, task_type: 'general_task1', body_text: 'Saved letter' }).task, 'general_task1')
  assert.equal(essayRowToDraft({ ...row, task_type: 'general_task1', body_text: 'Saved letter' }).text, 'Saved letter')
})

test('essay rows keep the client id stored in the draft jsonb', () => {
  assert.equal(draftClientId(row), 'local-1')
  assert.equal(draftClientId({ ...row, draft: null }), 'essay-1')
  assert.equal(draftClientId({ ...row, draft: {} }), 'essay-1')
})

test('essay rows map to the app draft shape', () => {
  const draft = essayRowToDraft(row)
  assert.equal(draft.id, 'local-1')
  assert.equal(draft.task, 'academic_task1')
  assert.equal(draft.prompt, 'Mô tả biểu đồ')
  assert.equal(draft.text, 'Nội dung bài')
  assert.equal(draft.reference, 'dữ liệu')
  assert.equal(draft.target, '7.5')
  assert.equal(draft.updatedAt, Date.parse('2026-10-24T10:00:00Z'))
})

test('target band from the database is normalised to one decimal', () => {
  assert.equal(essayRowToDraft({ ...row, target_band: 7 }).target, '7.0')
  assert.equal(essayRowToDraft({ ...row, target_band: null }).target, '7.0')
  assert.equal(essayRowToDraft({ ...row, target_band: '7.5' }).target, '7.5')
})

test('unknown task types fall back to task2', () => {
  assert.equal(toTask('task2'), 'task2')
  assert.equal(toTask('general_task1'), 'general_task1')
  assert.equal(toTask('nonsense'), 'task2')
})

test('save_draft arguments follow the RPC contract', () => {
  const draft = essayRowToDraft(row)
  const args = draftToSaveArgs(draft, 3, 'vi')
  assert.equal(args.p_essay_id, null)
  assert.equal(args.p_expected_version, 3)
  assert.equal(args.p_task_type, 'academic_task1')
  assert.equal(args.p_subtype, 'line')
  assert.equal(args.p_prompt_text, 'Mô tả biểu đồ')
  assert.equal(args.p_body_text, 'Nội dung bài')
  assert.equal(args.p_reference_data, 'dữ liệu')
  assert.equal(args.p_target_band, 7.5)
  assert.equal(args.p_feedback_locale, 'vi')
  assert.deepEqual(args.p_draft, { client_id: 'local-1' })
})

test('study card rows map to the app card shape', () => {
  const card = studyCardRowToCard({ id: 'c1', kind: 'structure', front: 'in addition', back: 'hơn nữa', example: 'x', tags: null, level: 2, due_at: '2026-10-25T00:00:00Z' })
  assert.deepEqual(card, { id: 'c1', term: 'in addition', meaning: 'hơn nữa', example: 'x', kind: 'structure', tags: [], level: 2, dueAt: Date.parse('2026-10-25T00:00:00Z') })
  assert.equal(dbCardKindToCard('collocation'), 'vocabulary')
  assert.equal(dbCardKindToCard('error'), 'error')
  assert.equal(cardKindToDb('error'), 'error')
})

test('study card rows keep their topic tags', () => {
  const card = studyCardRowToCard({ id: 'c2', kind: 'vocabulary', front: 'tide', back: 'thuỷ triều', example: '', tags: ['oceans'], level: 0, due_at: '2026-10-26T00:00:00Z' })
  assert.deepEqual(card.tags, ['oceans'])
})

test('unsynced images stay local and are labelled as not synced', () => {
  const split = splitImages([
    { name: 'chart.png', url: 'data:image/png;base64,AAA', synced: true, path: 'uid/essay/chart.png' },
    { name: 'photo.png', url: 'data:image/png;base64,BBB' },
  ])
  assert.deepEqual(split.synced, [{ name: 'chart.png', path: 'uid/essay/chart.png' }])
  assert.equal(split.local.length, 1)
  assert.equal(split.local[0].synced, false)
  assert.equal(split.local[0].name, 'photo.png')
  assert.deepEqual(UNSYNCED_IMAGE_LABEL, { vi: 'chưa đồng bộ', en: 'not synced' })
})

test('local images survive a reload from the database', () => {
  const merged = mergeImages(
    [{ name: 'chart.png', url: '', synced: true, path: 'uid/essay/chart.png' }],
    [{ name: 'chart.png', url: 'data:image/png;base64,AAA' }, { name: 'photo.png', url: 'data:image/png;base64,BBB' }],
  )
  assert.equal(merged.length, 2)
  assert.equal(merged[0].url, 'data:image/png;base64,AAA')
  assert.equal(merged[1].name, 'photo.png')
})
