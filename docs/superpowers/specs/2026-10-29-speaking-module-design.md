# Speaking Module — Design Spec

- **Date:** 2026-10-29
- **Status:** Draft (awaiting review)
- **Branch:** `feature/reading-module` → new branch `feature/speaking-module`
- **Reference implementation researched:** `https://toey.app/ielts` (Next.js + Gemini Flash multimodal)

---

## 1. Mục tiêu

Thêm module **Speaking** vào IELTS Writing Studio: người học ghi âm (mic) hoặc upload file trả lời
IELTS Speaking Part 1/2/3, hệ thống chấm **4 tiêu chí chính thức** (Fluency & Coherence, Lexical
Resource, Grammatical Range & Accuracy, Pronunciation), trả band tổng + transcript + lỗi cần sửa +
gợi ý cải thiện.

### 1.1 Kết quả nghiên cứu toey.app (định hướng thiết kế)

| Phát hiện | Ảnh hưởng thiết kế |
|---|---|
| toey.app dùng **Gemini Flash multimodal** cho audio + **LLM** cho rubric ETS (tự công bố trên landing page: *"The system uses Gemini Flash multimodal to analyse pronunciation, intonation, and fluency, plus an LLM for ETS rubric criteria"*) | Ta chọn **đúng kiến trúc 2 lớp**: Gemini cho audio, Claude cho rubric |
| `POST /api/ielts/tools/speaking-presign` → `PUT uploadUrl` → `POST /api/ielts/tools/speaking-evaluate` | Ta dùng **presigned upload** (tương thích `prepare-upload` sẵn có) |
| Giới hạn thời lượng: Part 1 = 60s, Part 2 = 120s, Part 3 = 90s; upload ≤ 4 MiB | Áp dụng **nguyên xi** |
| Mã lỗi: `401` gate login · `402` hết credit · `429` rate limit | Áp dụng `401`/`429` (app không có credit system → bỏ `402`) |
| Response: `{overall, aimBand, criteria, transcript, improvements, corrections, parts, subBands, analysis, pronunciation}` | Ta thu gọn còn `{overallDisplay, criteria, transcript, corrections, improvements, partFeedback, audioAnalysis}` |
| Audio bị **xoá sau khi chấm** ("scored once then deleted") | Ta xoá audio sau khi chấm → storage free tier không bị ảnh hưởng + bảo mật |
| Rubric chính thức IELTS có câu: *"A candidate must fully fit the positive features of the descriptor at a particular level"* | Đưa nguyên văn vào prompt |

### 1.2 Non-goals (không làm trong lần này)

- Không có credit/payment system (không `402`).
- Không có lịch sử chấm nhiều lần / trang "My speaking" (chỉ giữ kết quả của lần chấm hiện tại trong DB).
- Không có pronunciation word-level chi tiết (acc %, IPA từng từ, timestamp nghe lại từng từ).
- Không có lưu audio để nghe lại.
- Không có Shadowing (video shadowing) — sẽ là spec riêng.
- Không sửa `ai_pricing` ngoài việc thêm dòng `gemini-3.8-flash`.

---

## 2. Kiến trúc tổng thể

```
┌─ Browser: /app/speaking ─────────────────────────────────────────────┐
│  Setup state                          │  Result state                │
│  ┌─ chọn Part 1/2/3                  │  ┌─ band tổng               │
│  ├─ chọn câu hỏi mẫu hoặc tự nhập    │  ├─ 4 thẻ tiêu chí          │
│  ├─ ghi âm (MediaRecorder) | upload  │  ├─ transcript annotate     │
│  └─ POST submit-speaking (prepare)   │  ├─ lỗi phát âm / filler    │
│        ↓ signed uploadUrl             │  └─ gợi ý cải thiện          │
│        ↓ PUT audio → Storage          │                                │
│        ↓ POST submit-speaking (commit)│                                │
│        ↓ poll 2.5s (như pollGrading)  │                                │
└────────────────────────────────────────┴────────────────────────────────┘
                                    ↓
┌─ Supabase ────────────────────────────────────────────────────────────┐
│  Edge: submit-speaking  (2 phase, xem §5)                            │
│    prepare: auth → validate → insert speaking_attempts('preparing')  │
│             → signed upload URL                                       │
│    commit : verify audio đã upload → attempt('queued')                │
│             → insert ai_jobs('grade-speaking', payload={attemptId})  │
│                                                                   │
│  Storage bucket: speaking-audio (private, RLS theo auth.uid())      │
│                                                                   │
│  Edge: process-ai-jobs  (pg_cron, 30s)                              │
│    claim job 'grade-speaking'                                       │
│    → download audio                                                  │
│    → [LỚP 1] Gemini-3.8-flash  : audio → transcript + audio analysis│
│    → [LỚP 2] Claude Haiku 5.5  : transcript → 4 tiêu chí + band      │
│    → insert speaking_results + ai_usage (2 dòng)                      │
│    → XOÁ audio khỏi Storage                                          │
└───────────────────────────────────────────────────────────────────────┘
```

