import { requireAuthenticatedUser } from "../_shared/auth.ts";
import { databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { parseDeleteAccount } from "../_shared/schemas.ts";
import { removeUserAssetObjects } from "../_shared/storage.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAuthenticatedUser(request);
    parseDeleteAccount(await readJsonBody(request));

    const tombstone = await context.service
      .from("essays")
      .update({ status: "deleting" })
      .eq("user_id", context.userId)
      .neq("status", "deleted");
    if (tombstone.error) throw databaseError("mark the account essays for deletion");

    const cancelled = await context.service
      .from("ai_jobs")
      .update({ status: "cancelled", lease_token: null, lease_until: null, updated_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .in("status", ["queued", "retry_wait", "processing"]);
    if (cancelled.error) throw databaseError("cancel the account jobs");

    await removeUserAssetObjects(context.service, context.userId);

    const deletion = await context.service.auth.admin.deleteUser(context.userId);
    if (deletion.error) {
      throw databaseError("delete the account");
    }

    return jsonResponse(request, 200, { deleted: true }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
