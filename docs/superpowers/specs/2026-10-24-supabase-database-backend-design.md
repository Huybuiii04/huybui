# Thiết kế: Database + Backend Supabase cho IELTS Writing Studio

> Ngày: 2026-10-24 · Trạng thái: chờ duyệt · Bám theo `docs/superpowers/specs/2026-10-24-ielts-ai-platform-design.md` (§5, §6, §7, §8) và `docs/superpowers/plans/2026-10-24-frontend.md`
> Tham chiếu thực tế: https://crackwriting.com/workbook (bóp 2 điểm bảo mật — xem §11)

---

## 1. Mục tiêu

Chuyển toàn bộ phần dữ liệu của app từ IndexedDB cục bộ sang Supabase, kèm đầy đủ tầng bảo mật (RLS), RPC transaction, Storage, Edge Functions và pipeline chấm bài bằng Anthropic — theo đúng schema đã định nghĩa trong spec nền tảng.

**Kết quả cuối:** người dùng đăng ký bằng email/mật khẩu, viết bài, nháp tự lưu, chấm bài bằng AI thật, lưu từ vựng, ôn theo lịch 1/3/7/14/30/60 ngày — dữ liệu nằm trên server, không đọc được chéo giữa các user.

**Không nằm trong phạm vi:** thanh toán (Paddle/ledger), OAuth ngoài, tính năng AI chưa có trong spec, việc viết lại UI hiện có (chỉ sửa tối thiểu cho khớp data layer).

## 2. Sự thật nền (đã kiểm chứng, 2026-10-24)

| Mục | Giá trị |
|---|---|
| Project | `fjlyjaomuxotqqjvugtv` (ap-south-1, Mumbai) |
| PostgreSQL | 17.11, role `postgres` **không** superuser (bypassrls=true) |
| Kết nối | `db.<ref>.supabase.co` **chỉ có AAAA (IPv6)** → máy dev không có IPv6 → dùng pooler: `aws-0-ap-south-1.pooler.supabase.com:5432`, user `postgres.fjlyjaomuxotqqjvugtv` |
| Hiện trạng DB | `public` **0 bảng**, `auth.users` **0 user**, `storage` 0 bucket, 0 storage policy |
| Extension đã có | `pgcrypto`, `uuid-ossp`, `vault` (`supabase_vault` 0.3.1), `plpgsql`, `pg_stat_statements` |
| Extension đã cài thêm trong lượt này | `pg_cron` 1.6.4, `pg_net` 0.20.4 (đủ để cron gọi Edge Function) |
| Schema `private` | đã tạo (chưa có trong project gốc) |
| Default privileges | `postgres` đã có default ACL cấp `arwdDxtm` cho `anon`, `authenticated`, `service_role` trên bảng mới → **phải REVOKE `anon` thủ công** cho bảng dữ liệu user |
| Vault | có `vault.create_secret`, `vault.update_secret`, view `vault.decrypted_secrets` (**không có** `vault.read_secret`) → cần wrapper `public.read_secret` (chỉ `service_role`) |
| Trigger `auth.users` | `postgres` **có** quyền `TRIGGER` trên `auth.users` → trigger tạo profile được (đã test) |
| `storage.buckets` | `postgres` có quyền INSERT → tạo bucket bằng SQL được (đã test) |
| Auth | `disable_signup=false`, `mailer_autoconfirm=false` → **cần tắt xác nhận email** |
| Key | publishable `sb_publishable_...` (client), secret `sb_secret_...` (chỉ dùng cho seed/admin, **không** đưa vào repo) |

## 3. Kiến trúc tổng thể

```
Browser (React SPA)
  ├─ Supabase JS: Auth (email+password) · PostgREST (bảng) · RPC · Storage signed URL
  └─ Edge Functions (/functions/v1/*)  ← gọi bằng apikey + Authorization: Bearer <user JWT>
        └─ Postgres (RLS) · Storage bucket · Anthropic API (Sonnet/Haiku) · Vault (ANTHROPIC_API_KEY)
```

