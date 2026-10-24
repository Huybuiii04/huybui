-- 013_user_prompts_realtime.sql
--
-- 1. Bảng `user_prompts`: đề bài do chính người dùng nhập, có RLS theo chủ sở hữu.
-- 2. Bucket `user-prompt-media` (riêng tư) cho ảnh/PDF đính kèm của đề tự nhập.
-- 3. Bật Realtime cho các bảng người dùng đồng bộ giữa nhiều thiết bị.
--
-- Idempotent: chạy lại nhiều lần không lỗi.

begin;

-- ---------------------------------------------------------------- đề của người dùng

create table if not exists public.user_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_type text not null check (task_type in ('task2', 'academic_task1', 'general_task1')),
  title text not null default '',
  prompt_text text not null default '',
  reference_data text not null default '',
  file_path text,
  file_name text,
  file_kind text check (file_kind in ('image', 'pdf')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_prompts_user_created_idx on public.user_prompts (user_id, created_at desc);

alter table public.user_prompts enable row level security;

drop policy if exists user_prompts_read_own on public.user_prompts;
create policy user_prompts_read_own on public.user_prompts
  for select to authenticated
  using (user_id = auth.uid() or private.is_admin());

drop policy if exists user_prompts_insert_own on public.user_prompts;
create policy user_prompts_insert_own on public.user_prompts
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists user_prompts_update_own on public.user_prompts;
create policy user_prompts_update_own on public.user_prompts
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists user_prompts_delete_own on public.user_prompts;
create policy user_prompts_delete_own on public.user_prompts
  for delete to authenticated
  using (user_id = auth.uid() or private.is_admin());

revoke all on public.user_prompts from anon;
grant select, insert, update, delete on public.user_prompts to authenticated;

-- trigger updated_at
drop trigger if exists user_prompts_set_updated_at on public.user_prompts;
create trigger user_prompts_set_updated_at
  before update on public.user_prompts
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------- bucket media của đề tự nhập

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-prompt-media', 'user-prompt-media', false, 5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists user_prompt_media_owner_read on storage.objects;
create policy user_prompt_media_owner_read on storage.objects
  for select to authenticated
  using (bucket_id = 'user-prompt-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists user_prompt_media_owner_insert on storage.objects;
create policy user_prompt_media_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'user-prompt-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists user_prompt_media_owner_update on storage.objects;
create policy user_prompt_media_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'user-prompt-media' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'user-prompt-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists user_prompt_media_owner_delete on storage.objects;
create policy user_prompt_media_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'user-prompt-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------- realtime

-- Realtime cần REPLICA IDENTITY FULL để gửi payload đầy đủ khi UPDATE/DELETE.
alter table public.essays replica identity full;
alter table public.study_cards replica identity full;
alter table public.guide_progress replica identity full;
alter table public.user_prompts replica identity full;

do $$
declare
  v_table text;
begin
  foreach v_table in array array['essays', 'study_cards', 'guide_progress', 'user_prompts'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = v_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', v_table);
    end if;
  end loop;
end;
$$;

commit;
