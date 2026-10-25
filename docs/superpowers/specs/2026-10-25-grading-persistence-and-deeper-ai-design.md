# Sửa lỗi lưu kết quả chấm + bỏ Explore + nâng độ sâu chấm AI

Ngày: 2026-10-25. Trạng thái: thiết kế đã chốt hướng, chờ duyệt trước khi triển khai.

Bối cảnh: người dùng báo *"chấm điểm xong nó lưu bài viết nhưng ko lưu kết quả đã chấm và những góp ý"*, đồng thời muốn bỏ phần Explore và nâng độ sâu chấm AI.

---

## 1. Điều tra đã làm

Đã tái hiện bằng script thật (`tests/repro-grading.mjs`, `tests/repro-frontend-read.mjs`, `tests/probe-enrich.mjs`) chạy trên Supabase project thật với user thật.

**Kết luận quan trọng: dữ liệu KHÔNG mất.** `grading_results` và `essay_features` được ghi đúng vào DB, và frontend đọc được bằng token của chính user (HTTP 200, đủ dữ liệu). Vấn đề là **UI không nạp lại kết quả đã lưu**, cộng thêm 3 lỗi phụ bên dưới.

### RC1 — Kết quả có trong DB nhưng UI không hiện (nguyên nhân chính)

`src/pages/Writing.tsx` chỉ set state `grading` / `features` / `errorLogs` **bên trong** hàm `grade()`. Mở lại một bài đã chấm (`/app/write?id=...`) → state khởi tạo là `null` → không có `useEffect` nào nạp lại kết quả đã lưu.

Thêm nữa, route `/app/essays/:id` (`EssayDetail`) **có** nạp lại kết quả, nhưng không có link nào dẫn tới: danh sách "Bài viết của tôi" (`src/pages/Essays.tsx:44`) trỏ thẳng về `/app/write?id=...`.

Kết quả tái hiện:

| Màn hình | Hiện điểm | Hiện khối "Lỗi sai cần sửa" |
|---|---|---|
| `/app/write?id=<đã chấm>` | ✗ | ✗ |
| `/app/essays/<client_id>` | ✓ | ✗ |

### RC2 — Khối "Lỗi sai cần sửa" luôn rỗng (`error_logs` không có dòng)

Model (qua proxy `api.apiz.vn`) trả `errors` là **chuỗi JSON** thay vì mảng:

```
"errors": "[{\"criterion\": \"GRA\", \"quote\": \"use chat tools during the working day...\", ...}]"
```

`coerceEnrichmentOutput` gọi `asArray(output.errors)` → không phải mảng → trả `[]` → **toàn bộ góp ý bị loại im lặng**, không báo lỗi. Đã viết test chứng minh (`tests/enrich-coerce.test.ts`, đang FAIL).

### RC3 — Task 1 có ảnh bị chấm `needs_reference` (không ra điểm)

Ảnh đề **chưa kịp lên server** khi bấm "Chấm bài". Chuỗi lỗi trong `src/lib/store.tsx:411` (`syncImages`):

- Lần lưu đầu tiên của bài mới: chưa có `essayId` trong DB → `syncImages` bỏ qua (`if (!decoded || !essayId) continue`) → `p_draft.images = []` → **ảnh không được upload**.
- `save()` xoá cờ `dirty` sau khi lưu → không có lần lưu thứ hai để thử lại → ảnh mất vĩnh viễn.
- `submit-essay` không thấy `draft.images` → không link `revision_assets` → `missingReference()` trả `true` cho Task 1 Academic → kết quả `needs_reference`, toàn bộ điểm là `null`.

Khớp với dữ liệu thật: `essay_assets` có 1 hàng status `pending`, `revision_assets` rỗng, `grading_results.feedback.status = "needs_reference"`, 4 cột điểm đều `null`.

### RC4 — Mở chi tiết tiêu chí sẽ crash React

Backend lưu `feedback.criteria[].evidence` là **object** `{ text, start, end, paragraphIndex }` (do `verifyEvidence` sinh), nhưng frontend khai báo `evidence: string[]` (`src/lib/aiLogic.ts:132`) và render thẳng `{item}` → React ném *"Objects are not valid as a React child"* khi người dùng bấm mở tiêu chí.

---

## 2. Mục tiêu

