# Speaking Cambridge 12–20 — Design Spec

- **Date:** 2026-10-29
- **Status:** Approved (user: "oke triển khai")
- **Branch:** `feature/reading-module` (tiếp tục trên branch hiện tại)
- **Nguồn dữ liệu:** 9 file `.docx` trong
  `C:\Users\ACER\OneDrive\Máy tính\IELTS_Speaking_Cambridge_12-20_Word_Pack\Theo_tung_Cambridge\`

---

## 0. Ràng buộc

- Module **Reading không bị sửa** (giữ nguyên nguyên tắc của spec Speaking trước).
- Các file dùng chung chỉ được **thêm**, không sửa logic cũ.
- Nội dung đề **không nằm trong mã nguồn**: seed bằng script vào Postgres, frontend đọc qua
  `src/lib/speaking.ts`.

---

## 1. Quyết định đã chốt (với user)

| Quyết định | Chọn |
|---|---|
| Kho câu hỏi | **Thay thế trong UI** — chỉ hiện Cambridge 12–20. 79 câu tổng hợp vẫn nằm trong DB, không hiện, không xoá. |
| Phiên "Full 3 phần" | **4 lượt ghi âm**: Part 1 → Part 2 → Part 3 chủ đề A → Part 3 chủ đề B. |
| Chất lượng OCR | **Tự sửa lỗi rõ ràng bằng script**; câu hỏng nặng giữ nguyên và gắn cờ trong báo cáo để kiểm tra tay. |

## 2. Mục tiêu

Người học vào `/app/speaking`, chọn **cuốn Cambridge (12…20)**, chọn **Test**, rồi chọn:

- **Part 1** (1 lượt, 60s) — chủ đề + 4 câu hỏi
- **Part 2** (1 lượt, 120s) — cue card
- **Part 3** (1 lượt, 90s) — chủ đề A **hoặc** chủ đề B, mỗi chủ đề 3 câu
- **Full 3 phần** (4 lượt) — Part 1 → Part 2 → Part 3A → Part 3B của **cùng một test**

AI chấm 4 tiêu chí chính thức như module Speaking hiện có (không thay đổi pipeline AI).

---

## 3. Nguồn dữ liệu: DOCX → JSON

### 3.1 Cấu trúc DOCX (đã kiểm tra cả 9 file)

| Style Word | Ý nghĩa |
|---|---|
| `Heading 1` | `Cambridge IELTS 12` … `Cambridge IELTS 20` |
| `Heading 2` | `Test 1` … `Test 4` (Cambridge 12 dùng `Test 5…8`) |
| `SourceLine` | `Nguồn: <file>.pdf | Trang PDF: 30` |
| `Heading 3` | `SPEAKING | PART 1` / `PART 2` / `PART 3` |
| `SpeakingText` | mô tả, topic, bullet cue card, "You should say:" |
| `SpeakingQuestion` | câu hỏi |
| `SpeakingNote` | ghi chú tài liệu (bỏ qua) |

Khác biệt giữa các cuốn:

- **Cambridge 12–19**: Part 1 = `EXAMPLE` + tên topic + 4 câu; Part 2 = "Describe …" +
  `You should say:` + 3–4 bullet + `and explain …`; Part 3 = `Discussion topics:` + 2 topic +
  `Example questions:` + 3 câu mỗi topic.
- **Cambridge 20**: Part 1 = `Please answer the questions 1-4` + 4 câu đánh số (không có tên
  topic); Part 2 giống 12–19; Part 3 = `Please answer the questions 1-6` + 6 câu, chia 2 nhóm 3
  câu, không có tên topic.

### 3.2 Script `scripts/build-speaking-cambridge.mjs`

- Đọc DOCX **không cần dependency**: tự giải nén ZIP bằng `node:zlib` (`inflateRawSync`),
  đọc `word/document.xml`, tách `<w:p>` theo `<w:pStyle w:val="…"/>` để lấy style + text.
- Đường dẫn nguồn: biến môi trường `SPEAKING_DOCX_DIR`, mặc định đường dẫn OneDrive ở trên.
- Xuất:
  - `supabase/seed/speaking-cambridge.json` — dữ liệu chuẩn hoá.
  - `supabase/seed/speaking-cambridge-flags.md` — các dòng còn lỗi OCR để sửa tay.
- Idempotent: chạy lại cho kết quả giống nhau.

### 3.3 Quy tắc làm sạch OCR (tự động, có thể đảo ngược)

1. Bỏ ký tự rác: `•`, `»`, `-` ở đầu dòng, `·` lạ, khoảng trắng thừa.
2. Bỏ số thứ tự đầu dòng: `1.`, `2)`, `'3.` → bỏ (IELTS không đánh số câu hỏi).
3. Bỏ watermark: dòng chứa `gg com/…`, `ep com/…`, dòng chỉ có `z` / `sg`.
4. Gộp dòng bị cắt giữa câu: dòng trước không kết thúc bằng `?` `!` `.` `]` và dòng sau bắt
   đầu bằng chữ thường → nối bằng một khoảng trắng (chỉ áp dụng trong Part 1 và Part 3, **không**
   áp dụng cho bullet của cue card).
5. Sửa lỗi dấu câu dính trong từ: `chữ,chữ` → `chữchữ`; `chữ:chữ` → `chữochữ`.
6. Chuẩn hoá dấu nháy kép cong → thẳng, gộp khoảng trắng, bỏ khoảng trắng trước dấu câu.
7. Dòng kết quả vẫn chứa ký tự lạ (`·`, `«`, `»`, `z` cuối câu, từ dính dấu gạch) → **giữ nguyên**
   và ghi vào báo cáo flags.

### 3.4 Chuẩn hoá dữ liệu mỗi test

