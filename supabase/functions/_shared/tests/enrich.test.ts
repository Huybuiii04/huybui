import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AiContractError, ENRICHMENT_SCHEMA_VERSION, coerceEnrichmentOutput } from "../ai/enrich.ts";

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
    const output = coerceEnrichmentOutput({
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
    assert.equal(output.errors[0].quote, "significant impact");
  });

  it("keeps the parts that are usable when the model drops a group", () => {
    const output = coerceEnrichmentOutput({
      unnatural: [{ quote: "q", issue: "i", suggestion: "s", severity: "major" }],
      vocabulary_plan: { topic: "Education", words: [{ word: "curriculum", meaning: "m", example: "e", why: "w" }] },
      band_plan: { current_band: 6, target_band: 7.5, steps: [{ title: "t", detail: "d", criterion: "lexical_resource", expected_gain: "+0.5" }] },
    });

    assert.equal(output.unnatural.length, 1);
    assert.equal(output.vocabulary_plan.words.length, 1);
    assert.equal(output.band_plan.steps.length, 1);
    assert.deepEqual(output.structure.paragraphs, []);
    assert.deepEqual(output.errors, []);
  });

  it("drops only the broken items instead of the whole analysis", () => {
    const output = coerceEnrichmentOutput({
      ...base,
      unnatural: [
        { quote: "q", issue: "i", suggestion: "s", severity: "major" },
        { issue: "thiếu quote" },
      ],
      band_plan: { current_band: 6, target_band: 7.5, steps: [{ detail: "thiếu title" }] },
    });

    assert.equal(output.unnatural.length, 1);
    assert.equal(output.band_plan.steps.length, 0);
    assert.equal(output.band_plan.current_band, 6);
  });

  it("falls back to safe values for missing or malformed fields", () => {
    const output = coerceEnrichmentOutput({
      ...base,
      unnatural: [{ quote: "q", issue: "i", suggestion: "s", severity: "không rõ" }],
      band_plan: { current_band: "sáu", target_band: 7.5, steps: [{ title: "t" }] },
    });

    assert.equal(output.unnatural[0].severity, "minor");
    assert.equal(output.band_plan.current_band, null);
    assert.equal(output.band_plan.steps[0].detail, "");
  });

  it("never throws on garbage input", () => {
    const output = coerceEnrichmentOutput(null);
    assert.deepEqual(output.errors, []);
    assert.deepEqual(output.band_plan.steps, []);
    assert.equal(coerceEnrichmentOutput("nonsense").vocabulary_plan.topic, "");
  });

  it("bumps the schema version", () => {
    assert.equal(ENRICHMENT_SCHEMA_VERSION, "enrichment-v2");
  });

  it("still exposes a contract error type for other callers", () => {
    assert.throws(
      () => { throw new AiContractError("invalid_enrichment", "x"); },
      (error: unknown) => error instanceof AiContractError && error.code === "invalid_enrichment",
    );
  });
});
