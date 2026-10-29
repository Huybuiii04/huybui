# Speaking Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm module Speaking vào IELTS Writing Studio: người học chọn Part 1 / Part 2 / Part 3 / Full mock, ghi âm bằng mic hoặc upload file, AI chấm 4 tiêu chí IELTS Speaking chính thức và trả band + feedback.

**Architecture:** 2 lớp AI. Lớp 1 `gemini-3.8-flash` (OpenAI-compatible, `input_audio`) đọc audio → transcript + phân tích phát âm/ngữ điệu. Lớp 2 `claude-haiku-5-5` (Anthropic tool-use) chấm rubric ETS band 3–9 trên transcript. Pipeline chạy qua hàng đợi `ai_jobs` sẵn có + worker `process-ai-jobs` (cron). 1 attempt = 1 session có N turn (1 turn = 1 recording); server tự tính band tổng bằng trung bình theo turn (đúng luật IELTS).

**Tech Stack:** React 19 + Vite 7 + react-router 7 + Tailwind 4 · Supabase (Postgres + Storage + Edge Functions Deno) · Anthropic tool-use structured output · Gemini qua proxy `api.apiz.vn` (protocol openai).

**Spec:** `docs/superpowers/specs/2026-10-29-speaking-module-design.md`

**Ràng buộc:** Module Reading hiện tại **không được sửa**. Xem spec §0.

---

## Cấu trúc file

**Tạo mới:**
```
supabase/migrations/027_speaking.sql
supabase/functions/submit-speaking/index.ts
supabase/functions/submit-speaking/deno.json
supabase/functions/_shared/ai/speaking.ts              ← schema + validate + aggregate (thuần)
supabase/functions/_shared/ai/speakingRubric.ts        ← band descriptor 3–9 + render
supabase/functions/_shared/ai/audioProvider.ts         ← gọi Gemini đọc audio
supabase/functions/_shared/tests/speaking.test.ts
src/lib/speakingLogic.ts                               ← logic thuần client
src/lib/speaking.ts                                    ← API client
src/pages/Speaking.tsx                                 ← hub 4 mode
src/pages/SpeakingRoom.tsx                             ← phòng luyện nhiều turn
src/pages/SpeakingResult.tsx                           ← màn hình kết quả
src/components/speaking/SpeakingRecorder.tsx
src/components/speaking/SpeakingTurnPrompt.tsx
src/components/speaking/SpeakingResult.tsx
tests/speaking.test.ts
```

**Sửa (additive-only):**
```
src/App.tsx                                   ← + 3 route
src/components/Layout.tsx                     ← + nav item
src/lib/ai.ts                                 ← + submitSpeaking / commitSpeakingTurn / pollSpeakingResult
supabase/functions/_shared/ai/pipeline.ts     ← + runSpeakingGrading, + pricingVersion param
supabase/functions/_shared/storage.ts         ← + removeUserSpeakingAudioObjects
supabase/functions/delete-account/index.ts   ← + dọn speaking-audio
supabase/seed/seed-ai-pricing.mjs             ← + dòng gemini-3.8-flash
supabase/scripts/setup-cron.mjs               ← cron 10s → 30s
supabase/scripts/verify-schema.mjs            ← + bucket 'speaking-audio'
package.json                                 ← + db:seed:speaking, + tests/speaking.test.ts
```

**Đã có sẵn (dùng lại, KHÔNG sửa):**
- `supabase/functions/_shared/jobs.ts` → `computeOverall(scores)` (trung bình 4 tiêu chí → làm tròn nửa band)
- `supabase/functions/_shared/anthropic.ts` → `requestStructured()` (tool-use + 1 lần repair)
- `supabase/functions/_shared/provider.ts` → `resolveProviderConfig()`, `providerEndpoint()`, `providerHeaders()`
- `supabase/functions/_shared/http.ts` → `jsonResponse`, `errorResponse`, `preflightResponse`, `requireMethod`, `readJsonBody`, `AppError`
- `supabase/functions/_shared/auth.ts` → `requireAuthenticatedUser`, `getServiceClient`
- `supabase/functions/_shared/schemas.ts` → pattern `parseXxx(input: unknown)`
- `src/lib/aiLogic.ts` → `classifyAiError`, `AiErrorCode`
- `src/i18n.ts` → `useCopy()` trả `c(vi, en)`

---

## Task 1: Migration — bảng, bucket, RLS, lease

**Files:**
- Create: `supabase/migrations/027_speaking.sql`
- Modify: `supabase/scripts/verify-schema.mjs` (thêm `'speaking-audio'` vào `expectedBuckets`)

- [ ] **Step 1: Viết migration**

Tạo `supabase/migrations/027_speaking.sql` với nội dung đầy đủ theo spec §3.1: 4 bảng
(`speaking_questions`, `speaking_attempts`, `speaking_turns`, `speaking_results`), bucket
`speaking-audio` (private, 4194304 bytes, mime `audio/webm|mp4|ogg|wav|mpeg|mp3`), RLS owner-scoped
theo `(storage.foldername(name))[1] = auth.uid()::text`, `alter table public.ai_jobs` thêm
`'grade-speaking'` vào CHECK, và `create or replace function public.claim_ai_job()` đổi lease
`interval '120 seconds'` → `interval '240 seconds'`.

Bảng `speaking_questions` có cột `related_part3_slug text` (link cue card Part 2 → topic Part 3).

- [ ] **Step 2: Chạy migration**

```bash
cd D:/ielts
node --env-file-if-exists=.env.local supabase/scripts/migrate.mjs
```
Expected: in "OK" cho `027_speaking.sql`. Nếu lỗi `ai_jobs_operation_check` thì constraint cũ có tên khác —
kiểm tra bằng:
```sql
select conname from pg_constraint where conrelid='public.ai_jobs'::regclass and contype='c';
```

- [ ] **Step 3: Thêm bucket vào verify-schema**

Trong `supabase/scripts/verify-schema.mjs`, sửa:
```js
const expectedBuckets = ['essay-images', 'content-media', 'donation-media', 'prompt-media', 'user-prompt-media', 'skill-audio', 'speaking-audio']
```

- [ ] **Step 4: Verify**

```bash
cd D:/ielts
node --env-file-if-exists=.env.local supabase/scripts/verify-schema.mjs
```
Expected: không có lỗi bucket.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/027_speaking.sql supabase/scripts/verify-schema.mjs
git commit -m "feat(speaking): add speaking schema, storage bucket and RLS"
```

---

## Task 2: Rubric band descriptor chính thức 3–9

**Files:**
- Create: `supabase/functions/_shared/ai/speakingRubric.ts`
- Test: `supabase/functions/_shared/tests/speaking.test.ts`

- [ ] **Step 1: Viết test failing**

Tạo `supabase/functions/_shared/tests/speaking.test.ts`:
```ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { SPEAKING_CRITERIA, renderSpeakingRubric, speakingBandDescriptor } from "../ai/speakingRubric.ts";

test("rubric có đủ 4 tiêu chí Speaking", () => {
  assert.deepEqual([...SPEAKING_CRITERIA].sort(), ["fluency", "grammatical_range", "lexical_resource", "pronunciation"]);
});

test("mỗi tiêu chí có band 3 đến 9", () => {
  for (const criterion of SPEAKING_CRITERIA) {
    const bands = speakingBandDescriptor(criterion);
    assert.deepEqual(bands.map((b) => b.band), [3, 4, 5, 6, 7, 8, 9]);
  }
});

