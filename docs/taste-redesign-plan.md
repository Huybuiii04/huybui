# Kế hoạch cải thiện website — học vui nhộn

Cập nhật: 28/10/2026. Trạng thái: **đã hoàn tác giao diện theo yêu cầu người dùng; kế hoạch dưới đây chỉ giữ làm tài liệu tham khảo, không còn áp dụng. Không deploy Vercel.**

Taste đã cài với tên `design-taste-frontend`, từ [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill). Đã dùng hướng dẫn cho ứng dụng, công cụ kiểm tra và ảnh chụp để rà soát website đang chạy.

## Yêu cầu thiết kế riêng

Theo yêu cầu của bạn: **tự thiết kế nhận diện và giao diện riêng, không sao chép toàn bộ hoặc dựng lại giao diện TID bằng cách thay logo/màu.** TID chỉ là tài liệu tham khảo về cảm giác học vui và phản hồi tạo động lực.

- Phát triển bố cục từ các luồng học hiện có của website; minh họa và linh vật có hình dáng, biểu cảm riêng.
- Giữ nhận diện xanh ngọc và Be Vietnam Pro. Hướng hình ảnh là trang sách, dấu trang và góc giấy gấp; không dùng tổ hợp mặt trời, khủng long pixel, mây và nền ô ly của TID.
- Không lấy mã nguồn, hình ảnh, linh vật, câu chữ hoặc ghép lại các khối giao diện của TID. Dùng mã dự án và thư viện đã có; tạo minh họa mới.
- Bản phác thảo phải thể hiện cá tính riêng ngay khi bỏ logo. Chỉ sửa website sau khi bạn duyệt kế hoạch.

## Hướng đề xuất

**Sổ tay học IELTS vui nhộn:** nền giấy sáng, chữ thân thiện, thẻ bài có màu và linh vật riêng. Giữ xanh ngọc làm màu nhận diện, bổ sung vàng bơ, cam đào và xanh trời ở khu chọn bài. Theme tối vẫn có, dùng màu trầm tương ứng thay vì biến toàn bộ website thành nền đen.

Hướng này **thay đề xuất True-black flat ngày 27/10** theo yêu cầu mới của bạn. Trang chủ, Overview và kho bài có cá tính vui tươi; phòng Reading và vùng viết giữ nền yên, dễ tập trung. Quy ước trong `design-system/ielts/MASTER.md` chỉ cập nhật sau khi bạn duyệt.

### Những điểm học từ web mẫu

