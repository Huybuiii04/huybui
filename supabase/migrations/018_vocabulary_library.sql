-- Thư viện từ vựng IELTS: 25 chủ đề × 200 mục, đọc công khai.
begin;

create extension if not exists pg_trgm;

create table if not exists public.vocabulary_topics (
  key text primary key,
  number integer not null,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.vocabulary_entries (
  id uuid primary key default gen_random_uuid(),
  topic_key text not null references public.vocabulary_topics (key) on delete cascade,
  term text not null,
  pos text not null default '',
  meaning text not null default '',
  definition text not null default '',
  examples text[] not null default '{}',
  ipa text,
  sort_order integer not null default 0,
  unique (topic_key, term)
);

create index if not exists vocabulary_entries_topic_idx on public.vocabulary_entries (topic_key, sort_order);
create index if not exists vocabulary_entries_term_idx on public.vocabulary_entries using gin (term gin_trgm_ops);

alter table public.vocabulary_topics enable row level security;
alter table public.vocabulary_entries enable row level security;

drop policy if exists vocabulary_topics_read on public.vocabulary_topics;
create policy vocabulary_topics_read on public.vocabulary_topics
for select to anon, authenticated
using (true);

drop policy if exists vocabulary_entries_read on public.vocabulary_entries;
create policy vocabulary_entries_read on public.vocabulary_entries
for select to anon, authenticated
using (true);

revoke all on public.vocabulary_topics from anon;
revoke all on public.vocabulary_entries from anon;
grant select on public.vocabulary_topics to anon, authenticated;
grant select on public.vocabulary_entries to anon, authenticated;

commit;
