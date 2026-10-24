# Plan 2 — Auth trên frontend

Trạng thái: **đã làm** trong nhánh `main` của repo `D:\ielts`.
Phạm vi: chỉ frontend. Database đã chạy thật ở nhánh `feature/db-foundation`
(`supabase/README.md`, `docs/superpowers/plans/2026-10-24-backend-todo.md` §B).

---

## 1. File đã tạo / sửa

| File | Vai trò |
|---|---|
| `src/lib/supabase.ts` | Tạo client Supabase (`persistSession`, `autoRefreshToken`, `detectSessionInUrl`) + cờ `isConfigured` khi env thiếu |
| `src/lib/authLogic.ts` | Logic thuần: phân loại lỗi Supabase → mã thân thiện, chuẩn hoá `target_band`, đổi hồ sơ hai chiều |
| `src/lib/auth.tsx` | `AuthProvider` + hook `useAuth()` (đăng ký, đăng nhập, đăng xuất, gửi email reset, đổi mật khẩu, nạp lại hồ sơ) |
| `src/lib/profile.ts` | Đọc/ghi bảng `profiles` (upsert `onConflict: 'id'`, fallback update) |
| `src/lib/session.ts` | Hook `useSession()` độc lập với `AuthProvider` — store dùng để biết đã đăng nhập chưa |
| `src/lib/sync.ts` | Logic thuần ánh xạ row của Postgres ⇄ model của app (`essays`, `study_cards`, `guide_progress`, ảnh) |
| `src/lib/store.tsx` | Store: Supabase là nguồn sự thật khi đã đăng nhập, IndexedDB làm cache offline |
| `src/components/RouteGuard.tsx` | `RouteGuard` (bảo vệ route), `PublicOnly`, `SuspendedNotice` |
| `src/pages/Auth.tsx` | Màn hình auth thật (đăng ký / đăng nhập / quên mật khẩu / đặt lại mật khẩu) |
| `tests/auth.test.ts` | Test thuần cho logic auth + phân loại lỗi |
| `tests/sync.test.ts` | Test thuần cho ánh xạ dữ liệu |
| `package.json` | Thêm `@supabase/supabase-js@^2`; `npm test` chạy thêm 2 file test mới |
| `.env.example` | Ghi chú rõ 2 biến `VITE_` dùng cho cả đọc dữ liệu lẫn đăng nhập |

Không sửa `src/App.tsx`, `src/main.tsx`, `src/pages/Other.tsx` (xem §5).

---

## 2. Hợp đồng RPC / bảng đã dùng

| Hợp đồng | Dùng ở đâu | Ghi chú |
|---|---|---|
| `save_draft(p_essay_id, p_expected_version, p_task_type, p_subtype, p_title, p_prompt_text, p_body_text, p_reference_data, p_target_band, p_feedback_locale, p_draft)` → `{essay_id, draft_version}` | `store.saveDraft()` | `p_draft` chứa `client_id` (giữ nguyên URL `/app/write?id=…`) và mảng ảnh đã đồng bộ. `p_expected_version` = `draft_version` của lần ghi trước → 409 khi xung đột |
| `save_study_card(p_kind, p_front, p_back, p_example, p_dedupe_key, p_tags)` → `{card_id, level, due_at, created}` | `store.addCard()`, `store.migrateLocal()` | `p_dedupe_key = null` → DB tự dedupe theo `lower(front)::kind` |
| `review_card(p_card_id, p_remembered, p_request_id)` → `{level, due_at, replayed}` | `store.review()` | `p_request_id` là UUID sinh mỗi lần; DB tự xử lý replay |
| `complete_guide(p_entry_id, p_completed)` → boolean | `store.update()` (đánh dấu guide đã đọc) | `p_entry_id` = `content_entries.id`; map slug ⇄ id lấy từ `content_entries` (`kind = 'guide'`) |
| `.from('essays').select('*')` | `store.loadRemote()` | RLS đã lọc theo chủ sở hữu |
| `.from('study_cards').select('*')` | `store.loadRemote()` | |
| `.from('guide_progress').select('entry_id')` | `store.loadRemote()` | |
| `.from('profiles').select('*').eq('id', uid)` | `store.loadRemote()`, `auth.tsx` | |
| `.from('profiles').upsert(row, { onConflict: 'id' })` | `profile.saveProfileRow()` | Cột: `display_name`, `ui_locale`, `feedback_locale`, `timezone`, `target_band` |
| `.from('content_entries').select('id,slug').eq('kind','guide')` | `store.tsx` | Ánh xạ slug của guide ⇄ uuid cho `complete_guide` |
| Edge Function `prepare-upload` | `store.syncImages()` | **Chưa tồn tại** — xem §4 |
| Storage bucket `essay-images` | `store.syncImages()` | Chỉ dùng sau khi `prepare-upload` trả `objectPath` |

### Ánh xạ dữ liệu

- `essays` → `Draft`: `title`, `task_type`→`task`, `subtype`, `prompt_text`→`prompt`,
  `body_text`→`text`, `reference_data`→`reference`, `target_band`→`target` (chuẩn hoá `numeric(2,1)`),
  `draft.client_id`→`id` (giữ URL), `updated_at`→`updatedAt`.
