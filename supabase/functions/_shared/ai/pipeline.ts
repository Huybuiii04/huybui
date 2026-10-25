import type { SupabaseClient } from "@supabase/supabase-js";

import { AnthropicError, PRICING_VERSION, requestStructured } from "../anthropic.ts";
import { AppError, databaseError } from "../http.ts";
import { buildCacheKey, sha256Hex } from "../jobs.ts";
import { buildEnrichmentPrompt, buildGradingPrompt, buildToolPrompt, ENRICHMENT_PROMPT_VERSION, GRADING_PROMPT_VERSION, RUBRIC_VERSION, TOOL_PROMPT_VERSION } from "../prompts.ts";
import type { WritingToolOperation } from "../schemas.ts";
import { loadAssetImages, type EssayAssetRow } from "../storage.ts";
import { GRADING_JSON_SCHEMA, GRADING_SCHEMA_VERSION, buildGradingResult, type GradingModelOutput, type GradingResult } from "./grade.ts";
import { ENRICHMENT_JSON_SCHEMA, ENRICHMENT_SCHEMA_VERSION, coerceEnrichmentOutput } from "./enrich.ts";
import { TOOL_JSON_SCHEMAS, TOOL_SCHEMA_VERSION, validateToolOutput } from "./tools.ts";

interface ClaimedJob {
  job_id: string;
  user_id: string;
  revision_id: string | null;
  operation: "grade" | "enrich" | WritingToolOperation;
  payload: Record<string, unknown>;
  cache_key: string | null;
  attempts: number;
  lease_token: string;
}

interface RevisionRow {
  id: string;
  essay_id: string;
  user_id: string;
  task_type: string;
  subtype: string;
  prompt_text: string;
  essay_text: string;
  reference_data: string;
  feedback_locale: string;
  target_band: number | null;
}

export async function processOneAiJob(service: SupabaseClient): Promise<{ processed: number; failed: number }> {
  const claim = await service.rpc("claim_ai_job");
  if (claim.error) throw databaseError("claim an AI job");
  if (!claim.data) return { processed: 0, failed: 0 };

  const job = normalizeClaimedJob(claim.data);
  try {
    if (!isSupportedOperation(job.operation)) {
      throw new AppError(400, "invalid_job_operation", "The queued job has an unsupported operation");
    }

    const deferred = await deferIfConcurrencyLimit(service, job);
    if (deferred) return { processed: 0, failed: 0 };

    const targetActive = await targetIsActive(service, job);
    if (!targetActive) {
      await cancelClaimedJob(service, job);
      return { processed: 0, failed: 0 };
    }

    let resultId: string | null = null;
    let cacheHit = false;

    if (job.cache_key) {
      const cached = await useCachedResult(service, job);
      if (cached) {
        resultId = cached.resultId;
        cacheHit = true;
      }
    }

    if (!cacheHit) {
      if (job.operation === "grade") {
        resultId = await runGrading(service, job);
      } else if (job.operation === "enrich") {
        await runEnrichment(service, job);
      } else {
        resultId = await runWritingTool(service, job);
      }
    }

    if (!(await targetIsActive(service, job))) {
      await cancelClaimedJob(service, job);
      return { processed: 0, failed: 0 };
    }

    const completed = await completeClaimedJob(service, job, resultId);
    if (!completed) return { processed: 0, failed: 0 };

    if (job.operation === "grade" && job.revision_id) {
      await queueEnrichment(service, job);
    }

    return { processed: 1, failed: 0 };
  } catch (error) {
    const classification = classifyJobError(error);
    await insertErrorUsage(service, job).catch(() => undefined);
    const failed = await failClaimedJob(service, job, classification.code, classification.retry, classification.retryAfterSeconds);
    console.error(JSON.stringify({
      requestId: crypto.randomUUID(),
      jobId: job.job_id,
      operation: job.operation,
      errorCode: classification.code,
      retryable: classification.retry,
    }));
    return { processed: 0, failed: failed ? 1 : 0 };
  }
}