test("renderSpeakingRubric chứa 4 tiêu chí và ghi chú floor rule của IELTS", () => {
  const text = renderSpeakingRubric();
  for (const label of ["Fluency and Coherence", "Lexical Resource", "Grammatical Range and Accuracy", "Pronunciation"]) {
    assert.ok(text.includes(label), `thiếu ${label}`);
  }
  assert.ok(text.includes("must fully fit the positive features"));
  assert.ok(text.includes("average performance across all parts"));
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

```bash
cd D:/ielts
node --test supabase/functions/_shared/tests/speaking.test.ts
```
Expected: FAIL — `Cannot find module '../ai/speakingRubric.ts'`.

- [ ] **Step 3: Viết implementation**

Tạo `supabase/functions/_shared/ai/speakingRubric.ts`. Nội dung descriptor lấy **nguyên văn** từ PDF
chính thức `https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf`:

```ts
export type SpeakingCriterion = "fluency" | "lexical_resource" | "grammatical_range" | "pronunciation";

export type SpeakingBandDescriptor = {
  band: number;
  positive: string[];
  negative: string[];
};

export const SPEAKING_CRITERIA: SpeakingCriterion[] = ["fluency", "lexical_resource", "grammatical_range", "pronunciation"];

const CRITERION_LABELS: Record<SpeakingCriterion, string> = {
  fluency: "Fluency and Coherence",
  lexical_resource: "Lexical Resource",
  grammatical_range: "Grammatical Range and Accuracy",
  pronunciation: "Pronunciation",
};
```

Mỗi tiêu chí có 7 band (3→9) với `positive` = mô tả band, `negative` = ràng buộc "phải đạt đủ".

Band Pronunciation 7/5/3 dùng định nghĩa chính thức:
- 7: "Displays all the positive features of band 6, and some, but not all, of the positive features of band 8."
- 5: "Displays all the positive features of band 4, and some, but not all, of the positive features of band 6."
- 3: "Displays some features of band 2, and some, but not all, of the positive features of band 4."

`renderSpeakingRubric()` trả về text gồm: tiêu đề từng tiêu chí, từng band dạng
```
### Fluency and Coherence
BAND 8
  + <positive features>
  - <negative features>
```
kèm 2 ghi chú bắt buộc từ PDF:
```
(i) A candidate must fully fit the positive features of the descriptor at a particular level.
(ii) A candidate will be rated on their average performance across all parts of the test.
```

- [ ] **Step 4: Chạy test để xác nhận pass**

```bash
cd D:/ielts
node --test supabase/functions/_shared/tests/speaking.test.ts
```
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/ai/speakingRubric.ts supabase/functions/_shared/tests/speaking.test.ts
git commit -m "feat(speaking): add official IELTS speaking band descriptors 3-9"
```

---

## Task 3: Schema + validate + aggregate (logic thuần, server)

**Files:**
- Create: `supabase/functions/_shared/ai/speaking.ts`
- Modify: `supabase/functions/_shared/tests/speaking.test.ts` (append)

- [ ] **Step 1: Viết test failing**

Append vào `supabase/functions/_shared/tests/speaking.test.ts`:
```ts
import { buildSpeakingResult, parseAudioAnalysis, SPEAKING_JSON_SCHEMA } from "../ai/speaking.ts";

test("schema bắt buộc đủ 4 tiêu chí", () => {
  assert.equal(SPEAKING_JSON_SCHEMA.properties.turns.items.required.includes("criteria"), true);
});

test("buildSpeakingResult reject khi thiếu tiêu chí", () => {
  assert.throws(() => buildSpeakingResult({ turns: [{ turnId: "t1", criteria: [
    { criterion: "fluency", score: 6, rationale: "ok", evidence: [], improvements: [] },
  ] }] } as never, { turnIds: ["t1"] }));
});

test("buildSpeakingResult reject score ngoài 0-9", () => {
  assert.throws(() => buildSpeakingResult({ turns: [{ turnId: "t1", criteria: [
    { criterion: "fluency", score: 12, rationale: "ok", evidence: [], improvements: [] },
    { criterion: "lexical_resource", score: 6, rationale: "ok", evidence: [], improvements: [] },
    { criterion: "grammatical_range", score: 6, rationale: "ok", evidence: [], improvements: [] },
    { criterion: "pronunciation", score: 6, rationale: "ok", evidence: [], improvements: [] },
  ] }] } as never, { turnIds: ["t1"] }));
});

test("buildSpeakingResult tính band tổng bằng trung bình qua các turn", () => {
  const result = buildSpeakingResult({
    turns: [
      { turnId: "t1", criteria: [
        { criterion: "fluency", score: 8, rationale: "a", evidence: [], improvements: [] },
        { criterion: "lexical_resource", score: 6, rationale: "a", evidence: [], improvements: [] },
        { criterion: "grammatical_range", score: 6, rationale: "a", evidence: [], improvements: [] },
        { criterion: "pronunciation", score: 6, rationale: "a", evidence: [], improvements: [] },
      ] },
      { turnId: "t2", criteria: [
        { criterion: "fluency", score: 6, rationale: "a", evidence: [], improvements: [] },
        { criterion: "lexical_resource", score: 6, rationale: "a", evidence: [], improvements: [] },
        { criterion: "grammatical_range", score: 6, rationale: "a", evidence: [], improvements: [] },
        { criterion: "pronunciation", score: 8, rationale: "a", evidence: [], improvements: [] },
      ] },
    ],
    overall: { summary: "s", priority_actions: [] },
  } as never, { turnIds: ["t1", "t2"] });

  assert.equal(result.scores.fluency, 7);
  assert.equal(result.scores.pronunciation, 7);
  assert.equal(result.overallRaw, 6.5);
  assert.equal(result.overallDisplay, 6.5);
});

test("parseAudioAnalysis reject khi thiếu transcript", () => {
  assert.throws(() => parseAudioAnalysis({ fillerWords: [] } as never));
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

```bash
cd D:/ielts
node --test supabase/functions/_shared/tests/speaking.test.ts
```
Expected: FAIL — `Cannot find module '../ai/speaking.ts'`.

- [ ] **Step 3: Viết implementation**

Tạo `supabase/functions/_shared/ai/speaking.ts`:

```ts
import { computeOverall } from "../jobs.ts";
import { SPEAKING_CRITERIA, type SpeakingCriterion } from "./speakingRubric.ts";

export const SPEAKING_SCHEMA_VERSION = "speaking-v1";

export type SpeakingCriterionScore = {
  criterion: SpeakingCriterion;
  score: number;
  rationale: string;
  evidence: string[];
  improvements: string[];
};

export type SpeakingTurnModelOutput = {
  turnId: string;
  criteria: SpeakingCriterionScore[];
  summary: string;
  strengths: string[];
  priority_actions: string[];
};

export type SpeakingModelOutput = {
  turns: SpeakingTurnModelOutput[];
  overall: { summary: string; priority_actions: string[] };
};

export type SpeakingScores = {
  fluency: number | null;
  lexical_resource: number | null;
  grammatical_range: number | null;
  pronunciation: number | null;
};

export type SpeakingResult = {
  scores: SpeakingScores;
  overallRaw: number;
  overallDisplay: number;
  turns: Array<{
    turnId: string;
    criteria: SpeakingCriterionScore[];
    summary: string;
    strengths: string[];
    priority_actions: string[];
  }>;
  overall: { summary: string; priority_actions: string[] };
};

export class SpeakingContractError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.code = code; this.name = "SpeakingContractError"; }
}
```

`SPEAKING_JSON_SCHEMA` — JSON schema cho tool-use, `additionalProperties: false`, mỗi turn có
`criteria` đúng 4 phần tử, `score` là integer 0–9:

```ts
export const SPEAKING_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["turns", "overall"],
  properties: {
    turns: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["turnId", "criteria", "summary", "strengths", "priority_actions"],
        properties: {
          turnId: { type: "string" },
          criteria: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["criterion", "score", "rationale", "evidence", "improvements"],
              properties: {
                criterion: { type: "string", enum: [...SPEAKING_CRITERIA] },
                score: { type: "integer", minimum: 0, maximum: 9 },
                rationale: { type: "string" },
                evidence: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
              },
            },
          },
          summary: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          priority_actions: { type: "array", items: { type: "string" } },
        },
      },
    },
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "priority_actions"],
      properties: {
        summary: { type: "string" },
        priority_actions: { type: "array", items: { type: "string" } },
      },
    },
  },
} as const;
```

`buildSpeakingResult(output, context)` — validate + aggregate:
- Mỗi turn trong `context.turnIds` phải có đúng 1 entry; turn lạ → `unknown_turn`.
- Mỗi turn phải có đúng 4 tiêu chí, không trùng, thuộc `SPEAKING_CRITERIA` → `criterion_mismatch`.
- `score` phải là số nguyên 0–9 → `invalid_score`.
- `rationale` không rỗng → `invalid_rationale`.
- `evidence` / `improvements` phải là mảng string.
- Tính band từng tiêu chí: trung bình score của tiêu chí đó qua **mọi turn**, làm tròn nửa band
  (`Math.round(avg * 2) / 2`).
- `overallRaw` = trung bình 4 band tiêu chí (đã làm tròn), `overallDisplay` = làm tròn nửa band.

Không dùng `computeOverall` ở đây vì hàm đó yêu cầu đúng 4 số nguyên; ta cần làm tròn
từng tiêu chí trước. Thay vào đó dùng `computeOverall` cho bước cuối với 4 giá trị đã làm tròn.

`parseAudioAnalysis(value)` — validate `transcript` là string không rỗng; `fillerWords`,
`intonationNotes` là mảng string; `mispronounced` là mảng `{word, issue}`; `estimatedWpm` là
number|null; `confidence` là một trong `"high"|"medium"|"low"`. Trả về `AudioAnalysis`.

- [ ] **Step 4: Chạy test để xác nhận pass**

```bash
cd D:/ielts
node --test supabase/functions/_shared/tests/speaking.test.ts
```
Expected: PASS (toàn bộ test trong file).

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/ai/speaking.ts supabase/functions/_shared/tests/speaking.test.ts
git commit -m "feat(speaking): add speaking result schema, validation and aggregation"
```

---

## Task 4: Lớp 1 — Gemini đọc audio

**Files:**
- Create: `supabase/functions/_shared/ai/audioProvider.ts`

- [ ] **Step 1: Viết implementation**

Tạo `supabase/functions/_shared/ai/audioProvider.ts`:

```ts
import { getEnv } from "../http.ts";
import { parseProviderBody } from "../anthropic.ts";
import { extractJson } from "../anthropic.ts";
import { parseAudioAnalysis, type AudioAnalysis } from "./speaking.ts";

export const AUDIO_MODEL_ENV = "AI_MODEL_AUDIO";
export const DEFAULT_AUDIO_MODEL = "gemini-3.8-flash";
export const AUDIO_TIMEOUT_MS = 60_000;

export function audioModel(): string {
  return (getEnv(AUDIO_MODEL_ENV) ?? DEFAULT_AUDIO_MODEL).trim() || DEFAULT_AUDIO_MODEL;
}

/** Map mime của file ghi âm sang định dạng input_audio mà provider chấp nhận. */
export function audioFormatForMime(mimeType: string): "webm" | "mp4" | "wav" | "mp3" | "ogg" {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  return "ogg";
}
```

`callAudioModel(options)` — gọi OpenAI-compatible chat/completions:

```ts
export async function callAudioModel(options: {
  audioBase64: string;
  mimeType: string;
  prompt: string;
  signal?: AbortSignal;
}): Promise<{ analysis: AudioAnalysis; model: string; latencyMs: number }> {
  const baseUrl = (getEnv("AI_API_BASE_URL") ?? "https://api.apiz.vn").trim().replace(/\/+$/, "");
  const apiKey = (getEnv("AI_API_KEY") ?? getEnv("ANTHROPIC_API_KEY") ?? "").trim();
  if (!apiKey) throw new Error("AI provider configuration is missing");
  const model = audioModel();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUDIO_TIMEOUT_MS);
  const startedAt = Date.now();
  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        max_tokens: 4_000,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: options.prompt },
            { type: "input_audio", input_audio: { data: options.audioBase64, format: audioFormatForMime(options.mimeType) } },
          ],
        }],
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Audio provider request failed with status ${response.status}`);
    const body = parseProviderBody(await response.text());
    const choice = (body as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0];
    const rawText = typeof choice?.message?.content === "string" ? choice.message.content : "";
    const parsed = extractJson(rawText);
    if (!parsed) throw new Error("Audio provider returned invalid JSON");
    return { analysis: parseAudioAnalysis(parsed), model, latencyMs: Date.now() - startedAt };
  } finally {
    clearTimeout(timeout);
  }
}
```

