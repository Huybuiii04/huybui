import { requireAdmin, requireAdminToken } from "../_shared/auth.ts";
import { AppError, databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Thao tác quản trị ghi (lớp 2): xoá bài viết, ẩn/hiện đề, sửa từ vựng,
 * retry job AI và số liệu tổng quan. Mọi thao tác đều ghi admin_audit_logs.
 */

type Body = { action?: unknown } & Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

async function audit(service: SupabaseClient, actorId: string, action: string, target: string, metadata: Record<string, unknown> = {}) {
  const result = await service.from("admin_audit_logs").insert({ actor_id: actorId, action, target, metadata });
  if (result.error) throw databaseError("write the admin audit log");
}

async function dashboard(service: SupabaseClient) {
  const now = Date.now();
  const sevenDays = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDays = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [profiles, access, essays, revisions, jobs, usage, prompts] = await Promise.all([
    service.from("profiles").select("id,display_name,created_at").limit(5000),
    service.from("user_access").select("user_id,role,status").limit(5000),
    service.from("essays").select("id,user_id,prompt_text,task_type,created_at").limit(20000),
    service.from("essay_revisions").select("id,created_at").limit(30000),
    service.from("ai_jobs").select("id,status,error_code,operation,user_id,created_at").limit(5000),
    service.from("ai_usage").select("input_tokens,output_tokens,estimated_cost_usd,status").gte("created_at", thirtyDays).limit(30000),
    service.from("prompts").select("slug,task,title_vi,title_en,text,status").limit(5000),
  ]);

  for (const [name, result] of [["profiles", profiles], ["user_access", access], ["essays", essays], ["essay_revisions", revisions], ["ai_jobs", jobs], ["ai_usage", usage], ["prompts", prompts]] as const) {
    if (result.error) throw databaseError(`load ${name}`);
  }

  const profileRows = profiles.data ?? [];
  const accessRows = access.data ?? [];
  const essayRows = essays.data ?? [];
  const jobRows = jobs.data ?? [];
  const usageRows = usage.data ?? [];
  const promptRows = prompts.data ?? [];

  const displayName = new Map(profileRows.map(row => [row.id as string, (row.display_name as string) || ""]));
  const essaysByUser = new Map<string, number>();
  const essaysByPrompt = new Map<string, number>();
  for (const essay of essayRows) {
    const userId = essay.user_id as string;
    essaysByUser.set(userId, (essaysByUser.get(userId) ?? 0) + 1);
    const key = normalize((essay.prompt_text as string) || "");
    if (key) essaysByPrompt.set(key, (essaysByPrompt.get(key) ?? 0) + 1);
  }

  const topUsers = [...essaysByUser.entries()]
    .map(([userId, essaysCount]) => ({ userId, displayName: displayName.get(userId) || "", essays: essaysCount }))
    .sort((left, right) => right.essays - left.essays)
    .slice(0, 5);

  const promptStats = promptRows.map(prompt => {
    const count = essaysByPrompt.get(normalize((prompt.text as string) || "")) ?? 0;
    return {
      slug: prompt.slug as string,
      task: prompt.task as string,
      titleVi: (prompt.title_vi as string) || "",
      titleEn: (prompt.title_en as string) || "",
      status: prompt.status as string,
      essays: count,
    };
  });

  const topPrompts = [...promptStats].sort((left, right) => right.essays - left.essays).slice(0, 5);
  const untouched = promptStats.filter(prompt => prompt.status === "published" && prompt.essays === 0).slice(0, 5);

  const jobStatus = { queued: 0, processing: 0, succeeded: 0, retry_wait: 0, failed: 0, cancelled: 0 };
  for (const job of jobRows) {
    const status = job.status as keyof typeof jobStatus;
    if (status in jobStatus) jobStatus[status] += 1;
  }

  const usageTotals = usageRows.reduce((accumulator, row) => {
    accumulator.jobs += 1;
    accumulator.inputTokens += count(row.input_tokens);
    accumulator.outputTokens += count(row.output_tokens);
    if (typeof row.estimated_cost_usd === "number") {
      accumulator.costUsd += row.estimated_cost_usd;
      accumulator.costComplete = true;
    }
    return accumulator;
  }, { jobs: 0, inputTokens: 0, outputTokens: 0, costUsd: 0, costComplete: true });

  return {
    users: {
      total: profileRows.length,
      new7d: profileRows.filter(row => (row.created_at as string) >= sevenDays).length,
      admins: accessRows.filter(row => row.role === "admin").length,
      suspended: accessRows.filter(row => row.status === "suspended").length,
    },
    essays: {
      total: essayRows.length,
      new7d: essayRows.filter(row => (row.created_at as string) >= sevenDays).length,
      distinctPrompts: essaysByPrompt.size,
    },
    revisions: { total: (revisions.data ?? []).length },
    jobs: jobStatus,
    usage: usageTotals,
    topUsers,
    topPrompts,
    untouchedPrompts: untouched,
  };
}

async function deleteEssay(service: SupabaseClient, actorId: string, essayId: string) {
  const target = await service.from("essays").select("id,user_id,title").eq("id", essayId).maybeSingle();
  if (target.error) throw databaseError("load the essay");
  if (!target.data) throw new AppError(404, "essay_not_found", "Essay not found");
  const removed = await service.from("essays").delete().eq("id", essayId).select("id").maybeSingle();
  if (removed.error) throw databaseError("delete the essay");
  await audit(service, actorId, "admin.essay.delete", essayId, { userId: target.data.user_id, title: target.data.title });
  return { deleted: true, essayId };
}

async function setPromptStatus(service: SupabaseClient, actorId: string, slug: string, status: string) {
  if (!["published", "hidden"].includes(status)) throw new AppError(400, "invalid_status", "Status must be published or hidden");
  const updated = await service.from("prompts").update({ status }).eq("slug", slug).select("slug,status").maybeSingle();
  if (updated.error) throw databaseError("update the prompt");
  if (!updated.data) throw new AppError(404, "prompt_not_found", "Prompt not found");
  await audit(service, actorId, "admin.prompt.status", slug, { status });
  return { slug: updated.data.slug, status: updated.data.status };
}

async function updateVocabulary(service: SupabaseClient, actorId: string, payload: Body) {
  const id = text(payload.id);
  if (!id) throw new AppError(400, "invalid_request", "id is required");
  const patch: Record<string, unknown> = {};
  if (typeof payload.meaning === "string") patch.meaning = payload.meaning.trim();
  if (typeof payload.definition === "string") patch.definition = payload.definition.trim();
  if (typeof payload.ipa === "string") patch.ipa = payload.ipa.trim();
  if (!Object.keys(patch).length) throw new AppError(400, "invalid_request", "Nothing to update");
  patch.updated_at = new Date().toISOString();
  const updated = await service.from("vocabulary_entries").update(patch).eq("id", id).select("id,term,meaning,definition,ipa").maybeSingle();
  if (updated.error) throw databaseError("update the vocabulary entry");
  if (!updated.data) throw new AppError(404, "entry_not_found", "Vocabulary entry not found");
  await audit(service, actorId, "admin.vocabulary.update", id, { term: updated.data.term });
  return updated.data;
}

async function deleteVocabulary(service: SupabaseClient, actorId: string, payload: Body) {
  const id = text(payload.id);
  if (!id) throw new AppError(400, "invalid_request", "id is required");
  const current = await service.from("vocabulary_entries").select("id,term,topic_key").eq("id", id).maybeSingle();
  if (current.error) throw databaseError("load the vocabulary entry");
  if (!current.data) throw new AppError(404, "entry_not_found", "Vocabulary entry not found");
  const removed = await service.from("vocabulary_entries").delete().eq("id", id).select("id").maybeSingle();
  if (removed.error) throw databaseError("delete the vocabulary entry");
  await audit(service, actorId, "admin.vocabulary.delete", id, { term: current.data.term, topic: current.data.topic_key });
  return { deleted: true, id };
}

async function createVocabulary(service: SupabaseClient, actorId: string, payload: Body) {
  const topicKey = text(payload.topicKey);
  const term = text(payload.term);
  if (!topicKey || !term) throw new AppError(400, "invalid_request", "topicKey and term are required");
  const examples = Array.isArray(payload.examples)
    ? payload.examples.filter((item): item is string => typeof item === "string").slice(0, 5)
    : [];
  const inserted = await service.from("vocabulary_entries").insert({
    topic_key: topicKey,
    term,
    pos: text(payload.pos),
    meaning: text(payload.meaning),
    definition: text(payload.definition),
    examples,
    ipa: text(payload.ipa) || null,
    sort_order: 0,
  }).select("id,term,topic_key").maybeSingle();
  if (inserted.error) throw databaseError("create the vocabulary entry");
  if (!inserted.data) throw new AppError(500, "internal_error", "Could not create the vocabulary entry");
  await audit(service, actorId, "admin.vocabulary.create", inserted.data.id, { term: inserted.data.term, topic: inserted.data.topic_key });
  return inserted.data;
}

async function retryJob(service: SupabaseClient, actorId: string, jobId: string) {
  const retried = await service.from("ai_jobs").update({
    status: "queued",
    attempts: 0,
    error_code: null,
    lease_token: null,
    lease_until: null,
    next_attempt_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", jobId).eq("status", "failed").select("id,status").maybeSingle();
  if (retried.error) throw databaseError("retry the job");
  if (!retried.data) {
    const current = await service.from("ai_jobs").select("id,status").eq("id", jobId).maybeSingle();
    if (current.error) throw databaseError("load the job");
    if (!current.data) throw new AppError(404, "job_not_found", "Job not found");
    throw new AppError(409, "job_not_retryable", "Only failed jobs can be retried");
  }
  await audit(service, actorId, "admin.job.retry", jobId, {});
  return { jobId: retried.data.id, status: retried.data.status };
}

async function retryFailedJobs(service: SupabaseClient, actorId: string) {
  const failed = await service.from("ai_jobs").select("id").eq("status", "failed").limit(500);
  if (failed.error) throw databaseError("load the failed jobs");
  const ids = (failed.data ?? []).map(row => row.id as string);
  if (!ids.length) return { retried: 0 };
  const retried = await service.from("ai_jobs").update({
    status: "queued",
    attempts: 0,
    error_code: null,
    lease_token: null,
    lease_until: null,
    next_attempt_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).in("id", ids).select("id");
  if (retried.error) throw databaseError("retry the failed jobs");
  await audit(service, actorId, "admin.job.retry_failed", "batch", { count: (retried.data ?? []).length });
  return { retried: (retried.data ?? []).length };
}

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAdmin(request);
    await requireAdminToken(request, context);

    const body = await readJsonBody(request) as Body;
    const action = text(body.action);
    const service = context.service;

    switch (action) {
      case "dashboard":
        return jsonResponse(request, 200, await dashboard(service), { requestId: id });
      case "delete_essay":
        return jsonResponse(request, 200, await deleteEssay(service, context.userId, text(body.essayId)), { requestId: id });
      case "prompt_set_status":
        return jsonResponse(request, 200, await setPromptStatus(service, context.userId, text(body.slug), text(body.status)), { requestId: id });
      case "vocabulary_update":
        return jsonResponse(request, 200, await updateVocabulary(service, context.userId, body), { requestId: id });
      case "vocabulary_delete":
        return jsonResponse(request, 200, await deleteVocabulary(service, context.userId, body), { requestId: id });
      case "vocabulary_create":
        return jsonResponse(request, 200, await createVocabulary(service, context.userId, body), { requestId: id });
      case "job_retry":
        return jsonResponse(request, 202, await retryJob(service, context.userId, text(body.jobId)), { requestId: id });
      case "jobs_retry_failed":
        return jsonResponse(request, 202, await retryFailedJobs(service, context.userId), { requestId: id });
      default:
        throw new AppError(400, "invalid_action", `Unknown admin action: ${action || "(empty)"}`);
    }
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