**Quyết định cốt lõi:** chấm Speaking **không** chạy trong HTTP request mà đi qua hàng đợi `ai_jobs`
sẵn có + worker `process-ai-jobs` + cron. Lý do: (1) nhất quán với Writing hiện tại; (2) có retry,
lease, tracking chi phí (`ai_usage`); (3) tránh vượt wall-clock 150s của Edge Function free tier;
(4) client đã có sẵn pattern polling.

---

## 3. Data model

### 3.1 Migration `supabase/migrations/027_speaking.sql`

```sql
begin;

-- Bảng câu hỏi mẫu: user đọc, admin sẽ quản lý ở phase sau.
create table if not exists public.speaking_questions (
  id uuid primary key default gen_random_uuid(),
  part text not null check (part in ('part-1', 'part-2', 'part-3')),
  slug text not null unique,
  topic text not null,
  prompt_text text not null default '',
  questions jsonb not null default '[]'::jsonb,
  cue_card jsonb,
  is_active boolean not null default true,
  created_at timestam not null default now()
);

create table if not exists public.speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  part text not null check (part in ('part-1', 'part-2', 'part-3')),
  question text not null default '',
  question_id uuid references public.speaking_questions (id) on delete set null,
  target_band numeric(2, 1) check (target_band >= 0 and target_band <= 9),
  feedback_locale text not null default 'vi' check (feedback_locale in ('vi', 'en')),
  audio_path text not null default '',
  mime_type text not null default 'audio/webm',
  byte_size bigint not null default 0,
  duration_ms integer not null default 0,
  status text not null default 'queued'
    check (status in ('preparing', 'queued', 'processing', 'succeeded', 'failed', 'cancelled')),
  error_code text,
  created_at timestam not null default now(),
  updated_at timestam not null default now()
);

create table if not exists public.speaking_results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.speaking_attempts (id) on delete cascade,
  fluency numeric(2, 1) check (fluency >= 0 and fluency <= 9),
  lexical_resource numeric(2, 1) check (lexical_resource >= 0 and lexical_resource <= 9),
  grammatical_range numeric(2, 1) check (grammatical_range >= 0 and grammatical_range <= 9),
  pronunciation numeric(2, 1) check (pronunciation >= 0 and pronunciation <= 9),
  overall_raw numeric(4, 2),
  overall_display numeric(2, 1),
  transcript text not null default '',
  feedback jsonb not null default '{}'::jsonb,
  audio_analysis jsonb not null default '{}'::jsonb,
  model text not null,
  prompt_version text not null,
  rubric_version text not null,
  schema_version text not null,
  created_at timestam not null default now()
);

create index if not exists speaking_questions_part_idx
  on public.speaking_questions (part, topic) where is_active;
create index if not exists speaking_attempts_user_idx
  on public.speaking_attempts (user_id, created_at desc);
create index if not exists speaking_results_attempt_idx
  on public.speaking_results (attempt_id);

-- Cho phép thêm operation mới vào hàng đợi AI.
alter table public.ai_jobs drop constraint if exists ai_jobs_operation_check;
alter table public.ai_jobs
  add constraint ai_jobs_operation_check
  check (operation in ('grade', 'enrich', 'magic-rewrite', 'argument-stress-test',
                       'critical-thinking', 'read-image', 'grade-speaking'));

-- Bucket audio riêng, private, giới hạn 4 MiB (khớp giới hạn client).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speaking-audio', 'speaking-audio', false, 4194304,
        array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/mp3'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Đường dẫn object: {userId}/{attemptId}/{uuid}.{ext}
drop policy if exists speaking_audio_owner_read on storage.objects;
create policy speaking_audio_owner_read on storage.objects
for select to authenticated
using (bucket_id = 'speaking-audio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists speaking_audio_owner_insert on storage.objects;
create policy speaking_audio_owner_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'speaking-audio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists speaking_audio_owner_delete on storage.objects;
create policy speaking_audio_owner_delete on storage.objects
for delete to authenticated
using (bucket_id = 'speaking-audio' and (storage.foldername(name))[1] = auth.uid()::text);

-- RLS
alter table public.speaking_questions enable row level security;
alter table public.speaking_attempts enable row level security;
alter table public.speaking_results enable row level security;

drop policy if exists speaking_questions_read_authenticated on public.speaking_questions;
create policy speaking_questions_read_authenticated on public.speaking_questions
for select to authenticated using (is_active or private.is_admin());

drop policy if exists speaking_attempts_read_own on public.speaking_attempts;
create policy speaking_attempts_read_own on public.speaking_attempts
for select to authenticated using (user_id = auth.uid() and private.is_active_user());

drop policy if exists speaking_attempts_insert_own on public.speaking_attempts;
create policy speaking_attempts_insert_own on public.speaking_attempts
for insert to authenticated with check (user_id = auth.uid() and private.is_active_user());

drop policy if exists speaking_attempts_update_own on public.speaking_attempts;
create policy speaking_attempts_update_own on public.speaking_attempts
for update to authenticated
using (user_id = auth.uid() and private.is_active_user())
with check (user_id = auth.uid() and private.is_active_user());

drop policy if exists speaking_results_read_own on public.speaking_results;
create policy speaking_results_read_own on public.speaking_results
for select to authenticated using (
  exists (select 1 from public.speaking_attempts attempt
          where attempt.id = attempt_id and attempt.user_id = auth.uid())
);

revoke all on public.speaking_questions from anon;
revoke all on public.speaking_attempts from anon;
revoke all on public.speaking_results from anon;
revoke all on public.speaking_results from authenticated;

grant select on public.speaking_questions to authenticated;
grant select, insert, update on public.speaking_attempts to authenticated;
grant select on public.speaking_results to authenticated;

commit;
```

