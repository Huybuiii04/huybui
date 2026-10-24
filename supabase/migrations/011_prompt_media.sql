-- 011_prompt_media.sql
-- Module: prompt library (ảnh đề Task 1)
--
-- Bucket công khai cho ảnh đề (bản scan đề thi và biểu đồ tự vẽ).
-- Ảnh nằm trong prompts.chart = { kind: 'image', url, alt } nên frontend lấy thẳng URL.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('prompt-media', 'prompt-media', true, 8388608, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Bucket công khai: không cần policy riêng cho đọc.
-- Ghi chỉ qua service key (script seed), không cho client ghi trực tiếp.
drop policy if exists prompt_media_read on storage.objects;
create policy prompt_media_read on storage.objects
for select to anon, authenticated
using (bucket_id = 'prompt-media');

commit;