- `study_cards` → `Card`: `front`→`term`, `back`→`meaning`, `example`, `kind`, `level`, `due_at`→`dueAt`.
  Lưu ý DB có thêm kind `collocation`; frontend chỉ dùng `vocabulary | structure | error`.
- `guide_progress.entry_id` → slug của guide (tra ngược qua `content_entries`).

### Lỗi

`private.raise_http_error()` trả về `SQLSTATE PGRST` với `message` là JSON
(`{"code":"suspended"|"draft_conflict"|…}`) và `detail` chứa HTTP status.
`authLogic.classifyRemoteError()` bóc ra mã để UI hiển thị:

| Mã | Thông điệp |
|---|---|
| `suspended` | "Tài khoản đang bị tạm khóa." — ghi dữ liệu bị chặn, `store.suspended = true` |
| `draft_conflict` | "Dữ liệu đã thay đổi ở nơi khác." — ném `Error('conflict')` để `Writing.tsx` hiện trạng thái xung đột |
| `card_not_due` | Thẻ chưa đến hạn ôn — bỏ qua, không phải lỗi |
| `unauthenticated` | Phiên hết hạn |
| `network` | Không kết nối được máy chủ |

Lỗi của `signIn`/`signUp`/`sendReset`/`updatePassword` được đổi thành mã thân thiện
(`invalid_credentials`, `email_taken`, `weak_password`, `email_not_confirmed`, `rate_limited`, …);
**không** có raw error object nào đi lên UI.

---

## 3. Store: nguồn sự thật & cache offline

- **Đã đăng nhập** → Postgres là nguồn sự thật. Đọc `essays`, `study_cards`, `guide_progress`, `profiles`;
  ghi qua các RPC ở bảng trên.
- **Chưa đăng nhập** → IndexedDB (`ielts-studio` / object store `state` / key `app`) là nguồn duy nhất,
  đúng như trước.
- **IndexedDB luôn được ghi** kể cả khi đã đăng nhập → dùng làm cache offline và giữ ảnh chưa đồng bộ.
- Lần đăng nhập đầu tiên: `store.migrateLocal()` đẩy bản nháp / thẻ / guide đã đọc chỉ có trong IndexedDB lên
  Supabase (bỏ qua bản trùng theo `client_id` và `lower(front)::kind`).
- `BroadcastChannel('ielts-studio')` **giữ lại** để đồng bộ tab, nhưng nội dung luôn nạp lại từ database.
- API công khai giữ nguyên: `state`, `ready`, `error`, `update`, `saveDraft`, `addCard`, `review`,
  `addPrompt`, `removePrompt`. Thêm: `suspended`, `signedIn`.
- `saveDraft(draft, expected)` trả về số timestamp như cũ; ở chế độ đăng nhập, `expected` được bỏ qua vì
  optimistic concurrency do `draft_version` của DB đảm nhiệm.

### Ảnh đề bài

`store.syncImages()` gọi `supabase.functions.invoke('prepare-upload', …)` với
`{ essayId, mimeType, byteSize, sha256 }`. **Edge Function này chưa tồn tại** nên lời gọi luôn thất bại:

1. Ảnh được giữ trong IndexedDB với nhãn **"chưa đồng bộ"** (`UNSYNCED_IMAGE_LABEL` trong `src/lib/sync.ts`).
2. Không ghi `images` vào `p_draft` của `save_draft` → database không bị phình dữ liệu ảnh.
3. Khi nạp lại từ database, `mergeImages()` ghép lại ảnh cục bộ theo tên → người dùng không mất ảnh đã chọn.

Khi `prepare-upload` được triển khai (Plan 3), luồng sẽ tự động hoàn tất: nhận `objectPath` →
`storage.from('essay-images').uploadToSignedUrl(...)` → ghi `path` vào `p_draft`.

---

## 4. Cần nối vào `App.tsx` / `main.tsx` (chưa làm — để tránh xung đột)

### `src/main.tsx`

```diff
+ import { AuthProvider } from './lib/auth'
  ...
- createRoot(...).render(<StrictMode><ErrorBoundary><StoreProvider><RouterProvider router={router} /></StoreProvider></ErrorBoundary></StrictMode>)
+ createRoot(...).render(<StrictMode><ErrorBoundary><AuthProvider><StoreProvider><RouterProvider router={router} /></StoreProvider></AuthProvider></ErrorBoundary></StrictMode>)
```

`AuthProvider` phải **ngoài** `StoreProvider` vì `RouteGuard` dùng `useAuth()` và `store` dùng `useSession()`.

### `src/App.tsx`

```diff
- import { Landing, Auth, Tools, Donate, Settings, Admin, NotFound } from './pages/Other'
+ import { Landing, Tools, Donate, Settings, Admin, NotFound } from './pages/Other'
+ import { Auth } from './pages/Auth'
+ import { RouteGuard } from './components/RouteGuard'
```

