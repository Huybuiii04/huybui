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
npm test                       # 46 test logic thuần: học tập, auth, đồng bộ, AI, từ vựng
npm run test:edge              # 70 test hợp đồng của Edge Function
node tests/browser.mjs         # luồng trình duyệt thật (Playwright, cần dev server)
node tests/accessibility.mjs   # axe WCAG 2.1 AA trên 6 route, cả theme sáng và tối
node tests/i18n.mjs            # kiểm tra song ngữ VI/EN trên 14 route
node tests/vocabulary-library.mjs  # thư viện 25 chủ đề: chọn chủ đề, thêm từ vào sổ, lọc
node tests/prompt-images.mjs   # ảnh đề Task 1: cuộn hết lưới rồi xác nhận không ảnh hỏng
node tests/writing-space.mjs   # không gian viết: ảnh đề, tiêu đề theo ngôn ngữ, đăng ký
node tests/auth-flow.mjs       # đăng ký → đăng xuất → đăng nhập lại (desktop + mobile)
node tests/screenshots.mjs     # ảnh chụp màn hình vào test-results/
```

Các script trình duyệt dùng `http://127.0.0.1:5173`; đổi qua biến môi trường `TEST_URL` nếu chạy cổng khác, hoặc trỏ thẳng vào bản deploy:

```bash
TEST_URL=https://huybui.vercel.app node tests/production.mjs   # smoke test bản deploy
TEST_URL=https://huybui.vercel.app node tests/browser.mjs       # toàn bộ luồng trên production
```

`tests/browser.mjs` bỏ qua các luồng cần đăng nhập nếu thiếu `TEST_EMAIL` / `TEST_PASSWORD`.

## Backend

```bash
npm run db:migrate             # áp dụng 16 file migration (idempotent)
npm run db:verify              # kiểm tra schema + RLS
npm run db:seed                # nạp nội dung, đề bài và bảng giá AI
npm run db:seed:vocabulary     # nạp thư viện từ vựng 25 chủ đề (5.000 mục)
npm run db:prune               # dọn đề Task 1 trùng (dry-run, thêm --apply để xoá)
npm run db:deploy              # deploy 10 Edge Function + set secrets
npm run db:cron                # bật cron gọi worker mỗi 10 giây
npm run auth:autoconfirm       # tắt bước xác nhận email khi đăng ký
```

`db:migrate` chạy theo hai đường: nếu có `DATABASE_URL` thì dùng `psql`, nếu không thì gọi Management API bằng `SUPABASE_ACCESS_TOKEN`.

`db:deploy` và `db:cron` cần `SUPABASE_ACCESS_TOKEN` trong `.env.local` (personal access token loại **user-scoped / full access** — token bị giới hạn scope sẽ thiếu `edge_functions_write` và `database_write`).

Xem `supabase/README.md` cho thứ tự chạy, hợp đồng bảng và quy trình đổi secret.

### Cấu hình nhà cung cấp AI

Lớp gọi AI (`supabase/functions/_shared/provider.ts`) hỗ trợ API chính thức của Anthropic **và** các bên thứ 3 (proxy Anthropic-compatible hoặc OpenAI-compatible). Cấu hình bằng secret của Edge Function:

| Secret | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_API_BASE_URL` | `https://api.anthropic.com` | Gốc endpoint. Có sẵn `/v1/messages` hoặc `/v1/chat/completions` đều được |
| `AI_API_KEY` | — | Khóa API. Rỗng thì lấy `ANTHROPIC_API_KEY` (giữ tương thích cấu hình cũ) |
| `AI_API_PROTOCOL` | `auto` | `auto` tự nhận diện theo URL → `anthropic` · `openai` |
| `AI_STRUCTURED_MODE` | `tool` | `tool` (Anthropic tool-use — model trả JSON đúng schema) · `prompt` (JSON trong system prompt) · `native` (`output_config`, chỉ API chính thức) |
| `AI_MODEL_GRADING` | — | Model chấm điểm (mặc định `claude-haiku-5-5`) |
| `AI_MODEL_EXTRACTION` | — | Model rà soát lỗi/từ vựng (mặc định `claude-haiku-5-5`) |

```bash
supabase secrets set AI_API_BASE_URL=https://api.third-party.dev AI_API_KEY=sk-...
npm run db:deploy
```

