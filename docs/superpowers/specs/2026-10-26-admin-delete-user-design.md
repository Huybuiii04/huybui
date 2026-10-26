# Admin xoá user và hiển thị email — thiết kế

Ngày: 26/10/2026

## 1. Bối cảnh

Tab **Người dùng** trong bảng quản trị hiện chỉ hiển thị `display_name` và 8 ký tự đầu của id, vì email nằm trong `auth.users` mà PostgREST/RLS không cho admin đọc trực tiếp. Đồng thời dự án không có đường để quản trị viên xoá một tài khoản người dùng (chỉ có chức năng tự xoá của chính người dùng trong `delete-account`).

Yêu cầu đã chốt:

1. Hiển thị **email** của user trong bảng quản trị, và tìm kiếm được theo email.
2. Quản trị viên có thể **xoá vĩnh viễn** tài khoản người dùng ngay trên web.
3. Chỉ xoá được tài khoản **user thường**: không tự xoá mình, không xoá tài khoản admin khác.
4. Bước xác nhận: **gõ lại đúng email** của user (kiểm tra cả ở server).

## 2. Mục tiêu / ngoài phạm vi

**Mục tiêu**
- Danh sách người dùng trong admin có cột Email, lọc được theo tên/email/id.
- Admin xoá được tài khoản user thường bằng một luồng an toàn: xác nhận bằng email, ghi audit log, xoá dữ liệu theo đúng cascade của DB, huỷ job AI đang chạy.
- Lỗi trả về có mã rõ ràng, không rò dữ liệu của user khác.

**Ngoài phạm vi**
- Không cho xoá admin (kể cả admin khác), không cho tự xoá.
- Không tạo "xoá mềm" hoặc trạng thái ẩn.
- Không đổi RLS, không mở quyền đọc `auth.users` cho client, không thêm endpoint public.
- Không gửi email thông báo cho user bị xoá.
- Không xoá dữ liệu thật trong test.

## 3. Kiến trúc

### 3.1. Edge Function `supabase/functions/admin-users`

Input là union rõ ràng (validate ở `_shared/schemas.ts`):

| Action | Input | Kết quả |
|---|---|---|
| `list` | — | `[{ user_id, email, display_name, role, status, created_at }]` |
| `suspend` / `restore` / `make_admin` / `remove_admin` | `userId` | như hiện tại |
| `delete` | `userId`, `confirmEmail` | `{ ok: true, userId, deleted: true }` |

**`list`** — dùng service role (`context.service`) đọc `auth.users` (id, email, created_at) rồi ghép với `public.profiles` (display_name) và `public.user_access` (role, status). Chỉ admin đã đăng nhập mới gọi được (`requireAdmin`).

**`delete`** — thứ tự thực thi (service role):
1. Chặn tự xoá: `actorId === targetId` → `400 self_action_forbidden`.
2. Đọc `user_access` của target: không có → `404 user_not_found`; `role === 'admin'` → `403 cannot_delete_admin`.
3. Đọc email thật của target từ `auth.users`; so `confirmEmail` (trim + không phân biệt hoa thường) với email thật → lệch thì `400 confirmation_mismatch`. Email trong body là dữ liệu người dùng nên không ghi vào log/audit.
4. Ghi audit log `admin.user.delete` **trước** khi xoá: `actor_id`, `target` = user id, `metadata` = `{ display_name }` (không ghi email).
5. Huỷ job AI đang chờ/chạy của user: `ai_jobs.status = 'cancelled'` cho `queued|retry_wait|processing`.
6. Đánh dấu `essays.status = 'deleting'` (đúng như `delete-account`).
7. Xoá file trong storage qua `removeUserAssetObjects(service, userId)`.
8. `auth.admin.deleteUser(userId)` ⇒ cascade xoá `profiles`, `user_access`, `essays`, `essay_revisions`, `study_cards`, `review_events`, `error_logs`, `guide_progress`, `user_prompts`… theo `on delete cascade` trong migration.

Lỗi mới: `cannot_delete_admin` (403), `confirmation_mismatch` (400). Các lỗi cũ giữ nguyên.

### 3.2. Frontend

