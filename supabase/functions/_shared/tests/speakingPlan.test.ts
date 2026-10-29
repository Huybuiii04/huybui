import assert from "node:assert/strict";
import { test } from "node:test";

import { buildSpeakingPlan, type SpeakingQuestionRow } from "../ai/speakingPlan.ts";

const row = (overrides: Partial<SpeakingQuestionRow> & { id: string; part: SpeakingQuestionRow["part"] }): SpeakingQuestionRow => ({
  slug: overrides.id,
  topic: `Topic ${overrides.id}`,
  prompt_text: `Prompt ${overrides.id}`,
  questions: [`Question ${overrides.id}`],
  cue_card: null,
  related_part3_slug: null,
  sub_index: 0,
  ...overrides,
});

const setRows: SpeakingQuestionRow[] = [
  row({ id: "p1", part: "part-1" }),
  row({ id: "p2", part: "part-2", cue_card: { topic: "Cue", bullets: ["a"], time_limit_seconds: 120 } }),
  row({ id: "p3a", part: "part-3", sub_index: 0 }),
  row({ id: "p3b", part: "part-3", sub_index: 1 }),
];

test("part-1 lấy đúng dòng Part 1 của test", () => {
  const plan = buildSpeakingPlan({ mode: "part-1", question: null, questionRow: null, setRows, pool: { part1: [], part2: [], part3: [] } });
  assert.equal(plan.length, 1);
  assert.equal(plan[0].part, "part-1");
  assert.equal(plan[0].questionId, "p1");
  assert.equal(plan[0].orderIndex, 0);
});

test("part-2 lấy đúng dòng Part 2 của test", () => {
  const plan = buildSpeakingPlan({ mode: "part-2", question: null, questionRow: null, setRows, pool: { part1: [], part2: [], part3: [] } });
  assert.equal(plan.length, 1);
  assert.equal(plan[0].part, "part-2");
  assert.equal(plan[0].questionId, "p2");
});

test("part-3 mặc định lấy chủ đề A, ưu tiên dòng được chỉ định", () => {
  const fallback = buildSpeakingPlan({ mode: "part-3", question: null, questionRow: null, setRows, pool: { part1: [], part2: [], part3: [] } });
  assert.equal(fallback.length, 1);
  assert.equal(fallback[0].questionId, "p3a");

  const chosen = buildSpeakingPlan({
    mode: "part-3",
    question: null,
    questionRow: setRows[3],
    setRows,
    pool: { part1: [], part2: [], part3: [] },
  });
  assert.equal(chosen.length, 1);
  assert.equal(chosen[0].questionId, "p3b");
});

test("full 3 phần sinh 4 lượt theo thứ tự P1 → P2 → P3A → P3B", () => {
  const plan = buildSpeakingPlan({ mode: "mock", question: null, questionRow: null, setRows, pool: { part1: [], part2: [], part3: [] } });
  assert.equal(plan.length, 4);
  assert.deepEqual(plan.map((turn) => turn.part), ["part-1", "part-2", "part-3", "part-3"]);
  assert.deepEqual(plan.map((turn) => turn.questionId), ["p1", "p2", "p3a", "p3b"]);
  assert.deepEqual(plan.map((turn) => turn.orderIndex), [0, 1, 2, 3]);
});

test("full 3 phần vẫn chạy khi test chỉ có một chủ đề Part 3", () => {
  const plan = buildSpeakingPlan({
    mode: "mock",
    question: null,
    questionRow: null,
    setRows: [setRows[0], setRows[1], setRows[2]],
    pool: { part1: [], part2: [], part3: [] },
  });
  assert.equal(plan.length, 3);
  assert.deepEqual(plan.map((turn) => turn.part), ["part-1", "part-2", "part-3"]);
});

test("câu hỏi tự nhập chỉ dùng cho Part 1", () => {
  const plan = buildSpeakingPlan({
    mode: "part-1",
    question: "Describe your hometown",
    questionRow: null,
    setRows: [],
    pool: { part1: [], part2: [], part3: [] },
  });
  assert.equal(plan.length, 1);
  assert.equal(plan[0].questionId, null);
  assert.deepEqual(plan[0].questions, ["Describe your hometown"]);

  const notAllowed = buildSpeakingPlan({
    mode: "part-2",
    question: "Describe your hometown",
    questionRow: null,
    setRows: [],
    pool: { part1: [], part2: [], part3: [] },
  });
  assert.deepEqual(notAllowed, []);
});
