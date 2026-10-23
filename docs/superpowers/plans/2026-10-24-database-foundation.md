# Database Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng nền tảng database trên Supabase cho `fjlyjaomuxotqqjvugtv` — 21 bảng, RLS trên mọi bảng, 7 RPC, 3 Storage bucket, seed nội dung — sẵn sàng cho auth và AI ở Plan 2/3.

**Architecture:** Migrations SQL thuần chạy bằng `psql` qua Supabase Pooler (IPv4). Mỗi file idempotent, bọc `begin/commit`. RLS là hàng rào thật; helper kiểm tra quyền nằm trong schema `private` (`security definer`) không expose cho PostgREST. RPC gọi từ client là `security invoker` (RLS áp dụng bình thường); RPC của worker là `security definer` chỉ `service_role`.

**Tech Stack:** PostgreSQL 17.11 (Supabase hosted, ap-south-1) · psql 17 · Supabase Auth (`auth.users`) · Storage (`storage.objects`) · Node 24 (script seed/verify)

**Spec:** `docs/superpowers/specs/2026-10-24-supabase-database-backend-design.md`

---

## ⚠️ Coordination bắt buộc

Workspace `D:\ielts` **đang được một session khác sửa song song** (đã tạo `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/pages/Other.tsx` lúc 04:35–04:41 ngày 24/10/2026). Trước khi sửa bất kỳ file nào trong `src/`, phải đọc lại file đó. Plan này **không sửa file trong `src/`** — chỉ thêm thư mục `supabase/` và file cấu hình root, nên va chạm gần như không có.

## Thông tin kết nối

| Biến | Giá trị |
|---|---|
| Pooler host | `aws-0-ap-south-1.pooler.supabase.com` (port 5432) |
| DB user | `postgres.fjlyjaomuxotqqjvugtv` |
| DB password | lấy từ biến môi trường `SUPABASE_DB_PASSWORD` — **không ghi vào file trong repo** |
| `DATABASE_URL` | `postgresql://postgres.fjlyjaomuxotqqjvugtv:<PASSWORD-URL-ENCODED>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres` |
| REST URL | `https://fjlyjaomuxotqqjvugtv.supabase.co` |
| Publishable key | `sb_publishable_KvzcWVDrX4lvKwybUsmPiA_t52fVLSS` (public, được phép trong `.env.example`) |
| Secret key | đặt trong `.env.local` (gitignored) dưới tên `SUPABASE_SECRET_KEY` — **không ghi giá trị vào file trong repo** |

> Mật khẩu chứa ký tự `@` → trong URL phải mã hoá thành `%40`.

---

## Cấu trúc file của plan này

```
supabase/
  migrations/
    001_identity_access.sql      # schema private, profiles, user_access, helper, trigger, RLS
    002_content_storage.sql      # content_entries, content_translations, writing_prompts, buckets, policies
    003_essays_jobs_grading.sql  # essays, revisions, assets, jobs, results, features, tools, usage + save_draft + job RPC
    004_learning.sql              # study_cards, review_events, error_logs, guide_progress + 3 RPC học tập
    005_admin_donate.sql          # donation_settings, admin_audit_logs, rate_limit_buckets
  scripts/
    migrate.mjs                  # chạy tuần tự các file .sql qua psql
    verify-schema.mjs            # kiểm tra bảng/RLS/policy/index bằng PostgREST + SQL
    verify-rls.mjs               # tạo 2 user thật, kiểm tra user B không đọc được dữ liệu user A
  seed/
    seed-content.ts              # nạp src/data/content.ts vào content_entries + content_translations
  README.md                      # thứ tự chạy, cách rollback, biến môi trường
.env.example                    # template biến (không chứa secret)
.env.local                      # file local có secret — gitignore
```

---

### Task 1: Khởi tạo Git và chốt baseline

**Files:**
- Create: `.gitignore` (sửa)
- Create: `supabase/.gitignore`

- [ ] **Step 1: Khởi tạo repo**

```bash
cd /d D:\ielts
git init
git branch -M main
```

Expected: `Initialized empty Git repository in D:/ielts/.git/`

- [ ] **Step 2: Bổ sung `.gitignore`**

Kiểm tra `D:\ielts\.gitignore` hiện có (nội dung: `node_modules/`, `dist/`, `.env`, `.env.*`, `!.env.example`, `test-results/`). Thêm vào cuối file:

```
# Supabase
.env.local
.env.seed
supabase/.temp/
```

- [ ] **Step 3: Tạo `supabase/.gitignore`**

```bash
mkdir supabase
printf '.temp/\n' > supabase/.gitignore
```

- [ ] **Step 4: Commit baseline**

```bash
git add -A
git commit -m "chore: baseline frontend before database work"
```

Expected: commit thành công, `git log --oneline` có 1 dòng.

> Nếu session song song đang ghi file, chạy `git status` trước `git add` và **không** commit file đang ghi dở (kiểm tra `git status` không có file nào vừa đổi trong 2 phút).

---

### Task 2: Client Supabase, biến môi trường, script migrate

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Create: `.env.local`
- Create: `supabase/scripts/migrate.mjs`

- [ ] **Step 1: Cài package**

```bash
npm install @supabase/supabase-js
```

Expected: thêm `@supabase/supabase-js` vào `dependencies`, `package-lock.json` được cập nhật. Kiểm tra version:

```bash
node -e "console.log(require('./node_modules/@supabase/supabase-js/package.json').version)"
```

Expected: `2.58.x` hoặc mới hơn.

- [ ] **Step 2: Tạo `.env.example`**

```dotenv
# Supabase project — public, an toàn để đưa vào repo
VITE_SUPABASE_URL=https://fjlyjaomuxotqqjvugtv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KvzcWVDrX4lvKwybUsmPiA_t52fVLSS

# Server-side only — KHÔNG đưa vào VITE_*, không commit
# SUPABASE_SECRET_KEY=
# SUPABASE_DB_PASSWORD=
# DATABASE_URL=
```

- [ ] **Step 3: Tạo `.env.local` (gitignored)**

```dotenv
VITE_SUPABASE_URL=https://fjlyjaomuxotqqjvugtv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KvzcWVDrX4lvKwybUsmPiA_t52fVLSS
SUPABASE_SECRET_KEY=<dán secret key của bạn vào .env.local>
SUPABASE_DB_PASSWORD=<dán mật khẩu DB của bạn vào .env.local>
DATABASE_URL=postgresql://postgres.fjlyjaomuxotqqjvugtv:<PASSWORD-URL-ENCODED>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

> `.env.local` khớp `.gitignore` (`.env.*`) nên không bị commit. Kiểm tra bằng `git status --porcelain` — `.env.local` **không** xuất hiện. Mật khẩu chứa ký tự `@` phải mã hoá `%40` trong `DATABASE_URL`.

- [ ] **Step 4: Thêm npm script**

Sửa `package.json`, thêm vào `scripts`:

```json
"db:migrate": "node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs",
"db:verify": "node --env-file-if-exists=.env.local supabase/scripts/verify-schema.mjs && node --env-file-if-exists=.env.local supabase/scripts/verify-rls.mjs",
"db:seed": "node --env-file-if-exists=.env.local supabase/seed/seed-content.ts"
```

- [ ] **Step 5: Tạo `supabase/scripts/migrate.mjs`**

```js
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rawUrl = process.env.DATABASE_URL
if (!rawUrl) {
  console.error('Thiếu DATABASE_URL. Chạy: npm run db:migrate (hoặc: node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs)')
  process.exit(1)
}

let config
try {
  const parsed = new URL(rawUrl)
  config = {
    host: parsed.hostname,
    port: parsed.port || '5432',
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
  }
} catch {
  console.error('DATABASE_URL không phải một URL hợp lệ.')
  process.exit(1)
}

if (!config.host || !config.user) {
  console.error('DATABASE_URL thiếu host hoặc user.')
  process.exit(1)
}

if (!config.password) {
  console.error('DATABASE_URL không chứa mật khẩu. Migration cần mật khẩu DB.')
  process.exit(1)
}