### 3.2 Bộ câu hỏi mẫu

**Nguồn:** đã trích bằng **REA** từ 79 trang sample **public** của toey.app
(`https://toey.app/en/ielts/speaking-part-{1,2,3}/<slug>` — có trong sitemap).
Kết quả: **25 topic Part 1 · 34 cue card Part 2 · 20 topic Part 3 = 79 bộ câu hỏi**.

| Part | Số lượng | Cấu trúc trong DB |
|---|---|---|
| Part 1 | 25 topic | `questions`: 5 câu hỏi ngắn trên cùng 1 topic |
| Part 2 | 34 cue card | `cue_card`: `{ topic, bullets: string[4], time_limit_seconds: 120 }` |
| Part 3 | 20 topic | `questions`: 4 câu hỏi đào sâu trên cùng 1 chủ đề |

> **Phạm vi lấy:** chỉ lấy **câu hỏi** (Part 1/3) và **bullet cue card** (Part 2) — đây là dạng
> nội dung IELTS tiêu chuẩn dùng chung trong mọi tài liệu luyện thi.
> **Không** lấy phần "Band 9 sample answer" hay phần phân tích của toey.app (bản quyền tác giả
> của họ). Nếu sau này muốn có "bài mẫu", ta tự sinh bằng Gemini/Claude của mình.

**File dữ liệu:** `supabase/seed/speaking-questions.json` (79 dòng).
**Script sinh file:** `scripts/build-speaking-questions.mjs` — giữ dữ liệu ở dạng gọn trong
script, chạy lại để regenerate JSON (idempotent, có check trùng `part:slug`).
**Script nạp DB:** `supabase/seed/seed-speaking-questions.mjs` — upsert theo `slug`
(`?on_conflict=slug`), chạy lại nhiều lần vẫn an toàn. Đăng ký thêm script
`"db:seed:speaking"` vào `package.json`.

Tất cả nội dung bằng tiếng Anh (đúng dạng đề thi). `slug` kebab-case ổn định để deep-link tương lai.

### 3.3 Quyết định về nơi lưu audio

**Speaking → Supabase Storage, bucket `speaking-audio`.** Lý do:
- Audio bị **xoá ngay sau khi chấm** → dung lượng tăng theo số lần chấm đồng thời, không tích luỹ.
  Peak thực tế = số lần chấm đồng thời × ~300 KB ≈ **vài MB**, không đáng kể với quota 1 GB.
- Dùng lại đúng pattern `prepare-upload` (signed upload URL) đã có sẵn → **không thêm hạ tầng mới**.
- RLS theo `auth.uid()` đã có pattern sẵn trong `002_content_storage.sql`.

**Listening → sẽ cân nhắc Cloudflare R2 khi làm tới.** Đây là chỗ quota thật sự có ý nghĩa:

| | Supabase Storage (free) | **Cloudflare R2 (free)** |
|---|---|---|
| Storage | 1 GB | **10 GB** |
| Egress ra internet | 5 GB/tháng | **Miễn phí** |
| Write / Read ops | — | 1M / 10M mỗi tháng |

1 đề Listening ≈ 4 file × 3–5 MB ≈ 15 MB → Supabase free tier chỉ đủ **~60 đề**, R2 đủ **~500 đề**;
thêm nữa R2 **không tính egress** khi học viên nghe audio (Supabase thì có → 1.000 lượt nghe ≈ 4 GB,
gần đầy quota 5 GB).

