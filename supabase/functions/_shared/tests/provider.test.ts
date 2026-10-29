import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractJson,
  parseProviderResponse,
  protocolCandidates,
  providerBody,
  providerEndpoint,
  providerHeaders,
  resolveProviderConfig,
  structuredInstruction,
} from "../provider.ts";

const config = (extra: Record<string, string | undefined> = {}) =>
  resolveProviderConfig({ AI_API_KEY: "secret", ...extra });

describe("provider configuration", () => {
  it("defaults to the official Anthropic endpoint", () => {
    const resolved = config();
    assert.equal(resolved.baseUrl, "https://api.anthropic.com");
    assert.equal(resolved.protocol, "auto");
    assert.equal(resolved.structuredMode, "tool");
  });

  it("falls back to ANTHROPIC_API_KEY when AI_API_KEY is absent", () => {
    const resolved = resolveProviderConfig({ ANTHROPIC_API_KEY: "legacy" });
    assert.equal(resolved.apiKey, "legacy");
  });

  it("reads the base url and trims trailing slashes", () => {
    const resolved = config({ AI_API_BASE_URL: "https://api.third-party.dev/" });
    assert.equal(resolved.baseUrl, "https://api.third-party.dev");
  });

  it("detects the protocol from the url and otherwise tries both", () => {
    assert.deepEqual(protocolCandidates(config({ AI_API_BASE_URL: "https://x.dev/v1/chat/completions" })), ["openai"]);
    assert.deepEqual(protocolCandidates(config({ AI_API_BASE_URL: "https://x.dev/v1/messages" })), ["anthropic"]);
    assert.deepEqual(protocolCandidates(config({ AI_API_BASE_URL: "https://x.dev" })), ["anthropic", "openai"]);
    assert.deepEqual(protocolCandidates(config({ AI_API_PROTOCOL: "openai" })), ["openai"]);
  });
});

describe("provider request shaping", () => {
  it("builds the anthropic endpoint and headers", () => {
    const resolved = config({ AI_API_BASE_URL: "https://x.dev" });
    assert.equal(providerEndpoint(resolved, "anthropic"), "https://x.dev/v1/messages");
    assert.equal(providerEndpoint(resolved, "openai"), "https://x.dev/v1/chat/completions");
    const headers = providerHeaders(resolved, "anthropic");
    assert.equal(headers["x-api-key"], "secret");
    assert.equal(headers["anthropic-version"], "2023-06-01");
  });

  it("keeps an endpoint that already carries its path", () => {
    const resolved = config({ AI_API_BASE_URL: "https://x.dev/v1/messages" });
    assert.equal(providerEndpoint(resolved, "anthropic"), "https://x.dev/v1/messages");
  });

  it("uses a bearer token for the openai protocol", () => {
    const headers = providerHeaders(config(), "openai");
    assert.equal(headers.Authorization, "Bearer secret");
  });

  it("moves the system prompt into a system message for openai", () => {
    const body = providerBody(config(), "openai", {
      model: "m",
      system: "be nice",
      messages: [{ role: "user", content: [{ type: "text", text: "hi" }] }],
      schema: { type: "object" },
      maxTokens: 100,
    });
    const messages = body.messages as Array<{ role: string; content: unknown }>;
    assert.equal(messages[0].role, "system");
    assert.equal(messages[0].content, "be nice");
    assert.equal(body.max_tokens, 100);
  });

  it("converts anthropic image blocks into openai image_url blocks", () => {
    const body = providerBody(config(), "openai", {
      model: "m",
      system: "",
      messages: [{ role: "user", content: [{ type: "image", source: { media_type: "image/png", data: "AAA" } }] }],
      schema: {},
      maxTokens: 10,
    });
    const messages = body.messages as Array<{ content: Array<Record<string, unknown>> }>;
    const block = messages[1].content[0];
    assert.equal(block.type, "image_url");
    assert.deepEqual(block.image_url, { url: "data:image/png;base64,AAA" });
  });

  it("omits structured-output hints in prompt mode", () => {
    const body = providerBody(config({ AI_STRUCTURED_MODE: "prompt" }), "anthropic", {
      model: "m",
      system: "",
      messages: [],
      schema: { type: "object" },
      maxTokens: 10,
    });
    assert.equal(body.output_config, undefined);
    assert.equal(body.tools, undefined);
  });

  it("asks for a tool call that carries the schema in tool mode", () => {
    const body = providerBody(config(), "anthropic", {
      model: "m",
      system: "",
      messages: [],
      schema: { type: "object" },
      maxTokens: 10,
    });
    assert.equal(body.output_config, undefined);
    const tools = body.tools as Array<{ name: string; input_schema: unknown }>;
    assert.equal(tools.length, 1);
    assert.equal(tools[0].name, "result");
    assert.deepEqual(tools[0].input_schema, { type: "object" });
    assert.deepEqual(body.tool_choice, { type: "tool", name: "result" });
  });
});

