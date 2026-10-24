/**
 * Đặt biến môi trường cho project Vercel rồi deploy lại.
 *
 *   node --env-file-if-exists=.env.local supabase/scripts/../scripts/vercel-env.mjs
 *
 * Cần:
 *   - VERCEL_TOKEN   — access token tạo tại https://vercel.com/account/tokens
 *   - VERCEL_PROJECT_ID hoặc VERCEL_TEAM — tìm trong Vercel → Project Settings → General
 *     (VERCEL_PROJECT_ID có sẵn trong file .vercel/project.json sau khi `vercel link`)
 *
 * Chỉ đặt các biến an toàn cho frontend (VITE_*). Không bao giờ đưa
 * service_role / secret key của Supabase lên Vercel.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

function readEnvFile() {
  const candidates = [join(process.cwd(), '.env.local'), resolve(process.cwd(), '..', '.env.local')]
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    const values = {}
    for (const line of readFileSync(candidate, 'utf8').split('\n')) {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line)
      if (!match) continue
      values[match[1]] = match[2].replace(/^["']|["']$/g, '').trim()
    }
    return values
  }
  return {}
}

const env = { ...readEnvFile(), ...process.env }
const token = env.VERCEL_TOKEN
if (!token) {
  console.error('Thiếu VERCEL_TOKEN. Tạo tại https://vercel.com/account/tokens')
  process.exit(1)
}

/** project id lấy từ .vercel/project.json nếu đã `vercel link`. */
function linkedProjectId() {
  for (const candidate of [join(process.cwd(), '.vercel', 'project.json'), resolve(process.cwd(), '..', '.vercel', 'project.json')]) {
    if (!existsSync(candidate)) continue
    try {
      return JSON.parse(readFileSync(candidate, 'utf8')).projectId
    } catch {
      return undefined
    }
  }
  return undefined
}

const projectId = env.VERCEL_PROJECT_ID ?? linkedProjectId()
if (!projectId) {
  console.error('Thiếu VERCEL_PROJECT_ID. Xem Vercel → Project Settings → General → Project ID, hoặc chạy `vercel link`.')
  process.exit(1)
}

const teamId = env.VERCEL_TEAM_ID
const query = teamId ? `?teamId=${teamId}` : ''
const api = 'https://api.vercel.com/v10'

/** Biến được đặt lên Vercel. Chỉ biến public cho frontend. */
const wanted = {
  VITE_SUPABASE_URL: env.VITE_SUPABASE_URL ?? env.SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_PUBLISHABLE_KEY,
}

const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

async function apiCall(method, path, body) {
  const response = await fetch(`${api}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const text = await response.text()
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 600)}`)
  return text ? JSON.parse(text) : null
}

// 1. Tạo nếu chưa có, 2. cập nhật nếu đã có — Vercel yêu cầu POST /env/{id} để sửa.
const existing = await apiCall('GET', `/projects/${projectId}/env${query}`).catch(() => ({ envs: [] }))
const byKey = new Map((existing?.envs ?? []).map(item => [item.key, item]))

for (const [key, value] of Object.entries(wanted)) {
  if (!value) {
    console.error(`Thiếu giá trị cho ${key}`)
    process.exit(1)
  }
  const found = byKey.get(key)
  if (found) {
    await apiCall('PATCH', `/projects/${projectId}/env/${found.id}${query}`, { value })
    console.log(`  cap nhat ${key}`)
  } else {
    await apiCall('POST', `/projects/${projectId}/env${query}`, {
      key,
      value,
      type: 'plain',
      target: ['production', 'preview'],
    })
    console.log(`  them moi ${key}`)
  }
}

// 3. Deploy lại để biến được nạp vào bundle.
console.log('\nDang deploy...')
const deployment = await apiCall('POST', `/v13/deployments${query}`, {
  name: 'ielts-writing-studio',
  project: projectId,
  target: 'production',
  gitSource: { type: 'github', repoId: 'Huybuiii04/huybui', ref: 'main' },
})
console.log(`  deployment: ${deployment?.url ?? deployment?.id}`)
console.log('  theo doi: https://vercel.com/huybui04/huybui')