async function runGrading(service: SupabaseClient, job: ClaimedJob): Promise<string | null> {
  if (!job.revision_id) throw new AppError(400, "invalid_job_input", "The grading job has no revision");
  const existing = await service
    .from("grading_results")
    .select("id")
    .eq("revision_id", job.revision_id)
    .maybeSingle();
  if (existing.error) throw databaseError("load the grading result");
  if (existing.data) return existing.data.id;

  const revision = await loadRevision(service, job);
  const assets = await loadRevisionAssets(service, job.revision_id, job.user_id);
  const images = await loadAssetImages(service, assets);
  const model = modelForJob(job, "AI_MODEL_GRADING");

  let grading: GradingResult;
  let calls: Array<{ rawText: string; usage: { input_tokens: number; output_tokens: number; cache_creation_input_tokens: number; cache_read_input_tokens: number }; providerRequestId: string; model: string; latencyMs: number }> = [];

  if (missingReference(revision, assets)) {
    grading = buildGradingResult({
      status: "needs_reference",
      missing_reference: [missingReferenceMessage(revision)],
      summary: revision.feedback_locale === "en"
        ? "Reference data is required before this response can be graded."
        : "Cần có dữ liệu tham chiếu trước khi có thể chấm bài này.",
      strengths: [],
      priority_actions: [missingReferenceMessage(revision)],
      task_checks: [],
    }, { taskType: revision.task_type, essayText: revision.essay_text });
  } else {
    const prompt = buildGradingPrompt({
      taskType: revision.task_type,
      essayText: revision.essay_text,
      promptText: revision.prompt_text,
      referenceData: revision.reference_data,
      feedbackLocale: revision.feedback_locale,
      targetBand: revision.target_band,
      images,
    });
    const structured = await requestStructured<GradingResult>({
      model,
      system: prompt.system,
      messages: prompt.messages,
      schema: GRADING_JSON_SCHEMA as Record<string, unknown>,
      maxTokens: 6_000,
      repairInstruction: "Repair this grading output. Return exactly four task-appropriate criteria and valid JSON only.",
      validate: (value) => buildGradingResult(value as GradingModelOutput, {
        taskType: revision.task_type,
        essayText: revision.essay_text,
      }),
    });
    grading = structured.value;
    calls = structured.calls;
  }

  await insertUsageRows(service, job.job_id, calls);
  return await insertGradingResult(service, job.revision_id, revision, grading, model);
}

async function runEnrichment(service: SupabaseClient, job: ClaimedJob): Promise<void> {
  if (!job.revision_id) throw new AppError(400, "invalid_job_input", "The enrichment job has no revision");
  const existing = await service
    .from("essay_features")
    .select("revision_id, schema_version")
    .eq("revision_id", job.revision_id)
    .maybeSingle();
  if (existing.error) throw databaseError("load the essay features");
  // Chỉ bỏ qua khi đã có đúng phiên bản schema — bản cũ phải chạy lại để bổ sung nhóm mới.
  if (existing.data && existing.data.schema_version === ENRICHMENT_SCHEMA_VERSION) return;

  const revision = await loadRevision(service, job);
  const grading = await service
    .from("grading_results")
    .select("feedback")
    .eq("revision_id", job.revision_id)
    .maybeSingle();
  if (grading.error) throw databaseError("load the grading feedback");
  if (!grading.data) throw new AppError(400, "invalid_job_input", "The enrichment job has no grading result");

  const model = modelForJob(job, "AI_MODEL_EXTRACTION");
  const prompt = buildEnrichmentPrompt({
    essayText: revision.essay_text,
    gradingFeedback: grading.data.feedback,
    feedbackLocale: revision.feedback_locale,
    taskType: revision.task_type,
    targetBand: revision.target_band,
  });
  const structured = await requestStructured({
    model,
    system: prompt.system,
    messages: prompt.messages,
    schema: ENRICHMENT_JSON_SCHEMA as Record<string, unknown>,
    maxTokens: 16_000,
    repairInstruction: "Repair this enrichment output and return valid JSON only.",
    validate: coerceEnrichmentOutput,
  });
  await insertUsageRows(service, job.job_id, structured.calls);

  const featureWrite = await service.from("essay_features").upsert({
    revision_id: job.revision_id,
    model,
    structure: structured.value.structure,
    lexical: structured.value.lexical,
    grammar: structured.value.grammar,
    unnatural: structured.value.unnatural,
    vocabulary_plan: structured.value.vocabulary_plan,
    band_plan: structured.value.band_plan,
    schema_version: ENRICHMENT_SCHEMA_VERSION,
  }, { onConflict: "revision_id" });
  if (featureWrite.error) throw databaseError("save the essay features");

  for (const error of structured.value.errors) {
    if (!revision.essay_text.includes(error.quote)) continue;
    const fingerprint = await sha256Hex(`${error.criterion}|${error.category}|${error.quote}`);
    const errorWrite = await service.from("error_logs").upsert({
      user_id: job.user_id,
      revision_id: job.revision_id,
      fingerprint,
      criterion: error.criterion,
      category: error.category,
      quote: error.quote,
      correction: error.correction,
      explanation: error.explanation,
      skill_tags: error.skill_tags,
    }, { onConflict: "revision_id,fingerprint" });
    if (errorWrite.error) throw databaseError("save the error suggestions");
  }
}