const dir = fileURLToPath(new URL('../migrations', import.meta.url))
let files = []
try {
  files = readdirSync(dir)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

if (!files.length) {
  console.error(`Không tìm thấy file .sql trong ${dir}`)
  process.exit(1)
}

const childEnv = { ...process.env, PGPASSWORD: config.password, PGCONNECT_TIMEOUT: '10' }
delete childEnv.DATABASE_URL

for (const file of files) {
  console.log(`\n=== ${file} ===`)
  const args = ['-h', config.host, '-p', config.port, '-U', config.user]
  if (config.database) args.push('-d', config.database)
  args.push('-w', '-v', 'ON_ERROR_STOP=1', '-f', join(dir, file))
  const result = spawnSync('psql', args, { stdio: 'inherit', env: childEnv })
  if (result.error) {
    console.error(`Không chạy được psql: ${result.error.message}`)
    process.exit(1)
  }
  if (result.status !== 0) {
    console.error(`Migration thất bại: ${file}`)
    process.exit(result.status ?? 1)
  }
}

console.log('\nĐã áp dụng tất cả migration.')
```

- [ ] **Step 6: Kiểm tra script chạy được (chưa có file migration)**

```bash
node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
```

Expected: `Không tìm thấy file .sql trong D:\ielts\supabase\migrations` và exit code 1. (Đây là hành vi đúng — Task 3 sẽ tạo file.)

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .env.example supabase/scripts/migrate.mjs supabase/.gitignore .gitignore
git commit -m "chore: add supabase client and migration runner"
```

---

### Task 3: Migration 001 — identity & access

**Files:**
- Create: `supabase/migrations/001_identity_access.sql`

- [ ] **Step 1: Viết kiểm chứng trước (kỳ vọng FAIL)**

Chạy trước khi tạo migration:

```bash
node --env-file-if-exists=.env.local -e "const u=process.env.DATABASE_URL; const {spawnSync}=require('child_process'); const r=spawnSync('psql',[u,'-t','-A','-c','select count(*) from information_schema.tables where table_schema='\''public'\'' and table_name='\''profiles'\'''],{encoding:'utf8'}); console.log('profiles count =', r.stdout.trim())"
```

Expected: `profiles count = 0`.

- [ ] **Step 2: Tạo `supabase/migrations/001_identity_access.sql`**

```sql
-- 001_identity_access.sql
-- Module: identity / access
-- Idempotent: chạy lại được nhiều lần.

begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function private.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  ui_locale text not null default 'vi' check (ui_locale in ('vi', 'en')),
  feedback_locale text not null default 'vi' check (feedback_locale in ('vi', 'en')),
  timezone text not null default 'Asia/Ho_Chi_Minh',
  target_band numeric(2, 1) not null default 7.0 check (target_band >= 0 and target_band <= 9),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_access (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create or replace function private.is_active_user()
returns boolean language sql stable security definer set search_path = private, public as $$
  select exists (
    select 1 from public.user_access
    where user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = private, public as $$
  select exists (
    select 1 from public.user_access
    where user_id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

revoke execute on function private.is_active_user() from public, anon;
revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_active_user() to authenticated, service_role;
grant execute on function private.is_admin() to authenticated, service_role;
grant execute on function private.set_updated_at() to authenticated, service_role;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = private, public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  insert into public.user_access (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_access enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select to authenticated using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists user_access_select_own on public.user_access;
create policy user_access_select_own on public.user_access
for select to authenticated using (user_id = auth.uid());

revoke all on public.profiles from anon;
revoke all on public.user_access from anon;
grant select on public.profiles to authenticated;
-- chỉ cho sửa các cột hồ sơ, không sửa được created_at/id (spec §5.3)
grant update (display_name, ui_locale, feedback_locale, timezone, target_band) on public.profiles to authenticated;
grant select on public.user_access to authenticated;

commit;
```

- [ ] **Step 3: Áp dụng migration**

```bash
node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
```

Expected: `=== 001_identity_access.sql ===` … `CREATE SCHEMA`, `CREATE TABLE`, `CREATE POLICY` … `COMMIT`. Không có dòng `ERROR`.

- [ ] **Step 4: Kiểm chứng (kỳ vọng PASS)**

```bash
node --env-file-if-exists=.env.local -e "
const {spawnSync}=require('child_process');
const q=[
 \"select count(*) from information_schema.tables where table_schema='public' and table_name in ('profiles','user_access')\",
 \"select relrowsecurity from pg_class where relname='profiles' and relnamespace='public'::regnamespace\",
 \"select count(*) from pg_policies where schemaname='public'\",
 \"select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private'\"
];
for (const s of q){const r=spawnSync('psql',[process.env.DATABASE_URL,'-t','-A','-c',s],{encoding:'utf8'});console.log(s.slice(0,60)+' => '+r.stdout.trim());}
"
```

Expected lần lượt: `2`, `t`, `3`, `4`.

- [ ] **Step 5: Chạy lại migration để chứng minh idempotent**

```bash
node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
```

Expected: không có `ERROR`; `CREATE TABLE` báo `already exists, skipping` — đây là thông báo thông thường của `create table if not exists`, không phải lỗi.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/001_identity_access.sql
git commit -m "feat(db): identity, access and private helpers with RLS"
```

---

### Task 4: Migration 002 — content & storage

**Files:**
- Create: `supabase/migrations/002_content_storage.sql`

- [ ] **Step 1: Tạo file migration**

```sql
-- 002_content_storage.sql
-- Module: content / storage

begin;

create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('vocabulary', 'template', 'sample', 'guide', 'exercise', 'prompt')),
  slug text not null,
  task_type text check (task_type in ('task2', 'academic_task1', 'general_task1')),
  skill_tags text[] not null default '{}',
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);

create table if not exists public.content_translations (
  entry_id uuid not null references public.content_entries (id) on delete cascade,
  locale text not null check (locale in ('vi', 'en')),
  title text not null default '',
  summary text not null default '',
  body text not null default '',
  updated_at timestamptz not null default now(),
  primary key (entry_id, locale)
);

