# AI phản hồi sâu hơn band score — thiết kế

Ngày: 2026-10-25. Trạng thái: phạm vi đã duyệt; chờ duyệt trước triển khai.

## 1. Vấn đề

App hiện chỉ hiện **band score + 4 tiêu chí + tóm tắt**. Người học muốn nhiều hơn: lỗi sai cụ thể, chỗ viết chưa hợp lý, cách viết lại để ăn band, và từ vựng nên học.

Điều đáng chú ý: **backend đã tính sẵn phần lớn dữ liệu này nhưng frontend chưa đọc**.

| Nhóm người dùng muốn | Nguồn hiện có | Trạng thái |
|---|---|---|
| Chấm lỗi sai | `error_logs` (quote / correction / explanation / skill_tags) | Schema có, **frontend không đọc** |
| Lỗi ngữ pháp | `essay_features.grammar.examples` | Schema có, **frontend không đọc** |
| Từ vựng nâng cao | `essay_features.lexical.examples` | Schema có, **frontend không đọc** |
| Cấu trúc bài | `essay_features.structure.paragraphs` | Schema có, **frontend không đọc** |
| Điều chưa hợp lý | — | **Chưa có** |
| Lộ trình lên band | `priority_actions` (chung chung) | **Cần làm rõ** |
| Từ vựng nên học theo chủ đề | — | **Chưa có** |

Hai việc độc lập phải làm cùng lúc:

1. **Nối frontend với dữ liệu đã có** (`essay_features`, `error_logs`) — RLS đã cho phép user đọc bằng chính session của họ (`essay_features_read_own`, `error_logs_read_own`).
2. **Mở rộng output của pipeline `enrich`** cho 3 nhóm còn thiếu.

Ràng buộc: `ANTHROPIC_API_KEY` chưa được set trên Supabase → mọi job AI fail với `missing_api_key`. Chấm bài và enrich đều chưa chạy được. Quyết định: **build trước, thêm key sau**. Vì vậy phần UI phải kiểm chứng được bằng fixture, không phụ thuộc model thật.

## 2. Mục tiêu

- Người học thấy **lỗi sai kèm cách sửa**, **chỗ chưa hợp lý**, **từ vựng nên học**, **cấu trúc bài**, và **lộ trình cụ thể để lên band** ngay sau khi bấm *Chấm bài*.
- Lỗi tích luỹ theo thời gian và ôn được (Sổ lỗi sai).
- Không tăng số lượt gọi model: dùng job `enrich` đã có.

### Ngoài phạm vi

- Không thêm Edge Function mới, không đổi nhà cung cấp AI.
- Không sửa thuật toán tính band (`computeOverall`) hay chuẩn rubric.
- Không tự động sửa bài viết (viết lại) — nằm ngoài phạm vi công cụ *Magic Rewrite* đã có.
- Không dùng AI để sinh nội dung học thuật mới (Master Guide).

## 3. Kiến trúc dữ liệu

```
submit-essay ──> job 'grade' ──> grading_results.feedback
                                     │  (điểm, tiêu chí, điểm mạnh, priority_actions, task_checks)
                                     ▼
                            job 'enrich' (1 lượt gọi model thứ 2)
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
            essay_features                      error_logs
   (structure · lexical · grammar ·         (quote · correction ·
    unnatural · vocabulary_plan ·            explanation · skill_tags)
    band_plan)
```

Cả 2 bảng đã có RLS `read_own` cho `authenticated` → frontend đọc trực tiếp, không cần Edge Function.

## 4. Backend

### 4.1 Migration `016_feedback_coaching.sql`

Thêm 3 cột `jsonb` vào `public.essay_features` (mặc định `null`, không backfill):

| Cột | Kiểu | Nội dung |
|---|---|---|
| `unnatural` | `jsonb` | `[{ quote, issue, suggestion, severity }]` |
| `vocabulary_plan` | `jsonb` | `{ topic, words: [{ word, meaning, example, why }] }` |
| `band_plan` | `jsonb` | `{ current_band, target_band, steps: [{ title, detail, criterion, expected_gain }] }` |

`severity`: `minor | major`. `criterion`: tên tiêu chí đã có (`task_achievement | task_response | coherence_ability | lexical_resource | grammatical_range`).

### 4.2 `enrichment-v2`

`supabase/functions/_shared/ai/enrich.ts`:

