-- 029_speaking_live.sql
-- Module: speaking — phiên luyện nói TRỰC TIẾP (AI examiner hỏi, người học trả lời bằng mic).
--
-- Phiên live KHÔNG tạo bảng mới cho câu hỏi: nó dùng lại `speaking_attempts` +
-- `speaking_turns` + `speaking_questions` (đề Cambridge 12–20) để chấm điểm.
-- Bảng này chỉ lưu trạng thái riêng của phiên live: lượt hỏi/đáp, số lượt gọi AI
-- (để kiểm soát chi phí) và token phiên.

begin;

-- ---------------------------------------------------------------- phiên live

create table if not exists public.speaking_live_sessions (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.speaking_attempts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('part-1', 'part-2', 'part-3', 'mock')),
  status text not null default 'live'
    check (status in ('live', 'finished', 'failed', 'cancelled')),
  -- [{ role: 'examiner' | 'candidate', text: string, at: number }]
  transcript jsonb not null default '[]'::jsonb,
  -- Giọng giám khảo: 'en-GB' | 'en-US'
  voice text not null default 'en-GB' check (voice in ('en-GB', 'en-US')),
  -- Bộ đếm chi phí: mỗi lượt gọi AI (brain) và mỗi lượt tổng hợp giọng (voice).
  brain_calls integer not null default 0,
  voice_calls integer not null default 0,
  question_count integer not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists speaking_live_sessions_user_idx
  on public.speaking_live_sessions (user_id, created_at desc);
create index if not exists speaking_live_sessions_attempt_idx
  on public.speaking_live_sessions (attempt_id);
create index if not exists speaking_live_sessions_live_idx
  on public.speaking_live_sessions (user_id)
  where status = 'live';

-- ---------------------------------------------------------------- RLS

alter table public.speaking_live_sessions enable row level security;

drop policy if exists speaking_live_sessions_read_own on public.speaking_live_sessions;
create policy speaking_live_sessions_read_own on public.speaking_live_sessions
  for select to authenticated
  using (user_id = auth.uid() and private.is_active_user());

drop policy if exists speaking_live_sessions_insert_own on public.speaking_live_sessions;
create policy speaking_live_sessions_insert_own on public.speaking_live_sessions
  for insert to authenticated
  with check (user_id = auth.uid() and private.is_active_user());

drop policy if exists speaking_live_sessions_update_own on public.speaking_live_sessions;
create policy speaking_live_sessions_update_own on public.speaking_live_sessions
  for update to authenticated
  using (user_id = auth.uid() and private.is_active_user())
  with check (user_id = auth.uid() and private.is_active_user());

revoke all on public.speaking_live_sessions from anon;
grant select, insert, update on public.speaking_live_sessions to authenticated;

commit;
