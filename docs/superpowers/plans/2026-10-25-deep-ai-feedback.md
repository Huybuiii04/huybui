# AI phản hồi sâu hơn band score — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Biến kết quả chấm bài từ "band + 4 tiêu chí" thành phản hồi sâu: lỗi sai kèm cách sửa, điểm chưa hợp lý, lộ trình lên band, từ vựng nâng cao (AI gợi ý + người dùng tự nhập) và cấu trúc bài.

**Architecture:** Không thêm Edge Function, không tăng số lượt gọi model. Mở rộng output của job `enrich` (đã tồn tại) thêm 3 nhóm mới → lưu vào `essay_features`; frontend đọc `essay_features` + `error_logs` (RLS đã cho phép) và render 5 khối accordion trong `GradingResult`. Song song, lớp gọi AI được tách ra để hỗ trợ provider bên thứ 3 (OpenAI-compatible hoặc Anthropic-compatible) với JSON lấy theo kiểu prompt.

**Tech Stack:** Deno Edge Functions (Supabase), React 19 + TypeScript + Vite, Supabase Postgres/RLS, `node:test` cho unit test, Playwright cho test trình duyệt.

**Spec:** `docs/superpowers/specs/2026-10-25-deep-ai-feedback-design.md`

---

## Cấu trúc file

**Tạo mới**

| File | Trách nhiệm |
|---|---|
| `supabase/functions/_shared/provider.ts` | Lớp gọi AI đa nhà cung cấp: dựng URL, header, body, parse response, bóc JSON. Thuần, không network → test được. |
| `supabase/functions/_shared/tests/provider.test.ts` | Test lớp provider (URL, header, parse, bóc JSON). |
| `supabase/migrations/016_feedback_coaching.sql` | Thêm 3 cột jsonb vào `essay_features`. |
| `src/lib/featuresRepository.ts` | Đọc `essay_features` + `error_logs` từ Supabase; poll chờ enrich xong. |
| `src/components/VocabularyCardDialog.tsx` | Hộp thoại thêm thẻ dùng chung (thủ công). |
| `src/data/sampleFeatures.ts` | Fixture mẫu cho trang demo. |

**Sửa**

| File | Thay đổi |
|---|---|
| `supabase/functions/_shared/anthropic.ts` | Dùng `provider.ts`; JSON lấy bằng prompt + bóc + repair; thử lại protocol còn lại khi 404/405. |
| `supabase/functions/_shared/ai/enrich.ts` | `enrichment-v2`: thêm `unnatural`, `vocabulary_plan`, `band_plan` + validate. |
| `supabase/functions/_shared/prompts.ts` | `buildEnrichmentPrompt` nhận `taskType` + `targetBand`, thêm yêu cầu 3 nhóm mới. |
| `supabase/functions/_shared/ai/pipeline.ts` | Truyền param mới; so `schema_version`; ghi 3 cột mới. |
| `src/lib/aiLogic.ts` | Kiểu + parser `featuresFromRow`, `errorLogsFromRows`. |
| `src/lib/ai.ts` | Dùng `fetchLatestRevisionId` của repository mới. |
| `src/components/GradingResult.tsx` | 5 khối accordion mới + nút thêm từ thủ công. |
| `src/pages/Writing.tsx` | Poll features sau khi chấm + trạng thái chờ. |
| `src/pages/Essays.tsx` | `EssayDetail` nạp features/errors; trang demo render khối mới. |
| `src/pages/Learning.tsx` | Sổ lỗi sai đọc `error_logs`; trang từ vựng dùng dialog dùng chung. |
| `src/styles.css` | Style cho khối mới + lightbox sổ lỗi. |
| `README.md` | Ghi biến môi trường mới + mô tả tính năng. |

**Quy ước test trong repo:** test edge dùng `node:test` với `describe`/`it` + dấu `;`; test frontend dùng `node:test` với `test()`, không dấu `;`, nhất quán với file đang có.

---

### Task 1: Lớp provider đa nhà cung cấp

**Files:**
- Create: `supabase/functions/_shared/provider.ts`
- Test: `supabase/functions/_shared/tests/provider.test.ts`

- [ ] **Step 1: Viết test thất bại**

Tạo `supabase/functions/_shared/tests/provider.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractJson,
  parseProviderResponse,
  protocolCandidates,
  providerBody,
  providerEndpoint,
  providerHeaders,
  resolveProviderConfig,
  structuredInstruction,
} from "../provider.ts";

const config = (extra: Record<string, string | undefined> = {}) =>
  resolveProviderConfig({ AI_API_KEY: "secret", ...extra });

describe("provider configuration", () => {
  it("defaults to the official Anthropic endpoint", () => {
    const resolved = config();
    assert.equal(resolved.baseUrl, "https://api.anthropic.com");
    assert.equal(resolved.protocol, "auto");
    assert.equal(resolved.structuredMode, "prompt");
  });

  it("falls back to ANTHROPIC_API_KEY when AI_API_KEY is absent", () => {
    const resolved = resolveProviderConfig({ ANTHROPIC_API_KEY: "legacy" });
    assert.equal(resolved.apiKey, "legacy");
  });

  it("reads the base url and trims trailing slashes", () => {
    const resolved = config({ AI_API_BASE_URL: "https://api.third-party.dev/" });
    assert.equal(resolved.baseUrl, "https://api.third-party.dev");
  });

  it("detects the protocol from the url and otherwise tries both", () => {
    assert.deepEqual(protocolCandidates(config({ AI_API_BASE_URL: "https://x.dev/v1/chat/completions" })), ["openai"]);
    assert.deepEqual(protocolCandidates(config({ AI_API_BASE_URL: "https://x.dev/v1/messages" })), ["anthropic"]);
    assert.deepEqual(protocolCandidates(config({ AI_API_BASE_URL: "https://x.dev" })), ["anthropic", "openai"]);
    assert.deepEqual(protocolCandidates(config({ AI_API_PROTOCOL: "openai" })), ["openai"]);
  });
});

describe("provider request shaping", () => {
  it("builds the anthropic endpoint and headers", () => {
    const resolved = config({ AI_API_BASE_URL: "https://x.dev" });
    assert.equal(providerEndpoint(resolved, "anthropic"), "https://x.dev/v1/messages");
    assert.equal(providerEndpoint(resolved, "openai"), "https://x.dev/v1/chat/completions");
    const headers = providerHeaders(resolved, "anthropic");
    assert.equal(headers["x-api-key"], "secret");
    assert.equal(headers["anthropic-version"], "2023-06-01");
  });

  it("keeps an endpoint that already carries its path", () => {
    const resolved = config({ AI_API_BASE_URL: "https://x.dev/v1/messages" });
    assert.equal(providerEndpoint(resolved, "anthropic"), "https://x.dev/v1/messages");
  });

  it("uses a bearer token for the openai protocol", () => {
    const headers = providerHeaders(config(), "openai");
    assert.equal(headers.Authorization, "Bearer secret");
  });

  it("moves the system prompt into a system message for openai", () => {
    const body = providerBody(config(), "openai", {
      model: "m",
      system: "be nice",
      messages: [{ role: "user", content: [{ type: "text", text: "hi" }] }],
      schema: { type: "object" },
      maxTokens: 100,
    });
    const messages = body.messages as Array<{ role: string; content: unknown }>;
    assert.equal(messages[0].role, "system");
    assert.equal(messages[0].content, "be nice");
    assert.equal(body.max_tokens, 100);
  });

  it("converts anthropic image blocks into openai image_url blocks", () => {
    const body = providerBody(config(), "openai", {
      model: "m",
      system: "",
      messages: [{ role: "user", content: [{ type: "image", source: { media_type: "image/png", data: "AAA" } }] }],
      schema: {},
      maxTokens: 10,
    });
    const messages = body.messages as Array<{ content: Array<Record<string, unknown>> }>;
    const block = messages[1].content[0];
    assert.equal(block.type, "image_url");
    assert.deepEqual(block.image_url, { url: "data:image/png;base64,AAA" });
  });

  it("omits structured-output hints in prompt mode", () => {
    const body = providerBody(config(), "anthropic", {
      model: "m",
      system: "",
      messages: [],
      schema: { type: "object" },
      maxTokens: 10,
    });
    assert.equal(body.output_config, undefined);
  });
});

describe("provider response parsing", () => {
  it("reads an anthropic messages response", () => {
    const parsed = parseProviderResponse(
      {
        id: "msg_1",
        model: "claude-x",
        content: [{ type: "text", text: "{\"ok\":true}" }],
        stop_reason: "end_turn",
        usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: 5 },
      },
      new Headers(),
    );
    assert.equal(parsed.rawText, "{\"ok\":true}");
    assert.equal(parsed.usage.input_tokens, 10);
    assert.equal(parsed.usage.output_tokens, 20);
    assert.equal(parsed.usage.cache_read_input_tokens, 5);
    assert.equal(parsed.providerRequestId, "msg_1");
    assert.equal(parsed.truncated, false);
  });

  it("reads an openai chat completion response", () => {
    const parsed = parseProviderResponse(
      {
        id: "chatcmpl_1",
        model: "claude-x",
        choices: [{ message: { content: "{\"ok\":true}" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 11, completion_tokens: 21, prompt_tokens_details: { cached_tokens: 6 } },
      },
      new Headers(),
    );
    assert.equal(parsed.rawText, "{\"ok\":true}");
    assert.equal(parsed.usage.input_tokens, 11);
    assert.equal(parsed.usage.output_tokens, 21);
    assert.equal(parsed.usage.cache_read_input_tokens, 6);
  });

  it("flags a truncated openai response", () => {
    const parsed = parseProviderResponse(
      { choices: [{ message: { content: "partial" }, finish_reason: "length" }], usage: {} },
      new Headers(),
    );
    assert.equal(parsed.truncated, true);
  });

  it("returns empty text for an unknown shape", () => {
    const parsed = parseProviderResponse({ surprise: true }, new Headers());
    assert.equal(parsed.rawText, "");
  });
});

describe("json extraction", () => {
  it("parses plain json", () => {
    assert.deepEqual(extractJson("{\"a\":1}"), { a: 1 });
  });

  it("parses json wrapped in a code fence", () => {
    assert.deepEqual(extractJson("```json\n{\"a\":1}\n```"), { a: 1 });
  });

  it("parses json surrounded by prose", () => {
    assert.deepEqual(extractJson('Here you go:\n{"a":1}\nHope that helps.'), { a: 1 });
  });

  it("returns null for broken json", () => {
    assert.equal(extractJson("{not json"), null);
    assert.equal(extractJson(""), null);
  });

  it("describes the required json shape", () => {
    const instruction = structuredInstruction({ type: "object" });
    assert.match(instruction, /one JSON object/);
    assert.match(instruction, /"type":"object"/);
  });
});
```

- [ ] **Step 2: Chạy test để thấy thất bại**

Run: `npm run test:edge`

Expected: FAIL — `Cannot find module "../provider.ts"`.

- [ ] **Step 3: Viết implementation tối thiểu**

Tạo `supabase/functions/_shared/provider.ts`:

```ts
export type ProviderProtocol = "anthropic" | "openai";
export type ProviderMode = "auto" | ProviderProtocol;