Ranh giới quyền:
- **Client** chỉ có publishable key. Đọc/ghi bảng của chính mình qua RLS; mọi hành động có transaction hoặc quyền cao đi qua RPC/Edge Function.
- **Edge Function** dùng secret key (`service_role`, bypass RLS) nhưng **phải tự kiểm tra JWT, owner, trạng thái active** trước mọi truy vấn.
- **Worker AI** chỉ nhận `job_id` do server tạo; không thực thi SQL/URL từ payload model.

## 4. Phân module

| # | Module | Bàn giao | Phụ thuộc |
|---|---|---|---|
| **M0** | App shell | `src/main.tsx`, `src/App.tsx` (router), `src/styles.css` (tokens theo `design-system/ielts/MASTER.md`), sửa lỗi TS `BookOpenCheck` ở `Dashboard.tsx` | — |
| **M1** | Database foundation | 5 file migration SQL, RLS, RPC, Storage buckets, seed content | M0 |
| **M2** | Auth + data layer | Supabase client, AuthProvider, trang login/signup, `store.tsx` viết lại, types từ schema | M1 |
| **M3** | Edge Functions | Queue/lease/worker, upload, submit, retry, delete, admin | M1, M2 |
| **M4** | AI pipeline | Chấm bài Sonnet, enrichment Haiku, 3 tool AI, `ai_usage`, cache | M3 |

**M0 là tiền đề bắt buộc**: hiện `npm run build` fail (`Dashboard.tsx` thiếu import `BookOpenCheck`) và `index.html` trỏ `/src/main.tsx` không tồn tại → không kiểm thử được module nào.

## 5. M1 — Database foundation

### 5.1 Cấu trúc thư mục

```
supabase/
  migrations/
    001_identity_access.sql      # profiles, user_access, private schema, helper
    002_content_storage.sql      # content_entries, content_translations, buckets, policies
    003_essays_jobs_grading.sql  # essays, revisions, assets, jobs, results, features, tools, usage
    004_learning.sql              # study_cards, review_events, error_logs, guide_progress
    005_admin_donate.sql          # donation_settings, admin_audit_logs, rate_limit_buckets
  seed/
    seed-content.ts               # đọc src/data/content.ts → upsert content_entries/translations
  README.md                      # thứ tự chạy, cách rollback, seed
```

Mỗi file **idempotent** (`if not exists`, `create or replace`) để chạy lại an toàn.

### 5.2 Bảng (public schema, 21 bảng)

**Nhóm tài khoản**
- `profiles`: `id uuid PK references auth.users(id) on delete cascade`, `display_name text`, `ui_locale text check in ('vi','en') default 'vi'`, `feedback_locale text check in ('vi','en') default 'vi'`, `timezone text default 'Asia/Ho_Chi_Minh'`, `target_band numeric(2,1) check (target_band between 0 and 9)`, `created_at/updated_at timestamptz`.
- `user_access`: `user_id uuid PK references auth.users(id)`, `role text check in ('user','admin') default 'user'`, `status text check in ('active','suspended') default 'active'`, `created_at`. **Chỉ server đọc/ghi.**

**Nhóm nội dung**
- `content_entries`: `id uuid PK`, `kind text check in ('vocabulary','template','sample','guide','exercise','prompt')`, `slug text not null`, `task_type text null check in ('task2','academic_task1','general_task1')`, `skill_tags text[] default '{}'`, `sort_order int default 0`, `status text check in ('draft','published','hidden') default 'published'`, `metadata jsonb default '{}'`, `created_at/updated_at`, unique `(kind, slug)`.
- `content_translations`: `entry_id uuid FK references content_entries on delete cascade`, `locale text check in ('vi','en')`, `title text`, `summary text`, `body text`, `updated_at`, PK `(entry_id, locale)`.
- `writing_prompts`: `id uuid PK`, `task_type text not null check (...)`, `subtype text`, `prompt_text text not null`, `reference_data text`, `status text check in ('draft','published','hidden') default 'published'`, `created_by uuid`, `created_at`.