1. Chấm xong → mở lại bài vẫn thấy điểm, góp ý, lộ trình, từ vựng.
2. Mọi nhận xét đều bám lỗi thật trong bài; không có nhóm nào rỗng bất thường.
3. Task 1 có ảnh phải chấm được, không `needs_reference` giả.
4. Bỏ hẳn phần Explore (route + trang + link).
5. Nâng độ chính xác và độ sâu chấm AI theo nghiên cứu, **không tăng số lượt gọi model**.

## 3. Ngoài phạm vi

- Không đổi nhà cung cấp AI, không đổi model (`claude-haiku-5-5`).
- Không thêm Edge Function mới.
- Không xoá bảng `guide_progress` / `content_entries` trong DB (chỉ gỡ phần dùng ở frontend).
- Không sửa thuật toán `computeOverall` (đã đúng quy tắc IELTS: trung bình 4 tiêu chí, làm tròn 0.5).

---

## 4. Phần A — Sửa 4 lỗi

### A1. Nạp lại kết quả đã lưu (RC1)

**`src/pages/Writing.tsx`**

- Thêm `useEffect` khi `existing` và `remoteRef(id)` có giá trị: gọi `fetchLatestGrading(essayId, draft.task)` + `fetchEssayFeatures(revisionId)` + `fetchErrorLogs(revisionId)`, set vào `grading` / `features` / `errorLogs`.
- Guard bằng ref `loadedGradingFor` để không nạp lại khi người dùng vừa chấm xong trong phiên đó (tránh ghi đè kết quả mới bằng kết quả cũ).
- Hiện nhãn trạng thái: *"Đang tải kết quả đã chấm…"* khi đang nạp.
- Khi bài đã chấm và người dùng sửa lại → giữ nguyên kết quả cũ hiển thị kèm ghi chú *"Kết quả của lần chấm trước"*, kèm nút bấm lại để chấm phiên bản mới.

**`src/pages/Essays.tsx`**

- Danh sách "Bài viết của tôi": thêm cột điểm + link **"Xem kết quả"** → `/app/essays/<client_id>`.
- `EssayDetail`: giữ nguyên route, dùng làm trang kết quả chính thức.

**`src/pages/Dashboard.tsx`**

- 3 bài gần đây: thêm badge điểm nếu có.

### A2. Khôi phục góp �ý khi model trả sai kiểu (RC2)

**`supabase/functions/_shared/ai/enrich.ts`**

- `asArray` / `asRecord`: nếu giá trị là **string** thì thử `JSON.parse` một lần rồi dùng kết quả; parse lỗi → trả `[]` / `{}` như cũ (không throw).
- Áp dụng cho mọi nhóm: `errors`, `unnatural`, `structure.paragraphs`, `lexical.examples`, `grammar.examples`, `vocabulary_plan.words`, `band_plan.steps`.
- `coerceEnrichmentOutput` giữ nguyên hợp đồng (thiếu field → rỗng, không throw).

**Test**: `tests/enrich-coerce.test.ts` (đã viết, đang fail → sẽ xanh).

### A3. Ảnh đề phải lên server trước khi chấm (RC3)

**`src/lib/store.tsx` — `saveDraft`**: tách 2 pha cho bài mới.

1. Nếu chưa có `essayId` trong DB → gọi `save_draft` (tạo mới) để lấy `essay_id`.
2. `syncImages(draft, essayId)` → upload ảnh qua `prepare-upload` + signed URL.
3. Gọi `save_draft` lần hai (update) với `p_draft.images = images.synced` để lưu path + assetId.

**`src/pages/Writing.tsx` — `save()`**: điều kiện bỏ qua phải tính cả ảnh chưa đồng bộ:

```
if (!dirty.current && !hasUnsyncedImages) return true
```

**`supabase/functions/submit-essay/index.ts`**: khi có ảnh trong `essay.draft` nhưng asset chưa `ready` → trả `409 image_not_ready` với message rõ ràng (hiện đã có nhưng cần chắc chắn nhánh này chạy đúng khi ảnh thật sự thiếu, không phải do race).

### A4. Sửa định dạng `evidence` (RC4)

- `src/lib/aiLogic.ts`: `CriterionFeedback.evidence` → `Array<{ text: string; start: number; end: number; paragraphIndex: number }>`; thêm `evidenceText(evidence)` trả `string[]` để render.
- `src/components/GradingResult.tsx`: render `evidence.text`; nếu là string cũ thì dùng luôn (tương thích dữ liệu cũ).
- Test: thêm case vào `tests/ai.test.ts`.