export type ProviderConfig = {
  baseUrl: string;
  apiKey: string;
  protocol: ProviderMode;
  structuredMode: "prompt" | "native";
};

export type ProviderUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
};

export type ProviderResponse = {
  rawText: string;
  usage: ProviderUsage;
  providerRequestId: string;
  model: string;
  truncated: boolean;
  refusal: boolean;
};

export const ANTHROPIC_VERSION = "2023-06-01";

export function resolveProviderConfig(env: Record<string, string | undefined>): ProviderConfig {
  const rawBase = (env.AI_API_BASE_URL ?? "https://api.anthropic.com").trim();
  const baseUrl = rawBase.replace(/\/+$/, "");
  const apiKey = (env.AI_API_KEY ?? env.ANTHROPIC_API_KEY ?? "").trim();
  const declared = (env.AI_API_PROTOCOL ?? "auto").trim().toLowerCase();
  const protocol: ProviderMode = declared === "anthropic" || declared === "openai" ? declared : "auto";
  const mode = (env.AI_STRUCTURED_MODE ?? "prompt").trim().toLowerCase();
  return { baseUrl, apiKey, protocol, structuredMode: mode === "native" ? "native" : "prompt" };
}

export function protocolCandidates(config: ProviderConfig): ProviderProtocol[] {
  if (config.protocol !== "auto") return [config.protocol];
  if (config.baseUrl.includes("/chat/completions")) return ["openai"];
  if (config.baseUrl.includes("/messages")) return ["anthropic"];
  return ["anthropic", "openai"];
}

export function providerEndpoint(config: ProviderConfig, protocol: ProviderProtocol): string {
  if (config.baseUrl.endsWith("/messages") || config.baseUrl.endsWith("/chat/completions")) return config.baseUrl;
  return protocol === "openai" ? `${config.baseUrl}/v1/chat/completions` : `${config.baseUrl}/v1/messages`;
}

export function providerHeaders(config: ProviderConfig, protocol: ProviderProtocol): Record<string, string> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (protocol === "openai") {
    headers.Authorization = `Bearer ${config.apiKey}`;
    return headers;
  }
  headers["x-api-key"] = config.apiKey;
  headers["anthropic-version"] = ANTHROPIC_VERSION;
  return headers;
}

export type ProviderRequestInput = {
  model: string;
  system: string;
  messages: unknown[];
  schema: Record<string, unknown>;
  maxTokens: number;
};

export function providerBody(config: ProviderConfig, protocol: ProviderProtocol, input: ProviderRequestInput): Record<string, unknown> {
  if (protocol === "openai") {
    const body: Record<string, unknown> = {
      model: input.model,
      messages: [{ role: "system", content: input.system }, ...toOpenAiMessages(input.messages)],
      max_tokens: input.maxTokens,
      max_completion_tokens: input.maxTokens,
    };
    if (config.structuredMode === "native") {
      body.response_format = { type: "json_schema", json_schema: { name: "result", schema: input.schema, strict: false } };
    }
    return body;
  }
  const body: Record<string, unknown> = {
    model: input.model,
    max_tokens: input.maxTokens,
    system: input.system,
    messages: input.messages,
  };
  if (config.structuredMode === "native") {
    body.output_config = { format: { type: "json_schema", schema: input.schema } };
  }
  return body;
}

function toOpenAiMessages(messages: unknown[]): unknown[] {
  return messages.map((message) => {
    const record = (message ?? {}) as { role?: string; content?: unknown };
    if (typeof record.content === "string") return { role: record.role ?? "user", content: record.content };
    const blocks = Array.isArray(record.content) ? record.content : [];
    return {
      role: record.role ?? "user",
      content: blocks.map((block) => {
        const item = (block ?? {}) as { type?: string; text?: string; source?: { media_type?: string; data?: string } };
        if (item.type === "image" && item.source?.data) {
          return { type: "image_url", image_url: { url: `data:${item.source.media_type ?? "image/png"};base64,${item.source.data}` } };
        }
        if (item.type === "text") return { type: "text", text: item.text ?? "" };
        return item;
      }),
    };
  });
}

export function extractTextContent(content: unknown[]): string {
  if (!Array.isArray(content)) return "";
  return content
    .filter((block): block is { type: "text"; text: string } =>
      Boolean(block) &&
      typeof block === "object" &&
      (block as { type?: unknown }).type === "text" &&
      typeof (block as { text?: unknown }).text === "string"
    )
    .map((block) => block.text)
    .join("")
    .trim();
}

export function parseProviderResponse(body: unknown, headers: Headers): ProviderResponse {
  const record = (body ?? {}) as Record<string, unknown>;
  const empty: ProviderUsage = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
  if (Array.isArray(record.content)) {
    const usage = record.usage as Record<string, unknown> | undefined;
    return {
      rawText: extractTextContent(record.content),
      usage: {
        input_tokens: numberOrZero(usage?.input_tokens),
        output_tokens: numberOrZero(usage?.output_tokens),
        cache_creation_input_tokens: numberOrZero(usage?.cache_creation_input_tokens),
        cache_read_input_tokens: numberOrZero(usage?.cache_read_input_tokens),
      },
      providerRequestId: headers.get("request-id") ?? (typeof record.id === "string" ? record.id : ""),
      model: typeof record.model === "string" ? record.model : "",
      truncated: record.stop_reason === "max_tokens",
      refusal: record.stop_reason === "refusal",
    };
  }
  if (Array.isArray(record.choices)) {
    const choice = record.choices[0] as { message?: { content?: unknown }; finish_reason?: string } | undefined;
    const content = choice?.message?.content;
    const usage = record.usage as Record<string, unknown> | undefined;
    const cached = (usage?.prompt_tokens_details as Record<string, unknown> | undefined)?.cached_tokens;
    return {
      rawText: typeof content === "string" ? content : "",
      usage: {
        input_tokens: numberOrZero(usage?.prompt_tokens),
        output_tokens: numberOrZero(usage?.completion_tokens),
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: numberOrZero(cached),
      },
      providerRequestId: headers.get("x-request-id") ?? (typeof record.id === "string" ? record.id : ""),
      model: typeof record.model === "string" ? record.model : "",
      truncated: choice?.finish_reason === "length",
      refusal: false,
    };
  }
  return { rawText: "", usage: empty, providerRequestId: "", model: "", truncated: false, refusal: false };
}

export function structuredInstruction(schema: Record<string, unknown>): string {
  return [
    "Return exactly one JSON object and nothing else.",
    "Do not wrap it in code fences and do not add any explanation before or after it.",
    "The JSON object must match this schema:",
    JSON.stringify(schema),
  ].join("\n");
}

export function extractJson(rawText: string): unknown | null {
  const trimmed = (rawText ?? "").trim();
  if (!trimmed) return null;
  const candidates: string[] = [];
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed);
  if (fenced?.[1]) candidates.push(fenced[1].trim());
  candidates.push(trimmed);
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) candidates.push(trimmed.slice(start, end + 1));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Thử candidate tiếp theo.
    }
  }
  return null;
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
```

- [ ] **Step 4: Chạy test để thấy PASS**

Run: `npm run test:edge`

Expected: PASS — tất cả test trong `provider.test.ts` xanh.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/provider.ts supabase/functions/_shared/tests/provider.test.ts
git commit -m "feat(ai): lop provider ho tro nhieu nha cung cap"
```

---

### Task 2: Nối provider vào client AI

**Files:**
- Modify: `supabase/functions/_shared/anthropic.ts`
- Test: `supabase/functions/_shared/tests/anthropic.test.ts`

- [ ] **Step 1: Viết test thất bại**

Bổ sung vào `supabase/functions/_shared/tests/anthropic.test.ts`:

```ts
import { buildStructuredSystemPrompt } from "../anthropic.ts";

describe("structured output prompt mode", () => {
  it("appends the json contract to the system prompt", () => {
    const prompt = buildStructuredSystemPrompt("be nice", { type: "object" });
    assert.match(prompt, /be nice/);
    assert.match(prompt, /one JSON object/);
  });
});
```

- [ ] **Step 2: Chạy test để thấy thất bại**

Run: `npm run test:edge`

Expected: FAIL — `buildStructuredSystemPrompt` chưa được export.

- [ ] **Step 3: Sửa `anthropic.ts`**

Thay phần đầu file:

```ts
import {
  extractJson,
  extractTextContent,
  parseProviderResponse,
  protocolCandidates,
  providerBody,
  providerEndpoint,
  providerHeaders,
  resolveProviderConfig,
  structuredInstruction,
  type ProviderProtocol,
} from "./provider.ts";

export { extractTextContent } from "./provider.ts";

export const ANTHROPIC_TIMEOUT_MS = 90_000;
export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
export const PRICING_VERSION = "anthropic-pricing-v1";
```

