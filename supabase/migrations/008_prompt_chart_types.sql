-- 008_prompt_chart_types.sql
-- Module: prompt library (nhóm dạng biểu đồ cho Task 1 Academic)
--
-- Task 1 Academic chia theo 7 dạng: line, bar, pie, table, map, process, mixed.
-- prompts.subtype của các đề academic_task1 trỏ đúng key của bảng này.
-- Frontend đọc bảng này để dựng lưới nhóm; bấm vào nhóm sẽ lọc
-- GET /rest/v1/prompts?task=eq.academic_task1&subtype=eq.bar

begin;

create table if not exists public.prompt_chart_types (
  key text primary key,
  label_vi text not null,
  label_en text not null,
  description_vi text not null default '',
  description_en text not null default '',
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompt_chart_types_order_idx on public.prompt_chart_types (sort_order) where status = 'published';

drop trigger if exists prompt_chart_types_set_updated_at on public.prompt_chart_types;
create trigger prompt_chart_types_set_updated_at
before update on public.prompt_chart_types
for each row execute function private.set_updated_at();

alter table public.prompt_chart_types enable row level security;

drop policy if exists prompt_chart_types_read_published on public.prompt_chart_types;
create policy prompt_chart_types_read_published on public.prompt_chart_types
for select to anon, authenticated
using (status = 'published' or private.is_admin());

drop policy if exists prompt_chart_types_write_admin on public.prompt_chart_types;
create policy prompt_chart_types_write_admin on public.prompt_chart_types
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

revoke all on public.prompt_chart_types from anon;
grant select on public.prompt_chart_types to anon, authenticated;
grant insert, update, delete on public.prompt_chart_types to authenticated;

-- Chặn đề Task 1 Academic có subtype không nằm trong danh sách dạng biểu đồ.
-- 'own' được phép: đề do người dùng tự thêm.
create or replace function private.validate_prompt_subtype()
returns trigger language plpgsql set search_path = private, public as $$
begin
  if new.task = 'academic_task1' and new.subtype <> '' and new.subtype <> 'own' then
    if not exists (select 1 from public.prompt_chart_types where key = new.subtype) then
      raise exception 'subtype % không có trong prompt_chart_types', new.subtype using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prompts_validate_subtype on public.prompts;
create trigger prompts_validate_subtype
before insert or update on public.prompts
for each row execute function private.validate_prompt_subtype();

revoke execute on function private.validate_prompt_subtype() from public, anon, authenticated;
grant execute on function private.validate_prompt_subtype() to service_role;

commit;