create table if not exists public.writing_prompts (
  id uuid primary key default gen_random_uuid(),
  task_type text not null check (task_type in ('task2', 'academic_task1', 'general_task1')),
  subtype text not null default '',
  prompt_text text not null,
  reference_data text not null default '',
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists content_entries_kind_status_slug_idx on public.content_entries (kind, status, slug);
create index if not exists writing_prompts_task_status_idx on public.writing_prompts (task_type, status);

drop trigger if exists content_entries_set_updated_at on public.content_entries;
create trigger content_entries_set_updated_at
before update on public.content_entries
for each row execute function private.set_updated_at();

drop trigger if exists content_translations_set_updated_at on public.content_translations;
create trigger content_translations_set_updated_at
before update on public.content_translations
for each row execute function private.set_updated_at();

alter table public.content_entries enable row level security;
alter table public.content_translations enable row level security;
alter table public.writing_prompts enable row level security;

drop policy if exists content_entries_read on public.content_entries;
create policy content_entries_read on public.content_entries
for select to anon, authenticated
using (status = 'published' or private.is_admin());

drop policy if exists content_translations_read on public.content_translations;
create policy content_translations_read on public.content_translations
for select to anon, authenticated
using (exists (
  select 1 from public.content_entries entry
  where entry.id = entry_id and (entry.status = 'published' or private.is_admin())
));

drop policy if exists writing_prompts_read on public.writing_prompts;
create policy writing_prompts_read on public.writing_prompts
for select to anon, authenticated
using (status = 'published' or private.is_admin());

revoke all on public.content_entries from anon;
revoke all on public.content_translations from anon;
revoke all on public.writing_prompts from anon;
grant select on public.content_entries to anon, authenticated;
grant select on public.content_translations to anon, authenticated;
grant select on public.writing_prompts to anon, authenticated;

-- Storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('essay-images', 'essay-images', false, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('content-media', 'content-media', false, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('donation-media', 'donation-media', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists essay_images_owner_read on storage.objects;
create policy essay_images_owner_read on storage.objects
for select to authenticated
using (bucket_id = 'essay-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists essay_images_owner_insert on storage.objects;
create policy essay_images_owner_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'essay-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists essay_images_owner_delete on storage.objects;
create policy essay_images_owner_delete on storage.objects
for delete to authenticated
using (bucket_id = 'essay-images' and (storage.foldername(name))[1] = auth.uid()::text);

commit;
```

- [ ] **Step 2: Áp dụng migration**

```bash
node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
```

Expected: `=== 002_content_storage.sql ===` … `INSERT 0 3` (3 bucket) … `COMMIT`, không `ERROR`.

- [ ] **Step 3: Kiểm chứng**

```bash
node --env-file-if-exists=.env.local -e "
const {spawnSync}=require('child_process');
const q=[
 \"select count(*) from information_schema.tables where table_schema='public' and table_name in ('content_entries','content_translations','writing_prompts')\",
 \"select id||' public='||public from storage.buckets where id in ('essay-images','content-media','donation-media') order by id\",
 \"select count(*) from pg_policies where schemaname='storage'\"
];
for (const s of q){const r=spawnSync('psql',[process.env.DATABASE_URL,'-t','-A','-c',s],{encoding:'utf8'});console.log(r.stdout.trim());}
"
```

Expected:
```
3
content-media public=false
donation-media public=true
essay-images public=false
3
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/002_content_storage.sql
git commit -m "feat(db): content tables and private/public storage buckets"
```

---

### Task 5: Migration 003 — essays, jobs, grading

**Files:**
- Create: `supabase/migrations/003_essays_jobs_grading.sql`

- [ ] **Step 1: Tạo file migration (phần bảng)**

```sql
-- 003_essays_jobs_grading.sql
-- Module: essays / jobs / grading

begin;

create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt_id uuid references public.writing_prompts (id) on delete set null,
  title text not null default '',
  task_type text not null check (task_type in ('task2', 'academic_task1', 'general_task1')),
  subtype text not null default '',
  prompt_text text not null default '',
  body_text text not null default '',
  reference_data text not null default '',
  target_band numeric(2, 1) check (target_band >= 0 and target_band <= 9),
  feedback_locale text not null default 'vi' check (feedback_locale in ('vi', 'en')),
  draft jsonb not null default '{}'::jsonb,
  draft_version integer not null default 1,
  status text not null default 'active' check (status in ('active', 'deleting', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.essay_revisions (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid not null references public.essays (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  revision_no integer not null,
  task_type text not null check (task_type in ('task2', 'academic_task1', 'general_task1')),
  subtype text not null default '',
  prompt_text text not null default '',
  essay_text text not null,
  reference_data text not null default '',
  feedback_locale text not null default 'vi' check (feedback_locale in ('vi', 'en')),
  target_band numeric(2, 1) check (target_band >= 0 and target_band <= 9),
  input_hash text not null,
  word_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (essay_id, revision_no)
);

create table if not exists public.essay_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  essay_id uuid not null references public.essays (id) on delete cascade,
  object_path text not null unique,
  mime_type text not null default 'image/png',
  byte_size bigint not null default 0,
  content_hash text not null default '',
  status text not null default 'pending' check (status in ('pending', 'ready', 'deleted')),
  created_at timestamptz not null default now()
);

create table if not exists public.revision_assets (
  revision_id uuid not null references public.essay_revisions (id) on delete cascade,
  asset_id uuid not null references public.essay_assets (id) on delete cascade,
  primary key (revision_id, asset_id)
);

create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  revision_id uuid references public.essay_revisions (id) on delete set null,
  operation text not null check (operation in ('grade', 'enrich', 'magic-rewrite', 'argument-stress-test', 'critical-thinking', 'read-image')),
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  cache_key text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'succeeded', 'retry_wait', 'failed', 'cancelled')),
  attempts integer not null default 0,
  lease_token uuid,
  lease_until timestamptz,
  next_attempt_at timestamptz not null default now(),
  result_id uuid,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create table if not exists public.grading_results (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null unique references public.essay_revisions (id) on delete cascade,
  task_achievement numeric(2, 1) check (task_achievement >= 0 and task_achievement <= 9),
  task_response numeric(2, 1) check (task_response >= 0 and task_response <= 9),
  coherence_ability numeric(2, 1) check (coherence_ability >= 0 and coherence_ability <= 9),
  lexical_resource numeric(2, 1) check (lexical_resource >= 0 and lexical_resource <= 9),
  grammatical_range numeric(2, 1) check (grammatical_range >= 0 and grammatical_range <= 9),
  overall_raw numeric(4, 2),
  overall_display numeric(2, 1),
  feedback jsonb not null default '{}'::jsonb,
  model text not null,
  prompt_version text not null,
  rubric_version text not null,
  schema_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.essay_features (
  revision_id uuid primary key references public.essay_revisions (id) on delete cascade,
  model text not null,
  structure jsonb not null default '{}'::jsonb,
  lexical jsonb not null default '{}'::jsonb,
  grammar jsonb not null default '{}'::jsonb,
  schema_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_tool_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.ai_jobs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  operation text not null,
  result jsonb not null default '{}'::jsonb,
  schema_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.ai_jobs (id) on delete set null,
  provider_request_id text not null default '',
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cache_creation_tokens integer not null default 0,
  cache_read_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 6),
  pricing_version text not null default 'v1',
  latency_ms integer not null default 0,
  status text not null default 'ok' check (status in ('ok', 'error')),
  created_at timestamptz not null default now()
);

create index if not exists essays_user_updated_idx on public.essays (user_id, updated_at desc);
create index if not exists essay_revisions_user_idx on public.essay_revisions (user_id, created_at desc);
create index if not exists essay_assets_essay_idx on public.essay_assets (essay_id);
create index if not exists ai_jobs_queue_idx on public.ai_jobs (next_attempt_at, created_at) where status in ('queued', 'retry_wait');
create index if not exists ai_jobs_lease_idx on public.ai_jobs (lease_until) where status = 'processing';
create index if not exists ai_usage_job_idx on public.ai_usage (job_id);
create index if not exists ai_usage_created_idx on public.ai_usage (created_at desc);
```

- [ ] **Step 2: Thêm RLS + grants vào cuối file (trước `commit;`)**

```sql
alter table public.essays enable row level security;
alter table public.essay_revisions enable row level security;
alter table public.essay_assets enable row level security;
alter table public.revision_assets enable row level security;
alter table public.ai_jobs enable row level security;
alter table public.grading_results enable row level security;
alter table public.essay_features enable row level security;
alter table public.ai_tool_results enable row level security;
alter table public.ai_usage enable row level security;

drop policy if exists essays_read_own on public.essays;
create policy essays_read_own on public.essays
for select to authenticated using (user_id = auth.uid() and private.is_active_user());

drop policy if exists essays_insert_own on public.essays;
create policy essays_insert_own on public.essays
for insert to authenticated with check (user_id = auth.uid() and private.is_active_user());

drop policy if exists essays_update_own on public.essays;
create policy essays_update_own on public.essays
for update to authenticated using (user_id = auth.uid() and private.is_active_user())
with check (user_id = auth.uid() and private.is_active_user());

drop policy if exists essays_delete_own on public.essays;
create policy essays_delete_own on public.essays
for delete to authenticated using (user_id = auth.uid() and private.is_active_user());

drop policy if exists essay_revisions_read_own on public.essay_revisions;
create policy essay_revisions_read_own on public.essay_revisions
for select to authenticated using (user_id = auth.uid());

drop policy if exists essay_assets_read_own on public.essay_assets;
create policy essay_assets_read_own on public.essay_assets
for select to authenticated using (user_id = auth.uid());

drop policy if exists revision_assets_read_own on public.revision_assets;
create policy revision_assets_read_own on public.revision_assets
for select to authenticated using (
  exists (select 1 from public.essay_revisions revision
          where revision.id = revision_id and revision.user_id = auth.uid())
);

drop policy if exists ai_jobs_read_own on public.ai_jobs;
create policy ai_jobs_read_own on public.ai_jobs
for select to authenticated using (user_id = auth.uid());

drop policy if exists grading_results_read_own on public.grading_results;
create policy grading_results_read_own on public.grading_results
for select to authenticated using (
  exists (select 1 from public.essay_revisions revision
          where revision.id = revision_id and revision.user_id = auth.uid())
);

drop policy if exists essay_features_read_own on public.essay_features;
create policy essay_features_read_own on public.essay_features
for select to authenticated using (
  exists (select 1 from public.essay_revisions revision
          where revision.id = revision_id and revision.user_id = auth.uid())
);

drop policy if exists ai_tool_results_read_own on public.ai_tool_results;
create policy ai_tool_results_read_own on public.ai_tool_results
for select to authenticated using (user_id = auth.uid());

revoke all on public.essays from anon;
revoke all on public.essay_revisions from anon;
revoke all on public.essay_assets from anon;
revoke all on public.revision_assets from anon;
revoke all on public.ai_jobs from anon;
revoke all on public.grading_results from anon;
revoke all on public.essay_features from anon;
revoke all on public.ai_tool_results from anon;
revoke all on public.ai_usage from anon;
revoke all on public.ai_usage from authenticated;

grant select, insert, update, delete on public.essays to authenticated;
grant select on public.essay_revisions to authenticated;
grant select on public.essay_assets to authenticated;
grant select on public.revision_assets to authenticated;
grant select on public.ai_jobs to authenticated;
grant select on public.grading_results to authenticated;
grant select on public.essay_features to authenticated;
grant select on public.ai_tool_results to authenticated;
```

> `ai_usage` cố ý **không** cấp quyền cho `authenticated` — chỉ `service_role` (bypass RLS) đọc/ghi, admin sẽ xem qua Edge Function đã lọc ở Plan 3.

- [ ] **Step 3: Thêm RPC `save_draft` và các RPC worker (trước `commit;`)**

```sql
create or replace function public.save_draft(
  p_essay_id uuid default null,
  p_expected_version integer default null,
  p_task_type text default null,
  p_subtype text default null,
  p_title text default null,
  p_prompt_text text default null,
  p_body_text text default null,
  p_reference_data text default null,
  p_target_band numeric default null,
  p_feedback_locale text default null,
  p_draft jsonb default null
) returns jsonb
language plpgsql
set search_path = public, private
as $$
declare
  v_user uuid := auth.uid();
  v_essay public.essays;
  v_version integer;
begin
  if v_user is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;
  if not private.is_active_user() then
    raise exception 'suspended' using errcode = '42501';
  end if;
  if p_task_type is null or p_task_type not in ('task2', 'academic_task1', 'general_task1') then
    raise exception 'invalid task type' using errcode = '22023';
  end if;

  if p_essay_id is null then
    insert into public.essays (
      user_id, title, task_type, subtype, prompt_text, body_text,
      reference_data, target_band, feedback_locale, draft
    ) values (
      v_user, coalesce(p_title, ''), p_task_type, coalesce(p_subtype, ''),
      coalesce(p_prompt_text, ''), coalesce(p_body_text, ''),
      coalesce(p_reference_data, ''), p_target_band,
      coalesce(p_feedback_locale, 'vi'), coalesce(p_draft, '{}'::jsonb)
    ) returning * into v_essay;
    v_version := v_essay.draft_version;
  else
    select * into v_essay from public.essays
    where id = p_essay_id and user_id = v_user
    for update;
    if not found then
      raise exception 'essay not found' using errcode = 'P0002';
    end if;
    if v_essay.draft_version <> coalesce(p_expected_version, -1) then
      raise exception 'conflict' using errcode = '40001';
    end if;
    update public.essays set
      title = coalesce(p_title, v_essay.title),
      task_type = p_task_type,
      subtype = coalesce(p_subtype, v_essay.subtype),
      prompt_text = coalesce(p_prompt_text, v_essay.prompt_text),
      body_text = coalesce(p_body_text, v_essay.body_text),
      reference_data = coalesce(p_reference_data, v_essay.reference_data),
      target_band = coalesce(p_target_band, v_essay.target_band),
      feedback_locale = coalesce(p_feedback_locale, v_essay.feedback_locale),
      draft = coalesce(p_draft, v_essay.draft),
      draft_version = v_essay.draft_version + 1,
      updated_at = now()
    where id = v_essay.id
    returning * into v_essay;
    v_version := v_essay.draft_version;
  end if;

  return jsonb_build_object('essay_id', v_essay.id, 'draft_version', v_version);
end;
$$;

create or replace function public.claim_ai_job()
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job public.ai_jobs;
begin
  select * into v_job from public.ai_jobs
  where status in ('queued', 'retry_wait')
    and next_attempt_at <= now()
  order by next_attempt_at, created_at
  for update skip locked
  limit 1;
  if not found then
    return null;
  end if;
  update public.ai_jobs set
    status = 'processing',
    attempts = attempts + 1,
    lease_token = gen_random_uuid(),
    lease_until = now() + interval '120 seconds',
    updated_at = now()
  where id = v_job.id
  returning * into v_job;
  return jsonb_build_object(
    'job_id', v_job.id,
    'user_id', v_job.user_id,
    'revision_id', v_job.revision_id,
    'operation', v_job.operation,
    'payload', v_job.payload,
    'cache_key', v_job.cache_key,
    'attempts', v_job.attempts,
    'lease_token', v_job.lease_token
  );
end;
$$;

create or replace function public.complete_ai_job(p_job_id uuid, p_lease_token uuid, p_result_id uuid default null)
returns boolean
language plpgsql
security definer
set search_path = public, private
as $$
begin
  update public.ai_jobs set
    status = 'succeeded',
    result_id = coalesce(p_result_id, result_id),
    lease_token = null,
    lease_until = null,
    error_code = null,
    updated_at = now()
  where id = p_job_id and lease_token = p_lease_token and status = 'processing';
  return found;
end;
$$;

create or replace function public.fail_ai_job(
  p_job_id uuid,
  p_lease_token uuid,
  p_error_code text,
  p_retry boolean default false,
  p_retry_after_seconds integer default null
) returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job public.ai_jobs;
  v_delay integer;
begin
  select * into v_job from public.ai_jobs
  where id = p_job_id and lease_token = p_lease_token and status = 'processing'
  for update;
  if not found then
    return jsonb_build_object('updated', false);
  end if;

  if p_retry and v_job.attempts < 3 then
    v_delay := coalesce(p_retry_after_seconds, least(300, (2 ^ v_job.attempts) * 10 + floor(random() * 10)));
    update public.ai_jobs set
      status = 'retry_wait',
      next_attempt_at = now() + make_interval(secs => v_delay),
      lease_token = null,
      lease_until = null,
      error_code = p_error_code,
      updated_at = now()
    where id = v_job.id;
    return jsonb_build_object('updated', true, 'status', 'retry_wait', 'delay_seconds', v_delay);
  end if;

  update public.ai_jobs set
    status = 'failed',
    lease_token = null,
    lease_until = null,
    error_code = p_error_code,
    updated_at = now()
  where id = v_job.id;
  return jsonb_build_object('updated', true, 'status', 'failed');
end;
$$;

revoke all on function public.claim_ai_job() from public, anon, authenticated;
revoke all on function public.complete_ai_job(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.fail_ai_job(uuid, uuid, text, boolean, integer) from public, anon, authenticated;
grant execute on function public.claim_ai_job() to service_role;
grant execute on function public.complete_ai_job(uuid, uuid, uuid) to service_role;
grant execute on function public.fail_ai_job(uuid, uuid, text, boolean, integer) to service_role;
grant execute on function public.save_draft(uuid, integer, text, text, text, text, text, text, numeric, text, jsonb) to authenticated;

commit;
```

- [ ] **Step 4: Áp dụng migration**

```bash
node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
```

Expected: `=== 003_essays_jobs_grading.sql ===` … `CREATE TABLE` ×9 … `CREATE FUNCTION` ×4 … `COMMIT`, không `ERROR`.

- [ ] **Step 5: Kiểm chứng**

```bash
node --env-file-if-exists=.env.local -e "
const {spawnSync}=require('child_process');
const q=[
 \"select count(*) from information_schema.tables where table_schema='public' and table_name in ('essays','essay_revisions','essay_assets','revision_assets','ai_jobs','grading_results','essay_features','ai_tool_results','ai_usage')\",
 \"select count(*) from pg_policies where schemaname='public' and tablename in ('essays','ai_jobs','grading_results')\",
 \"select proname||' security_definer='||prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname in ('save_draft','claim_ai_job','complete_ai_job','fail_ai_job') order by proname\"
];
for (const s of q){const r=spawnSync('psql',[process.env.DATABASE_URL,'-t','-A','-c',s],{encoding:'utf8'});console.log(r.stdout.trim());console.log('---');}
"
```

Expected:
```
9
7
claim_ai_job security_definer=true
complete_ai_job security_definer=true
fail_ai_job security_definer=true
save_draft security_definer=false
---
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/003_essays_jobs_grading.sql
git commit -m "feat(db): essays, revisions, AI job queue and grading tables"
```

---

### Task 6: Migration 004 — learning

**Files:**
- Create: `supabase/migrations/004_learning.sql`

- [ ] **Step 1: Tạo file migration**

```sql
-- 004_learning.sql
-- Module: learning (study cards, review events, error logs, guide progress)

begin;

create table if not exists public.study_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('vocabulary', 'collocation', 'structure', 'error')),
  front text not null,
  back text not null,
  example text not null default '',
  tags text[] not null default '{}',
  source_ref jsonb,
  dedupe_key text not null,
  level integer not null default 0 check (level >= 0 and level <= 6),
  due_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create table if not exists public.review_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id uuid not null references public.study_cards (id) on delete cascade,
  remembered boolean not null,
  reviewed_at timestamptz not null default now(),
  level_before integer not null,
  level_after integer not null,
  request_id uuid not null,
  unique (user_id, request_id)
);

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  revision_id uuid references public.essay_revisions (id) on delete cascade,
  fingerprint text not null,
  criterion text not null default '',
  category text not null default '',
  quote text not null default '',
  correction text not null default '',
  explanation text not null default '',
  skill_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (revision_id, fingerprint)
);

create table if not exists public.guide_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_id uuid not null references public.content_entries (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, entry_id)
);

create index if not exists study_cards_user_due_idx on public.study_cards (user_id, due_at);
create index if not exists review_events_card_idx on public.review_events (card_id);
create index if not exists error_logs_user_created_idx on public.error_logs (user_id, created_at desc);

drop trigger if exists study_cards_set_updated_at on public.study_cards;
create trigger study_cards_set_updated_at
before update on public.study_cards
for each row execute function private.set_updated_at();

alter table public.study_cards enable row level security;
alter table public.review_events enable row level security;
alter table public.error_logs enable row level security;
alter table public.guide_progress enable row level security;

drop policy if exists study_cards_read_own on public.study_cards;
create policy study_cards_read_own on public.study_cards
for select to authenticated using (user_id = auth.uid());

drop policy if exists study_cards_write_own on public.study_cards;
create policy study_cards_write_own on public.study_cards
for insert to authenticated with check (user_id = auth.uid() and private.is_active_user());

drop policy if exists study_cards_update_own on public.study_cards;
create policy study_cards_update_own on public.study_cards
for update to authenticated using (user_id = auth.uid() and private.is_active_user())
with check (user_id = auth.uid() and private.is_active_user());

drop policy if exists study_cards_delete_own on public.study_cards;
create policy study_cards_delete_own on public.study_cards
for delete to authenticated using (user_id = auth.uid() and private.is_active_user());

drop policy if exists review_events_read_own on public.review_events;
create policy review_events_read_own on public.review_events
for select to authenticated using (user_id = auth.uid());

drop policy if exists error_logs_read_own on public.error_logs;
create policy error_logs_read_own on public.error_logs
for select to authenticated using (user_id = auth.uid());

drop policy if exists error_logs_delete_own on public.error_logs;
create policy error_logs_delete_own on public.error_logs
for delete to authenticated using (user_id = auth.uid());

drop policy if exists guide_progress_read_own on public.guide_progress;
create policy guide_progress_read_own on public.guide_progress
for select to authenticated using (user_id = auth.uid());

revoke all on public.study_cards from anon;
revoke all on public.review_events from anon;
revoke all on public.error_logs from anon;
revoke all on public.guide_progress from anon;
grant select, insert, update, delete on public.study_cards to authenticated;
grant select on public.review_events to authenticated;
grant select, delete on public.error_logs to authenticated;
grant select, insert, delete on public.guide_progress to authenticated;

create or replace function public.save_study_card(
  p_kind text,
  p_front text,
  p_back text,
  p_example text default '',
  p_dedupe_key text default null,
  p_tags text[] default '{}'
) returns jsonb
language plpgsql
set search_path = public, private
as $$
declare
  v_user uuid := auth.uid();
  v_key text;
  v_card public.study_cards;
begin
  if v_user is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;
  if not private.is_active_user() then
    raise exception 'suspended' using errcode = '42501';
  end if;
  if p_kind is null or p_kind not in ('vocabulary', 'collocation', 'structure', 'error') then
    raise exception 'invalid card kind' using errcode = '22023';
  end if;
  if coalesce(btrim(p_front), '') = '' or coalesce(btrim(p_back), '') = '' then
    raise exception 'front and back are required' using errcode = '22023';
  end if;

  v_key := coalesce(
    nullif(p_dedupe_key, ''),
    lower(btrim(p_front)) || '::' || p_kind
  );

  insert into public.study_cards (user_id, kind, front, back, example, tags, dedupe_key)
  values (v_user, p_kind, btrim(p_front), btrim(p_back), coalesce(p_example, ''), coalesce(p_tags, '{}'), v_key)
  on conflict (user_id, dedupe_key) do update set
    back = excluded.back,
    example = excluded.example,
    tags = excluded.tags,
    updated_at = now()
  returning * into v_card;

  return jsonb_build_object(
    'card_id', v_card.id,
    'level', v_card.level,
    'due_at', v_card.due_at,
    'created', v_card.created_at = v_card.updated_at
  );
end;
$$;

create or replace function public.review_card(
  p_card_id uuid,
  p_remembered boolean,
  p_request_id uuid
) returns jsonb
language plpgsql
set search_path = public, private
as $$
declare
  v_user uuid := auth.uid();
  v_card public.study_cards;
  v_before integer;
  v_after integer;
  v_days integer;
  v_due timestamptz;
  v_replay integer;
begin
  if v_user is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;
  if not private.is_active_user() then
    raise exception 'suspended' using errcode = '42501';
  end if;

  select level_after into v_replay
  from public.review_events
  where user_id = v_user and request_id = p_request_id;
  if v_replay is not null then
    select level, due_at into v_replay, v_due
    from public.study_cards where id = p_card_id and user_id = v_user;
    return jsonb_build_object('level', v_replay, 'due_at', v_due, 'replayed', true);
  end if;

  select * into v_card from public.study_cards
  where id = p_card_id and user_id = v_user
  for update;
  if not found then
    raise exception 'card not found' using errcode = 'P0002';
  end if;
  if v_card.due_at > now() then
    raise exception 'card not due' using errcode = '22023';
  end if;

  v_before := v_card.level;
  if p_remembered then
    v_after := least(6, greatest(0, v_before) + 1);
  else
    v_after := 0;
  end if;
  v_days := case v_after
    when 0 then 1 when 1 then 1 when 2 then 3 when 3 then 7
    when 4 then 14 when 5 when 30 else 60
  end;
  v_due := now() + make_interval(days => v_days);

  update public.study_cards set
    level = v_after, due_at = v_due, updated_at = now()
  where id = v_card.id;

  insert into public.review_events (user_id, card_id, remembered, level_before, level_after, request_id)
  values (v_user, v_card.id, coalesce(p_remembered, false), v_before, v_after, p_request_id);

  return jsonb_build_object('level', v_after, 'due_at', v_due, 'replayed', false);
end;
$$;

create or replace function public.complete_guide(p_entry_id uuid, p_completed boolean default true)
returns boolean
language plpgsql
set search_path = public, private
as $$
begin
  if auth.uid() is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;
  if p_completed then
    insert into public.guide_progress (user_id, entry_id)
    values (auth.uid(), p_entry_id)
    on conflict (user_id, entry_id) do update set completed_at = now();
  else
    delete from public.guide_progress where user_id = auth.uid() and entry_id = p_entry_id;
  end if;
  return true;
end;
$$;

grant execute on function public.save_study_card(text, text, text, text, text, text[]) to authenticated;
grant execute on function public.review_card(uuid, boolean, uuid) to authenticated;
grant execute on function public.complete_guide(uuid, boolean) to authenticated;

commit;
```

- [ ] **Step 2: Áp dụng + kiểm chứng**

```bash
node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
node --env-file-if-exists=.env.local -e "
const {spawnSync}=require('child_process');
const q=[
 \"select count(*) from information_schema.tables where table_schema='public' and table_name in ('study_cards','review_events','error_logs','guide_progress')\",
 \"select proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname in ('save_study_card','review_card','complete_guide') order by proname\"
];
for (const s of q){const r=spawnSync('psql',[process.env.DATABASE_URL,'-t','-A','-c',s],{encoding:'utf8'});console.log(r.stdout.trim());console.log('---');}
"
```

Expected: `4`, rồi `complete_guide`, `review_card`, `save_study_card`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/004_learning.sql
git commit -m "feat(db): study cards, review events, error logs and guide progress"
```

---

### Task 7: Migration 005 — admin & donate

**Files:**
- Create: `supabase/migrations/005_admin_donate.sql`

- [ ] **Step 1: Tạo file migration**

```sql
-- 005_admin_donate.sql
-- Module: admin / donate / rate limit

begin;

create table if not exists public.donation_settings (
  id boolean primary key default true check (id),
  methods jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '{}'::jsonb,
  qr_path text not null default '',
  is_configured boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  target text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limit_buckets (
  bucket_key text not null,
  operation text not null,
  window_start timestamptz not null,
  counter integer not null default 0,
  primary key (bucket_key, operation, window_start)
);

create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs (created_at desc);

drop trigger if exists donation_settings_set_updated_at on public.donation_settings;
create trigger donation_settings_set_updated_at
before update on public.donation_settings
for each row execute function private.set_updated_at();

alter table public.donation_settings enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.rate_limit_buckets enable row level security;

drop policy if exists donation_settings_read on public.donation_settings;
create policy donation_settings_read on public.donation_settings
for select to anon, authenticated using (true);

revoke all on public.donation_settings from anon;
revoke all on public.admin_audit_logs from anon;
revoke all on public.rate_limit_buckets from anon;
revoke all on public.admin_audit_logs from authenticated;
revoke all on public.rate_limit_buckets from authenticated;
grant select on public.donation_settings to anon, authenticated;

insert into public.donation_settings (id, is_configured)
values (true, false)
on conflict (id) do nothing;

commit;
```

- [ ] **Step 2: Áp dụng + kiểm chứng**

```bash
node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
node --env-file-if-exists=.env.local -e "
const {spawnSync}=require('child_process');
const r=spawnSync('psql',[process.env.DATABASE_URL,'-t','-A','-c',\"select id||' configured='||is_configured from public.donation_settings\"],{encoding:'utf8'});
console.log(r.stdout.trim());
"
```

Expected: `t configured=false`

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/005_admin_donate.sql
git commit -m "feat(db): donation settings, audit log and rate limit buckets"
```

---

### Task 8: Script kiểm chứng schema

**Files:**
- Create: `supabase/scripts/verify-schema.mjs`

- [ ] **Step 1: Tạo script**

```js
import { spawnSync } from 'node:child_process'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Thiếu DATABASE_URL')
  process.exit(1)
}

const expectedTables = [
  'profiles', 'user_access',
  'content_entries', 'content_translations', 'writing_prompts',
  'essays', 'essay_revisions', 'essay_assets', 'revision_assets',
  'ai_jobs', 'grading_results', 'essay_features', 'ai_tool_results', 'ai_usage',
  'study_cards', 'review_events', 'error_logs', 'guide_progress',
  'donation_settings', 'admin_audit_logs', 'rate_limit_buckets'
]

const expectedFunctions = [
  'save_draft', 'save_study_card', 'review_card', 'complete_guide',
  'claim_ai_job', 'complete_ai_job', 'fail_ai_job'
]

const expectedBuckets = ['essay-images', 'content-media', 'donation-media']

function query(sql) {
  const result = spawnSync('psql', [url, '-t', '-A', '-F', '|', '-c', sql], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || 'psql failed')
  return result.stdout.trim()
}

let failures = 0
function check(label, actual, expected) {
  const ok = String(actual) === String(expected)
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: ${actual}${ok ? '' : ` (expected ${expected})`}`)
}

const tables = query(`select count(*) from information_schema.tables where table_schema='public' and table_name in (${expectedTables.map(t => `'${t}'`).join(',')})`)
check('table count', tables, expectedTables.length)

const rls = query(`select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity and c.relname in (${expectedTables.map(t => `'${t}'`).join(',')})`)
check('tables with RLS enabled', rls, expectedTables.length)

const funcs = query(`select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname in (${expectedFunctions.map(f => `'${f}'`).join(',')})`)
check('public functions', funcs, expectedFunctions.length)

const buckets = query(`select count(*) from storage.buckets where id in (${expectedBuckets.map(b => `'${b}'`).join(',')})`)
check('storage buckets', buckets, expectedBuckets.length)

const anonLeak = query(`select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and has_table_privilege('anon', c.oid, 'SELECT') and c.relname in ('profiles','essays','study_cards','ai_jobs')`)
check('anon SELECT on private tables (must be 0)', anonLeak, 0)

const usageLeak = query(`select has_table_privilege('authenticated', 'public.ai_usage', 'SELECT')`)
check('authenticated SELECT on ai_usage (must be false)', usageLeak, 'f')

console.log(failures ? `\n${failures} kiểm tra thất bại.` : '\nTất cả kiểm tra schema đạt.')
process.exit(failures ? 1 : 0)
```

- [ ] **Step 2: Chạy kiểm chứng**

```bash
node --env-file-if-exists=.env.local supabase/scripts/verify-schema.mjs
```

Expected:
```
PASS  table count: 21
PASS  tables with RLS enabled: 21
PASS  public functions: 7
PASS  storage buckets: 3
PASS  anon SELECT on private tables (must be 0): 0
PASS  authenticated SELECT on ai_usage (must be false): f
Tất cả kiểm tra schema đạt.
```

> Nếu `tables with RLS enabled` < 21, bảng nào thiếu `alter table ... enable row level security` → sửa file migration tương ứng rồi chạy lại `db:migrate`.

- [ ] **Step 3: Commit**

```bash
git add supabase/scripts/verify-schema.mjs
git commit -m "test(db): schema verification script"
```

---

### Task 9: Script kiểm chứng RLS bằng 2 user thật

**Files:**
- Create: `supabase/scripts/verify-rls.mjs`

- [ ] **Step 1: Tạo script**

```js
const url = process.env.SUPABASE_URL ?? 'https://fjlyjaomuxotqqjvugtv.supabase.co'
const secret = process.env.SUPABASE_SECRET_KEY
if (!secret) {
  console.error('Thiếu SUPABASE_SECRET_KEY')
  process.exit(1)
}

const stamp = Date.now()
const password = `Aa1!${stamp}`
const emailA = `rls-a-${stamp}@example.com`
const emailB = `rls-b-${stamp}@example.com`

let failures = 0
function check(label, ok, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` :: ${detail}` : ''}`)
}