`buildAudioPrompt()` trả về prompt yêu cầu model trả về **đúng một JSON object** với shape:
```json
{
  "transcript": "nguyên văn lời nói",
  "fillerWords": ["um", "uh"],
  "mispronounced": [{ "word": "...", "issue": "..." }],
  "intonationNotes": ["..."],
  "estimatedWpm": 120,
  "confidence": "high"
}
```
Kèm ràng buộc: giữ nguyên lỗi ngữ pháp và filler, không dịch, không thêm lời giải thích.

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/_shared/ai/audioProvider.ts
git commit -m "feat(speaking): add Gemini audio provider for transcript and pronunciation analysis"
```

---

## Task 5: Edge Function `submit-speaking` (2 phase)

**Files:**
- Create: `supabase/functions/submit-speaking/index.ts`
- Create: `supabase/functions/submit-speaking/deno.json`

- [ ] **Step 1: Tạo deno.json**

Đọc `supabase/functions/grade-skill/deno.json` để copy đúng importMap, rồi tạo
`supabase/functions/submit-speaking/deno.json` với cùng nội dung.

- [ ] **Step 2: Viết input parsing**

Thêm vào `supabase/functions/_shared/schemas.ts` (cuối file, trước các hàm `parse*` khác không quan trọng):

```ts
export type SpeakingMode = "part-1" | "part-2" | "part-3" | "mock";

export interface PrepareSpeakingInput {
  mode: SpeakingMode;
  questionId: string | null;
  question: string | null;
  targetBand: number | null;
  feedbackLocale: "vi" | "en";
}

export interface CommitSpeakingTurnInput {
  attemptId: string;
  turnId: string;
  mimeType: string;
  byteSize: number;
  durationMs: number;
  idempotencyKey: string;
}

export const SPEAKING_MODES: SpeakingMode[] = ["part-1", "part-2", "part-3", "mock"];
export const SPEAKING_AUDIO_MIME_TYPES = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg", "audio/mp3"] as const;
export const MAX_SPEAKING_AUDIO_BYTES = 4 * 1024 * 1024;

export function parsePrepareSpeaking(input: unknown): PrepareSpeakingInput {
  const record = (input ?? {}) as Record<string, unknown>;
  const mode = String(record.mode ?? "");
  if (!SPEAKING_MODES.includes(mode as SpeakingMode)) {
    throw new AppError(400, "invalid_speaking_mode", "Unknown speaking mode");
  }
  const locale = String(record.feedbackLocale ?? "vi");
  if (locale !== "vi" && locale !== "en") {
    throw new AppError(400, "invalid_feedback_locale", "Unsupported feedback locale");
  }
  const targetBand = record.targetBand === null || record.targetBand === undefined ? null : Number(record.targetBand);
  if (targetBand !== null && (!Number.isFinite(targetBand) || targetBand < 0 || targetBand > 9)) {
    throw new AppError(400, "invalid_target_band", "Target band must be between 0 and 9");
  }
  const questionId = typeof record.questionId === "string" && record.questionId ? record.questionId : null;
  const question = typeof record.question === "string" && record.question.trim() ? record.question.trim().slice(0, 2_000) : null;
  if (!questionId && !question) {
    throw new AppError(400, "question_required", "Pick a question or type your own");
  }
  return { mode: mode as SpeakingMode, questionId, question, targetBand, feedbackLocale: locale };
}

export function parseCommitSpeakingTurn(input: unknown): CommitSpeakingTurnInput {
  const record = (input ?? {}) as Record<string, unknown>;
  const attemptId = String(record.attemptId ?? "");
  const turnId = String(record.turnId ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(attemptId)) throw new AppError(400, "invalid_attempt_id", "A valid attemptId is required");
  if (!/^[0-9a-f-]{36}$/i.test(turnId)) throw new AppError(400, "invalid_turn_id", "A valid turnId is required");
  const mimeType = String(record.mimeType ?? "");
  if (!SPEAKING_AUDIO_MIME_TYPES.includes(mimeType as never)) {
    throw new AppError(400, "invalid_audio_mime_type", "Unsupported audio type");
  }
  const byteSize = Number(record.byteSize ?? 0);
  if (!Number.isFinite(byteSize) || byteSize <= 0 || byteSize > MAX_SPEAKING_AUDIO_BYTES) {
    throw new AppError(400, "invalid_audio_size", "The recording is empty or too large");
  }
  const durationMs = Number(record.durationMs ?? 0);
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    throw new AppError(400, "invalid_audio_duration", "Invalid recording duration");
  }
  const idempotencyKey = String(record.idempotencyKey ?? "");
  if (!idempotencyKey || idempotencyKey.length > 200) {
    throw new AppError(400, "invalid_idempotency_key", "A valid idempotencyKey is required");
  }
  return { attemptId, turnId, mimeType, byteSize, durationMs, idempotencyKey };
}
```

`AppError` đã được import sẵn trong `schemas.ts` — kiểm tra import hiện có ở đầu file và bổ sung nếu thiếu.

- [ ] **Step 3: Viết Edge Function**

Tạo `supabase/functions/submit-speaking/index.ts`:

```ts
import { requireAuthenticatedUser } from "../_shared/auth.ts";
import {
  AppError, databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod,
} from "../_shared/http.ts";
import { parseCommitSpeakingTurn, parsePrepareSpeaking, type SpeakingMode } from "../_shared/schemas.ts";
import { SPEAKING_AUDIO_BUCKET, SPEAKING_OBJECT_PREFIX } from "../_shared/storage.ts";
import { buildSpeakingPlan } from "../_shared/ai/speakingPlan.ts";
```

`prepare`:
1. `requireAuthenticatedUser(request)` → `context`.
2. `parsePrepareSpeaking(await readJsonBody(request))`.
3. Nếu `input.questionId` → đọc `speaking_questions` (service role) để lấy prompt/questions/cue_card.
4. `buildSpeakingPlan({ mode, question, questionRow })` trả về danh sách turn plan
   (mỗi turn: `{ orderIndex, part, questionId, promptText, questions, cueCard }`).
   Với mode 1 part dùng đúng 1 turn từ câu hỏi đã chọn; với mode `mock` chọn ngẫu nhiên
   2 topic Part 1 + 1 cue card Part 2 + 1 topic Part 3 (Part 3 ưu tiên `related_part3_slug`).
5. Insert `speaking_attempts` (mode, target_band, feedback_locale, turn_count, status='recording').
6. Insert `speaking_turns` cho từng turn (order_index, part, question_id, prompt_text, questions, cue_card).
7. Với turn đầu tiên: tạo signed upload URL qua `context.service.storage.from(SPEAKING_AUDIO_BUCKET).createSignedUploadUrl(path)`
   với `path = ${userId}/${attemptId}/${turnId}.${ext}`.
8. Trả `201 { attemptId, mode, turns: [{ turnId, orderIndex, part, promptText, questions, cueCard, maxDurationMs, uploadUrl, token, objectPath }] }`.

`commit`:
1. Auth + `parseCommitSpeakingTurn`.
2. Load attempt + turn thuộc user (service role). Attempt phải `status='recording'`.
3. Kiểm tra object tồn tại: `context.service.storage.from(BUCKET).download(turn.audio_path)` → nếu lỗi 404 thì `400 audio_not_uploaded`.
4. Update turn: `status='uploaded'`, `byte_size`, `duration_ms`, `audio_path`.
5. Đếm số turn `status='uploaded'` của attempt.
   - Nếu chưa đủ `turn_count` → trả `202 { attemptId, committed: false }`.
   - Nếu đủ → update attempt `status='queued'`; insert `ai_jobs`
     (`operation='grade-speaking'`, `payload={attemptId}`, `idempotency_key`,
     `revision_id=null`). Trả `202 { attemptId, committed: true, jobId }`.
6. Trigger `enforce_ai_job_concurrency` có thể ném lỗi 429 — để lỗi nổi lên `errorResponse`.

Storage helpers — thêm vào `supabase/functions/_shared/storage.ts`:
```ts
export const SPEAKING_AUDIO_BUCKET = "speaking-audio";

export async function removeUserSpeakingAudioObjects(
  service: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data, error } = await service.storage.from(SPEAKING_AUDIO_BUCKET).list(userId, { limit: 1000 });
  if (error) return;
  const paths = (data ?? []).map((item) => `${userId}/${item.name}`);
  if (!paths.length) return;
  await service.storage.from(SPEAKING_AUDIO_BUCKET).remove(paths);
}
```

- [ ] **Step 4: Tạo `supabase/functions/_shared/ai/speakingPlan.ts`**

File thuần, không I/O — chứa `buildSpeakingPlan` nhận:
```ts
export type SpeakingQuestionRow = {
  id: string; part: "part-1" | "part-2" | "part-3"; slug: string; topic: string;
  prompt_text: string; questions: string[]; cue_card: { topic: string; bullets: string[]; time_limit_seconds: number } | null;
  related_part3_slug: string | null;
};
export type SpeakingPlanTurn = {
  orderIndex: number; part: "part-1" | "part-2" | "part-3";
  questionId: string | null; promptText: string; questions: string[];
  cueCard: { topic: string; bullets: string[]; time_limit_seconds: number } | null;
};
export function buildSpeakingPlan(input: {
  mode: SpeakingMode; question: string | null; questionRow: SpeakingQuestionRow | null;
  pool: { part1: SpeakingQuestionRow[]; part2: SpeakingQuestionRow[]; part3: SpeakingQuestionRow[] };
}): SpeakingPlanTurn[]
```
Quy tắc:
- `part-1`/`part-2`/`part-3`: 1 turn, dùng `questionRow` nếu có, nếu không thì dùng `question` text
  (chỉ hợp lệ với `part-1`; `part-2`/`part-3` yêu cầu `questionRow`).
- `mock`: 4 turn — 2 topic Part 1 (random, không trùng), 1 cue card Part 2 (random),
  1 topic Part 3 (random; ưu tiên topic có `related_part3_slug === part2.slug`).

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/submit-speaking supabase/functions/_shared/schemas.ts supabase/functions/_shared/storage.ts supabase/functions/_shared/ai/speakingPlan.ts
git commit -m "feat(speaking): add submit-speaking edge function with two-phase upload"
```