Nếu chuyển sang R2: thêm 1 helper `supabase/functions/_shared/r2.ts` dùng
`npm:@aws-sdk/client-s3` + `npm:@aws-sdk/s3-request-presigner` (`getSignedUrl` cho PutObject/GetObject),
secrets `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET`.
Supabase Edge Runtime hỗ trợ `npm:` specifier nên không cần build step.
**Cần spike bundle size trước** (giới hạn 20 MB local / 5 MB server-side) — nếu SDK quá nặng thì
dùng một Cloudflare Worker ~20 dòng để ký presigned URL thay vì nhét SDK vào Edge Function.

> ⚠️ **Lưu ý bất biến:** dù audio lưu ở đâu, việc Edge Function tải audio về rồi gửi (base64) lên
> `api.apiz.vn` để Gemini xử lý **vẫn tính vào egress của Supabase** (~300–400 KB/lần chấm).
> Không né được (API key Gemini không được đưa lên client). 1.000 lần chấm ≈ 400 MB → vẫn thoải mái.

### 3.4 Câu hỏi tự nhập

`POST submit-speaking` nhận `question` (string, tuỳ chọn) và `questionId` (uuid, tuỳ chọn).
- Nếu có `questionId` → server lấy `prompt_text` từ DB làm mặc định.
- Nếu không → dùng `question` do user gõ.
- Nếu cả hai rỗng → `400 question_required`.

---

## 4. AI pipeline — 2 lớp

### 4.1 Lớp 1: Gemini đọc audio

- **Model:** `gemini-3.8-flash`
- **Giao thức:** OpenAI-compatible `POST {AI_API_BASE_URL}/v1/chat/completions`
- **Đã verify:** proxy `api.apiz.vn` nhận `input_audio` (response 200, `usage.prompt_tokens_details.audio_tokens > 0`)
- **Input:** audio base64 (`audio/webm` → `format: 'webm'`; `audio/mp4` → `'mp4'`; `audio/wav` → `'wav'`; `audio/mpeg` → `'mp3'`; `audio/ogg` → `'ogg'`)
- **Output (JSON):**

```ts
type AudioAnalysis = {
  transcript: string          // chính xác từng từ người nói
  fillerWords: string[]       // um, uh, like, er...
  mispronounced: Array<{ word: string; issue: string }>   // gợi ý sửa phát âm
  intonationNotes: string[]   // nhận xét ngữ điệu / nhịp
  estimatedWpm: number | null // ước lượng tốc độ nói
  confidence: "high" | "medium" | "low"
}
```

Prompt lớp 1 yêu cầu: transcribe **nguyên văn** (giữ filler, không dịch, không sửa lỗi ngữ pháp),
không thêm bớt nội dung, không thêm lời giải thích.

### 4.2 Lớp 2: Claude chấm rubric

- **Model:** `AI_MODEL_GRADING` (`claude-haiku-5-5` hiện tại)
- **Giao thức:** Anthropic `tool_use` — dùng lại `requestStructured()` của `_shared/anthropic.ts`
- **Structured mode:** `tool` (theo `AI_STRUCTURED_MODE` hiện tại)
- **Input:** transcript + audio analysis + câu hỏi + part + target band + rubric text
- **JSON schema (tool input):**

```ts
{
  status: "ok",
  criteria: [              // đúng 4 phần tử
    { criterion: "fluency" | "lexical_resource" | "grammatical_range" | "pronunciation",
      score: number,        // số nguyên 0..9
      rationale: string,
      evidence: string[],   // trích nguyên văn từ transcript
      improvements: string[] }
  ],
  summary: string,
  strengths: string[],
  priority_actions: string[],
  part_feedback: [ { question: string, tip: string } ]
}
```

- **Output lưu vào `speaking_results`:** 4 cột band + `overall_raw` + `overall_display` (dùng lại
  `computeOverall()` của `_shared/jobs.ts` — trung bình 4 tiêu chí, làm tròn nửa band) +
  `feedback` (toàn bộ JSON trên) + `audio_analysis`.

### 4.3 Rubric — band descriptor chính thức (band 3–9)

File mới: `supabase/functions/_shared/ai/speakingRubric.ts`.
Nguồn: **https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf** (trích nguyên văn).

Cấu trúc: `SPEAKING_BAND_DESCRIPTORS: Record<SpeakingCriterion, BandDescriptor[]>` với
`BandDescriptor = { band, positive: string[], negative: string[] }` — **cùng shape** với
`_shared/ai/rubric.ts` đã có, nên `renderRubric()` có thể tái dùng nguyên trạng.

