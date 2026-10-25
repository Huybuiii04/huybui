/**
 * Probe: với đúng prompt của pipeline, model trả `errors` gì cho một bài
 * Task 2 chất lượng cao? Đoạn này dùng để chỉnh prompt khi `errors` rỗng.
 *
 *   node --env-file-if-exists=.env.local tests/probe-errors-empty.mjs
 */
import { coerceEnrichmentOutput } from '../supabase/functions/_shared/ai/enrich.ts'
import { buildEnrichmentPrompt } from '../supabase/functions/_shared/prompts.ts'
import { parseProviderBody } from '../supabase/functions/_shared/anthropic.ts'

const env = process.env
const base = (env.AI_API_BASE_URL ?? 'https://api.anthropic.com').replace(/\/+$/, '')
const key = env.AI_API_KEY ?? env.ANTHROPIC_API_KEY ?? ''
const model = env.AI_MODEL_EXTRACTION ?? 'claude-haiku-5-5'

const ESSAY = `The rise of remote work has transformed the modern workplace. In my view, this development is largely beneficial, although it is not without its drawbacks.

To begin with, the benefits of remote work are significant for both employees and employers. Workers no longer need to spend hours travelling to an office every day, which means they have more time for rest, family and exercise. This change has improved job satisfaction for many people and has allowed companies to recruit talented individuals who live far away from major cities. Furthermore, because employees can work from wherever they are most comfortable, they tend to be more productive and take fewer sick days.

However, there are also clear disadvantages. The main problem is that remote workers find it much harder to build relationships with their colleagues. As a result, many people report feeling isolated and lonely, and new employees in particular struggle to learn how the organisation actually works. Another concern is that some companies have noticed a decline in the creativity of their staff, since brainstorming and informal conversations that happen in a physical office are difficult to reproduce online.

On balance, I believe that the advantages outweigh the drawbacks, provided that employers take deliberate steps to address the problems. For example, a company could organise regular team meetings in person and use chat tools during the working day so that staff who are at home do not feel left out. If companies manage remote work carefully rather than treating it as a simple cost-cutting measure, then it can be a positive change for both workers and organisations.`

const PROMPT = 'Some people think that working from home is more beneficial than working in an office. To what extent do you agree or disagree?'

// Feedback giống hệt những gì grader thực sự trả về.
const gradingFeedback = {
  status: 'ok',
  summary: 'A well-organised response with a clear position, relevant development and mostly accurate language.',
  strengths: ['Clear position stated in the introduction and maintained throughout.'],
  priority_actions: [
    'Replace formulaic connectors such as "Furthermore" and "To begin with" with more varied ones.',
    'Give a concrete example for the claim that remote staff are more productive.',
    'Avoid repeating the phrase "the advantages outweigh the drawbacks" in the conclusion.',
  ],
  task_checks: [{ requirement: 'Answer both parts of the question', status: 'met', note: 'Both benefits and drawbacks are discussed.' }],
  criteria: {
    task_response: {
      score: 7,
      rationale: 'Position is clear and both sides are covered.',
      evidence: [{ text: 'largely beneficial', start: 0, end: 0, paragraphIndex: 0 }],
      improvements: ['Support the productivity claim with a concrete example.'],
    },
  },
}

const prompt = buildEnrichmentPrompt({
  essayText: ESSAY,
  gradingFeedback,
  feedbackLocale: 'vi',
  taskType: 'task2',
  targetBand: 7,
})

const res = await fetch(`${base}/v1/messages`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
  body: JSON.stringify({
    model, max_tokens: 16000, system: prompt.system, messages: prompt.messages,
    tools: [{
      name: 'result',
      input_schema: {
        type: 'object', additionalProperties: false,
        required: ['structure', 'lexical', 'grammar', 'errors', 'unnatural', 'vocabulary_plan', 'band_plan'],
        properties: {
          structure: { type: 'object', properties: { paragraphs: { type: 'array', items: { type: 'object' } } } },
          lexical: { type: 'object', properties: { examples: { type: 'array', items: { type: 'object' } } } },
          grammar: { type: 'object', properties: { examples: { type: 'array', items: { type: 'object' } } } },
          errors: {
            type: 'array',
            items: {
              type: 'object', additionalProperties: false,
              required: ['criterion', 'category', 'quote', 'correction', 'explanation', 'skill_tags'],
              properties: {
                criterion: { type: 'string' }, category: { type: 'string' }, quote: { type: 'string' },
                correction: { type: 'string' }, explanation: { type: 'string' }, skill_tags: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          unnatural: { type: 'array', items: { type: 'object' } },
          vocabulary_plan: { type: 'object' },
          band_plan: { type: 'object' },
        },
      },
    }],
    tool_choice: { type: 'tool', name: 'result' },
  }),
})
const payload = parseProviderBody(await res.text())
const toolBlock = (payload.content ?? []).find(block => block.type === 'tool_use')
if (!toolBlock) { console.log('không có tool_use:', JSON.stringify(payload).slice(0, 1500)); process.exit(1) }

const raw = toolBlock.input
console.log('RAW typeof errors:', typeof raw.errors, '| isArray:', Array.isArray(raw.errors))
console.log('RAW errors:', JSON.stringify(raw.errors, null, 2).slice(0, 2000))
const coerced = coerceEnrichmentOutput(raw)
console.log('\nCOERCED errors.length =', coerced.errors.length)
let kept = 0
for (const error of coerced.errors) {
  const inEssay = ESSAY.includes(error.quote)
  if (inEssay) kept += 1
  console.log(`  includes=${inEssay} quote=${JSON.stringify(error.quote).slice(0, 90)}`)
}
console.log(`\nsẽ ghi error_logs: ${kept}/${coerced.errors.length}`)
console.log('grammar.examples.length =', coerced.grammar.examples.length)
