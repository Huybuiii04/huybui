# Admin Delete User + Email Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị email của user trong bảng quản trị và cho phép admin xoá vĩnh viễn tài khoản user thường, có xác nhận bằng email và audit log.

**Architecture:** Edge Function `admin-users` mở rộng thêm hai action: `list` (đọc `auth.users` bằng service role để lấy email) và `delete` (kiểm tra quyền + xác nhận email ở server, ghi audit log, huỷ job AI, xoá file rồi xoá auth user để cascade dọn dữ liệu). Frontend gọi function này qua `supabase.functions.invoke` như các admin action hiện có; UI trong `UsersTab` thêm cột Email, tìm kiếm theo email và modal xác nhận gõ lại email.

**Tech Stack:** Supabase Edge Functions (Deno) · React 19 · TypeScript · `node:test` · Playwright

---

## File map

| File | Vai trò |
|---|---|
| `supabase/functions/_shared/adminUsers.ts` | Quy tắc thuần: ai được xoá, xác nhận email, gom danh sách user |
| `supabase/functions/_shared/schemas.ts` | `parseAdminUsers` nhận `list` / `delete` + `confirmEmail` |
| `supabase/functions/admin-users/index.ts` | Handler: list + 4 action cũ + delete |
| `src/lib/adminLogic.ts` | Helper thuần cho UI: lọc theo email, quyền xoá, khớp xác nhận |
| `src/lib/ai.ts` | `adminUsersList()`, `adminDeleteUser()` |
| `src/lib/adminRepository.ts` | `fetchAdminUsers()` lấy danh sách (kèm email) từ function |
| `src/pages/admin/UsersTab.tsx` | Cột Email, tìm kiếm, nút xoá + modal xác nhận |
| `tests/admin.test.ts` | Unit helper UI |
| `supabase/functions/_shared/tests/adminUsers.test.ts` | Unit rule backend |
| `tests/admin-users-ui.mjs` | Browser test với dữ liệu giả (không xoá dữ liệu thật) |
| `README.md`, `src/agent/content.ts` | Tài liệu + privacy khớp hành vi thật |

## Task 1: Backend — list có email + delete có xác nhận

**Files:**
- Create: `supabase/functions/_shared/adminUsers.ts`
- Create: `supabase/functions/_shared/tests/adminUsers.test.ts`
- Modify: `supabase/functions/_shared/schemas.ts`
- Modify: `supabase/functions/admin-users/index.ts`

- [ ] **Step 1: Viết test đỏ cho rule xoá**

`supabase/functions/_shared/tests/adminUsers.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assertCanDeleteUser, confirmationMatches, mergeAdminUserList } from '../adminUsers.ts'

test('an admin cannot delete their own account', () => {
  assert.throws(() => assertCanDeleteUser({ actorId: 'u1', targetId: 'u1', targetRole: 'user' }), /self_action_forbidden/)
})

test('an admin cannot delete another admin', () => {
  assert.throws(() => assertCanDeleteUser({ actorId: 'u1', targetId: 'u2', targetRole: 'admin' }), /cannot_delete_admin/)
})

test('a regular user can be deleted', () => {
  assert.doesNotThrow(() => assertCanDeleteUser({ actorId: 'u1', targetId: 'u2', targetRole: 'user' }))
})

test('confirmation email is compared case-insensitively and trimmed', () => {
  assert.equal(confirmationMatches('  USER@Example.COM ', 'user@example.com'), true)
  assert.equal(confirmationMatches('other@example.com', 'user@example.com'), false)
  assert.equal(confirmationMatches('', 'user@example.com'), false)
})

test('the user list keeps the email of every account', () => {
  const rows = mergeAdminUserList(
    [{ id: 'u1', email: 'a@example.com', created_at: '2026-10-01' }],
    [{ id: 'u1', display_name: 'Alpha' }],
    [{ user_id: 'u1', role: 'user', status: 'active' }],
  )
  assert.equal(rows[0].email, 'a@example.com')
  assert.equal(rows[0].display_name, 'Alpha')
  assert.equal(rows[0].role, 'user')
  assert.equal(rows[0].status, 'active')
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test supabase/functions/_shared/tests/adminUsers.test.ts`
Expected: FAIL — module `../adminUsers.ts` chưa tồn tại.

- [ ] **Step 3: Viết module rule thuần**

`supabase/functions/_shared/adminUsers.ts`:

