/** Gọi thẳng nhà cung cấp AI để xem lỗi network_error là gì. */
const base = process.env.AI_API_BASE_URL ?? 'https://api.anthropic.com'
const key = process.env.AI_API_KEY
const model = process.env.AI_MODEL_GRADING ?? 'claude-haiku-5-5'

console.log('base:', base, '| model:', model, '| key len:', key?.length ?? 0)

const anthropicStyle = `${base.replace(/\/$/, '')}/v1/messages`
const openAiStyle = `${base.replace(/\/$/, '')}/v1/chat/completions`

async function probe(label, url, headers, body) {
  const started = Date.now()
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) })
    const text = await response.text()
    console.log(`\n[${label}] HTTP ${response.status} (${Date.now() - started}ms)`)
    console.log('  body:', text.slice(0, 400).replace(/\n/g, ' '))
    return response
  } catch (error) {
    console.log(`\n[${label}] LỖI MẠNG sau ${Date.now() - started}ms: ${error.name}: ${error.message}`)
    if (error.cause) console.log('  cause:', error.cause?.message ?? error.cause)
    return null
  }
}

await probe('anthropic /v1/messages', anthropicStyle, {
  'x-api-key': key,
  'anthropic-version': '2023-06-01',
}, {
  model,
  max_tokens: 64,
  messages: [{ role: 'user', content: 'Reply with the single word: ping' }],
})

await probe('openai /v1/chat/completions', openAiStyle, {
  Authorization: `Bearer ${key}`,
}, {
  model,
  max_tokens: 64,
  messages: [{ role: 'user', content: 'Reply with the single word: ping' }],
})
