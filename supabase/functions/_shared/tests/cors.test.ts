import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { corsHeaders, resolveAllowedOrigin } from "../cors.ts";

describe("CORS", () => {
  it("allows configured origins and rejects other origins", () => {
    assert.equal(resolveAllowedOrigin("https://app.example", "https://app.example,https://admin.example"), "https://app.example");
    assert.equal(resolveAllowedOrigin("https://evil.example", "https://app.example"), null);
  });

  it("supports a wildcard fallback", () => {
    assert.equal(resolveAllowedOrigin("https://app.example", "*"), "*");
  });

  it("sets preflight headers without credentials", () => {
    const headers = corsHeaders("https://app.example", "https://app.example");
    assert.equal(headers.get("Access-Control-Allow-Origin"), "https://app.example");
    assert.equal(headers.get("Access-Control-Allow-Credentials"), "false");
    assert.match(headers.get("Access-Control-Allow-Headers") ?? "", /Authorization/i);
  });
});
