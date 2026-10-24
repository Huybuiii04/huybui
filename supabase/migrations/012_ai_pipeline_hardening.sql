-- 012_ai_pipeline_hardening.sql
--
-- Bổ sung những phần Plan 3 còn thiếu:
--   1. claim_ai_job() lấy lại job 'processing' có lease hết hạn (worker bị kill giữa chừng).
--   2. RPC submit_essay_job() tạo revision + job trong một transaction (đóng cửa sổ lỗi).
--   3. Bảng ai_pricing + hàm estimate_ai_cost() để estimated_cost_usd có giá thật.
--   4. Giới hạn 2 job AI đang chạy cho mỗi người dùng, kiểm tra ở database.
--
-- Idempotent: chạy lại nhiều lần không lỗi.

begin;

-- ---------------------------------------------------------------- 1. lease recovery

create or replace function public.claim_ai_job()
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job public.ai_jobs;
begin
  -- Job đang chạy nhưng lease đã hết hạn được lấy lại (attempts < 3 thì mới thử).
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

revoke all on function public.claim_ai_job() from public, anon, authenticated;
grant execute on function public.claim_ai_job() to service_role;

-- ---------------------------------------------------------------- 2. transaction submit

-- Tạo revision bất biến + job chấm trong cùng một transaction.
-- Nếu một trong hai insert lỗi thì cả hai cùng rollback — không còn revision mồ côi.
drop function if exists public.submit_essay_job(uuid, integer, text, text, text, uuid, uuid, text, text, text, text, text, text, numeric, text, integer);
create or replace function public.submit_essay_job(
  p_essay_id uuid,
  p_expected_version integer,
  p_idempotency_key text,
  p_mode text,
  p_model text,
  p_cache_key text,
  p_job_id uuid,
  p_revision_id uuid,
  p_task_type text,
  p_subtype text,
  p_prompt_text text,
  p_body_text text,
  p_reference_data text,
  p_feedback_locale text,
  p_target_band numeric,
  p_input_hash text,
  p_word_count integer
) returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_essay public.essays;
  v_revision_no integer;
  v_existing public.ai_jobs;
begin
  if v_user_id is null then
    perform private.raise_http_error('unauthenticated', 'Authentication required', 401);
  end if;

  -- Idempotency: job đã tồn tại thì trả lại, không tạo bản ghi mới.
  select * into v_existing from public.ai_jobs
  where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object(
      'revision_id', v_existing.revision_id,
      'job_id', v_existing.id,
      'status', v_existing.status,
      'created', false
    );
  end if;

  select * into v_essay from public.essays
  where id = p_essay_id and user_id = v_user_id
  for update;
  if not found then
    perform private.raise_http_error('essay_not_found', 'Essay not found', 404);
  end if;
  if v_essay.status <> 'active' then
    perform private.raise_http_error('essay_not_active', 'The essay is being deleted and cannot be submitted', 409);
  end if;
  if v_essay.draft_version <> p_expected_version then
    perform private.raise_http_error('draft_conflict', 'The essay changed. Reload it before submitting.', 409);
  end if;
  if btrim(coalesce(p_body_text, '')) = '' then
    perform private.raise_http_error('essay_empty', 'The essay must contain text before submission', 400);
  end if;

  select coalesce(max(revision_no), 0) + 1 into v_revision_no
  from public.essay_revisions where essay_id = p_essay_id;

  insert into public.essay_revisions (
    id, essay_id, user_id, revision_no, task_type, subtype, prompt_text, essay_text,
    reference_data, feedback_locale, target_band, input_hash, word_count
  ) values (
    p_revision_id, p_essay_id, v_user_id, v_revision_no, p_task_type, p_subtype, p_prompt_text, p_body_text,
    p_reference_data, p_feedback_locale, p_target_band, p_input_hash, p_word_count
  );

  insert into public.ai_jobs (
    id, user_id, revision_id, operation, payload, idempotency_key, cache_key, status, next_attempt_at
  ) values (
    p_job_id, v_user_id, p_revision_id, 'grade',
    jsonb_build_object('mode', p_mode, 'source', 'submit-essay', 'essayId', p_essay_id, 'model', p_model),
    p_idempotency_key, p_cache_key, 'queued', now()
  );

  return jsonb_build_object(
    'revision_id', p_revision_id,
    'job_id', p_job_id,
    'status', 'queued',
    'created', true
  );