**Nhóm viết & AI**
- `essays`: `id uuid PK`, `user_id uuid not null references auth.users(id)`, `prompt_id uuid null references writing_prompts`, `title text not null default ''`, `task_type text not null check (...)`, `subtype text`, `prompt_text text`, `body_text text`, `reference_data text`, `target_band numeric(2,1)`, `feedback_locale text check in ('vi','en')`, `draft jsonb not null default '{}'`, `draft_version int not null default 1`, `status text check in ('active','deleting','deleted') default 'active'`, `created_at/updated_at`. Index `(user_id, updated_at desc)`.
- `essay_revisions`: `id uuid PK`, `essay_id uuid not null`, `user_id uuid not null`, `revision_no int not null`, `task_type text not null`, `subtype text`, `prompt_text text`, `essay_text text not null`, `reference_data text`, `feedback_locale text`, `target_band numeric(2,1)`, `input_hash text not null`, `word_count int`, `created_at`, unique `(essay_id, revision_no)`. **Bất biến** — không UPDATE.
- `essay_assets`: `id uuid PK`, `user_id uuid not null`, `essay_id uuid not null`, `object_path text not null unique`, `mime_type text`, `byte_size bigint`, `content_hash text`, `status text check in ('pending','ready','deleted') default 'pending'`, `created_at`.
- `revision_assets`: PK `(revision_id, asset_id)`.
- `ai_jobs`: `id uuid PK`, `user_id uuid not null`, `revision_id uuid null`, `operation text not null`, `payload jsonb not null default '{}'`, `idempotency_key text not null`, `cache_key text`, `status text check in ('queued','processing','succeeded','retry_wait','failed','cancelled') default 'queued'`, `attempts int not null default 0`, `lease_token uuid`, `lease_until timestamptz`, `next_attempt_at timestamptz not null default now()`, `result_id uuid`, `error_code text`, `created_at/updated_at`, unique `(user_id, idempotency_key)`.
  Partial index: `where status in ('queued','retry_wait')` trên `(next_attempt_at, created_at)`; `where status='processing'` trên `(lease_until)`.
- `grading_results`: `id uuid PK`, `revision_id uuid not null unique references essay_revisions`, `task_achievement numeric(2,1) null`, `task_response numeric(2,1) null`, `coherence_ability numeric(2,1) null`, `lexical_resource numeric(2,1) null`, `grammatical_range numeric(2,1) null`, `overall_raw numeric(3,2)`, `overall_display numeric(2,1)`, `feedback jsonb not null`, `model text not null`, `prompt_version text not null`, `rubric_version text not null`, `schema_version text not null`, `created_at`. CHECK điểm 0–9 bước 0.5.
- `essay_features`: `revision_id uuid PK FK`, `model text`, `structure jsonb`, `lexical jsonb`, `grammar jsonb`, `schema_version text`, `created_at`.
- `ai_tool_results`: `id uuid PK`, `job_id uuid not null unique`, `user_id uuid not null`, `operation text not null`, `result jsonb not null`, `schema_version text`, `created_at`.
- `ai_usage`: `id uuid PK`, `job_id uuid null`, `provider_request_id text`, `model text`, `input_tokens int`, `output_tokens int`, `cache_creation_tokens int`, `cache_read_tokens int`, `estimated_cost_usd numeric(10,6) null`, `pricing_version text`, `latency_ms int`, `status text`, `created_at`. **Chỉ server ghi, client không đọc.**

