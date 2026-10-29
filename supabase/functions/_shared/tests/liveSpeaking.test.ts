import assert from "node:assert/strict";
import { test } from "node:test";
import { BRAIN_TIMEOUT_MS, callBrain, liveAnswerAudio } from "../ai/liveBrain.ts";

import {
  appendTranscript,
  buildLiveTurnPlan,
  countQuestions,
  cueCardScript,
  liveBrainUserPrompt,
  liveBrainSystemPrompt,
  LIVE_LIMITS,
  parseLiveBrainReply,
  partTiming,
  signLiveToken,
  speakableQuestion,
  transcriptToText,
  verifyLiveToken,
  type LiveTurnInput,
} from "../ai/liveSpeaking.ts";

const turn = (overrides: Partial<LiveTurnInput> & { turnId: string; part: LiveTurnInput["part"] }): LiveTurnInput => ({
  orderIndex: 0,
  promptText: "Prompt",
  questions: [],
  cueCard: null,
  ...overrides,
});

test("Part 1: mỗi câu hỏi là một bước, không có thời gian chuẩn bị", () => {
  const plan = buildLiveTurnPlan([
    turn({ turnId: "p1", part: "part-1", questions: ["Q1", "Q2", "Q3"] }),
  ]);
  assert.equal(plan[0].steps.length, 3);
  assert.deepEqual(plan[0].steps.map((step) => step.text), ["Q1", "Q2", "Q3"]);
  assert.equal(plan[0].prepMs, 0);
  assert.equal(plan[0].maxAnswerMs, 45_000);
});

test("Part 2: một bước duy nhất đọc cue card, 60s chuẩn bị và 2 phút nói", () => {
  const plan = buildLiveTurnPlan([
    turn({
      turnId: "p2",
      part: "part-2",
      questions: [],
      cueCard: { topic: "A memorable journey", bullets: ["Where you went", "Why you went"], time_limit_seconds: 120 },
    }),
  ]);
  assert.equal(plan[0].steps.length, 1);
  assert.equal(plan[0].steps[0].isCueCard, true);
  assert.equal(plan[0].prepMs, 60_000);
  assert.equal(plan[0].maxAnswerMs, 120_000);
  assert.match(plan[0].steps[0].text, /A memorable journey/);
  assert.match(plan[0].steps[0].text, /one minute to prepare/);
});

test("Part 3: mỗi câu hỏi là một bước, tối đa 90s mỗi câu", () => {
  const plan = buildLiveTurnPlan([turn({ turnId: "p3", part: "part-3", questions: ["A", "B"] })]);
  assert.equal(plan[0].steps.length, 2);
  assert.equal(plan[0].maxAnswerMs, 90_000);
});

test("câu hỏi rỗng thì lấy prompt_text làm câu hỏi duy nhất", () => {
  const plan = buildLiveTurnPlan([turn({ turnId: "x", part: "part-1", promptText: "Only prompt", questions: [] })]);
  assert.equal(plan[0].steps.length, 1);
  assert.equal(plan[0].steps[0].text, "Only prompt");
});

test("bỏ nhãn trong ngoặc vuông và dấu thừa khi đọc câu hỏi", () => {
  assert.equal(
    speakableQuestion("Is it important to you to eat healthy food? [Why?/Why not?]"),
    "Is it important to you to eat healthy food?",
  );
  assert.equal(speakableQuestion("Describe your hometown :"), "Describe your hometown");
  assert.equal(speakableQuestion("  Talk   about   work  "), "Talk about work");
});

test("câu hỏi trong đề Cambridge được làm sạch trước khi đọc", () => {
  const plan = buildLiveTurnPlan([
    turn({ turnId: "p1", part: "part-1", questions: ["Do you like healthy food? [Why?/Why not?]"] }),
  ]);
  assert.equal(plan[0].steps[0].text, "Do you like healthy food?");
});

