import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AiContractError, validateToolOutput } from "../ai/tools.ts";

describe("writing-tool contracts", () => {
  it("validates read-image output", () => {
    const output = validateToolOutput("read-image", {
      extracted_data: [{ label: "Sales", value: "42", unit: "percent", confidence: 0.9, source_quote: "Sales rose to 42%" }],
      unreadable: [],
      notes: "One series is clear.",
    });
    assert.equal(output.extracted_data.length, 1);
  });

  it("validates argument stress-test output", () => {
    const output = validateToolOutput("argument-stress-test", {
      claims: [{ claim: "Policy works", counterargument: "Selection effects", strength: "medium", question: "What would disprove it?" }],
      weaknesses: ["No causal mechanism"],
      summary: "The central claim needs evidence.",
    });
    assert.equal(output.claims.length, 1);
  });

  it("rejects an output shape from the wrong tool", () => {
    assert.throws(
      () => validateToolOutput("magic-rewrite", { extracted_data: [] }),
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_tool_output",
    );
  });
});
