import type { SupabaseClient } from "@supabase/supabase-js";

import { assertCanDeleteUser, confirmationMatches, loadAdminUserList, type AdminUserListSource } from "../_shared/adminUsers.ts";
import { requireAdmin, type AuthenticatedContext } from "../_shared/auth.ts";
import { AppError, databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { parseAdminUsers } from "../_shared/schemas.ts";
import { removeUserAssetObjects } from "../_shared/storage.ts";

const MAX_LIST_ROWS = 500;

/**
 * Danh sách user cho bảng quản trị. Email nằm trong auth.users nên phải đọc
 * bằng service role rồi ghép với profile và user_access; mới nhất lên đầu,
 * tối đa 500 dòng giống query của UI.
 *
 * Profile và user_access chỉ được tra theo đúng id của các account vừa đọc,
 * nếu không danh sách sẽ lệch dữ liệu khi dự án có hơn 500 tài khoản.
 */
async function listUsers(service: SupabaseClient) {
  const source: AdminUserListSource = {
    async listAccounts(limit) {
      const { data, error } = await service.auth.admin.listUsers({ page: 1, perPage: limit });
      if (error) throw databaseError("load the accounts");
      return (data?.users ?? []).map((user) => ({
        id: user.id,
        email: user.email ?? "",
        created_at: user.created_at ?? "",
      }));
    },
    async listProfiles(ids) {
      if (!ids.length) return [];
      const { data, error } = await service.from("profiles").select("id,display_name").in("id", ids);
      if (error) throw databaseError("load the profiles");
      return (data ?? []) as { id: string; display_name?: string | null }[];
    },
    async listAccess(ids) {
      if (!ids.length) return [];
      const { data, error } = await service.from("user_access").select("user_id,role,status").in("user_id", ids);
      if (error) throw databaseError("load the user access records");
      return (data ?? []) as { user_id: string; role: string; status: string }[];
    },
  };

  return loadAdminUserList(source, MAX_LIST_ROWS);
}

/**
 * Xoá vĩnh viễn tài khoản user thường: chặn tự xoá và xoá admin, xác nhận
 * email ở server, ghi audit log (không chứa email), huỷ job AI, đánh dấu bài
 * viết rồi xoá file, cuối cùng xoá auth user để cascade dọn dữ liệu.
 */
async function deleteUser(context: AuthenticatedContext, userId: string, confirmEmail: string) {
  const target = await context.service
    .from("user_access")
    .select("user_id,role,status")
    .eq("user_id", userId)
    .maybeSingle();
  if (target.error) throw databaseError("load the user access record");
  if (!target.data) throw new AppError(404, "user_not_found", "User not found");

  assertCanDeleteUser({ actorId: context.userId, targetId: userId, targetRole: target.data.role });

  const account = await context.service.auth.admin.getUserById(userId);
  if (account.error) {
    if (isNotFound(account.error)) throw new AppError(404, "user_not_found", "User not found");
    throw databaseError("load the account");
  }
  const targetEmail = account.data?.user?.email ?? "";
  if (!targetEmail) throw new AppError(404, "user_not_found", "User not found");

  if (!confirmationMatches(confirmEmail, targetEmail)) {
    throw new AppError(400, "confirmation_mismatch", "The confirmation email does not match the account");
  }

  const profile = await context.service
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
  if (profile.error) throw databaseError("load the profile");

  const audit = await context.service.from("admin_audit_logs").insert({
    actor_id: context.userId,
    action: "admin.user.delete",
    target: userId,
    metadata: { display_name: (profile.data?.display_name as string | null) ?? "" },
  });
  if (audit.error) throw databaseError("write the admin audit log");

  const cancelled = await context.service
    .from("ai_jobs")
    .update({ status: "cancelled", lease_token: null, lease_until: null, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .in("status", ["queued", "retry_wait", "processing"]);
  if (cancelled.error) throw databaseError("cancel the user jobs");

  const tombstone = await context.service
    .from("essays")
    .update({ status: "deleting" })
    .eq("user_id", userId)
    .neq("status", "deleted");
  if (tombstone.error) throw databaseError("mark the user essays for deletion");

  await removeUserAssetObjects(context.service, userId);

  const deletion = await context.service.auth.admin.deleteUser(userId);
  if (deletion.error) throw databaseError("delete the account");

  return { ok: true, userId, deleted: true };
}

function isNotFound(error: { status?: number; statusCode?: number | string; message?: string }): boolean {
  const rawStatus = error.statusCode ?? error.status;
  const status = typeof rawStatus === "string" ? Number(rawStatus) : rawStatus;
  return status === 404 || /not found/i.test(error.message ?? "");
}

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAdmin(request);
    const input = parseAdminUsers(await readJsonBody(request));

    if (input.action === "list") {
      return jsonResponse(request, 200, await listUsers(context.service), { requestId: id });
    }

    if (input.action === "delete") {
      return jsonResponse(request, 200, await deleteUser(context, input.userId, input.confirmEmail), { requestId: id });
    }

    if (input.userId === context.userId && ["suspend", "remove_admin"].includes(input.action)) {
      throw new AppError(400, "self_action_forbidden", "An administrator cannot suspend or demote their own account");
    }

    const target = await context.service
      .from("user_access")
      .select("user_id,role,status")
      .eq("user_id", input.userId)
      .maybeSingle();
    if (target.error) throw databaseError("load the user access record");
    if (!target.data) throw new AppError(404, "user_not_found", "User not found");

    const update = input.action === "suspend"
      ? { status: "suspended" }
      : input.action === "restore"
      ? { status: "active" }
      : input.action === "make_admin"
      ? { role: "admin" }
      : { role: "user" };

    const result = await context.service
      .from("user_access")
      .update(update)
      .eq("user_id", input.userId)
      .select("user_id,role,status")
      .maybeSingle();
    if (result.error) throw databaseError("update the user access record");
    if (!result.data) throw new AppError(404, "user_not_found", "User not found");

    const audit = await context.service.from("admin_audit_logs").insert({
      actor_id: context.userId,
      action: `admin.user.${input.action}`,
      target: input.userId,
      metadata: {},
    });
    if (audit.error) throw databaseError("write the admin audit log");

    return jsonResponse(request, 200, {
      ok: true,
      userId: result.data.user_id,
      role: result.data.role,
      status: result.data.status,
    }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
