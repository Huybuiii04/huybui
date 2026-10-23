-- 001_identity_access.sql
-- Module: identity / access
-- Idempotent: chạy lại được nhiều lần.

begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function private.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  ui_locale text not null default 'vi' check (ui_locale in ('vi', 'en')),
  feedback_locale text not null default 'vi' check (feedback_locale in ('vi', 'en')),
  timezone text not null default 'Asia/Ho_Chi_Minh',
  target_band numeric(2, 1) not null default 7.0 check (target_band >= 0 and target_band <= 9),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_access (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create or replace function private.is_active_user()
returns boolean language sql stable security definer set search_path = private, public as $$
  select exists (
    select 1 from public.user_access
    where user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = private, public as $$
  select exists (
    select 1 from public.user_access
    where user_id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

revoke execute on function private.is_active_user() from public, anon;
revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_active_user() to authenticated, service_role;
grant execute on function private.is_admin() to authenticated, service_role;
grant execute on function private.set_updated_at() to authenticated, service_role;
-- Policy của bảng nội dung (002) gọi private.is_admin() cho role anon.
-- PostgreSQL kiểm tra quyền EXECUTE lúc chuẩn bị câu lệnh (không phải
-- short-circuit theo từng dòng), nên thiếu quyền này sẽ khiến mọi truy vấn
-- anon lên content_entries/content_translations/writing_prompts lỗi
-- "permission denied for function is_admin".
-- Hàm là security definer và với anon luôn trả false (auth.uid() = null),
-- nên anon vẫn chỉ thấy status='published' (spec §6).
grant execute on function private.is_admin() to anon;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = private, public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  insert into public.user_access (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_access enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select to authenticated using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists user_access_select_own on public.user_access;
create policy user_access_select_own on public.user_access
for select to authenticated using (user_id = auth.uid());

revoke all on public.profiles from anon;
revoke all on public.user_access from anon;
grant select on public.profiles to authenticated;
-- chỉ cho sửa các cột hồ sơ, không sửa được created_at/id (spec §5.3)
grant update (display_name, ui_locale, feedback_locale, timezone, target_band) on public.profiles to authenticated;
grant select on public.user_access to authenticated;

commit;
