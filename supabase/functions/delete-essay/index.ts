import { requireAuthenticatedUser } from "../_shared/auth.ts";
import { AppError, databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { parseDeleteEssay } from "../_shared/schemas.ts";
import { removeEssayAssetObjects, type EssayAssetRow } from "../_shared/storage.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAuthenticatedUser(request);
    const input = parseDeleteEssay(await readJsonBody(request));

    const essayResult = await context.service
      .from("essays")
      .select("id,status")
      .eq("id", input.essayId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (essayResult.error) throw databaseError("load the essay");
    if (!essayResult.data) {
      // A completed deletion is idempotent and does not disclose whether another
      // owner supplied the UUID.
      return jsonResponse(request, 200, { deleted: true }, { requestId: id });
    }

    const tombstone = await context.service
      .from("essays")
      .update({ status: "deleting" })
      .eq("id", input.essayId)
      .eq("user_id", context.userId)
      .neq("status", "deleted");
    if (tombstone.error) throw databaseError("mark the essay for deletion");

    const revisionResult = await context.service
      .from("essay_revisions")
      .select("id")
      .eq("essay_id", input.essayId)
      .eq("user_id", context.userId);
    if (revisionResult.error) throw databaseError("load the essay revisions");
    const revisionIds = (revisionResult.data ?? []).map((revision) => revision.id as string);

    let cancel = context.service
      .from("ai_jobs")
      .update({ status: "cancelled", lease_token: null, lease_until: null, updated_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .in("status", ["queued", "retry_wait", "processing"]);
    if (revisionIds.length) cancel = cancel.in("revision_id", revisionIds);
    else cancel = cancel.eq("payload->>essayId", input.essayId);
    const cancelled = await cancel;
    if (cancelled.error) throw databaseError("cancel the essay jobs");
    const cancelledByPayload = await context.service
      .from("ai_jobs")
      .update({ status: "cancelled", lease_token: null, lease_until: null, updated_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .eq("payload->>essayId", input.essayId)
      .in("status", ["queued", "retry_wait", "processing"]);
    if (cancelledByPayload.error) throw databaseError("cancel the essay jobs");

    const assetResult = await context.service
      .from("essay_assets")
      .select("id,user_id,essay_id,object_path,mime_type,byte_size,content_hash,status")
      .eq("essay_id", input.essayId)
      .eq("user_id", context.userId)
      .neq("status", "deleted");
    if (assetResult.error) throw databaseError("load the essay images");
    const assets = (assetResult.data ?? []) as EssayAssetRow[];
    await removeEssayAssetObjects(context.service, assets);

    if (revisionIds.length) {
      const jobRemoval = await context.service
        .from("ai_jobs")
        .delete()
        .eq("user_id", context.userId)
        .in("revision_id", revisionIds);
      if (jobRemoval.error) throw databaseError("delete the essay jobs");
    }
    const payloadJobRemoval = await context.service
      .from("ai_jobs")
      .delete()
      .eq("user_id", context.userId)
      .eq("payload->>essayId", input.essayId);
    if (payloadJobRemoval.error) throw databaseError("delete the essay jobs");

    const deleted = await context.service
      .from("essays")
      .update({ status: "deleted" })
      .eq("id", input.essayId)
      .eq("user_id", context.userId);
    if (deleted.error) throw databaseError("mark the essay deleted");

    const removal = await context.service
      .from("essays")
      .delete()
      .eq("id", input.essayId)
      .eq("user_id", context.userId);
    if (removal.error) throw databaseError("delete the essay");

    return jsonResponse(request, 200, { deleted: true }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
