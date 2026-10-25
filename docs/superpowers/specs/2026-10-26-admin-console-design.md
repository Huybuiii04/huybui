# Bảng quản trị (Admin Console) — Design

**Ngày:** 2026-10-26 · **Trạng thái:** đã duyệt

## Mục tiêu

Nâng trang `/admin` từ 4 tab kỹ thuật (nội dung, người dùng, tác vụ AI, token) thành **bảng quản trị có dashboard**, cổng vào **2 lớp**, và cho phép admin **theo dõi từng người dùng đã làm những đề nào, còn đề nào chưa làm**.

Tài khoản admin: `admin@gmail.com` / `admin123` (cả 2 lớp).

## Vì sao cần 2 lớp

Hiện tại `/admin` chỉ cần đăng nhập app; RLS mới chặn dữ liệu, nên **người dùng thường vẫn vào được trang** và thấy bảng trắng/lỗi. Hai lớp:

1. **Đăng nhập app** — tài khoản Supabase có `user_access.role = 'admin'` và `status = 'active'`.
2. **Mật khẩu quản trị** — secret `ADMIN_PASSWORD` của Edge Function. Người dùng nhập mật khẩu → Edge Function `admin-session` trả **token HMAC** gắn với `user_id`, hạn 12 giờ, lưu `sessionStorage`.

Mọi Edge Function quản trị khác **bắt buộc** có header `x-admin-token` hợp lệ (đã ký + chưa hết hạn + đúng user) bên cạnh `requireAdmin` (role admin). Token ký bằng HMAC-SHA256 với `ADMIN_PASSWORD` nên không cần bảng/token server-side.

## Ranh giới quyền

| Việc | Ai làm | Đường |
|---|---|---|
| Đọc danh sách user, bài viết, thẻ từ, log lỗi, audit log, prompts, từ vựng | Admin (role) | PostgREST trực tiếp, RLS `private.is_admin()` |
| Sửa/xoá bài viết, ẩn/hiện đề, sửa/xoá/thêm từ vựng, retry job | Admin (role + token) | Edge Function `admin-data` (service_role) + ghi `admin_audit_logs` |
| Khoá/mở khoá/cấp quyền admin | Admin (role) | Edge Function `admin-users` (đã có) |

Mọi thao tác ghi đều ghi vào `admin_audit_logs` (actor_id, action, target, metadata) để có lịch sử.

## Tab

### 1. Tổng quan (mặc định)
Thẻ số liệu: tổng user · user mới 7 ngày · tổng bài viết · bài viết 7 ngày · số đề đã làm (distinct) · số lần chấm · job đang chờ · job lỗi · chi phí AI 30 ngày.
Danh sách phụ: 5 user tích cực nhất (theo số bài) · 5 đề phổ biến nhất · 5 đề published chưa ai làm.

Số liệu lấy từ Edge Function `admin-data` với `action: "dashboard"` (service_role, gộp nhiều truy vấn) — tránh 8 vòng gọi từ client.

### 2. Người dùng
Danh sách (tìm theo tên/id) + trạng thái + vai trò; hành động: khoá, mở khoá, cấp quyền admin, bỏ quyền (dùng `admin-users` sẵn có).
Bấm vào một user → **chi tiết**:
- Hồ sơ, vai trò, trạng thái, ngày tạo, số bài viết / lần chấm / thẻ từ / lỗi sai.
- **Đề đã làm**: gom bài viết theo đề (khớp `essay.prompt_text` = `prompts.text`), hiện số lần làm, điểm TB của các lần chấm, lần làm gần nhất.
- **Đề còn lại**: các đề `published` chưa từng làm, tách theo loại bài (Task 2 / Task 1 Academic / Task 1 General), kèm cột *"còn N người chưa làm"*.
- **Xoá bài viết** (vi phạm) qua `admin-data`.

### 3. Đề bài (prompts)
Danh sách đề `published`/`hidden`, lọc theo task và dạng, tìm theo slug/tiêu đề. Ẩn/hiện qua `admin-data` (`prompt_set_status`).

### 4. Từ vựng 25 chủ đề
Chọn chủ đề → danh sách mục từ; sửa `meaning`/`definition`/`ipa`, xoá mục, thêm mục mới — qua `admin-data`. Có tìm kiếm trong chủ đề.

### 5. AI jobs
Danh sách job kèm lỗi chi tiết (`error_message`), retry một job, retry tất cả job đang `failed`. Lưu ý: `retry-job` hiện chỉ cho chủ sở hữu → admin retry qua `admin-data`.

