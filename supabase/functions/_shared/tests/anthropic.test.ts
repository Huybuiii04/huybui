import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AnthropicError,
  buildStructuredSystemPrompt,
  classifyProviderError,
  extractTextContent,
  parseProviderBody,
  parseRetryAfter,
} from "../anthropic.ts";

describe("Anthropic response handling", () => {
  it("marks 429, 5xx, and network failures as retryable", () => {
    assert.equal(classifyProviderError(429).retryable, true);
    assert.equal(classifyProviderError(503).retryable, true);
    assert.equal(classifyProviderError(new AnthropicError("network", "network_error", true)).retryable, true);
  });

  it("marks configuration and request errors as permanent", () => {
    assert.equal(classifyProviderError(400).retryable, false);
    assert.equal(classifyProviderError(401).retryable, false);
    assert.equal(classifyProviderError(404).retryable, false);
  });

  it("honours Retry-After seconds and HTTP dates", () => {
    assert.equal(parseRetryAfter("17"), 17);
    assert.equal(parseRetryAfter("Wed, 21 Oct 2026 07:28:00 GMT", Date.parse("2026-10-21T07:27:30Z")), 30);
    assert.equal(parseRetryAfter(null), null);
  });

  it("extracts only text blocks from a Messages response", () => {
    const text = extractTextContent([
      { type: "thinking", thinking: "private" },
      { type: "text", text: "{\"ok\":true}" },
    ]);
    assert.equal(text, "{\"ok\":true}");
  });

  it("parses a plain JSON body", () => {
    assert.deepEqual(parseProviderBody('{"ok":true}'), { ok: true });
  });

  it("skips the proxy heartbeat that precedes the JSON body", () => {
    const body = parseProviderBody(': PING\n\n{"content":[{"type":"text","text":"hi"}]}');
    assert.deepEqual(body, { content: [{ type: "text", text: "hi" }] });
  });

  it("throws when there is no JSON at all", () => {
    assert.throws(() => parseProviderBody(": PING"), SyntaxError);
  });

  it("treats an empty body as an empty object", () => {
    assert.deepEqual(parseProviderBody(""), {});
  });
});

describe("structured output prompt mode", () => {
  it("appends the json contract to the system prompt", () => {
    const prompt = buildStructuredSystemPrompt("be nice", { type: "object" });
    assert.match(prompt, /be nice/);
    assert.match(prompt, /one JSON object/);
  });
});
