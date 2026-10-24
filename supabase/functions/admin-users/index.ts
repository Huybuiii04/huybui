import { requireAdmin } from "../_shared/auth.ts";
import { AppError, databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { parseAdminUsers } from "../_shared/schemas.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAdmin(request);
    const input = parseAdminUsers(await readJsonBody(request));

    if (input.userId === context.userId && ["suspend", "remove_admin"].includes(input.action)) {
      throw new AppError(400, "self_action_forbidden", "An administrator cannot suspend or demote their own account");
    }

    const target = await context.service
      .from("user_access")
      .select("user_id,role,status")
      .eq("user_id", input.userId)
      .maybeSingle();
    if (target.error) throw databaseError("load the user access record");
    if (!target.data) throw new AppError(404, "user_not_found", "User not found");

    const update = input.action === "suspend"
      ? { status: "suspended" }
      : input.action === "restore"
      ? { status: "active" }
      : input.action === "make_admin"
      ? { role: "admin" }
      : { role: "user" };

    const result = await context.service
      .from("user_access")
      .update(update)
      .eq("user_id", input.userId)
      .select("user_id,role,status")
      .maybeSingle();
    if (result.error) throw databaseError("update the user access record");
    if (!result.data) throw new AppError(404, "user_not_found", "User not found");

    const audit = await context.service.from("admin_audit_logs").insert({
      actor_id: context.userId,
      action: `admin.user.${input.action}`,
      target: input.userId,
      metadata: {},
    });
    if (audit.error) throw databaseError("write the admin audit log");

    return jsonResponse(request, 200, {
      ok: true,
      userId: result.data.user_id,
      role: result.data.role,
      status: result.data.status,
    }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
