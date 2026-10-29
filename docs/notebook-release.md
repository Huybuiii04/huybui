# Bản phát hành giao diện sổ tay IELTS

**Lưu trữ: giao diện sổ tay đã được hoàn tác ngày 28/10/2026 theo yêu cầu người dùng. Nội dung và kết quả kiểm tra bên dưới mô tả bản thử trước khi hoàn tác, không phải giao diện hiện tại. Không deploy Vercel.**

## Phạm vi đã làm

- Trang giới thiệu, Overview, sidebar và điều hướng điện thoại dùng chung nhận diện sổ tay: nền giấy, xanh ngọc, màu nhận diện kỹ năng và linh vật Mực.
- Mực là minh họa SVG mới, dùng chung giữa HTML tĩnh và React. Không dùng mã, linh vật, hình ảnh hoặc câu chữ của The IELTS Dictionary.
- Overview đưa lối vào Reading/Writing, nháp gần đây, lần làm Reading gần đây và thẻ cần ôn lên trước. Số liệu lấy từ tài khoản; không tạo XP, chuỗi ngày học hoặc bảng xếp hạng giả.
- Reading tìm theo tên, sách và Test; 12 đề/trang. Writing tìm kiếm trước chủ đề và phân trang 20 đề/trang.
- Sidebar đóng/mở tại sidebar; My writing thuộc My learning. Menu điện thoại giữ focus, đóng bằng Escape và trả focus về nút mở.
- Phòng Reading tự tập trung, kín chiều cao màn hình. Dưới 1080px dùng tab Bài đọc/Câu hỏi, giữ đáp án và vị trí cuộn; desktop giữ hai cột và thanh chia điều khiển được bằng bàn phím.
- Kết quả Reading nhấn mạnh số đúng/tổng số câu, hiện đáp án và nút mở giải thích từng câu. Tải lại từ lịch sử máy chủ vẫn giữ kết quả.
- Trình Writing dành thêm diện tích cho bài viết; giữ autosave và luồng chấm. Sửa lỗi gõ trước khi đề tải xong khiến câu hỏi không được gắn vào nháp; chỉ bổ sung câu hỏi còn thiếu, giữ nguyên phần đã gõ và dữ liệu tham chiếu đã nhập.
- Giữ VI/EN, theme sáng/tối, giảm chuyển động theo cài đặt thiết bị. Sửa xung đột tên class `outline` với Tailwind để link phụ không có đường bao khi nghỉ; focus bàn phím vẫn rõ.

Không thêm runtime dependency. Không migration, seed lại đề hoặc thay đổi tài khoản, ID câu hỏi, lịch sử đã lưu trong đợt giao diện này. Các chỉnh sửa Cambridge có sẵn trong workspace được giữ nguyên.

## Nghiệm thu

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript và production build | Đạt; còn cảnh báo Vite về chunk trên 500 kB |
| `npm test` | 226/226 |
| `npm run test:edge` | 118/118 |
| `npm run test:agent` | 97/97 và 4 trang HTML build |
| Landing tĩnh/React | Sai lệch hình học 0px tại 1440 và 390px, EN/VI; đọc được khi tắt JavaScript |
| Luồng Reading thật | Cam 9 Test 1/2, lựa chọn nhiều đáp án, chấm 1/40 và 6/40, đáp án, giải thích, lịch sử, sidebar đạt |
| Giao diện có đăng nhập | Kiểm tra 1440/1024/768/390px, VI/EN, sáng/tối; lọc, phân trang, chuyển pane, lưu và mở lại nháp đạt |
| Khả năng tiếp cận | Axe WCAG A/AA không ghi nhận vi phạm tại những màn hình được kiểm tra; có kiểm tra focus menu, divider và giảm chuyển động |
| Taste landing | 0 FAIL, 5 WARN tại 1440/768/390px; ảnh toàn trang và màn hình đầu đã được xem |
| `git diff --check` | Đạt |

Kiểm tra trình duyệt dùng tài khoản thử riêng. File phiên đăng nhập và ảnh kiểm tra nằm trong `test-results/`, được bỏ qua khi triển khai. Không đưa thông tin đăng nhập vào tài liệu.

Chạy lại kiểm tra giao diện trên production build:

```powershell
npm run build
npm run preview -- --port 5175
node --env-file-if-exists=.env.test tests/notebook-ui.mjs
```

## Ghi nhận Taste

