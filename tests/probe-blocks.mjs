/**
 * Probe: response thật từ proxy có block nào? `tool_use` hay `text`?
 * Nếu proxy trả JSON trong `text` block thì `parseProviderResponse` sẽ
 * stringify đúng, nhưng nếu proxy trả `tool_use` với input bị bọc string
 * thì `extractJson` sẽ không bóc được.
 *
 *   node --env-file-if-exists=.env.local tests/probe-blocks.mjs
 */
import { parseProviderBody } from '../supabase/functions/_shared/anthropic.ts'
import { parseProviderResponse, extractJson } from '../supabase/functions/_shared/provider.ts'

const env = process.env
const base = (env.AI_API_BASE_URL ?? 'https://api.anthropic.com').replace(/\/+$/, '')
const key = env.AI_API_KEY ?? env.ANTHROPIC_API_KEY ?? ''
const model = env.AI_MODEL_EXTRACTION ?? 'claude-haiku-5-5'

const res = await fetch(`${base}/v1/messages`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
  body: JSON.stringify({
    model, max_tokens: 2000,
    messages: [{ role: 'user', content: [{ type: 'text', text: 'Reply with the tool named "result" whose input is {"errors":[{"quote":"hello"}],"ok":true}.' }] }],
    tools: [{
      name: 'result',
      description: 'Return the analysis as one JSON object.',
      input_schema: {
        type: 'object', additionalProperties: false,
        required: ['errors', 'ok'],
        properties: { errors: { type: 'array', items: { type: 'object' } }, ok: { type: 'boolean' } },
      },
    }],
    tool_choice: { type: 'tool', name: 'result' },
  }),
})
const raw = await res.text()
const body = parseProviderBody(raw)
console.log('status', res.status)
console.log('content block types:', (body.content ?? []).map(b => b.type))
const toolUse = (body.content ?? []).find(b => b.type === 'tool_use')
console.log('tool_use.input typeof:', typeof toolUse?.input)
console.log('tool_use.input:', JSON.stringify(toolUse?.input)?.slice(0, 400))

const parsed = parseProviderResponse(body, new Headers())
console.log('\nparseProviderResponse.rawText:', parsed.rawText.slice(0, 400))
const extracted = extractJson(parsed.rawText)
console.log('\nextractJson →', JSON.stringify(extracted)?.slice(0, 400))
console.log('extractJson.errors.length =', extracted?.errors?.length)
