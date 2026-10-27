import { requireAdmin } from "../_shared/auth.ts";
import {
  AppError,
  databaseError,
  errorResponse,
  jsonResponse,
  preflightResponse,
  readJsonBody,
  requestId,
  requireMethod,
} from "../_shared/http.ts";
import { parseAdminSkills } from "../_shared/schemas.ts";

/**
 * Quản lý trạng thái đề Reading trong trang Quản trị.
 *
 * Client KHÔNG có quyền ghi `skill_tests` (RLS + grant chỉ cho phép SELECT),
 * nên mọi thay đổi trạng thái đi qua function này với service role, sau khi
 * đã kiểm tra role admin ở server (`requireAdmin`).
 */
Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAdmin(request);
    const parsed = parseAdminSkills(await readJsonBody(request));

    const result = await context.service
      .from("skill_tests")
      .update({ status: parsed.status })
      .eq("id", parsed.testId)
      .select("id,status")
      .maybeSingle();
    if (result.error) throw databaseError("update the test status");
    if (!result.data) throw new AppError(404, "test_not_found", "Test not found");
    return jsonResponse(request, 200, { ok: true, test: result.data }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