---

## 5. Phần B — Bỏ hẳn phần Explore

Xoá route + trang + link, theo lựa chọn của người dùng.

| Việc | File |
|---|---|
| Xoá route `/library`, `/library/:kind/:slug`, `/guide`, `/guide/:slug`, `/app/tools` | `src/App.tsx` |
| Xoá trang | `src/pages/Library.tsx`, `src/pages/Guide.tsx` |
| Xoá component `Tools` khỏi `src/pages/Other.tsx` | `src/pages/Other.tsx` |
| Bỏ 3 mục nav + nhãn nhóm "KHÁM PHÁ / EXPLORE" | `src/components/Layout.tsx` |
| Bỏ link tới `/library`, `/guide` (nav landing, feature card, dashboard) | `src/pages/Other.tsx`, `src/pages/Dashboard.tsx` |
| Bỏ `guides` khỏi `src/data/content.ts`; giữ `entries` (trang demo dùng) | `src/data/content.ts` |
| Bỏ `state.completed` + `guide_progress` + RPC `complete_guide` khỏi store | `src/lib/store.tsx`, `src/lib/sync.ts` |
| Bỏ style không dùng (`.guide-*`, `.master-*`, `.chapter-*`, `.library-*`, `.resource-card`, `.tool-*`, `.personal-guide`) | `src/styles.css` |
| Cập nhật test có nhắc route đã xoá | `tests/browser.mjs`, `tests/i18n.mjs`, `tests/accessibility.mjs`, `tests/production.mjs`, `tests/screenshots.mjs`, `tests/landing-ui.mjs`, `tests/sync.test.ts` |

Giữ nguyên trong DB: bảng `guide_progress`, `content_entries`, RPC `complete_guide` (migration cũ không rollback).

Hệ quả cần chấp nhận: `/app/tools` (Magic Rewrite, Argument Stress Test, Critical Thinking) không còn trong UI. Edge Function `run-writing-tool` **giữ nguyên** vì tác vụ "Đọc dữ liệu từ ảnh" trong không gian viết vẫn dùng.

---

## 6. Phần C — Nâng độ sâu chấm AI

Nguồn: `docs/research/ielts-ai-grading-research.md` (95 KB, 823 dòng, có URL cho từng phát hiện).

### C1. Nguyên tắc chỉ đạo từ nghiên cứu

1. **Rubric chính thức có "sàn"**: mô tả band N trong band descriptors chính thức có phần **in đậm** = đặc điểm **tiêu cực giới hạn** điểm ở band N. Muốn band N phải đủ positive feature của band N **và** không dính negative feature nào của band N. Đây là điều prompt hiện tại bỏ qua hoàn toàn.
2. **Calibration prior là thứ tạo ra +19 điểm %** (ablation, held-out) — thêm "phân bố điểm thực tế" vào prompt, kèm chỉ dẫn chống nén điểm về giữa.
3. **Claude nhạy cảm nhất với *scoring strategy*** (32% phương sai), không phải độ chi tiết của rubric → đổi **cách hỏi** quan trọng hơn thêm mô tả rubric.
4. **2 lượt gọi, thứ tự Advocate → Skeptic+Judge**, chỉ 1 vòng tranh luận. Debate 2 vòng làm QWK sập.
5. **Tiêu chí là band TRÒN 0–9**; nửa điểm chỉ xuất hiện ở overall (do trung bình).
6. **Đếm từ bằng code, không hỏi LLM.** Dưới 250 từ → Task Response trung bình chỉ ~4.1.
7. **Ép trích quote nguyên văn** và **kiểm chứng quote là substring thật** → chống rubric-template collapse + hallucination.
8. **Không dùng AI-detector** để phát hiện bài mẫu (61.3% false positive với người không bản ngữ). Dùng overlap n-gram + đánh giá riêng phần bị học thuộc.

### C2. Kiến trúc mới: 1 job, 2 lượt gọi model

Hiện tại: job `grade` (gọi 1) → job `enrich` (gọi 2), có 10 giây chờ cron ở giữa.

Mới: **một job `grade`, hai lượt gọi tuần tự**. Tổng token không đổi, latency giảm, code đơn giản hơn.

