# Backend — việc còn phải làm

Trạng thái đã có trên Supabase `fjlyjaomuxotqqjvugtv`: **23 bảng `public`**, RLS trên toàn bộ, 31 policy, 3 Storage bucket, **8 RPC** (5 cho client, 3 cho worker), index theo `user_id`/`due_at`/queue/`(task, set_name)`/`(task, subtype)`, script `db:migrate` + `db:verify` chạy lại nhiều lần không lỗi. Dữ liệu: 244 đề (190 đề Task 2 theo 19 chủ đề từ `debai/` + 54 đề tự biên soạn có biểu đồ), 19 chủ đề, 7 dạng biểu đồ, 15 nội dung + 30 bản dịch.

**Lưu ý:** tài liệu này chỉ liệt kê việc cần làm và phần phải bổ sung. Không chạy lệnh backend trong phiên làm việc này.

---

## A. Việc còn lại của Plan 1 (database)

### A1. Nạp nội dung và bộ đề — `npm run db:seed`
- [x] Chạy `npm run db:seed` (cần `SUPABASE_SECRET_KEY` trong `.env.local`).
- [x] Kiểm tra: `content_entries` → 15 · `content_translations` → 30 · `prompts` → 244 (190 từ `debai/` + 54 tự biên soạn).
- [x] Kiểm tra đề Academic có biểu đồ: `select count(*) from prompts where chart is not null;` → 21.
- [x] Chạy lại `npm run db:seed` để chứng minh idempotent (số dòng không đổi).

Script đã có: `supabase/seed/seed-content.ts` (nội dung + bản dịch), `supabase/seed/seed-prompts.mjs` (190 đề `debai/`), `supabase/seed/seed-library.mjs` (54 đề tự biên soạn + chủ đề + dạng biểu đồ).

### A2. Vòng đời bảng `prompts` (đã tạo, còn bổ sung)
- [x] `updated_at` trigger — đã có trong `006_prompt_library.sql`.
- [x] Index theo `topics` (GIN) — đã có.
- [x] **Cần bổ sung:** index phục vụ lọc theo `set_name` + `task`: `create index prompts_task_set_idx on public.prompts (task, set_name);`
- [x] **Cần bổ sung:** index phục vụ lọc theo dạng biểu đồ: `create index prompts_subtype_idx on public.prompts (task, subtype) where status = 'published';`
- [x] **Cần bổ sung:** RPC đọc đề theo `slug` để editor tải 1 đề mà không lộ toàn bộ bảng: `public.get_prompt(p_slug text)` — `security invoker`, chỉ `published`.
- [x] **Cần bổ sung:** cột `updated_by uuid references auth.users (id)` cho trường `prompts` để admin biết ai sửa đề.
- [x] **Cần bổ sung:** chính sách ghi của admin — `for all to authenticated using (private.is_admin()) with check (private.is_admin())`.
- [x] **Cần bổ sung:** cột `updated_by` cho `prompt_topics` và `prompt_chart_types` (admin sửa nội dung).
- [ ] **Không làm:** bảng `prompt_translations` — đề thi luôn tiếng Anh, `title_vi`/`hint_vi` đã đủ.

### A2b. Nhóm chủ đề & dạng biểu đồ (đã có migration, chưa seed)
- [x] `007_prompt_topics.sql` — bảng `prompt_topics` (key, label VI/EN, subtopics, task, sort_order) + ràng buộc `prompts.topics ⊆ prompt_topics.key`.
- [x] `008_prompt_chart_types.sql` — bảng `prompt_chart_types` (7 dạng: line, bar, pie, table, map, process, mixed) + trigger `private.validate_prompt_subtype()` chặn `prompts.subtype` lạ.
- [x] Chạy `npm run db:migrate` để áp 007 và 008.
- [x] Chạy `npm run db:seed` — thứ tự: `prompt_chart_types` → `prompt_topics` → `prompts` → `content_entries` + `content_translations`.

### A3. Nối `writing_prompts` cũ với `prompts` mới
- [x] Bảng `public.writing_prompts` (migration 002) có `prompt_text`/`reference_data` nhưng không có `slug`, `topics`, `chart`. **Frontend không dùng bảng này** và bảng rỗng (0 dòng).
- [x] **Quyết định:** bỏ hẳn `writing_prompts`, dùng `prompts` làm nguồn duy nhất — nó đầy đủ hơn và đã có dữ liệu thật (244 đề).
- [x] `essays.prompt_id` trỏ lại `public.prompts (id) on delete set null` (migration 009).

### A4. Tài liệu & bảo mật (Task 11)
- [x] `supabase/README.md` — thứ tự chạy, hợp đồng bảng, rollback, quy trình bảo mật.
- [x] Rà secret trong lịch sử git và trong cây hiện tại — không còn credential nào trong bất kỳ commit nào (đã dựng lại lịch sử và xoá vật lý object cũ).
- [ ] **Đổi mật khẩu DB và tạo lại secret key** trong Dashboard (rủi ro: file plan cũ từng chứa mật khẩu). **Chỉ làm được trên Dashboard**: role `postgres` trong project không phải superuser nên `ALTER USER` bị từ chối (`permission denied to alter role`).
- [x] Bổ sung `SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_URL` vào `.env.example` của nhánh frontend.
- [x] Chạy `npm run db:verify` lần cuối + `npm test` + `npm run build` trước khi phát hành — 23/23 check PASS, test 3/3, build sạch.