---

## Task 6: Lớp 2 — Claude chấm rubric + tích hợp worker

**Files:**
- Modify: `supabase/functions/_shared/ai/pipeline.ts`
- Modify: `supabase/functions/_shared/jobs.ts` (chỉ nếu `estimateCost`/`insertUsageRows` nằm ở đây — kiểm tra vị trí thật)

- [ ] **Step 1: Thêm tham số pricingVersion**

Trong `pipeline.ts`, đổi chữ ký:
```ts
async function estimateCost(
  service: SupabaseClient,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheCreationTokens: number,
  cacheReadTokens: number,
  pricingVersion: string = PRICING_VERSION,
): Promise<number | null>
```
và dùng `p_pricing_version: pricingVersion` trong RPC.

Tương tự `insertUsageRows(service, jobId, calls, pricingVersion = PRICING_VERSION)` và ghi
`pricing_version: pricingVersion` vào `ai_usage`.

Mọi call site cũ giữ nguyên hành vi (default = `PRICING_VERSION`).

- [ ] **Step 2: Thêm nhánh operation mới**

Trong `processOneAiJob`, thêm vào chuỗi if/else:
```ts
if (job.operation === "grade") {
  resultId = await runGrading(service, job);
} else if (job.operation === "grade-speaking") {
  resultId = await runSpeakingGrading(service, job);
} else if (job.operation === "enrich") {
  await runEnrichment(service, job);
} else {
  resultId = await runWritingTool(service, job);
}
```

Và thêm vào `isSupportedOperation`:
```ts
"grade-speaking"
```

- [ ] **Step 3: Viết `runSpeakingGrading`**

Thêm vào `pipeline.ts`:

```ts
async function runSpeakingGrading(service: SupabaseClient, job: ClaimedJob): Promise<string | null> {
  const attemptId = String(job.payload.attemptId ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(attemptId)) {
    throw new AppError(400, "invalid_job_input", "The speaking job has no attempt");
  }
  const attemptResult = await service
    .from("speaking_attempts")
    .select("id,user_id,mode,target_band,feedback_locale,status")
    .eq("id", attemptId)
    .maybeSingle();
  if (attemptResult.error) throw databaseError("load the speaking attempt");
  const attempt = attemptResult.data;
  if (!attempt) throw new AppError(404, "attempt_not_found", "Speaking attempt not found");

  const turnsResult = await service
    .from("speaking_turns")
    .select("id,order_index,part,prompt_text,questions,cue_card,audio_path,mime_type,duration_ms,status")
    .eq("attempt_id", attemptId)
    .eq("user_id", attempt.user_id)
    .order("order_index", { ascending: true });
  if (turnsResult.error) throw databaseError("load the speaking turns");
  const turns = (turnsResult.data ?? []) as Array<{
    id: string; order_index: number; part: string; prompt_text: string; questions: string[] | null;
    cue_card: unknown; audio_path: string; mime_type: string; duration_ms: number; status: string;
  }>;
  if (!turns.length) throw new AppError(400, "invalid_job_input", "The speaking attempt has no turns");

  await service.from("speaking_attempts").update({ status: "processing" }).eq("id", attemptId);

  // tải audio từng turn
  const audios: Array<{ turnId: string; base64: string; mimeType: string }> = [];
  try {
    for (const turn of turns) {
      const download = await service.storage.from(SPEAKING_AUDIO_BUCKET).download(turn.audio_path);
      if (download.error) throw new AppError(503, "storage_unavailable", "Could not read the recording");
      const bytes = new Uint8Array(await download.data.arrayBuffer());
      audios.push({ turnId: turn.id, base64: bytesToBase64(bytes), mimeType: turn.mime_type });
    }

    // LỚP 1: Gemini đọc audio (song song)
    const analyses = await Promise.all(
      audios.map((audio) =>
        callAudioModel({
          audioBase64: audio.base64,
          mimeType: audio.mimeType,
          prompt: buildAudioPrompt(),
        }).then((r) => ({ turnId: audio.turnId, ...r }))
      ),
    );

    // LỚP 2: Claude chấm rubric
    const model = modelForJob(job, "AI_MODEL_GRADING");
    const prompt = buildSpeakingPrompt({
      locale: attempt.feedback_locale === "en" ? "en" : "vi",
      targetBand: attempt.target_band === null ? null : Number(attempt.target_band),
      rubric: renderSpeakingRubric(),
      turns: turns.map((turn, index) => ({
        turnId: turn.id,
        orderIndex: turn.order_index,
        part: turn.part,
        promptText: turn.prompt_text,
        questions: turn.questions ?? [],
        cueCard: turn.cue_card,
        transcript: analyses[index]?.analysis.transcript ?? "",
        audioAnalysis: analyses[index]?.analysis ?? null,
      })),
    });
    const structured = await requestStructured<SpeakingResult>({
      model,
      system: prompt.system,
      messages: prompt.messages,
      schema: SPEAKING_JSON_SCHEMA as Record<string, unknown>,
      maxTokens: 16_000,
      repairInstruction: "Repair this speaking evaluation output. Return valid JSON with exactly four criteria per turn.",
      validate: (value) => buildSpeakingResult(value as SpeakingModelOutput, { turnIds: turns.map((t) => t.id) }),
    });

    await insertUsageRows(service, job.job_id, structured.calls);

    // tổng hợp transcript + audio analysis
    const transcript = prompt.turns.map((t) => t.transcript).filter(Boolean).join("\n\n");
    const audioAnalysis = {
      turns: prompt.turns.map((t) => ({ turnId: t.turnId, part: t.part, ...(t.audioAnalysis ?? {}) })),
    };

    const insert = await service.from("speaking_results").insert({
      attempt_id: attemptId,
      fluency: structured.value.scores.fluency,
      lexical_resource: structured.value.scores.lexical_resource,
      grammatical_range: structured.value.scores.grammatical_range,
      pronunciation: structured.value.scores.pronunciation,
      overall_raw: structured.value.overallRaw,
      overall_display: structured.value.overallDisplay,
      transcript,
      feedback: structured.value,
      audio_analysis: audioAnalysis,
      model,
      prompt_version: SPEAKING_PROMPT_VERSION,
      rubric_version: SPEAKING_RUBRIC_VERSION,
      schema_version: SPEAKING_SCHEMA_VERSION,
    }).select("id").maybeSingle();
    if (insert.error || !insert.data) throw databaseError("save the speaking result");

    await service.from("speaking_attempts").update({ status: "succeeded" }).eq("id", attemptId);
    await service.from("speaking_turns").update({ status: "graded" }).eq("attempt_id", attemptId);

    return insert.data.id;
  } finally {
    // XOÁ audio sau khi chấm (kể cả khi lỗi) — giống hành vi "scored once then deleted"
    await removeSpeakingAudioObjects(service, attemptId);
  }
}
```

Bổ sung 2 helper trong `pipeline.ts` hoặc `storage.ts`:
```ts
export async function removeSpeakingAudioObjects(service: SupabaseClient, attemptId: string): Promise<void> {
  const { data } = await service.storage.from(SPEAKING_AUDIO_BUCKET).list("", { limit: 1000 });
  void data; // không cần: dùng đường dẫn trực tiếp
}
```
Thực tế đơn giản hơn: xoá theo prefix bằng cách list từng user folder. Vì `speaking_turns.audio_path`
đã lưu đường dẫn đầy đủ, xoá trực tiếp:
```ts
export async function removeSpeakingAudioObjects(service: SupabaseClient, paths: string[]): Promise<void> {
  if (!paths.length) return;
  await service.storage.from(SPEAKING_AUDIO_BUCKET).remove(paths);
}
```
và gọi `removeSpeakingAudioObjects(service, turns.map((t) => t.audio_path))`.

- [ ] **Step 4: Viết `buildSpeakingPrompt` và `buildAudioPrompt`**

Thêm vào `supabase/functions/_shared/prompts.ts`:

