-- 020_donation_qr.sql
--
-- Bucket `donation-media` chứa mã QR ủng hộ công khai:
--   + mọi người đọc được (anon, authenticated) để hiện trong trang /donate
--   + admin được upload/xoá từ bảng quản trị
--
-- Idempotent: chạy lại nhiều lần không lỗi.

begin;

drop policy if exists donation_media_read on storage.objects;
create policy donation_media_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'donation-media');

drop policy if exists donation_media_admin_insert on storage.objects;
create policy donation_media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'donation-media' and private.is_admin());

drop policy if exists donation_media_admin_update on storage.objects;
create policy donation_media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'donation-media' and private.is_admin())
  with check (bucket_id = 'donation-media' and private.is_admin());

drop policy if exists donation_media_admin_delete on storage.objects;
create policy donation_media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'donation-media' and private.is_admin());

commit;