**Nhóm học tập**
- `study_cards`: `id uuid PK`, `user_id uuid not null`, `kind text check in ('vocabulary','collocation','structure','error')`, `front text not null`, `back text not null`, `example text`, `tags text[] default '{}'`, `source_ref jsonb null`, `dedupe_key text not null`, `level int not null default 0`, `due_at timestamptz not null default now()`, `created_at/updated_at`, unique `(user_id, dedupe_key)`. Index `(user_id, due_at)`.
- `review_events`: `id uuid PK`, `user_id uuid not null`, `card_id uuid not null references study_cards on delete cascade`, `remembered boolean not null`, `reviewed_at timestamptz not null default now()`, `level_before int`, `level_after int`, `request_id uuid not null`, unique `(user_id, request_id)`.
- `error_logs`: `id uuid PK`, `user_id uuid not null`, `revision_id uuid null`, `fingerprint text not null`, `criterion text`, `category text`, `quote text`, `correction text`, `explanation text`, `skill_tags text[] default '{}'`, `created_at`, unique `(revision_id, fingerprint)`.
- `guide_progress`: `user_id uuid`, `entry_id uuid references content_entries`, `completed_at timestamptz`, PK `(user_id, entry_id)`.

**Nhóm vận hành**
- `donation_settings`: singleton (`id boolean primary key default true check (id)`), `methods jsonb`, `instructions jsonb`, `qr_path text`, `is_configured boolean default false`, `updated_at`.
- `admin_audit_logs`: `id uuid PK`, `actor_id uuid null`, `action text not null`, `target text`, `metadata jsonb default '{}'`, `created_at`.
- `rate_limit_buckets`: `key text`, `operation text`, `window_start timestamptz`, `counter int`, PK `(key, operation, window_start)`. **Không cấp quyền client.**

### 5.3 RLS

Bật `enable row level security` trên **mọi bảng public**. Helper trong schema `private` (không expose cho PostgREST):

```sql
create schema if not exists private;
create or replace function private.is_active_user()
returns boolean language sql stable security definer set search_path = private, public as $$
  select exists (
    select 1 from public.user_access
    where user_id = auth.uid() and status = 'active'
  );
$$;
revoke all on function private.is_active_user() from public, anon, authenticated;
grant execute on function private.is_active_user() to authenticated, service_role;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = private, public as $$
  select exists (
    select 1 from public.user_access
    where user_id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;
```

| Bảng | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `profiles` | `auth.uid() = id` | chủ sở hữu, **chỉ cột cho phép** (policy `WITH CHECK (auth.uid() = id)`) |
| `user_access` | `auth.uid() = user_id` | không (chỉ `service_role`) |
| `essays` | owner + `private.is_active_user()` | owner qua RPC `save_draft`; xóa qua Edge Function |
| `essay_revisions`, `essay_assets`, `revision_assets` | owner qua quan hệ | chỉ `service_role` |
| `ai_jobs`, `grading_results`, `essay_features`, `ai_tool_results` | owner | chỉ `service_role` |
| `ai_usage` | không (chỉ admin qua view/API đã lọc) | chỉ `service_role` |
| `study_cards`, `review_events` | owner | owner qua RPC |
| `error_logs` | owner | server tạo; owner xóa qua RPC |
| `content_entries`, `content_translations`, `writing_prompts` | anonymous chỉ `status='published'`; admin thấy hết | admin qua API |
| `guide_progress` | owner | owner qua RPC |
| `donation_settings` | mọi người (chỉ phần public) | admin qua API |
| `admin_audit_logs`, `rate_limit_buckets` | không cấp client | chỉ `service_role` |

Bổ sung: `revoke all on <bảng dữ liệu user> from anon` (default ACL của Supabase cấp `anon` toàn quyền — RLS là hàng rào chính, nhưng thu hẹp quyền là lớp phòng thủ thứ hai).

### 5.4 RPC (transaction, kiểm tra quyền trong DB)