test("không cắt quá số câu hỏi cho phép", () => {
  const many = Array.from({ length: 30 }, (_, index) => `Q${index}`);
  const plan = buildLiveTurnPlan([turn({ turnId: "x", part: "part-1", questions: many })]);
  assert.equal(plan[0].steps.length, LIVE_LIMITS.maxQuestionsPerPart);
});

test("đếm tổng số câu hỏi của cả phiên", () => {
  const plan = buildLiveTurnPlan([
    turn({ turnId: "p1", part: "part-1", questions: ["Q1", "Q2"] }),
    turn({ turnId: "p2", part: "part-2", cueCard: { topic: "T", bullets: [], time_limit_seconds: 120 } }),
    turn({ turnId: "p3", part: "part-3", questions: ["Q3"] }),
  ]);
  assert.equal(countQuestions(plan), 4);
});

test("luật thời gian theo từng phần", () => {
  assert.deepEqual(partTiming("part-1"), { prepMs: 0, maxAnswerMs: 45_000 });
  assert.deepEqual(partTiming("part-2"), { prepMs: 60_000, maxAnswerMs: 120_000 });
  assert.deepEqual(partTiming("part-3"), { prepMs: 0, maxAnswerMs: 90_000 });
});

test("cue card không có nội dung vẫn đọc được", () => {
  assert.equal(cueCardScript(null), "Here is your topic.");
});

test("token phiên ký và kiểm tra đúng", async () => {
  const secret = "test-secret";
  const now = 1_700_000_000_000;
  const token = await signLiveToken(secret, { sid: "session-1", uid: "user-1", exp: now + 60_000 });
  const payload = await verifyLiveToken(secret, token, { sessionId: "session-1", userId: "user-1" }, now);
  assert.ok(payload);
  assert.equal(payload.sid, "session-1");
  assert.equal(payload.uid, "user-1");
});

test("token sai chữ ký, sai phiên hoặc hết hạn đều bị từ chối", async () => {
  const secret = "test-secret";
  const now = 1_700_000_000_000;
  const token = await signLiveToken(secret, { sid: "session-1", uid: "user-1", exp: now + 60_000 });
  assert.equal(await verifyLiveToken("other-secret", token, { sessionId: "session-1", userId: "user-1" }, now), null);
  assert.equal(await verifyLiveToken(secret, token, { sessionId: "session-2", userId: "user-1" }, now), null);
  assert.equal(await verifyLiveToken(secret, token, { sessionId: "session-1", userId: "user-2" }, now), null);
  assert.equal(await verifyLiveToken(secret, token, { sessionId: "session-1", userId: "user-1" }, now + 120_000), null);
  assert.equal(await verifyLiveToken(secret, "garbage", { sessionId: "session-1", userId: "user-1" }, now), null);
});

test("câu trả lời của AI examiner được chuẩn hoá", () => {
  assert.deepEqual(parseLiveBrainReply({ ack: " Nice answer. ", followUp: " Why? ", advance: true }), {
    ack: "Nice answer.",
    followUp: "Why?",
    advance: true,
  });
  assert.deepEqual(parseLiveBrainReply({ ack: "", followUp: "", advance: false }), {
    ack: "",
    followUp: null,
    advance: false,
  });
  assert.deepEqual(parseLiveBrainReply(null), { ack: "", followUp: null, advance: false });
});

test("prompt gửi cho AI examiner luôn kèm câu hỏi kế tiếp và transcript", () => {
  const prompt = liveBrainUserPrompt({
    mode: "mock",
    part: "part-3",
    topic: "City life",
    asked: ["Q1", "Q2"],
    nextQuestion: "Q3",
    candidateAnswer: "I prefer the countryside.",
    transcript: "Examiner: Q1\nCandidate: I like cities.",
    allowFollowUp: true,
  });
  assert.match(prompt, /Next scripted question: Q3/);
  assert.match(prompt, /Questions already asked in this part/);
  assert.match(prompt, /Follow-up allowed: yes/);
  assert.match(prompt, /I prefer the countryside\./);
  assert.match(liveBrainSystemPrompt(), /Use the test plan for main questions/);
  assert.match(liveBrainSystemPrompt(), /followUp.*must be ONE short question/);
});

