import { AppError } from "./http.ts";

export interface AdminUserListRow {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  status: string;
  created_at: string;
}

/**
 * Chỉ xoá được tài khoản user thường: không tự xoá và không xoá admin khác.
 */
export function assertCanDeleteUser(input: { actorId: string; targetId: string; targetRole: string }): void {
  if (input.actorId === input.targetId) {
    throw new AppError(400, "self_action_forbidden", "An administrator cannot delete their own account");
  }
  if (input.targetRole === "admin") {
    throw new AppError(403, "cannot_delete_admin", "An administrator cannot delete another administrator account");
  }
}

/**
 * So khớp email xác nhận: bỏ khoảng trắng thừa, không phân biệt hoa thường.
 * Bên trái phải có dữ liệu, nếu không thì coi như chưa xác nhận.
 */
export function confirmationMatches(confirmEmail: string, targetEmail: string): boolean {
  const left = (confirmEmail ?? "").trim().toLowerCase();
  const right = (targetEmail ?? "").trim().toLowerCase();
  return left.length > 0 && left === right;
}

/**
 * Ghép auth.users + profiles + user_access thành một danh sách có email.
 * Thiếu dòng user_access thì mặc định là user thường đang hoạt động.
 */
export function mergeAdminUserList(
  authUsers: { id: string; email?: string | null; created_at?: string | null }[],
  profiles: { id: string; display_name?: string | null }[],
  access: { user_id: string; role: string; status: string }[],
): AdminUserListRow[] {
  const profileById = new Map(profiles.map((row) => [row.id, row]));
  const accessById = new Map(access.map((row) => [row.user_id, row]));
  return authUsers.map((user) => ({
    user_id: user.id,
    email: user.email ?? "",
    display_name: profileById.get(user.id)?.display_name ?? "",
    role: accessById.get(user.id)?.role ?? "user",
    status: accessById.get(user.id)?.status ?? "active",
    created_at: user.created_at ?? "",
  }));
}