async function api(path, { method = 'GET', body, token, anon = false, headers = {} } = {}) {
  const key = anon ? (process.env.SUPABASE_PUBLISHABLE_KEY ?? secret) : (token ?? secret)
  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      apikey: key,
      // publishable key KHÔNG phải JWT → không gửi qua Authorization
      ...(anon ? {} : { Authorization: `Bearer ${token ?? secret}` }),
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: response.status, data }
}

async function createUser(email) {
  const result = await api('/auth/v1/admin/users', {
    method: 'POST',
    body: { email, password, email_confirm: true }
  })
  if (result.status >= 400) throw new Error(`createUser ${email}: ${JSON.stringify(result.data)}`)
  return result.data.id
}

async function signIn(email) {
  const result = await api('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password }
  })
  if (result.status >= 400) throw new Error(`signIn ${email}: ${JSON.stringify(result.data)}`)
  return result.data.access_token
}

const idA = await createUser(emailA)
const idB = await createUser(emailB)
const tokenA = await signIn(emailA)
const tokenB = await signIn(emailB)

// Trigger đã tạo profile + user_access
const profileA = await api('/rest/v1/profiles?select=id,display_name', { token: tokenA })
check('profile tự tạo khi đăng ký', profileA.status === 200 && profileA.data?.length === 1, JSON.stringify(profileA.data))

