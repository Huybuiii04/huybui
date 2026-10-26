import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SchemaError,
  parseAdminContent,
  parseAdminUsers,
  parseDeleteAccount,
  parsePrepareUpload,
  parseRetryJob,
  parseRunWritingTool,
  parseSubmitEssay,
} from "../schemas.ts";

const essayId = "11111111-1111-4111-8111-111111111111";
const jobId = "22222222-2222-4222-8222-222222222222";
const idempotencyKey = "request-0001";

describe("request schemas", () => {
  it("accepts a valid submit-essay request", () => {
    const parsed = parseSubmitEssay({
      essayId,
      expectedVersion: 3,
      idempotencyKey,
      mode: "grade",
    });

    assert.deepEqual(parsed, {
      essayId,
      expectedVersion: 3,
      idempotencyKey,
      mode: "grade",
    });
  });

  it("rejects a non-positive expected version", () => {
    assert.throws(
      () => parseSubmitEssay({ essayId, expectedVersion: 0, idempotencyKey, mode: "grade" }),
      (error: unknown) => error instanceof SchemaError && error.field === "expectedVersion",
    );
  });

  it("accepts only supported upload MIME types and enforces 5 MiB", () => {
    const valid = parsePrepareUpload({
      essayId,
      mimeType: "image/png",
      byteSize: 1024,
      sha256: "a".repeat(64),
    });
    assert.equal(valid.mimeType, "image/png");

    assert.throws(
      () => parsePrepareUpload({ essayId, mimeType: "application/pdf", byteSize: 1024, sha256: "a".repeat(64) }),
      (error: unknown) => error instanceof SchemaError && error.field === "mimeType",
    );
    assert.throws(
      () => parsePrepareUpload({ essayId, mimeType: "image/png", byteSize: 5 * 1024 * 1024 + 1, sha256: "a".repeat(64) }),
      (error: unknown) => error instanceof SchemaError && error.field === "byteSize",
    );
  });

  it("requires assets for read-image and rejects unsupported operations", () => {
    assert.throws(
      () => parseRunWritingTool({ operation: "read-image", idempotencyKey }),
      (error: unknown) => error instanceof SchemaError && error.field === "assetIds",
    );

    const parsed = parseRunWritingTool({
      operation: "read-image",
      assetIds: [essayId],
      idempotencyKey,
    });
    assert.equal(parsed.operation, "read-image");

    assert.throws(
      () => parseRunWritingTool({ operation: "unknown", idempotencyKey }),
      (error: unknown) => error instanceof SchemaError && error.field === "operation",
    );
  });

  it("validates retry, account deletion, and admin actions", () => {
    assert.deepEqual(parseRetryJob({ jobId, idempotencyKey }), { jobId, idempotencyKey });
    assert.deepEqual(parseDeleteAccount({ confirmText: "DELETE" }), { confirmText: "DELETE" });
    assert.throws(
      () => parseDeleteAccount({ confirmText: "delete" }),
      (error: unknown) => error instanceof SchemaError && error.field === "confirmText",
    );

    const adminContent = parseAdminContent({
      action: "publish",
      entry: { id: essayId },
    });
    assert.equal(adminContent.action, "publish");

    const adminUsers = parseAdminUsers({ action: "suspend", userId: essayId });
    assert.equal(adminUsers.action, "suspend");
  });

  it("parses the admin-users list action without a user id", () => {
    const parsed = parseAdminUsers({ action: "list" });
    assert.equal(parsed.action, "list");
  });

  it("parses the admin-users delete action with a user id and a confirmation email", () => {
    const parsed = parseAdminUsers({ action: "delete", userId: essayId, confirmEmail: "user@example.com" });
    assert.equal(parsed.action, "delete");
    if (parsed.action !== "delete") return;
    assert.equal(parsed.userId, essayId);
    assert.equal(parsed.confirmEmail, "user@example.com");
  });

  it("rejects an admin-users delete without a confirmation email", () => {
    assert.throws(
      () => parseAdminUsers({ action: "delete", userId: essayId }),
      (error: unknown) => error instanceof SchemaError && error.field === "confirmEmail",
    );
  });

  it("rejects an admin-users delete with an empty confirmation email", () => {
    assert.throws(
      () => parseAdminUsers({ action: "delete", userId: essayId, confirmEmail: "" }),
      (error: unknown) => error instanceof SchemaError && error.field === "confirmEmail",
    );
  });

  it("rejects an admin-users delete with a blank confirmation email", () => {
    assert.throws(
      () => parseAdminUsers({ action: "delete", userId: essayId, confirmEmail: "   " }),
      (error: unknown) => error instanceof SchemaError && error.field === "confirmEmail",
    );
  });

  it("rejects an admin-users delete with a user id that is not a UUID", () => {
    assert.throws(
      () => parseAdminUsers({ action: "delete", userId: "not-a-uuid", confirmEmail: "user@example.com" }),
      (error: unknown) => error instanceof SchemaError && error.field === "userId",
    );
  });

  it("rejects an unknown admin-users action", () => {
    assert.throws(
      () => parseAdminUsers({ action: "explode", userId: essayId }),
      (error: unknown) => error instanceof SchemaError && error.field === "action",
    );
  });
});
