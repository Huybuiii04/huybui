import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AiContractError, ENRICHMENT_SCHEMA_VERSION, validateEnrichmentOutput } from "../ai/enrich.ts";

const base = {
  structure: { paragraphs: [] },
  lexical: { examples: [] },
  grammar: { examples: [] },
  errors: [],
  unnatural: [{ quote: "q", issue: "i", suggestion: "s", severity: "major" }],
  vocabulary_plan: { topic: "Education", words: [{ word: "curriculum", meaning: "m", example: "e", why: "w" }] },
  band_plan: { current_band: 6, target_band: 7.5, steps: [{ title: "t", detail: "d", criterion: "lexical_resource", expected_gain: "+0.5" }] },
};

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
      unnatural: [{ quote: "a big problem", issue: "vague", suggestion: "a pressing threat", severity: "minor" }],
      vocabulary_plan: { topic: "Education", words: [{ word: "curriculum", meaning: "m", example: "e", why: "w" }] },
      band_plan: { current_band: 6, target_band: 7.5, steps: [{ title: "t", detail: "d", criterion: "lexical_resource", expected_gain: "+0.5" }] },
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

describe("enrichment v2 contract", () => {
  it("accepts the three new groups", () => {
    const output = validateEnrichmentOutput(base);
    assert.equal(output.unnatural.length, 1);
    assert.equal(output.vocabulary_plan.words[0].word, "curriculum");
    assert.equal(output.band_plan.steps.length, 1);
  });

  it("rejects an unknown severity", () => {
    assert.throws(
      () => validateEnrichmentOutput({ ...base, unnatural: [{ ...base.unnatural[0], severity: "huge" }] }),
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_enrichment",
    );
  });

  it("rejects a band plan without steps", () => {
    assert.throws(
      () => validateEnrichmentOutput({ ...base, band_plan: { current_band: 6, target_band: 7, steps: "none" } }),
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_enrichment",
    );
  });

  it("rejects a missing vocabulary plan", () => {
    assert.throws(
      () => validateEnrichmentOutput({ ...base, vocabulary_plan: undefined }),
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_enrichment",
    );
  });

  it("rejects a band plan with a non-numeric band", () => {
    assert.throws(
      () => validateEnrichmentOutput({ ...base, band_plan: { ...base.band_plan, current_band: "six" } }),
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_enrichment",
    );
  });

  it("bumps the schema version", () => {
    assert.equal(ENRICHMENT_SCHEMA_VERSION, "enrichment-v2");
  });
});