Thêm hàm:

```ts
export function buildStructuredSystemPrompt(system: string, schema: Record<string, unknown>): string {
  return `${system}\n\n${structuredInstruction(schema)}`;
}
```

Trong `requestStructured`, thay `JSON.parse(first.rawText)` bằng `extractJson(first.rawText)` (2 chỗ), và:

```ts
    const value = request.validate(extractJson(first.rawText) as unknown);
```

Trong `callAnthropic`, thay toàn bộ phần gọi `fetch` bằng:

```ts
  const config = resolveProviderConfig(readEnvMap());
  if (!config.apiKey) {
    throw new AnthropicError("AI provider configuration is missing", "missing_api_key", false);
  }
  if (!model) {
    throw new AnthropicError("AI model configuration is missing", "missing_model", false);
  }
  const systemText = config.structuredMode === "prompt"
    ? buildStructuredSystemPrompt(system, schema)
    : system;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1, timeoutMs));
  const startedAt = Date.now();

  try {
    let lastError: AnthropicError | null = null;
    for (const protocol of protocolCandidates(config)) {
      const response = await fetch(providerEndpoint(config, protocol), {
        method: "POST",
        headers: providerHeaders(config, protocol),
        body: JSON.stringify(providerBody(config, protocol, { model, system: systemText, messages, schema, maxTokens })),
        signal: controller.signal,
      });

      if (!response.ok) {
        const classified = classifyProviderError(response.status);
        lastError = new AnthropicError(
          classified.message,
          classified.code,
          classified.retryable,
          response.status,
          parseRetryAfter(response.headers.get("retry-after")) ?? undefined,
        );
        // Endpoint sai (404/405) → thử protocol còn lại.
        if (response.status === 404 || response.status === 405) continue;
        throw lastError;
      }

      const body = await response.json();
      const parsed = parseProviderResponse(body, response.headers);
      if (!parsed.rawText) {
        throw new AnthropicError("The AI provider returned no text output", "empty_model_output", false);
      }
      if (parsed.truncated) {
        throw new AnthropicError("The AI provider output was truncated", "truncated_model_output", false);
      }
      if (parsed.refusal) {
        throw new AnthropicError("The AI provider refused the request", "provider_refusal", false);
      }
      return {
        rawText: parsed.rawText,
        usage: parsed.usage,
        providerRequestId: parsed.providerRequestId,
        model: parsed.model || model,
        latencyMs: Date.now() - startedAt,
      };
    }
    throw lastError ?? new AnthropicError("The AI provider could not be reached", "network_error", true);
  } catch (error) {
    if (error instanceof AnthropicError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AnthropicError("The AI provider request timed out", "provider_timeout", true);
    }
    throw classifyProviderError(error instanceof Error ? error : new Error("network_error"));
  } finally {
    clearTimeout(timeout);
  }
```

Thêm helper đọc env:

```ts
function readEnvMap(): Record<string, string | undefined> {
  const deno = (globalThis as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno;
  const get = (key: string) => deno?.env?.get?.(key);
  return {
    AI_API_BASE_URL: get("AI_API_BASE_URL"),
    AI_API_KEY: get("AI_API_KEY"),
    ANTHROPIC_API_KEY: get("ANTHROPIC_API_KEY"),
    AI_API_PROTOCOL: get("AI_API_PROTOCOL"),
    AI_STRUCTURED_MODE: get("AI_STRUCTURED_MODE"),
  };
}
```

Xoá hàm `readEnv` cũ (không còn dùng) và phần `extractTextContent` trùng lặp trong file này.

- [ ] **Step 4: Chạy test để thấy PASS**

Run: `npm run test:edge`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/anthropic.ts supabase/functions/_shared/tests/anthropic.test.ts
git commit -m "feat(ai): dung client da nha cung cap va lay JSON bang prompt"
```

---

### Task 3: Schema enrichment-v2

**Files:**
- Modify: `supabase/functions/_shared/ai/enrich.ts`
- Test: `supabase/functions/_shared/tests/enrich.test.ts`

- [ ] **Step 1: Viết test thất bại**

Sửa `supabase/functions/_shared/tests/enrich.test.ts` trước: 3 nhóm mới là **bắt buộc** trong output v2 nên 2 case cũ phải bổ sung field, nếu không chúng sẽ fail.

Trong case *"accepts features and verifiable error suggestions"*, thêm vào object truyền vào `validateEnrichmentOutput`:

```ts
      unnatural: [{ quote: "a big problem", issue: "vague", suggestion: "a pressing threat", severity: "minor" }],
      vocabulary_plan: { topic: "Education", words: [{ word: "curriculum", meaning: "m", example: "e", why: "w" }] },
      band_plan: { current_band: 6, target_band: 7.5, steps: [{ title: "t", detail: "d", criterion: "lexical_resource", expected_gain: "+0.5" }] },
```

Rồi bổ sung describe mới vào cùng file:

```ts
describe("enrichment v2 contract", () => {
  it("accepts the three new groups", () => {
    const output = validateEnrichmentOutput(base);
    assert.equal(output.unnatural.length, 1);
    assert.equal(output.vocabulary_plan.words[0].word, "curriculum");
    assert.equal(output.band_plan.steps.length, 1);
  });

  it("rejects an unknown severity", () => {
    assert.throws(
      () => validateEnrichmentOutput({ ...base, unnatural: [{ ...base.unnatural[0], severity: "huge" }] }),
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_enrichment",
    );
  });

  it("rejects a band plan without steps", () => {
    assert.throws(
      () => validateEnrichmentOutput({ ...base, band_plan: { current_band: 6, target_band: 7, steps: "none" } }),
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_enrichment",
    );
  });

  it("rejects a missing vocabulary plan", () => {
    assert.throws(
      () => validateEnrichmentOutput({ ...base, vocabulary_plan: undefined }),
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_enrichment",
    );
  });

  it("bumps the schema version", () => {
    assert.equal(ENRICHMENT_SCHEMA_VERSION, "enrichment-v2");
  });
});
```

Trong đó `base` là object hợp lệ đặt trước describe:

```ts
const base = {
  structure: { paragraphs: [] },
  lexical: { examples: [] },
  grammar: { examples: [] },
  errors: [],
  unnatural: [{ quote: "q", issue: "i", suggestion: "s", severity: "major" }],
  vocabulary_plan: { topic: "Education", words: [{ word: "curriculum", meaning: "m", example: "e", why: "w" }] },
  band_plan: { current_band: 6, target_band: 7.5, steps: [{ title: "t", detail: "d", criterion: "lexical_resource", expected_gain: "+0.5" }] },
};
```

Cập nhật import dòng 4 thành:

```ts
import { AiContractError, ENRICHMENT_SCHEMA_VERSION, validateEnrichmentOutput } from "../ai/enrich.ts";
```

- [ ] **Step 2: Chạy test để thấy thất bại**

Run: `npm run test:edge`

Expected: FAIL — `unnatural` chưa có trong kiểu và validate.

- [ ] **Step 3: Sửa `ai/enrich.ts`**

Thêm vào interface:

```ts
export interface EnrichmentUnnaturalPoint {
  quote: string;
  issue: string;
  suggestion: string;
  severity: "minor" | "major";
}

export interface EnrichmentVocabularyWord {
  word: string;
  meaning: string;
  example: string;
  why: string;
}

export interface EnrichmentBandStep {
  title: string;
  detail: string;
  criterion: string;
  expected_gain: string;
}
```

Sửa `EnrichmentOutput`:

```ts
export interface EnrichmentOutput {
  structure: { paragraphs: Array<{ index: number; role: string; summary: string; link_to_next: string }> };
  lexical: { examples: Array<{ term: string; meaning: string; evidence: string; correction: string }> };
  grammar: { examples: Array<{ error: string; correction: string }> };
  errors: Array<{
    fingerprint: string;
    criterion: string;
    category: string;
    quote: string;
    correction: string;
    explanation: string;
    skill_tags: string[];
  }>;
  unnatural: EnrichmentUnnaturalPoint[];
  vocabulary_plan: { topic: string; words: EnrichmentVocabularyWord[] };
  band_plan: { current_band: number | null; target_band: number | null; steps: EnrichmentBandStep[] };
}
```

Đổi `ENRICHMENT_SCHEMA_VERSION` thành `"enrichment-v2"`.

Thêm vào `ENRICHMENT_JSON_SCHEMA.properties`:

```ts
    unnatural: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["quote", "issue", "suggestion", "severity"],
        properties: {
          quote: { type: "string" },
          issue: { type: "string" },
          suggestion: { type: "string" },
          severity: { type: "string", enum: ["minor", "major"] },
        },
      },
    },
    vocabulary_plan: {
      type: "object",
      additionalProperties: false,
      required: ["topic", "words"],
      properties: {
        topic: { type: "string" },
        words: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["word", "meaning", "example", "why"],
            properties: {
              word: { type: "string" },
              meaning: { type: "string" },
              example: { type: "string" },
              why: { type: "string" },
            },
          },
        },
      },
    },
    band_plan: {
      type: "object",
      additionalProperties: false,
      required: ["current_band", "target_band", "steps"],
      properties: {
        current_band: { type: ["number", "null"] },
        target_band: { type: ["number", "null"] },
        steps: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "detail", "criterion", "expected_gain"],
            properties: {
              title: { type: "string" },
              detail: { type: "string" },
              criterion: { type: "string" },
              expected_gain: { type: "string" },
            },
          },
        },
      },
    },
