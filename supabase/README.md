# Supabase — IELTS Writing Studio

Project: `fjlyjaomuxotqqjvugtv` · Region: `ap-south-1` (Mumbai) · PostgreSQL 17.11

## Kết nối

Host trực tiếp `db.fjlyjaomuxotqqjvugtv.supabase.co` **chỉ có AAAA (IPv6)**. Máy dev không có IPv6 nên phải dùng Supabase Pooler:

```
postgresql://postgres.fjlyjaomuxotqqjvugtv:<PASSWORD>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

Mật khẩu chứa `@` phải mã hoá `%40` trong URL. Script `supabase/scripts/migrate.mjs` tự tách URL và truyền mật khẩu qua biến `PGPASSWORD` của tiến trình con — **không** đưa mật khẩu lên dòng lệnh.

## Biến môi trường

`.env.local` (gitignored, copy từ `.env.example`):

| Biến | Dùng ở đâu | Có thể public? |
|---|---|---|
| `VITE_SUPABASE_URL` | frontend | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | frontend | ✅ (publishable key, gửi qua header `apikey`) |
| `SUPABASE_SECRET_KEY` | script seed/verify | ❌ chỉ trong `.env.local` |
| `SUPABASE_DB_PASSWORD` | psql | ❌ |
| `DATABASE_URL` | psql | ❌ |

## Lệnh

```bash
npm run db:migrate        # áp dụng tuần tự các file trong supabase/migrations/
npm run db:verify         # kiểm tra schema + RLS bằng 2 user thật
npm run db:seed           # nạp content_entries/translations + prompts/prompt_topics
npm run db:seed:content   # chỉ nội dung học tập
npm run db:seed:prompts   # chỉ bộ đề task 2 (debai)
```

Mọi lệnh dùng `--env-file-if-exists=.env.local` nên vẫn chạy được khi secret được inject qua biến môi trường (CI).

## Migration

Thứ tự chạy = thứ tự tên file. Tất cả idempotent, chạy lại an toàn.

| File | Nội dung |
|---|---|
| `001_identity_access.sql` | schema `private`, `profiles`, `user_access`, helper `is_active_user`/`is_admin`/`raise_http_error`, trigger tạo profile khi đăng ký |
| `002_content_storage.sql` | `content_entries`, `content_translations`, `writing_prompts`, 3 Storage bucket + policy |
| `003_essays_jobs_grading.sql` | `essays`, `essay_revisions`, `essay_assets`, `revision_assets`, `ai_jobs`, `grading_results`, `essay_features`, `ai_tool_results`, `ai_usage`, RPC `save_draft` + RPC worker |
| `004_learning.sql` | `study_cards`, `review_events`, `error_logs`, `guide_progress`, RPC `save_study_card`/`review_card`/`complete_guide` |
| `005_admin_donate.sql` | `donation_settings`, `admin_audit_logs`, `rate_limit_buckets` |
| `006_prompt_library.sql` | bảng `prompts` (đề luyện 3 loại task, biểu đồ jsonb) |
| `007_prompt_topics.sql` | bảng `prompt_topics` (danh sách chủ đề) |
| `008_prompt_chart_types.sql` | bảng `prompt_chart_types` (7 dạng biểu đồ Task 1 Academic) + trigger kiểm tra `subtype` |
| `009_prompt_backend.sql` | cột `updated_by`, index `(task, set_name)`, RPC `get_prompt(slug)`, quyền ghi cho admin, bỏ `writing_prompts` |

## Bảng

**Tài khoản:** `profiles`, `user_access`
**Nội dung:** `content_entries`, `content_translations`, `prompts`, `prompt_topics`, `prompt_chart_types`
**Viết & AI:** `essays`, `essay_revisions`, `essay_assets`, `revision_assets`, `ai_jobs`, `grading_results`, `essay_features`, `ai_tool_results`, `ai_usage`
**Học tập:** `study_cards`, `review_events`, `error_logs`, `guide_progress`
**Vận hành:** `donation_settings`, `admin_audit_logs`, `rate_limit_buckets`

## RPC

| RPC | Ai gọi | Mục đích |
|---|---|---|
| `save_draft` | client | lưu nháp, có optimistic concurrency (`draft_version`) → 409 khi xung đột |
| `save_study_card` | client | upsert thẻ theo `dedupe_key`, lưu trùng không reset lịch ôn |
| `review_card` | client | ôn thẻ: lịch 1/3/7/14/30/60 ngày, idempotent theo `request_id` |
| `complete_guide` | client | đánh dấu đã đọc guide |
| `get_prompt(slug)` | client | lấy một đề theo slug |
| `claim_ai_job` | worker | claim job bằng `FOR UPDATE SKIP LOCKED`, cấp lease 120s |
| `complete_ai_job` | worker | commit khi lease token khớp |
| `fail_ai_job` | worker | retry (tối đa 3 lần, backoff+jitter) hoặc đánh dấu failed |

## Mã lỗi trả về

PostgREST v14 **không** map SQLSTATE `40001` thành 409 — request sẽ treo tới khi gateway timeout. Mọi lỗi trả cho client dùng cơ chế chuẩn của Supabase:

```sql
raise sqlstate 'PGRST' using
  message = json_build_object('code','...','message','...','details','...','hint',null)::text,
  detail  = json_build_object('status',409,'headers',json_build_object())::text;
```

`detail` **bắt buộc** có `status` và `headers` — thiếu `headers` sẽ thành 500 (`PGRST121`). Xem `private.raise_http_error()`.

| Tình huống | HTTP |
|---|---|
| chưa đăng nhập | 401 |
| tài khoản bị suspend | 403 |
| sai dữ liệu đầu vào | 400 |
| không tìm thấy | 404 |
| xung đột phiên bản / thẻ chưa đến hạn | 409 |

## RLS

- Bật trên **mọi** bảng public. `anon` không có quyền đọc bảng dữ liệu riêng tư; chỉ đọc được nội dung `published`.
- `private.is_active_user()` kiểm tra `user_access.status = 'active'`; `private.is_admin()` kiểm tra role admin.
- Quyền admin nằm trong bảng `user_access` — **không** đọc từ `user_metadata` hay `localStorage`.
- `ai_usage` không cấp quyền cho `authenticated`, chỉ `service_role`.
- `anon` có thể *gọi* RPC client nhưng bên trong đều chặn bằng `auth.uid()` và trả 401.

## Storage

| Bucket | `public` | Quy tắc |
|---|---|---|
| `essay-images` | false | path `user_id/essay_id/asset_id.ext`, owner đọc/ghi trong prefix của mình |
| `content-media` | false | admin upload |
| `donation-media` | true | chỉ chứa QR công khai |

## Seed

- `supabase/seed/seed-content.ts` — nạp `src/data/content.ts` (9 entry + 6 guide → 15 `content_entries`, 30 `content_translations`).
- `supabase/seed/seed-prompts.mjs` — nạp `debai/IELTS_Task2_19_Topics_190_Prompts.json` (190 đề Task 2 · 19 chủ đề → `prompts` + `prompt_topics`).

Cả hai upsert nên chạy lại không nhân bản.

## Reset schema

```bash
psql "$DATABASE_URL" -c "drop schema public cascade; create schema public; grant all on schema public to postgres; grant all on schema public to anon; grant all on schema public to authenticated; grant all on schema public to service_role;"
```

Rồi chạy lại `npm run db:migrate` và `npm run db:seed`.