describe("provider response parsing", () => {
  it("reads an anthropic messages response", () => {
    const parsed = parseProviderResponse(
      {
        id: "msg_1",
        model: "claude-x",
        content: [{ type: "text", text: "{\"ok\":true}" }],
        stop_reason: "end_turn",
        usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: 5 },
      },
      new Headers(),
    );
    assert.equal(parsed.rawText, "{\"ok\":true}");
    assert.equal(parsed.usage.input_tokens, 10);
    assert.equal(parsed.usage.output_tokens, 20);
    assert.equal(parsed.usage.cache_read_input_tokens, 5);
    assert.equal(parsed.providerRequestId, "msg_1");
    assert.equal(parsed.truncated, false);
  });

  it("reads an openai chat completion response", () => {
    const parsed = parseProviderResponse(
      {
        id: "chatcmpl_1",
        model: "claude-x",
        choices: [{ message: { content: "{\"ok\":true}" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 11, completion_tokens: 21, prompt_tokens_details: { cached_tokens: 6 } },
      },
      new Headers(),
    );
    assert.equal(parsed.rawText, "{\"ok\":true}");
    assert.equal(parsed.usage.input_tokens, 11);
    assert.equal(parsed.usage.output_tokens, 21);
    assert.equal(parsed.usage.cache_read_input_tokens, 6);
  });

  it("flags a truncated openai response", () => {
    const parsed = parseProviderResponse(
      { choices: [{ message: { content: "partial" }, finish_reason: "length" }], usage: {} },
      new Headers(),
    );
    assert.equal(parsed.truncated, true);
  });

  it("reads the json carried by an anthropic tool_use block", () => {
    const parsed = parseProviderResponse(
      {
        id: "msg_2",
        model: "claude-x",
        content: [{ type: "tool_use", name: "result", input: { band: 7, steps: [] } }],
        stop_reason: "tool_use",
        usage: { input_tokens: 5, output_tokens: 9 },
      },
      new Headers(),
    );
    assert.deepEqual(JSON.parse(parsed.rawText), { band: 7, steps: [] });
  });

  it("returns empty text for an unknown shape", () => {
    const parsed = parseProviderResponse({ surprise: true }, new Headers());
    assert.equal(parsed.rawText, "");
  });
});

describe("json extraction", () => {
  it("parses plain json", () => {
    assert.deepEqual(extractJson("{\"a\":1}"), { a: 1 });
  });

  it("parses json wrapped in a code fence", () => {
    assert.deepEqual(extractJson("```json\n{\"a\":1}\n```"), { a: 1 });
  });

  it("parses json surrounded by prose", () => {
    assert.deepEqual(extractJson('Here you go:\n{"a":1}\nHope that helps.'), { a: 1 });
  });

  it("returns null for broken json", () => {
    assert.equal(extractJson("{not json"), null);
    assert.equal(extractJson(""), null);
  });

  it("describes the required json shape", () => {
    const instruction = structuredInstruction({ type: "object" });
    assert.match(instruction, /one JSON object/);
    assert.match(instruction, /"type":"object"/);
  });
});

describe("extractJson", () => {
  it("boc JSON ke trong code fence", () => {
    assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
  });

  it("boc JSON ke sau loi dan", () => {
    assert.deepEqual(extractJson('Day la ket qua:\n{"a":1}\nHet.'), { a: 1 });
  });

  it("boc tool call duoc proxy tra thanh text", () => {
    const text = '<tool_calls>[{"name":"result","arguments":{"a":1}}]</tool_calls>';
    assert.deepEqual(extractJson(text), { a: 1 });
  });

  it("bo qua dau ngoac trong chuoi", () => {
    assert.deepEqual(extractJson('x {"a":"}"} y'), { a: "}" });
  });

  it("tra null khi khong co JSON", () => {
    assert.equal(extractJson("khong co json"), null);
  });
});