end;
$$;

revoke all on function public.submit_essay_job(uuid, integer, text, text, text, text, uuid, uuid, text, text, text, text, text, text, numeric, text, integer) from public, anon;
grant execute on function public.submit_essay_job(uuid, integer, text, text, text, text, uuid, uuid, text, text, text, text, text, text, numeric, text, integer) to authenticated;

-- ---------------------------------------------------------------- 3. bảng giá AI

create table if not exists public.ai_pricing (
  pricing_version text not null,
  model text not null,
  input_per_million numeric(12, 6) not null,
  output_per_million numeric(12, 6) not null,
  cache_write_per_million numeric(12, 6) not null default 0,
  cache_read_per_million numeric(12, 6) not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  primary key (pricing_version, model)
);

revoke all on public.ai_pricing from anon;
grant select on public.ai_pricing to service_role;

-- RLS bật nhưng không có policy cho client: chỉ service_role đọc được (bypass RLS).
alter table public.ai_pricing enable row level security;

comment on table public.ai_pricing is
  'Đơn giá theo pricing_version và model. Thiếu dòng => cost là null, không ghi 0 giả.';

-- Tính chi phí theo bảng giá. Trả null khi chưa cấu hình giá cho model đó.
create or replace function public.estimate_ai_cost(
  p_pricing_version text,
  p_model text,
  p_input_tokens integer,
  p_output_tokens integer,
  p_cache_creation_tokens integer default 0,
  p_cache_read_tokens integer default 0
) returns numeric
language sql
stable
security invoker
set search_path = public
as $$
  select (
    select round((
      coalesce(p_input_tokens, 0) * p.input_per_million
      + coalesce(p_output_tokens, 0) * p.output_per_million
      + coalesce(p_cache_creation_tokens, 0) * p.cache_write_per_million
      + coalesce(p_cache_read_tokens, 0) * p.cache_read_per_million
    ) / 1000000.0, 6)
    from public.ai_pricing p
    where p.pricing_version = p_pricing_version
      and p.model = p_model
  );
$$;

grant execute on function public.estimate_ai_cost(text, text, integer, integer, integer, integer) to service_role;

-- ---------------------------------------------------------------- 4. giới hạn job đồng thời

-- Tối đa 2 job AI đang chạy (queued/processing/retry_wait) cho mỗi người dùng.
create or replace function private.enforce_ai_job_concurrency()
returns trigger
language plpgsql
security definer
set search_path = private, public
as $$
declare
  v_running integer;
begin
  if new.status not in ('queued', 'processing', 'retry_wait') then
    return new;
  end if;
  select count(*) into v_running from public.ai_jobs
  where user_id = new.user_id
    and id <> new.id
    and status in ('queued', 'processing', 'retry_wait');
  if v_running >= 2 then
    perform private.raise_http_error('too_many_ai_jobs', 'Too many AI jobs are already running. Please wait.', 429);
  end if;
  return new;
end;
$$;

drop trigger if exists ai_jobs_concurrency_guard on public.ai_jobs;
create trigger ai_jobs_concurrency_guard
  before insert on public.ai_jobs
  for each row execute function private.enforce_ai_job_concurrency();

revoke execute on function private.enforce_ai_job_concurrency() from public, anon, authenticated;
grant execute on function private.enforce_ai_job_concurrency() to service_role;

-- ---------------------------------------------------------------- 5. view tổng hợp usage

create or replace view public.ai_usage_totals
with (security_invoker = true) as
select
  model,
  pricing_version,
  count(*)::integer as calls,
  sum(input_tokens)::bigint as input_tokens,
  sum(output_tokens)::bigint as output_tokens,
  sum(cache_creation_tokens)::bigint as cache_creation_tokens,
  sum(cache_read_tokens)::bigint as cache_read_tokens,
  round(avg(latency_ms))::integer as avg_latency_ms,
  sum(coalesce(estimated_cost_usd, 0))::numeric(14, 6) as estimated_cost_usd
from public.ai_usage
group by model, pricing_version;

revoke all on public.ai_usage_totals from anon, authenticated;
grant select on public.ai_usage_totals to service_role;

commit;
