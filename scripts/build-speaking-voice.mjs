/**
 * Dựng sẵn audio giám khảo cho đề Cambridge (module Speaking).
 *
 *   node --env-file-if-exists=.env.local scripts/build-speaking-voice.mjs
 *
 * Mỗi câu hỏi trong `speaking_questions` được tổng hợp giọng một lần rồi lưu vào
 * bucket `speaking-voice` theo đường dẫn `voices/{accent}/{sha256(text|accent)}.mp3`.
 * Edge Function `speaking-live` tra cache này trước khi gọi TTS → câu hỏi Cambridge
 * phát ngay thay vì chờ 2–4 giây.
 *
 * Tuỳ chọn:
 *   --accent=en-GB       chỉ dựng một accent (mặc định: cả hai)
 *   --concurrency=8      số request TTS song song
 *   --book=12            chỉ dựng một cuốn
 *   --force              tạo lại cả khi đã có trong cache
 */

import { createHash } from 'node:crypto'

import { createClient } from '@supabase/supabase-js'

const VOICE_BUCKET = "speaking-voice"
const TTS_MODEL = process.env.AI_MODEL_VOICE || "minimax-speech-2.8-turbo"
const TTS_VOICES = {
  'en-GB': 'English_Trustworthy_Man',
  'en-US': 'English_expressive_narrator',
}

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const found = args.find((arg) => arg.startsWith(`--${name}=`))
  return found ? found.slice(name.length + 3) : fallback
}
const has = (name) => args.includes(`--${name}`)

const accents = flag('accent') ? [flag('accent')] : ['en-GB', 'en-US']
const concurrency = Number(flag('concurrency', '8'))
const onlyBook = flag('book') ? Number(flag('book')) : null
const force = has('force')

const env = process.env
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY
const aiBase = (env.AI_API_BASE_URL || '').replace(/\/+$/, '')
const aiKey = env.AI_API_KEY

if (!supabaseUrl || !serviceKey || !aiBase || !aiKey) {
  console.error('Thiếu cấu hình: cần SUPABASE_SERVICE_ROLE_KEY, AI_API_BASE_URL, AI_API_KEY trong .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshSession: false },
})

/** Bỏ nhãn trong ngoặc vuông ("[Why?/Why not?]") — giống hàm cùng tên ở Edge Function. */
function speakableQuestion(text) {
  return String(text ?? '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.?!])/g, '$1')
    .replace(/[\s:;,-]+$/, '')
    .trim()
}

function cachePath(accent, text) {
  const hash = createHash('sha256').update(`${accent}|${text.trim()}`).digest('hex')
  return `voices/${accent}/${hash}.mp3`
}

async function synthesize(text, voice) {
  const response = await fetch(`${aiBase}/v1/audio/speech`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${aiKey}` },
    body: JSON.stringify({ model: TTS_MODEL, input: text, voice }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`TTS ${response.status}: ${body.slice(0, 160)}`)
  }
  return new Uint8Array(await response.arrayBuffer())
}

async function main() {
  let query = supabase
    .from('speaking_questions')
    .select('id,part,prompt_text,questions,cue_card,book_number,test_number')
    .eq('is_active', true)
    .not('book_number', 'is', null)
  if (onlyBook) query = query.eq('book_number', onlyBook)
  const { data: rows, error } = await query
  if (error) throw new Error(`Không nạp được câu hỏi: ${error.message}`)

  /** @type {Array<{ accent: string, text: string, path: string }>} */
  const jobs = []
  for (const row of rows ?? []) {
    const questions = (row.questions ?? []).map(speakableQuestion).filter(Boolean)
    if (row.part === 'part-2') {
      const card = row.cue_card
      const bullets = card?.bullets?.length ? card.bullets.join('. ') : ''
      const intro = `Here is your topic: ${card?.topic ?? ''}. ${bullets ? `${bullets}. ` : ''}You have one minute to prepare, and then you have up to two minutes to talk about it.`
      questions.push(speakableQuestion(intro))
    }
    if (!questions.length) questions.push(speakableQuestion(row.prompt_text))
    for (const text of questions) {
      for (const accent of accents) {
        jobs.push({ accent, text, path: cachePath(accent, text) })
      }
    }
  }

  console.log(`${rows?.length ?? 0} câu hỏi → ${jobs.length} audio (${accents.join(', ')})`)

  let done = 0
  let created = 0
  let skipped = 0
  let failed = 0
  const queue = [...jobs]

  async function worker() {
    while (queue.length) {
      const job = queue.shift()
      try {
        if (!force) {
          const existing = await supabase.storage.from(VOICE_BUCKET).download(job.path)
          if (!existing.error && existing.data?.byteLength) {
            skipped += 1
            done += 1
            continue
          }
        }
        const bytes = await synthesize(job.text, TTS_VOICES[job.accent])
        const { error: uploadError } = await supabase.storage
          .from(VOICE_BUCKET)
          .upload(job.path, bytes, { contentType: 'audio/mpeg', upsert: true })
        if (uploadError) throw new Error(uploadError.message)
        created += 1
      } catch (error) {
        failed += 1
        console.error(`  ✗ ${job.accent} "${job.text.slice(0, 50)}" — ${error.message}`)
      }
      done += 1
      if (done % 25 === 0) console.log(`  ${done}/${jobs.length} (tạo ${created}, có sẵn ${skipped}, lỗi ${failed})`)
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  console.log(`\nXong: tạo ${created}, có sẵn ${skipped}, lỗi ${failed}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