| RPC | Input | Hành vi |
|---|---|---|
| `save_draft` | `p_essay_id uuid`, `p_expected_version int`, `p_draft jsonb`, `p_task_type text`, `p_title text` | tạo mới nếu `p_essay_id is null`; nếu `draft_version <> p_expected_version` → raise `conflict`; tăng version, trả `{essay_id, draft_version}` |
| `save_study_card` | `p_kind text`, `p_front text`, `p_back text`, `p_example text`, `p_dedupe_key text` | upsert theo `(user_id, dedupe_key)`; **lưu trùng không reset `level`/`due_at`** |
| `review_card` | `p_card_id uuid`, `p_remembered boolean`, `p_request_id uuid` | atomic: lock card `for update`, ghi `review_events` (unique `(user_id, request_id)` → replay trả kết quả cũ, không tăng cấp 2 lần), tính lịch 1/3/7/14/30/60 ngày, cập nhật `level`/`due_at` |
| `complete_guide` | `p_entry_id uuid`, `p_completed boolean` | upsert/xóa `guide_progress` |
| `claim_ai_job` | — | `FOR UPDATE SKIP LOCKED`, cấp `lease_token`, `lease_until = now() + 120s`, `attempts = attempts + 1` |
| `complete_ai_job` | `p_job_id uuid`, `p_lease_token uuid`, `p_result_id uuid` | commit **chỉ khi** lease token khớp và `status='processing'` |
| `fail_ai_job` | `p_job_id uuid`, `p_lease_token uuid`, `p_error_code text`, `p_retry boolean` | retry (backoff+jitter) hoặc `failed`/`cancelled` |

Lịch ôn dùng đúng hàm đã có ở `src/lib/learning.ts` (`scheduleReview`: 1/3/7/14/30/60 ngày, chưa nhớ → level 0 + hẹn 1 ngày), port sang PL/pgSQL để backend và frontend cho kết quả giống nhau.

**Mô hình bảo mật của RPC:** các RPC client gọi (`save_draft`, `save_study_card`, `review_card`, `complete_guide`) để mặc định **`security invoker`** — RLS của bảng đích áp dụng bình thường, không có đường vòng nào. Chỉ helper trong `private` mới là `security definer` (vì chúng cần đọc `user_access` để kiểm tra trạng thái active). Các RPC của worker (`claim_ai_job`, `complete_ai_job`, `fail_ai_job`) là `security definer` và chỉ `grant execute` cho `service_role`.

### 5.5 Storage

| Bucket | `public` | Quy tắc |
|---|---|---|
| `essay-images` | false | path `user_id/essay_id/asset_id.ext`; upload qua signed URL ngắn hạn do Edge Function cấp; không overwrite (`x-upsert: false`); policy: owner được đọc/ghi trong prefix `user_id/` của chính mình |
| `content-media` | false | admin upload; chỉ `service_role` đọc |
| `donation-media` | **true** | admin upload; chỉ chứa QR công khai |

Tạo bucket bằng SQL (`insert into storage.buckets` — `postgres` có quyền INSERT, đã kiểm chứng) + policy trên `storage.objects`.

### 5.6 Seed

- `supabase/seed/seed-content.ts`: đọc `src/data/content.ts` (`entries` + `guides`), upsert vào `content_entries` + `content_translations` (VI/EN). Chạy bằng secret key (service role) qua script Node, idempotent theo `(kind, slug)`.
- Không seed tài khoản admin có mật khẩu cố định (spec §5.3). Admin được cấp quyền bằng thao tác quản trị tin cậy.
- `donation_settings` seed với `is_configured = false` → trang donate hiện thông báo rõ ràng.

## 6. M2 — Auth + data layer

### 6.1 Files

| File | Nội dung |
|---|---|
| `src/lib/supabase.ts` | `createClient(url, publishableKey)` đọc từ `import.meta.env`; `persistSession: true`; `autoRefreshToken: true` |
| `src/vite-env.d.ts` | `/// <reference types="vite/client" />` — hiện thiếu, `import.meta.env` chưa typecheck được |
| `src/lib/auth.tsx` | `AuthProvider`: `onAuthStateChange`, `session`, `signIn`, `signUp`, `signOut`; tự tạo `profiles` + `user_access` khi có user mới (trigger trong DB là lớp chính) |
| `src/pages/Auth.tsx` | màn hình đăng nhập/đăng ký VI/EN |
| `src/lib/store.tsx` | **viết lại** — bỏ IndexedDB, đọc/ghi Supabase trực tiếp |
| `src/lib/types.ts` | type sinh từ schema (`supabase gen types typescript`) |
| `.env` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (đã gitignore) |
| `.env.example` | template, không chứa giá trị thật |

