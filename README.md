# IELTS Writing Studio

Giao diện luyện IELTS Writing song ngữ Việt/Anh, xây mới theo thiết kế tại `docs/superpowers/specs/2026-10-24-ielts-ai-platform-design.md`.

Ứng dụng chạy trên **Supabase**: tài khoản người dùng, nháp, thẻ ôn tập, tiến độ đọc và kho đề bài đều nằm trong Postgres; phần chấm bài và công cụ AI chạy qua Edge Functions.

## Chạy dự án

```bash
npm install
cp .env.example .env.local     # điền VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev                    # http://127.0.0.1:5173
npm run build                  # kiểm tra kiểu + build production vào dist/
npm run preview                # xem bản build
```

## Kiểm thử

```bash
npm test                       # 28 test logic thuần: học tập, auth, đồng bộ, AI
npm run test:edge              # 31 test hợp đồng của Edge Function
node tests/browser.mjs         # luồng trình duyệt thật (Playwright, cần dev server)
node tests/accessibility.mjs   # axe WCAG 2.1 AA trên 6 route, cả theme sáng và tối
node tests/i18n.mjs            # kiểm tra song ngữ VI/EN trên 19 route
node tests/prompt-images.mjs   # ảnh đề Task 1: cuộn hết lưới rồi xác nhận không ảnh hỏng
node tests/screenshots.mjs     # ảnh chụp màn hình vào test-results/
```

Các script trình duyệt dùng `http://127.0.0.1:5173`; đổi qua biến môi trường `TEST_URL` nếu chạy cổng khác.

## Backend

```bash
npm run db:migrate             # áp dụng 12 file migration (idempotent)
npm run db:verify              # kiểm tra schema + RLS (27 check)
npm run db:seed                # nạp nội dung, đề bài và bảng giá AI
npm run db:prune               # dọn đề Task 1 trùng (dry-run, thêm --apply để xoá)
npm run db:deploy              # deploy 10 Edge Function + set secrets
```

`db:deploy` cần `SUPABASE_ACCESS_TOKEN` trong `.env.local`. Xem `supabase/README.md` cho thứ tự chạy, hợp đồng bảng và quy trình đổi secret.

## Deploy

### Frontend → Vercel

Cấu hình sẵn trong `vercel.json` (SPA fallback + cache header) và `.github/workflows/deploy.yml` (deploy tự động khi push lên `main`).

1. Vercel → **Add New → Project** → **Import** repo `Huybuiii04/huybui`.
2. Framework preset: **Vite** · Build command: `npm run build` · Output: `dist`.
3. **Settings → Environment Variables** — thêm 2 biến cho cả Production và Preview:

   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://fjlyjaomuxotqqjvugtv.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` (lấy từ Supabase Dashboard → API) |

4. Deploy. Từ đó mỗ lần push lên `main` Vercel tự build và đổi URL production.

Nếu muốn deploy bằng GitHub Actions, thêm 3 **Secrets** (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) và 2 **Variables** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) trong repo.

### Edge Functions → Supabase

```bash
npm run db:deploy
```

Cần `SUPABASE_ACCESS_TOKEN` trong `.env.local`. Xem `supabase/README.md` cho thứ tự chạy, hợp đồng bảng và quy trình đổi secret.

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `src/App.tsx` | Bảng định tuyến (data router); `RouteGuard` bảo vệ `/app/**` và `/admin` |
| `src/main.tsx` | Điểm khởi tạo: `AuthProvider` → `StoreProvider` → router |
| `src/styles.css` | Design system theo token: màu hai theme, kính, gradient, responsive, trạng thái |
| `src/i18n.ts` · `src/theme.ts` | Khởi tạo VI/EN; theme sáng/tối/theo hệ thống |
| `src/lib/auth.tsx` · `authLogic.ts` | Đăng nhập/đăng ký/đặt lại mật khẩu; phân loại lỗi thành mã thân thiện |
| `src/lib/store.tsx` | Nguồn sự thật: Postgres khi đã đăng nhập, IndexedDB làm cache offline |
| `src/lib/sync.ts` | Ánh xạ dữ liệu Postgres ⇄ model của app |
| `src/lib/ai.ts` · `aiLogic.ts` | Gọi Edge Function (chấm bài, công cụ AI, admin) + logic thuần đi kèm |
| `src/lib/promptRepository.ts` | Đọc đề/chủ đề/dạng biểu đồ từ PostgREST |
| `src/components/GradingResult.tsx` | Hiển thị kết quả chấm: 4 tiêu chí, dẫn chứng, hành động |
| `src/components/ChartPreview.tsx` | Dựng biểu đồ SVG từ dữ liệu của đề |
| `src/pages/` | Tổng quan, viết bài, bài viết, kho đề, từ vựng, ôn tập, thư viện, Master Guide, công cụ, donate, cài đặt, quản trị |
| `supabase/migrations/` | 12 migration: identity, content, essays/jobs/grading, learning, admin, kho đề, hardening AI |
| `supabase/functions/` | 10 Edge Function + `_shared` (client Anthropic, schema, hợp đồng AI) |
| `supabase/seed/` | Nạp nội dung, 244 đề Task 2, 70 đề Task 1 có ảnh, bảng giá AI |
| `debai/` | Bộ đề gốc (190 đề Task 2 + 70 đề Task 1 kèm ảnh) dùng làm nguồn cho seed |

