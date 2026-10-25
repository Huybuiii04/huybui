import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCacheKey,
  computeOverall,
  countWords,
  findQuote,
  sha256Hex,
  stableStringify,
  verifyEvidence,
} from "../jobs.ts";

const baseCacheInput = {
  ownerId: "owner-a",
  operation: "grade",
  task: "task2",
  essayText: "A First sentence. A second sentence.",
  promptText: "Discuss both views.",
  referenceData: "",
  imageHashes: ["image-hash"],
  feedbackLocale: "vi",
  targetBand: 7,
  model: "model-a",
  promptVersion: "prompt-v1",
  rubricVersion: "rubric-v1",
  schemaVersion: "schema-v1",
};

describe("job helpers", () => {
  it("builds a deterministic private cache key", async () => {
    const first = await buildCacheKey(baseCacheInput);
    const second = await buildCacheKey({ ...baseCacheInput });
    assert.equal(first, second);
    assert.match(first, /^[0-9a-f]{64}$/);

    const otherOwner = await buildCacheKey({ ...baseCacheInput, ownerId: "owner-b" });
    assert.notEqual(first, otherOwner);
  });

  it("does not lowercase or otherwise mutate essay text in the cache key", async () => {
    const uppercase = await buildCacheKey({ ...baseCacheInput, essayText: "IMPORTANT" });
    const lowercase = await buildCacheKey({ ...baseCacheInput, essayText: "important" });
    assert.notEqual(uppercase, lowercase);
  });

  it("hashes bytes with SHA-256", async () => {
    assert.equal(
      await sha256Hex("abc"),
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("sorts object keys without changing scalar values", () => {
    assert.equal(stableStringify({ b: 2, a: { d: 4, c: 3 } }), '{"a":{"c":3,"d":4},"b":2}');
  });

  it("calculates raw and half-band display scores in the backend", () => {
    assert.deepEqual(computeOverall([6, 6.5, 7, 7.5]), {
      overallRaw: 6.75,
      overallDisplay: 7,
    });
    assert.deepEqual(computeOverall([5, 5, 5, 5.5]), {
      overallRaw: 5.125,
      overallDisplay: 5,
    });
  });

  it("counts Unicode words without changing the source text", () => {
    assert.equal(countWords("Học việt nói, English works!"), 5);
  });

  it("verifies evidence as an exact substring and computes its own offsets", () => {
    const essay = "First paragraph.\n\nSecond paragraph has evidence.";
    const locations = verifyEvidence(essay, ["Second paragraph", "fabricated quote"]);
    assert.deepEqual(locations, [
      {
        text: "Second paragraph",
        start: 18,
        end: 34,
        paragraphIndex: 1,
      },
    ]);
  });
});

const essay = `The rise of remote work has transformed the modern workplace.

Workers no longer need to spend hours travelling to an office every day.

On balance, I believe that the advantages outweigh the drawbacks.`;

describe("finding quotes inside the essay", () => {
  it("finds an exact quote", () => {
    const found = findQuote(essay, "spend hours travelling");
    assert.ok(found);
    assert.equal(essay.slice(found.start, found.end), "spend hours travelling");
  });

  it("finds a quote that differs only in capitalisation", () => {
    const found = findQuote(essay, "ON BALANCE, I BELIEVE");
    assert.ok(found);
    assert.equal(essay.slice(found.start, found.end).startsWith("On balance"), true);
  });

  it("finds a quote that differs only in whitespace", () => {
    const found = findQuote(essay, "On balance,   I believe that the advantages outweigh the drawbacks.");
    assert.ok(found);
    assert.equal(
      essay.slice(found.start, found.end),
      "On balance, I believe that the advantages outweigh the drawbacks.",
    );
  });

  it("returns null for a quote that is not in the essay", () => {
    assert.equal(findQuote(essay, "completely different sentence"), null);
    assert.equal(findQuote(essay, "   "), null);
  });

  it("keeps the real essay text as the evidence", () => {
    const locations = verifyEvidence(essay, ["ON BALANCE, I BELIEVE"]);
    assert.equal(locations.length, 1);
    assert.equal(locations[0].text, "On balance, I believe");
  });
});