```
grade job
 ├─ CALL 1 — ADVOCATE (analysis, KHÔNG chấm điểm)
 │    · task_checks riêng cho Task 1 Academic / Task 1 General / Task 2
 │    · evidence_for / evidence_against: 2–4 quote nguyên văn mỗi tiêu chí
 │    · error_stats: tổng câu, câu không lỗi, lỗi theo loại
 │    · candidate_band + floor_reasoning mỗi tiêu chí
 │    · memorised_risk (nếu có) — chỉ cảnh báo, KHÔNG trừ điểm
 │
 └─ CALL 2 — SKEPTIC + JUDGE (chấm điểm + phản hồi sâu)
      · nhận output CALL 1 + rubric + exemplar + calibration prior
      · Skeptic pass: phản biện CALL 1, mọi phê bình phải có quote
      · chốt band nguyên 0–9 mỗi tiêu chí + kiểm tra "sàn" band
      · rationale / evidence / improvements / summary / strengths / priority_actions
      · structure, lexical, grammar, errors, unnatural, vocabulary_plan, band_plan
      → ghi grading_results + essay_features + error_logs
```

**Quyết định phụ**: bỏ job `enrich` (mọi thứ do `grade` viết trong 1 lần ghi). Rủi ro: call 2 lỗi → mất cả điểm; bù lại bằng cơ chế repair + retry sẵn có (3 lần).

### C3. Rubric nhúng vào prompt

File mới `supabase/functions/_shared/ai/rubric.ts`:

- `BAND_FEATURES[taskType][criterion][band]` → `{ positive: string[], negative: string[] }`, lấy từ band descriptors chính thức (đã trích ở `docs/research/_pdf/writing-band-descriptors.txt`).
- `CALIBRATION_PRIOR` — phân bố điểm thực tế + chỉ dẫn chống nén điểm về giữa.
- `TASK_CHECKS[taskType]` — checklist riêng: Task 1 Academic (overview / categorisation / comparison / không có opinion), Task 1 General (3 bullet / purpose / tone), Task 2 (all parts / position / development / evidence).

`buildGradingPrompt` viết lại theo thứ tự mà Anthropic khuyến nghị: dữ liệu dài ở trên, câu hỏi ở cuối, tag XML, "tell what to do" thay vì "don't".

### C4. Exemplar có điểm thính thức

`docs/research/exemplars.json` — các bài mẫu có band + examiner comment từ nguồn chính thức ielts.org (và nguồn phụ nếu đủ tin cậy). Đưa vào prompt dưới dạng:

```
<exemplar task="task2" band="6.5"><examiner_comment>…</examiner_comment></exemplar>
```

Chỉ dùng exemplar có `confidence` = `official` hoặc `school`. Nếu không đủ exemplar, dùng **examiner comment chính thức** làm neo thay cho toàn văn bài mẫu (nguồn chính thức, đã có sẵn trong PDF).

### C5. Đếm từ + chặn trần điểm bằng code

- `countWords` (đã có ở `supabase/functions/_shared/jobs.ts`) chạy ở server, truyền `word_count` vào prompt như **sự thật**.
- Sau khi model trả điểm, code áp trần: Task 2 < 250 từ → `task_response` tối đa 5; Task 1 < 150 từ → `task_achievement` tối đa 5. Lý do cap được ghi vào `feedback.priority_actions` và hiển thị lên UI.

### C6. Tiêu chí là band tròn

- Schema yêu cầu `score` là số nguyên 0–9. Code **coerce** về số nguyên gần nhất thay vì ném lỗi (tránh mất cả bài khi model trả 6.5).
- Overall vẫn do `computeOverall` tính (trung bình 4 tiêu chí → làm tròn 0.5).

### C7. Kiểm chứng quote

- Mọi quote từ model phải là substring thật của bài; không khớp → bỏ và ghi cảnh báo.
- `error_logs` chỉ ghi lỗi có quote hợp lệ (đã có sẵn `revision.essay_text.includes(error.quote)`).
- `band_floor` hiển thị trên UI: mỗi tiêu chí ghi rõ *"Vì sao chưa đạt band X"*.

### C8. Harness đánh giá (eval)

