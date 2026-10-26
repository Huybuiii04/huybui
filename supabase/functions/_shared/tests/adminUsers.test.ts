import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { assertCanDeleteUser, confirmationMatches, mergeAdminUserList } from "../adminUsers.ts";
import { AppError } from "../http.ts";

/**
 * Kiểm tra lỗi có mã đúng: chấp nhận `error.code` của AppError hoặc mã nằm
 * ngay trong message, để test không phụ thuộc vào cách diễn đạt message.
 */
function assertErrorCode(run: () => unknown, code: string, status: number): void {
  assert.throws(run, (error: unknown) => {
    const identified =
      (error instanceof AppError && error.code === code) ||
      (error instanceof Error && error.message.includes(code));
    assert.ok(identified, `expected the error to identify "${code}"`);
    if (error instanceof AppError) assert.equal(error.status, status);
    return true;
  });
}

describe("admin user rules", () => {
  it("blocks an administrator from deleting their own account", () => {
    assertErrorCode(
      () => assertCanDeleteUser({ actorId: "u1", targetId: "u1", targetRole: "user" }),
      "self_action_forbidden",
      400,
    );
  });

  it("blocks deleting another administrator account", () => {
    assertErrorCode(
      () => assertCanDeleteUser({ actorId: "u1", targetId: "u2", targetRole: "admin" }),
      "cannot_delete_admin",
      403,
    );
  });

  it("allows deleting a regular user account", () => {
    assert.doesNotThrow(() => assertCanDeleteUser({ actorId: "u1", targetId: "u2", targetRole: "user" }));
  });

  it("compares the confirmation email ignoring case and surrounding spaces", () => {
    assert.equal(confirmationMatches("  USER@Example.COM ", "user@example.com"), true);
    assert.equal(confirmationMatches("other@example.com", "user@example.com"), false);
    assert.equal(confirmationMatches("", "user@example.com"), false);
  });

  it("merges auth, profile and access rows into a list that keeps the email", () => {
    const rows = mergeAdminUserList(
      [
        { id: "u1", email: "a@example.com", created_at: "2026-10-01T00:00:00.000Z" },
        { id: "u2", email: null, created_at: null },
      ],
      [{ id: "u1", display_name: "Alpha" }],
      [{ user_id: "u1", role: "user", status: "active" }],
    );

    assert.deepEqual(rows, [
      {
        user_id: "u1",
        email: "a@example.com",
        display_name: "Alpha",
        role: "user",
        status: "active",
        created_at: "2026-10-01T00:00:00.000Z",
      },
      {
        user_id: "u2",
        email: "",
        display_name: "",
        role: "user",
        status: "active",
        created_at: "",
      },
    ]);
  });
});