Trigger DB tạo profile (đáng tin hơn client):
```sql
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = private, public as $$
begin
  insert into public.profiles (id, display_name, ui_locale, target_band)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name',''), 'vi', 7.0);
  insert into public.user_access (user_id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();
```

### 6.2 Đổi API của store

`update(fn)` (updater toàn state) **không map được** sang DB → đổi sang op cấp entity. Chỉ 4 call site cần sửa:

| Cũ | Mới |
|---|---|
| `update(s => ({...s, drafts: s.drafts.filter(...)}))` (Essays.tsx) | `removeDraft(id)` |
| `update(s => ({...s, completed: [...]}))` (Guide.tsx) | `toggleGuideProgress(slug)` |
| `update(s => ({...s, cards: s.cards.filter(...)}))` (Learning.tsx) | `removeCard(id)` |
| `saveDraft(draft, expected)` | giữ nguyên chữ ký, gọi RPC `save_draft` |

`useStore()` trả `{ state, ready, error, saveDraft, addCard, review, removeDraft, removeCard, toggleGuideProgress, refresh }` — các page còn lại không đổi.

Mapping field:
| Cũ (local) | Mới (DB) |
|---|---|
| `Draft.title/text/prompt/reference/task/subtype/target` | `essays.title/body_text/prompt_text/reference_data/task_type/subtype/target_band` |
| `Draft.updatedAt: number` | `essays.updated_at timestamptz` + `draft_version` (optimistic concurrency) |
| `Draft.images: {name,url}[]` | `essay_assets` (object_path + mime) + signed URL ngắn hạn khi hiển thị; **không** lưu URL dài hạn |
| `Card.term/meaning/example/kind` | `study_cards.front/back/example/kind` |
| `Card.level/dueAt` | `study_cards.level/due_at` |
| `state.completed: string[]` | `guide_progress` (entry_id theo slug) |
| `state.profile` | `profiles` |

### 6.3 Bảo mật phía client

- Chỉ publishable key trong `VITE_*`. Secret key **không** bao giờ vào bundle.
- Route guard (`/app/*` cần đăng nhập) chỉ là UX; RLS là hàng rào thật.
- Xóa session → xóa cache client (không còn IndexedDB nên không cần bước dọn IndexedDB, nhưng phải clear state trong RAM).

## 7. M3 — Edge Functions

Nằm ở `supabase/functions/<name>/index.ts`, dùng Deno + `@supabase/supabase-js@2` (Edge runtime).

Quy ước chung:
- Xác thực: `Authorization: Bearer <user JWT>` → `auth.getUser()`; user bị `suspended` → 403.
- `apikey` header = publishable key; `Authorization` = user JWT (publishable key **không** gửi như Bearer JWT — chuẩn mới của supabase-js).
- Mọi lỗi trả `{code, message, requestId, retryAfter?}` — không trả stack trace, không trả provider secret.
- `requestId` = UUID, ghi vào log cùng `job_id`.

| Function | Input | Output | Quyền |
|---|---|---|---|
| `prepare-upload` | `{essayId, mimeType, byteSize, fileName}` | `{assetId, path, signedUrl}` (hạn ≤5 phút) | owner active; kiểm MIME/size; `x-upsert: false` |
| `submit-essay` | `{essayId, expectedDraftVersion, idempotencyKey, feedbackLocale, targetBand}` | `202 {revisionId, jobId, status}` | owner active; snapshot bất biến; trùng idempotency key → trả job cũ |
| `retry-job` | `{jobId, idempotencyKey}` | `202 {jobId}` | owner; chỉ job `failed` retryable |
| `run-writing-tool` | `{operation, revisionId?, text?, prompt?, assetIds?, idempotencyKey}` | `202 {jobId}` | owner; operation ∈ `magic-rewrite`, `argument-stress-test`, `critical-thinking` |
| `delete-essay` | `{essayId}` | `202 {status}` | owner; đánh dấu `deleting` → xóa Storage → xóa DB (retryable) |
| `delete-account` | `{confirm}` | `202 {status}` | owner; xóa dữ liệu, giữ `ai_usage` đã ẩn danh hóa |
| `admin-content` / `admin-donate` | `{action, payload}` | `{ok}` | `private.is_admin()` trong DB |
| `process-ai-jobs` | header nội bộ + `jobId` | `{status}` | **từ chối** token user thường; claim tối đa 1 job/lần |