const accessA = await api('/rest/v1/user_access?select=user_id,role,status', { token: tokenA })
check('user_access mặc định role=user/active', accessA.data?.[0]?.role === 'user' && accessA.data?.[0]?.status === 'active', JSON.stringify(accessA.data))

// A tạo dữ liệu riêng
const essay = await api('/rest/v1/essays', {
  method: 'POST', token: tokenA,
  body: { user_id: idA, title: 'RLS test essay', task_type: 'task2', body_text: 'Hello world' }
})
check('A tạo được essay của mình', essay.status === 201, JSON.stringify(essay.data))

const card = await api('/rest/v1/study_cards', {
  method: 'POST', token: tokenA,
  body: { user_id: idA, kind: 'vocabulary', front: 'cohesion', back: 'mạch lạc', dedupe_key: 'cohesion::vocabulary' }
})
check('A tạo được thẻ học của mình', card.status === 201, JSON.stringify(card.data))

// B không đọc được dữ liệu A
const bSeesEssays = await api('/rest/v1/essays?select=id,title', { token: tokenB })
check('B không thấy essay của A', bSeesEssays.status === 200 && bSeesEssays.data.length === 0, JSON.stringify(bSeesEssays.data))

const bSeesCards = await api('/rest/v1/study_cards?select=id,front', { token: tokenB })
check('B không thấy thẻ của A', bSeesCards.status === 200 && bSeesCards.data.length === 0, JSON.stringify(bSeesCards.data))

