begin;

-- Commit đủ phần và kết thúc sớm cùng dùng một khóa để chỉ tạo một job chấm.
create or replace function public.queue_speaking_grading(
  p_attempt_id uuid,
  p_user_id uuid,
  p_allow_partial boolean default false
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attempt public.speaking_attempts%rowtype;
  v_uploaded integer;
  v_job_id uuid;
begin
  select * into v_attempt from public.speaking_attempts
  where id = p_attempt_id and user_id = p_user_id
  for update;
  if not found then raise exception 'attempt_not_found'; end if;

  if v_attempt.status <> 'recording' then
    select id into v_job_id from public.ai_jobs
    where user_id = p_user_id and operation = 'grade-speaking'
      and payload->>'attemptId' = p_attempt_id::text
    order by created_at limit 1;
    return v_job_id;
  end if;

  select count(*) into v_uploaded from public.speaking_turns
  where attempt_id = p_attempt_id and user_id = p_user_id
    and status = 'uploaded' and audio_path <> '' and byte_size > 0;
  if v_uploaded = 0 and p_allow_partial then
    raise exception 'no_speech_detected';
  end if;
  if v_uploaded = 0 or (not p_allow_partial and v_uploaded < v_attempt.turn_count) then
    return null;
  end if;

  insert into public.ai_jobs (user_id, operation, payload, idempotency_key)
  values (p_user_id, 'grade-speaking', jsonb_build_object('attemptId', p_attempt_id),
    'speaking-finish-' || p_attempt_id::text)
  returning id into v_job_id;

  update public.speaking_attempts
  set status = 'queued', turn_count = v_uploaded, error_code = null, updated_at = now()
  where id = p_attempt_id;
  return v_job_id;
end;
$$;

revoke all on function public.queue_speaking_grading(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.queue_speaking_grading(uuid, uuid, boolean) to service_role;

commit;
