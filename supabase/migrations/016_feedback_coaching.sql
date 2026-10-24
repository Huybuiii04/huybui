-- 016_feedback_coaching.sql
-- Module: phản hồi sâu hơn band score
--
-- Thêm 3 nhóm phản hồi do pipeline `enrich` sinh:
--   unnatural       — câu viết chưa hợp lý / lặp ý / thiếu căn cứ
--   vocabulary_plan — từ vựng nên học theo chủ đề + band mục tiêu
--   band_plan       — lộ trình cụ thể để đi từ band hiện tại lên band mục tiêu
--
-- Idempotent, không backfill: bản cũ đọc được (NULL = không có dữ liệu).

begin;

alter table public.essay_features add column if not exists unnatural jsonb;
alter table public.essay_features add column if not exists vocabulary_plan jsonb;
alter table public.essay_features add column if not exists band_plan jsonb;

comment on column public.essay_features.unnatural is 'Câu viết chưa hợp lý kèm gợi ý sửa';
comment on column public.essay_features.vocabulary_plan is 'Từ vựng nên học theo chủ đề và band mục tiêu';
comment on column public.essay_features.band_plan is 'Các bước nâng band từ điểm hiện tại lên band mục tiêu';

commit;