- `ENRICHMENT_SCHEMA_VERSION` → `enrichment-v2`.
- `ENRICHMENT_JSON_SCHEMA` thêm 3 property (`unnatural`, `vocabulary_plan`, `band_plan`) với `required` tương ứng; các property cũ giữ nguyên.
- `validateEnrichmentOutput` validate thêm:
  - `unnatural`: mảng, mỗi phần tử có 4 field đúng kiểu, `severity` ∈ {minor, major}.
  - `vocabulary_plan`: object có `topic` (string) + `words` (mảng, mỗi phần tử 4 field string).
  - `band_plan`: object có `current_band`/`target_band` (number|null) + `steps` (mảng, mỗi phần tử 4 field string).
  - Sai kiểu → `AiContractError("invalid_enrichment")`, y như hiện tại.

`supabase/functions/_shared/prompts.ts`:

- `buildEnrichmentPrompt` nhận thêm `taskType` và `targetBand`.
- System prompt bổ sung 3 yêu cầu:
  - `unnatural`: chỉ ra câu **không hợp lý / lập luận chưa logic / lặp ý / diễn đạt không tự nhiên**; `quote` phải là chuỗi con có thật trong bài.
  - `vocabulary_plan`: từ vựng **nên học** cho chủ đề bài ở band mục tiêu — không phải từ đã dùng trong bài; `why` nói rõ dùng để làm gì.
  - `band_plan`: các bước cụ thể để đi từ band hiện tại lên band mục tiêu, mỗi bước gắn 1 tiêu chí và `expected_gain`.
- Giữ nguyên `UNTRUSTED_DATA_RULE`, `feedbackLocale`, và câu "Do not rescore the essay".

`supabase/functions/_shared/ai/pipeline.ts`:

- `runEnrichment` chỉ bỏ qua job nếu `essay_features.schema_version === ENRICHMENT_SCHEMA_VERSION` (hiện tại nó bỏ qua khi có bất kỳ hàng nào → bản `v1` cũ sẽ chặn `v2`).
- Truyền `taskType: revision.task_type`, `targetBand: revision.target_band` vào `buildEnrichmentPrompt`.
- Ghi 3 cột mới khi upsert `essay_features`.

`supabase/functions/_shared/ai/pipeline.ts` — hàng đợi: `idempotencyKey` đã chứa `ENRICHMENT_SCHEMA_VERSION` và `cacheKey` đã chứa `schemaVersion` → job `v2` là job mới, không đụng job `v1`.

### 4.3 Sổ lỗi sai

`error_logs` giữ nguyên schema. Pipeline vẫn ghi lỗi có `quote` nằm trong bài (đã kiểm tra bằng `revision.essay_text.includes(error.quote)`).

## 5. Frontend

### 5.1 Model hiển thị — `src/lib/aiLogic.ts`

```ts
export type UnnaturalPoint = { quote: string; issue: string; suggestion: string; severity: 'minor' | 'major' }
export type VocabularySuggestion = { word: string; meaning: string; example: string; why: string }
export type BandPlanStep = { title: string; detail: string; criterion: string; expectedGain: string }
export type EssayFeatures = {
  structure: Array<{ index: number; role: string; summary: string; linkToNext: string }>
  lexical: Array<{ term: string; meaning: string; evidence: string; correction: string }>
  grammar: Array<{ error: string; correction: string }>
  unnatural: UnnaturalPoint[]
  vocabularyPlan: { topic: string; words: VocabularySuggestion[] }
  bandPlan: { currentBand: number | null; targetBand: number | null; steps: BandPlanStep[] }
}
export type ErrorLogEntry = { id: string; criterion: string; category: string; quote: string; correction: string; explanation: string; skillTags: string[] }
```

Hàm parse **phòng thủ**, đặt cạnh `gradingViewFromRow`:

- `featuresFromRow(row: unknown): EssayFeatures | null` — field thiếu / sai kiểu → mảng rỗng hoặc `null`; không throw.
  - Trong DB, `structure` / `lexical` / `grammar` là object (`{ paragraphs: [...] }`, `{ examples: [...] }`); hàm parse **làm phẳng** ra mảng trong model hiển thị.
- `errorLogsFromRows(rows: unknown[]): ErrorLogEntry[]` — bỏ qua phần tử không hợp lệ.

Quy tắc: không bao giờ để dữ liệu AI làm hỏng render.

### 5.2 Module đọc dữ liệu — `src/lib/featuresRepository.ts` (mới)

| Hàm | Việc |
|---|---|
| `fetchLatestRevisionId(essayId)` | Resolve revision mới nhất của bài (dùng chung với `fetchLatestGrading`) |
| `fetchEssayFeatures(revisionId)` | Đọc `essay_features` → `EssayFeatures \| null` |
| `fetchErrorLogs(revisionId)` | Đọc `error_logs` của revision → `ErrorLogEntry[]` |
| `fetchErrorLogsByEssay(essayId)` | Đọc `error_logs` của mọi revision của bài (Sổ lỗi sai) |

