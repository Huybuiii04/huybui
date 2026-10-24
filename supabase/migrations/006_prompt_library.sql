-- 006_prompt_library.sql
-- Module: prompt library (đề luyện theo dạng mới)
-- Bảng public.prompts lưu đề bài cho cả 3 loại task, kèm biểu đồ dạng jsonb
-- để frontend dựng lại đồ thị ngay trên thẻ đề.

begin;

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  task text not null check (task in ('task2', 'academic_task1', 'general_task1')),
  subtype text not null default '',
  type_label text not null default 'ESSAY',
  source text not null default 'practice' check (source in ('practice', 'recalled', 'predicted')),
  set_name text,
  difficulty text not null default 'MEDIUM' check (difficulty in ('EASY', 'MEDIUM', 'HARD')),
  topics text[] not null default '{}',
  title_vi text not null default '',
  title_en text not null default '',
  text text not null default '',
  reference text not null default '',
  chart jsonb,
  minutes integer not null default 40 check (minutes between 10 and 180),
  hint_vi text not null default '',
  hint_en text not null default '',
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompts_task_status_idx on public.prompts (task, status);
create index if not exists prompts_topics_idx on public.prompts using gin (topics);
create index if not exists prompts_source_status_idx on public.prompts (source, status);

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
before update on public.prompts
for each row execute function private.set_updated_at();

alter table public.prompts enable row level security;

drop policy if exists prompts_read_published on public.prompts;
create policy prompts_read_published on public.prompts
for select to anon, authenticated
using (status = 'published' or private.is_admin());

revoke all on public.prompts from anon;
grant select on public.prompts to anon, authenticated;

-- Hợp đồng với frontend: src/lib/promptRepository.ts đọc các cột phẳng này.
-- Kiểm tra nhanh sau khi seed:
--   select count(*) from public.prompts where status = 'published';

commit;