- `tests/eval/corpus.ts` — các bài có band chính thức (từ `exemplars.json` + bài mẫu trong PDF ielts.org).
- `tests/eval/run-eval.mjs` — chạy prompt cũ vs mới trên corpus, báo **QWK**, **RMSE**, sai lệch theo tiêu chí, và tỉ lệ quote sai.
- Script npm: `npm run test:eval`.
- Đây là tiền đề để mọi "cải thiện" sau này đo được thay vì đoán.

### C9. Thay đổi hợp đồng dữ liệu

| Thay đổi | Chi tiết |
|---|---|
| `GRADING_SCHEMA_VERSION` | `grading-v1` → `grading-v2` (ép cache cũ hết hiệu lực) |
| `GRADING_PROMPT_VERSION` | `grading-prompt-v1` → `grading-prompt-v2` |
| `RUBRIC_VERSION` | `ielts-rubric-v1` → `ielts-rubric-v2` |
| `ENRICHMENT_SCHEMA_VERSION` | `enrichment-v2` → `enrichment-v3` |
| `feedback.criteria[].evidence` | giữ object; frontend đọc `.text` |
| `feedback.criteria[].floor_reasoning` | trường mới, hiển thị trên UI |
| `feedback.word_count` | số từ do code đếm |
| `feedback.capped[]` | các tiêu chí bị cap + lý do |
| `essay_features.memorised_risk` | cột `jsonb` mới (migration 017) |

Migration `017_grading_v3.sql`: thêm `memorised_risk jsonb` vào `essay_features`. Idempotent.

### C10. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Call 2 lỗi → mất cả điểm | Repair + retry 3 lần sẵn có; prompt ngắn hơn nên dễ hơn |
| Schema mới quá nặng → model không trả đủ field | `coerce` thay vì `validate` (giữ nguyên cơ chế hiện tại); required chỉ bắt buộc phần điểm |
| Thêm exemplar → token tăng | Chỉ 2–3 exemplar/task type, đặt trước rubric để cache được |
| Band descriptors dài làm prompt rối | Rút gọn: mỗi band chỉ giữ feature quyết định, không dán nguyên văn PDF |
| Đổi hợp đồng → bài cũ hiển thị sai | `grading_view_from_row` chấp nhận cả shape cũ và mới |

---

## 7. Kiểm thử

| Tệp | Nội dung |
|---|---|
| `tests/enrich-coerce.test.ts` (mới) | Model trả `errors` dạng chuỗi JSON vẫn giữ được; chuỗi hỏng thì bỏ, không throw |
| `tests/ai.test.ts` (mở rộng) | `evidence` object → parse đúng; `floor_reasoning`; `word_count` |
| `tests/sync.test.ts` (cập nhật) | Bỏ test `guide_slug_map` / `completed_slugs` |
| `supabase/functions/_shared/tests/rubric.test.ts` (mới) | Mỗi task type có đủ 4 tiêu chí × band 5–9; `negative` không rỗng |
| `supabase/functions/_shared/tests/grade.test.ts` (mở rộng) | Coerce điểm về số nguyên; cap theo word count; kiểm tra floor |
| `tests/repro-frontend-read.mjs` → thành `tests/grading-persistence.mjs` | Chấm xong → tải lại trang → điểm + khối lỗi vẫn hiện |
| `tests/eval/run-eval.mjs` (mới) | QWK / RMSE của prompt cũ vs mới trên corpus |

Lệnh: `npm test`, `npm run test:edge`, `npx tsc --noEmit`, `npm run build`, `npm run test:eval`.

---

## 8. Triển khai

```bash
npm run db:migrate        # migration 017
npm run db:deploy         # deploy lại edge functions
npm run build && push     # frontend
```

Biến môi trường: không đổi. `AI_MODEL_GRADING=claude-haiku-5-5`, `AI_STRUCTURED_MODE=tool` giữ nguyên.

## 9. Thứ tự thực hiện

1. **RC2 + RC4** (nhỏ, độc lập) → khôi phục khối "Lỗi sai cần sửa" + sửa crash.
2. **RC3** (ảnh) → Task 1 có ảnh chấm được.
3. **RC1** (nạp lại kết quả) → trải nghiệm "chấm xong mở lại vẫn có".
4. **Phần B** (bỏ Explore) → gọn gàng, không liên quan AI.
5. **Phần C** (nâng chấm AI) → làm sau, có eval để đo.
