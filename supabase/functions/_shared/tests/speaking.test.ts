import assert from "node:assert/strict";
import { test } from "node:test";

import { renderSpeakingRubric, speakingBandDescriptor, SPEAKING_CRITERIA } from "../ai/speakingRubric.ts";

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
