# Supabase Edge Functions — Writing Studio

Thư mục này chứa 14 Edge Function cho AI pipeline và module Reading. Runtime là **Deno + Supabase Edge Functions**; import map dùng **npm**:

```json
"@supabase/supabase-js": "npm:@supabase/supabase-js@2.118.0"
```

Mỗi function có `deno.json` riêng để Supabase CLI bundle đúng dependency khi deploy. `supabase/functions/deno.json` là config chung cho local workspace. Không dùng TypeScript/source từ `src/`.

## Danh sách function

| Function | Method | Input | Output chính |
|---|---|---|---|
| `submit-essay` | `POST` | `{essayId, expectedVersion, idempotencyKey, mode}` | `202 {revisionId, jobId, status}` |
| `prepare-upload` | `POST` | `{essayId, mimeType, byteSize, sha256}` | `{assetId, objectPath, token, signedUrl}` |
| `retry-job` | `POST` | `{jobId, idempotencyKey}` | `202 {jobId, status}` |
| `run-writing-tool` | `POST` | `{operation, revisionId?, text?, prompt?, assetIds?, idempotencyKey}` | `202 {jobId, status}` |
| `delete-essay` | `POST` | `{essayId}` | `{deleted: true}` |
| `delete-account` | `POST` | `{confirmText: "DELETE"}` | `{deleted: true}` |
| `admin-content` | `POST` | `{action, entry, translations?}` | `{ok, entry}` |
| `admin-users` | `POST` | `{action, userId}` | `{ok, userId, role, status}` |
| `admin-usage` | `GET` | `?from=<ISO>&to=<ISO>` | `{rows, totals}` |
| `admin-session` | `POST` | `{password}` | `{token, expiresAt}` |
| `admin-data` | `POST` | `{action, ...}` | theo `action` (dashboard · xoá bài · đổi trạng thái đề · từ vựng · retry job · donate) |
| `admin-skills` | `POST` | `{action: "set-status", testId, status}` | `{ok, test}` |
| `grade-skill` | `POST` | `{testId, answers, timeSpentSeconds}` | `{attemptId, correctCount, totalCount, band, results}` |
| `grade-skill` | `GET` | header `x-attempt-id` | `{attemptId, correctCount, totalCount, band, results}` |
| `process-ai-jobs` | `POST` | header `x-worker-secret` | `{processed, failed}` |

`run-writing-tool` chỉ nhận `magic-rewrite`, `argument-stress-test`, `critical-thinking`, `read-image`. `admin-content` nhận `upsert`, `publish`, `hide`, `delete`; `admin-users` nhận `suspend`, `restore`, `make_admin`, `remove_admin`; `admin-skills` nhận `set-status` với `status` là `published`, `draft` hoặc `hidden`.

Mọi endpoint trừ worker dùng `Authorization: Bearer <user JWT>`. Function xác minh JWT qua `auth.getUser(token)`, rồi kiểm tra `private.is_active_user()`; nếu schema `private` không được PostgREST expose, backend fallback sang truy vấn `user_access` tương đương bằng service role. Admin kiểm tra `private.is_admin()` theo cùng cơ chế. `user_id` luôn lấy từ JWT, không lấy từ body.

`admin-data` là cổng quản trị lớp 2: ngoài JWT + role admin còn cần header `x-admin-token` do `admin-session` cấp (HMAC theo `ADMIN_PASSWORD`, hạn 12 giờ). Mọi thao tác ghi đều ghi `admin_audit_logs`. `grade-skill` chấm bằng service role nên cột đáp án không bao giờ tới trình duyệt; lần làm bài được ghi vào `skill_attempts`.

## Biến môi trường

| Biến | Bắt buộc | Mục đích |
|---|---:|---|
| `SUPABASE_URL` | có | URL API project; Edge runtime cung cấp sẵn |
| `SUPABASE_ANON_KEY` hoặc `SUPABASE_PUBLISHABLE_KEY` | có | Xác minh user JWT; không cần quyền DB |
| `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_KEY` hoặc `SUPABASE_SECRET_KEY` | có | Bypass RLS sau khi đã kiểm tra JWT/owner/admin |
| `ANTHROPIC_API_KEY` | không | Key API chính thức của Anthropic. Dùng `AI_API_KEY` khi gọi provider khác |
| `AI_API_BASE_URL` | không | Gốc endpoint của provider; mặc định `https://api.anthropic.com` |
| `AI_API_KEY` | không | Key của provider bên thứ 3; thay cho `ANTHROPIC_API_KEY` |
| `AI_API_PROTOCOL` | không | `auto` (tự nhận diện) · `anthropic` · `openai` |
| `AI_STRUCTURED_MODE` | không | `tool` (tool-use của Anthropic — mặc định) · `prompt` · `native` (`output_config`, chỉ API chính thức) |
| `WORKER_SECRET` | có | Header nội bộ của `process-ai-jobs`; so sánh constant-time |
| `AI_MODEL_GRADING` | có | Model chấm/stress-test/critical-thinking; đang dùng `claude-haiku-5-5` |
| `AI_MODEL_EXTRACTION` | có | Model enrichment/read-image/rewrite; đang dùng `claude-haiku-5-5` |
| `ALLOWED_ORIGINS` | không | CSV origin CORS; mặc định `*`, production nên đặt origin thật |