// B không sửa được essay của A kể cả khi biết UUID
const bTriesUpdate = await api(`/rest/v1/essays?id=eq.${essay.data?.id}`, {
  method: 'PATCH', token: tokenB, body: { title: 'hacked' }
})
check('B không sửa được essay của A', bTriesUpdate.status === 200 && bTriesUpdate.data?.length === 0, JSON.stringify(bTriesUpdate.data))

// Anon không đọc được bảng user (đã revoke SELECT → 401/403)
const anonSeesEssays = await api('/rest/v1/essays?select=id', { anon: true })
check('anon không đọc được essays', anonSeesEssays.status === 401 || anonSeesEssays.status === 403, `status ${anonSeesEssays.status}`)

// Anon đọc được nội dung published
const anonContent = await api('/rest/v1/content_entries?select=kind,slug&limit=3', { anon: true })
check('anon đọc được content published', anonContent.status === 200, `status ${anonContent.status}`)

// RPC save_draft của A hoạt động, của B không đụng được bản của A
const saveA = await api('/rest/v1/rpc/save_draft', {
  method: 'POST', token: tokenA, body: { p_task_type: 'task2', p_title: 'draft via rpc', p_body_text: 'text' }
})
check('RPC save_draft tạo nháp cho A', saveA.status === 200 && saveA.data?.essay_id, JSON.stringify(saveA.data))

