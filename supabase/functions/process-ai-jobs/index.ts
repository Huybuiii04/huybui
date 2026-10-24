import { getServiceClient, requireWorkerSecret } from "../_shared/auth.ts";
import { errorResponse, jsonResponse, preflightResponse, requestId, requireMethod } from "../_shared/http.ts";
import { processOneAiJob } from "../_shared/ai/pipeline.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    await requireWorkerSecret(request);
    const result = await processOneAiJob(getServiceClient());
    return jsonResponse(request, 200, result, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
