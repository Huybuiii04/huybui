# Thiết kế sửa Agent Readiness theo phạm vi đã xác minh

Ngày: 26/10/2026

## 1. Bối cảnh

Repository đã có một phần triển khai Agent Readiness gồm prerender HTML, Markdown negotiation và 404 middleware. Tuy nhiên baseline cho thấy các phần sau chưa đúng hoặc chưa tồn tại:

- Raw HTML của landing dùng nội dung khác với giao diện React thực, nên thay đổi lớn khi JavaScript mount.
- Các trang tĩnh `/about`, `/contact`, `/privacy` có React wildcard thay nội dung khi JavaScript chạy.
- `/docs`, `/developers`, `/openapi.json` và `/.well-known/mcp` được công bố dù backend public tương ứng chưa tồn tại.
- `robots.txt`, `sitemap.xml`, `llms.txt` và OG image thật chưa được phục vụ.
- JSON-LD chứa `Organization`, `PostalAddress`, `offers`, `author`/`publisher` chưa đủ bằng chứng xác minh.
- Privacy mô tả một số cam kết về nhà cung cấp AI, thời hạn lưu/xóa chưa được backend chứng minh.

Baseline trước thay đổi:

- `npm test`: 68/68 đạt.
- `npm run test:edge`: 76/76 đạt.
- `npm run build`: thành công, chỉ còn cảnh báo chunk lớn có sẵn từ trước.

## 2. Mục tiêu

1. Landing và các trang public đọc được nội dung thật khi không có JavaScript.
2. URL sai trả HTTP 404 thật; route hợp lệ, kể cả route động và auth callback có query, vẫn trả 200.
3. Markdown negotiation đúng theo `Accept`, `q-value`, `q=0`; HTML được ưu tiên khi bằng điểm.
4. 404 HTML/Markdown có giải thích, escape URL đầu vào và liên kết tới tài nguyên discovery thật.
5. Metadata, JSON-LD, OG image, robots, sitemap và llms.txt phản ánh đúng sản phẩm hiện tại.
6. Trust pages nói đúng về tính năng, AI, lưu trữ và xóa dữ liệu theo mã backend đã kiểm tra.
7. `/api/*` trên domain Vercel trả lỗi JSON có cấu trúc; Edge Functions giữ error shape tương thích và có hint khi hành động được.
8. Nghiệm thu cuối phải chạy trên Vercel preview để kiểm tra Routing Middleware và cache/CDN.

## 3. Ngoài phạm vi

- Không tạo public REST API, OpenAPI specification, developer portal hay MCP server.
- Không công bố `/.well-known/mcp` khi không có MCP endpoint và client handshake thật.
- Không thay đổi quyền RLS, không dùng service-role để mở nội dung công khai.
- Không thay đổi chức năng chấm bài, dữ liệu học tập hoặc luồng đăng nhập hiện tại.
- Không deploy production hoặc push branch nếu chưa được yêu cầu rõ ràng.

## 4. Quyết định thiết kế

### 4.1. Phạm vi public và ngôn ngữ

Các URL public canonical được phát hành:

- `/`
- `/about`
- `/contact`
- `/privacy`

Ứng dụng hiện chọn ngôn ngữ bằng `localStorage`, mặc định tiếng Anh; không có URL locale riêng. Vì vậy:

- Bản HTML tĩnh dùng tiếng Anh, khai báo `<html lang="en">` và canonical không có locale suffix.
- Không thêm `hreflang` vì không tồn tại URL VI/EN riêng.
- Markdown dùng cùng bản tiếng Anh để nội dung HTML và Markdown nhất quán.
- Nội dung React sau hydration tiếp tục dùng lựa chọn VI/EN hiện tại của ứng dụng.

`/docs`, `/developers`, `/openapi.json` và `/.well-known/mcp` trở thành URL lạ và phải trả 404 sau khi các tuyên bố cũ được gỡ bỏ.

### 4.2. Danh tính trong JSON-LD

JSON-LD chỉ chứa một node `SoftwareApplication` với các field bắt buộc đã xác minh:

- `name`
- `description`
- `url`
- `applicationCategory`
- `operatingSystem`

Không thêm `Person`, `Organization`, `PostalAddress`, `offers`, `author` hoặc `publisher` khi chưa có bằng chứng rõ ràng về danh tính, quyền công khai, địa chỉ và mô hình miễn phí. Khi JSON-LD được nhúng vào `<script>`, dữ liệu phải được serialize an toàn để không đóng thẻ script hoặc chèn markup không mong muốn.

### 4.3. Phân biệt route tồn tại và dữ liệu không tồn tại