if (saveA.data?.essay_id) {
  const version = saveA.data.draft_version
  const conflict = await api('/rest/v1/rpc/save_draft', {
    method: 'POST', token: tokenA,
    body: { p_essay_id: saveA.data.essay_id, p_expected_version: version - 1, p_task_type: 'task2', p_title: 'stale' }
  })
  check('RPC save_draft trả 409 khi version cũ', conflict.status === 409, `status ${conflict.status} ${JSON.stringify(conflict.data)}`)

  const bTriesSave = await api('/rest/v1/rpc/save_draft', {
    method: 'POST', token: tokenB,
    body: { p_essay_id: saveA.data.essay_id, p_expected_version: version, p_task_type: 'task2', p_title: 'B overwrite' }
  })
  check('B không ghi được vào essay của A', bTriesSave.status >= 400, `status ${bTriesSave.status}`)
}

// Dọn dẹp
await api(`/rest/v1/essays?user_id=eq.${idA}`, { method: 'DELETE', token: tokenA })
await api(`/rest/v1/study_cards?user_id=eq.${idA}`, { method: 'DELETE', token: tokenA })
await api(`/auth/v1/admin/users/${idA}`, { method: 'DELETE' })
await api(`/auth/v1/admin/users/${idB}`, { method: 'DELETE' })

console.log(failures ? `\n${failures} kiểm tra RLS thất bại.` : '\nTất cả kiểm tra RLS đạt.')
process.exit(failures ? 1 : 0)
```

- [ ] **Step 2: Bổ sung publishable key vào `.env.local`**

Thêm dòng cuối file `.env.local`:

```dotenv
SUPABASE_PUBLISHABLE_KEY=sb_publishable_KvzcWVDrX4lvKwybUsmPiA_t52fVLSS
```

- [ ] **Step 3: Chạy kiểm chứng**

```bash
node --env-file-if-exists=.env.local supabase/scripts/verify-rls.mjs
```

Expected:
```
PASS  profile tự tạo khi đăng ký
PASS  user_access mặc định role=user/active
PASS  A tạo được essay của mình
PASS  A tạo được thẻ học của mình
PASS  B không thấy essay của A
PASS  B không thấy thẻ của A
PASS  B không sửa được essay của A
PASS  anon không đọc được essays
PASS  anon đọc được content published
PASS  RPC save_draft tạo nháp cho A
PASS  RPC save_draft trả 409 khi version cũ
PASS  B không ghi được vào essay của A
Tất cả kiểm tra RLS đạt.
```

> Nếu `anon không đọc được essays` trả 200, kiểm tra lại `revoke all on public.essays from anon` trong `003_essays_jobs_grading.sql`.

- [ ] **Step 4: Commit**

```bash
git add supabase/scripts/verify-rls.mjs .env.example
git commit -m "test(db): RLS verification with two real users"
```

---

### Task 10: Seed nội dung từ `src/data/content.ts`

**Files:**
- Create: `supabase/seed/seed-content.ts`

- [ ] **Step 1: Tạo script seed**

```ts
import { createClient } from '@supabase/supabase-js'
import { entries, guides } from '../../src/data/content.ts'

const url = process.env.SUPABASE_URL ?? 'https://fjlyjaomuxotqqjvugtv.supabase.co'
const secret = process.env.SUPABASE_SECRET_KEY
if (!secret) {
  console.error('Thiếu SUPABASE_SECRET_KEY')
  process.exit(1)
}

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })

type EntryRow = {
  kind: string
  slug: string
  task_type: string | null
  metadata: Record<string, unknown>
  sort_order: number
  status: 'published'
}

const rows: EntryRow[] = [
  ...entries.map((entry, index) => ({
    kind: entry.kind,
    slug: entry.slug,
    task_type: entry.task === 'all' ? null : entry.task,
    metadata: {
      task: entry.task,
      tag: entry.tag,
      expression: entry.expression ?? null,
      body: entry.body
    },
    sort_order: index,
    status: 'published' as const
  })),
  ...guides.map((guide, index) => ({
    kind: 'guide',
    slug: guide.slug,
    task_type: null,
    metadata: {
      title: guide.title,
      category: guide.category,
      minutes: guide.minutes,
      body: guide.body
    },
    sort_order: index,
    status: 'published' as const
  }))
]

const { data: inserted, error: insertError } = await supabase
  .from('content_entries')
  .upsert(rows, { onConflict: 'kind,slug' })
  .select('id,kind,slug')
if (insertError) {
  console.error('Lỗi nạp content_entries:', insertError.message)
  process.exit(1)
}
console.log(`Đã nạp ${inserted?.length ?? 0} content_entries`)

const translations = inserted?.flatMap(entry => {
  const source = rows.find(row => row.kind === entry.kind && row.slug === entry.slug)
  const metadata = source?.metadata as {
    body?: [string, string]
    title?: [string, string]
    tag?: [string, string]
    category?: [string, string]
  } | undefined
  const body = metadata?.body
  const title = metadata?.title ?? metadata?.tag ?? metadata?.category
  if (!body) return []
  return [
    { entry_id: entry.id, locale: 'vi', title: title?.[0] ?? '', summary: title?.[0] ?? '', body: body[0] },
    { entry_id: entry.id, locale: 'en', title: title?.[1] ?? '', summary: title?.[1] ?? '', body: body[1] }
  ]
}) ?? []