```ts
import { AppError } from './http.ts'

export type AdminUserListRow = {
  user_id: string
  email: string
  display_name: string
  role: string
  status: string
  created_at: string
}

/** Chỉ admin mới xoá được tài khoản user thường, không tự xoá và không xoá admin khác. */
export function assertCanDeleteUser(input: { actorId: string; targetId: string; targetRole: string }) {
  if (input.actorId === input.targetId) {
    throw new AppError(400, 'self_action_forbidden', 'An administrator cannot delete their own account')
  }
  if (input.targetRole === 'admin') {
    throw new AppError(403, 'cannot_delete_admin', 'An administrator cannot delete another administrator account')
  }
}

/** So khớp email xác nhận: bỏ khoảng trắng thừa, không phân biệt hoa thường. */
export function confirmationMatches(confirmEmail: string, targetEmail: string) {
  const left = (confirmEmail ?? '').trim().toLowerCase()
  const right = (targetEmail ?? '').trim().toLowerCase()
  return left.length > 0 && left === right
}

/** Ghép auth.users + profiles + user_access thành một danh sách có email. */
export function mergeAdminUserList(
  authUsers: { id: string; email?: string | null; created_at?: string | null }[],
  profiles: { id: string; display_name?: string | null }[],
  access: { user_id: string; role: string; status: string }[],
): AdminUserListRow[] {
  const profileById = new Map(profiles.map(row => [row.id, row]))
  const accessById = new Map(access.map(row => [row.user_id, row]))
  return authUsers.map(user => ({
    user_id: user.id,
    email: user.email ?? '',
    display_name: profileById.get(user.id)?.display_name ?? '',
    role: accessById.get(user.id)?.role ?? 'user',
    status: accessById.get(user.id)?.status ?? 'active',
    created_at: user.created_at ?? '',
  }))
}
```

- [ ] **Step 4: Mở rộng `parseAdminUsers`**

Trong `supabase/functions/_shared/schemas.ts`:
- `AdminUserAction` thêm `'list'` và `'delete'`.
- `parseAdminUsers` nhận `list` (không cần `userId`) và `delete` (cần `userId` + `confirmEmail` không rỗng); các action cũ giữ nguyên; action lạ vẫn bị từ chối.
- Kiểu trả về phải phân biệt rõ: `{ action: 'list' }` | `{ action: 'suspend' | 'restore' | 'make_admin' | 'remove_admin' | 'delete', userId: string, confirmEmail?: string }`.

Thêm test vào `supabase/functions/_shared/tests/schemas.test.ts` (hoặc file test mới): `list` không cần userId; `delete` thiếu `confirmEmail` bị từ chối; `confirmEmail` rỗng bị từ chối; `userId` không phải UUID bị từ chối.

- [ ] **Step 5: Cập nhật handler `admin-users`**

`supabase/functions/admin-users/index.ts`:
- `action === 'list'`: đọc `auth.users` (id, email, created_at), `public.profiles` (id, display_name), `public.user_access` (user_id, role, status) bằng `context.service`; trả `mergeAdminUserList(...)`.
- `action === 'delete'`: theo thứ tự — `assertCanDeleteUser` → đọc `user_access` (thiếu thì `404 user_not_found`) → lấy email thật từ `auth.users` → `confirmationMatches` (lệch thì `400 confirmation_mismatch`) → ghi `admin_audit_logs` action `admin.user.delete` (metadata chỉ `{ display_name }`, KHÔNG ghi email) → huỷ `ai_jobs` (`queued|retry_wait|processing` → `cancelled`) → đánh dấu `essays.status = 'deleting'` → `removeUserAssetObjects(context.service, userId)` → `context.service.auth.admin.deleteUser(userId)` → trả `{ ok: true, userId, deleted: true }`.
- 4 action cũ giữ nguyên hành vi; chỉ bổ sung `delete` và `list`.
- Không log email của user vào console/audit.

- [ ] **Step 6: Chạy test xanh**

Run: `node --test supabase/functions/_shared/tests/adminUsers.test.ts supabase/functions/_shared/tests/schemas.test.ts` và `npm run test:edge`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/_shared/adminUsers.ts supabase/functions/_shared/schemas.ts \
  supabase/functions/admin-users/index.ts supabase/functions/_shared/tests/adminUsers.test.ts \
  supabase/functions/_shared/tests/schemas.test.ts
git commit -m "feat(admin): add admin user listing and deletion endpoint"
```

## Task 2: Frontend — data layer + logic thuần

**Files:**
- Modify: `src/lib/adminLogic.ts`
- Modify: `src/lib/ai.ts`
- Modify: `src/lib/adminRepository.ts`
- Modify: `tests/admin.test.ts`

- [ ] **Step 1: Viết test đỏ**

Thêm vào `tests/admin.test.ts`:

```ts
import { canDeleteUser, deleteConfirmationMatches, filterAdminUsers } from '../src/lib/adminLogic.ts'

