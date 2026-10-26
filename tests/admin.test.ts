import { test } from 'node:test'
import assert from 'node:assert/strict'
import { groupDonePrompts, remainingPrompts, coveragePercent, shortPrompt, promptLabel, filterAdminUsers, canDeleteUser, deleteConfirmationMatches, type AdminUserRow } from '../src/lib/adminLogic.ts'

const prompts = [
  { slug: 't2-a', task: 'task2', text: 'Some people think...', titleVi: 'Ý kiến', titleEn: 'Opinion', status: 'published' },
  { slug: 't2-b', task: 'task2', text: 'Agree or disagree...', titleVi: 'Thảo luận', titleEn: 'Discussion', status: 'published' },
  { slug: 't2-c', task: 'task2', text: 'Hidden one...', titleVi: 'Ẩn', titleEn: 'Hidden', status: 'hidden' },
  { slug: 't1-a', task: 'academic_task1', text: 'The chart shows...', titleVi: 'Biểu đồ', titleEn: 'Chart', status: 'published' },
]

const essays = [
  { id: 'e1', prompt_text: 'Some people think...', task_type: 'task2', created_at: '2026-10-20T00:00:00Z' },
  { id: 'e2', prompt_text: 'Some people think...', task_type: 'task2', created_at: '2026-10-21T00:00:00Z' },
  { id: 'e3', prompt_text: 'Đề tự nhập của tôi', task_type: 'task2', created_at: '2026-10-22T00:00:00Z' },
]

test('done prompts group by prompt text with a count', () => {
  const groups = groupDonePrompts(essays, prompts)
  const library = groups.find(group => group.slug === 't2-a')
  assert.ok(library)
  assert.equal(library.count, 2)
  assert.equal(library.lastAt, '2026-10-21T00:00:00Z')
  assert.equal(library.task, 'task2')
})

test('a custom prompt is kept as its own group', () => {
  const groups = groupDonePrompts(essays, prompts)
  const custom = groups.find(group => group.slug.startsWith('custom:'))
  assert.ok(custom)
  assert.equal(custom.count, 1)
  assert.equal(custom.text, 'Đề tự nhập của tôi')
})

test('done prompts are sorted by how many times the user wrote them', () => {
  const groups = groupDonePrompts(essays, prompts)
  assert.equal(groups[0].count, 2)
})

test('remaining prompts exclude what the user already did', () => {
  const remaining = remainingPrompts(essays, prompts, 'task2')
  assert.deepEqual(remaining.map(item => item.slug), ['t2-b'])
})

test('hidden prompts are never counted as remaining', () => {
  const remaining = remainingPrompts(essays, prompts, 'task2')
  assert.equal(remaining.some(item => item.slug === 't2-c'), false)
})

test('coverage percent counts done prompts over the task total', () => {
  assert.equal(coveragePercent(essays, prompts, 'task2'), 50)
  assert.equal(coveragePercent(essays, prompts, 'academic_task1'), 0)
})

test('coverage is zero when the task has no prompts', () => {
  assert.equal(coveragePercent(essays, prompts, 'general_task1'), 0)
})

test('a long prompt is shortened for display', () => {
  assert.equal(shortPrompt('a'.repeat(200), 40).length, 41)
  assert.equal(shortPrompt('  ngắn  ', 40), 'ngắn')
})

test('prompt label falls back to the slug when there is no title', () => {
  assert.equal(promptLabel({ slug: 't1-a', task: 'academic_task1', text: 'x', titleVi: 'Biểu đồ', titleEn: 'Chart' }, 'vi'), 'Biểu đồ')
  assert.equal(promptLabel({ slug: 't1-a', task: 'academic_task1', text: 'x', titleVi: 'Biểu đồ', titleEn: 'Chart' }, 'en'), 'Chart')
  assert.equal(promptLabel({ slug: 'no-title', task: 'task2', text: 'x' }, 'vi'), 'no-title')
})

const adminUserRows: AdminUserRow[] = [
  { user_id: 'u1', email: 'alpha@example.com', display_name: 'Alpha', role: 'user', status: 'active' },
  { user_id: 'u2', email: 'beta@example.com', display_name: 'Beta', role: 'admin', status: 'active' },
]

test('admin users are filtered by email', () => {
  const matched = filterAdminUsers(adminUserRows, 'alpha@')
  assert.equal(matched.length, 1)
  assert.equal(matched[0].user_id, 'u1')
})

test('admin users are filtered by a partial email', () => {
  const matched = filterAdminUsers(adminUserRows, 'beta@example')
  assert.equal(matched.length, 1)
  assert.equal(matched[0].user_id, 'u2')
})

test('admin users are filtered by user id', () => {
  const matched = filterAdminUsers(adminUserRows, 'u2')
  assert.equal(matched.length, 1)
  assert.equal(matched[0].user_id, 'u2')
})

test('admin users that match nothing are dropped', () => {
  assert.equal(filterAdminUsers(adminUserRows, 'nothing').length, 0)
})

test('an empty query keeps every admin user', () => {
  assert.equal(filterAdminUsers(adminUserRows, '').length, 2)
})

test('a regular user can be deleted', () => {
  assert.equal(canDeleteUser({ role: 'user', isSelf: false }), true)
})

test('an admin cannot delete their own account', () => {
  assert.equal(canDeleteUser({ role: 'user', isSelf: true }), false)
})

test('an admin account cannot be deleted', () => {
  assert.equal(canDeleteUser({ role: 'admin', isSelf: false }), false)
})

test('the delete confirmation ignores padding and case', () => {
  assert.equal(deleteConfirmationMatches(' user@example.com ', 'user@example.com'), true)
})

test('the delete confirmation rejects the wrong email', () => {
  assert.equal(deleteConfirmationMatches('wrong@example.com', 'user@example.com'), false)
})

test('an empty delete confirmation never matches', () => {
  assert.equal(deleteConfirmationMatches('', 'user@example.com'), false)
})