Code không có fallback model: thiếu `AI_MODEL_GRADING`/`AI_MODEL_EXTRACTION` sẽ trả lỗi cấu hình, không hardcode model trong logic.

Đặt secrets bằng Supabase CLI/Dashboard, không commit giá trị thật:

```bash
supabase secrets set \
  AI_API_BASE_URL=https://api.example.dev \
  AI_API_KEY=... \
  AI_MODEL_GRADING=claude-haiku-5-5 \
  AI_MODEL_EXTRACTION=claude-haiku-5-5
```

Service key phải là secret của Edge runtime. Không đưa key vào `VITE_*`.

## Deploy

Deploy từng function (function worker không cần `--no-verify-jwt` vì `supabase/config.toml` đã đặt `verify_jwt = false`; nó tự xác minh `x-worker-secret`):

```bash
supabase functions deploy submit-essay
supabase functions deploy prepare-upload
supabase functions deploy retry-job
supabase functions deploy run-writing-tool
supabase functions deploy delete-essay
supabase functions deploy delete-account
supabase functions deploy admin-content
supabase functions deploy admin-users
supabase functions deploy admin-usage
supabase functions deploy admin-session
supabase functions deploy admin-data
supabase functions deploy admin-skills
supabase functions deploy grade-skill
supabase functions deploy process-ai-jobs
```

Hoặc dùng script (deploy cả 14 function rồi set secrets trong một lệnh):

```bash
npm run db:deploy
```

Script cần `SUPABASE_ACCESS_TOKEN` trong `.env.local` và sẽ bỏ qua bước set secrets
nếu không có `ANTHROPIC_API_KEY` / `WORKER_SECRET`. Không deploy `process-ai-jobs` nếu
`WORKER_SECRET` chưa được set. `supabase/config.toml` khai báo `verify_jwt = true` cho 9 endpoint user và `false` cho worker; các function mới (`admin-session`, `admin-data`, `admin-skills`, `grade-skill`) dùng mặc định `verify_jwt = true` và tự kiểm tra JWT trong handler.

## Luồng upload ảnh

1. Client gọi `prepare-upload` với MIME, byte size và SHA-256.
2. Backend kiểm tra chỉ `image/png`, `image/jpeg`, `image/webp`, tối đa 5 MiB; tạo path `{userId}/{essayId}/{assetId}.{ext}`.
3. Client upload bằng `uploadToSignedUrl(objectPath, token, file)` và `x-upsert: false` (signed upload API đã cấu hình không overwrite).
4. Khi submit essay, backend tải object, kiểm tra magic bytes, kích thước thật và SHA-256; object hợp lệ mới chuyển `essay_assets.status` sang `ready` và được gắn vào revision.

## AI pipeline

- `submit-essay` tạo snapshot bất biến trong `essay_revisions`, rồi tạo `ai_jobs.operation='grade'`.
- Worker claim tối đa **một job** bằng `claim_ai_job()`, gọi Anthropic với timeout 90 giây và structured JSON schema, rồi `complete_ai_job(jobId, leaseToken, resultId)`.
- Lỗi 429/5xx/network/timeout retry tối đa theo budget của DB; lỗi input/config/schema không retry. JSON hỏng được sửa tối đa một lần rồi fail, không ghi điểm một phần.
- Grading trả đúng 4 tiêu chí. Task 2 dùng `task_response`; Task 1 dùng `task_achievement`. Backend tự tính `overall_raw=sum/4`, `overall_display=round(raw*2)/2`.
- Evidence phải là substring chính xác của snapshot; backend tự tính offset/paragraph và loại quote bịa.
- Thiếu prompt/reference (Task 1 không có ảnh lẫn data) tạo kết quả `needs_reference`, không bịa điểm.
- Sonnet chấm xong sẽ xếp một job `enrich` riêng; Haiku gộp features + error suggestions. Lỗi enrichment không xóa điểm đã chấm.
- Cache là riêng theo owner và dùng `ai_jobs.cache_key`; key gồm owner, operation, task/subtype, bài nguyên bản, đề/reference, hash ảnh, locale, target band, model và version prompt/rubric/schema.
- `ai_usage` ghi input/output/cache token, latency, model, provider request ID và pricing version. `estimated_cost_usd` để `null` cho tới khi cấu hình bảng giá theo `pricing_version`.
- Bài, đề, reference và ảnh luôn được gói là dữ liệu không tin cậy; request Anthropic không cấp tool.

