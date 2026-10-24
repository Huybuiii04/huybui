/**
 * Nạp bộ đề Task 1 (70 đề) kèm ảnh vào database.
 *
 *   node --env-file-if-exists=.env.local supabase/seed/seed-task1.mjs
 *
 * - Ảnh lấy từ debai/task1/images/ (trích bằng extract-task1-images.mjs).
 * - Ảnh tải lên bucket công khai `prompt-media` (migration 011).
 * - Mỗi đề lưu `chart = { kind: 'image', url, alt }` để frontend vẽ thẳng ảnh đề.
 * - Câu đề Cambridge được lấy từ CAM_PROMPT (JSON gốc chỉ có placeholder).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { CAM_PROMPT, TITLE_VI, topicsFor } from './task1-data.mjs'

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const secret = process.env.SUPABASE_SECRET_KEY
if (!url || !secret) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong .env.local')
  process.exit(1)
}
const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })

/** Tìm thư mục tài nguyên: ưu tiên biến môi trường, sau đó repo hiện tại, rồi repo chính. */
function resolveAssetDir() {
  const candidates = [
    process.env.IELTS_ASSETS_DIR,
    join(process.cwd(), 'debai', 'task1'),
    resolve(process.cwd(), '..', 'debai', 'task1'),
    resolve(process.cwd(), '..', '..', 'debai', 'task1')
  ].filter(Boolean)
  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'IELTS_Task1_7_Types_70_Prompts.json'))) return candidate
  }
  console.error('Không tìm thấy debai/task1. Đặt IELTS_ASSETS_DIR để chỉ đường dẫn.')
  process.exit(1)
}

const assetDir = resolveAssetDir()
const jsonPath = join(assetDir, 'IELTS_Task1_7_Types_70_Prompts.json')
const imageDir = join(assetDir, 'images')
const { prompts } = JSON.parse(readFileSync(jsonPath, 'utf8'))

const SUBTYPE = {
  'Line Graph': 'line',
  'Bar Chart': 'bar',
  'Pie Chart': 'pie',
  'Table': 'table',
  'Map / Floor Plan': 'map',
  'Process Diagram': 'process',
  'Mixed Charts': 'mixed'
}
const TYPE_LABEL = {
  'Line Graph': 'LINE GRAPH',
  'Bar Chart': 'BAR CHART',
  'Pie Chart': 'PIE CHART',
  'Table': 'TABLE',
  'Map / Floor Plan': 'MAP / FLOOR PLAN',
  'Process Diagram': 'PROCESS DIAGRAM',
  'Mixed Charts': 'MIXED CHARTS'
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

const rows = []
let uploaded = 0
let reused = 0

for (const [index, prompt] of prompts.entries()) {
  const fileName = prompt.image.replace('/', '__')
  const path = join(imageDir, fileName)
  const bytes = readFileSync(path)
  const objectPath = `task1/${prompt.id.toLowerCase()}.png`

  const { error: uploadError } = await supabase.storage.from('prompt-media').upload(objectPath, bytes, {
    contentType: 'image/png',
    upsert: true,
    cacheControl: '31536000'
  })
  if (uploadError) {
    console.error(`Lỗi tải ảnh ${objectPath}:`, uploadError.message)
    process.exit(1)
  }
  uploaded += 1

  const { data: publicUrl } = supabase.storage.from('prompt-media').getPublicUrl(objectPath)
  const url2 = publicUrl?.publicUrl ?? ''
  if (!url2) reused += 1

  const titleEn = prompt.title.replace(/\uFFFD|\?\?/g, '–').replace(/\s+–\s+–/g, '–').trim()
  const isCambridge = prompt.source === 'Cambridge Original'
  const text = (isCambridge ? CAM_PROMPT[prompt.id] : prompt.prompt) ?? prompt.prompt
  const setName = isCambridge ? `${prompt.book.replace('Cambridge IELTS ', 'Cambridge ')} — Test ${prompt.test}` : 'Bộ luyện Task 1'

  rows.push({
    slug: `t1-${prompt.id.toLowerCase()}`,
    task: 'academic_task1',
    subtype: SUBTYPE[prompt.type] ?? 'bar',
    type_label: TYPE_LABEL[prompt.type] ?? 'CHART',
    source: isCambridge ? 'recalled' : 'practice',
    set_name: setName,
    difficulty: 'MEDIUM',
    topics: topicsFor(prompt.title),
    title_vi: TITLE_VI[prompt.id] ?? titleEn,
    title_en: titleEn,
    text,
    reference: '',
    chart: { kind: 'image', url: url2, alt: titleEn, file: prompt.image },
    minutes: 20,
    hint_vi: 'Chọn hai đặc điểm nổi bật nhất và so sánh giữa các nhóm.',
    hint_en: 'Pick the two standout features and compare the groups.',
    status: 'published',
    sort_order: index
  })
}

const { data, error } = await supabase.from('prompts').upsert(rows, { onConflict: 'slug' }).select('id,slug')
if (error) {
  console.error('Lỗi nạp prompts (Task 1):', error.message)
  process.exit(1)
}

const { count } = await supabase.from('prompts').select('id', { count: 'exact', head: true }).eq('task', 'academic_task1')
console.log(`Đã nạp ${data?.length ?? 0} đề Task 1 (${uploaded} ảnh tải lên bucket prompt-media).`)
console.log(`Tổng đề Task 1 Academic trong DB: ${count}`)
void reused
