import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  AI_ERROR_MESSAGES,
  classifyAiError,
  criteriaForTask,
  errorLogsFromRows,
  featuresFromRow,
  gradingViewFromRow,
  isTerminalJobStatus,
  jobStatusFromRow,
  parseAiErrorPayload,
  toolResultLines,
  type GradingRow,
} from '../src/lib/aiLogic.ts'

const row = (extra: Partial<GradingRow> = {}): GradingRow => ({
  task_achievement: null,
  task_response: 6.5,
  coherence_ability: 7,
  lexical_resource: 6,
  grammatical_range: 6.5,
  overall_raw: 6.5,
  overall_display: 6.5,
  feedback: {
    status: 'ok',
    summary: 'A clear argument with room for more examples.',
    strengths: ['Clear position'],
    priority_actions: ['Add one more example'],
    task_checks: [{ requirement: 'Answer the question', status: 'met', note: 'Done' }],
    criteria: {
      task_response: { score: 6.5, rationale: 'Addresses the prompt', evidence: ['a real quote'], improvements: ['Develop the second point'] },
    },
  },
  model: 'claude-sonnet-4-6',
  created_at: '2026-10-24T00:00:00Z',
  ...extra,
})

test('edge function errors become friendly codes without leaking raw messages', () => {
  assert.equal(classifyAiError({ message: JSON.stringify({ error: { code: 'rate_limited', message: 'Too many AI requests.' } }) }), 'rate_limited')
  assert.equal(classifyAiError({ context: { error: { code: 'essay_empty', message: 'empty' } } }), 'essay_empty')
  assert.equal(classifyAiError({ message: 'Requested function was not found' }), 'not_connected')
  assert.equal(classifyAiError({ message: 'Failed to fetch' }), 'network')
  assert.equal(classifyAiError({ status: 401 }), 'unauthenticated')
  assert.equal(classifyAiError({ status: 409 }), 'conflict')
  assert.equal(classifyAiError({ status: 503 }), 'service_unavailable')
  assert.equal(classifyAiError(null), 'unknown')
})

test('the error payload is read from both the body and the response context', () => {
  assert.deepEqual(parseAiErrorPayload({ message: '{"error":{"code":"draft_conflict","message":"changed"}}' }), {
    code: 'draft_conflict',
    message: 'changed',
    status: undefined,
  })
  assert.equal(parseAiErrorPayload({ context: { error: { code: 'forbidden', message: 'no' } } }).code, 'forbidden')
})

test('every friendly code has a bilingual message', () => {
  for (const [code, pair] of Object.entries(AI_ERROR_MESSAGES)) {
    assert.equal(pair.length, 2, `${code} must have two messages`)
    assert.ok(pair[0].length > 0 && pair[1].length > 0, `${code} must not be empty`)
  }
})

test('job status rows map to a known state and terminal states stop polling', () => {
  assert.equal(jobStatusFromRow({ status: 'processing' }), 'processing')
  assert.equal(jobStatusFromRow({ status: 'retry_wait' }), 'retry_wait')
  assert.equal(jobStatusFromRow({ status: 'weird' }), 'queued')
  assert.equal(jobStatusFromRow(null), 'queued')
  assert.equal(isTerminalJobStatus('succeeded'), true)
  assert.equal(isTerminalJobStatus('failed'), true)
  assert.equal(isTerminalJobStatus('processing'), false)
})

test('task two uses task response while task one uses task achievement', () => {
  assert.deepEqual(criteriaForTask('task2')[0], 'task_response')
  assert.deepEqual(criteriaForTask('academic_task1')[0], 'task_achievement')
  assert.deepEqual(criteriaForTask('general_task1')[0], 'task_achievement')
  assert.equal(criteriaForTask('task2').length, 4)
})

test('a grading row becomes a view with scores, feedback and task checks', () => {
  const view = gradingViewFromRow(row())
  assert.ok(view)
  assert.equal(view.status, 'ok')
  assert.equal(view.overallDisplay, 6.5)
  assert.equal(view.scores.task_response, 6.5)
  assert.equal(view.scores.task_achievement, null)
  assert.equal(view.strengths.length, 1)
  assert.equal(view.priorityActions.length, 1)
  assert.equal(view.taskChecks[0].status, 'met')
  assert.equal(view.criteria.task_response?.evidence[0], 'a real quote')
  assert.equal(view.model, 'claude-sonnet-4-6')
})

