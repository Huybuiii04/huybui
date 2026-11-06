-- Run with psql -v ON_ERROR_STOP=1 -f tests/speaking-queue.sql.
-- All fixture rows roll back; cron cannot see or process them.
begin;
do $$
declare
  v_user uuid;
  v_attempt uuid := gen_random_uuid();
  v_empty uuid := gen_random_uuid();
  v_job uuid;
begin
  select user_id into v_user from public.speaking_attempts limit 1;
  if v_user is null then raise exception 'A speaking user is required for this check'; end if;

  insert into public.speaking_attempts (id, user_id, mode, turn_count)
  values (v_attempt, v_user, 'mock', 4), (v_empty, v_user, 'mock', 4);
  insert into public.speaking_turns (attempt_id, user_id, order_index, part, status, audio_path, byte_size)
  select v_attempt, v_user, n, 'part-1',
    case when n = 0 then 'uploaded' else 'pending' end,
    case when n = 0 then 'fixture.webm' else '' end,
    case when n = 0 then 1200 else 0 end
  from generate_series(0, 3) n;

  if public.queue_speaking_grading(v_attempt, v_user) is not null then
    raise exception 'Normal commit must wait for all four parts';
  end if;
  v_job := public.queue_speaking_grading(v_attempt, v_user, true);
  if v_job is null then raise exception 'Early finish must queue recorded parts'; end if;
  if (select turn_count from public.speaking_attempts where id = v_attempt) is distinct from 1 then
    raise exception 'Only uploaded parts count toward grading';
  end if;
  if public.queue_speaking_grading(v_attempt, v_user, true) is distinct from v_job then
    raise exception 'Repeated finish must reuse the same job';
  end if;
  if (select count(*) from public.ai_jobs where payload->>'attemptId' = v_attempt::text) <> 1 then
    raise exception 'Finish must not create duplicate grading jobs';
  end if;
  if (select count(*) from public.speaking_turns where attempt_id = v_attempt and status = 'pending') <> 3 then
    raise exception 'Unrecorded parts must remain intact';
  end if;
  begin
    perform public.queue_speaking_grading(v_empty, v_user, true);
    raise exception 'Empty attempt must not queue';
  exception when raise_exception then
    if sqlerrm <> 'no_speech_detected' then raise; end if;
  end;
  begin
    perform public.queue_speaking_grading(v_empty, gen_random_uuid(), true);
    raise exception 'Another user must not queue this attempt';
  exception when raise_exception then
    if sqlerrm <> 'attempt_not_found' then raise; end if;
  end;
end;
$$;
rollback;
