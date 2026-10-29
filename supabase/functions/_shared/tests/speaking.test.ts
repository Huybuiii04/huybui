import assert from "node:assert/strict";
import { test } from "node:test";

import { renderSpeakingRubric, speakingBandDescriptor, SPEAKING_CRITERIA } from "../ai/speakingRubric.ts";
import { buildSpeakingResult, parseAudioAnalysis, remapTurnIds, SPEAKING_JSON_SCHEMA } from "../ai/speaking.ts";

test("rubric cÃ³ Ä‘á»§ 4 tiÃªu chÃ­ Speaking", () => {
  assert.deepEqual(
    [...SPEAKING_CRITERIA].sort(),
    ["fluency", "grammatical_range", "lexical_resource", "pronunciation"],
  );
});

test("má»—i tiÃªu chÃ­ cÃ³ band 3 Ä‘áº¿n 9", () => {
  for (const criterion of SPEAKING_CRITERIA) {
    const bands = speakingBandDescriptor(criterion);
    assert.deepEqual(bands.map((band) => band.band), [9, 8, 7, 6, 5, 4, 3]);
  }
});

test("renderSpeakingRubric chá»©a 4 tiÃªu chÃ­ vÃ  ghi chÃº chÃ­nh thá»©c cá»§a IELTS", () => {
  const text = renderSpeakingRubric();
  for (const label of [
    "Fluency and Coherence",
    "Lexical Resource",
    "Grammatical Range and Accuracy",
    "Pronunciation",
  ]) {
    assert.ok(text.includes(label), `thiáº¿u ${label}`);
  }
  assert.ok(text.includes("must fully fit the positive features"));
  assert.ok(text.includes("average performance across all parts"));
  for (const band of [9, 8, 7, 6, 5, 4, 3]) {
    assert.ok(text.includes(`BAND ${band}`), `thiáº¿u BAND ${band}`);
  }
});

test("renderSpeakingRubric lá»c theo khoáº£ng band", () => {
  const text = renderSpeakingRubric({ minBand: 5, maxBand: 8 });
  assert.ok(text.includes("BAND 8"));
  assert.ok(text.includes("BAND 5"));
  assert.ok(!text.includes("BAND 9"));
  assert.ok(!text.includes("BAND 4"));
});

const fullCriteria = (scores: Record<string, number>) =>
  (["fluency", "lexical_resource", "grammatical_range", "pronunciation"] as const).map((criterion) => ({
    criterion,
    score: scores[criterion] ?? 6,
    rationale: "rationale",
    evidence: [],
    improvements: [],
  }));

test("schema báº¯t buá»™c Ä‘á»§ 4 tiÃªu chÃ­ má»—i turn", () => {
  const schema = SPEAKING_JSON_SCHEMA as unknown as {
    properties: { turns: { items: { properties: { criteria: { minItems: number; maxItems: number } } } } };
  };
  assert.equal(schema.properties.turns.items.properties.criteria.minItems, 4);
  assert.equal(schema.properties.turns.items.properties.criteria.maxItems, 4);
});

test("buildSpeakingResult reject khi thiáº¿u tiÃªu chÃ­", () => {
  assert.throws(() =>
    buildSpeakingResult(
      {
        turns: [
          {
            turnId: "t1",
            criteria: [{ criterion: "fluency", score: 6, rationale: "ok", evidence: [], improvements: [] }],
            summary: "",
            strengths: [],
            priority_actions: [],
          },
        ],
        overall: { summary: "", priority_actions: [] },
      } as never,
      { turnIds: ["t1"] },
    ),
  );
});

test("buildSpeakingResult reject score ngoÃ i 0-9", () => {
  assert.throws(() =>
    buildSpeakingResult(
      {
        turns: [
          {
            turnId: "t1",
            criteria: fullCriteria({ fluency: 12 }),
            summary: "",
            strengths: [],
            priority_actions: [],
          },
        ],
        overall: { summary: "", priority_actions: [] },
      } as never,
      { turnIds: ["t1"] },
    ),
  );
});

