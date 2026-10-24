-- 015_admin_read_policies.sql
--
-- Cho phép admin đọc dữ liệu quản trị mà RLS "chỉ chủ sở hữu" đang chặn:
-- danh sách người dùng, trạng thái truy cập, hàng đợi AI và kết quả chấm.
--
-- Idempotent: chạy lại nhiều lần không lỗi.

begin;

-- profiles: admin xem tất cả hồ sơ
drop policy if exists profiles_read_admin on public.profiles;
create policy profiles_read_admin on public.profiles
  for select to authenticated
  using (private.is_admin());

-- user_access: admin xem vai trò/trạng thái của mọi người
drop policy if exists user_access_read_admin on public.user_access;
create policy user_access_read_admin on public.user_access
  for select to authenticated
  using (private.is_admin());

-- ai_jobs: admin xem toàn bộ hàng đợi AI
drop policy if exists ai_jobs_read_admin on public.ai_jobs;
create policy ai_jobs_read_admin on public.ai_jobs
  for select to authenticated
  using (private.is_admin());

-- essay_revisions + grading_results: admin xem kết quả chấm
drop policy if exists essay_revisions_read_admin on public.essay_revisions;
create policy essay_revisions_read_admin on public.essay_revisions
  for select to authenticated
  using (private.is_admin());

drop policy if exists grading_results_read_admin on public.grading_results;
create policy grading_results_read_admin on public.grading_results
  for select to authenticated
  using (private.is_admin());

-- user_prompts: admin xem đề tự nhập của mọi người
drop policy if exists user_prompts_read_admin on public.user_prompts;
create policy user_prompts_read_admin on public.user_prompts
  for select to authenticated
  using (private.is_admin());

commit;
