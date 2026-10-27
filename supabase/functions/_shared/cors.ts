export function resolveAllowedOrigin(origin: string | null, configured: string): string | null {
  const allowed = configured
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowed.includes("*")) return "*";
  if (!origin) return null;
  return allowed.includes(origin) ? origin : null;
}

export function corsHeaders(origin: string | null, configured: string): Headers {
  const allowedOrigin = resolveAllowedOrigin(origin, configured);
  const headers = new Headers();
  if (allowedOrigin) headers.set("Access-Control-Allow-Origin", allowedOrigin);
  headers.set("Access-Control-Allow-Credentials", "false");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  // `x-attempt-id` dùng cho GET /grade-skill (xem lại lần làm bài): header này
  // không nằm trong danh sách an toàn của trình duyệt nên request có preflight —
  // thiếu nó thì trình duyệt chặn preflight và trang kết quả hỏng khi tải lại.
  headers.set(
    "Access-Control-Allow-Headers",
    "authorization, apikey, content-type, x-client-info, x-worker-secret, x-admin-token, x-attempt-id",
  );
  headers.set("Access-Control-Expose-Headers", "x-request-id, retry-after");
  headers.set("Access-Control-Max-Age", "86400");
  headers.append("Vary", "Origin");
  return headers;
}