```

Cập nhật `required` của schema: `["structure", "lexical", "grammar", "errors", "unnatural", "vocabulary_plan", "band_plan"]`.

Thêm validate vào `validateEnrichmentOutput` (trước dòng `return output as unknown as EnrichmentOutput;`):

```ts
  const unnatural = output.unnatural;
  const vocabularyPlan = output.vocabulary_plan as Record<string, unknown> | undefined;
  const bandPlan = output.band_plan as Record<string, unknown> | undefined;
  if (!Array.isArray(unnatural) || !vocabularyPlan || !bandPlan) invalid();
  if (typeof vocabularyPlan.topic !== "string" || !Array.isArray(vocabularyPlan.words)) invalid();
  for (const word of vocabularyPlan.words) {
    if (
      !word ||
      typeof word !== "object" ||
      typeof (word as { word?: unknown }).word !== "string" ||
      typeof (word as { meaning?: unknown }).meaning !== "string" ||
      typeof (word as { example?: unknown }).example !== "string" ||
      typeof (word as { why?: unknown }).why !== "string"
    ) invalid();
  }
  for (const point of unnatural) {
    if (
      !point ||
      typeof point !== "object" ||
      typeof (point as { quote?: unknown }).quote !== "string" ||
      typeof (point as { issue?: unknown }).issue !== "string" ||
      typeof (point as { suggestion?: unknown }).suggestion !== "string" ||
      !["minor", "major"].includes((point as { severity?: unknown }).severity as string)
    ) invalid();
  }
  if (!Array.isArray(bandPlan.steps)) invalid();
  for (const step of bandPlan.steps) {
    if (
      !step ||
      typeof step !== "object" ||
      typeof (step as { title?: unknown }).title !== "string" ||
      typeof (step as { detail?: unknown }).detail !== "string" ||
      typeof (step as { criterion?: unknown }).criterion !== "string" ||
      typeof (step as { expected_gain?: unknown }).expected_gain !== "string"
    ) invalid();
  }
  const currentBand = bandPlan.current_band;
  const targetBand = bandPlan.target_band;
  if (currentBand !== null && typeof currentBand !== "number") invalid();
  if (targetBand !== null && typeof targetBand !== "number") invalid();
```

- [ ] **Step 4: Chạy test để thấy PASS**

Run: `npm run test:edge`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/ai/enrich.ts supabase/functions/_shared/tests/enrich.test.ts
git commit -m "feat(ai): enrichment-v2 them diem chua hop ly, tu vuc va lo trinh len band"
```

---

### Task 4: Prompt + pipeline

**Files:**
- Modify: `supabase/functions/_shared/prompts.ts`
- Modify: `supabase/functions/_shared/ai/pipeline.ts`

- [ ] **Step 1: Viết test thất bại**

Tạo `supabase/functions/_shared/tests/prompts.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildEnrichmentPrompt } from "../prompts.ts";

describe("enrichment prompt", () => {
  it("asks for the three new groups and passes the target band", () => {
    const prompt = buildEnrichmentPrompt({
      essayText: "text",
      gradingFeedback: { status: "ok" },
      feedbackLocale: "vi",
      taskType: "task2",
      targetBand: 7.5,
    });
    assert.match(prompt.system, /illogical|natural/i);
    assert.match(prompt.system, /vocabulary/i);
    assert.match(prompt.system, /target band/i);
    const payload = JSON.stringify(prompt.messages);
    assert.match(payload, /7.5/);
    assert.match(payload, /task2/);
  });
});
```

- [ ] **Step 2: Chạy test để thấy thất bại**

Run: `npm run test:edge`

Expected: FAIL — `buildEnrichmentPrompt` chưa nhận `taskType`/`targetBand` và system prompt chưa có yêu cầu mới.

- [ ] **Step 3: Sửa `prompts.ts`**

Đổi interface và hàm:

```ts
export interface EnrichmentPromptInput {
  essayText: string;
  gradingFeedback: unknown;
  feedbackLocale: string;
  taskType: string;
  targetBand: number | null;
}

export function buildEnrichmentPrompt(input: EnrichmentPromptInput): { system: string; messages: unknown[] } {
  const system = [
    "You extract learning features from an IELTS Writing snapshot and existing grader feedback.",
    UNTRUSTED_DATA_RULE,
    "Do not rescore the essay and do not change criterion scores.",
    "Return only JSON matching the supplied schema. Error suggestions must use exact quotes from the essay snapshot.",
    "Report statements that are illogical, unnatural, repetitive or unsupported by the task under 'unnatural'; quote the exact source text.",
    "Under 'vocabulary_plan' suggest words the learner should study for this topic and target band, not words already used in the essay.",
    "Under 'band_plan' give concrete steps from the current band to the target band; each step names one IELTS criterion and the expected gain.",
    `The essay is a ${input.taskType} response and the target band is ${input.targetBand ?? "unspecified"}.`,
    `Write explanations in ${input.feedbackLocale === "en" ? "English" : "Vietnamese"} while preserving quoted English text.`,
  ].join("\n");
  const snapshot = JSON.stringify({
    task_type: input.taskType,
    target_band: input.targetBand,
    essay: input.essayText,
    grading_feedback: input.gradingFeedback,
  });
  return {
    system,
    messages: [{ role: "user", content: [{ type: "text", text: `UNTRUSTED_SNAPSHOT_JSON\n${snapshot}` }] }],
  };
}
```

- [ ] **Step 4: Sửa `ai/pipeline.ts`**

Trong `runEnrichment`, đổi điều kiện bỏ qua để so version:

```ts
  const existing = await service
    .from("essay_features")
    .select("revision_id, schema_version")
    .eq("revision_id", job.revision_id)
    .maybeSingle();
  if (existing.error) throw databaseError("load the essay features");
  if (existing.data && existing.data.schema_version === ENRICHMENT_SCHEMA_VERSION) return;
```

Truyền thêm param vào prompt:

```ts
  const prompt = buildEnrichmentPrompt({
    essayText: revision.essay_text,
    gradingFeedback: grading.data.feedback,
    feedbackLocale: revision.feedback_locale,
    taskType: revision.task_type,
    targetBand: revision.target_band,
  });
```

Ghi 3 cột mới khi upsert:

```ts
  const featureWrite = await service.from("essay_features").upsert({
    revision_id: job.revision_id,
    model,
    structure: structured.value.structure,
    lexical: structured.value.lexical,
    grammar: structured.value.grammar,
    unnatural: structured.value.unnatural,
    vocabulary_plan: structured.value.vocabulary_plan,
    band_plan: structured.value.band_plan,
    schema_version: ENRICHMENT_SCHEMA_VERSION,
  }, { onConflict: "revision_id" });
```

Nới token cho job enrich (output lớn hơn):

```ts
    maxTokens: 6_000,
```

- [ ] **Step 5: Chạy test để thấy PASS**

Run: `npm run test:edge`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/_shared/prompts.ts supabase/functions/_shared/ai/pipeline.ts supabase/functions/_shared/tests/prompts.test.ts
git commit -m "feat(ai): prompt enrich nhan task type + target band va ghi 3 nhom moi"
```

---

### Task 5: Migration 016

**Files:**
- Create: `supabase/migrations/016_feedback_coaching.sql`

- [ ] **Step 1: Viết file migration**

```sql
-- 016_feedback_coaching.sql
-- Module: phản hồi sâu hơn band score
--
-- Thêm 3 nhóm phản hồi do pipeline `enrich` sinh:
--   unnatural       — câu viết chưa hợp lý / lạp ý / thiếu căn cứ
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
```

- [ ] **Step 2: Áp dụng migration**

Run: `npm run db:migrate`

Expected: `OK  alter table public.essay_features add column if not exists unnatural jsonb` (và 2 câu còn lại).

- [ ] **Step 3: Xác nhận cột đã tồn tại**

Run:

```bash
node --env-file-if-exists=.env.local -e "const u=process.env.VITE_SUPABASE_URL,k=process.env.SUPABASE_SERVICE_ROLE_KEY;const r=await fetch(u+'/rest/v1/essay_features?select=unnatural,vocabulary_plan,band_plan&limit=1',{headers:{apikey:k,Authorization:'Bearer '+k}});console.log(r.status);"
```

Expected: `200`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/016_feedback_coaching.sql
git commit -m "feat(db): them 3 cot jsonb cho phan hoi sau hon band score"
```

---

### Task 6: Kiểu + parser phía frontend

**Files:**
- Modify: `src/lib/aiLogic.ts`
- Test: `tests/ai.test.ts`

- [ ] **Step 1: Viết test thất bại**

Bổ sung vào `tests/ai.test.ts`:

```ts
import {
  errorLogsFromRows,
  featuresFromRow,
} from '../src/lib/aiLogic.ts'

test('essay features are parsed defensively', () => {
  const features = featuresFromRow({
    structure: { paragraphs: [{ index: 0, role: 'intro', summary: 's', link_to_next: 'n' }] },
    lexical: { examples: [{ term: 'a', meaning: 'b', evidence: 'c', correction: 'd' }] },
    grammar: { examples: [{ error: 'e', correction: 'f' }] },
    unnatural: [{ quote: 'q', issue: 'i', suggestion: 's', severity: 'major' }],
    vocabulary_plan: { topic: 'Education', words: [{ word: 'w', meaning: 'm', example: 'e', why: 'y' }] },
    band_plan: { current_band: 6, target_band: 7.5, steps: [{ title: 't', detail: 'd', criterion: 'lexical_resource', expected_gain: '+0.5' }] },
  })
  assert.equal(features?.structure.length, 1)
  assert.equal(features?.structure[0].linkToNext, 'n')
  assert.equal(features?.lexical.length, 1)
  assert.equal(features?.grammar.length, 1)
  assert.equal(features?.unnatural[0].severity, 'major')
  assert.equal(features?.vocabularyPlan.words[0].word, 'w')
  assert.equal(features?.bandPlan.targetBand, 7.5)
  assert.equal(features?.bandPlan.steps[0].expectedGain, '+0.5')
})

test('missing or broken feature fields never throw', () => {
  assert.equal(featuresFromRow(null), null)
  const empty = featuresFromRow({})
  assert.deepEqual(empty?.structure, [])
  assert.deepEqual(empty?.unnatural, [])
  assert.equal(empty?.bandPlan.currentBand, null)
  const broken = featuresFromRow({ unnatural: 'nope', band_plan: { steps: 'nope' } })
  assert.deepEqual(broken?.unnatural, [])
  assert.deepEqual(broken?.bandPlan.steps, [])
})

test('error logs drop invalid rows and keep the valid ones', () => {
  const rows = errorLogsFromRows([
    { id: '1', criterion: 'lexical_resource', category: 'word choice', quote: 'q', correction: 'c', explanation: 'e', skill_tags: ['t'] },
    { id: '2', quote: 'missing fields' },
    null,
  ])
  assert.equal(rows.length, 1)
  assert.equal(rows[0].skillTags[0], 't')
  assert.deepEqual(errorLogsFromRows(null), [])
})
```

