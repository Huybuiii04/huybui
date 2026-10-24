-- 002_content_storage.sql
-- Module: content / storage

begin;

create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('vocabulary', 'template', 'sample', 'guide', 'exercise', 'prompt')),
  slug text not null,
  task_type text check (task_type in ('task2', 'academic_task1', 'general_task1')),
  skill_tags text[] not null default '{}',
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);

create table if not exists public.content_translations (
  entry_id uuid not null references public.content_entries (id) on delete cascade,
  locale text not null check (locale in ('vi', 'en')),
  title text not null default '',
  summary text not null default '',
  body text not null default '',
  updated_at timestamptz not null default now(),
  primary key (entry_id, locale)
);

create table if not exists public.writing_prompts (
  id uuid primary key default gen_random_uuid(),
  task_type text not null check (task_type in ('task2', 'academic_task1', 'general_task1')),
  subtype text not null default '',
  prompt_text text not null,
  reference_data text not null default '',
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists content_entries_kind_status_slug_idx on public.content_entries (kind, status, slug);
create index if not exists writing_prompts_task_status_idx on public.writing_prompts (task_type, status);

drop trigger if exists content_entries_set_updated_at on public.content_entries;
create trigger content_entries_set_updated_at
before update on public.content_entries
for each row execute function private.set_updated_at();

drop trigger if exists content_translations_set_updated_at on public.content_translations;
create trigger content_translations_set_updated_at
before update on public.content_translations
for each row execute function private.set_updated_at();

alter table public.content_entries enable row level security;
alter table public.content_translations enable row level security;
alter table public.writing_prompts enable row level security;

drop policy if exists content_entries_read on public.content_entries;
create policy content_entries_read on public.content_entries
for select to anon, authenticated
using (status = 'published' or private.is_admin());

drop policy if exists content_translations_read on public.content_translations;
create policy content_translations_read on public.content_translations
for select to anon, authenticated
using (exists (
  select 1 from public.content_entries entry
  where entry.id = entry_id and (entry.status = 'published' or private.is_admin())
));

drop policy if exists writing_prompts_read on public.writing_prompts;
create policy writing_prompts_read on public.writing_prompts
for select to anon, authenticated
using (status = 'published' or private.is_admin());

revoke all on public.content_entries from anon;
revoke all on public.content_translations from anon;
revoke all on public.writing_prompts from anon;
grant select on public.content_entries to anon, authenticated;
grant select on public.content_translations to anon, authenticated;
grant select on public.writing_prompts to anon, authenticated;

-- Storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('essay-images', 'essay-images', false, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('content-media', 'content-media', false, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('donation-media', 'donation-media', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists essay_images_owner_read on storage.objects;
create policy essay_images_owner_read on storage.objects
for select to authenticated
using (bucket_id = 'essay-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists essay_images_owner_insert on storage.objects;
create policy essay_images_owner_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'essay-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists essay_images_owner_delete on storage.objects;
create policy essay_images_owner_delete on storage.objects
for delete to authenticated
using (bucket_id = 'essay-images' and (storage.foldername(name))[1] = auth.uid()::text);

commit;
