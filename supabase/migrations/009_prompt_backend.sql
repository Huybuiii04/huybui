-- 009_prompt_backend.sql
-- Module: prompt library (phần backend bổ sung)
--
-- Bổ sung những phần còn thiếu cho bảng prompts / prompt_topics:
--   * cột updated_by (ai đã sửa) và quyền ghi cho admin
--   * index (task, set_name) để lọc theo bộ đề
--   * RPC get_prompt(slug) để lấy một đề theo slug
--   * bỏ bảng writing_prompts (đã bị prompts thay thế) và trỏ lại FK của essays

begin;

alter table public.prompts add column if not exists updated_by uuid references auth.users (id) on delete set null;
alter table public.prompt_topics add column if not exists updated_by uuid references auth.users (id) on delete set null;
alter table public.prompt_topics add column if not exists status text not null default 'published'
  check (status in ('draft', 'published', 'hidden'));

create index if not exists prompts_task_set_idx on public.prompts (task, set_name);
create index if not exists prompt_topics_order_idx on public.prompt_topics (sort_order) where status = 'published';

-- Ghi chỉ dành cho admin (đọc thì policy prompts_read_published / prompt_topics_read_published lo).
drop policy if exists prompts_admin_write on public.prompts;
create policy prompts_admin_write on public.prompts
for all to authenticated
using (private.is_admin()) with check (private.is_admin());

drop policy if exists prompt_topics_read on public.prompt_topics;
drop policy if exists prompt_topics_admin_write on public.prompt_topics;

grant select, insert, update, delete on public.prompts to authenticated;
grant insert, update, delete on public.prompt_topics to authenticated;

-- Lấy một đề theo slug. RLS áp dụng bình thường nên anon chỉ thấy đề published.
create or replace function public.get_prompt(p_slug text)
returns jsonb
language sql
stable
set search_path = public, private
as $$
  select to_jsonb(p) from public.prompts p
  where p.slug = p_slug and (p.status = 'published' or private.is_admin())
  limit 1;
$$;

grant execute on function public.get_prompt(text) to anon, authenticated;

-- essays.prompt_id trỏ sang bảng prompts (đầy đủ hơn writing_prompts và có dữ liệu thật).
alter table public.essays drop constraint if exists essays_prompt_id_fkey;
alter table public.essays add constraint essays_prompt_id_fkey
  foreign key (prompt_id) references public.prompts (id) on delete set null;
drop table if exists public.writing_prompts;

commit;