---

## B. Plan 2 — Auth trên frontend (chưa làm)

### B1. Client & provider
- [ ] `src/lib/supabase.ts`: `createClient(url, publishableKey)` với `auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }`.
- [ ] `src/lib/auth.tsx`: `AuthProvider` + hook `useAuth()` trả `{ user, session, loading, signUp, signIn, signOut, resetPassword, updateProfile }`.
- [ ] `onAuthStateChange` → đồng bộ `profiles` (display_name, ui_locale, feedback_locale, timezone, target_band).
- [ ] Xử lý callback: `/auth/callback` đọc `code` từ URL → `exchangeCodeForSession`.

### B2. Thay màn hình Auth placeholder
- [ ] `src/pages/Other.tsx` → `Auth.tsx` riêng: đăng ký (email + mật khẩu ≥ 8 ký tự), đăng nhập, quên mật khẩu (gửi email reset), đặt lại mật khẩu.
- [ ] Bỏ thông báo "Xác thực chưa kết nối".
- [ ] Bảo vệ route: `/app/**`, `/admin/**` yêu cầu đăng nhập; landing và `/library` công khai.
- [ ] Hiển thị lỗi Supabase theo mã (`AuthError`) bằng thông điệp tiếng Việt, không lộ raw error.

### B3. `store.tsx` chuyển nguồn dữ liệu
- [ ] `essays` → RPC `save_draft` (đã có, trả `{essay_id, draft_version}`) + đọc `essays` theo RLS.
- [ ] `study_cards` → RPC `save_study_card` (đã có).
- [ ] Ôn tập → RPC `review_card` (đã có, đã xử lý replay theo `request_id`).
- [ ] `guide_progress` → RPC `complete_guide` (đã có).
- [ ] Đề của người dùng → bảng `prompts` (`source = 'recalled'`) hoặc bảng riêng `user_prompts`; cần `created_by` + RLS owner.
- [ ] Ảnh đề → `essay-assets` qua Edge Function `prepare-upload` (chưa có) + Storage `essay-images`.
- [ ] Bỏ IndexedDB hoặc giữ làm cache offline (khuyến nghị: giữ cache đọc, ghi thì qua DB).
- [ ] Đồng bộ nhiều tab: thay `BroadcastChannel` bằng Supabase Realtime.

### B4. Việc phát sinh
- [ ] `profiles.target_band` là `numeric(2,1)`; frontend đang dùng string → chuẩn hoá.
- [ ] User bị `suspended` (`user_access.status`) phải bị chặn ghi và gọi AI (RPC đã trả `42501`, frontend cần bắt mã này).
- [ ] Xác minh email: bật trong Dashboard; `auth.users` trigger đã tự tạo `profiles` + `user_access`.

---

## C. Plan 3 — Edge Functions + AI (chưa làm)