```ts
export const SPEAKING_PROMPT_VERSION = "speaking-prompt-v1";
export const SPEAKING_RUBRIC_VERSION = "ielts-speaking-descriptors-3-9";

export function buildAudioPrompt(): string {
  return [
    "You are an IELTS Speaking examiner listening to a candidate's recorded answer.",
    "Return exactly one JSON object and nothing else. Do not wrap it in code fences.",
    "Schema:",
    JSON.stringify({
      type: "object",
      additionalProperties: false,
      required: ["transcript", "fillerWords", "mispronounced", "intonationNotes", "estimatedWpm", "confidence"],
      properties: {
        transcript: { type: "string" },
        fillerWords: { type: "array", items: { type: "string" } },
        mispronounced: { type: "array", items: { type: "object", additionalProperties: false, required: ["word", "issue"], properties: { word: { type: "string" }, issue: { type: "string" } } } },
        intonationNotes: { type: "array", items: { type: "string" } },
        estimatedWpm: { type: ["number", "null"] },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
      },
    }),
    "Rules for the transcript:",
    "- Write exactly what was said. Keep grammatical mistakes, false starts and filler words (um, uh, like, er).",
    "- Do not translate, correct, summarise or add any words that were not said.",
    "- Keep English punctuation and capital letters.",
    "Rules for the analysis:",
    "- fillerWords: only real fillers you actually heard.",
    "- mispronounced: words whose pronunciation was unclear or wrong, with a short issue description.",
    "- intonationNotes: short observations about intonation, rhythm and stress.",
    "- estimatedWpm: approximate spoken words per minute, or null if you cannot estimate.",
    "- confidence: how clearly the audio could be understood.",
  ].join("\n");
}

export function buildSpeakingPrompt(input: {
  locale: "vi" | "en";
  targetBand: number | null;
  rubric: string;
  turns: Array<{
    turnId: string; orderIndex: number; part: string; promptText: string;
    questions: string[]; cueCard: unknown; transcript: string; audioAnalysis: unknown;
  }>;
}): { system: string; messages: unknown[] } {
  const feedbackLanguage = input.locale === "en"
    ? "Write all feedback in English."
    : "Write all feedback in Vietnamese (tiếng Việt). Keep the IELTS criterion names in English.";
  const lines: string[] = [
    "You are a strict IELTS Speaking examiner scoring a candidate's recorded answers.",
    feedbackLanguage,
    "",
    "OFFICIAL IELTS SPEAKING BAND DESCRIPTORS",
    input.rubric,
    "",
    "SCORING RULES",
    "- Score each criterion as a whole band from 0 to 9 using ONLY the descriptors above.",
    "- A criterion score must be justified by what the candidate actually said or how they said it.",
    "- Quote the transcript verbatim when you cite evidence. Never invent quotes.",
    "- If the audio analysis could not observe intelligibility, say so plainly instead of guessing a high Pronunciation score.",
    "- Be realistic: most candidates score between Band 5.5 and Band 7.5. Do not inflate.",
    "- Prefer the LOWER band when the evidence sits between two bands.",
  ];
  if (input.targetBand !== null) {
    lines.push(`- The candidate is aiming for Band ${input.targetBand}. Mention how far they are from it in the overall summary.`);
  }
  lines.push("", "CANDIDATE ANSWERS");
  for (const turn of input.turns) {
    lines.push("", `--- TURN ${turn.orderIndex + 1} (${turn.part}) ---`);
    if (turn.questions.length) {
      lines.push("Questions asked:", ...turn.questions.map((q) => `- ${q}`));
    }
    if (turn.cueCard) lines.push("Cue card:", JSON.stringify(turn.cueCard));
    if (turn.promptText) lines.push("Prompt:", turn.promptText);
    lines.push("Transcript:", turn.transcript || "(nothing intelligible was recorded)");
    lines.push("Audio analysis:", JSON.stringify(turn.audioAnalysis));
  }
  lines.push("", "Return one JSON object with a 'turns' array (one entry per turn, turnId must match) and an 'overall' object.");
  return { system: lines.join("\n"), messages: [{ role: "user", content: "Score this candidate now." }] };
}
```

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/ai/pipeline.ts supabase/functions/_shared/prompts.ts supabase/functions/_shared/storage.ts
git commit -m "feat(speaking): grade speaking attempts with Gemini audio plus Claude rubric"
```

---

## Task 7: Logic thuần phía client

**Files:**
- Create: `src/lib/speakingLogic.ts`
- Test: `tests/speaking.test.ts`

- [ ] **Step 1: Viết test failing**

Tạo `tests/speaking.test.ts`:
```ts
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  aggregateTurnScores, buildSessionPlan, computeOverallBand, formatBand,
  maxDurationMs, validateAudio, audioMimeForFile,
} from "../src/lib/speakingLogic.ts";

test("giới hạn thời lượng theo part", () => {
  assert.equal(maxDurationMs("part-1"), 60_000);
  assert.equal(maxDurationMs("part-2"), 120_000);
  assert.equal(maxDurationMs("part-3"), 90_000);
});

test("validateAudio chặn file quá dài và quá nặng", () => {
  assert.equal(validateAudio({ part: "part-1", byteSize: 1000, durationMs: 61_000 }).ok, false);
  assert.equal(validateAudio({ part: "part-2", byteSize: 5 * 1024 * 1024, durationMs: 10_000 }).ok, false);
  assert.equal(validateAudio({ part: "part-2", byteSize: 1000, durationMs: 30_000 }).ok, true);
});

test("computeOverallBand làm tròn nửa band", () => {
  assert.deepEqual(computeOverallBand([6.5, 6, 7, 6.5]), { raw: 6.5, display: 6.5 });
  assert.deepEqual(computeOverallBand([7, 7, 6, 6]), { raw: 6.5, display: 6.5 });
  assert.deepEqual(computeOverallBand([8, 8, 8, 8]), { raw: 8, display: 8 });
});

test("aggregateTurnScores trung bình từng tiêu chí rồi tính overall", () => {
  const result = aggregateTurnScores([
    [{ criterion: "fluency", score: 8 }, { criterion: "lexical_resource", score: 6 },
     { criterion: "grammatical_range", score: 6 }, { criterion: "pronunciation", score: 6 }],
    [{ criterion: "fluency", score: 6 }, { criterion: "lexical_resource", score: 6 },
     { criterion: "grammatical_range", score: 6 }, { criterion: "pronunciation", score: 8 }],
  ]);
  assert.equal(result.scores.fluency, 7);
  assert.equal(result.scores.pronunciation, 7);
  assert.equal(result.overallDisplay, 6.5);
});

test("buildSessionPlan sinh 4 turn cho mode mock", () => {
  const plan = buildSessionPlan("mock", {
    part1: ["a", "b"], part2: ["c"], part3: ["d"],
  });
  assert.equal(plan.length, 4);
  assert.deepEqual(plan.map((t) => t.part), ["part-1", "part-1", "part-2", "part-3"]);
});

test("formatBand hiển thị 1 chữ số", () => {
  assert.equal(formatBand(6.5), "6.5");
  assert.equal(formatBand(7), "7.0");
});

