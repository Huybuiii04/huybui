-- 017_grading_timeout.sql
-- Module: vòng đời job AI
--
-- Prompt chấm bài nay dài hơn (đã nhúng band descriptors chính thức) nên một
-- lượt gọi model có thể vượt 120 giây. Lease cũ khiến job bị "claim" lại
-- giữa chừng, dẫn tới chạy trùng và mất kết quả.
--
-- Idempotent.

begin;

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
    lease_until = now() + interval '300 seconds',
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

commit;