### C1. Cấu trúc thư mục
```
supabase/functions/
  _shared/{cors.ts, auth.ts, anthropic.ts, schemas.ts, jobs.ts}
  submit-essay/       prepare-upload/     retry-job/
  run-writing-tool/   delete-essay/       delete-account/
  admin-content/      admin-users/        admin-usage/
  process-ai-jobs/
```
- [ ] Mỗi function: `Deno.serve` + `import_map.json` (supabase-js, zod) + `deno.json`.
- [ ] Deploy: `supabase functions deploy <name> --no-verify-jwt` cho function nội bộ, còn lại xác thực JWT bằng `supabase.functions.invoke` (client gửi session token).
- [ ] Secrets: `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `WORKER_SECRET`, `AI_MODEL_GRADING=claude-sonnet-4-6`, `AI_MODEL_EXTRACTION=claude-haiku-4-5`.

### C2. Danh sách 9 function + hợp đồng

| Function | Method | Input | Output | Ghi chú |
|---|---|---|---|---|
| `submit-essay` | POST | `{essayId, expectedVersion, idempotencyKey, mode}` | `{revisionId, jobId, status}` | Tạo `essay_revisions` bất biến + `ai_jobs` (`operation='grade'`), trả 202 |
| `prepare-upload` | POST | `{essayId, mimeType, byteSize, sha256}` | `{assetId, objectPath, token}` | Cấp quyền upload có hạn vào `essay-images/{uid}/{essayId}/{assetId}`; kiểm tra magic bytes |
| `retry-job` | POST | `{jobId, idempotencyKey}` | `{jobId, status}` | Chỉ job của chính chủ sở hữu, chỉ khi `failed` |
| `run-writing-tool` | POST | `{operation, revisionId?, text?, prompt?, assetIds?, idempotencyKey}` | `{jobId}` | `operation` ∈ magic-rewrite, argument-stress-test, critical-thinking, read-image |
| `delete-essay` | POST | `{essayId}` | `{deleted: true}` | Tombstone → hủy job → xoá Storage → xoá DB, có thể retry |
| `delete-account` | POST | `{confirmText}` | `{deleted: true}` | Xoá toàn bộ dữ liệu người dùng + auth user |
| `admin-content` | POST | `{action, entry?, translations?}` | `{ok, entry}` | Kiểm tra `private.is_admin()`; ghi `admin_audit_logs` |
| `admin-users` | POST | `{action, userId}` | `{ok}` | Khôi phục/khoá tài khoản; **không** đọc nội dung bài của người dùng |
| `admin-usage` | GET | `?from&to` | `{rows, totals}` | Đọc `ai_usage` (bảng này cố ý không cấp quyền cho `authenticated`) |
| `process-ai-jobs` | POST | header `x-worker-secret` | `{processed, failed}` | Nội bộ: claim job → gọi AI → ghi kết quả |

### C3. Worker `process-ai-jobs`
- [ ] Claim: `select public.claim_ai_job()` (đã có, `FOR UPDATE SKIP LOCKED`, lease 120 giây, trả `lease_token`).
- [ ] Gọi Anthropic với timeout 90 giây; mỗi invocation chỉ làm **một** bước AI.
- [ ] Ghi kết quả: `public.complete_ai_job(jobId, leaseToken, resultId)` hoặc `public.fail_ai_job(jobId, leaseToken, code, retry, retryAfterSeconds)` (đã có, backoff + jitter, tối đa 3 lần).
- [ ] Cron: `select cron.schedule('process-ai-jobs', '10 seconds', ...)` gọi function bằng `net.http_post` kèm `x-worker-secret`.
- [ ] Idempotency: worker cũ không ghi đè job mới — điều kiện `lease_token` trong `complete/fail_ai_job` đã đảm bảo.
- [ ] Kiểm tra tombstone trước khi ghi kết quả (bài đã xoá → `cancelled`).

### C4. Pipeline AI
- [ ] Chấm bài (`claude-sonnet-4-6`): nhận **toàn bộ bài viết** + đề + dữ liệu tham chiếu + ảnh gốc (nếu có). Không thay bài bằng features của Haiku.
- [ ] Schema JSON trả về: 4 tiêu chí `{score, rationale, evidence[], improvements[]}` + `summary`, `strengths`, `priority_actions`, `task_checks`.
- [ ] Task 1 dùng `task_achievement`, Task 2 dùng `task_response`; `overall_raw = sum/4`, `overall_display = round(raw*2)/2`.
- [ ] Enrichment (`claude-haiku-4-5`): 1 call gộp features + gợi ý lỗi → `essay_features`, `error_logs`.
- [ ] Thiếu dữ liệu tham chiếu → trả `needs_reference`, không tự bịa điểm tổng.
- [ ] JSON sai/cắt → không lưu điểm một phần; tối đa 1 lần sửa output rồi báo lỗi.
- [ ] Trích dẫn: dùng substring + paragraph index; backend tự xác định offset, không tin offset của model.
- [ ] Ghi `ai_usage`: input/output/cache tokens, `cache_creation_input_tokens`, `cache_read_input_tokens`, latency, model, `pricing_version`.
- [ ] Cache: khoá = owner + operation + task + bản viết nguyên bản + đề/dữ liệu + hash ảnh + locale + target band + model + version prompt/rubric/schema.
- [ ] Prompt injection: bài viết/đề là dữ liệu không tin cậy — không cấp tool cho model.

### C5. Quản lý chi phí & vận hành
- [ ] Bảng giá theo `pricing_version` để tính `estimated_cost_usd`; giá chưa cấu hình thì để null (không ghi $0 giả).
- [ ] Giới hạn đồng thời: tối đa 2 job AI/user đang chạy; burst 6 lần/phút/user; IP limiter cho auth/upload.
- [ ] Log: chỉ request/job ID, model, latency, token, trạng thái, mã lỗi đã lọc. Không ghi nội dung bài vào log.
- [ ] Theo dõi: queue age, job timeout, provider error, cache hit, p95 latency.
- [ ] Alert khi `ai_usage` ước tính vượt ngân sách tháng.

---

## D. Việc cần làm ở frontend (đã làm trong nhánh `main`, cần đồng bộ)

- [x] Kho đề bài chỉ nhóm theo **chủ đề**; bỏ nhóm "theo dạng bài" và bỏ mục "ĐỀ THEO BỘ".
- [x] Bấm một chủ đề → mở danh sách đề của chủ đề đó để chọn.
- [x] Đề hiển thị ngay trên đầu vùng viết (kể cả khi chuyển sang tab *Bài viết* trên mobile).
- [x] Frontend đọc đề từ `public.prompts` qua `src/lib/promptRepository.ts`.
- [ ] Merge nhánh `feature/db-foundation` vào `main` sau khi hoàn tất seed.
- [ ] Cập nhật `.env.local` của nhánh frontend (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
- [ ] Sau khi có auth: thay `store.tsx` (IndexedDB) bằng nguồn DB như mục B3.