test("audioMimeForFile đổi đuôi file thành mime được phép", () => {
  assert.equal(audioMimeForFile("recording.webm"), "audio/webm");
  assert.equal(audioMimeForFile("voice.mp4"), "audio/mp4");
  assert.equal(audioMimeForFile("sound.ogg"), "audio/ogg");
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

```bash
cd D:/ielts
node --test tests/speaking.test.ts
```
Expected: FAIL — `Cannot find module '../src/lib/speakingLogic.ts'`.

- [ ] **Step 3: Viết implementation**

Tạo `src/lib/speakingLogic.ts`:

```ts
export type SpeakingMode = "part-1" | "part-2" | "part-3" | "mock";
export type SpeakingPart = "part-1" | "part-2" | "part-3";
export type SpeakingCriterion = "fluency" | "lexical_resource" | "grammatical_range" | "pronunciation";

export const SPEAKING_CRITERIA: SpeakingCriterion[] = ["fluency", "lexical_resource", "grammatical_range", "pronunciation"];

export const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

export const ALLOWED_AUDIO_MIME_TYPES = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg", "audio/mp3"] as const;

export function maxDurationMs(part: SpeakingPart): number {
  if (part === "part-2") return 120_000;
  if (part === "part-3") return 90_000;
  return 60_000;
}

export function validateAudio(input: { part: SpeakingPart; byteSize: number; durationMs: number }):
  { ok: true } | { ok: false; reason: "too_long" | "too_large" | "empty" } {
  if (input.byteSize <= 0) return { ok: false, reason: "empty" };
  if (input.byteSize > MAX_AUDIO_BYTES) return { ok: false, reason: "too_large" };
  if (input.durationMs > maxDurationMs(input.part) + 2_000) return { ok: false, reason: "too_long" };
  return { ok: true };
}

export function computeOverallBand(scores: number[]): { raw: number; display: number } {
  if (!scores.length) return { raw: 0, display: 0 };
  const raw = scores.reduce((total, score) => total + score, 0) / scores.length;
  return { raw, display: Math.round(raw * 2) / 2 };
}

export type TurnCriterionScore = { criterion: SpeakingCriterion; score: number };

export function aggregateTurnScores(turns: TurnCriterionScore[][]): {
  scores: Record<SpeakingCriterion, number>; overallRaw: number; overallDisplay: number;
} {
  const scores = {} as Record<SpeakingCriterion, number>;
  for (const criterion of SPEAKING_CRITERIA) {
    const values = turns.map((turn) => turn.find((item) => item.criterion === criterion)?.score).filter((v): v is number => typeof v === "number");
    const average = values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
    scores[criterion] = Math.round(average * 2) / 2;
  }
  const overall = computeOverallBand(SPEAKING_CRITERIA.map((criterion) => scores[criterion]));
  return { scores, overallRaw: overall.raw, overallDisplay: overall.display };
}

export type SessionPlanTurn = { part: SpeakingPart; index: number };

export function buildSessionPlan(mode: SpeakingMode, pool: {
  part1: string[]; part2: string[]; part3: string[];
}): SessionPlanTurn[] {
  if (mode === "mock") {
    return [
      { part: "part-1", index: 0 }, { part: "part-1", index: 1 },
      { part: "part-2", index: 0 }, { part: "part-3", index: 0 },
    ];
  }
  return [{ part: mode, index: 0 }];
}

export function formatBand(band: number): string {
  return band.toFixed(1);
}

export function audioMimeForFile(name: string): string | null {
  const extension = name.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, string> = {
    webm: "audio/webm", mp4: "audio/mp4", ogg: "audio/ogg",
    wav: "audio/wav", mpeg: "audio/mpeg", mp3: "audio/mp3",
  };
  return map[extension] ?? null;
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

```bash
cd D:/ielts
node --test tests/speaking.test.ts
```
Expected: PASS (7 tests).

- [ ] **Step 5: Thêm vào script test**

Trong `package.json`, sửa `"test"`:
```
"test": "node --test tests/learning.test.ts tests/auth.test.ts tests/sync.test.ts tests/ai.test.ts tests/vocabulary.test.ts tests/vocabularyRepository.test.ts tests/skillLogic.test.ts tests/skillRepository.test.ts tests/agent.test.ts tests/negotiation.test.ts tests/middleware.test.ts tests/discovery.test.ts tests/admin.test.ts tests/reading-corrections.test.mjs tests/speaking.test.ts",
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/speakingLogic.ts tests/speaking.test.ts package.json
git commit -m "feat(speaking): add client-side speaking logic and tests"
```

---

## Task 8: API client phía client

**Files:**
- Create: `src/lib/speaking.ts`
- Modify: `src/lib/ai.ts` (chỉ nếu muốn gom API vào đó; nếu không thì `src/lib/speaking.ts` tự gọi `supabase.functions.invoke`)

- [ ] **Step 1: Viết implementation**

Tạo `src/lib/speaking.ts`:

```ts
import { supabase } from './supabase'
import type { SpeakingMode, SpeakingPart } from './speakingLogic.ts'

export type SpeakingTurnPlan = {
  turnId: string
  orderIndex: number
  part: SpeakingPart
  promptText: string
  questions: string[]
  cueCard: { topic: string; bullets: string[]; time_limit_seconds: number } | null
  maxDurationMs: number
  uploadUrl: string
  token: string
  objectPath: string
}

export type SpeakingAttempt = {
  attemptId: string
  mode: SpeakingMode
  turns: SpeakingTurnPlan[]
}

export type SpeakingResultView = {
  attemptId: string
  overallDisplay: number
  overallRaw: number
  scores: Record<string, number | null>
  transcript: string
  feedback: {
    turns?: Array<{ turnId: string; criteria: Array<{ criterion: string; score: number; rationale: string; evidence: string[]; improvements: string[] }>; summary: string; strengths: string[]; priority_actions: string[] }>
    overall?: { summary: string; priority_actions: string[] }
  }
  audioAnalysis: { turns?: Array<{ turnId: string; part: string; transcript?: string; fillerWords?: string[]; mispronounced?: Array<{ word: string; issue: string }>; intonationNotes?: string[]; estimatedWpm?: number | null; confidence?: string }> }
}

export type SpeakingApiError = { code: string; message: string }

async function invoke<T>(name: string, body: unknown): Promise<{ ok: true; value: T } | { ok: false; code: string }> {
  try {
    const { data, error } = await supabase.functions.invoke(name, { body: body as Record<string, unknown> })
    if (error) {
      const context = (error as { context?: { code?: string; error?: { code?: string } } }).context
      return { ok: false, code: context?.error?.code ?? context?.code ?? 'unknown_error' }
    }
    return { ok: true, value: (data ?? null) as T }
  } catch {
    return { ok: false, code: 'unknown_error' }
  }
}

export function prepareSpeaking(input: {
  mode: SpeakingMode
  questionId?: string | null
  question?: string | null
  targetBand?: number | null
  feedbackLocale: 'vi' | 'en'
}): Promise<{ ok: true; value: SpeakingAttempt } | { ok: false; code: string }> {
  return invoke<SpeakingAttempt>('submit-speaking', { action: 'prepare', ...input })
}

export function commitSpeakingTurn(input: {
  attemptId: string
  turnId: string
  mimeType: string
  byteSize: number
  durationMs: number
}): Promise<{ ok: true; value: { committed: boolean; jobId: string | null } } | { ok: false; code: string }> {
  return invoke('submit-speaking', {
    action: 'commit',
    ...input,
    idempotencyKey: `speaking-${input.attemptId}-${input.turnId}`,
  })
}

export async function pollSpeakingResult(attemptId: string, onUpdate?: (status: string) => void): Promise<
  { ok: true; value: SpeakingResultView } | { ok: false; code: string }
> {
  const deadline = Date.now() + 180_000
  let lastStatus = ''
  while (Date.now() < deadline) {
    const { data, error } = await supabase
      .from('speaking_attempts')
      .select('id,status,error_code,speaking_results(*)')
      .eq('id', attemptId)
      .maybeSingle()
    if (error || !data) return { ok: false, code: 'not_found' }
    const status = String(data.status ?? '')
    if (status !== lastStatus) { lastStatus = status; onUpdate?.(status) }
    if (status === 'succeeded') {
      const row = (data as { speaking_results?: Record<string, unknown>[] }).speaking_results?.[0]
      if (!row) return { ok: false, code: 'not_found' }
      return { ok: true, value: speakingResultView(attemptId, row) }
    }
    if (status === 'failed' || status === 'cancelled') return { ok: false, code: String(data.error_code ?? 'failed') }
    await new Promise((resolve) => setTimeout(resolve, 2500))
  }
  return { ok: false, code: 'service_unavailable' }
}

export function speakingResultView(attemptId: string, row: Record<string, unknown>): SpeakingResultView {
  return {
    attemptId,
    overallDisplay: Number(row.overall_display ?? 0),
    overallRaw: Number(row.overall_raw ?? 0),
    scores: {
      fluency: row.fluency === null ? null : Number(row.fluency),
      lexical_resource: row.lexical_resource === null ? null : Number(row.lexical_resource),
      grammatical_range: row.grammatical_range === null ? null : Number(row.grammatical_range),
      pronunciation: row.pronunciation === null ? null : Number(row.pronunciation),
    },
    transcript: String(row.transcript ?? ''),
    feedback: (row.feedback ?? {}) as SpeakingResultView['feedback'],
    audioAnalysis: (row.audio_analysis ?? {}) as SpeakingResultView['audioAnalysis'],
  }
}

export async function loadSpeakingQuestions(part?: SpeakingPart): Promise<Array<{
  id: string; part: SpeakingPart; slug: string; topic: string; prompt_text: string
  questions: string[]; cue_card: { topic: string; bullets: string[]; time_limit_seconds: number } | null
  related_part3_slug: string | null
}>> {
  let query = supabase.from('speaking_questions').select('id,part,slug,topic,prompt_text,questions,cue_card,related_part3_slug').eq('is_active', true)
  if (part) query = query.eq('part', part)
  const { data } = await query.order('topic', { ascending: true })
  return (data ?? []) as never
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/speaking.ts
git commit -m "feat(speaking): add speaking API client"
```

---

## Task 9: Component ghi âm

**Files:**
- Create: `src/components/speaking/SpeakingRecorder.tsx`

- [ ] **Step 1: Viết implementation**

Tạo `src/components/speaking/SpeakingRecorder.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Upload } from 'lucide-react'

import { useCopy } from '../../i18n'
import { ALLOWED_AUDIO_MIME_TYPES, audioMimeForFile, maxDurationMs, validateAudio, type SpeakingPart } from '../../lib/speakingLogic.ts'

type Props = {
  part: SpeakingPart
  disabled?: boolean
  onRecorded: (audio: { blob: Blob; mimeType: string; durationMs: number }) => void
  onError: (message: string) => void
}

export function SpeakingRecorder({ part, disabled, onRecorded, onError }: Props) {
  const { c } = useCopy()
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const startedAtRef = useRef(0)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const limit = maxDurationMs(part)

  useEffect(() => {
    if (!recording) return
    const timer = setInterval(() => {
      const next = Date.now() - startedAtRef.current
      setElapsed(next)
      if (next >= limit) stop()
    }, 200)
    return () => clearInterval(timer)
  }, [recording, limit])

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) { onError(c('Trình duyệt không hỗ trợ ghi âm.', 'This browser cannot record audio.')); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = ALLOWED_AUDIO_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported?.(type)) ?? ''
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const durationMs = Date.now() - startedAtRef.current
        const type = recorder.mimeType || mimeType || 'audio/webm'
        onRecorded({ blob: new Blob(chunksRef.current, { type }), mimeType: type, durationMs })
      }
      recorderRef.current = recorder
      startedAtRef.current = Date.now()
      recorder.start()
      setRecording(true)
      setElapsed(0)
    } catch {
      onError(c('Không mở được mic. Kiểm tra quyền truy cập.', 'Could not open the microphone. Check the permission.'))
    }
  }

  function stop() {
    recorderRef.current?.stop()
    recorderRef.current = null
    setRecording(false)
  }

  function pickFile() { fileRef.current?.click() }

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const mimeType = audioMimeForFile(file.name) ?? file.type
    if (!ALLOWED_AUDIO_MIME_TYPES.includes(mimeType as never)) {
      onError(c('Định dạng file không được hỗ trợ.', 'That file format is not supported.'))
      return
    }
    const durationMs = await readDuration(file)
    const check = validateAudio({ part, byteSize: file.size, durationMs })
    if (!check.ok) {
      onError(check.reason === 'too_large'
        ? c('File quá lớn (tối đa 4 MB).', 'The file is too large (4 MB max).')
        : c('Bản ghi âm dài quá giới hạn của phần này.', 'The recording is longer than this part allows.'))
      return
    }
    onRecorded({ blob: file, mimeType, durationMs })
  }

  return (
    <div className="flex flex-col gap-3">
      <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={onFileChange} />
      <div className="flex items-center gap-3">
        {recording ? (
          <button type="button" className="btn btn-primary" onClick={stop}>
            <Square size={16} /> {c('Dừng', 'Stop')} {Math.floor(elapsed / 1000)}s
          </button>
        ) : (
          <button type="button" className="btn btn-primary" disabled={disabled} onClick={() => void start()}>
            <Mic size={16} /> {c('Ghi âm', 'Record')}
          </button>
        )}
        <button type="button" className="btn" disabled={disabled || recording} onClick={pickFile}>
          <Upload size={16} /> {c('Tải file lên', 'Upload a file')}
        </button>
        <span className="muted text-[12px]">{Math.floor(limit / 1000)}s {c('tối đa', 'max')} · 4 MB</span>
      </div>
    </div>
  )
}

function readDuration(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(audio.duration ? Math.round(audio.duration * 1000) : 0) }
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(0) }
    audio.src = url
  })
}
```

**Lưu ý:** class `btn` / `btn-primary` / `muted` — kiểm tra `src/styles.css` và `src/pages/Writing.tsx` để dùng đúng tên class đang có. Nếu không có, dùng đúng class đang dùng trong `Writing.tsx`.

- [ ] **Step 2: Commit**

```bash
git add src/components/speaking/SpeakingRecorder.tsx
git commit -m "feat(speaking): add speaking recorder component"
```

---

## Task 10: Component prompt + component kết quả

**Files:**
- Create: `src/components/speaking/SpeakingTurnPrompt.tsx`
- Create: `src/components/speaking/SpeakingResult.tsx`

- [ ] **Step 1: Viết `SpeakingTurnPrompt.tsx`**

```tsx
import { useCopy } from '../../i18n'
import type { SpeakingTurnPlan } from '../../lib/speaking.ts'

