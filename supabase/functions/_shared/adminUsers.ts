import { AppError } from "./http.ts";

export interface AdminUserListRow {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  status: string;
  created_at: string;
}

export interface AdminUserAuthRow {
  id: string;
  email?: string | null;
  created_at?: string | null;
}

export interface AdminUserProfileRow {
  id: string;
  display_name?: string | null;
}

export interface AdminUserAccessRow {
  user_id: string;
  role: string;
  status: string;
}

/**
 * Nguồn dữ liệu cho danh sách user. Mỗi hàm tự lo phần truy vấn của mình
 * để tầng ghép danh sách không cần biết tới Supabase.
 */
export interface AdminUserListSource {
  listAccounts(limit: number): Promise<AdminUserAuthRow[]>;
  listProfiles(ids: string[]): Promise<AdminUserProfileRow[]>;
  listAccess(ids: string[]): Promise<AdminUserAccessRow[]>;
}

/**
 * Số id tối đa trong một truy vấn `in`. PostgREST trả lỗi "URI too long" khi
 * danh sách id quá dài nên phải chia nhỏ.
 */
const ID_BATCH_SIZE = 100;

/**
 * Chia danh sách id thành các lô nhỏ để truy vấn `in` không quá dài.
 */
export function chunkAdminUserIds(ids: string[], size = ID_BATCH_SIZE): string[][] {
  const batches: string[][] = [];
  for (let index = 0; index < ids.length; index += size) {
    batches.push(ids.slice(index, index + size));
  }
  return batches;
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
  authUsers: AdminUserAuthRow[],
  profiles: AdminUserProfileRow[],
  access: AdminUserAccessRow[],
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

/**
 * Đọc danh sách user cho bảng quản trị.
 *
 * Lấy account trước, rồi chỉ tra profile và user_access cho đúng các id đó.
 * Nếu tra không giới hạn theo id thì khi dự án có hơn 500 tài khoản, hai bộ
 * dữ liệu sẽ mô tả khác nhau và một user có thể bị gán nhầm role hoặc status.
 * Không có account thì không tra gì thêm: `in` với danh sách rỗng là truy vấn
 * không hợp lệ.
 */
export async function loadAdminUserList(
  source: AdminUserListSource,
  limit = 500,
): Promise<AdminUserListRow[]> {
  const accounts = await source.listAccounts(limit);
  const ids = [...new Set(accounts.map((account) => account.id))];
  if (!ids.length) return [];

  const batches = chunkAdminUserIds(ids);
  const [profileBatches, accessBatches] = await Promise.all([
    Promise.all(batches.map((batch) => source.listProfiles(batch))),
    Promise.all(batches.map((batch) => source.listAccess(batch))),
  ]);

  return mergeAdminUserList(accounts, profileBatches.flat(), accessBatches.flat())
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, limit);
}
