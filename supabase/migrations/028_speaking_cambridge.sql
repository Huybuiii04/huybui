-- 028_speaking_cambridge.sql
-- Module: speaking (luyện nói) — bổ sung đề Cambridge 12–20, chia theo cuốn / test / part.

begin;

-- Cột nhóm theo cuốn Cambridge và số test (NULL = câu hỏi tổng hợp cũ).
alter table public.speaking_questions
  add column if not exists book_number integer,
  add column if not exists test_number integer,
  add column if not exists sub_index integer not null default 0,
  add column if not exists source_label text not null default '';

create index if not exists speaking_questions_book_test_idx
  on public.speaking_questions (book_number, test_number, part, sub_index)
  where is_active;

-- Lưu lại cuốn/test của phiên luyện để xem lại lịch sử.
alter table public.speaking_attempts
  add column if not exists book_number integer,
  add column if not exists test_number integer;

commit;