test('the user list can be searched by name, email or id', () => {
  const rows = [
    { user_id: 'u1', email: 'alpha@example.com', display_name: 'Alpha', role: 'user', status: 'active' },
    { user_id: 'u2', email: 'beta@example.com', display_name: 'Beta', role: 'admin', status: 'active' },
  ]
  assert.equal(filterAdminUsers(rows, 'alpha@').length, 1)
  assert.equal(filterAdminUsers(rows, 'beta@example').length, 1)
  assert.equal(filterAdminUsers(rows, 'u2').length, 1)
  assert.equal(filterAdminUsers(rows, 'nothing').length, 0)
})

test('only regular users other than the admin can be deleted', () => {
  assert.equal(canDeleteUser({ role: 'user', isSelf: false }), true)
  assert.equal(canDeleteUser({ role: 'user', isSelf: true }), false)
  assert.equal(canDeleteUser({ role: 'admin', isSelf: false }), false)
})

test('the delete confirmation must repeat the email', () => {
  assert.equal(deleteConfirmationMatches(' user@example.com ', 'user@example.com'), true)
  assert.equal(deleteConfirmationMatches('wrong@example.com', 'user@example.com'), false)
})
```

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test tests/admin.test.ts`
Expected: FAIL vì các helper chưa tồn tại.

- [ ] **Step 3: Viết helper trong `src/lib/adminLogic.ts`**

```ts
export type AdminUserRow = {
  user_id: string
  email: string
  display_name: string
  role: string
  status: string
  created_at?: string
}

export function filterAdminUsers(rows: AdminUserRow[], query: string): AdminUserRow[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter(row => `${row.display_name ?? ''} ${row.email ?? ''} ${row.user_id}`.toLowerCase().includes(needle))
}

export function canDeleteUser(input: { role: string; isSelf: boolean }): boolean {
  return input.role !== 'admin' && !input.isSelf
}

export function deleteConfirmationMatches(input: string, email: string): boolean {
  const left = (input ?? '').trim().toLowerCase()
  const right = (email ?? '').trim().toLowerCase()
  return left.length > 0 && left === right
}
```

- [ ] **Step 4: Nối data layer**

`src/lib/ai.ts`:
```ts
export type AdminUserAction = 'suspend' | 'restore' | 'make_admin' | 'remove_admin'
export async function adminUsersList(): Promise<AiResult<unknown>> { return invoke('admin-users', { action: 'list' }) }
export async function adminDeleteUser(userId: string, confirmEmail: string): Promise<AiResult<unknown>> {
  return invoke('admin-users', { action: 'delete', userId, confirmEmail })
}
```
`src/lib/adminRepository.ts`: `fetchAdminUsers()` gọi `adminUsersList()` và trả `{ profiles, access }` tương thích với call-site hiện tại (map `user_id`→`id` cho profiles, `display_name`, `email` thêm vào kiểu `AdminProfileRow`; `access` giữ nguyên). Kiểu `AdminProfileRow` phải có `email`.

- [ ] **Step 5: Chạy test xanh**

Run: `node --test tests/admin.test.ts` và `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/adminLogic.ts src/lib/ai.ts src/lib/adminRepository.ts tests/admin.test.ts
git commit -m "feat(admin): expose admin user list and delete helpers"
```

## Task 3: UI — cột Email, tìm kiếm, modal xoá

**Files:**
- Modify: `src/pages/admin/UsersTab.tsx`
- Modify: `src/styles.css`
- Create: `tests/admin-users-ui.mjs`

- [ ] **Step 1: Viết browser test đỏ (dữ liệu giả)**

`tests/admin-users-ui.mjs`: dùng Playwright + `page.route` để chặn request `**/functions/v1/admin-users` và trả về JSON giả:
- `action: 'list'` → 2 user: một `user` (email `alpha@example.com`) và một `admin` (email `boss@example.com`).
Test:
1. Bảng có cột Email và hiện đúng email của từng user.
2. Gõ `alpha@` vào ô tìm kiếm → chỉ còn 1 row.
3. Nút xoá chỉ hiện ở row user thường, không hiện ở row admin.
4. Bấm xoá → modal mở, hiện email cần xác nhận; nút xoá vô hiệu hoá khi nhập sai; nhập đúng email → nút bật; bấm → request `delete` được gửi với `confirmEmail` đúng.
5. Không gọi AI và không xoá dữ liệu thật (toàn bộ request admin-users bị intercept).

