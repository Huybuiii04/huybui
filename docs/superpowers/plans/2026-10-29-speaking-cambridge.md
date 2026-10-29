# Speaking Cambridge 12–20 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nạp đề Speaking Cambridge 12–20 từ 9 file DOCX, chia theo cuốn → test → part, cho phép luyện từng part hoặc full 3 phần (4 lượt), rồi deploy.

**Spec:** `docs/superpowers/specs/2026-10-29-speaking-cambridge-design.md`

**Ràng buộc:** Module Reading không bị sửa. Các file dùng chung chỉ được thêm.

---

## Task 1: Script đọc DOCX → JSON

**Files:**
- Create: `scripts/build-speaking-cambridge.mjs`

- [ ] **Step 1**: Viết hàm đọc ZIP bằng `node:zlib` (`inflateRawSync`), lấy `word/document.xml`.
- [ ] **Step 2**: Tách `<w:p>` → `{ style, text }` theo `<w:pStyle w:val="…"/>`.
- [ ] **Step 3**: Parse theo `Heading 1/2/3`, `SourceLine`, `SpeakingText`, `SpeakingQuestion`.
- [ ] **Step 4**: Hàm làm sạch OCR (`cleanLine`, `stripBullet`, `stripNumbering`, `dropWatermark`,
  `mergeWrapped`, `fixPunctuation`).
- [ ] **Step 5**: Ghi `supabase/seed/speaking-cambridge.json` + `supabase/seed/speaking-cambridge-flags.md`.
- [ ] **Step 6**: Chạy `node scripts/build-speaking-cambridge.mjs`, kiểm tra 144 dòng, rà flags.

## Task 2: Migration + seed

**Files:**
- Create: `supabase/migrations/028_speaking_cambridge.sql`
- Create: `supabase/seed/seed-speaking-cambridge.mjs`
- Modify: `package.json` (`db:seed:speaking:cambridge`)

- [ ] **Step 1**: Viết migration (cột mới + index + `speaking_attempts`).
- [ ] **Step 2**: Viết seed script upsert theo `slug`.
- [ ] **Step 3**: `npm run db:migrate` → `npm run db:seed:speaking:cambridge` → xác nhận 144 dòng.

## Task 3: Backend

**Files:**
- Modify: `supabase/functions/_shared/ai/speakingPlan.ts`
- Modify: `supabase/functions/_shared/schemas.ts`
- Modify: `supabase/functions/submit-speaking/index.ts`
- Modify: `supabase/functions/_shared/tests/speaking.test.ts`

- [ ] **Step 1**: Test failing — `buildSpeakingPlan` với `setRows` (part-1/2/3 → 1 turn, mock → 4 turn).
- [ ] **Step 2**: Implement `buildSpeakingPlan` mới.
- [ ] **Step 3**: `parsePrepareSpeaking` nhận `bookNumber`/`testNumber`, validate.
- [ ] **Step 4**: `submit-speaking` nạp set rows, lưu `book_number`/`test_number` vào attempt.
- [ ] **Step 5**: `npm run test:edge` xanh.

## Task 4: Client logic

**Files:**
- Modify: `src/lib/speakingLogic.ts`
- Modify: `tests/speaking.test.ts`

- [ ] **Step 1**: Test failing — `buildSessionPlan('mock')` 4 lượt; `groupSpeakingTests`.
- [ ] **Step 2**: Implement.
- [ ] **Step 3**: `npm test` xanh.

## Task 5: Frontend

**Files:**
- Modify: `src/lib/speaking.ts`
- Modify: `src/pages/Speaking.tsx`
- Modify: `src/pages/SpeakingRoom.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1**: `loadSpeakingTests()` trả rows có `book_number`/`test_number`.
- [ ] **Step 2**: Hub: chips Cambridge + card từng test + nút luyện từng part + "Luyện cả 3 phần".
- [ ] **Step 3**: Route `/app/speaking/:mode/:book/:test`.
- [ ] **Step 4**: Phòng luyện nhận book/test/topic, gửi prepare, hiện nhãn test.
- [ ] **Step 5**: `npm run build` sạch.

## Task 6: Deploy

- [x] **Step 1**: `npm run db:migrate` + `npm run db:seed:speaking:cambridge` (144 dòng, idempotent).
- [x] **Step 2**: `npm run db:deploy` (Edge Function `submit-speaking` + toàn bộ 15 function).
- [x] **Step 3**: `git push origin feature/reading-module:main`.
- [ ] **Step 4**: Deploy Vercel — **người dùng yêu cầu KHÔNG deploy Vercel**; đã rollback về bản production
      trước đó (`huybui-3p6dgc6sj`). Frontend vẫn chạy bản cũ, backend Supabase đã có đầy đủ dữ liệu + function mới.
- [x] **Step 5**: Kiểm thử trình duyệt `tests/speaking-flow.mjs` (11 assertion, xanh) + `npm test` (236) +
      `npm run test:edge` (136) + `npm run build` sạch.
