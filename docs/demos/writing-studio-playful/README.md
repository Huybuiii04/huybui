# IELTS Writing Studio — Góc giấy nhỏ

Bản thiết kế HTML độc lập từ mẫu Light & Dark, chưa áp dụng lên website chính.

- Taste: One motif, seed `1857731012`. Góc giấy gấp nối từ logo, sân khấu trình viết đến lời mời cuối trang. Fragment ứng dụng dùng Framed sheet.
- Màu: giấy trắng hơi ấm, xanh ngọc trầm, vàng giấy nhạt; Be Vietnam Pro từ dependency sẵn có, nhúng vào HTML cùng giấy phép.
- Đọc trang: luyện IELTS Writing → xem sản phẩm → chọn đề/lưu từ → xem bốn tiêu chí → viết thử.
- Nội dung minh họa: đề online learning, cities, transport; đoạn luận giáo dục; nhận xét bốn tiêu chí. Không phải điểm thi, không gọi AI chấm bài.
- Thao tác: đổi theme, chọn đề, lưu từ, kéo bốn tiêu chí, mở trình viết, đếm từ và lưu nháp trên thiết bị. Storage lỗi vẫn cho viết và tải nháp.
- Không dùng ảnh ngoài: bốn fragment HTML thật là hình ảnh sản phẩm. Giữ chữ rõ, bấm được, không gắn ảnh kiến trúc không liên quan.

Mở `index.html` trực tiếp; hoặc chạy từ thư mục dự án:

```powershell
python -m http.server 5186 --bind 127.0.0.1 --directory docs/demos/writing-studio-playful
node docs/demos/writing-studio-playful/check.mjs
```

Để bàn: 12 cột trong khung 1280px, lề đối xứng; hero chia 5/7; công cụ chia 7/5; điện thoại xếp một cột. Bản này không thêm tài khoản, API hay thư viện mới.

Trần bản mẫu: nhận xét chỉ thuộc bài mẫu; tích hợp dịch vụ chấm thật khi áp dụng vào ứng dụng.
