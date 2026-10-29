import { requireAuthenticatedUser } from "../_shared/auth.ts";
import { getEnv, AppError, databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { buildCacheKey, buildRevisionInputHash, countWords, deterministicUuid } from "../_shared/jobs.ts";
import { GRADING_SCHEMA_VERSION } from "../_shared/ai/grade.ts";
import { GRADING_PROMPT_VERSION, RUBRIC_VERSION } from "../_shared/prompts.ts";
import { parseSubmitEssay } from "../_shared/schemas.ts";
import { finalizePendingAssets } from "../_shared/storage.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAuthenticatedUser(request);
    const input = parseSubmitEssay(await readJsonBody(request));

    const existing = await context.service
      .from("ai_jobs")
      .select("id,revision_id,status,operation,payload")
      .eq("user_id", context.userId)
      .eq("idempotency_key", input.idempotencyKey)
      .maybeSingle();
    if (existing.error) throw databaseError("load the existing job");
    if (existing.data) {
      if (existing.data.operation !== "grade") {
        throw new AppError(409, "idempotency_conflict", "The idempotency key belongs to a different operation");
      }
      const existingEssayId = (existing.data.payload as Record<string, unknown> | null)?.essayId;
      if (typeof existingEssayId === "string" && existingEssayId !== input.essayId) {
        throw new AppError(409, "idempotency_conflict", "The idempotency key belongs to a different essay");
      }
      return jsonResponse(request, 202, {
        revisionId: existing.data.revision_id,
        jobId: existing.data.id,
        status: existing.data.status,
      }, { requestId: id });
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

    const essayResult = await context.service
      .from("essays")
      .select("id,user_id,task_type,subtype,prompt_text,body_text,reference_data,target_band,feedback_locale,draft_version,status,draft")
      .eq("id", input.essayId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (essayResult.error) throw databaseError("load the essay");
    const essay = essayResult.data;
    if (essay && essay.task_type !== "task2" && essay.task_type !== "academic_task1") {
      throw new AppError(400, "task_not_supported", "This writing task is no longer supported");
    }
    if (!essay) throw new AppError(404, "essay_not_found", "Essay not found");
    if (essay.status !== "active") {
      throw new AppError(409, "essay_not_active", "The essay is being deleted and cannot be submitted");
    }
    if (essay.draft_version !== input.expectedVersion) {
      throw new AppError(409, "draft_conflict", "The essay changed. Reload it before submitting.");
    }
    if (!essay.body_text.trim()) {
      throw new AppError(400, "essay_empty", "The essay must contain text before submission");
    }

    const model = getEnv("AI_MODEL_GRADING");
    if (!model) throw new AppError(503, "server_misconfigured", "The grading model is not configured");

    const allAssets = await finalizePendingAssets(context.service, essay.id, context.userId);
    const draftImagePaths = extractDraftImagePaths(essay.draft);
    const assets = draftImagePaths.size > 0
      ? allAssets.filter((asset) => draftImagePaths.has(asset.object_path))
      : [];
    if (draftImagePaths.size > 0 && assets.length !== draftImagePaths.size) {
      throw new AppError(409, "image_not_ready", "One or more essay images are missing or not ready");
    }
    const imageHashes = assets.map((asset) => asset.content_hash.toLowerCase());
    const cacheKey = await buildCacheKey({
      ownerId: context.userId,
      operation: "grade",
      task: essay.task_type,
      subtype: essay.subtype,
      essayText: essay.body_text,
      promptText: essay.prompt_text,
      referenceData: essay.reference_data,
      imageHashes,
      feedbackLocale: essay.feedback_locale,
      targetBand: essay.target_band === null ? null : Number(essay.target_band),
      model,
      promptVersion: GRADING_PROMPT_VERSION,
      rubricVersion: RUBRIC_VERSION,
      schemaVersion: GRADING_SCHEMA_VERSION,
    });
    const inputHash = await buildRevisionInputHash({
      essayText: essay.body_text,
      promptText: essay.prompt_text,
      referenceData: essay.reference_data,
      feedbackLocale: essay.feedback_locale,
      model,
      imageHashes,
    });

    const revisionId = await deterministicUuid("essay-revision", context.userId, essay.id, input.idempotencyKey);
    const jobId = await deterministicUuid("ai-job", context.userId, essay.id, input.idempotencyKey);

    // Revision + job được tạo trong một transaction (public.submit_essay_job).
    // RPC chạy bằng user client nên auth.uid() = user_id trong database.
    const submitted = await context.userClient.rpc("submit_essay_job", {
      p_essay_id: essay.id,
      p_expected_version: input.expectedVersion,
      p_idempotency_key: input.idempotencyKey,
      p_mode: input.mode,
      p_model: model,
      p_cache_key: cacheKey,
      p_job_id: jobId,
      p_revision_id: revisionId,
      p_task_type: essay.task_type,
      p_subtype: essay.subtype,
      p_prompt_text: essay.prompt_text,
      p_body_text: essay.body_text,
      p_reference_data: essay.reference_data,
      p_feedback_locale: essay.feedback_locale,
      p_target_band: essay.target_band === null ? null : Number(essay.target_band),
      p_input_hash: inputHash,
      p_word_count: countWords(essay.body_text),
    });
    if (submitted.error) {
      const code = readRpcErrorCode(submitted.error);
      if (code === "too_many_ai_jobs") {
        throw new AppError(429, "too_many_ai_jobs", "Too many AI jobs are already running. Please wait.", 30);
      }
      if (code === "draft_conflict") {
        throw new AppError(409, "draft_conflict", "The essay changed. Reload it before submitting.");
      }
      if (code === "essay_not_found") {
        throw new AppError(404, "essay_not_found", "Essay not found");
      }
      if (code === "essay_not_active") {
        throw new AppError(409, "essay_not_active", "The essay is being deleted and cannot be submitted");
      }
      if (code === "essay_empty") {
        throw new AppError(400, "essay_empty", "The essay must contain text before submission");
      }
      if (code === "unauthenticated") {
        throw new AppError(401, "unauthenticated", "Authentication is required");
      }
      throw databaseError("queue the grading job");
    }

    const result = submitted.data as { revision_id: string; job_id: string; status: string; created: boolean };
    const revision = { id: result.revision_id, created: result.created };

    if (assets.length) {
      const links = assets.map((asset) => ({ revision_id: revision.id, asset_id: asset.id }));
      const linkResult = await context.service.from("revision_assets").upsert(links, { onConflict: "revision_id,asset_id" });
      if (linkResult.error) throw databaseError("link the essay images");
    }

    return jsonResponse(request, 202, {
      revisionId: revision.id,
      jobId: result.job_id,
      status: result.status,
    }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});

/** Bóc mã lỗi do private.raise_http_error() dựng trong RPC. */
function readRpcErrorCode(error: { message?: string; details?: string; code?: string } | null): string {
  if (!error) return "";
  const candidates = [error.message, error.details];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const trimmed = candidate.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      const parsed = JSON.parse(trimmed) as { code?: unknown };
      if (typeof parsed.code === "string") return parsed.code;
    } catch {
      // Không phải JSON — thử candidate tiếp theo.
    }
  }
  return error.code ?? "";
}

function extractDraftImagePaths(draft: unknown): Set<string> {
  const paths = new Set<string>();
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) return paths;
  const images = (draft as { images?: unknown }).images;
  if (!Array.isArray(images)) return paths;
  for (const image of images) {
    if (typeof image === "string") {
      paths.add(image);
      continue;
    }
    if (image && typeof image === "object" && typeof (image as { path?: unknown }).path === "string") {
      paths.add((image as { path: string }).path);
    }
  }
  return paths;
}
