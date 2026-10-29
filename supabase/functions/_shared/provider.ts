// Lớp gọi AI đa nhà cung cấp: dựng endpoint, header, body và đọc response.
// Hỗ trợ API chính thức của Anthropic và các proxy tương thích
// (Anthropic-compatible hoặc OpenAI-compatible). Thuần, không network → test được.

export type ProviderProtocol = "anthropic" | "openai";
export type ProviderMode = "auto" | ProviderProtocol;
/**
 * - `tool`: Anthropic tool-use — model trả đúng JSON theo schema (chế độ mặc định)
 * - `prompt`: JSON nằm trong system prompt, dùng cho provider không hỗ trợ tool
 * - `native`: `output_config.format.json_schema` của API chính thức Anthropic
 */
export type StructuredMode = "tool" | "prompt" | "native";

export type ProviderConfig = {
  baseUrl: string;
  apiKey: string;
  protocol: ProviderMode;
  structuredMode: StructuredMode;
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

const EMPTY_USAGE: ProviderUsage = {
  input_tokens: 0,
  output_tokens: 0,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: 0,
};

/** Đọc cấu hình nhà cung cấp từ biến môi trường của Edge Function. */
export function resolveProviderConfig(env: Record<string, string | undefined>): ProviderConfig {
  const rawBase = (env.AI_API_BASE_URL ?? "https://api.anthropic.com").trim();
  const baseUrl = rawBase.replace(/\/+$/, "");
  const apiKey = (env.AI_API_KEY ?? env.ANTHROPIC_API_KEY ?? "").trim();
  const declared = (env.AI_API_PROTOCOL ?? "auto").trim().toLowerCase();
  const protocol: ProviderMode = declared === "anthropic" || declared === "openai" ? declared : "auto";
  const mode = (env.AI_STRUCTURED_MODE ?? "tool").trim().toLowerCase();
  return {
    baseUrl,
    apiKey,
    protocol,
    structuredMode: mode === "prompt" || mode === "native" ? mode : "tool",
  };
}

/** Thứ tự protocol sẽ thử. `auto` đoán theo URL, còn lại thử cả hai. */
export function protocolCandidates(config: ProviderConfig): ProviderProtocol[] {
  if (config.protocol !== "auto") return [config.protocol];
  if (config.baseUrl.includes("/chat/completions")) return ["openai"];
  if (config.baseUrl.includes("/messages")) return ["anthropic"];
  return ["anthropic", "openai"];
}

/** Endpoint đầy đủ. Base URL đã có path thì giữ nguyên. */
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

export function providerBody(
  config: ProviderConfig,
  protocol: ProviderProtocol,
  input: ProviderRequestInput,
): Record<string, unknown> {
  if (protocol === "openai") {
    const body: Record<string, unknown> = {
      model: input.model,
      messages: [{ role: "system", content: input.system }, ...toOpenAiMessages(input.messages)],
      max_tokens: input.maxTokens,
      max_completion_tokens: input.maxTokens,
    };
    if (config.structuredMode === "native") {
      body.response_format = {
        type: "json_schema",
        json_schema: { name: "result", schema: input.schema, strict: false },
      };
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
  } else if (config.structuredMode === "tool") {
    // Tool-use: model trả về đúng JSON theo schema, không cần ép bằng prompt.
    const required = Object.keys((input.schema.properties ?? {}) as Record<string, unknown>);
    body.tools = [{
      name: RESULT_TOOL_NAME,
      description: required.length
        ? `Return the analysis as one JSON object. Required top-level keys: ${required.join(", ")}.`
        : "Return the analysis as one JSON object.",
      input_schema: input.schema,
    }];
    body.tool_choice = { type: "tool", name: RESULT_TOOL_NAME };
  }
  return body;
}

/** Tên tool dùng để ép model trả về JSON đúng schema. */
export const RESULT_TOOL_NAME = "result";

/** Đổi khối ảnh kiểu Anthropic sang `image_url` kiểu OpenAI. */
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
          return {
            type: "image_url",
            image_url: { url: `data:${item.source.media_type ?? "image/png"};base64,${item.source.data}` },
          };
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

/** Đọc response theo hình dạng, không theo protocol — chấp nhận cả 3 kiểu trả về. */
export function parseProviderResponse(body: unknown, headers: Headers): ProviderResponse {
  const record = (body ?? {}) as Record<string, unknown>;

  if (Array.isArray(record.content)) {
    const usage = record.usage as Record<string, unknown> | undefined;
    // Tool-use: JSON nằm trong block tool_use.input.
    const toolUse = record.content.find((block) =>
      Boolean(block) &&
      typeof block === "object" &&
      (block as { type?: unknown }).type === "tool_use"
    ) as { input?: unknown } | undefined;
    const rawText = toolUse
      ? JSON.stringify(toolUse.input ?? {})
      : extractTextContent(record.content);
    return {
      rawText,
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

  return { rawText: "", usage: { ...EMPTY_USAGE }, providerRequestId: "", model: "", truncated: false, refusal: false };
}

/** Câu lệnh ép model trả về đúng một JSON object (dùng cho chế độ prompt). */
export function structuredInstruction(schema: Record<string, unknown>): string {
  return [
    "Return exactly one JSON object and nothing else.",
    "Your reply must start with { and end with }.",
    "Do not wrap it in code fences, do not write analysis or commentary, and do not add any text before or after it.",
    "The JSON object must match this schema:",
    JSON.stringify(schema),
  ].join("\n");
}

/**
 * Tìm object JSON đầu tiên trong text, bỏ qua dấu ngoặc nằm trong chuỗi.
 * Dùng khi provider trả lời lẫn prose với JSON, hoặc bọc tool call trong text.
 */
function sliceJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return null;
}

/**
 * Bóc JSON ra khỏi raw text: bỏ code fence, bỏ prose, rồi mới parse.
 *
 * Provider đôi lúc trả tool call dạng text (`<tool_calls>[{...}]</tool_calls>`)
 * hoặc kẹt JSON trong lời dẫn — cả hai đều được xử lý ở đây.
 */
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
  const balanced = sliceJsonObject(trimmed);
  if (balanced) candidates.push(balanced);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const unwrapped = unwrapToolArguments(parsed);
      if (unwrapped && typeof unwrapped === "object") return unwrapped;
    } catch {
      // Thử candidate tiếp theo.
    }
  }
  return null;
}

/**
 * Provider có thể trả tool call dạng text: `{"name":"result","arguments":{...}}`.
 * Trả về phần `arguments` bên trong.
 */
function unwrapToolArguments(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const record = value as Record<string, unknown>;
  const args = record.arguments;
  if (args && typeof args === "object" && !Array.isArray(args)) {
    const keys = Object.keys(record);
    if (keys.every((key) => key === "arguments" || key === "name" || key === "id" || key === "type")) {
      return args;
    }
  }
  return value;
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