`pg_cron` gọi `process-ai-jobs` mỗi 10 giây qua `pg_net` (đường phục hồi); API kích hoạt worker ngay là đường chính.

## 8. M4 — AI pipeline

### 8.1 Model & phiên bản

| Tác vụ | Model | Ghi chú |
|---|---|---|
| Chấm bài | `claude-sonnet-4-6` | Task 2 → Task Response; Task 1 → Task Achievement + cộng CC/LR/GRA |
| Features + error log + đọc ảnh | `claude-haiku-4-5` | Một call gộp sau khi chấm thành công |
| Magic rewrite | `claude-haiku-4-5` | Theo yêu cầu, đoạn được chọn |
| Argument stress test / Critical thinking | `claude-sonnet-4-6` | Cần phân tích lập luận |

Mỗi lần ghi kèm `model`, `prompt_version`, `rubric_version`, `schema_version`. Kết quả cũ giữ nguyên version.

### 8.2 Gọi provider

Dùng `@anthropic-ai/sdk` trong Edge Function với `messages.parse` + `jsonSchemaOutputFormat` (JSON schema ép theo `schema_version`) → không cần parse thủ công, output đã đúng shape. Timeout 90 giây; `stop_reason` bất thường → không lưu điểm một phần, báo lỗi rõ ràng.

Secret: `ANTHROPIC_API_KEY` lưu trong **Vault** (`vault.create_secret`), Edge Function đọc qua wrapper `public.read_secret(text)` — `SECURITY DEFINER`, `revoke` khỏi `public/anon/authenticated`, `grant` cho `service_role`; hoặc đặt bằng Edge Secrets của Supabase (Dashboard) nếu bạn muốn. **Không** đưa key vào `VITE_*`, không ghi vào repo.

### 8.3 Cache & chi phí

Cache key = hash của (owner, operation, task/subtype, text chuẩn hoá newline, prompt + reference data, hash ảnh, feedback locale, target band, model ID, prompt/rubric/schema version). Cache riêng tư theo user; kết quả đã lưu chính là cache. `input_hash` lưu ở `essay_revisions`.

### 8.4 Retry & rate limit

- Retry tối đa 3 lần, backoff + jitter, tôn trọng `Retry-After`; lỗi input/auth/config **không** retry.
- Tối đa 2 job AI đồng thời/user, burst 6 lần khởi tạo/phút/user (bảng `rate_limit_buckets`, server-only).
- Không giới hạn tổng số bài/ngày.

## 9. Kiểm thử & nghiệm thu

| Hạng mục | Cách kiểm | Tiêu chí |
|---|---|---|
| Migration | `psql -f` từng file trên DB trống | Chạy 2 lần không lỗi, không mất dữ liệu |
| Build | `npm run build` | `tsc --noEmit` + `vite build` sạch |
| Unit | `npm test` | Lịch ôn 1/3/7/14/30/60, đếm từ, validation ảnh |
| Smoke auth | đăng ký → đăng nhập → đăng xuất | Session qua localStorage (`sb-<ref>-auth-token`), profile tự tạo |
| Smoke nháp | viết → reload → 2 tab sửa cùng lúc | Nháp giữ sau reload; xung đột báo rõ, không ghi đè im lặng |
| Smoke ôn | lưu thẻ → ôn → kiểm tra `due_at` | Đúng lịch 1/3/7/14/30/60; replay không tăng cấp 2 lần |
| Smoke AI | gửi chấm 3 loại task | Có điểm 4 tiêu chí + feedback; `ai_usage` có số liệu; job không mất khi đóng tab |
| **RLS** | 2 user (A/B) + anon dùng PostgREST | B **không** đọc/ghi được bài/thẻ/job của A kể cả khi biết UUID; anon không thấy bảng user |
| Storage | upload ảnh | Signed URL hạn ngắn, không overwrite, user B không đọc được ảnh của A |
| Xóa | xóa bài / xóa tài khoản | Xóa đúng object + dữ liệu; job đang chạy không tái tạo dữ liệu đã xóa |

