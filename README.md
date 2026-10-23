# IELTS Writing Studio

Giao diện luyện IELTS Writing song ngữ Việt/Anh, xây mới theo thiết kế tại `docs/superpowers/specs/2026-10-24-ielts-ai-platform-design.md`. Bản hiện tại là **frontend chạy độc lập**: mọi tính năng dùng được với dữ liệu lưu trong trình duyệt, phần chấm AI / tài khoản / quản trị chưa nối backend và được ghi rõ trên giao diện.

## Chạy dự án

```bash
npm install
npm run dev        # http://127.0.0.1:5173
npm run build      # kiểm tra kiểu + build production vào dist/
npm run preview    # xem bản build
```

## Kiểm thử

```bash
npm test                      # logic học tập: đếm từ, lịch ôn, kiểm tra ảnh (node:test)
node tests/browser.mjs        # luồng trình duyệt thật (Playwright, cần dev server đang chạy)
node tests/accessibility.mjs  # axe WCAG 2.1 AA trên 6 route
node tests/screenshots.mjs    # ảnh chụp màn hình vào test-results/
```

`tests/browser.mjs` và `tests/accessibility.mjs` dùng `http://127.0.0.1:5173`; đổi qua biến môi trường `TEST_URL` nếu chạy cổng khác.

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `src/App.tsx` | Bảng định tuyến (data router) cho toàn bộ route |
| `src/main.tsx` | Điểm khởi tạo: provider lưu trữ → router → ứng dụng |
| `src/styles.css` | Design system: màu, typography, layout, responsive, trạng thái |
| `src/i18n.ts` | Khởi tạo VI/EN, lưu lựa chọn ngôn ngữ |
| `src/lib/learning.ts` | Đếm từ, lịch ôn 1-3-7-14-30-60 ngày, kiểm tra ảnh đầu vào |
| `src/lib/store.tsx` | Lưu trữ IndexedDB: nháp, ảnh, thẻ ôn, tiến độ đọc, hồ sơ |
| `src/data/content.ts` | Nội dung biên soạn: đề bài, khung bài, bài mẫu, từ vựng, Master Guide |
| `src/components/Layout.tsx` | Khung ứng dụng: sidebar desktop, thanh điều hướng dưới cho mobile |
| `src/pages/` | Tổng quan, viết bài, bài viết, từ vựng, ôn tập, thư viện, Master Guide, công cụ, donate, cài đặt, quản trị |
| `design-system/ielts/MASTER.md` | Quy tắc thiết kế áp dụng cho toàn bộ giao diện |

## Hành vi hiện tại

- Nháp, ảnh đề bài, thẻ ôn tập và tiến độ đọc lưu trong IndexedDB của trình duyệt; hai tab đồng bộ qua `BroadcastChannel`.
- Rời trang khi nháp chưa lưu sẽ hiện hộp thoại *Lưu và rời đi* / *Tiếp tục viết*.
- Đổi loại bài giữ nguyên dữ liệu nếu bạn bấm lại đúng loại đang chọn; khi đổi thật sẽ hỏi trước khi xóa dữ liệu tham chiếu và ảnh.
- Lịch ôn: nhớ lần đầu hẹn 1 ngày, sau đó 3-7-14-30-60 ngày; quên thì đặt lại về 1 ngày. Lưu trùng một thẻ không làm đổi lịch.
- Nút *Chấm bài*, *Đọc dữ liệu từ ảnh*, các công cụ AI và trang đăng nhập hiện thông báo chưa kết nối backend, không sinh điểm giả.
- Trang *Kết quả minh họa* (`/app/essays/demo`) là dữ liệu trình diễn giao diện, được gắn nhãn minh họa.

## Bước kế tiếp (backend)

Thứ tự triển khai theo `docs/superpowers/specs/2026-10-24-ielts-ai-platform-design.md`: Supabase (Auth, Postgres, Storage riêng tư, Edge Functions) → hàng đợi chấm bài với Claude Sonnet 4.6 / Haiku 4.5 → RLS và hạn dụng AI → nối frontend vào API thật.
