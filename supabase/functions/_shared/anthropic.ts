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
} from "./provider.ts";

export { extractTextContent };

export const ANTHROPIC_TIMEOUT_MS = 180_000;
export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
export const PRICING_VERSION = "anthropic-pricing-v1";

/** Ghép ràng buộc JSON vào system prompt (chế độ lấy JSON bằng prompt). */
export function buildStructuredSystemPrompt(system: string, schema: Record<string, unknown>): string {
  return `${system}\n\n${structuredInstruction(schema)}`;
}

export class AnthropicError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly status?: number;
  readonly retryAfterSeconds?: number;

  constructor(
    message: string,
    code: string,
    retryable: boolean,
    status?: number,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
    this.name = "AnthropicError";
  }
}

export interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}

export interface AnthropicCall {
  rawText: string;
  usage: AnthropicUsage;
  providerRequestId: string;
  model: string;
  latencyMs: number;
}

export interface StructuredRequest<T> {
  model: string;
  system: string;
  messages: unknown[];
  schema: Record<string, unknown>;
  maxTokens: number;
  validate: (value: unknown) => T;
  repairInstruction?: string;
}

export interface StructuredCall<T> {
  value: T;
  calls: AnthropicCall[];
}

/**
 * Đọc body của provider. Một số proxy chen heartbeat (`: PING`) hoặc dòng
 * trống vào trước JSON — `JSON.parse` thẳng sẽ ném lỗi và làm job fail với
 * `network_error` dù provider đã trả lời đúng. Vì vậy bỏ mọi dòng tiền tố
 * không phải JSON rồi mới parse.
 */
export function parseProviderBody(text: string): unknown {
  const raw = (text ?? "").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    // Tìm dòng đầu tiên bắt đầu bằng `{` hoặc `[` — bỏ qua heartbeat của proxy.
    const lines = raw.split("\n");
    const start = lines.findIndex(line => line.trimStart().startsWith("{") || line.trimStart().startsWith("["));
    if (start < 0) throw new SyntaxError("Provider response is not JSON");
    const candidate = lines.slice(start).join("\n").trim();
    try {
      return JSON.parse(candidate);
    } catch {
      throw new SyntaxError("Provider response is not JSON");
    }
  }
}

export function classifyProviderError(error: number | Error | AnthropicError): AnthropicError {
  if (error instanceof AnthropicError) return error;
  if (typeof error === "number") {
    const retryable = error === 408 || error === 429 || error >= 500;
    return new AnthropicError(
      retryable ? "The AI provider is temporarily unavailable" : "The AI provider rejected the request",
      retryable ? "provider_temporary" : "provider_request_failed",
      retryable,
      error,
    );
  }
  return new AnthropicError("The AI provider could not be reached", "network_error", true);
}

export function parseRetryAfter(value: string | null, now = Date.now()): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.min(300, Math.max(0, Math.floor(seconds)));

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return Math.min(300, Math.max(0, Math.ceil((timestamp - now) / 1_000)));
}

export async function requestStructured<T>(request: StructuredRequest<T>): Promise<StructuredCall<T>> {
  const calls: AnthropicCall[] = [];
  const deadline = Date.now() + ANTHROPIC_TIMEOUT_MS;
  const first = await callAnthropic(
    request.model,
    request.system,
    request.messages,
    request.schema,
    request.maxTokens,
    Math.max(1_000, deadline - Date.now()),
  );
  calls.push(first);

  try {
    const value = request.validate(extractJson(first.rawText));
    return { value, calls };
  } catch {
    // A single corrective call is allowed. The malformed provider output is sent back
    // only to Anthropic and is never written to application logs.
    const previousOutput = {
      role: "assistant",
      content: [{ type: "text", text: first.rawText.slice(0, 30_000) }],
    };
    const repairMessage = {
      role: "user",
      content: [
        {
          type: "text",
          text: `${request.repairInstruction ?? "Repair the malformed JSON and return only schema-valid JSON."} Reply with the JSON object only: it must start with { and end with }, with no commentary and no code fence.`,
        },
      ],
    };
    const remaining = deadline - Date.now();
    if (remaining <= 1_000) {
      throw new AnthropicError("The AI provider returned invalid structured output", "invalid_model_output", true);
    }
    const repaired = await callAnthropic(
      request.model,
      request.system,
      [...request.messages, previousOutput, repairMessage],
      request.schema,
      request.maxTokens,
      remaining,
    );
    calls.push(repaired);
    try {
      const value = request.validate(extractJson(repaired.rawText));
      return { value, calls };
    } catch {
      throw new AnthropicError("The AI provider returned invalid structured output", "invalid_model_output", true);
    }
  }
}

export async function callAnthropic(
  model: string,
  system: string,
  messages: unknown[],
  schema: Record<string, unknown>,
  maxTokens: number,
  timeoutMs = ANTHROPIC_TIMEOUT_MS,
): Promise<AnthropicCall> {
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
        // Sai endpoint (404/405) → thử protocol còn lại trước khi bỏ cuộc.
        if (response.status === 404 || response.status === 405) continue;
        throw lastError;
      }

      const body = await parseProviderBody(await response.text());
      const parsed = parseProviderResponse(body, response.headers);
      if (!parsed.rawText) {
        // Provider đôi khi trả rác — cho job thử lại thay vì bỏ luôn.
        throw new AnthropicError("The AI provider returned no text output", "empty_model_output", true);
      }
      if (parsed.truncated) {
        throw new AnthropicError("The AI provider output was truncated", "truncated_model_output", true);
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
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Đọc cấu hình nhà cung cấp AI từ biến môi trường của Edge Function. */
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
