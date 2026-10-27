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

/**
 * Gợi ý hành động theo mã lỗi.
 *
 * Chỉ thêm gợi ý khi người dùng có một bước khắc phục cụ thể (đăng nhập lại,
 * chờ độ trễ retry, tải lại bản nháp mới nhất, thêm chữ vào bài, chờ ảnh tải
 * xong, kiểm tra lại các trường dữ liệu, dùng đúng HTTP method...). Mã lỗi
 * không có bước khắc phục rõ ràng sẽ không có gợi ý nào.
 *
 * Gợi ý luôn là một câu ngắn, an toàn: không chứa secret, không chứa SQL,
 * không chứa stack trace và không chứa định danh nội bộ.
 */
export const ERROR_HINTS: Readonly<Record<string, string>> = {
  unauthenticated: "Sign in again, then retry the request.",
  forbidden: "Sign in with an account that has the required access.",
  suspended: "Ask the site administrator to restore access to your account.",
  rate_limited: "Wait for the retry delay, then try again.",
  too_many_ai_jobs: "Wait for the running AI jobs to finish, then try again.",
  draft_conflict: "Reload the latest draft, then submit again.",
  idempotency_conflict: "Retry the request with a new idempotency key.",
  essay_empty: "Add text to the essay, then try again.",
  text_required: "Add text to the essay, then try again.",
  essay_not_found: "Reload the essay list and open the essay again.",
  essay_not_active: "Wait for the deletion to finish, then try again.",
  revision_not_found: "Reload the essay and try again.",
  image_not_ready: "Wait for the image upload to finish, then try again.",
  invalid_request: "Check the request fields, then try again.",
  invalid_json: "Send a request body that is valid JSON.",
  method_not_allowed: "Send the request with a supported HTTP method.",
  body_too_large: "Send a smaller request body.",
  database_unavailable: "Wait a moment, then try again.",
  storage_unavailable: "Wait a moment, then try again.",
  storage_cleanup_failed: "Retry the request that removes the essay images.",
  server_misconfigured: "Ask the site administrator to check the server configuration.",
  invalid_admin_token: "Sign in to the admin panel again.",
  invalid_admin_password: "Check the admin password, then try again.",
  invalid_worker_secret: "Check the worker secret, then try again.",
  self_action_forbidden: "Ask another administrator to perform this action.",
  user_not_found: "Reload the user list and try again.",
  entry_not_found: "Reload the list and try again.",
  prompt_not_found: "Reload the list and try again.",
  job_not_found: "Reload the job list and try again.",
  job_not_retryable: "Retry the job after it has failed.",
  asset_not_found: "Reload the essay and choose the image again.",
  asset_essay_mismatch: "Choose images that belong to the same essay.",
  invalid_image: "Re-upload the image and try again.",
  invalid_image_size: "Upload an image within the allowed size.",
  image_hash_mismatch: "Re-upload the image and try again.",
  invalid_mime_type: "Upload a PNG, JPEG or WebP image.",
  invalid_status: "Use one of the supported statuses.",
  invalid_action: "Use one of the supported admin actions.",
  test_not_found: "Reload the test list and open the test again.",
  test_unavailable: "This test is not available right now. Choose another one.",
  attempt_not_found: "Reload the attempt list and open the attempt again.",
};

/**
 * Lấy gợi ý theo mã lỗi.
 * Dùng hasOwnProperty để mã lạ (kể cả "constructor" hay "__proto__") không
 * nhận nhầm giá trị kế thừa từ Object.prototype.
 */
export function hintFor(code: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(ERROR_HINTS, code) ? ERROR_HINTS[code] : undefined;
}

/**
 * Chuẩn hoá lỗi do handler CỦA CHÚNG TA ném ra rồi trả về cho client.
 *
 * Lưu ý: hàm này KHÔNG xử lý lỗi do gateway của nền tảng Supabase sinh ra
 * trước khi handler kịp chạy (ví dụ HTTP 401 khi gateway chặn request).
 * Những lỗi đó không đi qua hàm này, nên không được khẳng định hàm này
 * chuẩn hoá lỗi của gateway. Phải kiểm tra riêng phản hồi của gateway bằng
 * một request thật.
 */
export function errorResponse(request: Request, error: unknown, id: string): Response {
  const normalized = normalizeError(error);
  console.error(JSON.stringify({
    requestId: id,
    code: normalized.code,
    status: normalized.status,
  }));

  // Chỉ thêm khi mã lỗi có gợi ý; nếu không có thì shape của response giữ nguyên như cũ.
  const hint = hintFor(normalized.code);

  return jsonResponse(
    request,
    normalized.status,
    {
      error: {
        code: normalized.code,
        message: normalized.message,
        ...(hint ? { hint } : {}),
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