Chạy với dev server `npx vite --host 127.0.0.1 --port 5180` và `TEST_URL=http://127.0.0.1:5180`.

- [ ] **Step 2: Chạy test đỏ**

Expected: FAIL vì bảng chưa có cột Email và chưa có nút xoá.

- [ ] **Step 3: Sửa `UsersTab.tsx`**

- Dùng `useAuth()` để lấy `user?.id` (id admin hiện tại).
- Thay nguồn dữ liệu bằng `fetchAdminUsers()` mới (đã có email); lọc bằng `filterAdminUsers(rows, query)`.
- Thêm `<span>` cột Email trong `.usage-head` và mỗi row (hiển thị `row.email` hoặc `—`).
- Nút xoá: `<button className="icon-button danger-outline" aria-label={c('Xoá tài khoản', 'Delete account')}>` chỉ render khi `canDeleteUser({ role, isSelf: row.user_id === user?.id })`.
- Modal: overlay + panel; nội dung liệt kê dữ liệu bị xoá (bài viết, bản nháp, thẻ từ vựng, lịch ôn tập, log lỗi, tệp đã tải lên, tài khoản đăng nhập); ô `<input>` yêu cầu gõ lại email; nút xác nhận `disabled={!deleteConfirmationMatches(input, row.email) || busy}`; bấm → `adminDeleteUser(row.user_id, input)` → reload danh sách, đóng modal, báo lỗi qua `onError` nếu thất bại.
- Chuỗi mới đều dùng `c(vi, en)`.

- [ ] **Step 4: CSS modal**

Thêm vào `src/styles.css` (dùng token sẵn có): `.admin-delete-modal`, `.admin-delete-panel`, `.admin-delete-warning`, `.admin-delete-confirm-row`, responsive.

- [ ] **Step 5: Chạy test xanh**

Run: `node tests/admin-users-ui.mjs` (dev server 5180), `npm test`, `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/UsersTab.tsx src/styles.css tests/admin-users-ui.mjs
git commit -m "feat(admin): show emails and allow deleting user accounts"
```

## Task 4: Tài liệu, privacy và verify cuối

**Files:**
- Modify: `README.md`
- Modify: `src/agent/content.ts`
- Modify: `tests/build-output.mjs` (nếu cần assert privacy mới)

- [ ] **Step 1: Cập nhật privacy (VI + EN)**

Thêm một câu nói rõ quản trị viên có thể xoá tài khoản khi có lý do hợp lệ (không nêu chi tiết nội bộ), giữ nguyên mọi cam kết đã xác minh. Bảo đảm bản tiếng Anh và tiếng Việt cùng ý.

- [ ] **Step 2: Cập nhật README**

Mô tả: tab Người dùng hiện email, tìm kiếm theo email, nút xoá chỉ cho user thường, xác nhận bằng email, audit log `admin.user.delete`, dữ liệu bị cascade xoá.

- [ ] **Step 3: Verify cuối**

Run: `npm test`, `npm run test:edge`, `npm run build`, `node tests/build-output.mjs`, `node --test tests/admin.test.ts`, `node tests/admin-users-ui.mjs` (dev server), `node tests/admin-console.mjs` (nếu có ADMIN_EMAIL/ADMIN_PASSWORD trong `.env.test`; nếu không có thì ghi rõ bỏ qua vì cần tài khoản thật).

- [ ] **Step 4: Deploy Edge Function (nếu có token)**

Run: `npm run db:deploy` — chỉ chạy khi `.env.local` có `SUPABASE_ACCESS_TOKEN`; nếu thiếu thì báo cáo rõ và dừng (không deploy web trước khi backend có mới).

- [ ] **Step 5: Commit**

```bash
git add README.md src/agent/content.ts tests/build-output.mjs
git commit -m "docs(admin): document user deletion and email visibility"
```

## Self-review

- Spec coverage: list có email + delete + xác nhận + audit + cascade (Task 1), data layer + logic (Task 2), UI + test giả (Task 3), tài liệu + privacy + verify + deploy (Task 4).
- Không có test nào xoá dữ liệu thật hay gọi AI có phí.
- Service role chỉ nằm trong Edge Function; không đổi RLS; không thêm endpoint public.
- Xác nhận email kiểm ở server; UI chỉ là lớp tiện ích.
- Tên hàm/kiểu dùng nhất quán: `assertCanDeleteUser`, `confirmationMatches`, `mergeAdminUserList` (backend) và `canDeleteUser`, `deleteConfirmationMatches`, `filterAdminUsers` (frontend).
