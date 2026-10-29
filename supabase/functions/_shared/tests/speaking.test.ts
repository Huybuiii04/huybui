import assert from "node:assert/strict";
import { test } from "node:test";

import { renderSpeakingRubric, speakingBandDescriptor, SPEAKING_CRITERIA } from "../ai/speakingRubric.ts";
import { buildSpeakingResult, parseAudioAnalysis, SPEAKING_JSON_SCHEMA } from "../ai/speaking.ts";

test("rubric có đủ 4 tiêu chí Speaking", () => {
  assert.deepEqual(
    [...SPEAKING_CRITERIA].sort(),
    ["fluency", "grammatical_range", "lexical_resource", "pronunciation"],
  );
});

test("mỗi tiêu chí có band 3 đến 9", () => {
  for (const criterion of SPEAKING_CRITERIA) {
    const bands = speakingBandDescriptor(criterion);
    assert.deepEqual(bands.map((band) => band.band), [9, 8, 7, 6, 5, 4, 3]);
  }
});

test("renderSpeakingRubric chứa 4 tiêu chí và ghi chú chính thức của IELTS", () => {
  const text = renderSpeakingRubric();
  for (const label of [
    "Fluency and Coherence",
    "Lexical Resource",
    "Grammatical Range and Accuracy",
    "Pronunciation",
  ]) {
    assert.ok(text.includes(label), `thiếu ${label}`);
  }
  assert.ok(text.includes("must fully fit the positive features"));
  assert.ok(text.includes("average performance across all parts"));
  for (const band of [9, 8, 7, 6, 5, 4, 3]) {
    assert.ok(text.includes(`BAND ${band}`), `thiếu BAND ${band}`);
  }
});

test("renderSpeakingRubric lọc theo khoảng band", () => {
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

test("schema bắt buộc đủ 4 tiêu chí mỗi turn", () => {
  const schema = SPEAKING_JSON_SCHEMA as unknown as {
    properties: { turns: { items: { properties: { criteria: { minItems: number; maxItems: number } } } } };
  };
  assert.equal(schema.properties.turns.items.properties.criteria.minItems, 4);
  assert.equal(schema.properties.turns.items.properties.criteria.maxItems, 4);
});

test("buildSpeakingResult reject khi thiếu tiêu chí", () => {
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

test("buildSpeakingResult reject score ngoài 0-9", () => {
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

test("buildSpeakingResult reject turn lạ", () => {
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

test("buildSpeakingResult tính band tổng bằng trung bình qua các turn", () => {
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

test("parseAudioAnalysis reject khi thiếu transcript", () => {
  assert.throws(() => parseAudioAnalysis({ fillerWords: [] } as never));
});

test("parseAudioAnalysis chấp nhận payload đầy đủ", () => {
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
