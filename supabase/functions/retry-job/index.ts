import { requireAuthenticatedUser } from "../_shared/auth.ts";
import { AppError, databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { parseRetryJob } from "../_shared/schemas.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAuthenticatedUser(request);
    const input = parseRetryJob(await readJsonBody(request));

    const jobResult = await context.service
      .from("ai_jobs")
      .select("id,status")
      .eq("id", input.jobId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (jobResult.error) throw databaseError("load the job");
    if (!jobResult.data) throw new AppError(404, "job_not_found", "Job not found");

    if (jobResult.data.status !== "failed") {
      if (["queued", "retry_wait", "processing", "succeeded"].includes(jobResult.data.status)) {
        return jsonResponse(request, 200, {
          jobId: jobResult.data.id,
          status: jobResult.data.status,
        }, { requestId: id });
      }
      throw new AppError(409, "job_not_retryable", "Only failed jobs can be retried");
    }

    const retry = await context.service
      .from("ai_jobs")
      .update({
        status: "queued",
        attempts: 0,
        error_code: null,
        lease_token: null,
        lease_until: null,
        next_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.jobId)
      .eq("user_id", context.userId)
      .eq("status", "failed")
      .select("id,status")
      .maybeSingle();
    if (retry.error) throw databaseError("retry the job");

    if (!retry.data) {
      const current = await context.service
        .from("ai_jobs")
        .select("id,status")
        .eq("id", input.jobId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (current.error) throw databaseError("load the retried job");
      if (!current.data) throw new AppError(404, "job_not_found", "Job not found");
      return jsonResponse(request, 200, { jobId: current.data.id, status: current.data.status }, { requestId: id });
    }

    return jsonResponse(request, 202, {
      jobId: retry.data.id,
      status: retry.data.status,
    }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