| Part | `topic` | `questions` / `cue_card` |
|---|---|---|
| Part 1 | tên topic (Cambridge 12–19) hoặc `Speaking Part 1` (Cambridge 20) | 4 câu hỏi |
| Part 2 | tên cue card (lấy từ câu "Describe …") | `cue_card = { topic, bullets[3-4], time_limit_seconds: 120 }` |
| Part 3 | tên topic (Cambridge 12–19) hoặc `Discussion topic 1/2` (Cambridge 20) | 3 câu hỏi |

`prompt_text` = câu hỏi đầu tiên (Part 1/3) hoặc câu "Describe …" (Part 2).

---

## 4. Data model

### Migration `supabase/migrations/028_speaking_cambridge.sql`

```sql
alter table public.speaking_questions
  add column if not exists book_number integer,
  add column if not exists test_number integer,
  add column if not exists sub_index integer not null default 0,
  add column if not exists source_label text not null default '';

create index if not exists speaking_questions_book_test_idx
  on public.speaking_questions (book_number, test_number, part, sub_index)
  where is_active;

alter table public.speaking_attempts
  add column if not exists book_number integer,
  add column if not exists test_number integer;
```

- `book_number`: 12…20. `test_number`: 1…4 (Cambridge 12: 5…8). `sub_index`: 0 cho Part 1/2,
  0/1 cho 2 chủ đề Part 3.
- Dữ liệu: 9 cuốn × 4 test × 4 dòng = **144 dòng**.
- `slug`: `cambridge-{book}-test-{test}-part-1`, `cambridge-{book}-test-{test}-part-2`,
  `cambridge-{book}-test-{test}-part-3-t1`, `…-part-3-t2`.
- `related_part3_slug` của dòng Part 2 trỏ tới dòng Part 3 (`t1`) của cùng test.

### Seed `supabase/seed/seed-speaking-cambridge.mjs`

Upsert theo `slug` (`?on_conflict=slug`), idempotent. Script: `npm run db:seed:speaking:cambridge`.

---

## 5. Backend

### 5.1 `buildSpeakingPlan` (`supabase/functions/_shared/ai/speakingPlan.ts`)

Input mới: `setRows: SpeakingQuestionRow[]` (4 dòng của 1 test) bên cạnh `pool` cũ.

| Mode | Kế hoạch |
|---|---|
| `part-1` | 1 turn — dòng `part-1` của test |
| `part-2` | 1 turn — dòng `part-2` của test |
| `part-3` | 1 turn — dòng `part-3` được chỉ định (`questionId`), mặc định `sub_index = 0` |
| `mock` | 4 turn — `part-1`, `part-2`, `part-3` (`sub_index` 0), `part-3` (`sub_index` 1) |

### 5.2 `submit-speaking` — phase `prepare`

- Input mới: `bookNumber` (int 12–20), `testNumber` (int 1–8), `questionId` (tuỳ chọn),
  `mode`, `question` (tự nhập, chỉ Part 1), `targetBand`, `feedbackLocale`.
- Server nạp đúng 4 dòng của test (`book_number`, `test_number`, `is_active`), dựng kế hoạch,
  tạo attempt (lưu `book_number`/`test_number`) và các turn.
- Thiếu `bookNumber`/`testNumber` → `400 test_required`.
- Không có đủ dòng → `409 no_speaking_questions`.

### 5.3 Client (`src/lib/speakingLogic.ts`)

- `buildSessionPlan(mode)` → `mock` = 4 lượt `part-1, part-2, part-3, part-3`.
- `groupSpeakingTests(rows)` → gom theo cuốn → test → part (logic thuần, có test).
- `speakingTestLabel(book, test)` → `Cambridge 12 · Test 3`.

---

## 6. Frontend

### 6.1 Route

```
/app/speaking                        → hub: chọn cuốn → chọn test → chọn part
/app/speaking/:mode/:book/:test      → phòng luyện (mode = part-1|part-2|part-3|mock)
```

Query `?topic=1` chọn chủ đề B của Part 3.

### 6.2 Hub `src/pages/Speaking.tsx`

- Chips Cambridge 12…20 (mặc định Cambridge 12) + ô tìm kiếm.
- Mỗi Test = 1 card: `Test N` + nguồn + 4 dòng (Part 1 · Part 2 · Part 3 A · Part 3 B), mỗi dòng
  1 nút *Luyện*; cuối card là nút **Luyện cả 3 phần (4 lượt)**.
- Bỏ 4 card mode cũ và danh sách 79 câu tổng hợp (dữ liệu vẫn còn trong DB).

### 6.3 Phòng luyện `src/pages/SpeakingRoom.tsx`

- Đọc `mode`/`book`/`test`/`topic` từ route, gửi `prepareSpeaking` với `bookNumber`/`testNumber`/
  `questionId`.
- Header hiện `Cambridge 12 · Test 3`; tiến độ `Lượt n / 4`.

---

## 7. Kiểm thử

- `tests/speaking.test.ts`: `buildSessionPlan('mock')` = 4 lượt đúng thứ tự; `groupSpeakingTests`
  gom đúng 9 cuốn × 4 test; `validateAudio` giữ nguyên; `computeOverallBand` giữ nguyên.
- `supabase/functions/_shared/tests/speaking.test.ts`: `buildSpeakingPlan` mới — part-1/2/3 đúng
  1 turn, mock đúng 4 turn đúng thứ tự, thiếu set → mảng rỗng.
- `npm test`, `npm run test:edge`, `npm run build` phải xanh.

---

## 8. Triển khai

```bash
npm run db:migrate                      # 028_speaking_cambridge.sql
npm run db:seed:speaking:cambridge      # 144 dòng
npm run db:deploy                       # Edge Function submit-speaking
git push origin main
npx vercel --prod --yes
node tests/production.mjs
```