> Với Speaking, mỗi band mô tả **một khối đặc tính duy nhất** (không tách +/- như Writing).
> Vì vậy `BandDescriptor` cho Speaking dùng: `positive` = mô tả band, `negative` = ràng buộc
> "phải đạt hết" (theo ghi chú (i) của PDF).

**Ghi chú bắt buộc đưa vào prompt (nguyên văn từ PDF):**

> (i) A candidate must fully fit the positive features of the descriptor at a particular level.
> (ii) A candidate will be rated on their average performance across all parts of the test.

**Band Pronunciation 7/5/3** không có mô tả riêng → định nghĩa chính thức:
- 7 = "Displays all the positive features of band 6, and some, but not all, of the positive features of band 8."
- 5 = "Displays all the positive features of band 4, and some, but not all, of the positive features of band 6."
- 3 = "Displays some features of band 2, and some, but not all, of the positive features of band 4."

Rubric text render cho prompt dự kiến ≈ 4.500 ký tự — chấp nhận được (Claude Haiku xử lý thoải mái).

### 4.4 Calibration & floor rule

Tái dùng nguyên văn 2 khối đã có trong `_shared/ai/rubric.ts`:
- `CALIBRATION_PRIOR` (phân bố band thực tế, chống inflate).
- `FLOOR_RULE` (phải đạt **đủ** positive, **không** có negative).

Bổ sung riêng cho Speaking: *"Pronunciation is judged from the audio analysis only. If the audio
analysis could not observe intelligibility, say so explicitly rather than guessing a high score."*

### 4.5 Thời gian, lease & chi phí

- `ANTHROPIC_TIMEOUT_MS` hiện = 180s. Speaking cần budget riêng: **Gemini 60s**, **Claude 120s**.
  Tổng thời gian xử lý một job ≈ 40–60s thực tế.
- **Nâng lease `ai_jobs` từ 120s → 240s** trong migration 027, bằng cách
  `create or replace function public.claim_ai_job()` (giữ nguyên logic sẵn có, chỉ đổi
  `interval '120 seconds'` → `interval '240 seconds'`). Lý do: budget Claude 120s + overhead
  có thể vượt lease 120s cũ, dẫn tới job bị claim 2 lần.
- **Chi phí:** `insertUsageRows()` và `estimateCost()` hiện **hardcode** `pricing_version =
  'anthropic-pricing-v1'`. Cần thêm tham số `pricingVersion` cho cả hai hàm để ghi được 2 loại
  dòng `ai_usage` trong cùng 1 lần chấm:
  - Gemini → `pricing_version = 'gemini-pricing-v1'`, model `gemini-3.8-flash`.
  - Claude → `pricing_version = 'anthropic-pricing-v1'` (giữ nguyên).

  `ai_pricing` có `primary key (pricing_version, model)` nên 2 pricing version không đụng nhau.
  Dòng giá Gemini ghi bằng **USD / 1 triệu token**; audio token của Gemini được tính vào
  `input_tokens` (proxy trả `usage.prompt_tokens_details.audio_tokens`).
  Giá audio của `gemini-3.8-flash` **chưa xác minh** từ nguồn chính thức → ghi `0` hoặc để
  `estimated_cost_usd = null` (hàm `estimate_ai_cost` trả `null` khi model không có trong bảng),
  và **không** ghi giá sai. Giá Claude giữ nguyên bảng `anthropic-pricing-v1` đã seed.

---

## 5. API contracts

### 5.1 `POST /functions/v1/submit-speaking` — phase 1 `prepare`

> **Vì sao 2 phase:** worker có thể claim job **trước khi** client kịp PUT audio lên Storage →
> race condition. Vì vậy job **chỉ được enqueue sau khi upload xong** (phase 2). Đây cũng là
> cách toey.app làm (`speaking-presign` → PUT → `speaking-evaluate`).

Request:

```jsonc
{
  "action": "prepare",
  "part": "part-1" | "part-2" | "part-3",
  "questionId": "uuid | null",       // câu hỏi mẫu (tuỳ chọn)
  "question": "string | null",       // tự nhập (tuỳ chọn)
  "targetBand": 6.5 | null,
  "feedbackLocale": "vi" | "en",
  "mimeType": "audio/webm",
  "byteSize": 123456,
  "durationMs": 42000
}
```

Response `201`:

```jsonc
{
  "attemptId": "uuid",
  "objectPath": "{userId}/{attemptId}/{uuid}.webm",
  "uploadUrl": "https://...storage.../object/sign/...",
  "token": "...",
  "path": "..."
}
```

Lỗi: `400` (validate) · `401` (chưa đăng nhập) · `429` (rate limit).

### 5.2 `PUT <uploadUrl>`

Client `PUT` thẳng audio blob lên Storage với `content-type` = mime đã khai báo.

