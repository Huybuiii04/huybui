import { requireAdmin } from "../_shared/auth.ts";
import { signAdminToken } from "../_shared/adminSession.ts";
import { AppError, errorResponse, getEnv, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { constantTimeEqual } from "../_shared/security.ts";

/** Phiên quản trị lớp 2 hạn 12 giờ. */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Cổng quản trị lớp 2: đổi mật khẩu admin lấy token HMAC.
 * Yêu cầu đã đăng nhập app bằng tài khoản có role admin.
 */
Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAdmin(request);
    const secret = getEnv("ADMIN_PASSWORD");
    if (!secret) throw new AppError(503, "server_misconfigured", "The admin password is not configured");
    const body = await readJsonBody(request) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || !(await constantTimeEqual(password, secret))) {
      throw new AppError(401, "invalid_admin_password", "The admin password is incorrect");
    }
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const token = await signAdminToken(context.userId, expiresAt, secret);
    return jsonResponse(request, 200, { token, expiresAt }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
