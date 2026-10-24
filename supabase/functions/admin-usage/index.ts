import { requireAdmin } from "../_shared/auth.ts";
import { databaseError, errorResponse, jsonResponse, preflightResponse, requestId, requireMethod } from "../_shared/http.ts";
import { parseUsageQuery } from "../_shared/schemas.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["GET"]);
    const context = await requireAdmin(request);
    const url = new URL(request.url);
    const input = parseUsageQuery({
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
    });

    const result = await context.service
      .from("ai_usage")
      .select("id,job_id,provider_request_id,model,input_tokens,output_tokens,cache_creation_tokens,cache_read_tokens,estimated_cost_usd,pricing_version,latency_ms,status,created_at")
      .gte("created_at", input.from)
      .lte("created_at", input.to)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (result.error) throw databaseError("load AI usage");

    const rows = result.data ?? [];
    const totals = rows.reduce((accumulator, row) => {
      accumulator.inputTokens += Number(row.input_tokens ?? 0);
      accumulator.outputTokens += Number(row.output_tokens ?? 0);
      accumulator.cacheCreationTokens += Number(row.cache_creation_tokens ?? 0);
      accumulator.cacheReadTokens += Number(row.cache_read_tokens ?? 0);
      accumulator.latencyMs += Number(row.latency_ms ?? 0);
      if (typeof row.estimated_cost_usd === "number") {
        accumulator.estimatedCostUsd += row.estimated_cost_usd;
      } else {
        accumulator.costComplete = false;
      }
      return accumulator;
    }, {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      estimatedCostUsd: 0,
      latencyMs: 0,
      costComplete: true,
    });

    const audit = await context.service.from("admin_audit_logs").insert({
      actor_id: context.userId,
      action: "admin.usage.read",
      target: input.from,
      metadata: { to: input.to, rowCount: rows.length },
    });
    if (audit.error) throw databaseError("write the admin audit log");

    return jsonResponse(request, 200, {
      rows,
      totals: {
        ...totals,
        estimatedCostUsd: totals.costComplete ? totals.estimatedCostUsd : null,
        costComplete: totals.costComplete,
      },
    }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
