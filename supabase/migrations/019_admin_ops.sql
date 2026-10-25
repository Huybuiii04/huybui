-- 019_admin_ops.sql
--
-- Cho admin đọc dữ liệu người dùng để theo dõi hoạt động:
-- bài viết, thẻ từ vựng, sổ lỗi sai và nhật ký thao tác quản trị.
--
-- Mọi thao tác GHI vẫn đi qua Edge Function (service_role) để có audit log.
--
-- Idempotent: chạy lại nhiều lần không lỗi.

begin;

drop policy if exists essays_read_admin on public.essays;
create policy essays_read_admin on public.essays
  for select to authenticated
  using (private.is_admin());

drop policy if exists study_cards_read_admin on public.study_cards;
create policy study_cards_read_admin on public.study_cards
  for select to authenticated
  using (private.is_admin());

drop policy if exists error_logs_read_admin on public.error_logs;
create policy error_logs_read_admin on public.error_logs
  for select to authenticated
  using (private.is_admin());

drop policy if exists essay_features_read_admin on public.essay_features;
create policy essay_features_read_admin on public.essay_features
  for select to authenticated
  using (private.is_admin());

drop policy if exists admin_audit_logs_read_admin on public.admin_audit_logs;
create policy admin_audit_logs_read_admin on public.admin_audit_logs
  for select to authenticated
  using (private.is_admin());

commit;