export function SpeakingTurnPrompt({ turn }: { turn: SpeakingTurnPlan }) {
  const { c } = useCopy()
  return (
    <div className="card flex flex-col gap-3">
      <div className="eyebrow">{turn.part.toUpperCase()} · {turn.orderIndex + 1}</div>
      {turn.cueCard ? (
        <>
          <h3>{turn.cueCard.topic}</h3>
          <ul className="list-disc pl-5 text-[14px]">
            {turn.cueCard.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
          </ul>
          <p className="muted text-[12px]">{turn.cueCard.time_limit_seconds}s</p>
        </>
      ) : (
        <>
          <h3>{turn.promptText}</h3>
          {turn.questions.length > 1 && (
            <ul className="list-disc pl-5 text-[14px]">
              {turn.questions.map((question) => <li key={question}>{question}</li>)}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Viết `SpeakingResult.tsx`**

```tsx
import { useCopy } from '../../i18n'
import { formatBand, SPEAKING_CRITERIA, type SpeakingCriterion } from '../../lib/speakingLogic.ts'
import type { SpeakingResultView } from '../../lib/speaking.ts'

const CRITERION_LABELS: Record<SpeakingCriterion, readonly [string, string]> = {
  fluency: ['Trôi chảy & Mạch lạc', 'Fluency & Coherence'],
  lexical_resource: ['Vốn từ', 'Lexical Resource'],
  grammatical_range: ['Ngữ pháp', 'Grammatical Range & Accuracy'],
  pronunciation: ['Phát âm', 'Pronunciation'],
}

export function SpeakingResult({ result }: { result: SpeakingResultView }) {
  const { c } = useCopy()
  const turns = result.feedback.turns ?? []
  return (
    <div className="flex flex-col gap-6">
      <div className="card flex items-center gap-6">
        <div>
          <p className="eyebrow">{c('Band ước tính', 'Estimated band')}</p>
          <p className="text-5xl font-black">{formatBand(result.overallDisplay)}</p>
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          {SPEAKING_CRITERIA.map((criterion) => (
            <div key={criterion} className="rounded-xl border p-3">
              <p className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">{c(...CRITERION_LABELS[criterion])}</p>
              <p className="text-2xl font-black">{formatBand(Number(result.scores[criterion] ?? 0))}</p>
            </div>
          ))}
        </div>
      </div>

      {result.feedback.overall?.summary && (
        <section className="card">
          <h3 className="mb-2">{c('Tổng quan', 'Overview')}</h3>
          <p className="text-[14px] leading-relaxed">{result.feedback.overall.summary}</p>
          {result.feedback.overall.priority_actions.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-[14px]">
              {result.feedback.overall.priority_actions.map((action) => <li key={action}>{action}</li>)}
            </ul>
          )}
        </section>
      )}

      {turns.map((turn, index) => (
        <section key={turn.turnId} className="card flex flex-col gap-3">
          <h3>{c(`Lần trả lời ${index + 1}`, `Turn ${index + 1}`)}</h3>
          <p className="text-[14px] leading-relaxed">{turn.summary}</p>
          {turn.criteria.map((criterion) => (
            <div key={criterion.criterion} className="rounded-xl border p-3">
              <p className="text-[12px] font-bold uppercase text-muted-foreground">{criterion.criterion}</p>
              <p className="text-xl font-black">{formatBand(criterion.score)}</p>
              <p className="mt-1 text-[13px]">{criterion.rationale}</p>
              {criterion.improvements.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-[13px]">
                  {criterion.improvements.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}

      {result.transcript && (
        <section className="card">
          <h3 className="mb-2">{c('Lời bạn đã nói', 'What you said')}</h3>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{result.transcript}</p>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/speaking/SpeakingTurnPrompt.tsx src/components/speaking/SpeakingResult.tsx
git commit -m "feat(speaking): add speaking prompt and result components"
```

---

## Task 11: Trang hub + phòng luyện + kết quả + routes

**Files:**
- Create: `src/pages/Speaking.tsx`
- Create: `src/pages/SpeakingRoom.tsx`
- Create: `src/pages/SpeakingResult.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Viết `src/pages/Speaking.tsx` (hub)**

```tsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Mic, Layers, MessageSquare, Puzzle } from 'lucide-react'

import { Empty, PageHeader } from '../components/ui'
import { useCopy } from '../i18n'
import { loadSpeakingQuestions } from '../lib/speaking.ts'
import type { SpeakingPart } from '../lib/speakingLogic.ts'

type Question = {
  id: string; part: SpeakingPart; slug: string; topic: string; prompt_text: string
  questions: string[]; cue_card: { topic: string; bullets: string[]; time_limit_seconds: number } | null
}

const MODES = [
  { mode: 'part-1' as const, icon: MessageSquare, title: 'Part 1', sub: '5 câu · 60 giây' },
  { mode: 'part-2' as const, icon: Layers, title: 'Part 2', sub: 'Cue card · 120 giây' },
  { mode: 'part-3' as const, icon: Puzzle, title: 'Part 3', sub: '4 câu · 90 giây' },
  { mode: 'mock' as const, icon: Mic, title: 'Full mock', sub: 'Cả 3 phần · 14 phút' },
]

export default function Speaking() {
  const { c } = useCopy()
  const [questions, setQuestions] = useState<Question[]>([])
  const [filter, setFilter] = useState<'' | SpeakingPart>('')
  const [search, setSearch] = useState('')

  useEffect(() => { void loadSpeakingQuestions().then(setQuestions) }, [])

  const visible = useMemo(() => questions.filter((question) => {
    if (filter && question.part !== filter) return false
    if (search && !question.topic.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [questions, filter, search])

  return (
    <div className="page">
      <PageHeader
        eyebrow={c('LUYỆN NÓI', 'SPEAKING')}
        title={c('Luyện nói', 'Speaking practice')}
        description={c('Ghi âm bài trả lời và nhận band trên cả bốn tiêu chí Speaking chính thức của IELTS.', 'Record your answer and get a band on all four official IELTS Speaking criteria.')}
      />
      <div className="card-grid">
        {MODES.map((item) => (
          <Link key={item.mode} to={`/app/speaking/${item.mode}`} className="skill-card">
            <span className="skill-card-icon"><item.icon size={20} /></span>
            <div>
              <h3>{item.title}</h3>
              <p className="muted">{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <input className="input" placeholder={c('Tìm chủ đề…', 'Search topics…')} value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="filter-row">
          <button type="button" className={`filter-chip ${filter === '' ? 'is-active' : ''}`} onClick={() => setFilter('')}>{c('Tất cả', 'All')}</button>
          {(['part-1', 'part-2', 'part-3'] as SpeakingPart[]).map((part) => (
            <button key={part} type="button" className={`filter-chip ${filter === part ? 'is-active' : ''}`} onClick={() => setFilter(part)}>{part.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <Empty title={c('Chưa có câu hỏi', 'No questions yet')} description={c('Quản trị viên sẽ thêm câu hỏi vào kho.', 'An administrator will publish questions here.')} />
      ) : (
        <div className="card-grid mt-4">
          {visible.map((question) => (
            <Link key={question.id} to={`/app/speaking/${question.part}`} className="skill-card">
              <span className="skill-card-icon"><Mic size={20} /></span>
              <div>
                <p className="eyebrow">{question.part.toUpperCase()}</p>
                <h3>{question.topic}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Viết `src/pages/SpeakingRoom.tsx`**

```tsx
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { Notice, PageHeader } from '../components/ui'
import { SpeakingRecorder } from '../components/speaking/SpeakingRecorder.tsx'
import { SpeakingTurnPrompt } from '../components/speaking/SpeakingTurnPrompt.tsx'
import { SpeakingResult } from '../components/speaking/SpeakingResult.tsx'
import { useCopy } from '../i18n'
import { commitSpeakingTurn, prepareSpeaking, pollSpeakingResult } from '../lib/speaking.ts'
import type { SpeakingAttempt, SpeakingResultView } from '../lib/speaking.ts'
import type { SpeakingMode } from '../lib/speakingLogic.ts'

export default function SpeakingRoom() {
  const { mode = 'part-1' } = useParams<{ mode: string }>()
  const { c } = useCopy()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState<SpeakingAttempt | null>(null)
  const [turnIndex, setTurnIndex] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'grading'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<SpeakingResultView | null>(null)

  const start = useCallback(async () => {
    setError('')
    const prepared = await prepareSpeaking({ mode: mode as SpeakingMode, feedbackLocale: 'vi' })
    if (!prepared.ok) { setError(prepared.code); return }
    setAttempt(prepared.value)
    setTurnIndex(0)
  }, [mode])

  async function onRecorded(audio: { blob: Blob; mimeType: string; durationMs: number }) {
    if (!attempt) return
    const turn = attempt.turns[turnIndex]
    if (!turn) return
    setPhase('uploading')
    try {
      const upload = await fetch(turn.uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': audio.mimeType },
        body: audio.blob,
      })
      if (!upload.ok) { setError('upload_failed'); setPhase('idle'); return }
      const committed = await commitSpeakingTurn({
        attemptId: attempt.attemptId,
        turnId: turn.turnId,
        mimeType: audio.mimeType,
        byteSize: audio.blob.size,
        durationMs: audio.durationMs,
      })
      if (!committed.ok) { setError(committed.code); setPhase('idle'); return }
      if (turnIndex + 1 < attempt.turns.length) { setTurnIndex(turnIndex + 1); setPhase('idle'); return }
      setPhase('grading')
      const polled = await pollSpeakingResult(attempt.attemptId)
      if (!polled.ok) { setError(polled.code); setPhase('idle'); return }
      setResult(polled.value)
    } catch {
      setError('network_error')
    }
    setPhase('idle')
  }

  if (result) {
    return (
      <div className="page">
        <PageHeader eyebrow="SPEAKING" title={c('Kết quả', 'Your result')} description={c('Band ước tính theo bốn tiêu chí Speaking chính thức.', 'Estimated band across the four official Speaking criteria.')} />
        <SpeakingResult result={result} />
      </div>
    )
  }

  const turn = attempt?.turns[turnIndex]

  return (
    <div className="page">
      <PageHeader
        eyebrow="SPEAKING"
        title={c('Luyện nói', 'Speaking practice')}
        description={c('Ghi âm, rồi AI chấm band trên bốn tiêu chí chính thức.', 'Record your answer and get a band on the four official criteria.')}
      />
      {error && <Notice error><div><strong>{c('Có lỗi xảy ra', 'Something went wrong')}</strong><p>{error}</p></div></Notice>}
      {!attempt && (
        <div className="card">
          <p>{c('Bắt đầu để nhận câu hỏi.', 'Start to get your question.')}</p>
          <button type="button" className="btn btn-primary" onClick={() => void start()}>{c('Bắt đầu', 'Start')}</button>
        </div>
      )}
      {attempt && turn && (
        <div className="flex flex-col gap-4">
          <p className="muted text-[12px]">{c('Lần trả lời', 'Turn')} {turnIndex + 1} / {attempt.turns.length}</p>
          <SpeakingTurnPrompt turn={turn} />
          <SpeakingRecorder part={turn.part} disabled={phase !== 'idle'} onRecorded={(audio) => void onRecorded(audio)} onError={setError} />
        </div>
      )}
      {phase === 'grading' && <p className="muted">{c('Đang chấm…', 'Scoring…')}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Viết `src/pages/SpeakingResult.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import { Notice, PageHeader } from '../components/ui'
import { SpeakingResult } from '../components/speaking/SpeakingResult.tsx'
import { useCopy } from '../i18n'
import { pollSpeakingResult, type SpeakingResultView } from '../lib/speaking.ts'

export default function SpeakingResultPage() {
  const { attemptId = '' } = useParams<{ attemptId: string }>()
  const { c } = useCopy()
  const [result, setResult] = useState<SpeakingResultView | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void pollSpeakingResult(attemptId).then((outcome) => {
      if (outcome.ok) setResult(outcome.value)
      else setError(outcome.code)
    })
  }, [attemptId])

  return (
    <div className="page">
      <PageHeader eyebrow="SPEAKING" title={c('Kết quả', 'Your result')} />
      {error && <Notice error><div><strong>{c('Không tải được kết quả', 'Could not load the result')}</strong><p>{error}</p></div></Notice>}
      {result && <SpeakingResult result={result} />}
    </div>
  )
}
```

- [ ] **Step 4: Thêm routes**

Trong `src/App.tsx`, thêm import lazy và 3 route vào nhóm `RouteGuard`:
```tsx
const Speaking = lazy(() => import('./pages/Speaking.tsx'))
const SpeakingRoom = lazy(() => import('./pages/SpeakingRoom.tsx'))
const SpeakingResult = lazy(() => import('./pages/SpeakingResult.tsx'))
```
```tsx
<Route path="/app/speaking" element={<Suspense fallback={<AppFallback />}><Speaking /></Suspense>} />
<Route path="/app/speaking/result/:attemptId" element={<Suspense fallback={<AppFallback />}><SpeakingResult /></Suspense>} />
<Route path="/app/speaking/:mode" element={<Suspense fallback={<AppFallback />}><SpeakingRoom /></Suspense>} />
```
**Thứ tự route:** `/app/speaking/result/:attemptId` phải đứng **trước** `/app/speaking/:mode`, nếu không `result` sẽ bị `:mode` nuốt.

- [ ] **Step 5: Thêm nav item**

Trong `src/components/Layout.tsx`, thêm vào mảng `nav` ngay sau dòng `/app/reading`:
```tsx
{ path: '/app/speaking', icon: Mic, label: c('Luyện nói', 'Speaking') },
```
và thêm `Mic` vào danh sách import từ `lucide-react`.

- [ ] **Step 6: Kiểm tra route bị nuốt**

Chạy `npm run build` để chắc TypeScript + Vite build xanh:
```bash
cd D:/ielts
npm run build
```
Expected: `✓ built`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Speaking.tsx src/pages/SpeakingRoom.tsx src/pages/SpeakingResult.tsx src/App.tsx src/components/Layout.tsx
git commit -m "feat(speaking): add speaking hub, practice room and result pages"
```

---

## Task 12: Seed dữ liệu, giá AI, cron, tài liệu

**Files:**
- Modify: `supabase/seed/seed-ai-pricing.mjs`
- Modify: `supabase/scripts/setup-cron.mjs`
- Modify: `package.json`
- Modify: `README.md`
- Existing: `supabase/seed/speaking-questions.json`, `supabase/seed/seed-speaking-questions.mjs`, `scripts/build-speaking-questions.mjs`

- [ ] **Step 1: Thêm giá Gemini**

Trong `supabase/seed/seed-ai-pricing.mjs`, thêm hằng `GEMINI_PRICING_VERSION = 'gemini-pricing-v1'` và hàm nạp riêng (bảng `ai_pricing` có PK `(pricing_version, model)` nên hai version không đụng nhau):

```js
const GEMINI_PRICING_VERSION = 'gemini-pricing-v1'
// Giá audio của gemini-3.8-flash chưa được xác minh từ nguồn chính thức.
// Ghi 0 để estimate_ai_cost trả null => estimated_cost_usd = null (không ghi giá sai).
const geminiPricing = [
  { model: 'gemini-3.8-flash', input: 0, output: 0, cacheWrite: 0, cacheRead: 0 },
]
```
và gọi `post('ai_pricing?on_conflict=pricing_version,model', ...)` với `pricing_version: GEMINI_PRICING_VERSION`.

- [ ] **Step 2: Nâng cron 30s**

Trong `supabase/scripts/setup-cron.mjs`, đổi:
```js
     '10 seconds',
```
thành
```js
     '30 seconds',
```
và cập nhật comment đầu file: "Gọi worker `process-ai-jobs` mỗi 30 giây."

Chạy lại:
```bash
cd D:/ielts
node --env-file-if-exists=.env.local supabase/scripts/setup-cron.mjs
```
Expected: `OK  select cron.schedule(...)` và không có lỗi.

- [ ] **Step 3: Thêm script seed**

Trong `package.json`, thêm:
```json
"db:seed:speaking": "node --env-file-if-exists=.env.local supabase/seed/seed-speaking-questions.mjs",
```
và thêm `db:seed:speaking` vào chuỗi `db:seed`.

- [ ] **Step 4: Nạp câu hỏi mẫu**

```bash
cd D:/ielts
node --env-file-if-exists=.env.local supabase/seed/seed-speaking-questions.mjs
```
Expected: `Đã nạp 79 câu hỏi:` với `part-1: 25`, `part-2: 34`, `part-3: 20`.

- [ ] **Step 5: Deploy Edge Function**

```bash
cd D:/ielts
node --env-file-if-exists=.env.local supabase/scripts/deploy-functions.mjs
```
Expected: `submit-speaking` được deploy thành công.

Đặt secret cần thiết (nếu chưa có):
```bash
npx supabase secrets set AI_MODEL_AUDIO=gemini-3.8-flash
```
`AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL_GRADING` đã có sẵn từ Writing.

- [ ] **Step 6: Cập nhật README**

Thêm mục Speaking vào README, mô tả: 4 mode, 2 lớp AI (Gemini Flash đọc audio → Claude Haiku chấm rubric ETS), audio xoá sau khi chấm, lệnh seed.

- [ ] **Step 7: Chạy toàn bộ test**

```bash
cd D:/ielts
npm test
npm run test:edge
npm run build
```
Expected: tất cả PASS, build xanh.

- [ ] **Step 8: Commit**

```bash
git add supabase/seed/seed-ai-pricing.mjs supabase/scripts/setup-cron.mjs package.json README.md
git commit -m "feat(speaking): seed pricing, raise cron to 30s and document the module"
```

---

## Self-review

**Spec coverage:**
| Spec mục | Task |
|---|---|
| §3.1 migration (4 bảng, bucket, RLS, lease 240s) | Task 1 |
| §3.2 bộ câu hỏi 79 bộ + `related_part3_slug` | Task 3 (`speaking.ts`), Task 12 (seed) |
| §3.3 kế hoạch session (4 mode) | Task 5 (`speakingPlan.ts`), Task 7 (`buildSessionPlan`) |
| §3.4 câu hỏi tự nhập | Task 5 (`parsePrepareSpeaking`) |
| §3.5 lưu audio + xoá sau khi chấm | Task 1, Task 5, Task 6 |
| §4.1 Gemini đọc audio | Task 4, Task 6 |
| §4.2 Claude chấm rubric, server tự tính band | Task 3, Task 6 |
| §4.3 band descriptor 3–9 | Task 2 |
| §4.4 calibration + floor rule | Task 6 (`buildSpeakingPrompt`) |
| §4.5 lease 240s + pricingVersion | Task 1, Task 6 |
| §5 API 2 phase | Task 5 |
| §6 frontend hub / room / result | Task 9, 10, 11 |
| §7 xử lý lỗi | Task 5, 7, 11 |
| §8 cron 30s | Task 12 |
| §9 test | Task 2, 3, 7 |
| §10 file manifest | Task 1–12 |
| §0 không đụng Reading | Task 1 (chỉ thêm bucket), Task 11 (chỉ thêm route + nav item) |

**Type consistency:** `SpeakingCriterion` định nghĩa ở Task 2 (`speakingRubric.ts`) và tái xuất ở Task 3 (`speaking.ts`); Task 7 định nghĩa bản client riêng trong `speakingLogic.ts` với cùng tên 4 giá trị — dùng `SPEAKING_CRITERIA` cho cả hai. `SpeakingMode`/`SpeakingPart` khai báo ở Task 5 (`schemas.ts`) và Task 7 (`speakingLogic.ts`) — client không import từ `_shared`, nên giữ hai khai báo độc lập cùng giá trị.

**Placeholder scan:** không còn TBD/TODO; mọi bước đều có code hoặc lệnh cụ thể.
