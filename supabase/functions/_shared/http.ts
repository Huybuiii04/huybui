import { corsHeaders } from "./cors.ts";
import { SchemaError } from "./schemas.ts";

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfterSeconds?: number;

  constructor(status: number, code: string, message: string, retryAfterSeconds?: number) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.name = "AppError";
  }
}

export function getEnv(name: string): string | undefined {
  const deno = (globalThis as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno;
  const value = deno?.env?.get?.(name);
  return value && value.trim() ? value.trim() : undefined;
}

export function allowedOrigins(): string {
  return getEnv("ALLOWED_ORIGINS") ?? "*";
}

export function requestId(): string {
  return crypto.randomUUID();
}

export function jsonResponse(
  request: Request,
  status: number,
  body: unknown,
  options: { requestId?: string; retryAfterSeconds?: number; headers?: HeadersInit } = {},
): Response {
  const headers = corsHeaders(request.headers.get("origin"), allowedOrigins());
  if (options.requestId) headers.set("x-request-id", options.requestId);
  if (options.retryAfterSeconds !== undefined) {
    headers.set("retry-after", String(options.retryAfterSeconds));
  }
  if (options.headers) {
    const extra = new Headers(options.headers);
    extra.forEach((value, key) => headers.set(key, value));
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...Object.fromEntries(headers.entries()),
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export function preflightResponse(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: Object.fromEntries(corsHeaders(request.headers.get("origin"), allowedOrigins()).entries()),
  });
}

export function errorResponse(request: Request, error: unknown, id: string): Response {
  const normalized = normalizeError(error);
  console.error(JSON.stringify({
    requestId: id,
    code: normalized.code,
    status: normalized.status,
  }));

  return jsonResponse(
    request,
    normalized.status,
    {
      error: {
        code: normalized.code,
        message: normalized.message,
        requestId: id,
        ...(normalized.retryAfterSeconds !== undefined
          ? { retryAfter: normalized.retryAfterSeconds }
          : {}),
      },
      requestId: id,
    },
    {
      requestId: id,
      retryAfterSeconds: normalized.retryAfterSeconds,
    },
  );
}

export function requireMethod(request: Request, allowed: string[]): void {
  if (!allowed.includes(request.method)) {
    throw new AppError(405, "method_not_allowed", `Use ${allowed.join(", ")} for this endpoint`);
  }
}

export async function readJsonBody(request: Request, maxBytes = 256 * 1024): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new AppError(413, "body_too_large", "The request body is too large");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new AppError(413, "body_too_large", "The request body is too large");
  }
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AppError(400, "invalid_json", "The request body must be valid JSON");
  }
}

export function databaseError(operation: string): AppError {
  return new AppError(503, "database_unavailable", `Could not ${operation}. Please retry.`);
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof SchemaError) {
    return new AppError(400, "invalid_request", error.message);
  }
  return new AppError(500, "internal_error", "An unexpected error occurred");
}
