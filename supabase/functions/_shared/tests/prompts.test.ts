import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildEnrichmentPrompt } from "../prompts.ts";

describe("enrichment prompt", () => {
  it("asks for the three new groups and passes the target band", () => {
    const prompt = buildEnrichmentPrompt({
      essayText: "text",
      gradingFeedback: { status: "ok" },
      feedbackLocale: "vi",
      taskType: "task2",
      targetBand: 7.5,
    });
    assert.match(prompt.system, /illogical|natural/i);
    assert.match(prompt.system, /vocabulary/i);
    assert.match(prompt.system, /target band/i);
    const payload = JSON.stringify(prompt.messages);
    assert.match(payload, /7.5/);
    assert.match(payload, /task2/);
  });

  it("keeps the grader from rescoring the essay", () => {
    const prompt = buildEnrichmentPrompt({
      essayText: "text",
      gradingFeedback: {},
      feedbackLocale: "en",
      taskType: "academic_task1",
      targetBand: null,
    });
    assert.match(prompt.system, /Do not rescore/);
  });
});