test('a missing reference result has no overall band', () => {
  const view = gradingViewFromRow(row({
    task_response: null,
    overall_raw: null,
    overall_display: null,
    feedback: { status: 'needs_reference', summary: 'Add the chart data', missing_reference: ['chart values'] },
  }))
  assert.ok(view)
  assert.equal(view.status, 'needs_reference')
  assert.equal(view.overallDisplay, null)
  assert.deepEqual(view.missingReference, ['chart values'])
})

test('essay features are parsed defensively', () => {
  const features = featuresFromRow({
    structure: { paragraphs: [{ index: 0, role: 'intro', summary: 's', link_to_next: 'n' }] },
    lexical: { examples: [{ term: 'a', meaning: 'b', evidence: 'c', correction: 'd' }] },
    grammar: { examples: [{ error: 'e', correction: 'f' }] },
    unnatural: [{ quote: 'q', issue: 'i', suggestion: 's', severity: 'major' }],
    vocabulary_plan: { topic: 'Education', words: [{ word: 'w', meaning: 'm', example: 'e', why: 'y' }] },
    band_plan: { current_band: 6, target_band: 7.5, steps: [{ title: 't', detail: 'd', criterion: 'lexical_resource', expected_gain: '+0.5' }] },
  })
  assert.equal(features?.structure.length, 1)
  assert.equal(features?.structure[0].linkToNext, 'n')
  assert.equal(features?.lexical.length, 1)
  assert.equal(features?.grammar.length, 1)
  assert.equal(features?.unnatural[0].severity, 'major')
  assert.equal(features?.vocabularyPlan.words[0].word, 'w')
  assert.equal(features?.bandPlan.targetBand, 7.5)
  assert.equal(features?.bandPlan.steps[0].expectedGain, '+0.5')
})

test('missing or broken feature fields never throw', () => {
  assert.equal(featuresFromRow(null), null)
  const empty = featuresFromRow({})
  assert.deepEqual(empty?.structure, [])
  assert.deepEqual(empty?.unnatural, [])
  assert.equal(empty?.bandPlan.currentBand, null)
  const broken = featuresFromRow({ unnatural: 'nope', band_plan: { steps: 'nope' } })
  assert.deepEqual(broken?.unnatural, [])
  assert.deepEqual(broken?.bandPlan.steps, [])
})

test('error logs drop invalid rows and keep the valid ones', () => {
  const rows = errorLogsFromRows([
    { id: '1', criterion: 'lexical_resource', category: 'word choice', quote: 'q', correction: 'c', explanation: 'e', skill_tags: ['t'] },
    { id: '2', quote: 'missing fields' },
    null,
  ])
  assert.equal(rows.length, 1)
  assert.equal(rows[0].skillTags[0], 't')
  assert.deepEqual(errorLogsFromRows(null), [])
})

test('a missing grading row produces no view', () => {
  assert.equal(gradingViewFromRow(null), null)
})

test('writing tool results flatten into readable lines', () => {
  const rewrite = toolResultLines('magic-rewrite', { rewritten_text: 'A clearer sentence.', changes: ['Shorter clause'], cautions: [] })
  assert.equal(rewrite[0], 'A clearer sentence.')
  assert.equal(rewrite[1], '• Shorter clause')

  const stress = toolResultLines('argument-stress-test', { claims: [{ claim: 'Cities should ban cars', counterargument: 'Rural areas need them', strength: 'weak', question: 'Who bears the cost?' }], weaknesses: ['No data'], summary: 'Address the trade-off.' })
  assert.ok(stress.some(line => line.includes('Rural areas need them')))
  assert.ok(stress.some(line => line.includes('No data')))

  const critical = toolResultLines('critical-thinking', { questions: ['What if the policy fails?'], assumptions: ['Everyone can adapt'], counterarguments: [], summary: 'Consider the transition.' })
  assert.equal(critical[0], '? What if the policy fails?')
  assert.equal(critical[1], '= Everyone can adapt')

  const image = toolResultLines('read-image', { extracted_data: [{ label: 'Visitors', value: '1.2', unit: 'm', confidence: 0.9, source_quote: 'x' }], unreadable: ['legend'], notes: 'Read from the line graph.' })
  assert.equal(image[0], 'Visitors: 1.2 m')
  assert.ok(image.includes('? legend'))
})