Hướng ứng dụng đã duyệt: **Editorial greeting**, seed **1139326530**, giữ xanh ngọc và Be Vietnam Pro. Ý tưởng: trang nháp và bài Reading của người học trở thành một cuốn sổ có mục lục, dấu trang và linh vật Mực. Không bốc lại hướng để đổi sang mẫu quen thuộc.

Yêu cầu học vui của người dùng được ưu tiên khi khác quy tắc thẩm mỹ mặc định của Taste: giữ màu kỹ năng, linh vật nhỏ và theme tối xanh trầm. Phòng học giữ yên, không thêm video hoặc hiệu ứng lặp.

Ngoại lệ khi kiểm tra landing:

- `few-pictures`: dùng SVG Mực và đoạn Writing mẫu đã ghi nhãn, không chèn bốn ảnh kho không liên quan vào sản phẩm học tập.
- `icon-cards`: bộ đo nhận ba hàng kỹ năng ngang là icon cards. Đây là hàng nội dung với tiêu đề, mô tả và link hành động; không phải grid biểu tượng ở trên.

Năm cảnh báo còn lại:

- `outlined-box`: một khung viền bao bản xem trước để phân biệt giao diện mẫu với nội dung giới thiệu.
- `size-count`: 11 cỡ chữ gồm tiêu đề, thân bài, bản xem trước và metadata; chữ landing nhỏ nhất 13px.
- `no-footage`: không có tư liệu video thật cần thiết để giải thích tính năng; không thêm video trang trí vào website học.
- `off-centre`: bộ đo theo mép chữ báo lề 116/141px. Container thực dùng max-width 1280px, căn giữa và padding 36px đều hai bên; phần chữ có mép phải không đều.
- `still-page`: 10 phần tử có chuyển động vào trang. Chủ đích giữ chuyển động nhẹ; người chọn giảm chuyển động thấy nội dung ngay.

Không có ảnh hoặc clip bên ngoài cần ghi công. SVG Mực là minh họa riêng; đoạn essay trên landing là nội dung mẫu có nhãn, không phải bài của người dùng hay kết quả chấm thật. Các số liệu trong tài khoản lấy từ dữ liệu hiện có.

```text
ROUND 2
Seen in one second: Tiêu đề học IELTS và cuốn sổ Mực.
Idea (one sentence): Bài viết và bài Reading trở thành các trang trong sổ học riêng của người dùng.
Live thing: Landing có đổi VI/EN và link tới bản Writing mẫu; chưa có bài tập tương tác ngay trong landing. Ứng dụng có lọc đề, viết và làm Reading thật.
Layout words by section: hero=split / learning=list / support=statement / footer=row
Scores: design 6.5 · usability 8.5 · creativity 7 · content 8.5 → overall 7.4
Caps applied: Dưới bốn ảnh thật giới hạn design 6.5; ít chuyển động giới hạn design 7; chưa có live tool trên landing giới hạn creativity 7.5; ý tưởng sổ học vẫn dùng được cho sản phẩm học khác nên creativity không quá 7.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. mobile-fold.jpg: link “See Writing feedback” từng có đường bao sát chữ do utility outline. Đã bỏ outline lúc nghỉ, giữ focus bàn phím; ảnh cuối không còn lỗi.
2. mobile-page-01.jpg: bản Writing mẫu chiếm khá nhiều chiều cao sau hero. Giữ để chứng minh sản phẩm; khi có nhu cầu tăng chuyển đổi, thử rút đoạn mẫu dựa trên số liệu thật.
3. desktop-page-01.jpg: không có hình chụp quá trình học hoặc live exercise riêng; cá tính chủ yếu ở Mực và màu kỹ năng. Giữ bản nhẹ đã duyệt; chỉ thêm tư liệu riêng hoặc bài tập khi có nội dung thật.
```

Điểm 7.4 không được làm tròn lên 7.5. Đây là đánh giá theo rubric gallery của Taste, không phải điểm kiểm tra chức năng.

## Trạng thái bàn giao

**Không deploy Vercel theo yêu cầu mới nhất của người dùng.** Lần thử trước bị Vercel chặn vì quyền tác giả commit, tiến trình đã dừng; website production chưa đổi sang giao diện mới. Không gửi thêm bản triển khai.

Bản production build chạy local tại http://127.0.0.1:5175/ và trả HTTP 200. Mã nguồn đầy đủ nằm trong dự án `D:\ielts`; đây là giao diện ứng dụng thật, kết nối backend đang có. Kiểm tra và ảnh trong tài liệu này là kết quả của bản local.
