-- 021_reading_listening.sql
-- Module: reading + listening (đề luyện và lịch sử làm bài)
--
-- Nội dung đề nằm trong Postgres; frontend đọc công khai qua PostgREST.
-- Cột đáp án (answer_key, accepted_answers) KHÔNG được cấp quyền cho client:
-- việc chấm điểm diễn ra ở Edge Function `grade-skill` bằng service role.

begin;

create table if not exists public.skill_tests (
  id uuid primary key default gen_random_uuid(),
  skill text not null check (skill in ('reading', 'listening')),
  slug text not null unique,
  series text not null default '',
  series_no integer not null default 0,
  title text not null,
  description text not null default '',
  level text not null default '',
  duration_minutes integer not null default 60 check (duration_minutes between 5 and 180),
  test_type text not null default 'academic' check (test_type in ('academic', 'general')),
  question_count integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_sections (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.skill_tests (id) on delete cascade,
  section_no integer not null check (section_no between 1 and 20),
  title text not null default '',
  topic text not null default '',
  content_html text not null default '',
  audio_path text not null default '',
  transcript text not null default '',
  source_id text not null default '',
  unique (test_id, section_no)
);

-- Nhóm câu hỏi: những câu dùng chung một hướng dẫn (groupHtml của repo nguồn).
create table if not exists public.skill_question_groups (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.skill_sections (id) on delete cascade,
  order_index integer not null check (order_index between 1 and 100),
  instruction_html text not null default '',
  display_type text not null default 'fill-blank',
  config jsonb not null default '{}'::jsonb,
  unique (section_id, order_index)
);

create table if not exists public.skill_questions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.skill_question_groups (id) on delete cascade,
  order_index integer not null check (order_index between 1 and 200),
  source_number integer not null default 0,
  question_type text not null check (question_type in ('tfng', 'ynng', 'mcq', 'matching', 'fill')),
  display_type text not null default 'fill-blank',
  prompt text not null default '',
  question_html text not null default '',
  options jsonb not null default '[]'::jsonb,
  answer_key text not null default '',
  accepted_answers text[] not null default '{}',
  explanation text not null default '',
  unique (group_id, order_index)
);

create table if not exists public.skill_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  test_id uuid not null references public.skill_tests (id) on delete cascade,
  skill text not null check (skill in ('reading', 'listening')),
  answers jsonb not null default '{}'::jsonb,
  correct_count integer not null default 0,
  total_count integer not null default 0,
  band numeric(3, 1),
  time_spent_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists skill_tests_skill_status_idx on public.skill_tests (skill, status, sort_order);
create index if not exists skill_tests_series_idx on public.skill_tests (series, series_no);
create index if not exists skill_sections_test_idx on public.skill_sections (test_id, section_no);
create index if not exists skill_question_groups_section_idx on public.skill_question_groups (section_id, order_index);
create index if not exists skill_questions_group_idx on public.skill_questions (group_id, order_index);
create index if not exists skill_attempts_user_idx on public.skill_attempts (user_id, skill, created_at desc);

drop trigger if exists skill_tests_set_updated_at on public.skill_tests;
create trigger skill_tests_set_updated_at
before update on public.skill_tests
for each row execute function private.set_updated_at();

alter table public.skill_tests enable row level security;
alter table public.skill_sections enable row level security;
alter table public.skill_question_groups enable row level security;
alter table public.skill_questions enable row level security;
alter table public.skill_attempts enable row level security;

-- Nội dung đề: ai cũng đọc được, nhưng chỉ đề đang published.
drop policy if exists skill_tests_read on public.skill_tests;
create policy skill_tests_read on public.skill_tests
for select to anon, authenticated
using (status = 'published' or private.is_admin());

drop policy if exists skill_sections_read on public.skill_sections;
create policy skill_sections_read on public.skill_sections
for select to anon, authenticated
using (exists (
  select 1 from public.skill_tests test
  where test.id = test_id and (test.status = 'published' or private.is_admin())
));

drop policy if exists skill_question_groups_read on public.skill_question_groups;
create policy skill_question_groups_read on public.skill_question_groups
for select to anon, authenticated
using (exists (
  select 1 from public.skill_sections section
  join public.skill_tests test on test.id = section.test_id
  where section.id = section_id and (test.status = 'published' or private.is_admin())
));

drop policy if exists skill_questions_read on public.skill_questions;
create policy skill_questions_read on public.skill_questions
for select to anon, authenticated
using (exists (
  select 1 from public.skill_question_groups question_group
  join public.skill_sections section on section.id = question_group.section_id
  join public.skill_tests test on test.id = section.test_id
  where question_group.id = group_id and (test.status = 'published' or private.is_admin())
));

-- Lịch sử làm bài: chủ sở hữu đọc và ghi, không ai thấy của người khác.
drop policy if exists skill_attempts_owner_read on public.skill_attempts;
create policy skill_attempts_owner_read on public.skill_attempts
for select to authenticated
using (user_id = auth.uid());

drop policy if exists skill_attempts_owner_insert on public.skill_attempts;
create policy skill_attempts_owner_insert on public.skill_attempts
for insert to authenticated
with check (user_id = auth.uid());

revoke all on public.skill_tests from anon;
revoke all on public.skill_sections from anon;
revoke all on public.skill_question_groups from anon;
revoke all on public.skill_questions from anon;
revoke all on public.skill_attempts from anon;
grant select on public.skill_tests to anon, authenticated;
grant select on public.skill_sections to anon, authenticated;
grant select on public.skill_question_groups to anon, authenticated;
grant select on public.skill_attempts to authenticated;
grant insert on public.skill_attempts to authenticated;

-- Chỉ cấp quyền đọc các cột KHÔNG chứa đáp án cho skill_questions.
-- Client bắt buộc phải ghi tên cột rõ ràng, không dùng select=* cho bảng này.
revoke select on public.skill_questions from anon, authenticated;
grant select (id, group_id, order_index, source_number, question_type, display_type, prompt, question_html, options)
  on public.skill_questions to anon, authenticated;

-- Bucket audio cho Listening: public để trình phát tải trực tiếp, admin mới ghi được.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('skill-audio', 'skill-audio', true, 52428800, array['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists skill_audio_insert on storage.objects;
create policy skill_audio_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'skill-audio' and private.is_admin());

drop policy if exists skill_audio_delete on storage.objects;
create policy skill_audio_delete on storage.objects
for delete to authenticated
using (bucket_id = 'skill-audio' and private.is_admin());

commit;