- [ ] **Step 2: Chạy test để thấy thất bại**

Run: `npm test`

Expected: FAIL — `featuresFromRow` chưa tồn tại.

- [ ] **Step 3: Viết implementation**

Thêm vào cuối `src/lib/aiLogic.ts`:

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

export type ErrorLogEntry = {
  id: string
  criterion: string
  category: string
  quote: string
  correction: string
  explanation: string
  skillTags: string[]
}

const EMPTY_FEATURES: EssayFeatures = {
  structure: [],
  lexical: [],
  grammar: [],
  unnatural: [],
  vocabularyPlan: { topic: '', words: [] },
  bandPlan: { currentBand: null, targetBand: null, steps: [] },
}

/** Đọc hàng `essay_features` thành model hiển thị — field hỏng thì bỏ qua, không throw. */
export function featuresFromRow(row: unknown): EssayFeatures | null {
  if (!row || typeof row !== 'object') return null
  const record = row as Record<string, unknown>
  const structure = (record.structure as Record<string, unknown> | undefined)?.paragraphs
  const lexical = (record.lexical as Record<string, unknown> | undefined)?.examples
  const grammar = (record.grammar as Record<string, unknown> | undefined)?.examples
  const vocabularyPlan = (record.vocabulary_plan as Record<string, unknown> | undefined) ?? {}
  const bandPlan = (record.band_plan as Record<string, unknown> | undefined) ?? {}
  return {
    structure: Array.isArray(structure)
      ? structure.flatMap(item => {
        const entry = item as Record<string, unknown>
        if (typeof entry.role !== 'string' || typeof entry.summary !== 'string') return []
        return [{
          index: typeof entry.index === 'number' ? entry.index : 0,
          role: entry.role,
          summary: entry.summary,
          linkToNext: typeof entry.link_to_next === 'string' ? entry.link_to_next : '',
        }]
      })
      : [],
    lexical: Array.isArray(lexical)
      ? lexical.flatMap(item => {
        const entry = item as Record<string, unknown>
        if (typeof entry.term !== 'string' || typeof entry.correction !== 'string') return []
        return [{
          term: entry.term,
          meaning: typeof entry.meaning === 'string' ? entry.meaning : '',
          evidence: typeof entry.evidence === 'string' ? entry.evidence : '',
          correction: entry.correction,
        }]
      })
      : [],
    grammar: Array.isArray(grammar)
      ? grammar.flatMap(item => {
        const entry = item as Record<string, unknown>
        if (typeof entry.error !== 'string' || typeof entry.correction !== 'string') return []
        return [{ error: entry.error, correction: entry.correction }]
      })
      : [],
    unnatural: Array.isArray(record.unnatural)
      ? record.unnatural.flatMap(item => {
        const entry = item as Record<string, unknown>
        if (typeof entry.quote !== 'string' || typeof entry.issue !== 'string') return []
        const severity = entry.severity === 'minor' ? 'minor' : 'major'
        return [{
          quote: entry.quote,
          issue: entry.issue,
          suggestion: typeof entry.suggestion === 'string' ? entry.suggestion : '',
          severity,
        }]
      })
      : [],
    vocabularyPlan: {
      topic: typeof vocabularyPlan.topic === 'string' ? vocabularyPlan.topic : '',
      words: Array.isArray(vocabularyPlan.words)
        ? vocabularyPlan.words.flatMap(item => {
          const entry = item as Record<string, unknown>
          if (typeof entry.word !== 'string') return []
          return [{
            word: entry.word,
            meaning: typeof entry.meaning === 'string' ? entry.meaning : '',
            example: typeof entry.example === 'string' ? entry.example : '',
            why: typeof entry.why === 'string' ? entry.why : '',
          }]
        })
        : [],
    },
    bandPlan: {
      currentBand: typeof bandPlan.current_band === 'number' ? bandPlan.current_band : null,
      targetBand: typeof bandPlan.target_band === 'number' ? bandPlan.target_band : null,
      steps: Array.isArray(bandPlan.steps)
        ? bandPlan.steps.flatMap(item => {
          const entry = item as Record<string, unknown>
          if (typeof entry.title !== 'string' || typeof entry.detail !== 'string') return []
          return [{
            title: entry.title,
            detail: entry.detail,
            criterion: typeof entry.criterion === 'string' ? entry.criterion : '',
            expectedGain: typeof entry.expected_gain === 'string' ? entry.expected_gain : '',
          }]
        })
        : [],
    },
  }
}

/** Đọc các hàng `error_logs` — bỏ qua hàng thiếu field bắt buộc. */
export function errorLogsFromRows(rows: unknown): ErrorLogEntry[] {
  if (!Array.isArray(rows)) return []
  return rows.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const entry = item as Record<string, unknown>
    if (typeof entry.quote !== 'string' || typeof entry.correction !== 'string') return []
    return [{
      id: typeof entry.id === 'string' ? entry.id : '',
      criterion: typeof entry.criterion === 'string' ? entry.criterion : '',
      category: typeof entry.category === 'string' ? entry.category : '',
      quote: entry.quote,
      correction: entry.correction,
      explanation: typeof entry.explanation === 'string' ? entry.explanation : '',
      skillTags: stringArray(entry.skill_tags),
    }]
  })
}
```

- [ ] **Step 4: Chạy test để thấy PASS**

Run: `npm test`

Expected: PASS — 31 test.

- [ ] **Step 5: Commit**

```bash
git add src/lib/aiLogic.ts tests/ai.test.ts
git commit -m "feat(ai): kieu va parser cho essay features va error logs"
```

---

### Task 7: Repository đọc features + error logs

**Files:**
- Create: `src/lib/featuresRepository.ts`
- Modify: `src/lib/ai.ts`

- [ ] **Step 1: Tạo repository**

```ts
import { supabase } from './supabase'
import { errorLogsFromRows, featuresFromRow, type ErrorLogEntry, type EssayFeatures } from './aiLogic.ts'

/** Revision mới nhất của một bài viết — dùng chung với `fetchLatestGrading`. */
export async function fetchLatestRevisionId(essayId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('essay_revisions')
    .select('id')
    .eq('essay_id', essayId)
    .order('revision_no', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return (data as { id: string }).id
}

/** Phản hồi sâu (cấu trúc, từ vựng, điểm chưa hợp lý, lộ trình) của một revision. */
export async function fetchEssayFeatures(revisionId: string): Promise<EssayFeatures | null> {
  const { data, error } = await supabase.from('essay_features').select('*').eq('revision_id', revisionId).maybeSingle()
  if (error || !data) return null
  return featuresFromRow(data)
}

/** Lỗi AI ghi nhận cho một revision. */
export async function fetchErrorLogs(revisionId: string): Promise<ErrorLogEntry[]> {
  const { data, error } = await supabase.from('error_logs').select('*').eq('revision_id', revisionId)
  if (error || !data) return []
  return errorLogsFromRows(data)
}

/** Toàn bộ lỗi của người dùng (RLS lọc theo `auth.uid()`) — cho Sổ lỗi sai. */
export async function fetchAllErrorLogs(limit = 200): Promise<ErrorLogEntry[]> {
  const { data, error } = await supabase.from('error_logs').select('*').order('created_at', { ascending: false }).limit(limit)
  if (error || !data) return []
  return errorLogsFromRows(data)
}

/**
 * Chờ pipeline `enrich` xong (chạy sau `grade` vài giây).
 * Trả về `features: null` nếu hết giờ — không phải lỗi.
 */
export async function pollEssayFeatures(
  revisionId: string,
  timeoutMs = 45_000,
  intervalMs = 3_000,
): Promise<{ features: EssayFeatures | null; errors: ErrorLogEntry[] }> {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const features = await fetchEssayFeatures(revisionId)
    if (features) return { features, errors: await fetchErrorLogs(revisionId) }
    if (Date.now() >= deadline) return { features: null, errors: [] }
    await new Promise<void>(resolve => window.setTimeout(resolve, intervalMs))
  }
}
```

- [ ] **Step 2: Dùng chung `fetchLatestRevisionId` trong `ai.ts`**

Trong `src/lib/ai.ts`, sửa `fetchLatestGrading`:

```ts
import { fetchLatestRevisionId } from './featuresRepository.ts'

/** Lấy kết quả chấm gần nhất của một bài (nếu đã có). */
export async function fetchLatestGrading(essayId: string, task: string): Promise<GradingView | null> {
  const revisionId = await fetchLatestRevisionId(essayId)
  if (!revisionId) return null
  const row = await readGrading(revisionId)
  return gradingViewFromRow(row, task)
}
```

- [ ] **Step 3: Kiểm tra kiểu**

Run: `npx tsc --noEmit`

Expected: không có lỗi.

- [ ] **Step 4: Commit**

```bash
git add src/lib/featuresRepository.ts src/lib/ai.ts
git commit -m "feat(ai): repository doc essay features va error logs"
```

---

### Task 8: Hộp thoại thêm thẻ dùng chung

**Files:**
- Create: `src/components/VocabularyCardDialog.tsx`
- Modify: `src/pages/Learning.tsx`

- [ ] **Step 1: Tạo component**

```tsx
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { useCopy } from '../i18n'
import type { Card } from '../lib/store'

