-- 007_prompt_topics.sql
-- Module: prompt library (chủ đề → danh sách đề)
--
-- Luồng người dùng: chọn chủ đề → xem danh sách đề của chủ đề đó → chọn 1 đề.
--   * public.prompt_topics: siêu dữ liệu chủ đề (nhãn VI/EN, từ khóa con, thứ tự).
--     Frontend đọc bảng này để dựng lưới chủ đề; không hardcode danh sách chủ đề.
--   * public.prompts.topics: text[] chứa các `key` của prompt_topics.
--     Lọc nhanh bằng GIN index + toán tử @> của Postgres.

begin;

create table if not exists public.prompt_topics (
  key text primary key,
  label_vi text not null,
  label_en text not null,
  subtopics text[] not null default '{}',
  task text check (task in ('task2', 'academic_task1', 'general_task1')),
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bảng có thể đã tồn tại từ lần chạy trước (tạo tay ngoài migration) và thiếu cột status.
alter table public.prompt_topics add column if not exists status text not null default 'published'
  check (status in ('draft', 'published', 'hidden'));
alter table public.prompt_topics add column if not exists updated_by uuid references auth.users (id) on delete set null;

create index if not exists prompt_topics_order_idx on public.prompt_topics (sort_order) where status = 'published';
create index if not exists prompt_topics_task_idx on public.prompt_topics (task, sort_order) where status = 'published';

drop trigger if exists prompt_topics_set_updated_at on public.prompt_topics;
create trigger prompt_topics_set_updated_at
before update on public.prompt_topics
for each row execute function private.set_updated_at();

alter table public.prompt_topics enable row level security;

drop policy if exists prompt_topics_read_published on public.prompt_topics;
create policy prompt_topics_read_published on public.prompt_topics
for select to anon, authenticated
using (status = 'published' or private.is_admin());

drop policy if exists prompt_topics_write_admin on public.prompt_topics;
create policy prompt_topics_write_admin on public.prompt_topics
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

revoke all on public.prompt_topics from anon;
grant select on public.prompt_topics to anon, authenticated;
grant insert, update, delete on public.prompt_topics to authenticated;

-- Ràng buộc toàn vẹn: mọi `topics` của prompts phải tồn tại trong prompt_topics.
-- Kiểm tra này chỉ chạy khi cả hai bảng đã có dữ liệu (sau khi seed).
do $$
begin
  if exists (select 1 from public.prompts limit 1) and exists (select 1 from public.prompt_topics limit 1) then
    if exists (
      select 1 from public.prompts p
      where exists (
        select 1 from unnest(p.topics) as topic(key)
        where not exists (select 1 from public.prompt_topics t where t.key = topic.key)
      )
    ) then
      raise exception 'prompts.topics chứa key không có trong prompt_topics — hãy seed prompt_topics trước';
    end if;
  end if;
end;
$$;

-- Truy vấn lọc theo chủ đề (frontend dùng đúng cú pháp này):
--   GET /rest/v1/prompts?task=eq.task2&topics=cs.{education}&select=*
-- Kiểm tra nhanh:
--   select key, count(*) from public.prompts, unnest(topics) group by key;

commit;