const { error: translationError } = await supabase
  .from('content_translations')
  .upsert(translations, { onConflict: 'entry_id,locale' })
if (translationError) {
  console.error('Lỗi nạp content_translations:', translationError.message)
  process.exit(1)
}
console.log(`Đã nạp ${translations.length} content_translations`)

const { count } = await supabase.from('content_entries').select('id', { count: 'exact', head: true })
console.log(`Tổng số content_entries trong DB: ${count}`)
```

- [ ] **Step 2: Thêm `SUPABASE_URL` vào `.env.local`**

```dotenv
SUPABASE_URL=https://fjlyjaomuxotqqjvugtv.supabase.co
```

- [ ] **Step 3: Chạy seed**

```bash
node --env-file-if-exists=.env.local supabase/seed/seed-content.ts
```

Expected:
```
Đã nạp 15 content_entries
Đã nạp 30 content_translations
Tổng số content_entries trong DB: 15
```
(`entries` = 9 + `guides` = 6 trong `src/data/content.ts`; mỗi entry có 2 bản dịch VI/EN.)

- [ ] **Step 4: Chạy lại seed để chứng minh idempotent**

```bash
node --env-file-if-exists=.env.local supabase/seed/seed-content.ts
```

Expected: `Tổng số content_entries trong DB: 15` — **không** tăng lên `30`.

- [ ] **Step 5: Kiểm chứng nội dung đọc được bằng anon**

```bash
node --env-file-if-exists=.env.local -e "
const key=process.env.SUPABASE_PUBLISHABLE_KEY;
fetch('https://fjlyjaomuxotqqjvugtv.supabase.co/rest/v1/content_entries?select=kind,slug&limit=3',{headers:{apikey:key}}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d)));
"
```

Expected: mảng JSON có 3 phần tử, ví dụ `[{"kind":"prompt","slug":"cities-and-green-spaces"}, ...]`.

- [ ] **Step 6: Commit**

```bash
git add supabase/seed/seed-content.ts package.json
git commit -m "feat(db): seed content entries and translations"
```

---

### Task 11: Tài liệu và kiểm tra lần cuối

**Files:**
- Create: `supabase/README.md`

- [ ] **Step 1: Tạo `supabase/README.md`**

````markdown
# Supabase — IELTS Writing Studio

Project: `fjlyjaomuxotqqjvugtv` · Region: `ap-south-1`

## Kết nối

Máy dev không có IPv6 nên `db.<ref>.supabase.co` không dùng được. Dùng Supabase Pooler:

```
postgresql://postgres.fjlyjaomuxotqqjvugtv:<PASSWORD-URL-ENCODED>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

Mật khẩu chứa `@` → mã hoá `%40`.

## Chạy migration

```bash
node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
```

Thứ tự file trong `migrations/` là thứ tự chạy. Mọi file idempotent, chạy lại an toàn.

## Kiểm chứng

```bash
node --env-file-if-exists=.env.local supabase/scripts/verify-schema.mjs   # bảng, RLS, policy, bucket
node --env-file-if-exists=.env.local supabase/scripts/verify-rls.mjs      # 2 user thật, xác minh không đọc chéo
```

`verify-rls.mjs` tạo 2 user tạm qua Admin API rồi xoá sau khi kiểm tra.

## Seed nội dung

```bash
node --env-file-if-exists=.env.local supabase/seed/seed-content.ts
```

Nguồn: `src/data/content.ts`. Idempotent theo `(kind, slug)`.

## Rollback

Project đang ở trạng thái dev, chưa có dữ liệu thật. Reset toàn bộ:

```bash
psql "$DATABASE_URL" -c "drop schema public cascade; create schema public; grant all on schema public to postgres; grant all on schema public to anon; grant all on schema public to authenticated; grant all on schema public to service_role;"
```

Rồi chạy lại `db:migrate` + `db:seed`.

## Bảo mật

- Client chỉ dùng `VITE_SUPABASE_PUBLISHABLE_KEY`.
- `SUPABASE_SECRET_KEY` chỉ dùng cho script seed/verify, không commit.
- `ANTHROPIC_API_KEY` lưu trong Vault (`vault.create_secret`); wrapper `public.read_secret` chỉ `service_role` được gọi sẽ được thêm ở Plan 3.
- RLS bật trên mọi bảng public; `anon` không có quyền SELECT trên bảng dữ liệu user.
````

- [ ] **Step 2: Chạy toàn bộ kiểm chứng lần cuối**

```bash
node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
node --env-file-if-exists=.env.local supabase/scripts/verify-schema.mjs
node --env-file-if-exists=.env.local supabase/scripts/verify-rls.mjs
npm test
npm run build
```

Expected: migration OK, schema `Tất cả kiểm tra schema đạt.`, RLS `Tất cả kiểm tra RLS đạt.`, `npm test` pass, `npm run build` xong với `✓ built in`.

- [ ] **Step 3: Kiểm tra không có secret trong repo**

```bash
git grep -nE "sb_secret_[A-Za-z0-9_-]{20,}|SUPABASE_DB_PASSWORD=.+|postgresql://postgres\.[a-z0-9]+:[^<]+@" -- . ':!supabase/README.md'
```

Expected: **không có kết quả** (exit code 1). Nếu có, xoá khỏi file và `git commit --amend`/`git rm --cached`. Lệnh này dò theo *hình dạng* credential nên không cần nhúng giá trị thật vào repo.

- [ ] **Step 4: Commit cuối**

```bash
git add supabase/README.md
git commit -m "docs(db): database setup and verification guide"
git log --oneline
```

Expected: 9 commit, file đầu `docs(db): ...`, file cuối `chore: baseline frontend before database work`.

---

## Definition of Done cho Plan 1

- [ ] `npm run db:migrate` chạy 5 file migration không lỗi, chạy lại 2 lần vẫn không lỗi
- [ ] 21 bảng tồn tại, RLS bật trên cả 21, `anon` không có quyền SELECT trên bảng dữ liệu user
- [ ] 7 RPC public tồn tại; `claim_ai_job`/`complete_ai_job`/`fail_ai_job` là `security definer` chỉ `service_role`
- [ ] 3 Storage bucket tồn tại (`essay-images` private, `content-media` private, `donation-media` public)
- [ ] Trigger tạo profile + `user_access` khi đăng ký (xác minh qua `verify-rls.mjs`)
- [ ] `verify-rls.mjs` đạt toàn bộ: user B không đọc/sửa được dữ liệu user A, anon không đọc được bảng user, RPC trả 409 khi version cũ
- [ ] Seed nạp được nội dung từ `src/data/content.ts`, chạy lại không nhân bản
- [ ] `npm test` và `npm run build` vẫn xanh
- [ ] Không có secret nào trong lịch sử git

## Việc còn lại cho các Plan sau

| Plan | Nội dung | Phụ thuộc |
|---|---|---|
| **Plan 2** | Auth + data layer: `src/lib/supabase.ts`, `src/lib/auth.tsx`, thay `Auth` placeholder trong `src/pages/Other.tsx`, viết lại `src/lib/store.tsx` (bỏ IndexedDB), đổi `update(fn)` → op cấp entity ở `Essays.tsx`/`Guide.tsx`/`Learning.tsx`/`Other.tsx` (Settings) | Plan 1 |
| **Plan 3** | Edge Functions + AI: 9 function trong `supabase/functions/`, worker queue/lease, `claude-sonnet-4-6` + `claude-haiku-4-5`, `public.read_secret` wrapper cho Vault | Plan 1 + Plan 2 + `ANTHROPIC_API_KEY` |

## Việc người dùng phải tự làm

1. **Tắt xác nhận email**: Supabase Dashboard → Authentication → Sign In / Providers → Email → bỏ tick "Confirm email". Cần cho Plan 2 (đăng ký không bị kẹt).
2. **Deploy Edge Functions** (Plan 3): `npx supabase login` rồi `npx supabase functions deploy --project-ref fjlyjaomuxotqqjvugtv`, hoặc deploy qua Dashboard.
3. **Cấp `ANTHROPIC_API_KEY`** (Plan 3): gửi cho tôi để đưa vào Vault qua `vault.create_secret`, hoặc tự đặt trong Dashboard → Edge Functions → Secrets.