export type NewCardValues = { term: string; meaning: string; example: string; kind: Card['kind'] }

/** Hộp thoại thêm thẻ từ vựng / cấu trúc / lỗi — dùng chung cho Sổ từ vựng và kết quả chấm. */
export function VocabularyCardDialog({
  open,
  onClose,
  defaultKind = 'vocabulary',
  onSave,
}: {
  open: boolean
  onClose: () => void
  defaultKind?: Card['kind']
  onSave: (values: NewCardValues) => Promise<void> | void
}) {
  const { c } = useCopy()
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    void Promise.resolve(onSave({
      term: String(data.get('term')).trim(),
      meaning: String(data.get('meaning')).trim(),
      example: String(data.get('example')).trim(),
      kind: (data.get('kind') as Card['kind']) ?? defaultKind,
    })).then(() => { dialog.current?.close(); form.reset() }).catch(() => {}).finally(() => setBusy(false))
  }

  return <dialog ref={dialog} className="modal" onClose={onClose}><form onSubmit={submit}>
    <div className="section-heading"><h2>{c('Thêm điều muốn nhớ', 'Something to remember')}</h2><button type="button" className="icon-button" onClick={onClose} aria-label={c('Đóng', 'Close')}><X size={20} /></button></div>
    <label>{c('Loại thẻ', 'Card type')}<select name="kind" defaultValue={defaultKind}><option value="vocabulary">{c('Từ / cụm từ', 'Word / phrase')}</option><option value="structure">{c('Cấu trúc câu', 'Sentence structure')}</option><option value="error">{c('Lỗi cần nhớ', 'Error to remember')}</option></select></label>
    <label>{c('Từ / cấu trúc', 'Word / structure')}<input name="term" required maxLength={200} pattern=".*\S.*" placeholder="play a pivotal role" autoFocus /></label>
    <label>{c('Ý nghĩa / giải thích', 'Meaning / explanation')}<textarea name="meaning" required maxLength={1000} rows={3} /></label>
    <label>{c('Câu ví dụ', 'Example sentence')}<textarea name="example" maxLength={2000} rows={3} /></label>
    <button className="button primary full" disabled={busy}><Plus size={17} />{busy ? c('Đang lưu…', 'Saving…') : c('Lưu vào sổ', 'Save to collection')}</button>
  </form></dialog>
}
```

- [ ] **Step 2: Dùng lại trong trang Sổ từ vựng**

Trong `src/pages/Learning.tsx`, xoá `<dialog>` inline khỏi `Vocabulary` và thay bằng:

```tsx
<VocabularyCardDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={async values => { await addCard(values); setDialogOpen(false) }} />
```

Thêm state `const [dialogOpen, setDialogOpen] = useState(false)` và đổi nút mở dialog thành `onClick={() => setDialogOpen(true)}`.

Thêm import: `import { VocabularyCardDialog } from '../components/VocabularyCardDialog'`.

- [ ] **Step 3: Kiểm tra kiểu**

Run: `npx tsc --noEmit`

Expected: không có lỗi.

- [ ] **Step 4: Commit**

```bash
git add src/components/VocabularyCardDialog.tsx src/pages/Learning.tsx
git commit -m "refactor(vocab): tach hop thoai them the dung chung"
```

---

### Task 9: 5 khối phản hồi trong GradingResult

**Files:**
- Modify: `src/components/GradingResult.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Viết component mới**

Thêm props và các khối vào `src/components/GradingResult.tsx`:

```tsx
import { BookMarked, CheckCircle2, CircleAlert, Lightbulb, ListChecks, Route, Sparkles, Target, TriangleAlert } from 'lucide-react'
import { CRITERION_LABELS, CRITERION_SHORT, criteriaForTask, type CriterionName, type ErrorLogEntry, type EssayFeatures, type GradingView, type TaskCheck } from '../lib/aiLogic.ts'
import { VocabularyCardDialog, type NewCardValues } from './VocabularyCardDialog'

type CardDraft = Pick<NewCardValues, 'term' | 'meaning' | 'example' | 'kind'>

/** Nhãn tiêu chí; trả về chính chuỗi gốc nếu không phải tiêu chí đã biết. */
function criterionLabel(value: string): string {
  return value in CRITERION_SHORT ? CRITERION_SHORT[value as CriterionName] : value
}

export function GradingResult({
  view,
  task,
  features,
  errors,
  onAddCard,
}: {
  view: GradingView
  task: string
  features?: EssayFeatures | null
  errors?: ErrorLogEntry[]
  onAddCard?: (card: CardDraft) => Promise<void> | void
}) {
```

Biến phụ trợ và dữ liệu dùng chung:

```tsx
  const [manualOpen, setManualOpen] = useState(false)
  const [savedNotice, setSavedNotice] = useState('')
  const errorList = errors && errors.length
    ? errors
    : (features?.grammar ?? []).map(item => ({
      id: `grammar-${item.error}`,
      criterion: 'grammatical_range',
      category: 'grammar',
      quote: item.error,
      correction: item.correction,
      explanation: '',
      skillTags: [] as string[],
    }))
  const unnatural = features?.unnatural ?? []
  const bandSteps = features?.bandPlan.steps ?? []
  const targetBand = features?.bandPlan.targetBand ?? null
  const lexical = features?.lexical ?? []
  const words = features?.vocabularyPlan.words ?? []
  const paragraphs = features?.structure ?? []

  async function save(card: CardDraft) {
    await onAddCard?.(card)
    setSavedNotice(card.term)
  }
```

Chèn 5 khối ngay trước khối *CHI TIẾT TỪNG TIÊU CHÍ*:

```tsx
    {errorList.length > 0 && <details className="panel grading-panel feedback-block" open>
      <summary><span className="eyebrow"><TriangleAlert size={14} />{c('LỖI SAI CẦN SỬA', 'MISTAKES TO FIX')}</span><strong>{errorList.length}</strong></summary>
      <ul className="grading-list">{errorList.map((item, index) => <li key={`${item.id}-${index}`} className="error-item">
        <span className="error-quote">{item.quote}</span>
        <span className="error-correction">{item.correction}</span>
        {item.explanation && <em>{item.explanation}</em>}
        <span className="error-meta">{item.category}{item.criterion ? ` · ${criterionLabel(item.criterion)}` : ''}</span>
        {onAddCard && <button className="button outline small" onClick={() => void save({ term: item.quote, meaning: item.correction, example: item.explanation, kind: 'error' })}>{c('Lưu vào sổ lỗi sai', 'Save to error log')}</button>}
      </li>)}</ul>
    </details>}

    {bandSteps.length > 0 && <details className="panel grading-panel feedback-block" open>
      <summary><span className="eyebrow"><Route size={14} />{targetBand ? c(`LỘ TRÌNH LÊN BAND ${targetBand.toFixed(1)}`, `PLAN FOR BAND ${targetBand.toFixed(1)}`) : c('LỘ TRÌNH LÊN BAND', 'BAND IMPROVEMENT PLAN')}</span></summary>
      <ol className="grading-list">{bandSteps.map((step, index) => <li key={`${step.title}-${index}`} className="band-step">
        <span className="grading-index">{index + 1}</span>
        <span><strong>{step.title}</strong><em>{step.detail}</em>{step.expectedGain && <span className="error-meta">{step.expectedGain}</span>}</span>
      </li>)}</ol>
    </details>}

    {unnatural.length > 0 && <details className="panel grading-panel feedback-block">
      <summary><span className="eyebrow"><CircleAlert size={14} />{c('ĐIỂM CHƯA HỢP LÝ', 'UNNATURAL OR UNSUPPORTED')}</span><strong>{unnatural.length}</strong></summary>
      <ul className="grading-list">{unnatural.map((item, index) => <li key={`${item.quote}-${index}`} className="error-item">
        <span className="error-quote">{item.quote}</span>
        <em>{item.issue}</em>
        {item.suggestion && <span className="error-correction">{item.suggestion}</span>}
        <span className={`badge ${item.severity === 'major' ? 'warm' : 'neutral'}`}>{item.severity === 'major' ? c('Cần sửa', 'Needs fixing') : c('Nhỏ', 'Minor')}</span>
      </li>)}</ul>
    </details>}

    {(lexical.length > 0 || words.length > 0) && <details className="panel grading-panel feedback-block">
      <summary><span className="eyebrow"><BookMarked size={14} />{c('TỪ VỰNG NÂNG CAO', 'VOCABULARY TO LEVEL UP')}</span><strong>{lexical.length + words.length}</strong></summary>
      {lexical.length > 0 && <div className="vocab-suggestions"><span className="eyebrow">{c('NÂNG CẤP TỪ ĐANG DÙNG', 'UPGRADE THE WORDS YOU USED')}</span>
        <ul className="grading-list">{lexical.map((item, index) => <li key={`${item.term}-${index}`} className="vocab-item">
          <span><strong>{item.term}</strong>{item.meaning && <em>{item.meaning}</em>}{item.evidence && <span className="error-quote">{item.evidence}</span>}</span>
          <span className="error-correction">{item.correction}</span>
          {onAddCard && <button className="button outline small" onClick={() => void save({ term: item.term, meaning: item.correction, example: item.evidence, kind: 'vocabulary' })}>{c('Lưu vào sổ từ vựng', 'Save to word list')}</button>}
        </li>)}</ul>
      </div>}
      {words.length > 0 && <div className="vocab-suggestions"><span className="eyebrow">{features?.vocabularyPlan.topic ? c(`TỪ VỰNG NÊN HỌC — ${features.vocabularyPlan.topic}`, `WORDS TO STUDY — ${features.vocabularyPlan.topic}`) : c('TỪ VỰNG NÊN HỌC', 'WORDS TO STUDY')}</span>
        <ul className="grading-list">{words.map((item, index) => <li key={`${item.word}-${index}`} className="vocab-item">
          <span><strong>{item.word}</strong>{item.meaning && <em>{item.meaning}</em>}{item.example && <span className="error-quote">{item.example}</span>}{item.why && <em>{item.why}</em>}</span>
          {onAddCard && <button className="button outline small" onClick={() => void save({ term: item.word, meaning: item.meaning, example: item.example, kind: 'vocabulary' })}>{c('Lưu vào sổ từ vựng', 'Save to word list')}</button>}
        </li>)}</ul>
      </div>}
      {onAddCard && <button className="button outline full" onClick={() => setManualOpen(true)}><Lightbulb size={16} />{c('+ Thêm từ của tôi', '+ Add my own word')}</button>}
      {savedNotice && <p className="text-teal" role="status">{c(`Đã lưu "${savedNotice}" vào sổ từ vựng.`, `Saved "${savedNotice}" to your word list.`)}</p>}
      <VocabularyCardDialog open={manualOpen} onClose={() => setManualOpen(false)} onSave={async values => { await onAddCard?.(values); setManualOpen(false) }} />
    </details>}

    {paragraphs.length > 0 && <details className="panel grading-panel feedback-block">
      <summary><span className="eyebrow"><ListChecks size={14} />{c('CẤU TRÚC BÀI', 'ESSAY STRUCTURE')}</span><strong>{paragraphs.length}</strong></summary>
      <ul className="grading-list">{paragraphs.map((paragraph, index) => <li key={`${paragraph.index}-${index}`} className="structure-item">
        <span className="grading-index">{paragraph.index + 1}</span>
        <span><strong>{paragraph.role}</strong><em>{paragraph.summary}</em>{paragraph.linkToNext && <em className="structure-link">{paragraph.linkToNext}</em>}</span>
      </li>)}</ul>
    </details>}
```