## 10. Cấu trúc file sau khi hoàn tất

```
src/
  main.tsx  App.tsx  styles.css  vite-env.d.ts
  lib/  supabase.ts  auth.tsx  store.tsx  types.ts  learning.ts
  pages/  Auth.tsx  Dashboard.tsx  Writing.tsx  Essays.tsx  Learning.tsx  Library.tsx  Guide.tsx  Settings.tsx
supabase/
  migrations/ 001..005.sql
  functions/ prepare-upload/ submit-essay/ retry-job/ run-writing-tool/
              delete-essay/ delete-account/ process-ai-jobs/ admin-content/ admin-donate/ _shared/
  seed/ seed-content.ts
  README.md
docs/
  superpowers/ specs/ plans/
```

## 11. Quyết định bảo mật — cố ý khác site tham chiếu

| Điểm | crackwriting.com | Ta làm | Lý do |
|---|---|---|---|
| API key AI | `VITE_OPENAI_API_KEY` **trong bundle frontend** | Secret trong Vault/Edge Secrets | Key AI lộ là lộ chi phí + lộ hàng đợi provider |
| Nguồn quyền admin | `user_metadata.role` → `user_roles` → `profiles.role` | `user_access.role` trong DB, chỉ server ghi | `user_metadata` do client tự sửa được; `user_metadata` là dữ liệu không đáng tin |
| RLS | Không kiểm chứng được từ bundle | Bật trên mọi bảng + policy owner + revoke `anon` | Spec §6 bắt buộc; bundle không cho thấy policy |
| Xung đột nháp | Không thấy cơ chế | `draft_version` + RPC `save_draft` trả mã `conflict` | Spec §3.1 yêu cầu chọn bản, không ghi đè im lặng |

Giữ lại từ reference: cấu trúc gọi Edge Function bằng `fetch` với `apikey` + `Authorization: Bearer <user JWT>`, session do supabase-js quản lý, upload qua signed URL với `x-upsert: false`, phân tách project DB/functions không cần sao chép (ta dùng chung một project).

## 12. Rủi ro & điểm cần xác nhận

| Rủi ro | Xử lý |
|---|---|
| SMTP mặc định của Supabase giới hạn số email | Tắt xác nhận email (Dashboard → Authentication → Email → bỏ "Confirm email") → không cần gửi mail khi đăng ký. Bật lại + SMTP riêng khi lên production |
| `vault.read_secret` không tồn tại (chỉ `create_secret`/`update_secret`) | Wrapper `public.read_secret` (`SECURITY DEFINER`, chỉ `service_role`) |
| Default ACL cấp `anon` toàn quyền trên bảng mới | `revoke all ... from anon` cho mọi bảng dữ liệu user; RLS là hàng rào chính |
| `pg_cron`/`pg_net` vừa cài ở project | Đã cài thành công; nếu gói gói hạn chặn cron thì worker chạy qua API trigger là đường chính, cron chỉ là phục hồi |
| `ANTHROPIC_API_KEY` chưa có | Module M4 chờ key; các module khác không phụ thuộc |
| Edge Function cần deploy | Deploy bằng `npx supabase functions deploy --project-ref fjlyjaomuxotqqjvugtv` (cần đăng nhập CLI) hoặc Dashboard |
| Workspace chưa có Git | Không commit được; ghi rõ trong báo cáo. Nên `git init` trước khi bắt đầu để có lịch sử migration |