## Module Reading (chấm điểm)

- `grade-skill` **không** gọi AI: đối chiếu trực tiếp `skill_questions.answer_key` bằng service role rồi quy đổi band theo bảng Cambridge trong `_shared/skillGrading.ts` — nguồn sự thật duy nhất.
- `POST` chấm một lần làm bài mới và ghi `skill_attempts` (điểm đúng, tổng số câu, band, thời gian làm bài). `GET` với header `x-attempt-id` trả lại kết quả của một lần làm bài đã lưu (chỉ chủ sở hữu xem được).
- Kết quả kèm `explanation` của từng câu; cột này không được cấp quyền đọc cho client nên chỉ trả về qua function.
- Chỉ service role được ghi `skill_attempts`; client không có quyền `INSERT`, nên người dùng không tự khai được điểm.
- `admin-skills` đổi trạng thái đề (`published` / `draft` / `hidden`) bằng service role sau khi kiểm tra role admin; client không có quyền ghi `skill_tests`.

## Cron worker 10 giây

`pg_cron` + `pg_net` có thể gọi worker định kỳ. Nên lưu worker secret trong Vault thay vì ghi plaintext trong cron command:

```sql
select vault.create_secret('<same-as-edge-WORKER_SECRET>', 'worker_secret', 'Edge worker secret');

select cron.schedule(
  'process-ai-jobs',
  '10 seconds',
  $$
  select net.http_post(
    url := 'https://fjlyjaomuxotqqjvugtv.supabase.co/functions/v1/process-ai-jobs',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-worker-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'worker_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Cron chỉ là đường phục hồi; có thể gọi worker ngay sau khi tạo job. Mỗi invocation vẫn chỉ claim một job. Việc project/gói có cho phép cron 10 giây hay không phải kiểm tra ở môi trường thật.

## Kiểm thử bằng curl

```bash
export SUPABASE_URL='https://fjlyjaomuxotqqjvugtv.supabase.co'
export SUPABASE_PUBLISHABLE_KEY='<publishable-key>'
export USER_TOKEN='<access-token>'

curl -i -X POST "$SUPABASE_URL/functions/v1/submit-essay" \
  -H "apikey: $SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H 'content-type: application/json' \
  -d '{"essayId":"<essay-uuid>","expectedVersion":3,"idempotencyKey":"submit-<uuid>","mode":"grade"}'

curl -i -X POST "$SUPABASE_URL/functions/v1/process-ai-jobs" \
  -H "x-worker-secret: $WORKER_SECRET" \
  -H 'content-type: application/json' \
  -d '{}'
```

Lỗi có shape `{error:{code,message,requestId,retryAfter?},requestId}`; không trả stack trace, raw provider response hoặc secret.

## Giới hạn đã biết

- `admin-content` hiện quản lý `content_entries` + `content_translations`; quản lý bộ `prompts` cần action/RPC riêng.
- Audit admin và mutation chưa nằm trong cùng transaction DB; lỗi ghi audit có thể xảy ra sau mutation.
- Chưa có smoke test chạy thật trong phiên triển khai này; cần deploy riêng từng function và kiểm tra model/Storage/cron trên project thật.

## Phần đã đóng trong migration 012

- **`claim_ai_job()` lấy lại job hết lease** — job ở trạng thái `processing` mà `lease_until` đã qua được claim lại (tối đa 3 lần thử). Worker bị kill giữa chừng không còn để job treo vĩnh viễn.
- **`public.submit_essay_job(...)`** — tạo `essay_revisions` + `ai_jobs` trong **một transaction**. Trước đây nếu insert job lỗi sau khi revision đã tạo thì còn revision mồ côi; nay cả hai cùng rollback. Cũng xử lý idempotency ở mức database.
- **Bảng `ai_pricing` + `public.estimate_ai_cost(...)`** — `ai_usage.estimated_cost_usd` lấy từ bảng giá theo `pricing_version`. Model chưa có giá ⇒ `NULL` (không ghi `$0` giả). Nạp giá bằng `npm run db:seed:pricing`.
- **Giới hạn 2 job AI đồng thời mỗi người dùng** — trigger `ai_jobs_concurrency_guard` chặn ở database, không phụ thuộc client. Job thứ 3 trả `429 too_many_ai_jobs`.
- **View `public.ai_usage_totals`** — tổng hợp token/chi phí theo model cho trang quản trị.
