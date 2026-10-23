# IELTS — Design System

Nguồn: hướng dẫn UI UX Pro Max + lựa chọn đã duyệt của người dùng. Phong cách Minimalism & Swiss, Teal + Amber, song ngữ VI/EN. Áp dụng toàn app.

## Màu semantic

| Token | Giá trị | Dùng cho |
|---|---|---|
| background | `#F0FDFA` | Nền tổng thể |
| surface | `#FFFFFF` | Card, editor, panel |
| foreground | `#0F172A` | Nội dung chính |
| muted-foreground | `#475569` | Chú thích, metadata |
| brand | `#0D9488` | Nhận diện, trang trí |
| primary | `#0F766E` | CTA có chữ trắng |
| primary-foreground | `#FFFFFF` | Nhãn CTA |
| primary-hover | `#115E59` | Hover/pressed |
| secondary | `#CCFBF1` | Badge nhẹ, nền selected |
| secondary-foreground | `#134E4A` | Chữ trên secondary |
| accent | `#D97706` | Donate, điểm nhấn |
| accent-foreground | `#0F172A` | Chữ trên amber |
| border | `#CBD5E1` | Phân cách nhẹ |
| input-border | `#64748B` | Ranh giới control cần nhận biết |
| focus-ring | `#0F766E` | Focus có offset trắng |
| destructive | `#DC2626` | Lỗi và hành động xóa |
| destructive-foreground | `#FFFFFF` | Chữ trên nút đỏ |

Không dùng chữ trắng cỡ nhỏ trên brand teal `#0D9488` hoặc amber `#D97706`. Không truyền thông tin bằng màu đơn độc; kèm nhãn/icon. Contrast chữ thường tối thiểu 4.5:1, thành phần điều khiển/focus tối thiểu 3:1 theo ngữ cảnh.

## Typography

- Heading tiếng Anh: Outfit 600/700; heading tiếng Việt và body: Work Sans 400/500/600. Tự host WOFF2, xác minh glyph tiếng Việt của font dùng khi build.
- Fallback: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Body 16px/1.6; editor 18px/1.8; caption tối thiểu 13px/1.5; h1 32–40px; h2 24–28px; h3 20px.
- Bài viết và guide có chiều dài dòng khoảng 65–75 ký tự. Điểm dùng tabular numerals; không dùng font code làm body.

## Layout

- Khoảng cách: 4, 8, 12, 16, 24, 32, 48, 64px.
- Sidebar desktop 248px; header 64px; nội dung tối đa 1440px; guide tối đa 760px cho phần đọc.
- Mobile padding 16px, tablet 24px, desktop 32px. Touch target ít nhất 44×44px, khoảng cách tối thiểu 8px.
- Card radius 12px, button/input 8px. Shadow nhẹ; dùng border trước khi thêm shadow.
- Dưới 768px: một cột, navigation dưới 4 mục, editor/feedback dùng tab.
- 768–1023px: navigation thu gọn; từ 1024px sidebar đầy đủ, editor hai cột.
- Bảng dữ liệu trên mobile chuyển card hoặc vùng scroll có nhãn, không làm toàn trang cuộn ngang.

## Component dùng chung

AppShell, PageHeader, TaskTypePicker, EssayEditor, PromptPanel, UploadField, JobStatus, ScoreCard, CriterionPanel, AnnotatedEssay, StudyCard, ReviewSession, ContentCard, EmptyState, ErrorState, LanguageSwitcher.

Đây là nhóm UI có hành vi dùng lại; không bắt buộc tạo abstraction trước khi có màn hình cần dùng. shadcn/ui cho dialog/tabs/select/dropdown; native textarea và input cho editor/form đơn giản.

## Quy tắc từng màn hình

- Landing: hero có CTA Viết bài, preview feedback có nhãn minh họa, ba bước sử dụng, giới thiệu tài liệu, donate nhẹ ở cuối. Không tạo testimonial/số liệu người dùng giả.
- Dashboard: lời chào ngắn, CTA viết bài, thẻ ôn đến hạn, danh sách bài gần đây, biểu đồ tiến bộ theo task có bảng dữ liệu thay thế. Không có leaderboard.
- Editor: bề mặt trắng, giảm trang trí, giữ đề/ảnh dễ đọc. Nút chấm có trạng thái gửi; luôn thấy trạng thái lưu nháp.
- Feedback: điểm trước, bằng chứng sau, hành động sửa rõ; không nhét mọi nhận xét vào một modal dài.
- Review: một thẻ mỗi lần, đáp án ẩn ban đầu, hai hành động Nhớ/Chưa nhớ dùng được bằng bàn phím; không dựa vào swipe.
- Library: bộ lọc task/type/topic, search, card đơn giản; empty state hướng dẫn đổi bộ lọc.
- Guide: mục lục desktop, drawer mobile; box cá nhân hóa tách rõ khỏi nội dung biên soạn.
- Donate: một CTA nhẹ, thông tin chuyển khoản dễ copy, QR có mô tả văn bản tương đương.
- Admin: bảng rõ trạng thái draft/published, preview trước publish, xác nhận xóa.

## Tương tác và accessibility

- Semantic HTML, skip link, thứ tự heading đúng, label thật cho input; icon-only button có accessible name.
- Focus nhìn thấy, không bị sticky header/footer che; dialog quản lý và trả focus về nút mở.
- Error summary và lỗi cạnh input; `aria-describedby` nối helper/error; job status dùng live region lịch sự, không đọc lại từng token.
- Motion CSS 150–200ms, opacity/transform; reduced-motion bỏ motion không cần thiết. Không thêm GSAP cho hiệu ứng cơ bản.
- Skeleton giữ kích thước; mạng lỗi có retry. Không tự mất dữ liệu form khi auth hết hạn.
- VI/EN không dùng cờ quốc gia thay tên ngôn ngữ. Nhãn co giãn, cho xuống dòng; không hardcode width dựa trên tiếng Anh.
- Light theme ở v1; dark mode chỉ thêm khi có yêu cầu và bảng màu được kiểm tra riêng.

## Checklist nghiệm thu UI

- Viewport 375, 768, 1024, 1440px; zoom 200%; chuỗi VI dài; bài nhiều đoạn.
- Keyboard đi hết editor, feedback annotations, upload, review, dialog.
- Kiểm tra contrast các cặp semantic, visible focus, reduced motion và loading/error/empty.
- Chưa có điểm/dữ liệu dùng nhãn trạng thái, không dùng số liệu giả.
- Không có API key, provider error raw hoặc dữ liệu riêng của user khác trên UI.