## Kho đề bài (`/app/prompts`)

Đề **không nằm trong mã nguồn** — frontend đọc từ backend qua `src/lib/promptRepository.ts`.

- **Luồng:** chọn loại bài (Task 2 / Task 1 Academic / Task 1 General) → chọn **chủ đề** → bấm vào chủ đề để mở **danh sách đề** của chủ đề đó → chọn 1 đề → *Thi thử* (đồng hồ đếm ngược 40/20 phút) hoặc *Luyện tập*.
- **Task 1 Academic chia theo 7 dạng biểu đồ**: Line Graph · Bar Chart · Pie Chart · Table · Map / Floor Plan · Process Diagram · Mixed Charts — đề có ảnh thật trong bucket `prompt-media`.
- Lưới chủ đề của Task 2 / Task 1 General đọc từ bảng `prompt_topics`; danh sách đề lọc phía server bằng `topics=cs.{key}`.
- Dưới lưới chủ đề là lưới **tất cả đề** của loại bài đang chọn, kèm ô tìm kiếm và thẻ *Tự nhập đề bài của bạn*.
- Khi mở tab *Bài viết*, **đề vẫn hiện ngay trên đầu vùng viết**.

## Hành vi hiện tại

- Giao diện gradient + kính, hỗ trợ theme **sáng / tối / theo hệ thống**.
- **Tài khoản thật**: đăng ký, đăng nhập, quên/đặt lại mật khẩu. Route `/app/**` và `/admin` yêu cầu đăng nhập; landing và `/library` công khai.
- Nháp, ảnh đề bài, thẻ ôn tập và tiến độ đọc lưu trong Postgres; IndexedDB giữ bản cache offline và ảnh chưa tải lên xong.
- Nút *Chấm bài* đẩy bài vào hàng đợi AI và hiện kết quả theo 4 tiêu chí (Task Response/Task Achievement, Coherence, Lexical, Grammar) kèm dẫn chứng trích từ bài.
- Bộ công cụ AI (Magic Rewrite, Argument Stress Test, Critical Thinking) và nút *Đọc dữ liệu từ ảnh* gọi Edge Function thật.
- Trang *Quản trị* đọc số liệu token/chi phí từ `admin-usage`.
- Rời trang khi nháp chưa lưu sẽ hiện hộp thoại *Lưu và rời đi* / *Tiếp tục viết*.
- Đổi loại bài giữ nguyên dữ liệu nếu bạn bấm lại đúng loại đang chọn.
- Trang *Kết quả minh họa* (`/app/essays/demo`) là dữ liệu trình diễn giao diện, được gắn nhãn minh họa.

## Bước kế tiếp

1. Deploy Edge Function và set secret: `npm run db:deploy` (cần `SUPABASE_ACCESS_TOKEN`, `ANTHROPIC_API_KEY`, `WORKER_SECRET`).
2. Bật cron gọi worker `process-ai-jobs` (SQL mẫu trong `supabase/functions/README.md`).
3. Bật xác minh email trong Supabase Dashboard.
4. Đổi mật khẩu DB và tạo lại secret key trong Dashboard.
5. Thêm bảng `user_prompts` (đề của người dùng) và bật Realtime để đồng bộ nhiều thiết bị.
