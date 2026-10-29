-- 030_speaking_voice_cache.sql
-- Cache audio giám khảo cho đề Cambridge (Speaking live).
--
-- Mỗi câu hỏi được tổng hợp giọng một lần rồi lưu vào Storage, đường dẫn
-- `voices/{accent}/{sha256(text|accent)}.mp3`. Khi mở phiên live, Edge Function
-- tra cache trước → câu hỏi Cambridge phát ngay thay vì chờ 2–4 giây gọi TTS.
-- Câu follow-up sinh động thì không có trong cache và vẫn tổng hợp trực tiếp.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'speaking-voice',
  'speaking-voice',
  false,
  4194304,
  array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Chỉ Edge Function (service role) và script dựng sẵn dùng bucket này:
-- trình duyệt luôn đi qua Edge Function nên không cấp quyền cho authenticated.

revoke all on storage.objects from anon, authenticated;

commit;