Ở chế độ `tool` (mặc định), model được ép trả kết quả đúng schema bằng **tool-use** — không cần ép bằng prompt nên không bị "rơi" sang trả văn xuôi. Chế độ `prompt` dùng cho provider không hỗ trợ tool.

## Deploy

### Frontend → Vercel

Cấu hình sẵn trong `vercel.json` (SPA fallback + cache header). Project hiện tắt tự động deploy từ GitHub (`createDeployments: disabled`), nên **deploy bằng CLI**.

Bản đang chạy: **https://huybui.vercel.app** (project `huybui04/huybui`, Node 24.x).

1. Vercel → **Add New → Project** → **Import** repo `Huybuiii04/huybui`.
2. Framework preset: **Vite** · Build command: `npm run build` · Output: `dist`.
3. **Settings → Environment Variables** — thêm 2 biến cho **Production**, **Preview** và **Development**:

   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://fjlyjaomuxotqqjvugtv.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` (publishable key — an toàn cho frontend) |

4. Deploy:

   ```bash
   git push origin main          # bắt buộc: xem lưu ý bên dưới
   npx vercel --prod --yes
   ```

Sau đó kiểm tra bản live:

```bash
TEST_URL=https://huybui.vercel.app node tests/production.mjs
```

Muốn deploy lại bản cũ thì bấm **Redeploy** trong Vercel dashboard.

> **Lưu ý về email commit:** Vercel chặn deployment nếu không map được commit author với tài khoản GitHub. Commit phải dùng email **noreply** của GitHub (`<id>+<login>@users.noreply.github.com`), không dùng email cá nhân — nếu không sẽ báo *"The deployment was blocked because Vercel couldn't find a Git account for the commit author"*.

> **Lưu ý về commit chưa push:** Vercel map author bằng cách tra commit trên GitHub. Commit chỉ có trong máy (chưa `git push`) sẽ bị chặn với thông báo *"The deployment was blocked because the commit author doesn't have permission to create deployments for this project"*. Luôn push commit lên `origin/main` **trước khi** chạy `vercel --prod`.