### 6. Nhật ký admin
Đọc `admin_audit_logs` (mới mở RLS admin): actor, action, target, thời gian.

### 7. Token & chi phí + Nội dung
Giữ nguyên như hiện tại.

## Thành phần

**Backend**
- `supabase/migrations/019_admin_ops.sql` — RLS admin đọc: `essays`, `study_cards`, `error_logs`, `essay_features`, `ai_tool_results`, `admin_audit_logs`.
- `supabase/functions/_shared/adminSession.ts` — `signAdminToken(userId, expiresAt, secret)`, `verifyAdminToken(token, userId, secret)` (HMAC-SHA256 qua WebCrypto, so sánh constant-time). Thuần testable trong `node:test`.
- `supabase/functions/_shared/auth.ts` — thêm `requireAdminToken(request, context)` đọc header `x-admin-token`.
- `supabase/functions/admin-session/index.ts` — `POST { password }` → so sánh `ADMIN_PASSWORD` → trả `{ token, expiresAt }`.
- `supabase/functions/admin-data/index.ts` — `POST { action, ... }`, các action: `dashboard`, `delete_essay`, `prompt_set_status`, `vocabulary_update`, `vocabulary_delete`, `vocabulary_create`, `job_retry`, `jobs_retry_failed`.
- `supabase/scripts/deploy-functions.mjs` — thêm 2 function vào danh sách + set secret `ADMIN_PASSWORD`.

**Frontend**
- `src/lib/adminSession.ts` — lưu/đọc/xoá token trong `sessionStorage`, gọi Edge Function kèm header token.
- `src/lib/adminLogic.ts` — logic thuần: gom đề đã làm, tính đề còn lại, phần trăm độ phủ, định dạng số. Có test.
- `src/lib/adminRepository.ts` — đọc dữ liệu admin (PostgREST) + gọi `admin-data`.
- `src/components/AdminGate.tsx` — kiểm tra role (đọc `user_access` của chính mình) → nếu không phải admin: thông báo không có quyền; nếu là admin mà chưa có token: màn hình nhập mật khẩu quản trị.
- `src/pages/Admin.tsx` — vỏ trang + tab; mỗi tab tách file trong `src/pages/admin/` (file hiện tại sẽ vượt 400 dòng nếu gộp tất cả).

## Tài khoản admin

Tạo user Supabase `admin@gmail.com` / `admin123` (`email_confirm: true`) → trigger `handle_new_user` tự tạo `profiles` + `user_access` → cập nhật `user_access.role = 'admin'`.

## Lỗi và giới hạn

- Sai mật khẩu quản trị → `401 invalid_admin_password`, không phát ra token.
- Token hết hạn/sai → `401 invalid_admin_token`; UI tự khoá phiên quản trị và yêu cầu nhập lại.
- Không có role admin → `403 forbidden`; UI hiện thông báo "không có quyền", không tải dữ liệu.
- Mọi thao tác ghi trả về lỗi rõ ràng qua `errorResponse` chuẩn của Edge Function.

## Test

- `tests/admin.test.ts` — logic thuần: gom đề đã làm, đề còn lại, độ phủ, cắt chuỗi.
- `supabase/functions/_shared/tests/adminSession.test.ts` — ký/xác minh token: đúng user, sai user, hết hạn, chữ ký sai.
- `tests/admin-console.mjs` — browser: đăng nhập admin → nhập mật khẩu quản trị → dashboard có số liệu → danh sách user → chi tiết user có "đề đã làm" và "đề còn lại".
- `tests/production.mjs` — không đổi (trang admin cần đăng nhập).

## Deploy

1. `npm run db:migrate` (migration 019)
2. Tạo tài khoản admin + `npm run db:deploy` (2 function mới, set secret `ADMIN_PASSWORD`)
3. `git push origin main` (kèm fix theme sáng/tối đang chờ) rồi `npx vercel --prod --yes`
4. Verify: smoke test production + test admin console trên production.

## Rủi ro

- **Mật khẩu yếu** (`admin123`) cho cả tài khoản admin lẫn cổng quản trị. Chấp nhận được lúc này; nên đổi sau khi mọi thứ chạy ổn định.
- Token quản trị nằm trong `sessionStorage`: đóng tab là mất phiên quản trị, đăng nhập lại bằng mật khẩu là vào tiếp.