### 5.3 `POST /functions/v1/submit-speaking` — phase 2 `commit`

Request:

```jsonc
{
  "action": "commit",
  "attemptId": "uuid",
  "idempotencyKey": "string"     // unique theo (user_id, idempotency_key) của ai_jobs
}
```

Server (transaction):
1. Kiểm tra attempt thuộc user, `status = 'preparing'`.
2. Kiểm tra object trong Storage **thực sự tồn tại và byte_size > 0** (dùng
   `service.storage.from('speaking-audio').list()` hoặc `download()` rồi đếm byte).
   Không có → `400 audio_not_uploaded`.
3. Update attempt → `status = 'queued'`.
4. Insert `ai_jobs` (`operation = 'grade-speaking'`, `payload = {"attemptId": "..."}`,
   `idempotency_key`, `revision_id = null`).
5. Trigger `enforce_ai_job_concurrency` → nếu user đang có 2 job pending thì `429`.

Response `202`:

```jsonc
{ "attemptId": "uuid", "jobId": "uuid" }
```

Lỗi: `400` · `401` · `404` (attempt không thuộc user) · `409` (đã commit rồi) · `429`.

### 5.4 Client polling

Mẫu theo `pollGrading()` hiện có: đọc `speaking_attempts.status` + `speaking_results` mỗi 2.5s,
timeout 180s. Khi `status = 'succeeded'` → render kết quả. `failed` → hiện `error_code` dịch sang
thông báo tiếng Việt/Anh.

### 5.5 Vòng đời status của `speaking_attempts`

```
(preparing) --commit--> (queued) --worker claim--> (processing) --> (succeeded | failed)
```

- `preparing`: attempt đã tạo, đang chờ client upload audio.
- `queued`: đã enqueue job, chờ worker.
- `processing`: worker đang chạy (set trong `runSpeakingGrading`).
- `succeeded`: có `speaking_results`.
- `failed`: `error_code` được set.

Job `ai_jobs.payload` = `{ "attemptId": "<id của speaking_attempts>" }` — nguồn duy nhất để worker biết
cần tải file audio nào (không dùng `revision_id`, vốn chỉ dành cho essay).

---

## 6. Frontend

### 6.1 Route & nav

- Route mới: `/app/speaking` (trong `RouteGuard`, lazy-load như `/app/reading`).
- Nav sidebar: thêm `{ path: '/app/speaking', icon: Mic, label: c('Luyện nói', 'Speaking') }`
  ngay sau `/app/reading`.
- `src/App.tsx`: thêm route + import lazy.

### 6.2 Files

| File | Trách nhiệm |
|---|---|
| `src/pages/Speaking.tsx` | Orchestration: state `setup` → `recording` → `uploading` → `grading` → `result`; render form + kết quả |
| `src/components/speaking/SpeakingRecorder.tsx` | MediaRecorder (mic) + upload file; đồng hồ; nút ghi/dừng; validate thời lượng & dung lượng |
| `src/components/speaking/SpeakingQuestionPicker.tsx` | Chọn Part → chọn câu hỏi mẫu (đọc `speaking_questions`) hoặc tự nhập |
| `src/components/speaking/SpeakingResult.tsx` | Band tổng, 4 thẻ tiêu chí, transcript annotate, lỗi phát âm, filler, gợi ý |
| `src/lib/speakingLogic.ts` | **Logic thuần** (không I/O): hằng giới hạn, tính band, định dạng, map lỗi → message |
| `src/lib/speaking.ts` | Gọi API: `fetchSpeakingQuestions`, `submitSpeaking`, `pollSpeakingResult` |

### 6.3 Luồng UI

1. **Setup** — chọn Part (3 tab) → chọn câu hỏi mẫu trong list (theo part) hoặc gõ tay → chọn
   band mục tiêu (tuỳ chọn) → chọn ngôn ngữ phản hồi (theo locale hiện tại của app).
2. **Record** — nút "Ghi âm" (icon Mic). Đồng hồ đếm ngược theo giới hạn part
   (60/120/90s). Vượt giới hạn → tự dừng. Nút "Tải file lên" thay thế.
3. **Upload** — `POST submit-speaking {action:'prepare'}` → `PUT uploadUrl` →
   `POST submit-speaking {action:'commit'}`.
4. **Grading** — spinner + tiến trình bước ("Đang nghe...", "Đang chấm...", có thể poll `status`).
5. **Result** — xem §6.4.

### 6.4 Màn hình kết quả

