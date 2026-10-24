import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { constantTimeEqual, detectImageMimeType } from "../security.ts";

describe("edge security helpers", () => {
  it("compares equal and unequal secrets without a length shortcut", async () => {
    assert.equal(await constantTimeEqual("same-secret", "same-secret"), true);
    assert.equal(await constantTimeEqual("same-secret", "other-secret"), false);
    assert.equal(await constantTimeEqual("", ""), true);
  });

  it("detects only supported image magic bytes", () => {
    assert.equal(detectImageMimeType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "image/png");
    assert.equal(detectImageMimeType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
    assert.equal(
      detectImageMimeType(new TextEncoder().encode("RIFF0000WEBPVP8 ")),
      "image/webp",
    );
    assert.equal(detectImageMimeType(new Uint8Array([1, 2, 3, 4])), null);
  });
});
