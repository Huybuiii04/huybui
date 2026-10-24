import { requireAuthenticatedUser } from "../_shared/auth.ts";
import { getEnv, AppError, databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { buildCacheKey } from "../_shared/jobs.ts";
import { ENRICHMENT_SCHEMA_VERSION } from "../_shared/ai/enrich.ts";
import { TOOL_SCHEMA_VERSION } from "../_shared/ai/tools.ts";
import { GRADING_PROMPT_VERSION, RUBRIC_VERSION, TOOL_PROMPT_VERSION } from "../_shared/prompts.ts";
import { parseRunWritingTool } from "../_shared/schemas.ts";
import { finalizePendingAssets, type EssayAssetRow } from "../_shared/storage.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAuthenticatedUser(request);
    const input = parseRunWritingTool(await readJsonBody(request));

    const existing = await context.service
      .from("ai_jobs")
      .select("id,status,operation")
      .eq("user_id", context.userId)
      .eq("idempotency_key", input.idempotencyKey)
      .maybeSingle();
    if (existing.error) throw databaseError("load the existing job");
    if (existing.data) {
      if (existing.data.operation !== input.operation) {
        throw new AppError(409, "idempotency_conflict", "The idempotency key belongs to a different operation");
      }
      return jsonResponse(request, 202, { jobId: existing.data.id, status: existing.data.status }, { requestId: id });
    }

    const recent = await context.service
      .from("ai_jobs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .gte("created_at", new Date(Date.now() - 60_000).toISOString());
    if (recent.error) throw databaseError("check the request rate");
    if ((recent.count ?? 0) >= 6) {
      throw new AppError(429, "rate_limited", "Too many AI requests. Please retry in one minute.", 60);
    }

    let revision: Record<string, unknown> | null = null;
    let essayId: string | null = null;
    if (input.revisionId) {
      const revisionResult = await context.service
        .from("essay_revisions")
        .select("id,essay_id,task_type,subtype,prompt_text,essay_text,reference_data,feedback_locale,target_band")
        .eq("id", input.revisionId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (revisionResult.error) throw databaseError("load the revision");
      if (!revisionResult.data) throw new AppError(404, "revision_not_found", "Revision not found");
      revision = revisionResult.data;
      essayId = revision.essay_id as string;

      const essayResult = await context.service
        .from("essays")
        .select("status")
        .eq("id", essayId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (essayResult.error) throw databaseError("load the essay");
      if (!essayResult.data) throw new AppError(404, "essay_not_found", "Essay not found");
      if (essayResult.data.status !== "active") {
        throw new AppError(409, "essay_not_active", "The essay is being deleted");
      }
    }

    const selectedAssets = await loadSelectedAssets(context, input.assetIds ?? [], essayId);
    if ((input.assetIds?.length ?? 0) > 0 && selectedAssets.length !== input.assetIds!.length) {
      throw new AppError(409, "image_not_ready", "One or more images are missing or not ready");
    }
    const text = input.text ?? (revision?.essay_text as string | undefined) ?? "";
    const prompt = input.prompt ?? (revision?.prompt_text as string | undefined) ?? "";
    if (input.operation !== "read-image" && !text.trim()) {
      throw new AppError(400, "text_required", "The writing tool requires text to work on");
    }

    let task = String(revision?.task_type ?? "generic");
    let subtype = String(revision?.subtype ?? "");
    let referenceData = String(revision?.reference_data ?? "");
    let feedbackLocale = String(revision?.feedback_locale ?? "vi");
    let targetBand = revision?.target_band === null || revision?.target_band === undefined
      ? 7
      : Number(revision.target_band);

    if (!revision && selectedAssets.length) {
      const assetEssayIds = [...new Set(selectedAssets.map((asset) => asset.essay_id))];
      if (assetEssayIds.length !== 1) {
        throw new AppError(400, "asset_essay_mismatch", "All images must belong to the same essay");
      }
      essayId = assetEssayIds[0];
      const essayContext = await context.service
        .from("essays")
        .select("status,task_type,subtype,reference_data,feedback_locale,target_band")
        .eq("id", essayId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (essayContext.error) throw databaseError("load the essay");
      if (!essayContext.data) throw new AppError(404, "essay_not_found", "Essay not found");
      if (essayContext.data.status !== "active") {
        throw new AppError(409, "essay_not_active", "The essay is being deleted");
      }
      task = String(essayContext.data.task_type);
      subtype = String(essayContext.data.subtype ?? "");
      referenceData = String(essayContext.data.reference_data ?? "");
      feedbackLocale = String(essayContext.data.feedback_locale ?? "vi");
      targetBand = essayContext.data.target_band === null
        ? 7
        : Number(essayContext.data.target_band);
    } else if (!revision) {
      const profile = await context.service
        .from("profiles")
        .select("feedback_locale,target_band")
        .eq("id", context.userId)
        .maybeSingle();
      if (profile.error) throw databaseError("load the user preferences");
      feedbackLocale = String(profile.data?.feedback_locale ?? "vi");
      targetBand = Number(profile.data?.target_band ?? 7);
    }

    const model = getEnv(modelEnvironmentFor(input.operation));
    if (!model) throw new AppError(503, "server_misconfigured", "The AI model is not configured");
    const imageHashes = selectedAssets.map((asset) => asset.content_hash.toLowerCase());
    const cacheKey = await buildCacheKey({
      ownerId: context.userId,
      operation: input.operation,
      task,
      subtype,
      essayText: text,
      promptText: prompt,
      referenceData,
      imageHashes,
      feedbackLocale,
      targetBand,
      model,
      promptVersion: TOOL_PROMPT_VERSION,
      rubricVersion: RUBRIC_VERSION,
      schemaVersion: toolSchemaVersion(input.operation),
    });

    const jobInsert = await context.service.from("ai_jobs").insert({
      user_id: context.userId,
      revision_id: input.revisionId ?? null,
      operation: input.operation,
      payload: {
        operation: input.operation,
        revisionId: input.revisionId ?? null,
        essayId,
        task,
        subtype,
        referenceData,
        model,
        text,
        prompt,
        assetIds: selectedAssets.map((asset) => asset.id),
        feedbackLocale,
      },
      idempotency_key: input.idempotencyKey,
      cache_key: cacheKey,
      status: "queued",
      next_attempt_at: new Date().toISOString(),
    }).select("id,status").maybeSingle();

    if (jobInsert.error) {
      const duplicate = await context.service
        .from("ai_jobs")
        .select("id,status,operation")
        .eq("user_id", context.userId)
        .eq("idempotency_key", input.idempotencyKey)
        .maybeSingle();
      if (!duplicate.error && duplicate.data) {
        if (duplicate.data.operation !== input.operation) {
          throw new AppError(409, "idempotency_conflict", "The idempotency key belongs to a different operation");
        }
        return jsonResponse(request, 202, { jobId: duplicate.data.id, status: duplicate.data.status }, { requestId: id });
      }
      throw databaseError("queue the writing-tool job");
    }

    return jsonResponse(request, 202, {
      jobId: jobInsert.data?.id,
      status: jobInsert.data?.status ?? "queued",
    }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});

async function loadSelectedAssets(
  context: Awaited<ReturnType<typeof requireAuthenticatedUser>>,
  assetIds: string[],
  essayId: string | null,
): Promise<EssayAssetRow[]> {
  if (!assetIds.length) return [];
  const assetResult = await context.service
    .from("essay_assets")
    .select("id,user_id,essay_id,object_path,mime_type,byte_size,content_hash,status")
    .eq("user_id", context.userId)
    .in("id", assetIds)
    .neq("status", "deleted");
  if (assetResult.error) throw databaseError("load the images");
  const assets = (assetResult.data ?? []) as EssayAssetRow[];
  if (assets.length !== assetIds.length) throw new AppError(404, "asset_not_found", "One or more images were not found");
  if (essayId && assets.some((asset) => asset.essay_id !== essayId)) {
    throw new AppError(400, "asset_essay_mismatch", "The images do not belong to the selected revision");
  }
  if (new Set(assets.map((asset) => asset.essay_id)).size > 1) {
    throw new AppError(400, "asset_essay_mismatch", "All images must belong to the same essay");
  }

  const readyById = new Map<string, EssayAssetRow>();
  for (const assetEssayId of [...new Set(assets.map((asset) => asset.essay_id))]) {
    const ready = await finalizePendingAssets(context.service, assetEssayId, context.userId);
    for (const item of ready) readyById.set(item.id, item);
  }
  return assetIds.map((assetId) => readyById.get(assetId)).filter((asset): asset is EssayAssetRow => Boolean(asset));
}

function modelEnvironmentFor(operation: string): string {
  return operation === "argument-stress-test" || operation === "critical-thinking"
    ? "AI_MODEL_GRADING"
    : "AI_MODEL_EXTRACTION";
}

function toolSchemaVersion(operation: string): string {
  if (operation === "read-image") return ENRICHMENT_SCHEMA_VERSION;
  return TOOL_SCHEMA_VERSION;
}
