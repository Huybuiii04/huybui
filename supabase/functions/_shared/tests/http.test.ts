import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { classifyAiError, parseAiErrorPayload } from "../../../../src/lib/aiLogic.ts";
import * as http from "../http.ts";
import { SchemaError } from "../schemas.ts";

const request = new Request("https://app.example/functions/submit-essay", { method: "POST" });

async function jsonBody(response: Response): Promise<Record<string, never>> {
  return (await response.json()) as Record<string, never>;
}

describe("edge error responses", () => {
  it("adds an actionable hint and keeps the code, request id and retry header", async () => {
    const id = "req-hint-1";
    const response = http.errorResponse(
      request,
      new http.AppError(429, "rate_limited", "Too many AI requests. Please retry in one minute.", 60),
      id,
    );
    const body = await jsonBody(response);

    assert.equal(response.status, 429);
    assert.equal(body.error.code, "rate_limited");
    assert.equal(body.error.message, "Too many AI requests. Please retry in one minute.");
    assert.equal(typeof body.error.hint, "string");
    assert.ok(body.error.hint.length > 0);
    assert.match(body.error.hint, /wait/i);
    assert.equal(body.error.requestId, id);
    assert.equal(body.requestId, id);
    assert.equal(body.error.retryAfter, 60);
    assert.equal(response.headers.get("x-request-id"), id);
    assert.equal(response.headers.get("retry-after"), "60");
  });

  it("keeps the previous shape when the code has no hint", async () => {
    const body = await jsonBody(
      http.errorResponse(request, new http.AppError(500, "internal_error", "An unexpected error occurred"), "req-hint-2"),
    );

    assert.equal(body.error.code, "internal_error");
    assert.equal("hint" in body.error, false);
    assert.deepEqual(Object.keys(body.error).sort(), ["code", "message", "requestId"]);
  });

  it("does not invent a hint for an unknown code", async () => {
    const body = await jsonBody(
      http.errorResponse(request, new http.AppError(400, "totally_unknown_code", "Unknown"), "req-hint-3"),
    );

    assert.equal("hint" in body.error, false);
  });

  it("does not pick up a hint from the object prototype", async () => {
    for (const code of ["constructor", "__proto__", "toString"]) {
      const body = await jsonBody(
        http.errorResponse(request, new http.AppError(400, code, "Unknown"), "req-hint-3b"),
      );

      assert.equal("hint" in body.error, false, `${code} must not get a hint`);
      assert.deepEqual(Object.keys(body.error).sort(), ["code", "message", "requestId"], code);
    }

    assert.equal(http.hintFor("constructor"), undefined);
    assert.equal(http.hintFor("__proto__"), undefined);
    assert.equal(http.hintFor("toString"), undefined);
    assert.equal(typeof http.hintFor("rate_limited"), "string");
  });

  it("tells the caller to sign in again when the session is missing", async () => {
    const body = await jsonBody(
      http.errorResponse(request, new http.AppError(401, "unauthenticated", "Authentication is required"), "req-hint-4"),
    );

    assert.equal(body.error.code, "unauthenticated");
    assert.match(body.error.hint, /sign in/i);
  });

  it("never leaks the message of an unexpected error", async () => {
    const secret = "SELECT * FROM private.secrets WHERE api_key = 'sk-live-abc123'";
    const response = http.errorResponse(request, new Error(secret), "req-hint-5");
    const text = await response.text();
    const body = JSON.parse(text) as { error: Record<string, unknown> };

    assert.equal(response.status, 500);
    assert.equal(body.error.code, "internal_error");
    assert.equal(body.error.message, "An unexpected error occurred");
    assert.equal(text.includes(secret), false);
    assert.equal(text.includes("sk-live-abc123"), false);
    assert.equal(text.includes("private.secrets"), false);
    assert.equal(text.includes("stack"), false);
    assert.equal("stack" in body.error, false);
  });

  it("maps a schema error to invalid_request", () => {
    const normalized = http.normalizeError(new SchemaError("mode", "mode is required"));

    assert.equal(normalized.status, 400);
    assert.equal(normalized.code, "invalid_request");
    assert.equal(normalized.message, "mode is required");
  });

  it("answers with a JSON content type", () => {
    const response = http.errorResponse(request, new http.AppError(400, "invalid_request", "Bad request"), "req-hint-6");

    assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
  });

  it("keeps the frontend error parsing working when the body carries a hint", async () => {
    const response = http.errorResponse(
      request,
      new http.AppError(429, "rate_limited", "Too many AI requests. Please retry in one minute.", 60),
      "req-hint-7",
    );
    const text = await response.text();

    const parsed = parseAiErrorPayload({ message: text, status: response.status });
    assert.equal(parsed.code, "rate_limited");
    assert.equal(parsed.message, "Too many AI requests. Please retry in one minute.");
    assert.equal(parsed.status, 429);

    const fromContext = parseAiErrorPayload({ context: JSON.parse(text), status: response.status });
    assert.equal(fromContext.code, "rate_limited");
    assert.equal(fromContext.message, "Too many AI requests. Please retry in one minute.");

    assert.equal(classifyAiError({ message: text, status: response.status }), "rate_limited");
  });

  it("keeps every hint short, single-line and free of internal details", () => {
    const codes = Object.keys(http.ERROR_HINTS);
    assert.ok(codes.length > 0);

    for (const [code, hint] of Object.entries(http.ERROR_HINTS)) {
      assert.match(code, /^[a-z_]+$/);
      assert.equal(typeof hint, "string");
      assert.equal(hint.trim(), hint);
      assert.equal(hint.includes("\n"), false);
      assert.ok(hint.length > 0, `${code} needs a hint`);
      assert.ok(hint.length <= 90, `${code} hint is too long: ${hint}`);
      assert.equal(
        /\b(select\s+.+\s+from|insert\s+into|update\s+\w+\s+set|delete\s+from)\b/i.test(hint),
        false,
        `${code} hint leaks SQL: ${hint}`,
      );
    }
  });
});
