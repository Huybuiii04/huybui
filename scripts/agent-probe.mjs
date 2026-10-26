/**
 * Ghi lại các sự kiện HTTP công khai của website (không lưu token/secret).
 *
 *   node scripts/agent-probe.mjs https://huybui.vercel.app docs/research/agent-readiness-baseline.json
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const base = (process.argv[2] ?? 'https://huybui.vercel.app').replace(/\/$/, '')
const output = process.argv[3]

const probes = [
  { path: '/', accept: 'text/html,application/xhtml+xml' },
  { path: '/', accept: 'text/markdown' },
  { path: '/', accept: 'text/markdown;q=0, text/html;q=1' },
  { path: '/agent-audit-missing-20261026', accept: 'text/html' },
  { path: '/agent-audit-missing-20261026', accept: 'text/markdown' },
  { path: '/about', accept: 'text/html' },
  { path: '/contact', accept: 'text/html' },
  { path: '/privacy', accept: 'text/html' },
  { path: '/developers', accept: 'text/html' },
  { path: '/docs', accept: 'text/html' },
  { path: '/openapi.json', accept: 'application/json' },
  { path: '/llms.txt', accept: 'text/plain' },
  { path: '/robots.txt', accept: 'text/plain' },
  { path: '/sitemap.xml', accept: 'application/xml' },
  { path: '/.well-known/mcp', accept: 'application/json' },
  { path: '/api/health', accept: 'application/json' },
  { path: '/api/prompts?limit=2', accept: 'application/json' },
  { path: '/api/agent-audit-missing', accept: 'application/json' },
  { path: '/assets/does-not-exist.js', accept: 'application/javascript' },
]

function textLength(body) {
  return body.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length
}

const results = []
for (const probe of probes) {
  const started = Date.now()
  try {
    const response = await fetch(`${base}${probe.path}`, { headers: { accept: probe.accept }, redirect: 'follow' })
    const body = await response.text()
    results.push({
      path: probe.path,
      accept: probe.accept,
      status: response.status,
      contentType: response.headers.get('content-type'),
      vary: response.headers.get('vary'),
      bytes: body.length,
      textCharacters: textLength(body),
      durationMs: Date.now() - started,
    })
  } catch (error) {
    results.push({ path: probe.path, accept: probe.accept, error: String(error) })
  }
}

const snapshot = { base, capturedAt: new Date().toISOString(), results }
console.log(JSON.stringify(snapshot, null, 2))
if (output) {
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(`\nĐã lưu ${output}`)
}