- `/app/essays/:id` là route hợp lệ; middleware cho qua và trả app shell 200. Việc essay có tồn tại hay không do repository/UI xử lý sau đăng nhập.
- `/auth/callback?code=...` và query tương tự vẫn là route hợp lệ vì routing dựa trên pathname.
- URL không khớp route thật trả 404 trước khi rơi vào SPA fallback.
- `/assets/missing.js` không được rewrite về `index.html`; tài nguyên build thật tiếp tục được phục vụ bình thường.

### 4.4. Landing không JavaScript và giảm layout shift

Raw HTML phải chứa nội dung landing thật, không phải khối dành riêng cho bot rồi bị ẩn bằng CSS. Bản tĩnh dùng cùng cấu trúc semantic và các class chính của landing React để khi `createRoot` thay nội dung, bố cục không nhảy lớn.

Bài kiểm tra trình duyệt sẽ:

1. Chặn script để đọc landing tĩnh.
2. Cho script chạy để đọc landing React.
3. So vị trí/kích thước H1 và các khối chính trên desktop/mobile với ngưỡng rõ ràng.

### 4.5. Trust pages độc lập

`/about`, `/contact`, `/privacy` là HTML tĩnh độc lập, không chạy React. Chúng dùng font, màu và spacing hiện có; nội dung HTML và Markdown được render từ cùng module nội dung công khai. Footer của landing dùng link HTML thường (`<a href>`), nên deep link trực tiếp và link từ landing cùng mở đúng trang.

### 4.6. Privacy theo backend đã kiểm tra

Nội dung Privacy chỉ nêu những điều có thể chứng minh từ mã nguồn:

- Tài khoản, hồ sơ, bài viết, bản nháp, thẻ từ vựng, lịch ôn tập và log lỗi nằm trong Supabase/Postgres.
- Phiên đăng nhập do Supabase quản lý.
- Khi chấm bài, nội dung bài và ảnh được chọn có thể được gửi tới endpoint AI do deployment cấu hình; code hỗ trợ Anthropic API và endpoint tương thích.
- Không cam kết tên nhà cung cấp, thời hạn lưu, thời hạn xóa hoặc chính sách huấn luyện của provider khi chưa xác minh.
- Xóa tài khoản huỷ job chờ, xóa tệp tải lên, xoá auth user và kích hoạt cascade cho dữ liệu học tập gắn với tài khoản.
- Bản ghi định mức sử dụng/chi phí AI không gắn trực tiếp với tài khoản có thể còn lại để vận hành và kiểm toán.
- Dữ liệu cục bộ gồm IndexedDB cache, `localStorage` lựa chọn ngôn ngữ/theme và `sessionStorage` cho phiên quản trị.

### 4.7. Discovery

- `robots.txt`: `text/plain`, trỏ tới sitemap production.
- `sitemap.xml`: XML hợp lệ, chỉ gồm `/`, `/about`, `/contact`, `/privacy`.
- `llms.txt`: theo cấu trúc Markdown của llms.txt, chỉ dẫn tới tài nguyên tồn tại và nêu rõ phần app cần đăng nhập; không coi là rào bảo mật.
- `og-image.png`: PNG thật 1200×630, tạo bằng Playwright đã cài, không thêm package mới.

## 5. Kiến trúc và thành phần

### 5.1. `src/agent/content.ts`

Giữ nguồn nội dung công khai cho landing, trust pages và Markdown. Loại bỏ nội dung `/docs`, `/developers` và các tuyên bố public API/MCP. Nội dung phải phản ánh cùng điều kiện đăng nhập và giới hạn AI giữa HTML và Markdown.

### 5.2. `src/agent/html.ts`

- Escape HTML/Markdown cho mọi giá trị do URL hoặc người dùng cung cấp.
- Render landing tĩnh và trust pages từ nguồn nội dung chung.
- 404 HTML có link về `/`, `/llms.txt` và `/sitemap.xml`.

### 5.3. `src/agent/site.ts`

- Metadata canonical/OG/twitter.
- JSON-LD chỉ `SoftwareApplication` đã xác minh.
- Không chứa dữ liệu tổ chức/địa chỉ/offers chưa xác minh.

### 5.4. `src/agent/routes.ts`

Là allowlist duy nhất cho:

- SPA routes, gồm auth, reset, admin và route động essay.
- Public content routes.
- Static public files thật.
- Không chứa API/MCP route giả.

### 5.5. `middleware.ts`

- Parse `Accept` thành quality theo từng media type; `q=0` bị loại; HTML thắng khi bằng điểm.
- Chỉ negotiate nội dung trang. URL giống tài nguyên kỹ thuật không được biến thành Markdown.
- Ghép `Vary: Accept` thay vì ghi đè các giá trị Vary khác.
- Hỗ trợ HEAD với status/header tương ứng và body rỗng.
- `/api/*` không có endpoint thật trả JSON 404 với `code`, `message`, `hint`; không có docs URL giả.
- Không có MCP manifest giả.

