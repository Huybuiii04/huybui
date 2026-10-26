import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertCanDeleteUser,
  confirmationMatches,
  loadAdminUserList,
  mergeAdminUserList,
  type AdminUserListSource,
} from "../adminUsers.ts";
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

/**
 * Nguồn dữ liệu giả: ghi lại các id được hỏi để kiểm tra phạm vi truy vấn.
 */
function recordingSource(
  accounts: { id: string; email?: string | null; created_at?: string | null }[],
  profiles: { id: string; display_name?: string | null }[] = [],
  access: { user_id: string; role: string; status: string }[] = [],
) {
  const calls = { profiles: [] as string[][], access: [] as string[][] };
  const source: AdminUserListSource = {
    async listAccounts() {
      return accounts;
    },
    async listProfiles(ids) {
      calls.profiles.push(ids);
      return profiles;
    },
    async listAccess(ids) {
      calls.access.push(ids);
      return access;
    },
  };
  return { calls, source };
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

  it("does not apply another user's access row to a listed account", () => {
    const rows = mergeAdminUserList(
      [{ id: "u1", email: "a@example.com", created_at: "2026-10-01T00:00:00.000Z" }],
      [{ id: "u1", display_name: "Alpha" }],
      [{ user_id: "u2", role: "admin", status: "suspended" }],
    );

    assert.equal(rows.length, 1);
    assert.equal(rows[0].role, "user");
    assert.equal(rows[0].status, "active");
  });

  it("looks up profile and access data only for the listed accounts", async () => {
    const { calls, source } = recordingSource(
      [
        { id: "u1", email: "a@example.com", created_at: "2026-10-01T00:00:00.000Z" },
        { id: "u2", email: "b@example.com", created_at: "2026-10-02T00:00:00.000Z" },
      ],
      [{ id: "u2", display_name: "Beta" }],
      [{ user_id: "u2", role: "admin", status: "suspended" }],
    );

    const rows = await loadAdminUserList(source);

    assert.deepEqual(calls.profiles, [["u1", "u2"]]);
    assert.deepEqual(calls.access, [["u1", "u2"]]);
    assert.deepEqual(rows.map((row) => row.user_id), ["u2", "u1"]);
    assert.equal(rows[0].display_name, "Beta");
    assert.equal(rows[0].role, "admin");
    assert.equal(rows[0].status, "suspended");
    assert.equal(rows[1].display_name, "");
    assert.equal(rows[1].role, "user");
    assert.equal(rows[1].status, "active");
  });

  it("skips the profile and access lookups when there is no account", async () => {
    const { calls, source } = recordingSource([]);

    assert.deepEqual(await loadAdminUserList(source), []);
    assert.deepEqual(calls.profiles, []);
    assert.deepEqual(calls.access, []);
  });

  it("caps the list and splits the id lookups into batches", async () => {
    const accounts = Array.from({ length: 520 }, (_, index) => ({
      id: `u${index}`,
      email: `user${index}@example.com`,
      created_at: new Date(Date.UTC(2026, 0, 1) + index * 86_400_000).toISOString(),
    }));
    const { calls, source } = recordingSource(accounts);

    const rows = await loadAdminUserList(source);

    assert.equal(rows.length, 500);
    assert.equal(rows[0].user_id, "u519");
    assert.equal(calls.profiles.length, 6);
    assert.equal(calls.profiles[0].length, 100);
    assert.equal(calls.profiles[5].length, 20);
    assert.equal(calls.access.length, 6);
    assert.deepEqual(calls.profiles.flat().sort(), accounts.map((account) => account.id).sort());
    assert.deepEqual(calls.access.flat().sort(), accounts.map((account) => account.id).sort());
  });
});