async function runWritingTool(service: SupabaseClient, job: ClaimedJob): Promise<string | null> {
  const existing = await service
    .from("ai_tool_results")
    .select("id")
    .eq("job_id", job.job_id)
    .maybeSingle();
  if (existing.error) throw databaseError("load the writing-tool result");
  if (existing.data) return existing.data.id;

  const operation = job.operation as WritingToolOperation;
  const revision = job.revision_id ? await loadRevision(service, job) : null;
  const text = stringPayload(job.payload, "text");
  const promptText = stringPayload(job.payload, "prompt");
  const assetIds = stringArrayPayload(job.payload, "assetIds");
  const assets = await loadAssetsByIds(service, assetIds, job.user_id);
  const images = operation === "read-image" ? await loadAssetImages(service, assets) : [];
  const model = modelForJob(
    job,
    operation === "argument-stress-test" || operation === "critical-thinking"
      ? "AI_MODEL_GRADING"
      : "AI_MODEL_EXTRACTION",
  );

  const prompt = buildToolPrompt({
    operation,
    text,
    prompt: promptText,
    feedbackLocale: revision?.feedback_locale ?? stringPayload(job.payload, "feedbackLocale") ?? "vi",
    images,
  });
  const structured = await requestStructured({
    model,
    system: prompt.system,
    messages: prompt.messages,
    schema: TOOL_JSON_SCHEMAS[operation],
    maxTokens: operation === "read-image" ? 4_000 : 5_000,
    repairInstruction: "Repair this writing-tool output and return valid JSON only.",
    validate: (value) => validateToolOutput(operation, value),
  });
  await insertUsageRows(service, job.job_id, structured.calls);

  const resultWrite = await service.from("ai_tool_results").insert({
    job_id: job.job_id,
    user_id: job.user_id,
    operation,
    result: structured.value,
    schema_version: TOOL_SCHEMA_VERSION,
  }).select("id").maybeSingle();
  if (resultWrite.error || !resultWrite.data) throw databaseError("save the writing-tool result");
  return resultWrite.data.id;
}