- [ ] **Step 2: Thêm style**

Thêm vào `src/styles.css` (ngay sau khối `.grading-panel`):

```css
.feedback-block { padding: 0; margin-top: 18px; }
.feedback-block > summary { display: flex; align-items: center; gap: 12px; padding: 18px 22px; cursor: pointer; list-style: none; }
.feedback-block > summary::-webkit-details-marker { display: none; }
.feedback-block > summary .eyebrow { display: inline-flex; align-items: center; gap: 7px; }
.feedback-block > summary strong { margin-left: auto; color: var(--text-subtle); font-size: 13px; }
.feedback-block > .grading-list { padding: 0 22px 20px; margin: 0; }
.error-item, .vocab-item, .band-step, .structure-item { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.error-item:last-child, .vocab-item:last-child, .band-step:last-child, .structure-item:last-child { border-bottom: none; }
.error-quote { color: var(--text-muted); text-decoration: line-through; font-size: 13.5px; }
.error-correction { color: var(--brand-ink); font-weight: 600; font-size: 14px; }
.error-item em, .vocab-item em, .band-step em, .structure-item em { color: var(--text-muted); font-size: 13px; font-style: normal; }
.error-meta { color: var(--text-subtle); font-size: 11.5px; }
.vocab-suggestions { padding: 0 22px 14px; }
.vocab-suggestions + .vocab-suggestions { border-top: 1px solid var(--border); padding-top: 14px; }
.button.small { min-height: 32px; padding: 6px 12px; font-size: 12px; }
.structure-link { color: var(--brand-ink); }
```

- [ ] **Step 3: Kiểm tra kiểu**

Run: `npx tsc --noEmit`

Expected: không có lỗi.

- [ ] **Step 4: Commit**

```bash
git add src/components/GradingResult.tsx src/styles.css
git commit -m "feat(grading): them 5 khoi phan hoi sau hon trong ket qua cham"
```

---

### Task 10: Không gian viết chờ và hiện phản hồi sâu

**Files:**
- Modify: `src/pages/Writing.tsx`

- [ ] **Step 1: Nối dữ liệu**

Trong `src/pages/Writing.tsx`:

```ts
import { pollEssayFeatures } from '../lib/featuresRepository'
import type { ErrorLogEntry, EssayFeatures } from '../lib/aiLogic.ts'
```

Thêm state:

```ts
  const [features, setFeatures] = useState<EssayFeatures | null>(null)
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([])
  const [reviewing, setReviewing] = useState(false)
```

Trong `grade()`, ngay sau khi `setGrading(result.value.view)`:

```ts
    setReviewing(true)
    void pollEssayFeatures(submitted.value.revisionId).then(payload => {
      setFeatures(payload.features)
      setErrorLogs(payload.errors)
      setReviewing(false)
    })
```

Render `<GradingResult>` với props mới (tìm trong JSX):

```tsx
{grading && <GradingResult view={grading} task={draft.task} features={features} errors={errorLogs} onAddCard={addCard} />}
```

`addCard` lấy từ `useStore()` — thêm vào destructuring: `const { saveDraft, state, ready, signedIn, remoteRef, addCard } = useStore()`.

Thêm dòng trạng thái chờ ngay trên khối kết quả:

```tsx
{reviewing && <p className="helper-text" role="status"><Sparkles size={14} />{c('Đang rà soát lỗi và từ vựng…', 'Reviewing mistakes and vocabulary…')}</p>}
```

Và khi không còn features sau khi chờ xong:

```tsx
{grading && !features && !reviewing && <p className="helper-text">{c('Chưa có dữ liệu rà soát thêm cho bài này.', 'No extra review data is available for this essay yet.')}</p>}
```

- [ ] **Step 2: Kiểm tra kiểu**

Run: `npx tsc --noEmit`

Expected: không có lỗi.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Writing.tsx
git commit -m "feat(writing): cho vai phan hoi sau hon sau khi cham bai"
```

---

### Task 11: Trang chi tiết bài + fixture demo

**Files:**
- Create: `src/data/sampleFeatures.ts`
- Modify: `src/pages/Essays.tsx`

- [ ] **Step 1: Tạo fixture**

Tạo `src/data/sampleFeatures.ts`:

```ts
import type { ErrorLogEntry, EssayFeatures } from '../lib/aiLogic.ts'

/** Dữ liệu minh họa cho trang demo — không phải kết quả chấm thật. */
export const sampleFeatures: EssayFeatures = {
  structure: [
    { index: 0, role: 'Introduction', summary: 'Rewrites the question and states a clear position.', linkToNext: 'Introduces the first body paragraph with a topic sentence.' },
    { index: 1, role: 'Body paragraph 1', summary: 'Explains the first main idea with one example.', linkToNext: 'Links back to the thesis with "this matters because".' },
    { index: 2, role: 'Body paragraph 2', summary: 'Counter-argument is raised but never developed.', linkToNext: 'Ends with a short conclusion.' },
    { index: 3, role: 'Conclusion', summary: 'Restates the position in one sentence.', linkToNext: '' },
  ],
  lexical: [
    { term: 'a big problem', meaning: 'Unclear, informal.', evidence: 'This is a big problem for society.', correction: 'a pressing threat to social cohesion' },
    { term: 'very good', meaning: 'Vague and repetitive.', evidence: 'The policy is very good for families.', correction: 'measurably improves household incomes' },
  ],
  grammar: [
    { error: 'I think the most important thing that peoples should do.', correction: 'The most important step, in my view, is the one governments must take.' },
  ],
  unnatural: [
    { quote: 'In conclusion, everything has both good and bad, like coins.', issue: 'The metaphor is unclear and does not support the argument.', suggestion: 'State plainly which trade-off matters most and why.', severity: 'major' },
    { quote: 'Firstly I want to talk about the first reason.', issue: 'The signposting is repetitive and adds no information.', suggestion: 'Name the reason directly: "Government funding is the first lever".', severity: 'minor' },
  ],
  vocabularyPlan: {
    topic: 'Urban green space',
    words: [
      { word: 'mitigate', meaning: 'To make something less severe.', example: 'Trees mitigate the urban heat island effect.', why: 'Replaces weak verbs like "reduce" with a precise academic one.' },
      { word: 'green space', meaning: 'Parks and other vegetated areas in a city.', example: 'Access to green space improves residents\' health.', why: 'The topic term the examiner expects.' },
      { word: 'trade-off', meaning: 'A balance between two things that cannot both be maximised.', example: 'There is a trade-off between housing supply and green space.', why: 'Names the central tension of the essay.' },
    ],
  },
  bandPlan: {
    currentBand: 6.0,
    targetBand: 7.5,
    steps: [
      { title: 'Develop the counter-argument', detail: 'Give the opposing view a full sentence of explanation plus one concrete example.', criterion: 'task_response', expectedGain: '+0.5 on Task Response' },
      { title: 'Replace vague vocabulary', detail: 'Two words repeat the same vague idea. Use precise academic alternatives shown above.', criterion: 'lexical_resource', expectedGain: '+0.5 on Lexical Resource' },
      { title: 'Fix the article and plural', detail: 'One article error and one subject-verb agreement error remain.', criterion: 'grammatical_range', expectedGain: '+0.5 on Grammar' },
    ],
  },
}

