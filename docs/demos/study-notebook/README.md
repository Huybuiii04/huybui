# Demo sổ tay học IELTS

Bản mẫu độc lập để duyệt thiết kế. Chưa sửa website chính, không kết nối Supabase hay tài khoản thật.

Chạy từ `D:/ielts`:

```powershell
python -m http.server 5176 --bind 127.0.0.1 --directory docs/demos/study-notebook
```

Mở [demo](http://127.0.0.1:5176/). Có menu, theme sáng/tối, lọc sách/test, bài đọc mẫu 6 câu với chấm và giải thích, trình viết, bản nháp trong phiên và ba thẻ từ.

Dữ liệu thử nằm trong bộ nhớ, tải lại trang sẽ đặt lại. Đề Reading được viết riêng, không phải đề Cambridge. Không có AI chấm bài.

Kiểm tra khi server đang chạy:

```powershell
node docs/demos/study-notebook/check.mjs
```

Minh họa SVG và bố cục tạo riêng cho demo. Font Be Vietnam Pro lấy từ dependency đã có, giấy phép trong `assets/FONT-LICENSE.txt`. Không lấy mã hoặc tài nguyên TID.

Taste tham chiếu bố cục Editorial greeting, seed `1139326530`; điều chỉnh màu, độ bo và minh họa theo yêu cầu vui nhộn của người dùng. Đây là bản phác thảo, chưa cập nhật design system của website chính.
