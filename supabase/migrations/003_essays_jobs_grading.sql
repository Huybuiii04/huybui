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
    perform private.raise_http_error('unauthenticated', 'Authentication required', 401);
  end if;
  if not private.is_active_user() then
    perform private.raise_http_error('suspended', 'This account is suspended', 403);
  end if;
  if p_task_type is null or p_task_type not in ('task2', 'academic_task1', 'general_task1') then
    perform private.raise_http_error('invalid_task_type', 'Unknown task type', 400);
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
      perform private.raise_http_error('essay_not_found', 'Essay not found', 404);
    end if;
    if v_essay.draft_version <> coalesce(p_expected_version, -1) then
      -- SQLSTATE 40001 (serialization_failure) bị PostgREST/PostgreSQL coi là
      -- lỗi có thể retry vô hạn → request treo tới khi Kong timeout (504).
      -- Dùng SQLSTATE 'PGRST' để PostgREST trả đúng HTTP 409.
      raise sqlstate 'PGRST' using
        message = jsonb_build_object(
          'code', 'draft_conflict',
          'message', 'conflict',
          'details', format(
            'essay_id=%s, expected_version=%s, current_version=%s',
            p_essay_id, p_expected_version, v_essay.draft_version
          ),
          'hint', 'reload the draft and retry with the current version'
        )::text,
        detail = jsonb_build_object(
          'status', 409,
          'status_text', 'Conflict',
          'headers', jsonb_build_object()
        )::text;
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
