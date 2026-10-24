import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AiContractError, validateEnrichmentOutput } from "../ai/enrich.ts";

describe("enrichment contract", () => {
  it("accepts features and verifiable error suggestions", () => {
    const output = validateEnrichmentOutput({
      structure: {
        paragraphs: [{ index: 0, role: "introduction", summary: "Introduces the position", link_to_next: "First body paragraph" }],
      },
      lexical: {
        examples: [{ term: "impact", meaning: "effect", evidence: "significant impact", correction: "significant effect" }],
      },
      grammar: {
        examples: [{ error: "Although it is difficult, I believe.", correction: "Although it is difficult, I believe that it has many benefits." }],
      },
      errors: [
        {
          fingerprint: "not-trusted",
          criterion: "lexical_resource",
          category: "word_choice",
          quote: "significant impact",
          correction: "significant effect",
          explanation: "More precise in this context.",
          skill_tags: ["precision"],
        },
      ],
    });

    assert.equal(output.structure.paragraphs.length, 1);
    assert.equal(output.errors.length, 1);
  });

  it("rejects malformed feature shapes", () => {
    assert.throws(
      () => validateEnrichmentOutput({ structure: {}, lexical: {}, grammar: {}, errors: [] }),
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_enrichment",
    );
  });
});