- Trang chủ dùng linh vật mặt trời, nền ô ly, chữ tròn, thẻ kỹ năng có màu riêng và bóng lệch rõ. Cảm giác vui đến từ sự kết hợp này, không chỉ từ việc đổi màu. [Nguồn: trang chủ TID](https://theieltsdictionary.com/).
- Bảng xếp hạng kết hợp điểm học, chuỗi ngày, thứ hạng và phần thưởng để khuyến khích quay lại. [Nguồn: Đua Top TID](https://theieltsdictionary.com/bang-xep-hang).
- Đã xem desktop 1440px và điện thoại 390px, thử mở thông tin Adaptive Learning. Reading/Writing yêu cầu đăng nhập; chưa đánh giá giao diện phòng học bên trong. Adaptive Learning được giới thiệu là đang cập nhật, không coi là tính năng đã hoạt động.

### Hình thức cụ thể đề xuất cho website của bạn

| Thành phần | Đề xuất |
| --- | --- |
| Nền | Giấy kem `#FFF9EF`; khoảng trắng sạch, dấu trang và góc giấy gấp làm điểm nhận diện |
| Nhận diện | Xanh ngọc đậm `#0F766E`; chữ chính `#18342F` |
| Màu thẻ | Reading xanh bạc hà `#D9F3E6`; Writing cam đào `#FFE2CF`; ôn từ xanh trời `#DDEBFF`; thành tích vàng bơ `#FFE9A8` |
| Chữ | Giữ Be Vietnam Pro, tiêu đề đậm và thân thiện; chữ bài đọc/bài viết 16–18px |
| Khung | Bo 14–20px, viền mềm, chiều sâu nhẹ; thẻ chọn bài mang hình thức bìa sổ và dấu trang |
| Linh vật | Một quyển sổ nhỏ có biểu cảm: chào, đang học, hoàn thành; xuất hiện ở trang chủ, trạng thái trống và kết quả |
| Tương tác | Nút có phản hồi khi bấm; thẻ nhích nhẹ khi hover/focus; tiến độ tăng và lời chúc khi hoàn thành, tôn trọng cài đặt giảm chuyển động |

Đây là màu và hình thức đề xuất; sẽ kiểm tra tương phản khi dựng giao diện. Văn bản đề thi có nền sạch, không phủ minh họa hay chuyển động.

## Những vấn đề đã thấy

Đã xem trang giới thiệu, Overview, Writing, kho Reading, trình viết và phòng Reading. Năm màn hình trong ứng dụng được chụp ở 1440, 768 và 390px; kiểm tra thêm Overview theme sáng.

| Màn hình | Hiện trạng | Hệ quả |
| --- | --- | --- |
| Reading trên điện thoại/tablet | Bài đọc và câu hỏi chồng chữ ở 390 và 768px | Khó đọc và nhập đáp án; cần sửa đầu tiên |
| Overview | Banner lớn; bài viết gần đây bắt đầu khoảng 1580px trên desktop, 1930px trên điện thoại trong tài khoản thử | Phải cuộn nhiều để tiếp tục học |
| Writing | Ba thẻ chọn Task và hướng dẫn chiếm gần hết màn hình điện thoại; ô tìm kiếm nằm sau danh sách chủ đề | Khó tìm đề; danh sách toàn bộ câu hỏi rất dài |
| Kho Reading | Chỉ lọc theo bộ đề; Cambridge bắt đầu từ Cam 9 | Tìm Cam 21 phải cuộn qua nhiều đề |
| Trình viết | Tiêu đề, mô tả và điều hướng đẩy vùng nhập xuống khoảng giữa màn hình điện thoại | Ít diện tích viết khi bàn phím mở |
| Theme sáng và tên mục | Logo/chữ phụ nhạt; vẫn còn “Prompt library”; Overview ghi Cambridge 9–20 | Khó đọc, tên và phạm vi nội dung chưa thống nhất |
| Trang giới thiệu | Chủ yếu giới thiệu Writing bằng khẩu hiệu và mô hình minh họa | Chưa thể hiện Reading và khả năng thật của website |

Không ghi nhận tràn ngang hoặc lỗi JavaScript trong 15 lượt tải màn hình. Điều này chưa bảo đảm các thao tác đều đúng; ảnh chụp vẫn cho thấy lỗi chồng nội dung Reading. Các cảnh báo thẩm mỹ của Taste được dùng làm gợi ý, không coi tất cả là lỗi chức năng.

## Thứ tự thực hiện sau khi duyệt

### 1. Sửa phòng Reading trên màn hình nhỏ

- Desktop giữ hai cột bài đọc/câu hỏi và thanh kéo chia cột.
- Dưới 1080px chuyển thành hai tab **Bài đọc / Câu hỏi**, giữ đáp án và vị trí cuộn khi đổi tab.
- Rút gọn thanh tiêu đề và công cụ; đồng hồ, số câu đã làm, nút nộp luôn dễ tìm. Chừa phần lớn chiều cao cho nội dung.
- Giữ tự động tập trung, kín chiều cao màn hình và không thêm lại nút Focus.

Nghiệm thu: 390/768px không chồng chữ, nhập được đáp án ở cả ba passage; quay lại tab không mất câu trả lời. Desktop không có dải trống phía dưới.

### 2. Làm khung ứng dụng thân thiện và Overview có động lực học

- Sidebar khoảng 224–240px, nút đóng/mở nằm trong sidebar; giữ thứ tự mục hiện tại. My writing vẫn thuộc My learning; không thêm lại Writing space.
- Topbar gọn hơn, nút ngôn ngữ/theme dễ bấm. Menu điện thoại mở bằng bàn phím được và đóng trả focus đúng chỗ.
- Tiêu đề trang ứng dụng khoảng 24–28px; nội dung đọc 16px, chữ phụ tối thiểu 12px. Lề điện thoại 16px; vùng bấm chính tối thiểu 44px.
- Thay banner quảng bá lớn bằng lời chào ngắn có linh vật nhỏ, khối **Hôm nay học gì?**, lối vào Writing/Reading, bài viết gần đây và thẻ cần ôn. Dữ liệu đã có được đưa lên trước; tài khoản mới có hướng dẫn bắt đầu rõ ràng.
- Ba lối vào học chính dùng màu riêng: Reading xanh bạc hà, Writing cam đào, ôn từ xanh trời. Số liệu gọn, ghi rõ ý nghĩa; màu trang trí không thay thế trạng thái đúng/sai.
- Sidebar nhẹ như mục lục sổ tay; nút bấm có cảm giác nhấn xuống. Tăng tương phản cả hai theme.

Nghiệm thu: màn hình đầu có lối vào Writing/Reading; có dữ liệu thì thấy mục tiếp tục học mà không phải vượt qua banner. Không xuất hiện số liệu giả.

### 3. Tìm đề nhanh hơn trong Writing và Reading

- Writing: thống nhất nhãn **Writing / Luyện viết**; ba lựa chọn Task thành bộ chọn gọn. Đưa ô tìm kiếm đang có lên đầu, trước chủ đề. Giữ mở đề theo chủ đề; danh sách tất cả đề phân trang 20 đề/lần và hiện tổng kết quả.
- Reading: thêm tìm theo tên, chọn sách Cambridge 9–21 và Test 1–4; giữ bộ lọc theo bộ đề. Lọc trong dữ liệu đang tải, không cần dịch vụ tìm kiếm mới.
- Thẻ đề gọn như bìa sổ, tên dễ quét, số câu và thời gian cùng vị trí. Màu nhận diện theo kỹ năng, không tô mỗi đề một màu ngẫu nhiên. Có nút xóa bộ lọc và thông báo khi không tìm thấy.
- Đồng bộ thông tin Cambridge 9–21 ở Overview và thư viện.

Nghiệm thu: tìm Cam 21 Test 4 trực tiếp bằng bộ lọc; đổi bộ lọc không sửa dữ liệu đề. Writing tìm được đề trước khi cuộn qua các chủ đề.

### 4. Tăng diện tích viết và làm rõ kết quả

- Trình viết: tiêu đề và thanh công cụ gọn, trạng thái lưu dễ thấy; vùng nhập xuất hiện sớm hơn. Giữ hai cột trên desktop, tab đề/bài viết trên điện thoại.
- Kết quả Reading: số câu đúng/tổng số câu nổi bật, đáp án ngay cạnh câu; nút hiện giải thích dễ nhận biết ở mỗi câu. Giữ chức năng đã làm, chỉ chỉnh bố cục và cách đọc.
- Khi chấm xong thành công, linh vật phản hồi và thanh kết quả xuất hiện nhẹ một lần. Lời động viên dựa trên kết quả thật; không nháy, bay hoặc phát âm thanh trong lúc làm bài.
- Rà soát bảng nhập, trạng thái đang tải/lỗi/trống và focus theo bộ màu mới.

Nghiệm thu: autosave vẫn hoạt động; bàn phím điện thoại không che ô đang nhập hoặc thao tác thiết yếu. Kết quả vẫn chấm như trước.

### 5. Cập nhật trang giới thiệu

- Tiêu đề nói rõ luyện IELTS Writing và Reading, kèm nút bắt đầu nổi bật.
- Hero thiết kế riêng với linh vật quyển sổ, dấu trang và nút bắt đầu; phần bên dưới cho xem giao diện thật với nội dung mẫu không chứa dữ liệu cá nhân.
- Trình bày ngắn ba bước: chọn đề, làm bài, xem kết quả. Rút gọn phần giới thiệu lặp và khối hỗ trợ dự án.
- Nội dung song ngữ, chỉ nêu tính năng và số liệu kiểm chứng được.

### 6. Mức trò chơi hóa phù hợp cho bản đầu

- Làm trước: thẻ chọn bài có cá tính, gợi ý việc học tiếp, tiến độ câu đã làm, kết quả và lời chúc. Dùng bài viết, thẻ ôn và lịch sử làm bài đang có.
- Chưa đưa XP, cấp độ, bảng xếp hạng hoặc phần thưởng vào phạm vi bản đầu. Những mục đó cần quy tắc ghi nhận hoạt động, chống cộng điểm lặp và dữ liệu đầy đủ; không cần để tạo cảm giác vui ngay.
- Nếu bổ sung chuỗi ngày học sau này, chỉ tính từ hoạt động được ghi nhận thật theo giờ Việt Nam. Không suy ra chuỗi toàn bộ lịch sử từ danh sách 50 lần làm bài gần nhất hiện tại.

## Phạm vi kỹ thuật và dữ liệu

- Dùng React, CSS và Lucide đang có; minh họa linh vật riêng bằng tài nguyên nhẹ. Chưa cần thêm thư viện, canvas/3D hoặc đổi framework.
- Dự kiến sửa `src/styles.css`, `src/components/Layout.tsx`, các trang Dashboard, Prompts, Reading, ReadingTest, Writing, Landing trong `Other.tsx` và component kết quả nếu cần.
- Sau khi duyệt, cập nhật `design-system/ielts/MASTER.md` theo giao diện cuối cùng để tránh hai bộ quy tắc mâu thuẫn.
- Giữ tài khoản, bài viết, lịch sử làm bài, đáp án đã lưu, ID câu hỏi, nội dung Cambridge và cách chấm. Không có migration hoặc nhập lại đề trong kế hoạch giao diện này.
- Các trang ngoài phạm vi đã xem chỉ nhận chỉnh sửa style chung; chưa đề xuất xây lại luồng chức năng của chúng.

## Kiểm tra trước khi bàn giao

- Chụp so sánh trước/sau ở 390, 768, 1024 và 1440px; kiểm tra theme sáng/tối và VI/EN.
- Kiểm tra sidebar, menu điện thoại, bộ lọc, phân trang, tab đọc/câu hỏi và trình viết bằng chuột/bàn phím.
- Chữ thường tương phản tối thiểu 4.5:1; focus nhìn rõ; không tràn ngang, chồng chữ hoặc bị thanh cố định che.
- Kiểm tra phản hồi nút và hiệu ứng hoàn thành với `prefers-reduced-motion`; không có hiệu ứng lặp trong phòng Reading/trình viết.
- Chạy kiểm tra liên quan đến Reading, lọc/phân trang và autosave; chạy build. Lưu một kiểm tra hồi quy nhỏ cho lỗi Reading trên màn hình nhỏ.
- Chạy Taste lần nữa và xem ảnh thực tế. Không thêm ảnh hoặc hiệu ứng vào phòng học chỉ để đạt điểm thẩm mỹ.

## Ghi nhận hướng Taste và yêu cầu mới

Hướng **True-black flat**, seed `1681908184`, là khảo sát cũ, không còn là đề xuất hiện tại. Tham chiếu mới do bạn chọn là TID. Taste dùng để kiểm tra bố cục, tính nhất quán, độ dễ đọc và ảnh thực tế; quy tắc thẩm mỹ được điều chỉnh theo yêu cầu vui nhộn của bạn. Giữ sidebar có nhãn và nút đóng/mở như yêu cầu trước.

Câu hỏi chính của từng màn hình: Overview — học tiếp gì; Writing — chọn đề nào; Reading — tìm sách/test nào; trình viết — viết và lưu ở đâu; phòng Reading — đọc và trả lời câu nào; trang giới thiệu — website giúp luyện IELTS thế nào.

**Giao diện sổ tay đã được hoàn tác. Website local dùng giao diện trước kế hoạch này; giữ các sửa Reading và menu đã có trước đó.**
