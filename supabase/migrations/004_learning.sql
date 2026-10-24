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
    perform private.raise_http_error('unauthenticated', 'Authentication required', 401);
  end if;
  if not private.is_active_user() then
    perform private.raise_http_error('suspended', 'This account is suspended', 403);
  end if;
  if p_kind is null or p_kind not in ('vocabulary', 'collocation', 'structure', 'error') then
    perform private.raise_http_error('invalid_card_kind', 'Unknown card kind', 400);
  end if;
  if coalesce(btrim(p_front), '') = '' or coalesce(btrim(p_back), '') = '' then
    perform private.raise_http_error('invalid_card', 'Front and back are required', 400);
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
    perform private.raise_http_error('unauthenticated', 'Authentication required', 401);
  end if;
  if not private.is_active_user() then
    perform private.raise_http_error('suspended', 'This account is suspended', 403);
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
    perform private.raise_http_error('card_not_found', 'Card not found', 404);
  end if;
  if v_card.due_at > now() then
    perform private.raise_http_error('card_not_due', 'Card is not due for review yet', 409);
  end if;

  v_before := v_card.level;
  if p_remembered then
    v_after := least(6, greatest(0, v_before) + 1);
  else
    v_after := 0;
  end if;
  v_days := case v_after
    when 0 then 1 when 1 then 1 when 2 then 3 when 3 then 7
    when 4 then 14 when 5 then 30 else 60
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
    perform private.raise_http_error('unauthenticated', 'Authentication required', 401);
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