async function useCachedResult(
  service: SupabaseClient,
  job: ClaimedJob,
): Promise<{ resultId: string | null } | null> {
  const source = await service
    .from("ai_jobs")
    .select("id,revision_id,result_id,payload")
    .eq("user_id", job.user_id)
    .eq("operation", job.operation)
    .eq("cache_key", job.cache_key!)
    .eq("status", "succeeded")
    .neq("id", job.job_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (source.error) throw databaseError("load the cached job");
  if (!source.data) return null;

  if (job.operation === "grade" && job.revision_id && source.data.result_id) {
    const grading = await service.from("grading_results").select("*").eq("id", source.data.result_id).maybeSingle();
    if (grading.error) throw databaseError("load the cached grading result");
    if (!grading.data) return null;
    const revision = await loadRevision(service, job);
    const resultId = await insertGradingResult(
      service,
      job.revision_id,
      revision,
      {
        status: grading.data.feedback?.status ?? "ok",
        scores: {
          task_achievement: grading.data.task_achievement,
          task_response: grading.data.task_response,
          coherence_ability: grading.data.coherence_ability,
          lexical_resource: grading.data.lexical_resource,
          grammatical_range: grading.data.grammatical_range,
        },
        overallRaw: grading.data.overall_raw,
        overallDisplay: grading.data.overall_display,
        feedback: grading.data.feedback,
      },
      grading.data.model,
      grading.data.prompt_version,
      grading.data.rubric_version,
      grading.data.schema_version,
    );
    await insertCacheUsage(service, job.job_id, grading.data.model);
    return { resultId };
  }

  if (job.operation === "enrich" && source.data.revision_id) {
    const features = await service.from("essay_features").select("*").eq("revision_id", source.data.revision_id).maybeSingle();
    if (features.error) throw databaseError("load the cached essay features");
    if (!features.data) return null;
    if (!job.revision_id) return null;
    const copy = await service.from("essay_features").upsert({
      revision_id: job.revision_id,
      model: features.data.model,
      structure: features.data.structure,
      lexical: features.data.lexical,
      grammar: features.data.grammar,
      schema_version: features.data.schema_version,
    }, { onConflict: "revision_id" }).select("model").maybeSingle();
    if (copy.error) throw databaseError("copy the cached essay features");
    const sourceErrors = await service
      .from("error_logs")
      .select("fingerprint,criterion,category,quote,correction,explanation,skill_tags")
      .eq("revision_id", source.data.revision_id);
    if (sourceErrors.error) throw databaseError("load the cached error suggestions");
    for (const sourceError of sourceErrors.data ?? []) {
      const copiedError = await service.from("error_logs").upsert({
        user_id: job.user_id,
        revision_id: job.revision_id,
        fingerprint: sourceError.fingerprint,
        criterion: sourceError.criterion,
        category: sourceError.category,
        quote: sourceError.quote,
        correction: sourceError.correction,
        explanation: sourceError.explanation,
        skill_tags: sourceError.skill_tags,
      }, { onConflict: "revision_id,fingerprint" });
      if (copiedError.error) throw databaseError("copy the cached error suggestions");
    }
    await insertCacheUsage(service, job.job_id, features.data.model);
    return { resultId: null };
  }

  if (job.operation !== "grade" && job.operation !== "enrich" && source.data.result_id) {
    const tool = await service.from("ai_tool_results").select("*").eq("id", source.data.result_id).maybeSingle();
    if (tool.error) throw databaseError("load the cached writing-tool result");
    if (!tool.data) return null;
    const copy = await service.from("ai_tool_results").insert({
      job_id: job.job_id,
      user_id: job.user_id,
      operation: tool.data.operation,
      result: tool.data.result,
      schema_version: tool.data.schema_version,
    }).select("id").maybeSingle();
    if (copy.error) throw databaseError("copy the cached writing-tool result");
    await insertCacheUsage(service, job.job_id, String((source.data.payload as Record<string, unknown> | null)?.model ?? ""));
    return { resultId: copy.data?.id ?? null };
  }

  return null;
}

async function insertGradingResult(
  service: SupabaseClient,
  revisionId: string,
  revision: RevisionRow,
  grading: GradingResult,
  model: string,
  promptVersion = GRADING_PROMPT_VERSION,
  rubricVersion = RUBRIC_VERSION,
  schemaVersion = GRADING_SCHEMA_VERSION,
): Promise<string> {
  const write = await service.from("grading_results").upsert({
    revision_id: revisionId,
    task_achievement: grading.scores.task_achievement,
    task_response: grading.scores.task_response,
    coherence_ability: grading.scores.coherence_ability,
    lexical_resource: grading.scores.lexical_resource,
    grammatical_range: grading.scores.grammatical_range,
    overall_raw: grading.overallRaw,
    overall_display: grading.overallDisplay,
    feedback: grading.feedback,
    model,
    prompt_version: promptVersion,
    rubric_version: rubricVersion,
    schema_version: schemaVersion,
  }, { onConflict: "revision_id", ignoreDuplicates: true }).select("id").maybeSingle();

  if (write.error) throw databaseError("save the grading result");
  if (write.data?.id) return write.data.id;

  const existing = await service.from("grading_results").select("id").eq("revision_id", revisionId).maybeSingle();
  if (existing.error || !existing.data) throw databaseError("load the saved grading result");
  return existing.data.id;
}

async function queueEnrichment(service: SupabaseClient, job: ClaimedJob): Promise<void> {
  if (!job.revision_id) return;
  const revision = await loadRevision(service, job);
  const assets = await loadRevisionAssets(service, job.revision_id, job.user_id);
  const grading = await service.from("grading_results").select("feedback").eq("revision_id", job.revision_id).maybeSingle();
  if (grading.error) throw databaseError("load the grading feedback");
  if (!grading.data) throw new AppError(400, "invalid_job_input", "The grading result does not exist");
  const model = requiredModel("AI_MODEL_EXTRACTION");
  const cacheKey = await buildCacheKey({
    ownerId: job.user_id,
    operation: "enrich",
    task: revision.task_type,
    subtype: revision.subtype,
    essayText: revision.essay_text,
    promptText: revision.prompt_text,
    referenceData: revision.reference_data,
    imageHashes: assets.map((asset) => asset.content_hash.toLowerCase()),
    feedbackLocale: revision.feedback_locale,
    targetBand: revision.target_band,
    model,
    promptVersion: ENRICHMENT_PROMPT_VERSION,
    rubricVersion: RUBRIC_VERSION,
    schemaVersion: ENRICHMENT_SCHEMA_VERSION,
    additionalData: grading.data.feedback,
  });
  const idempotencyKey = `enrich:${job.revision_id}:${ENRICHMENT_SCHEMA_VERSION}`;
  const result = await service.from("ai_jobs").upsert({
    user_id: job.user_id,
    revision_id: job.revision_id,
    operation: "enrich",
    payload: { revisionId: job.revision_id, sourceJobId: job.job_id, model },
    idempotency_key: idempotencyKey,
    cache_key: cacheKey,
    status: "queued",
    next_attempt_at: new Date().toISOString(),
  }, { onConflict: "user_id,idempotency_key", ignoreDuplicates: true });
  if (result.error) throw databaseError("queue the enrichment job");
}

async function insertUsageRows(
  service: SupabaseClient,
  jobId: string,
  calls: Array<{
    usage: { input_tokens: number; output_tokens: number; cache_creation_input_tokens: number; cache_read_input_tokens: number };
    providerRequestId: string;
    model: string;
    latencyMs: number;
  }>,
): Promise<void> {
  for (const call of calls) {
    const result = await service.from("ai_usage").insert({
      job_id: jobId,
      provider_request_id: call.providerRequestId,
      model: call.model,
      input_tokens: call.usage.input_tokens,
      output_tokens: call.usage.output_tokens,
      cache_creation_tokens: call.usage.cache_creation_input_tokens,
      cache_read_tokens: call.usage.cache_read_input_tokens,
      estimated_cost_usd: await estimateCost(
        service,
        call.model,
        call.usage.input_tokens,
        call.usage.output_tokens,
        call.usage.cache_creation_input_tokens,
        call.usage.cache_read_input_tokens,
      ),
      pricing_version: PRICING_VERSION,
      latency_ms: call.latencyMs,
      status: "ok",
    });
    if (result.error) throw databaseError("save the AI usage");
  }
}

/**
 * Chi phí theo bảng `ai_pricing`. Model chưa có giá => null (không ghi 0 giả).
 */
async function estimateCost(
  service: SupabaseClient,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheCreationTokens: number,
  cacheReadTokens: number,
): Promise<number | null> {
  const { data, error } = await service.rpc("estimate_ai_cost", {
    p_pricing_version: PRICING_VERSION,
    p_model: model,
    p_input_tokens: inputTokens,
    p_output_tokens: outputTokens,
    p_cache_creation_tokens: cacheCreationTokens,
    p_cache_read_tokens: cacheReadTokens,
  });
  if (error) return null;
  const value = data as number | null;
  return typeof value === "number" ? value : null;
}

async function insertCacheUsage(service: SupabaseClient, jobId: string, model: string): Promise<void> {
  const result = await service.from("ai_usage").insert({
    job_id: jobId,
    provider_request_id: "cache_hit",
    model: model || "cache",
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    estimated_cost_usd: null,
    pricing_version: PRICING_VERSION,
    latency_ms: 0,
    status: "ok",
  });
  if (result.error) throw databaseError("save the cache usage");
}

async function insertErrorUsage(service: SupabaseClient, job: ClaimedJob): Promise<void> {
  let model = stringPayload(job.payload, "model");
  if (!model) {
    const environment = job.operation === "grade" || job.operation === "argument-stress-test" || job.operation === "critical-thinking"
      ? "AI_MODEL_GRADING"
      : "AI_MODEL_EXTRACTION";
    model = requiredModel(environment);
  }
  const result = await service.from("ai_usage").insert({
    job_id: job.job_id,
    provider_request_id: "",
    model,
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    estimated_cost_usd: null,
    pricing_version: PRICING_VERSION,
    latency_ms: 0,
    status: "error",
  });
  if (result.error) throw databaseError("save the failed AI usage");
}

async function loadRevision(service: SupabaseClient, job: ClaimedJob): Promise<RevisionRow> {
  if (!job.revision_id) throw new AppError(400, "invalid_job_input", "The job has no revision");
  const result = await service
    .from("essay_revisions")
    .select("id,essay_id,user_id,task_type,subtype,prompt_text,essay_text,reference_data,feedback_locale,target_band")
    .eq("id", job.revision_id)
    .maybeSingle();
  if (result.error) throw databaseError("load the revision");
  if (!result.data) throw new AppError(400, "invalid_job_input", "The job revision no longer exists");
  if (result.data.user_id !== job.user_id) {
    throw new AppError(400, "invalid_job_input", "The job owner does not own the revision");
  }
  return result.data as RevisionRow;
}

async function loadRevisionAssets(
  service: SupabaseClient,
  revisionId: string,
  userId: string,
): Promise<EssayAssetRow[]> {
  const links = await service.from("revision_assets").select("asset_id").eq("revision_id", revisionId);
  if (links.error) throw databaseError("load the revision images");
  const assetIds = (links.data ?? []).map((link) => link.asset_id as string);
  return await loadAssetsByIds(service, assetIds, userId);
}

async function loadAssetsByIds(
  service: SupabaseClient,
  assetIds: string[],
  userId: string,
): Promise<EssayAssetRow[]> {
  if (!assetIds.length) return [];
  const result = await service
    .from("essay_assets")
    .select("id,user_id,essay_id,object_path,mime_type,byte_size,content_hash,status")
    .eq("user_id", userId)
    .in("id", assetIds)
    .eq("status", "ready");
  if (result.error) throw databaseError("load the essay images");
  return (result.data ?? []) as EssayAssetRow[];
}

async function targetIsActive(service: SupabaseClient, job: ClaimedJob): Promise<boolean> {
  let essayId: string | null = null;
  if (job.revision_id) {
    const revision = await service.from("essay_revisions").select("essay_id").eq("id", job.revision_id).maybeSingle();
    if (revision.error) throw databaseError("load the job target");
    if (!revision.data) return false;
    essayId = revision.data.essay_id as string;
  } else {
    essayId = stringPayload(job.payload, "essayId");
  }
  if (!essayId) return true;

  const essay = await service.from("essays").select("status").eq("id", essayId).maybeSingle();
  if (essay.error) throw databaseError("load the job target");
  if (!essay.data) return false;
  return essay.data.status === "active";
}

async function deferIfConcurrencyLimit(service: SupabaseClient, job: ClaimedJob): Promise<boolean> {
  const processing = await service
    .from("ai_jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", job.user_id)
    .eq("status", "processing");
  if (processing.error) throw databaseError("check concurrent AI jobs");
  if ((processing.count ?? 0) <= 2) return false;

  const result = await service.from("ai_jobs").update({
    status: "retry_wait",
    attempts: Math.max(0, job.attempts - 1),
    lease_token: null,
    lease_until: null,
    error_code: "concurrency_limit",
    next_attempt_at: new Date(Date.now() + 5_000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", job.job_id).eq("lease_token", job.lease_token).eq("status", "processing");
  if (result.error) throw databaseError("defer the AI job");
  return true;
}

async function cancelClaimedJob(service: SupabaseClient, job: ClaimedJob): Promise<void> {
  const result = await service.from("ai_jobs").update({
    status: "cancelled",
    lease_token: null,
    lease_until: null,
    error_code: "target_deleted",
    updated_at: new Date().toISOString(),
  }).eq("id", job.job_id).eq("lease_token", job.lease_token).eq("status", "processing");
  if (result.error) throw databaseError("cancel the AI job");
}

async function completeClaimedJob(
  service: SupabaseClient,
  job: ClaimedJob,
  resultId: string | null,
): Promise<boolean> {
  const result = await service.rpc("complete_ai_job", {
    p_job_id: job.job_id,
    p_lease_token: job.lease_token,
    p_result_id: resultId,
  });
  if (result.error) throw databaseError("complete the AI job");
  return result.data === true;
}

async function failClaimedJob(
  service: SupabaseClient,
  job: ClaimedJob,
  code: string,
  retry: boolean,
  retryAfterSeconds?: number,
): Promise<boolean> {
  const result = await service.rpc("fail_ai_job", {
    p_job_id: job.job_id,
    p_lease_token: job.lease_token,
    p_error_code: code,
    p_retry: retry,
    p_retry_after_seconds: retryAfterSeconds ?? null,
  });
  if (!result.error && result.data?.updated) return true;

  const fallback = await service.from("ai_jobs").update({
    status: retry ? "retry_wait" : "failed",
    attempts: job.attempts,
    lease_token: null,
    lease_until: null,
    error_code: code,
    next_attempt_at: new Date(Date.now() + (retryAfterSeconds ?? 10) * 1_000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", job.job_id).eq("lease_token", job.lease_token).eq("status", "processing");
  return !fallback.error;
}

function classifyJobError(error: unknown): { code: string; retry: boolean; retryAfterSeconds?: number } {
  if (error instanceof AnthropicError) {
    return {
      code: error.code,
      retry: error.retryable,
      retryAfterSeconds: error.retryAfterSeconds,
    };
  }
  if (error instanceof AppError) {
    return {
      code: error.code,
      retry: error.status >= 500 && error.code !== "server_misconfigured",
    };
  }
  if (error && typeof error === "object" && "code" in error && typeof (error as { code?: unknown }).code === "string") {
    return { code: (error as { code: string }).code, retry: false };
  }
  return { code: "internal_error", retry: true };
}

function normalizeClaimedJob(data: unknown): ClaimedJob {
  if (!data || typeof data !== "object") throw new AppError(500, "invalid_job", "The worker received an invalid job");
  const value = data as Record<string, unknown>;
  if (
    typeof value.job_id !== "string" ||
    typeof value.user_id !== "string" ||
    typeof value.operation !== "string" ||
    typeof value.lease_token !== "string"
  ) {
    throw new AppError(500, "invalid_job", "The worker received an invalid job");
  }
  return {
    job_id: value.job_id,
    user_id: value.user_id,
    revision_id: typeof value.revision_id === "string" ? value.revision_id : null,
    operation: value.operation as ClaimedJob["operation"],
    payload: value.payload && typeof value.payload === "object" ? value.payload as Record<string, unknown> : {},
    cache_key: typeof value.cache_key === "string" ? value.cache_key : null,
    attempts: typeof value.attempts === "number" ? value.attempts : 1,
    lease_token: value.lease_token,
  };
}

function isSupportedOperation(operation: string): boolean {
  return ["grade", "enrich", "magic-rewrite", "argument-stress-test", "critical-thinking", "read-image"].includes(operation);
}

function modelForJob(job: ClaimedJob, environment: string): string {
  const stored = stringPayload(job.payload, "model").trim();
  return stored || requiredModel(environment);
}

function requiredModel(environment: string): string {
  const deno = (globalThis as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno;
  const model = deno?.env?.get?.(environment)?.trim();
  if (!model) throw new AppError(503, "server_misconfigured", `The ${environment} model is not configured`);
  return model;
}

function missingReference(revision: RevisionRow, assets: EssayAssetRow[]): boolean {
  if (!revision.prompt_text.trim() && assets.length === 0) return true;
  if (revision.task_type === "academic_task1" && !revision.reference_data.trim() && assets.length === 0) return true;
  return false;
}

function missingReferenceMessage(revision: RevisionRow): string {
  const english = revision.feedback_locale === "en";
  if (!revision.prompt_text.trim() && revision.task_type !== "academic_task1") {
    return english ? "The task prompt is missing." : "Đề bài đang thiếu.";
  }
  if (revision.task_type === "academic_task1") {
    return english
      ? "The chart image or reference data is missing."
      : "Ảnh biểu đồ hoặc dữ liệu tham chiếu đang thiếu.";
  }
  return english ? "The task reference data is missing." : "Dữ liệu tham chiếu của đề đang thiếu.";
}

function stringPayload(payload: Record<string, unknown>, key: string): string {
  return typeof payload[key] === "string" ? payload[key] as string : "";
}

function stringArrayPayload(payload: Record<string, unknown>, key: string): string[] {
  const value = payload[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