### 5.6. `vite.config.ts` và các entry HTML

- Landing nhận raw HTML thật trong `#root` để React thay thế khi mount.
- Trust pages là entry tĩnh không phụ thuộc runtime React.
- Mọi entry có title, description, canonical, OG metadata và JSON-LD đúng.

### 5.7. `supabase/functions/_shared/http.ts`

- Giữ shape hiện tại: `error.code`, `error.message`, `error.requestId`, top-level `requestId`, `Retry-After` khi có.
- Thêm `error.hint` tùy chọn cho mã lỗi có hành động khắc phục cụ thể.
- Không trả stack, SQL, secret hoặc raw provider error.
- Không tuyên bố gateway của nền tảng được helper này chuẩn hóa; gateway phải được kiểm tra riêng.

## 6. Luồng dữ liệu và lỗi

### 6.1. Request trang

1. Vercel Routing Middleware nhận request.
2. `/api/*` đi vào nhánh JSON 404 vì không có endpoint public cùng domain.
3. Static file thật đi thẳng tới CDN.
4. Route hợp lệ đi tiếp; middleware gắn `Vary: Accept`.
5. Nếu client ưu tiên Markdown và path có bản Markdown, middleware trả `text/markdown; charset=utf-8`.
6. URL sai trả 404 HTML hoặc Markdown tùy `Accept`, không đi vào SPA fallback.

### 6.2. Lỗi Edge Function

Handler tạo `AppError` với code an toàn. `errorResponse` log chỉ request ID/code/status, trả message đã chuẩn hóa, hint tùy chọn, request ID và `Retry-After`. Lỗi gateway Supabase được xác minh bằng request thực tế, không suy ra từ helper handler.

## 7. Kiểm thử và nghiệm thu

### 7.1. Unit/integration

- `node:test` cho route allowlist, Accept negotiation, HEAD, Vary, escape, 404, JSON 404 và nội dung.
- Build-output test kiểm tra raw HTML, heading hierarchy, canonical, OG và JSON-LD parse được.
- Edge test kiểm tra hint, request ID, `Retry-After`, không rò raw error.
- Kiểm tra `robots.txt`, `sitemap.xml`, `llms.txt` chỉ trỏ tới URL thật.
- Kiểm tra OG image đúng 1200×630.

### 7.2. Browser regression

- Landing không JS vẫn có H1, nội dung và link thật.
- Landing sau JS vẫn render React bình thường.
- So vị trí/kích thước chính trước/sau JS trên desktop và mobile.
- Trust page deep link trả 200 HTML có nội dung và không bị React wildcard thay thế.
- Chạy các suite hiện có phù hợp: `landing-ui.mjs`, `i18n.mjs`, `accessibility.mjs`, `browser.mjs`.

### 7.3. Vercel preview — điều kiện nghiệm thu bắt buộc

Trên URL preview phải kiểm tra:

- `/` HTML và Markdown có status/type/body/Vary đúng khi đổi thứ tự request.
- Route lạ 404; route app hợp lệ, route động và auth callback có query 200.
- `/assets/missing.js` 404 và không nhận HTML SPA.
- Favicon, CSS và JS build trả đúng MIME.
- `robots.txt`, `sitemap.xml`, `llms.txt`, OG image trả đúng MIME và tải được.
- HTML rồi Markdown rồi HTML không bị CDN trộn nội dung.
- `/api/*` trả JSON 404 có code/message/hint.

Local test không thay thế bước preview này.

## 8. Rollout

1. Chạy test đỏ cho từng hành vi trước khi sửa implementation.
2. Sửa theo nhóm: nội dung/metadata → HTML/routing → discovery → Edge errors.
3. Chạy `npm test`, `npm run test:edge`, `npm run build`.
4. Chạy browser regression local/preview.
5. Deploy Vercel preview và chạy HTTP smoke/cache test.
6. Báo cáo rõ kết quả đạt, kết quả chưa nghiệm thu được và phần MCP bị deferred.

## 9. Self-review

- Không còn placeholder quyết định chưa chốt trong phạm vi triển khai.
- Phạm vi public, ngôn ngữ, JSON-LD, routing, privacy và preview đều nhất quán.
- Không mở API/MCP giả; mọi tài nguyên discovery đều có nguồn thật.
- Ranh giới route hợp lệ/dữ liệu không tồn tại được nêu rõ.
- Tiêu chí cache trên Vercel preview được coi là bắt buộc, không phải ghi chú tùy chọn.
