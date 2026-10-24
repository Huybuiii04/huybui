# Backend — trạng thái và việc còn phải làm

Cập nhật: **2026-10-24**, sau khi gộp `feature/db-foundation` vào `main`.

Trạng thái trên Supabase `fjlyjaomuxotqqjvugtv`: **24 bảng `public`**, RLS trên toàn bộ, 10 hàm `public`, 3 Storage bucket (`essay-images` riêng tư, `content-media` riêng tư, `donation-media` công khai) + bucket công khai `prompt-media`, 12 file migration chạy idempotent. Dữ liệu: **293 đề** (207 Task 2 theo 19 chủ đề từ `debai/` · 70 Task 1 Academic có ảnh Cambridge · 16 Task 1 General), 19 chủ đề, 7 dạng biểu đồ, 15 nội dung + 30 bản dịch, bảng giá AI 2 model.

---

## A. Database — đã xong

- [x] 12 migration, `npm run db:migrate` chạy lại nhiều lần không lỗi.
- [x] RLS trên 24 bảng; `anon` không đọc được bảng dữ liệu người dùng.
- [x] 10 hàm `public`: `save_draft`, `save_study_card`, `review_card`, `complete_guide`, `get_prompt`, `claim_ai_job`, `complete_ai_job`, `fail_ai_job`, `submit_essay_job`, `estimate_ai_cost`.
- [x] Trigger tạo `profiles` + `user_access` khi đăng ký.
- [x] `verify-schema.mjs` + `verify-rls.mjs`: 27 check, tất cả PASS.
- [x] 4 script kiểm chứng RLS (user A/B, anon, 409 version).
- [x] Dọn 21 đề Task 1 trùng (bộ cũ dựng SVG) — `npm run db:prune -- --apply`.
- [x] Rà secret: không còn credential nào trong cây hiện tại hay trong lịch sử git.

## B. Auth trên frontend — đã xong

- [x] `src/lib/supabase.ts` — client với `persistSession`, `autoRefreshToken`, `detectSessionInUrl`.
- [x] `src/lib/auth.tsx` — `AuthProvider` + `useAuth()`: đăng ký, đăng nhập, đăng xuất, gửi email reset, đặt lại mật khẩu, nạp hồ sơ.
- [x] `src/pages/Auth.tsx` — màn hình thật thay placeholder; lỗi hiện theo mã, không lộ raw error.
- [x] `src/components/RouteGuard.tsx` — bảo vệ `/app/**` và `/admin`; landing và `/library` công khai.
- [x] `src/lib/store.tsx` — Postgres là nguồn sự thật khi đã đăng nhập; IndexedDB làm cache offline; `migrateLocal()` đẩy dữ liệu cũ lên cloud.
- [x] `target_band` chuẩn hoá `numeric(2,1)`; tài khoản bị `suspended` bị chặn ghi.
- [x] `tests/auth.test.ts` + `tests/sync.test.ts` — 19 test thuần.

## C. Edge Functions + AI — đã deploy, chờ API key

- [x] C1: 10 function + `_shared` (client Anthropic, schema request, hợp đồng AI, cache key, storage).
- [x] C2: đủ 10 endpoint theo hợp đồng trong `supabase/functions/README.md`.
- [x] C3: worker `process-ai-jobs` — claim 1 job/lần, lease 120 giây, retry tối đa 3 lần có backoff.
- [x] C4: pipeline chấm 4 tiêu chí, enrichment riêng, cache theo owner + bản viết + ảnh + locale + model.
- [x] C5: bảng giá `ai_pricing` + `estimate_ai_cost()` ⇒ `estimated_cost_usd` là con số thật (null nếu chưa cấu hình).
- [x] `claim_ai_job()` lấy lại job hết lease; `submit_essay_job()` tạo revision + job trong một transaction.
- [x] Giới hạn 2 job AI đồng thời mỗi người dùng (trigger ở database).
- [x] **Đã deploy 10/10 function** — `npm run db:deploy`. Tất cả `status: ACTIVE`, xác thực JWT trả 401 đúng, worker từ chối sai secret đúng shape.
- [x] **Cron đã bật** — `npm run db:cron`, worker mỗi 10 giây, secret lưu trong `private.worker_secrets`.
- [x] **Đã kiểm chứng end-to-end**: bài viết → `submit-essay` → job `grade` → worker xử lý → `grading_results` trả `needs_reference` (không bịa điểm khi thiếu dữ liệu tham chiếu).
- [x] 31 test hợp đồng (`npm run test:edge`) + `deno check` sạch.
- [ ] **Thêm `ANTHROPIC_API_KEY`** — set trong Supabase (Edge Functions → Secrets) hoặc `.env.local` rồi `npm run db:deploy`. Tới lúc đó chấm bài và công cụ AI mới trả kết quả thật.
- [ ] `admin-content` chưa quản lý được bộ `prompts` (mới quản lý `content_entries`).
- [ ] Audit admin và mutation chưa nằm trong cùng transaction DB.
- [ ] `createSignedUploadUrl` dùng hạn mặc định của Storage; magic bytes/SHA-256 kiểm lúc submit.

## D. Việc còn lại

- [x] Merge nhánh `feature/db-foundation` vào `main`.
- [x] Cập nhật `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
- [x] Frontend nối Edge Function: `src/lib/ai.ts` gọi `submit-essay`, `run-writing-tool`, `admin-usage`.
- [x] Trang kết quả chấm: `src/components/GradingResult.tsx` + route `/app/essays/:id`.
- [x] Bảng `user_prompts` (đề do người dùng nhập) với `created_by` + RLS owner — migration 013.
- [x] Realtime bật cho `essays`, `study_cards`, `guide_progress`, `user_prompts` — migration 013.
- [x] Trang quản trị 4 tab: nội dung, người dùng, hàng đợi AI, token/chi phí — `src/pages/Admin.tsx`.
- [x] Xoá bài qua Edge Function `delete-essay` (tombstone → huỷ job → dọn Storage).
- [x] Nút *Thử lại* khi job AI lỗi (`retry-job`).
- [x] Test browser chạy được cả luồng đăng nhập (`TEST_EMAIL`/`TEST_PASSWORD`).
- [x] Tắt bước xác nhận email khi đăng ký (`npm run auth:autoconfirm`) — đăng ký xong là đăng nhập được ngay.
- [ ] Đổi mật khẩu DB và tạo lại secret key trong Dashboard (rủi ro: file plan cũ từng chứa mật khẩu).
- [ ] Cấu hình tài khoản/QR donate (trang donate hiện ghi rõ chưa cấu hình).