- `src/lib/ai.ts`:
  - `adminUsersList()` → gọi `invoke('admin-users', { action: 'list' })`.
  - `adminUserAction(action, userId)` giữ nguyên cho 4 action hiện có.
  - `adminDeleteUser(userId, confirmEmail)` → `invoke('admin-users', { action: 'delete', userId, confirmEmail })`.
- `src/lib/adminRepository.ts`: `fetchAdminUsers()` chuyển sang lấy danh sách từ function (kèm email), giữ kiểu trả về tương thích (`profiles` + `access`) để không phá call-site khác.
- `src/pages/admin/UsersTab.tsx`:
  - Thêm cột **Email**; ô tìm kiếm lọc theo tên, email và id.
  - Nút **Xoá** (icon `Trash2`) chỉ hiện khi `role !== 'admin'` và không phải chính mình (so với id của phiên admin hiện tại).
  - Modal xác nhận: hiện email + tên user, liệt kê dữ liệu sẽ bị xoá, ô nhập bắt gõ lại email, nút "Xoá vĩnh viễn" chỉ enable khi chuỗi nhập khớp email (so khớp trim + không phân biệt hoa thường, kiểm tra lại ở server).
  - Sau khi xoá: reload danh sách, đóng modal, thông báo kết quả (kể cả lỗi).
- Toàn bộ chuỗi mới dùng `c(vi, en)` để đồng nhất song ngữ.
- `src/lib/adminLogic.ts` (hoặc module logic thuần tương ứng) chứa 2 helper để test được không cần DOM:
  - `canDeleteUser({ role, isSelf })` → boolean.
  - `deleteConfirmationMatches(input, email)` → boolean.

### 3.3. Tài liệu

- `README.md`: bổ sung mô tả luồng xoá user trong admin console và việc admin xem được email.
- `src/agent/content.ts` (privacy, cả VI và EN): thêm một câu nói rõ quản trị viên có thể xoá tài khoản khi có lý do hợp lệ (để tài liệu công khai khớp với hành vi thật).

## 4. Kiểm thử

| Tầng | Nội dung |
|---|---|
| `_shared/schemas.ts` (node:test) | `parseAdminUsers` nhận `list`/4 action cũ/`delete`; từ chối action lạ, thiếu `userId`, `confirmEmail` rỗng, `userId` không phải UUID. |
| helper quyết định xoá (node:test) | tự xoá → `self_action_forbidden`; target là admin → `cannot_delete_admin`; sai email → `confirmation_mismatch`; email khớp (khác hoa thường/thừa khoảng trắng) → cho qua. |
| frontend logic (node:test) | `canDeleteUser` và `deleteConfirmationMatches`. |
| admin console (browser) | bảng hiện cột Email; tìm theo email lọc đúng; nút Xoá chỉ hiện với user thường; modal bắt gõ lại email và nút chỉ enable khi khớp. Dùng dữ liệu giả (route intercept) để không xoá dữ liệu thật. |
| hồi quy | `npm test`, `npm run test:edge`, `npm run build`, `tests/admin.test.ts`, `tests/admin-console.mjs`. |

Không có test nào gọi AI có phí hoặc xoá dữ liệu thật.

## 5. Triển khai

1. Viết test đỏ cho từng tầng, triển khai tối thiểu, chạy xanh.
2. Review spec + code quality cho từng task.
3. Deploy Edge Function (`npm run db:deploy`) **chỉ khi** có `SUPABASE_ACCESS_TOKEN` trong `.env.local`; nếu thiếu thì báo cáo rõ và để người dùng tự deploy.
4. Deploy web (`npx vercel --prod --yes`) nếu người dùng yêu cầu; dùng commit tạm với email account vì Vercel chặn author noreply.

## 6. Self-review

- Không có endpoint public mới; service role chỉ nằm trong Edge Function.
- Xác nhận email được kiểm ở server, không chỉ ở UI.
- Xoá chỉ user thường; không tự xoá, không xoá admin.
- Audit log ghi trước khi xoá và không chứa email.
- Cascade xoá dữ liệu đúng theo migration hiện có; không thêm bảng/cột mới.
- Mọi công bộc mới đều dùng service role của admin, không mở rộng quyền đọc cho anon/authenticated.