test("follow-up nghe audio khi thiếu transcript; lỗi và timeout không bị nuốt", async t => {
  const scope = globalThis as unknown as { Deno?: { env: { get: (key: string) => string | undefined } } };
  const original = scope.Deno;
  const env: Record<string, string> = { AI_API_BASE_URL: "https://fixture.invalid", AI_API_KEY: "fixture-key", AI_MODEL_LIVE: "gemini-3.8-flash" };
  scope.Deno = { env: { get: key => env[key] } };
  t.after(() => { scope.Deno = original; });
  const input = { mode: "part-1", part: "part-1", topic: "Festivals", asked: ["Which festival do you like?"], nextQuestion: "Q2", candidateAnswer: "", transcript: "", allowFollowUp: true } as const;
  const audio = liveAnswerAudio({ audioBase64: "YWJj", mimeType: "audio/webm" });
  let sent: Record<string, any> = {};
  let endpoint = "";
  let outcome = "ok";
  t.mock.method(globalThis, "fetch", async (url: string, options: RequestInit) => {
    endpoint = String(url);
    sent = JSON.parse(String(options.body));
    if (outcome === "timeout") return new Promise((_, reject) => options.signal!.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }));
    if (outcome === "error") return new Response("unavailable", { status: 503 });
    const reply = { ack: "", followUp: "Why do you enjoy that festival?", advance: false };
    if (outcome === "claude") return Response.json({ content: [{ type: "tool_use", input: reply }] });
    return Response.json({ candidates: [{ content: { parts: [{ thought: true, text: "private reasoning" }, { text: outcome === "invalid" ? "not JSON" : JSON.stringify(reply) }] } }] });
  });
  assert.equal((await callBrain(input, audio)).followUp, "Why do you enjoy that festival?");
  assert.deepEqual(sent.contents[0].parts[1].inlineData, audio);
  assert.deepEqual(sent.generationConfig.thinkingConfig, { thinkingLevel: "minimal" });
  assert.match(sent.contents[0].parts[0].text, /attached audio recording/);
  outcome = "error";
  await assert.rejects(callBrain(input, audio), { code: "brain_provider_error" });
  outcome = "invalid";
  await assert.rejects(callBrain(input, audio), { code: "brain_invalid_output" });
  outcome = "timeout";
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const timed = callBrain(input, audio);
  const timedCheck = assert.rejects(timed, { code: "brain_timeout" });
  t.mock.timers.tick(BRAIN_TIMEOUT_MS);
  await timedCheck;
  t.mock.timers.reset();
  env.AI_MODEL_LIVE = "claude-haiku-5-5";
  outcome = "claude";
  assert.ok((await callBrain({ ...input, candidateAnswer: "I enjoy local festivals." })).followUp);
  assert.equal(endpoint, "https://fixture.invalid/v1/messages", "Claude uses its text API instead of Gemini's endpoint");
  await assert.rejects(callBrain(input, audio), { code: "browser_transcription_required" });
});

test("audio của follow-up chặn payload sai và quá lớn", () => {
  assert.equal(liveAnswerAudio({}), undefined);
  for (const audioBase64 of [null, "", "not base64!", "YQ=", "A".repeat(5592408)]) {
    assert.throws(() => liveAnswerAudio({ audioBase64, mimeType: "audio/webm" }), { code: "invalid_request" });
  }
  assert.throws(() => liveAnswerAudio({ audioBase64: "YWJj", mimeType: "text/html" }), { code: "invalid_mime_type" });
});

test("transcript giữ nguyên thứ tự và bỏ lượt rỗng", () => {
  const entries = appendTranscript(
    appendTranscript([], { role: "examiner", text: "Q1", at: 0 }),
    { role: "candidate", text: "   ", at: 10 },
  );
  assert.equal(entries.length, 1);
  assert.equal(transcriptToText(entries), "Examiner: Q1");
});