```
┌─ Overall band (lớn) ─────────────┐
│  6.5   mục tiêu: 7.0   ▲ +0.5    │
└───────────────────────────────────┘
┌ Fluency 6.5 ┐┌ Lexical 6.0 ┐┌ Grammar 7.0 ┐┌ Pronunciation 6.5 ┐
│ rationale    ││ rationale    ││ rationale    ││ rationale          │
│ evidence     ││ ...          ││ ...          ││ ...                │
│ improvements ││ ...          ││ ...          ││ ...                │
└──────────────┘└──────────────┘└──────────────┘└────────────────────┘
┌ Transcript (annotated) ────────────────────────────────────────────┐
│  "I really ^like^ my city because it has ~~~many~~~ facilities."    │
│         ↑ đường gạch ngang = lỗi, xanh đậm = cách sửa              │
└────────────────────────────────────────────────────────────────────┘
┌ Phát âm ────────────┐┌ Cải thiện ─────────┐┌ Ưu tiên ────────────┐
│ mispronounced words  ││ improvements       ││ priority_actions    │
│ filler words         ││ per criterion      ││                     │
│ intonation notes     ││                     ││                     │
└──────────────────────┘└────────────────────┘└─────────────────────┘
```

### 6.5 i18n

Dùng helper `c(vi, en)` sẵn có (`src/i18n.ts`), không thêm key i18next. `feedback_locale` lấy từ
locale hiện tại của app → `vi` mặc định.

---

## 7. Xử lý lỗi

| Tình huống | Hành vi |
|---|---|
| Chưa đăng nhập | `RouteGuard` chặn ở route (đã có) |
| Audio vượt giới hạn part hoặc > 4 MiB | Chặn ở client **và** `parseSpeaking` ở server |
| `ai_jobs` đã có 2 job pending của user | Trigger `enforce_ai_job_concurrency` → `429` |
| Gemini lỗi / timeout | `fail_ai_job` retry ≤3 lần, backoff luỹ tiến; hết số lần → `failed` + `error_code` |
| Claude trả JSON sai schema | `requestStructured` tự gọi repair 1 lần (đã có sẵn) |
| Worker chết giữa chừng | Lease `ai_jobs` hết hạn → job về `retry_wait` (đã có) |
| Upload thất bại | Báo lỗi, cho phép thử lại, attempt cũ để `cancelled` |
| Gemini không nghe rõ | `audioAnalysis.confidence = 'low'` → Claude được yêu cầu nói rõ giới hạn thay vì đoán |
| Rò rỉ audio | Xoá file sau khi chấm (kể cả khi fail) + RLS bucket giới hạn theo `auth.uid()` |

---

## 8. Tác động lên Supabase free tier

Đã đối chiếu số liệu thật của project `fjlyjaomuxotqqjvugtv`:

| Hạng mục | Free tier | Hiện tại | Speaking thêm | Kết luận |
|---|---|---|---|---|
| Database | 500 MB | 54 MB | ~15 KB/lần chấm | ✅ ≈30.000 lần |
| Storage | 1 GB | 11 MB | audio ~300 KB, **xoá sau khi chấm** | ✅ không đáng kể |
| Egress | 5 GB/tháng | — | upload = ingress; audio→Gemini ~400 KB/lần | ✅ 1.000 lần ≈ 400 MB |
| Edge Function invocations | 500.000/tháng | 259.200 (cron 10s) | +1/lần chấm | ✅ sau khi nâng cron |
| Wall clock | 150s | — | Gemini + Claude ≈ 40–60s | ✅ |

**Hành động:** nâng cron `process-ai-jobs` từ **10s → 30s**
(`supabase/scripts/setup-cron.mjs`, chuỗi `'10 seconds'` → `'30 seconds'`, rồi chạy lại
`npm run db:cron`). Giảm ~173.000 invocation/tháng (52% → 17% quota free tier).
Đổi lại: Writing + Speaking chờ thêm tối đa 30s (trung bình ~15s).

---

## 9. Testing

### 9.1 `tests/speaking.test.ts` (node --test, logic thuần)

- `maxDurationMs('part-1'|'part-2'|'part-3')` → 60000 / 120000 / 90000.
- `validateAudio({byteSize, durationMs, part})` → lỗi cụ thể khi vượt giới hạn.
- `computeOverallBand([6.5, 6, 7, 6.5])` → `{ raw: 6.5, display: 6.5 }` (làm tròn nửa band).
- `formatBand(6.5)` → `'6.5'`, `formatBand(7)` → `'7.0'`.
- `detectMimeFromFile(file)` → map đúng extension sang mime được bucket cho phép.
- `mapSpeakingError(code)` → message tiếng Việt/Anh.

### 9.2 `supabase/functions/_shared/tests/speaking.test.ts` (edge contract)