Đọc bằng `supabase.from(...)` với session của user → RLS lọc `auth.uid()`.

### 5.3 UI — `src/components/GradingResult.tsx`

Component nhận thêm props `features?: EssayFeatures | null` và `errors?: ErrorLogEntry[]`.

Bố cục (accordion, dùng `<details>`/`<summary>` để không cần state):

```
[Điểm tổng + 4 tiêu chí]                 (giữ nguyên)
[Tổng quan]                                (giữ nguyên)
[ĐIỂM MẠNH | VIỆC NÊN LÀM TIẾP]          (giữ nguyên)
[KIỂM TRA YÊU CẦU ĐỀ]                    (giữ nguyên)
▸ Lỗi sai cần sửa                        (MỚI, mở sẵn)
▸ Lộ trình lên band X                    (MỚI, mở sẵn)
▸ Điểm chưa hợp lý                        (MỚI)
▸ Từ vựng nâng cao                        (MỚI)
▸ Cấu trúc bài                            (MỚI)
[CHI TIẾT TỪNG TIÊU CHÍ]                 (giữ nguyên)
```

Nội dung từng khối:

- **Lỗi sai cần sửa**: mỗi lỗi = `quote` (gạch ngang) → `correction` (đậm) → `explanation` → badge tiêu chí + badge `category`. Nguồn chính là `error_logs`; nếu `error_logs` rỗng thì lấy `grammar.examples` làm dự phòng (mỗi phần tử có `error`/`correction` → suy ra `quote = error`). Nút *Lưu vào sổ lỗi sai* → `addCard({kind: 'error', term: quote, meaning: correction, example: explanation})`.
- **Lộ trình lên band X**: tiêu đề = band mục tiêu; mỗi bước = `title` + `detail` + badge tiêu chí + `expected_gain`.
- **Điểm chưa hợp lý**: `quote` + `issue` + `suggestion` + badge mức độ (major ưu tiên lên đầu).
- **Từ vựng nâng cao**: hai nhóm — *Nâng cấp từ đang dùng* (`lexical`: `term` → `correction`, `meaning`, `evidence`) và *Từ vựng nên học* (`vocabularyPlan.words`: `word`, `meaning`, `example`, `why`). Cả hai có nút *Lưu vào sổ từ vựng* → `addCard({kind: 'vocabulary'})`.
  - Khối này có thêm nút **+ Thêm từ của tôi** → mở hộp thoại nhập tay (từ / nghĩa / câu ví dụ) → `addCard({kind: 'vocabulary'})`. Người dùng tự thêm từ riêng ngay cạnh gợi ý của AI, không phải điều hướng sang trang khác.
- **Cấu trúc bài**: mỗi đoạn = số thứ tự + `role` + `summary` + `linkToNext`.

Khối không có dữ liệu → ẩn hẳn (không hiện khung rỗng).

### 5.4 Trang *Sổ lỗi sai* — `src/pages/Learning.tsx`

`Errors` hiện chỉ đọc thẻ local. Đổi thành: đọc `error_logs` của mọi bài + thẻ local `kind === 'error'`, gộp và sắp xếp mới nhất trước. Mỗi dòng: `quote` → `correction` + `explanation` + badge tiêu chí. Copy lỗi vào sổ ôn tập vẫn dùng `addCard`.

### 5.5 Trạng thái chờ enrich

`enrich` chạy **sau** `grade` vài giây (cron worker 10s/lần). Trong `Writing.tsx`:

- `submitEssay` trả về `revisionId` → dùng để poll.
- Sau khi `pollGrading` thành công → poll `fetchEssayFeatures(revisionId)` mỗi 3s, tối đa 45s.
- Trong lúc chờ → hiện dòng trạng thái *"Đang rà soát lỗi và từ vựng…"*.
- Hết giờ mà vẫn chưa có → hiện *"Chưa có dữ liệu rà soát thêm"*, không báo lỗi (vì bài đã chấm xong).

Ở trang chi tiết bài (`EssayDetail`): tải `features` + `errors` kèm grading; không poll (dữ liệu đã có thì hiện, không có thì thôi).

### 5.6 Demo để xem giao diện khi chưa có API key

- Fixture `src/data/sampleFeatures.ts`: một bộ `EssayFeatures` + `ErrorLogEntry` mẫu (tiếng Anh, Task 2).
- Trang `/app/essays/demo` (công khai) render `GradingResult` với fixture → xem được đủ 5 khối mà không cần key.