> **Lưu ý về GitHub App:** `Settings → Git`**Connect GitHub repository** đang ở chế độ *"Disabled"* nên push lên `main` không tự build. Muốn bật lại thì vào Vercel Dashboard → Project → Settings → Git và chọn lại repo.

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
| `src/i18n.ts` · `src/theme.ts` | Khởi tạo VI/EN (**mặc định là EN**, nhớ lựa chọn trong `localStorage`); theme sáng/tối/theo hệ thống |
| `src/lib/auth.tsx` · `authLogic.ts` | Đăng nhập/đăng ký/đặt lại mật khẩu; phân loại lỗi thành mã thân thiện |
| `src/lib/store.tsx` | Nguồn sự thật: Postgres khi đã đăng nhập, IndexedDB làm cache offline |
| `src/lib/sync.ts` | Ánh xạ dữ liệu Postgres ⇄ model của app |
| `src/lib/ai.ts` · `aiLogic.ts` | Gọi Edge Function (chấm bài, công cụ AI, admin) + logic thuần đi kèm |
| `src/lib/promptRepository.ts` | Đọc đề/chủ đề/dạng biểu đồ từ PostgREST |
| `src/lib/vocabularyLogic.ts` · `vocabularyRepository.ts` | Thư viện từ vựng 25 chủ đề: map hàng, lọc, tạo thẻ ôn tập + đọc PostgREST |
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
- **Ngôn ngữ mặc định là EN**; bấm VI ở thanh trên cùng để chuyển sang tiếng Việt. Lựa chọn được nhớ trong `localStorage`.
- **Tài khoản thật**: đăng ký, đăng nhập, quên/đặt lại mật khẩu. Đăng ký xong là đăng nhập được ngay (không có bước xác nhận email — xem `npm run auth:autoconfirm`). Route `/app/**` và `/admin` yêu cầu đăng nhập; landing và `/library` công khai.
- **Đăng xuất**: nút biểu tượng ở thanh trên cùng (desktop) và mục *Tài khoản* trong trang Cài đặt (kể cả mobile) — hiện email đang đăng nhập, bấm là quay về trang đăng nhập.
- Nháp, ảnh đề bài, thẻ ôn tập và tiến độ đọc lưu trong Postgres; IndexedDB giữ bản cache offline và ảnh chưa tải lên xong.
- **Không gian viết**: cột trái là **đề bài read-only** — ảnh đề đầy đủ (bấm để xem cỡ lớn), câu hỏi và dữ liệu tham chiếu; loại bài hiện dạng nhãn cố định, **không chuyển loại bài được** (đổi đề bằng cách chọn đề khác ở Kho đề bài). Bài viết tự do (chưa chọn đề) vẫn dán được câu hỏi và dữ liệu tham chiếu.
- Nút *Chấm bài* đẩy bài vào hàng đợi AI và hiện kết quả theo 4 tiêu chí (Task Response/Task Achievement, Coherence, Lexical, Grammar) kèm dẫn chứng trích từ bài. Thiếu dữ liệu tham chiếu thì báo `needs_reference` — **không bịa điểm**.
- **Phản hồi sâu hơn band**: sau khi có điểm, pipeline `enrich` rà soát tiếp và bổ sung 5 khối trong kết quả chấm — *Lỗi sai cần sửa* (quote → correction → giải thích), *Lộ trình lên band X* (từng bước kèm band dự kiến), *Điểm chưa hợp lý*, *Từ vựng nâng cao* (nâng cấp từ đang dùng + từ nên học theo chủ đề) và *Cấu trúc bài*. Từ gợi ý lưu thẳng vào sổ từ vựng, lỗi lưu vào sổ lỗi sai.
- **Tự thêm từ vựng**: nút *+ Thêm từ của tôi* trong khối *Từ vựng nâng cao* (hoặc *Thêm thẻ mới* ở trang Sổ từ vựng) để nhập tay — lưu vào `study_cards` nên đồng bộ mọi thiết bị và ôn tập được.
- **Thư viện từ vựng 25 chủ đề**: tab *Thư viện 25 chủ đề* trong trang Sổ từ vựng — 5.000 mục từ, cụm từ và thành ngữ xếp theo 25 chủ đề IELTS (mỗi chủ đề 200 mục). Mỗi mục có từ, từ loại, nghĩa, ghi chú cách dùng, 2 ví dụ tiếng Anh và IPA (khi có). Bấm *Thêm vào sổ* để đưa từ đó vào sổ cá nhân và ôn tập được. Dữ liệu nằm ở bảng `vocabulary_entries` (đọc công khai), nạp bằng `npm run db:seed:vocabulary`.
- Bộ công cụ AI (Magic Rewrite, Argument Stress Test, Critical Thinking) và nút *Đọc dữ liệu từ ảnh* gọi Edge Function thật.
- Trang *Quản trị* có 4 tab: nội dung, người dùng, hàng đợi AI và token/chi phí.
- Đề tự nhập lưu vào bảng `user_prompts` (có RLS theo chủ sở hữu) kèm tệp đính kèm trong bucket `user-prompt-media`.
- Đồng bộ giữa nhiều thiết bị qua Supabase Realtime; tab trong cùng máy đồng bộ qua `BroadcastChannel`.
- Rời trang khi nháp chưa lưu sẽ hiện hộp thoại *Lưu và rời đi* / *Tiếp tục viết*.
- Tiêu đề bài viết lấy theo ngôn ngữ đang dùng; người dùng tự đặt tên thì giữ nguyên tên đó.
- Trang *Kết quả minh họa* (`/app/essays/demo`) là dữ liệu trình diễn giao diện, được gắn nhãn minh họa.

## Bước kế tiếp

1. **Thêm `ANTHROPIC_API_KEY`**: lấy ở https://console.anthropic.com/settings/keys rồi đặt trong Supabase (Dashboard → Edge Functions → Secrets) hoặc chạy `npm run db:deploy` sau khi thêm key vào `.env.local`. Tới lúc đó tính năng chấm bài và công cụ AI mới trả điểm thật.
2. Cấu hình SMTP để gửi email đặt lại mật khẩu (hiện Dashboard chưa có SMTP).
3. Đổi mật khẩu DB và tạo lại secret key trong Dashboard.
4. Cấu hình tài khoản/QR donate.
5. Thêm `admin-content` hỗ trợ quản lý bộ `prompts`; đưa audit admin vào cùng transaction với mutation.