test("buildSpeakingResult reject turn láº¡", () => {
  assert.throws(() =>
    buildSpeakingResult(
      {
        turns: [
          {
            turnId: "khac",
            criteria: fullCriteria({}),
            summary: "",
            strengths: [],
            priority_actions: [],
          },
        ],
        overall: { summary: "", priority_actions: [] },
      } as never,
      { turnIds: ["t1"] },
    ),
  );
});

test("buildSpeakingResult tÃ­nh band tá»•ng báº±ng trung bÃ¬nh qua cÃ¡c turn", () => {
  const result = buildSpeakingResult(
    {
      turns: [
        {
          turnId: "t1",
          criteria: fullCriteria({ fluency: 8, lexical_resource: 6, grammatical_range: 6, pronunciation: 6 }),
          summary: "",
          strengths: [],
          priority_actions: [],
        },
        {
          turnId: "t2",
          criteria: fullCriteria({ fluency: 6, lexical_resource: 6, grammatical_range: 6, pronunciation: 8 }),
          summary: "",
          strengths: [],
          priority_actions: [],
        },
      ],
      overall: { summary: "s", priority_actions: ["a"] },
    } as never,
    { turnIds: ["t1", "t2"] },
  );

  assert.equal(result.scores.fluency, 7);
  assert.equal(result.scores.pronunciation, 7);
  assert.equal(result.overallRaw, 6.5);
  assert.equal(result.overallDisplay, 6.5);
  assert.equal(result.overall.priority_actions.length, 1);
});

test("parseAudioAnalysis reject khi thiáº¿u transcript", () => {
  assert.throws(() => parseAudioAnalysis({ fillerWords: [] } as never));
});

test("parseAudioAnalysis cháº¥p nháº­n transcript rá»—ng", () => {
  const analysis = parseAudioAnalysis({
    transcript: "   ",
    fillerWords: [],
    mispronounced: [],
    intonationNotes: [],
    estimatedWpm: null,
    confidence: "low",
  });
  assert.equal(analysis.transcript, "");
});

test("parseAudioAnalysis cháº¥p nháº­n payload Ä‘áº§y Ä‘á»§", () => {
  const analysis = parseAudioAnalysis({
    transcript: "I live in Hanoi.",
    fillerWords: ["um"],
    mispronounced: [{ word: "Hanoi", issue: "rolled r" }],
    intonationNotes: ["flat"],
    estimatedWpm: 110,
    confidence: "high",
  });
  assert.equal(analysis.transcript, "I live in Hanoi.");
  assert.equal(analysis.estimatedWpm, 110);
});

test("remapTurnIds chuyen nhan tu dat cua model ve turnId that", () => {
  const ids = ["uuid-a", "uuid-b"];
  const remapped = remapTurnIds(
    {
      turns: [
        { turnId: "TURN 1 (part-1)", criteria: [], summary: "", strengths: [], priority_actions: [] },
        { turnId: "TURN 2 (part-3)", criteria: [], summary: "", strengths: [], priority_actions: [] },
      ],
      overall: { summary: "", priority_actions: [] },
    },
    ids,
  );
  assert.deepEqual(remapped.turns.map((turn) => turn.turnId), ["uuid-a", "uuid-b"]);
});

test("remapTurnIds giu nguyen ma don gian duoc gui cho model", () => {
  const ids = ["uuid-a", "uuid-b"];
  const remapped = remapTurnIds(
    {
      turns: [
        { turnId: "turn-1", criteria: [], summary: "", strengths: [], priority_actions: [] },
        { turnId: "turn-2", criteria: [], summary: "", strengths: [], priority_actions: [] },
      ],
      overall: { summary: "", priority_actions: [] },
    },
    ids,
  );
  assert.deepEqual(remapped.turns.map((turn) => turn.turnId), ["uuid-a", "uuid-b"]);
});

test("remapTurnIds khong ghi de turnId da dung", () => {
  const ids = ["uuid-a"];
  const remapped = remapTurnIds(
    {
      turns: [{ turnId: "uuid-a", criteria: [], summary: "", strengths: [], priority_actions: [] }],
      overall: { summary: "", priority_actions: [] },
    },
    ids,
  );
  assert.equal(remapped.turns[0].turnId, "uuid-a");
});