### 5.7 Hộp thoại thêm thẻ dùng chung

Hộp thoại nhập thẻ hiện nằm inline trong `src/pages/Learning.tsx` (trang *Sổ từ vựng*). Tách thành component dùng chung `src/components/VocabularyCardDialog.tsx`:

| Prop | Việc |
|---|---|
| `open` | Đang mở hay không |
| `onClose()` | Đóng hộp thoại |
| `defaultKind` | Loại thẻ mặc định (`vocabulary` \| `structure` \| `error`) |
| `onSave(values)` | Nhận `{ term, meaning, example, kind }` → gọi `addCard` |

Dùng lại ở hai nơi: trang *Sổ từ vựng* (giữ nguyên hành vi hiện tại) và khối *Từ vựng nâng cao* trong kết quả chấm. Không viết lặp form hai lần.

## 6. Luồng dữ liệu tổng thể

```
Bấm "Chấm bài"
  → saveDraft → remoteRef → submitEssay (tạo revision + job 'grade')
  → pollGrading (job 'grade' chạy, điểm về)      → hiện điểm + tiêu chí
  → pollFeatures (revisionId, tối đa 45s)        → hiện lỗi / band plan / từ vựng / cấu trúc
  → lỗi/từ vựng bấm "Lưu" → addCard → study_cards (đồng bộ DB)
  → người dùng tự nhập từ trong khối "Từ vựng nâng cao" → addCard → study_cards
```

`grade` fail (chưa có key) → hiện lỗi hiện hữu *"has not configured an AI model"*, không đổi.

## 7. Xử lý lỗi

| Tình huống | Hành vi |
|---|---|
| `enrich` fail (job error) | Bài vẫn hiện điểm; khối mới ẩn; hiện dòng "Chưa có dữ liệu rà soát thêm" |
| `essay_features` thiếu field | Parse trả mảng rỗng, khối tương ứng ẩn |
| `error_logs` rỗng | Khối "Lỗi sai cần sửa" ẩn |
| `unnatural`/`vocabulary_plan`/`band_plan` null (bản v1 cũ) | Parse trả `null`/rỗng → ẩn khối |
| Model trả quote không có trong bài | Bỏ qua mục đó (giữ hành vi hiện tại của pipeline với `error_logs`) |
| Poll features hết giờ | Hiện dòng trạng thái, không coi là lỗi |

## 8. Kiểm thử

Không cần model thật — dùng fixture.

| Tệp | Nội dung |
|---|---|
| `supabase/functions/_shared/tests/enrich.test.ts` | Contract `enrichment-v2`: hợp lệ, thiếu field, sai kiểu, `severity` sai → `invalid_enrichment` |
| `tests/ai.test.ts` (npm test) | `featuresFromRow` / `errorLogsFromRows`: đủ field, thiếu field, sai kiểu, rỗng, null |
| `tests/writing-space.mjs` | Không gian viết hiện đủ khối mới khi có features (qua demo/fixture); nút *+ Thêm từ của tôi* mở hộp thoại và lưu được thẻ vào sổ |
| `tests/accessibility.mjs` | Accordion mới + hộp thoại thêm thẻ phải đạt axe WCAG 2.1 AA (nhãn, mở/đóng, focus) |

## 9. Triển khai

```bash
npm run db:migrate        # migration 016 (thêm 3 cột jsonb)
npm run db:deploy         # deploy lại edge functions (enrichment-v2)
npm run build && push     # frontend lên Vercel
```

Sau khi có `ANTHROPIC_API_KEY` (set làm secret trên Supabase Edge Functions) → `npm run db:deploy` là chạy được ngay, không cần sửa code.

## 10. Rủi ro

- **Chưa verify với model thật.** Schema JSON của Anthropic có thể từ chối cấu trúc lồng nhau phức tạp → cần `repairInstruction` và có thể phải nới `maxTokens` của `enrich` (hiện 4.000) khi thêm 3 nhóm mới. Đây là rủi ro lớn nhất, chỉ phát hiện được khi có key.
- **Độ trễ:** người dùng phải chờ thêm vài giây sau khi có điểm mới thấy phần rà soát. Đã xử lý bằng trạng thái chờ + poll 45s.
- **Chi phí:** không tăng số lượt gọi model, nhưng output của `enrich` lớn hơn → token tăng một chút.
- **Bài cũ:** các `essay_features` v1 không có 3 cột mới → các khối tương ứng ẩn cho tới khi bài được chấm lại (job `v2` chạy lại nhờ đổi `cacheKey`).