- `buildSpeakingResult()` reject khi thiếu 1 trong 4 tiêu chí.
- reject khi score ngoài 0–9 hoặc không phải số nguyên.
- reject khi `evidence` không nằm trong transcript (dùng `verifyEvidence` sẵn có).
- accept payload hợp lệ → `overallDisplay` đúng.
- `renderSpeakingRubric()` chứa đủ 4 tiêu chí × band 3–9.
- `parseAudioAnalysis()` reject khi thiếu `transcript`.

### 9.3 Test scripts

`package.json`:
- `"test"` += `tests/speaking.test.ts`
- `"test:edge"` tự động bắt file trong `_shared/tests/*.test.ts` (đã dùng glob) → không cần sửa.

---

## 10. Danh sách file

**Mới:**
```
supabase/migrations/027_speaking.sql
supabase/seed/speaking-questions.json               ← 79 bộ câu hỏi (đã trích bằng REA)
supabase/seed/seed-speaking-questions.mjs           ← upsert theo slug
scripts/build-speaking-questions.mjs                ← regenerate JSON từ dữ liệu gọn
supabase/functions/submit-speaking/index.ts
supabase/functions/submit-speaking/deno.json
supabase/functions/_shared/ai/speaking.ts            ← schema + validate (thuần)
supabase/functions/_shared/ai/speakingRubric.ts      ← band descriptor 3–9
supabase/functions/_shared/ai/audioProvider.ts       ← Gemini audio call
supabase/functions/_shared/tests/speaking.test.ts
src/pages/Speaking.tsx
src/lib/speakingLogic.ts
src/lib/speaking.ts
src/components/speaking/SpeakingRecorder.tsx
src/components/speaking/SpeakingQuestionPicker.tsx
src/components/speaking/SpeakingResult.tsx
tests/speaking.test.ts
```

**Sửa:**
```
supabase/functions/_shared/ai/pipeline.ts        ← + runSpeakingGrading + nhánh operation
                                                  ← + estimateCost/insertUsageRows nhận pricingVersion
supabase/functions/_shared/storage.ts             ← + removeUserSpeakingAudioObjects()
supabase/functions/delete-account/index.ts       ← + dọn object speaking-audio của user
supabase/seed/seed-ai-pricing.mjs                ← + dòng gemini-3.8-flash (pricing_version mới)
supabase/scripts/setup-cron.mjs                  ← cron 10s → 30s
supabase/scripts/verify-schema.mjs               ← + bucket 'speaking-audio' vào expectedBuckets
src/App.tsx                                      ← + route /app/speaking
src/components/Layout.tsx                        ← + nav item Speaking
src/lib/ai.ts                                    ← + submitSpeaking / pollSpeakingResult
package.json                                      ← + db:seed:speaking, test file mới
README.md                                         ← + mô tả module Speaking
```

> **Dọn dữ liệu khi xoá tài khoản:** `delete-account` hiện chỉ gọi `removeUserAssetObjects()`
> (xoá `essay-images`). Phải thêm `removeUserSpeakingAudioObjects()` để xoá object trong
> `speaking-audio`, vì các row `speaking_attempts` bị `on delete cascade` xoá theo `auth.users`
> nhưng object trong Storage thì không.

---

## 11. Acceptance criteria

1. `/app/speaking` chỉ truy cập được khi đã đăng nhập; hiện trong sidebar.
2. Chọn được Part 1/2/3, chọn câu hỏi mẫu hoặc tự nhập câu hỏi.
3. Ghi âm bằng mic hoặc upload file; tự chặn khi vượt giới hạn thời lượng part / 4 MiB.
4. Upload thành công lên bucket `speaking-audio` với đường dẫn `{userId}/{attemptId}/...`.
5. Job `grade-speaking` **chỉ được tạo sau khi** audio đã upload (phase `commit` xác minh object
   tồn tại và `byte_size > 0`); không cần deploy thêm worker.
6. Kết quả trả về đủ 4 band tiêu chí + `overall_display` (nửa band) + transcript + corrections +
   improvements + priority actions + audio analysis.
7. Audio bị xoá khỏi Storage sau khi chấm (kể cả khi job fail) và khi xoá tài khoản.
8. `ai_usage` ghi 2 dòng cho mỗi lần chấm (Gemini + Claude) với `pricing_version` tương ứng;
   `ai_pricing` có dòng cho `gemini-3.8-flash` với `pricing_version = 'gemini-pricing-v1'`.
9. Lỗi hiển thị bằng tiếng Việt, không crash UI; nút thử lại hoạt động.
10. `npm test` và `npm run test:edge` xanh.
11. Cron chạy mỗi 30s.
12. Bộ câu hỏi mẫu đã seed: 25 topic Part 1 + 34 cue card Part 2 + 20 topic Part 3 (tổng 79);
    user chọn được 1 câu 1 chạt và vẫn có thể tự nhập câu hỏi riêng.
