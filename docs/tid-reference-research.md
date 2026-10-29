# Nghiên cứu The IELTS Dictionary

Ngày: 28/10/2026. Mục tiêu: tìm cách làm website học IELTS thân thiện, vui và có động lực quay lại. Chỉ nghiên cứu và cập nhật kế hoạch; chưa sửa giao diện website.

## Phạm vi đã xem

- [Trang chủ](https://theieltsdictionary.com/): xem ở desktop 1440×1000 và điện thoại 390×844, cuộn khu kỹ năng và mở giới thiệu Adaptive Learning.
- [Đua Top](https://theieltsdictionary.com/bang-xep-hang): bảng xếp hạng công khai, cách giới thiệu điểm và chuỗi ngày.
- [Reading](https://theieltsdictionary.com/practice/reading) và [Writing](https://theieltsdictionary.com/practice/writing): chuyển tới đăng nhập. Không có tài khoản TID trong lượt nghiên cứu này, nên chưa kết luận về thao tác học/chấm bài phía sau đăng nhập.

## Quan sát thiết kế

Trang chủ phối linh vật mặt trời biểu cảm, chữ tròn, nền ô ly và các thẻ kỹ năng nhiều màu. Thẻ dùng viền tối rõ, bóng lệch cứng và hình minh họa/pixel nhỏ. Mây và chim chuyển động giúp trang có sức sống. Trên điện thoại, các thẻ đổi thành lưới hai cột. [Nguồn](https://theieltsdictionary.com/).

Font đo được trên trang chủ: Quicksand cho nội dung, Plus Jakarta Sans cho tiêu đề lớn. Phong cách phối nét đáng yêu với thẻ mang cảm giác trò chơi. Website của bạn có thể giữ Be Vietnam Pro để đọc tiếng Việt dài thoải mái, lấy cách tổ chức hình ảnh và tương tác làm cảm hứng.

Bảng Đua Top thể hiện thành tích bằng bục hạng, điểm, chuỗi ngày học và phần thưởng. Đây là động lực quay lại bên cạnh giao diện vui. Lượt khảo sát chỉ xác nhận phần hiển thị công khai; chưa kiểm chứng cơ chế ghi điểm. [Nguồn](https://theieltsdictionary.com/bang-xep-hang).

Nút Adaptive Learning mở thông báo tính năng đang được hoàn thiện. Không nên lấy sự hiện diện của thẻ quảng bá làm bằng chứng tính năng đã hoạt động.

## Áp dụng vào website hiện tại

| Yếu tố | Cách áp dụng |
| --- | --- |
| Nhận diện có biểu cảm | Linh vật quyển sổ riêng, ba trạng thái chào/đang học/hoàn thành |
| Màu giúp định hướng | Xanh bạc hà cho Reading, cam đào cho Writing, xanh trời cho ôn từ; xanh ngọc vẫn là thương hiệu |
| Cảm giác đồ dùng học tập | Nền giấy kem, dấu trang và góc giấy gấp; thẻ giống bìa sổ, viền mềm và chiều sâu nhẹ |
| Phản hồi khi thao tác | Nút nhấn xuống, thẻ phản hồi hover/focus, tiến độ cập nhật khi trả lời, chúc mừng sau khi nhận kết quả |
| Động lực học tiếp | Đưa bài gần đây, thẻ đến hạn và kết quả thật lên Overview; lời gợi ý ngắn, cụ thể |
| Giữ tập trung | Phòng Reading toàn màn hình; chữ trên nền sạch; linh vật/hiệu ứng nằm ở màn hình chọn bài và sau khi nộp |

Lựa chọn màu và linh vật trên là đề xuất riêng cho website của bạn, chưa phải thay đổi đã thực hiện. Bạn yêu cầu tự thiết kế, không sao chép toàn bộ. Vì vậy chỉ tham khảo nguyên lý tạo hứng thú; bố cục, minh họa, linh vật và câu chữ phải phát triển riêng từ sản phẩm hiện tại. Không dùng tài nguyên hoặc tái dựng các khối giao diện của TID.

## Phạm vi bản đầu

Nên làm giao diện vui, trạng thái động viên và tiến độ từ dữ liệu sẵn có trước. Chưa cần XP, cấp độ hoặc bảng xếp hạng. Trong mã hiện tại, `loadSkillAttempts` chỉ lấy 50 lần làm bài gần nhất; nguồn này không đủ bảo đảm tính đúng chuỗi ngày học toàn bộ lịch sử. Các cơ chế thưởng cần thiết kế và dữ liệu riêng khi được yêu cầu.

Tìm kiếm phong cách trong UI/UX Pro Max không cho preset phù hợp trọn vẹn: kết quả gần nhất là Brutalism thiên về góc vuông và màu cơ bản. Không áp preset đó; đề xuất dựa trên web mẫu bạn chọn, kết hợp tiêu chí khả năng đọc và tương tác của skill.

Taste hỗ trợ kiểm tra chất lượng, không buộc website học tập phải theo hướng tối giản tối màu của bản kế hoạch cũ. Yêu cầu vui nhộn hiện tại quyết định hướng mới.

Kế hoạch thay thế đầy đủ: [taste-redesign-plan.md](D:/ielts/docs/taste-redesign-plan.md).

## Ảnh tham khảo đã lưu

- [Trang chủ desktop](D:/ielts/test-results/tid-reference/home-desktop.png)
- [Thẻ kỹ năng desktop](D:/ielts/test-results/tid-reference/cards-desktop.png)
- [Trang chủ điện thoại](D:/ielts/test-results/tid-reference/home-mobile.png)
- [Thẻ kỹ năng điện thoại](D:/ielts/test-results/tid-reference/cards-mobile.png)
- [Thông báo Adaptive Learning](D:/ielts/test-results/tid-reference/adaptive-mobile.png)

Ảnh dùng cho khảo sát nội bộ, nằm trong thư mục `test-results` được Git bỏ qua. Không đưa nội dung quảng bá, số liệu hay hình ảnh cá nhân của web mẫu vào website của bạn.
