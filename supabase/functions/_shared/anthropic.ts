export const ANTHROPIC_TIMEOUT_MS = 90_000;
export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
export const ANTHROPIC_VERSION = "2023-06-01";
export const PRICING_VERSION = "anthropic-pricing-v1";

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
    const value = request.validate(JSON.parse(first.rawText));
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
          text: request.repairInstruction ?? "Repair the malformed JSON and return only schema-valid JSON.",
        },
      ],
    };
    const remaining = deadline - Date.now();
    if (remaining <= 1_000) {
      throw new AnthropicError("The AI provider returned invalid structured output", "invalid_model_output", false);
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
      const value = request.validate(JSON.parse(repaired.rawText));
      return { value, calls };
    } catch {
      throw new AnthropicError("The AI provider returned invalid structured output", "invalid_model_output", false);
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
  const apiKey = readEnv("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new AnthropicError("AI provider configuration is missing", "missing_api_key", false);
  }
  if (!model) {
    throw new AnthropicError("AI model configuration is missing", "missing_model", false);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1, timeoutMs));
  const startedAt = Date.now();

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages,
        output_config: {
          format: {
            type: "json_schema",
            schema,
          },
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const retryAfter = parseRetryAfter(response.headers.get("retry-after"));
      const classified = classifyProviderError(response.status);
      throw new AnthropicError(
        classified.message,
        classified.code,
        classified.retryable,
        response.status,
        retryAfter ?? undefined,
      );
    }

    const body = await response.json() as {
      id?: unknown;
      content?: unknown;
      model?: unknown;
      stop_reason?: unknown;
      usage?: unknown;
    };
    const rawText = extractTextContent(Array.isArray(body.content) ? body.content : []);
    if (!rawText) {
      throw new AnthropicError("The AI provider returned no text output", "empty_model_output", false);
    }
    if (body.stop_reason === "max_tokens") {
      throw new AnthropicError("The AI provider output was truncated", "truncated_model_output", false);
    }
    if (body.stop_reason === "refusal") {
      throw new AnthropicError("The AI provider refused the request", "provider_refusal", false);
    }

    const usage = body.usage as Record<string, unknown> | undefined;
    return {
      rawText,
      usage: {
        input_tokens: numberOrZero(usage?.input_tokens),
        output_tokens: numberOrZero(usage?.output_tokens),
        cache_creation_input_tokens: numberOrZero(usage?.cache_creation_input_tokens),
        cache_read_input_tokens: numberOrZero(usage?.cache_read_input_tokens),
      },
      providerRequestId: response.headers.get("request-id") ?? (typeof body.id === "string" ? body.id : ""),
      model: typeof body.model === "string" ? body.model : model,
      latencyMs: Date.now() - startedAt,
    };
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

function readEnv(name: string): string | undefined {
  const deno = (globalThis as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno;
  return deno?.env?.get?.(name);
}
