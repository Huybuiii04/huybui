# IELTS Studio — giao diện theo mẫu 123

Nguồn hiện tại: `123.html` và `123.md` người dùng cung cấp ngày 29/10/2026. Thay thế định hướng kính/gradient cũ. Phạm vi: toàn bộ trang chủ, không gian học, đăng nhập, quản trị và tài liệu công khai. Chỉ thay đổi cục bộ; không deploy hoặc push GitHub.

## Nhận diện

- Nền nâu ấm, chữ kem, cam nhấn. Sáng: nền giấy, chữ nâu đậm.
- Biểu tượng gốc từ logo người dùng gửi, tách nền trong suốt; đi cùng tên `IELTS Studio` thích ứng sáng/tối. Dùng chung trang chủ, sidebar, đăng nhập, tài liệu công khai và favicon.
- Heading Fraunces; nội dung DM Sans, Be Vietnam Pro dự phòng ký tự tiếng Việt.
- Font tự phục vụ từ `public/fonts/`, giấy phép OFL đi kèm. Không cần Google Fonts khi mở web.
- Viền rõ, nút bo 12px, panel 16–20px. Bóng cứng nhẹ cho nút và thẻ phối cảnh như mẫu.

## Token

| Token | Sáng | Tối |
| --- | --- | --- |
| `--bg` | `#F5F0E6` | `#1D1916` |
| `--surface` | `#FFFBF3` | `#28231F` |
| `--text` | `#2A2420` | `#F0E9DD` |
| `--brand` | `#b44719` | `#F0A560` |
| `--skill-listening` | `#D6E1E8` | `#2F3A42` |
| `--skill-reading` | `#F2E1A6` | `#4A402A` |
| `--skill-speaking` | `#F4CBBF` | `#4F3029` |

Cam ở chế độ sáng được làm đậm nhẹ để chữ trắng đủ tương phản. Token nằm tại `src/styles.css`; không đặt màu riêng trong component mới.

## Bố cục và hành vi

- Trang chủ: hero hai cột không gạch chân trang trí, bốn thẻ kỹ năng có chuyển động; danh sách năm mục; ba bước học; band minh họa; ủng hộ. Footer gọn theo ảnh bổ sung: logo nhỏ, bản quyền, About/Contact/Privacy và Bắt đầu học; một hàng trên desktop, xếp lại trên điện thoại.
- Không gian học: sidebar 252px, topbar phẳng cố định, nội dung thích ứng kích thước màn hình. Điện thoại dùng menu và thanh điều hướng dưới.
- Chữ điều hướng và nội dung Overview 16px; thông tin phụ 14–15px. Sidebar bỏ khối giới thiệu và thẻ ủng hộ lớn để giảm cuộn. Overview gom Reading/Task 1/Task 2 thành ba cột, thống kê gọn, bài gần đây và ôn từ vựng cùng hàng; điện thoại chuyển một cột.
- Listening/Speaking hiển thị `Sắp có`; Reading/Writing dùng route đang hoạt động.
- React tăng cường cùng HTML đã escape do máy chủ dựng; giữ chuyển ngôn ngữ/theme và điều hướng nội bộ. About/Contact/Privacy độc lập, song ngữ, dùng chung theme.
- Ngôn ngữ lưu `ielts-language`; giao diện lưu `ielts-theme`, mặc định sáng. Giữ lựa chọn đã lưu của người dùng.
- Tôn trọng `prefers-reduced-motion`, focus rõ, vùng bài đọc cuộn được bằng bàn phím.

## Kiểm tra cục bộ

`npm run build`, `npm test`, `node tests/build-output.mjs`, `node tests/landing-static.mjs`, `node tests/studio-ui.mjs` với preview cục bộ ở cổng 5180. Kiểm tra UI chặn toàn bộ request ngoài máy và dùng dữ liệu giả, không ghi database thật. Ảnh và báo cáo trong `test-results/reference-ui/`.

Kết quả: build thành công; 226 unit test và 118 edge test qua; 102 lượt kiểm tra UI toàn trang cùng 6 lượt kiểm tra dashboard sau sửa lỗi qua. Không phát hiện tràn ngang, lỗi runtime hay vi phạm axe WCAG AA trong các ca đã chạy. Trang chủ tĩnh/React lệch 0px ở các kích thước được đo.
