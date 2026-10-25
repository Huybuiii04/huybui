import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { signAdminToken, verifyAdminToken } from "../adminSession.ts";

const secret = "admin-password-123";
const now = Date.now();
const validUntil = now + 60_000;

describe("admin session token", () => {
  it("round-trips a token for the same user", async () => {
    const token = await signAdminToken("user-1", validUntil, secret);
    assert.equal(await verifyAdminToken(token, "user-1", now, secret), true);
  });

  it("rejects a token issued for another user", async () => {
    const token = await signAdminToken("user-1", validUntil, secret);
    assert.equal(await verifyAdminToken(token, "user-2", now, secret), false);
  });

  it("rejects an expired token", async () => {
    const token = await signAdminToken("user-1", now - 1000, secret);
    assert.equal(await verifyAdminToken(token, "user-1", now, secret), false);
  });

  it("rejects a tampered signature", async () => {
    const token = await signAdminToken("user-1", validUntil, secret);
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    assert.equal(await verifyAdminToken(tampered, "user-1", now, secret), false);
  });

  it("rejects a token signed with another secret", async () => {
    const token = await signAdminToken("user-1", validUntil, "other-secret");
    assert.equal(await verifyAdminToken(token, "user-1", now, secret), false);
  });

  it("rejects a malformed token", async () => {
    assert.equal(await verifyAdminToken("", "user-1", now, secret), false);
    assert.equal(await verifyAdminToken("no-dot", "user-1", now, secret), false);
  });
});