Bọc các route cần đăng nhập (`/app/**` và `/admin`) trong `RouteGuard`.
Cách gọn nhất — dùng `RouteGuard` như một layout route:

```diff
      <Route element={<Layout />}>
-       <Route path="/app" element={<Dashboard />} />
+       <Route element={<RouteGuard />}>
+         <Route path="/app" element={<Dashboard />} />
+         <Route path="/app/write" element={<Suspense fallback={<AppFallback />}><Writing /></Suspense>} />
+         <Route path="/app/prompts" element={<Suspense fallback={<AppFallback />}><Prompts /></Suspense>} />
+         <Route path="/app/essays" element={<Essays />} />
+         <Route path="/app/essays/:id" element={<EssayDetail />} />
+         <Route path="/app/vocabulary" element={<Vocabulary />} />
+         <Route path="/app/review" element={<Review />} />
+         <Route path="/app/errors" element={<Errors />} />
+         <Route path="/app/tools" element={<Tools />} />
+         <Route path="/app/settings" element={<Settings />} />
+         <Route path="/admin" element={<Admin />} />
+       </Route>
        <Route path="/library" element={<Library />} />
        …
      </Route>
```

`RouteGuard` tự render `<Outlet />` khi không có `children`, nên dùng được cả hai kiểu.

### `src/pages/Other.tsx`

`Other.tsx` vẫn còn export `Auth` cũ (placeholder). Có thể giữ nguyên rồi xoá sau khi `App.tsx`
trỏ sang `./pages/Auth` — hoặc xoá ngay export `Auth` trong `Other.tsx` để tránh nhập nhầm.

---

## 5. Cách đăng nhập thử

1. Copy `.env.example` → `.env.local` (đã có sẵn giá trị project `fjlyjaomuxotqqjvugtv`):
   ```bash
   cp .env.example .env.local
   npm run dev
   ```
2. Mở `http://127.0.0.1:5173/auth`.
3. **Đăng ký**: email + mật khẩu ≥ 8 ký tự + tên hiển thị.
   Trigger `private.handle_new_user()` của DB tự tạo hàng `profiles` và `user_access`.
   Nếu Dashboard bật xác nhận email, màn hình sẽ báo "Đã tạo tài khoản. Kiểm tra email để xác nhận".
4. **Đăng nhập**: email + mật khẩu. Vào `/app` — bản nháp/thẻ/guide sẽ nạp từ Postgres.
5. **Quên mật khẩu**: nhập email → Supabase gửi link, redirect về `/auth/reset-password`.
   Mở link → màn hình đặt mật khẩu mới (session recovery do `detectSessionInUrl` xử lý).
6. Kiểm tra dữ liệu đã lên DB:
   ```sql
   select id, title, task_type, draft_version from public.essays order by updated_at desc;
   select front, back, kind, level, due_at from public.study_cards;
   select * from public.profiles;
   ```

---

## 6. Giới hạn còn lại

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Edge Function `prepare-upload` | **Chưa có** | Ảnh chỉ nằm ở IndexedDB, nhãn "chưa đồng bộ". Cần `supabase/functions/prepare-upload` (Plan 3, §C2) |
| Storage `essay-images` | Có bucket (private) | Chỉ dùng được sau khi `prepare-upload` cấp `objectPath`; bucket đã có policy owner |
| Đề của người dùng (`prompts` / `user_prompts`) | **Chưa có** | `store.addPrompt`/`removePrompt` vẫn chỉ lưu IndexedDB. Backend todo §B3 ghi rõ cần `created_by` + RLS owner |
| Realtime đồng bộ nhiều tab | Chưa dùng | Đang dùng `BroadcastChannel` + nạp lại từ DB; chưa bật Realtime |
| Xác minh email | Phụ thuộc Dashboard | Bật trong Supabase Dashboard để bắt buộc xác nhận email |
| Đồng bộ ảnh giữa nhiều thiết bị | Chưa có | Ảnh chưa đồng bộ nên chỉ hiện trên máy đã chọn ảnh |
| `profiles` chỉ có quyền `SELECT` + `UPDATE` | Đã xử lý | `saveProfileRow()` thử `upsert` trước, nếu bị từ chối (`permission denied for table profiles`) thì fallback sang `update` |
| `target_band` là `numeric(2,1)` | Đã chuẩn hoá | `normalizeBand()` trong `authLogic.ts`; frontend vẫn dùng chuỗi `"7.0"` |
| Vai trò admin | Chưa dùng trong UI | Quyền nằm ở `public.user_access.role`; `/admin` hiện chỉ yêu cầu đăng nhập |

---

## 7. Kiểm thử

```bash
npm test        # 18 test: learning (3) + auth (6) + sync (9)
npm run build   # tsc --noEmit && vite build — sạch
```

Test mới chỉ phủ **logic thuần** (`src/lib/authLogic.ts`, `src/lib/sync.ts`) vì test runner là
`node --test` chạy trực tiếp file TypeScript (Node 24) — không có DOM, không render React.
Phần gọi mạng (Supabase) được kiểm tra tay theo §5.
