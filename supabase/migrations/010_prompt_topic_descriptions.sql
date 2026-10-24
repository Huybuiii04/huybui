-- 009_prompt_topic_descriptions.sql
-- Module: prompt library (mô tả chủ đề song ngữ)
--
-- prompt_topics mới chỉ có nhãn + từ khóa con (tiếng Anh). Frontend cần mô tả
-- tiếng Việt để lưới chủ đề không bị trộn ngôn ngữ khi chọn VI.
-- Sau khi áp migration này, chạy npm run db:seed để nạp description_vi/description_en.

begin;

alter table public.prompt_topics
  add column if not exists description_vi text not null default '',
  add column if not exists description_en text not null default '';

commit;
