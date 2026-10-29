-- 027_speaking.sql
-- Module: speaking (luyện nói) — attempts / turns / results / câu hỏi mẫu / bucket audio

begin;

-- ---------------------------------------------------------------- câu hỏi mẫu

create table if not exists public.speaking_questions (
  id uuid primary key default gen_random_uuid(),
  part text not null check (part in ('part-1', 'part-2', 'part-3')),
  slug text not null unique,
  topic text not null,
  prompt_text text not null default '',
  questions jsonb not null default '[]'::jsonb,
  cue_card jsonb,
  related_part3_slug text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- phiên luyện nói

-- 1 attempt = 1 phiên. Phiên có 1 hoặc nhiều turn (mỗi turn = 1 recording).
create table if not exists public.speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('part-1', 'part-2', 'part-3', 'mock')),
  target_band numeric(2, 1) check (target_band >= 0 and target_band <= 9),
  feedback_locale text not null default 'vi' check (feedback_locale in ('vi', 'en')),
  turn_count integer not null default 1 check (turn_count >= 1 and turn_count <= 12),
  status text not null default 'recording'
    check (status in ('recording', 'queued', 'processing', 'succeeded', 'failed', 'cancelled')),
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- 1 turn = 1 recording

create table if not exists public.speaking_turns (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.speaking_attempts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_index integer not null default 0,
  part text not null check (part in ('part-1', 'part-2', 'part-3')),
  question_id uuid references public.speaking_questions (id) on delete set null,
  prompt_text text not null default '',
  questions jsonb not null default '[]'::jsonb,
  cue_card jsonb,
  audio_path text not null default '',
  mime_type text not null default 'audio/webm',
  byte_size bigint not null default 0,
  duration_ms integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'uploaded', 'graded', 'failed')),
  error_code text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- kết quả chấm

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
  created_at timestamptz not null default now()
);

create index if not exists speaking_questions_part_idx
  on public.speaking_questions (part, topic) where is_active;
create index if not exists speaking_attempts_user_idx
  on public.speaking_attempts (user_id, created_at desc);
create index if not exists speaking_attempts_status_idx
  on public.speaking_attempts (status) where status in ('recording', 'queued', 'processing');
create index if not exists speaking_turns_attempt_idx
  on public.speaking_turns (attempt_id, order_index);
create index if not exists speaking_results_attempt_idx
  on public.speaking_results (attempt_id);

-- ---------------------------------------------------------------- hàng đợi AI

-- Cho phép thêm operation 'grade-speaking' vào hàng đợi AI.
alter table public.ai_jobs drop constraint if exists ai_jobs_operation_check;
alter table public.ai_jobs
  add constraint ai_jobs_operation_check
  check (operation in ('grade', 'enrich', 'magic-rewrite', 'argument-stress-test',
                       'critical-thinking', 'read-image', 'grade-speaking'));

-- Lease dài hơn cho job Speaking: job chấm N lần Gemini (song song) + 1 lần Claude
-- có thể mất ~60-120s. Lease cũ 120s dễ bị hết hạn giữa chừng khiến job bị claim 2 lần.
create or replace function public.claim_ai_job()
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job public.ai_jobs;
begin
  -- Job đang chạy nhưng lease đã hết hạn được lấy lại (attempts < 3 thì mới thử lại).
  select * into v_job from public.ai_jobs
  where (
      (status in ('queued', 'retry_wait') and next_attempt_at <= now())
      or (status = 'processing' and lease_until is not null and lease_until <= now() and attempts < 3)
    )
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
    lease_until = now() + interval '240 seconds',
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

-- ---------------------------------------------------------------- storage

-- Bucket audio riêng cho Speaking: private, upload qua signed URL, xoá sau khi chấm.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speaking-audio', 'speaking-audio', false, 4194304,
        array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/mp3'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Đường dẫn object: {userId}/{attemptId}/{turnId}.{ext}
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

-- ---------------------------------------------------------------- RLS

alter table public.speaking_questions enable row level security;
alter table public.speaking_attempts enable row level security;
alter table public.speaking_turns enable row level security;
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

drop policy if exists speaking_turns_read_own on public.speaking_turns;
create policy speaking_turns_read_own on public.speaking_turns
for select to authenticated using (user_id = auth.uid() and private.is_active_user());

drop policy if exists speaking_turns_insert_own on public.speaking_turns;
create policy speaking_turns_insert_own on public.speaking_turns
for insert to authenticated with check (user_id = auth.uid() and private.is_active_user());

drop policy if exists speaking_turns_update_own on public.speaking_turns;
create policy speaking_turns_update_own on public.speaking_turns
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
revoke all on public.speaking_turns from anon;
revoke all on public.speaking_results from anon;
revoke all on public.speaking_results from authenticated;

grant select on public.speaking_questions to authenticated;
grant select, insert, update on public.speaking_attempts to authenticated;
grant select, insert, update on public.speaking_turns to authenticated;
grant select on public.speaking_results to authenticated;

commit;