export const sampleErrors: ErrorLogEntry[] = [
  { id: 'sample-1', criterion: 'grammatical_range', category: 'article', quote: 'peoples should do', correction: 'people should take', explanation: 'Use the uncountable plural "people" and a modal verb instead of "do".', skillTags: ['articles', 'modals'] },
  { id: 'sample-2', criterion: 'coherence_ability', category: 'linkers', quote: 'Firstly I want to talk about the first reason.', correction: 'Government funding is the first lever.', explanation: 'Name the point instead of announcing its position.', skillTags: ['cohesion'] },
]
```

- [ ] **Step 2: Nối vào `EssayDetail`**

Trong `src/pages/Essays.tsx`:

```ts
import { fetchEssayFeatures, fetchErrorLogs, fetchLatestRevisionId } from '../lib/featuresRepository'
import { sampleFeatures, sampleErrors } from '../data/sampleFeatures'
import type { ErrorLogEntry, EssayFeatures, GradingView } from '../lib/aiLogic.ts'
```

Trong `EssayDetail`, thêm state và tải song song với grading:

```ts
  const [features, setFeatures] = useState<EssayFeatures | null>(null)
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([])
```

Trong `useEffect` sẵn có, sau khi gọi `fetchLatestGrading`:

```ts
    void fetchLatestRevisionId(ref.essayId).then(async revisionId => {
      if (!revisionId || !active) return
      const [loadedFeatures, loadedErrors] = await Promise.all([fetchEssayFeatures(revisionId), fetchErrorLogs(revisionId)])
      if (!active) return
      setFeatures(loadedFeatures)
      setErrorLogs(loadedErrors)
    })
```

Render:

```tsx
<GradingResult view={grading} task={draft.task} features={features} errors={errorLogs} onAddCard={addCard} />
```

- [ ] **Step 3: Trang demo dùng fixture**

Trong nhánh `id === 'demo'` của `EssayDetail`, thêm sau phần score-summary:

```tsx
<GradingResult view={demoGradingView} task="task2" features={sampleFeatures} errors={sampleErrors} onAddCard={addCard} />
```

Tạo view mẫu trong file (đặt cạnh `EssayBody`):

```ts
const demoGradingView: GradingView = {
  status: 'ok',
  overallDisplay: 6,
  overallRaw: 6.17,
  scores: { task_response: 6, coherence_ability: 6, lexical_resource: 6.5, grammatical_range: 5.5 },
  criteria: {},
  summary: 'A clear position and a readable structure, but the counter-argument is thin and two key words stay vague.',
  strengths: ['The position is stated clearly in the introduction.'],
  priorityActions: ['Develop the counter-argument with one concrete example.'],
  taskChecks: [{ requirement: 'Answer both parts of the question', status: 'partial', note: 'The second part is only implied.' }],
  missingReference: [],
  model: 'sample',
  createdAt: null,
}
```

- [ ] **Step 4: Kiểm tra kiểu**

Run: `npx tsc --noEmit`

Expected: không có lỗi.

- [ ] **Step 5: Commit**

```bash
git add src/data/sampleFeatures.ts src/pages/Essays.tsx
git commit -m "feat(essays): trang chi tiet + demo hien phan hoi sau hon"
```

---

### Task 12: Sổ lỗi sai đọc error_logs

**Files:**
- Modify: `src/pages/Learning.tsx`

- [ ] **Step 1: Sửa component `Errors`**

Thay toàn bộ thân `Errors`:

```tsx
export function Errors() {
  const { c } = useCopy()
  const { state, addCard } = useStore()
  const [remote, setRemote] = useState<ErrorLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    void fetchAllErrorLogs().then(rows => { if (active) { setRemote(rows); setLoading(false) } })
    return () => { active = false }
  }, [])
  const cards = state.cards.filter(card => card.kind === 'error')
  return <>
    <PageHeader eyebrow={c('BIẾN LỖI SAI THÀNH BÀI HỌC', 'TURN MISTAKES INTO PROGRESS')} title={c('Sổ lỗi sai', 'Your error logbook')} description={c('Nhìn ra một lỗi, tiến gần hơn một chút đến cách viết tốt.', 'Every error you notice is a step towards better writing.')} />
    {remote.length > 0 && <section className="panel grading-panel"><span className="eyebrow">{c('LỖI AI ĐÃ TÌM RA', 'MISTAKES FOUND BY AI')}</span><ul className="grading-list">{remote.map(item => <li key={item.id} className="error-item"><span className="error-quote">{item.quote}</span><span className="error-correction">{item.correction}</span>{item.explanation && <em>{item.explanation}</em>}<span className="error-meta">{item.category}</span><button className="button outline small" onClick={() => void addCard({ term: item.quote, meaning: item.correction, example: item.explanation, kind: 'error' })}>{c('Ôn lại', 'Review')}</button></li>)}</ul></section>}
    {cards.length > 0 && <div className="panel">{cards.map(card => <div className="essay-row" key={card.id}><span className="file-icon"><BookOpen size={20} /></span><div className="essay-row-main"><strong>{card.term}</strong><p>{card.meaning}</p><small>{card.example}</small></div><Link className="text-link" to="/app/review">{c('Ôn lại', 'Review')}<ArrowRight size={16} /></Link></div>)}</div>}
    {!loading && remote.length === 0 && cards.length === 0 && <div className="panel"><Empty title={c('Một trang mới để học từ lỗi sai', 'A fresh page for lessons learned')} description={c('Chấm một bài và các lỗi AI tìm ra sẽ xuất hiện ở đây. Bạn cũng có thể tự thêm thẻ loại "Lỗi cần nhớ".', 'Grade an essay and the mistakes AI finds will appear here. You can also add an "Error to remember" card yourself.')} action={<Link className="button outline" to="/app/vocabulary"><Plus size={17} />{c('Thêm lỗi cần nhớ', 'Add an error card')}</Link>} /></div>}
  </>
}
```

Thêm import: `import { useEffect, useRef, useState } from 'react'`, `import { fetchAllErrorLogs } from '../lib/featuresRepository'`, `import type { ErrorLogEntry } from '../lib/aiLogic.ts'`.

- [ ] **Step 2: Kiểm tra kiểu**

Run: `npx tsc --noEmit`

Expected: không có lỗi.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Learning.tsx
git commit -m "feat(errors): so loi sai doc error_logs tu database"
```

---

### Task 13: Kiểm chứng + triển khai

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Chạy toàn bộ test**

```bash
npm test
npm run test:edge
npx tsc --noEmit
npm run build
```

Expected: tất cả PASS, build xong.

- [ ] **Step 2: Chạy test trình duyệt**

```bash
npm run dev
```

Ở tab khác:

```bash
node tests/writing-space.mjs
node tests/auth-flow.mjs
node tests/i18n.mjs
node tests/accessibility.mjs
```

Expected: PASS. Kiểm tra thủ công `http://127.0.0.1:5173/app/essays/demo` → thấy đủ 5 khối accordion + nút *+ Thêm từ của tôi*.

- [ ] **Step 3: Cập nhật README**

Thêm vào mục *Backend*:

```bash
npm run auth:autoconfirm      # tắt bước xác nhận email khi đăng ký
```

Thêm mục mới sau đoạn *Kiểm thử*:

```markdown
### Cấu hình nhà cung cấp AI

Lớp gọi AI hỗ trợ API chính thức của Anthropic và các bên thứ 3:

| Secret | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_API_BASE_URL` | `https://api.anthropic.com` | Gốc endpoint (có sẵn `/v1/messages` hoặc `/v1/chat/completions`) |
| `AI_API_KEY` | — | Khóa API (fallback `ANTHROPIC_API_KEY`) |
| `AI_API_PROTOCOL` | `auto` | `auto` tự nhận diện · `anthropic` · `openai` |
| `AI_STRUCTURED_MODE` | `prompt` | `prompt` (mọi provider) · `native` (chỉ API chính thức) |

```bash
supabase secrets set AI_API_BASE_URL=https://api.third-party.dev AI_API_KEY=sk-...
```
```

- [ ] **Step 4: Áp dụng migration + deploy edge functions**

```bash
npm run db:migrate
npm run db:deploy
```

- [ ] **Step 5: Set secret nhà cung cấp AI**

Dùng endpoint + key mà bạn cung cấp:

```bash
supabase secrets set AI_API_BASE_URL=<endpoint> AI_API_KEY=<key>
```

Nếu dùng API chính thức: `supabase secrets set ANTHROPIC_API_KEY=<key>`.

- [ ] **Step 6: Chấm thử một bài thật**

- Tạo tài khoản test trên web (`https://huybui.vercel.app/auth`).
- Viết một Task 2 khoảng 200 từ, dán đề bài, bấm *Chấm bài*.
- Xác nhận: có điểm; sau vài giây có dòng "Đang rà soát lỗi và từ vựng…"; rồi xuất hiện các khối *Lỗi sai cần sửa*, *Lộ trình lên band*, *Điểm chưa hợp lý*, *Từ vựng nâng cao*, *Cấu trúc bài*.
- Nếu job `enrich` fail: xem `ai_jobs.error_code` trong database và sửa theo thông báo (thường là `invalid_model_output` → nới schema hoặc `maxTokens`).

- [ ] **Step 7: Dọn dữ liệu test**

Xoá tài khoản test và các bài viết của nó (bằng service key qua PostgREST `auth/v1/admin/users`).

- [ ] **Step 8: Commit + push**

```bash
git add README.md
git commit -m "docs: huong dan cau hinh nha cung cap AI"
git push origin main
```

---

## Ghi chú khi triển khai

- **Sao lưu thay đổi schema**: nếu provider trả `severity` ngoài `minor|major`, `validateEnrichmentOutput` ném `invalid_enrichment` → job fail → không có phản hồi sâu. Nới enum trong `ENRICHMENT_JSON_SCHEMA` và kiểu `EnrichmentUnnaturalPoint` cùng lúc.
- **Chi phí token**: `enrich` nay sinh thêm 3 nhóm → `maxTokens` đã nới lên 6.000. Nếu vẫn bị `truncated_model_output`, nới tiếp hoặc rút gọn yêu cầu trong prompt.
- **Bài cũ**: `essay_features` v1 không có 3 cột mới → các khối ẩn cho tới khi bài được chấm lại (job `v2` chạy lại nhờ `cacheKey` đổi theo `schemaVersion`).
- **Không phá hành vi cũ**: `GradingResult` vẫn render như cũ khi không có `features`/`errors`; `onAddCard` là tuỳ chọn nên các nơi gọi cũ không cần sửa.
