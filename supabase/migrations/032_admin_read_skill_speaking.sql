-- 032_admin_read_skill_speaking.sql
--
-- Cho phép admin đọc lượt làm bài Reading và Speaking của mọi người.
--
-- Hai bảng này trước đây chỉ có policy "chỉ chủ sở hữu" nên trang hồ sơ
-- người dùng trong bảng quản trị không lấy được số liệu làm bài.
--
-- Idempotent: chạy lại nhiều lần không lỗi.

begin;

drop policy if exists skill_attempts_read_admin on public.skill_attempts;
create policy skill_attempts_read_admin on public.skill_attempts
  for select to authenticated
  using (private.is_admin());

drop policy if exists speaking_attempts_read_admin on public.speaking_attempts;
create policy speaking_attempts_read_admin on public.speaking_attempts
  for select to authenticated
  using (private.is_admin());

commit;
