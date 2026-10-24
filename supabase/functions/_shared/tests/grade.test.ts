import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AiContractError,
  buildGradingResult,
  type GradingModelOutput,
} from "../ai/grade.ts";

const validTask2Output: GradingModelOutput = {
  status: "ok",
  criteria: [
    {
      criterion: "task_response",
      score: 6.5,
      rationale: "The position is clear and mostly developed.",
      evidence: ["I agree with this view."],
      improvements: ["Develop the second body paragraph."],
    },
    {
      criterion: "coherence_ability",
      score: 6,
      rationale: "The progression is logical.",
      evidence: ["First, ... Second, ..."],
      improvements: ["Use clearer transitions."],
    },
    {
      criterion: "lexical_resource",
      score: 6.5,
      rationale: "The vocabulary is flexible.",
      evidence: ["This has a significant impact."],
      improvements: ["Avoid repeated generic nouns."],
    },
    {
      criterion: "grammatical_range",
      score: 6,
      rationale: "Most sentences are accurate.",
      evidence: ["Although it is difficult, I believe."],
      improvements: ["Vary complex sentence structures."],
    },
  ],
  summary: "A clear response with room for development.",
  strengths: ["Clear position"],
  priority_actions: ["Develop the second paragraph"],
  task_checks: [
    {
      requirement: "Discuss both views",
      status: "met",
      note: "Both views are mentioned.",
    },
  ],
};

describe("grading contract", () => {
  it("builds immutable scores and verified evidence for Task 2", () => {
    const essay = "I agree with this view. First, ... Second, ... This has a significant impact. Although it is difficult, I believe.";
    const result = buildGradingResult(validTask2Output, {
      taskType: "task2",
      essayText: essay,
    });

    assert.equal(result.status, "ok");
    assert.equal(result.scores.task_response, 6.5);
    assert.equal(result.scores.task_achievement, null);
    assert.equal(result.overallRaw, 6.25);
    assert.equal(result.overallDisplay, 6.5);
    assert.equal(result.feedback.criteria.task_response.evidence[0].start, 0);
    assert.equal(result.feedback.criteria.task_response.evidence[0].paragraphIndex, 0);
  });

  it("does not fabricate scores when reference data is missing", () => {
    const result = buildGradingResult(
      {
        status: "needs_reference",
        missing_reference: ["The chart or its data is missing."],
        summary: "Reference data is required.",
        strengths: [],
        priority_actions: ["Add the chart data."],
        task_checks: [],
      },
      { taskType: "academic_task1", essayText: "The chart shows..." },
    );

    assert.equal(result.status, "needs_reference");
    assert.equal(result.overallRaw, null);
    assert.equal(result.overallDisplay, null);
    assert.equal(result.scores.task_achievement, null);
  });

  it("rejects a criterion set that does not match the task", () => {
    assert.throws(
      () => buildGradingResult(validTask2Output, { taskType: "academic_task1", essayText: "Essay" }),
      (error: unknown) => error instanceof AiContractError && error.code === "criterion_mismatch",
    );
  });

  it("rejects partial scores and unsupported half-band values", () => {
    const invalid = structuredClone(validTask2Output);
    invalid.criteria[0].score = 6.25;
    assert.throws(
      () => buildGradingResult(invalid, { taskType: "task2", essayText: "Essay" }),
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_score",
    );
  });

  it("drops fabricated evidence instead of trusting model offsets", () => {
    const output = structuredClone(validTask2Output);
    output.criteria[0].evidence = ["not present in the essay"];
    const result = buildGradingResult(output, {
      taskType: "task2",
      essayText: "A completely different essay.",
    });
    assert.deepEqual(result.feedback.criteria.task_response.evidence, []);
  });
});
