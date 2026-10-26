# Rà soát Agent Readiness và kế hoạch sửa

Ngày kiểm tra: 26/10/2026. Website: https://huybui.vercel.app.

Phạm vi lần này: kiểm tra bằng chứng, đối chiếu mã nguồn, lập kế hoạch. Chưa sửa ứng dụng, chưa deploy. Điểm 29/100 lấy từ báo cáo được cung cấp; chưa chạy lại Ora và không cam kết điểm sau sửa.

## 1. Kết luận

Ưu tiên sửa khả năng đọc nội dung, HTTP status và định dạng tài nguyên. Phần lớn lỗi có chung hai nguyên nhân: Vite SPA trả HTML rỗng trước khi chạy JS và rewrite gần như mọi URL về `index.html`.

Không cần chuyển framework, mở API chấm bài hoặc xây MCP chỉ để đạt điểm. OpenAPI, developer portal và MCP cần phản ánh đúng khả năng sản phẩm thực sự cung cấp.

## 2. Bằng chứng đã kiểm tra

### Website đang chạy

Probe trực tiếp HTTP bằng Node `fetch`, theo redirect, timeout 20 giây; không thực thi JavaScript:

| Request | Kết quả | Ý nghĩa |
|---|---|---|
| `GET /`, Accept HTML | 200, `text/html; charset=utf-8`, 626 ký tự HTML | Nội dung sau loại tag/script/style chỉ 22 ký tự, gồm title; không có H1 |
| `GET /`, Accept Markdown | 200, HTML, thiếu `Vary` | Chưa hỗ trợ content negotiation |
| `GET /agent-audit-missing-20261026`, cả HTML và Markdown | 200, cùng HTML 626 ký tự | Soft-404 xác nhận |
| `GET /openapi.json` | 200, HTML | Không phải OpenAPI hợp lệ |
| `GET /api/openapi.yaml` | 404, `text/plain` | Không có spec tại URL thay thế được nêu |
| `GET /api/agent-audit-missing` | 404, `text/plain` | API trên domain chính chưa có lỗi JSON cho URL không tồn tại |
| `GET /about`, `/contact`, `/privacy`, `/developers`, `/docs` | Đều 200, cùng HTML app shell | HTTP 200 không chứng minh trang có nội dung |
| `GET /llms.txt`, `/robots.txt`, `/sitemap.xml`, `/.well-known/mcp` | Đều 200, HTML | Đều là tài nguyên giả do fallback |
| `POST https://fjlyjaomuxotqqjvugtv.supabase.co/functions/v1/submit-essay`, không Authorization, body `{}` | 401, `application/json`, code `UNAUTHORIZED_NO_AUTH_HEADER` | Backend thực tế đã trả lỗi JSON ở lớp gateway; request không được xác thực để chấm bài |

Trang chủ thiếu canonical, `og:image`, `og:type`, JSON-LD; có `html lang="vi"`.

### Mã nguồn

- `index.html`: `#root` rỗng; metadata cơ bản, chưa có canonical/OG/JSON-LD.
- `vercel.json`: rewrite `/((?!api/).*)` về `/index.html`, tạo soft-404 cho cả tài nguyên máy đọc không tồn tại.
- `src/App.tsx`: chưa có các trang trust/developer; `NotFound` phía React không sửa được status HTTP từ server.
- `src/pages/Other.tsx`: landing đã có nội dung, H1, các mục tính năng và liên kết; nên tái dùng nội dung này.
- `supabase/functions/_shared/http.ts`: có `errorResponse()`, `error.code`, `error.message`, `requestId`, `retryAfter`; cần bổ sung hướng khắc phục phù hợp, không thay toàn bộ cơ chế.
- Backend chạy qua Supabase Edge Functions/PostgREST, không phải REST API cùng domain Vercel.
- Migration có RLS và phân quyền nội dung công khai/dữ liệu riêng. Không mở thêm quyền để chiều crawler.

### Các file đang dở đã có trước lần rà soát

`git status` có ba mục untracked: plan `2026-10-26-agent-readiness.md`, `src/agent/`, `tests/agent.test.ts`. Giữ nguyên các mục này.

Lưu ý thời điểm: đây là snapshot lúc bắt đầu rà soát. Kiểm tra cuối lượt thấy workspace tiếp tục thay đổi ở `index.html`, `src/main.tsx`, `src/styles.css`, `vite.config.ts`, `pages/` và `src/agent/html.ts`; các thay đổi đó không do lượt lập kế hoạch này thực hiện và chưa được đánh giá trong tài liệu. Trước khi triển khai, đối chiếu lại diff để tránh làm trùng công việc. Kết quả HTTP ở trên vẫn là bằng chứng của bản production tại thời điểm probe.

- Plan cũ đề xuất thêm nhiều endpoint, MCP, Organization và địa chỉ; đây là mở rộng sản phẩm, không phải điều kiện bắt buộc để sửa HTML/404.
- `src/agent/site.ts` chưa nối vào build hoặc app. Email, địa chỉ, vai trò Organization và tuyên bố giá cần xác minh trước khi công bố; không lấy nội dung draft làm bằng chứng.
- Draft đổi ngôn ngữ mặc định sang `en`, trong khi site hiện dùng `vi`; cần giữ ngôn ngữ thực tế nhất quán.
- `node --test tests/agent.test.ts` thất bại `ERR_MODULE_NOT_FOUND`, thiếu `src/agent/markdown.ts`. Test còn import các module chưa tồn tại khác; không đưa vào test suite chính trước khi hoàn thiện hoặc sửa scope.
- `npm test`: **46/46 đạt**. Lệnh này hiện không chạy test agent. Chưa chạy build, browser suite hoặc toàn bộ test Edge trong lần lập kế hoạch.

## 3. Đánh giá đủ 14 mục

| # | Mục audit | Đánh giá sau kiểm tra | Hướng xử lý |
|---|---|---|---|
| 1 | Nội dung không cần JS | Lỗi xác nhận | P0: HTML trang chủ có nội dung thực, H1 và link trước khi JS chạy |
| 2 | Agent-friendly 404 | Lỗi xác nhận với URL ngoài `/api/` | P0: status 404 thật; thêm Markdown 404 qua Accept |
| 3 | OpenAPI | Không có spec hợp lệ tại hai URL đã thử | P2: tài liệu hóa API thật nếu hỗ trợ bên ngoài; không tạo endpoint giả |
| 4 | Lỗi API JSON | Đúng một phần: Vercel trả plain text, Supabase đã trả JSON | P1: JSON 404 cho `/api/*`; cải thiện hint ở backend hiện có, phân biệt gateway và handler |
| 5 | Markdown negotiation | Lỗi xác nhận | P1: hỗ trợ ngay `/`, đúng Content-Type và Vary, kiểm tra cache |
| 6 | Developer portal | Chưa có route/nội dung thật | P2: docs tích hợp gọn nếu có API; chưa cần API key portal/sandbox riêng |
| 7 | JSON-LD | Lỗi xác nhận ở homepage | P1: `SoftwareApplication` mô tả ứng dụng học IELTS |
| 8 | Organization completeness | Không có schema, nhưng chưa xác minh dự án là tổ chức | Có điều kiện: chỉ thêm Organization/contact/address khi đúng thực tế; có thể dùng Person cho tác giả đã xác minh |
| 9 | About/Contact/Privacy | Chưa có trang thật | P1: nội dung rõ ràng, tối thiểu 500 ký tự hữu ích mỗi trang theo ngưỡng audit |
| 10 | Khả năng tìm tài liệu theo tên | Chưa kiểm chứng lại tìm kiếm bên ngoài | P1/P2: URL rõ, title theo tên sản phẩm, llms.txt, sitemap và liên kết; đo lại sau index |
| 11 | Độ rõ schema API | Kết quả partial không chứng minh tồn tại spec | Gộp #3: `/openapi.json` hiện trả HTML nên không thể phân tích schema ở URL này |
| 12 | Function calling | Chưa có spec hợp lệ để đánh giá | Gộp #3: operationId duy nhất, schema rõ; cần kiểm thử với client/tool converter mục tiêu |
| 13 | Metadata | Thiếu 3/4 tín hiệu như báo cáo | P1: canonical, OG image/type; giữ lang VI đúng nội dung |
| 14 | MCP | Chưa có endpoint/manifest hợp lệ tại URL đã thử | P3 có điều kiện; registry tên `vercel` chưa đủ chứng minh thuộc site này |

`llms.txt` và `/.well-known/mcp` không tự tạo khả năng gọi API/MCP. Manifest riêng theo yêu cầu scanner không thay thế handshake chuẩn. Cũng không thể suy ra server MCP toàn hệ thống không tồn tại chỉ từ một URL thiếu.

## 4. Kế hoạch triển khai

### Giai đoạn 0 — Chốt baseline và nội dung đúng thực tế

- [ ] Ghi snapshot HTTP hiện trạng vào `docs/research/agent-readiness-baseline.json`: URL, Accept, status cuối, Content-Type, Vary, nhận xét. Chỉ lưu response công khai, không lưu token.
- [ ] Đối chiếu route thực trong `src/App.tsx`; lập danh sách route hợp lệ, gồm auth callback/reset, route động essay và tài nguyên build.
- [ ] Xác minh email liên hệ và danh tính người vận hành; xác minh mô hình miễn phí hiện tại trước khi ghi `offers`.
- [ ] Rà luồng dữ liệu cho privacy: tài khoản, bài viết/ảnh, Supabase, nhà cung cấp AI, cache trình duyệt, xóa tài khoản và thời gian lưu. Điều chưa biết phải đánh dấu cần xác nhận, không hứa thời hạn xóa chưa có.
- [ ] Chọn API có hỗ trợ tích hợp bên ngoài hay chỉ phục vụ ứng dụng; mặc định chưa mở API mới.

Đầu ra: baseline + nội dung công khai đã xác minh + scope API. Các mục chưa xác minh không chặn sửa HTML, status và metadata kỹ thuật.

### Giai đoạn 1 — Sửa HTML và HTTP routing (P0, #1–2)

**File dự kiến:** `index.html`, `vite.config.ts` nếu cần sinh HTML, `vercel.json`, `middleware.ts`, `tests/agent-readiness.mjs`.

- [ ] Đưa nội dung landing hiện có vào raw HTML, bên trong `#root`, để React thay thế khi mount. Ưu tiên bản HTML tĩnh tối thiểu; nếu tái dùng renderer cần thêm quá nhiều thay đổi, không chuyển cả app sang SSR.
- [ ] Giữ thông điệp, lớp CSS và thiết kế landing; tối thiểu 500 ký tự nội dung body hữu ích, đúng một H1, heading tuần tự và link thật tới kho đề/trang thông tin. Không đếm title/script/JSON-LD vào ngưỡng.
- [ ] Không dùng khối nội dung chỉ dành cho bot rồi ẩn bằng CSS. Không coi `root.render()` đã gọi là React đã commit.
- [ ] Thu hẹp SPA rewrite về đúng route hiện có. Unknown path trả 404 trước khi rơi vào app shell; route động đúng hình dạng vẫn tải app, dữ liệu không tồn tại do app xử lý riêng.
- [ ] Dùng Routing Middleware ở root nếu cần trả response theo Accept. `middleware.ts` là convention được Vercel hỗ trợ; không thêm `proxy.entrypoint` khi không cần tên/vị trí tùy chỉnh.
- [ ] Tài nguyên có thật phải được phục vụ đúng file; tài nguyên không có như `/assets/missing.js` phải 404. Không cho mọi URL dưới `/assets/` tồn tại chỉ vì khớp prefix.
- [ ] 404 HTML có giải thích và liên kết về `/`, `/llms.txt`, `/sitemap.xml`; Markdown 404 triển khai cùng giai đoạn 2. Escape URL đầu vào trước khi đưa vào HTML/Markdown.

**Nghiệm thu:** không JS vẫn đọc landing; route lạ 404, route app hợp lệ 200; auth callback có query vẫn hoạt động; favicon/CSS/JS build không hỏng; chụp ảnh landing có JS trước/sau trên desktop/mobile và kiểm tra không nhảy layout lớn.

### Giai đoạn 2 — Markdown, metadata và discovery (P1, #5, #7, #10, #13)

**File dự kiến:** `middleware.ts`, tận dụng/sửa `src/agent/site.ts` nếu phù hợp, thêm một module nội dung công khai nếu cần; `index.html`, `public/llms.txt`, `public/robots.txt`, `public/sitemap.xml`, `public/og-image.png`, `tests/agent-readiness.mjs`.

- [ ] `GET /` với Accept Markdown trả body Markdown khác rỗng, `Content-Type: text/markdown; charset=utf-8`, `Vary: Accept`.
- [ ] Accept HTML hoặc `*/*` mặc định trả HTML; xử lý danh sách media type, q-value và `q=0`, không dùng kiểm tra substring đơn thuần. Khi hai định dạng ngang ưu tiên, mặc định HTML để giữ hành vi browser.
- [ ] 404 Markdown trả đúng status 404, body trên 20 ký tự, có link tới tài nguyên discovery thật. HTML 404 vẫn hoạt động.
- [ ] Hỗ trợ HEAD với header/status tương ứng, không body. Chỉ negotiate nội dung trang; không biến `.json`, `.xml`, CSS, JS thành Markdown.
- [ ] Thêm/ghép `Vary: Accept` vào các response có biến thể, không ghi đè các giá trị Vary khác. Bước đầu dùng revalidation hoặc no-store phù hợp; kiểm tra thực tế CDN Vercel không trộn HTML/Markdown trước khi tăng cache.
- [ ] Nội dung HTML và Markdown mô tả cùng tính năng/điều kiện đăng nhập, dùng cùng nguồn nội dung khi có thể; không cung cấp dữ liệu người học.
- [ ] Canonical tuyệt đối trỏ domain production và đúng path; giữ `lang="vi"` cho nội dung VI, metadata EN chỉ khi có nội dung EN tương ứng.
- [ ] JSON-LD `SoftwareApplication`: name, description, url, applicationCategory, operatingSystem; thêm offers/author/publisher chỉ khi thông tin đã xác minh. Escape dữ liệu khi nhúng script.
- [ ] OG image thật 1200×630, type `website`, URL tuyệt đối, ảnh tải được; tái dùng thiết kế và công cụ hiện có, chưa cần thêm package.
- [ ] `robots.txt` trả text/plain, có Sitemap; sitemap XML hợp lệ chỉ chứa trang công khai canonical. Không liệt kê admin, auth callback, bài viết cá nhân hoặc URL preview.
- [ ] `llms.txt` trả text/plain, theo cấu trúc Markdown của đề xuất llms.txt; chỉ dẫn tới tài liệu tồn tại và nêu phần nào cần đăng nhập. Đây là tài liệu discovery, không phải rào bảo mật hay cam kết bot sẽ tuân theo.

**Nghiệm thu:** thử HTML rồi Markdown và ngược lại trên preview; status/type/body/Vary đúng ở cả hai lần; metadata có trong raw HTML; JSON-LD parse được; mọi link trong llms/sitemap truy cập được.

### Giai đoạn 3 — Trust pages (P1, #9 và #8 có điều kiện)

**File dự kiến:** `public/about/index.html`, `public/contact/index.html`, `public/privacy/index.html` hoặc HTML sinh từ một nguồn nội dung chung; `src/pages/Other.tsx` cho footer; test HTTP và kiểm tra i18n nếu thêm React route.

- [ ] Tạo các trang HTML công khai đọc được không JS, dùng font/màu/khoảng cách hiện có; mỗi trang có title, canonical, H1, nội dung thực tối thiểu 500 ký tự.
- [ ] About: mục đích, đối tượng học, tính năng và giới hạn điểm AI; không ám chỉ chứng nhận/đối tác IELTS nếu chưa có.
- [ ] Contact: kênh đã xác minh, loại yêu cầu hỗ trợ, thông tin nên gửi; không bịa số điện thoại hoặc thời gian phản hồi.
- [ ] Privacy: phản ánh luồng dữ liệu đã kiểm tra ở giai đoạn 0; nêu dịch vụ xử lý AI, lưu/xóa dữ liệu, cách gửi yêu cầu và ngày cập nhật.
- [ ] Dùng liên kết HTML thường từ landing nếu trang được phục vụ độc lập; chỉ thêm React routes nếu cần điều hướng trong app. Tránh tạo cả MPA lẫn React page không cần thiết.
- [ ] Chỉ thêm Organization/PostalAddress nếu có tổ chức và địa chỉ công khai thật. Không sử dụng địa chỉ thành phố như streetAddress để đủ điểm.

**Nghiệm thu:** deep link trực tiếp và footer đều mở đúng trang; HTTP 200 HTML có nội dung; không lộ dữ liệu cá nhân chưa được phép công khai; trang EN nếu có phải hoàn chỉnh, không gắn lang EN cho nội dung VI.

### Giai đoạn 4 — JSON errors và tài liệu API thật (P1/P2, #3–4, #6, #10–12)

**File dự kiến:** `supabase/functions/_shared/http.ts`, test hiện có trong `supabase/functions/_shared/tests/`; `middleware.ts` cho unknown `/api/*`; `public/openapi.json`, các trang `/docs` và `/developers` chỉ khi chốt hỗ trợ tích hợp.

- [ ] Unknown `/api/*` trả 404 `application/json` với code/message/hint/docs URL nếu docs đã tồn tại. Không áp dụng rule này cho endpoint thật được tạo sau này.
- [ ] Giữ tương thích error shape frontend đang đọc; thêm hint theo code khi có cách khắc phục cụ thể, giữ requestId và Retry-After. Lỗi không được lộ stack, SQL hoặc secret.
- [ ] Phân biệt lỗi gateway Supabase với lỗi do handler tạo: kiểm tra cả hai, không cam kết một helper sẽ chuẩn hóa được gateway do nền tảng trả.
- [ ] Nếu API chỉ nội bộ: docs nói rõ phạm vi, chưa tạo public REST/MCP mới; chấp nhận các mục audit không phù hợp sản phẩm còn thiếu.
- [ ] Nếu hỗ trợ tích hợp: lập danh sách endpoint được phép công bố. OpenAPI 3.1.x dùng server URL backend thật; chỉ mô tả operation được hỗ trợ, không công khai worker/admin như API cho người dùng.
- [ ] Mỗi operation có operationId duy nhất, summary/description, parameter typed, required rõ, schema body/response và mã lỗi thực tế. Khai báo auth theo cơ chế hiện có, không bịa quy trình cấp API key.
- [ ] Mô tả giới hạn request, phân trang và rate limit đúng backend. Với chấm bài bất đồng bộ, mô tả 202 và cách đọc trạng thái thực sự hỗ trợ; không giả kết quả đồng bộ.
- [ ] Validate spec bằng validator phù hợp OpenAPI 3.1; kiểm tra `$ref` và response thực, không chỉ `JSON.parse` hoặc so chuỗi phiên bản.
- [ ] Docs có ví dụ curl, auth, lỗi và giới hạn; developer page có tên sản phẩm trong title/H1. Chỉ hướng dẫn sandbox, SDK hoặc API keys nếu các khả năng đó tồn tại.
- [ ] Nếu quyết định cần REST cùng domain cho nội dung công khai: mở task riêng trước khi làm, chốt quyền phân phối đề/mẫu, field allowlist, RLS, rate limit, pagination và chi phí. Không dùng service-role để bỏ qua quyền.

**Nghiệm thu:** lỗi 400/401/403/404/405/429/5xx có test ở lớp có thể kiểm soát; gateway 401 thực tế trả JSON; spec validate và contract khớp API; không gọi AI có phí hoặc ghi/xóa dữ liệu khi smoke test production.

### Giai đoạn 5 — MCP nếu có nhu cầu sản phẩm (P3, #14)

- [ ] Chốt use case thật, ví dụ tìm nội dung học công khai. Chưa mở tool đọc bài riêng hoặc chấm AI khi chưa có thiết kế quyền/chi phí.
- [ ] Xác minh registry thực sự liên quan domain/tác giả của dự án; bỏ kết quả của nhà cung cấp Vercel khỏi bằng chứng về MCP sản phẩm.
- [ ] Theo phiên bản MCP và Streamable HTTP chính thức được chọn; ưu tiên SDK chuẩn khi làm thay vì viết vội vài nhánh JSON-RPC để vượt scanner.
- [ ] Kiểm tra initialize/version negotiation, initialized notification, tools/list, tools/call, input schema, protocol error so với tool error, Accept/Content-Type, Origin và auth nếu có.
- [ ] Nếu scanner cần `/.well-known/mcp`, xác minh schema discovery mà scanner hỗ trợ; không coi URL này là chuẩn bắt buộc chung của MCP hoặc tự phát minh schema.
- [ ] Kiểm thử handshake bằng client MCP độc lập. Manifest trả 200 JSON chưa đủ nghiệm thu.

**Nghiệm thu:** client thực kết nối và gọi tool thành công; input sai/không quyền bị từ chối; không tăng bề mặt dữ liệu riêng tư. Chưa có nhu cầu thì hoãn toàn bộ giai đoạn này.

## 5. Bộ kiểm thử và thứ tự chạy khi triển khai

1. Chạy baseline `npm test`, `npm run test:edge`, `npm run build`; ghi nhận lỗi có trước. Sửa scope draft agent test trước khi đưa vào `package.json`.
2. Bổ sung kiểm tra raw HTML, MIME/status, Accept/q-value, HEAD, routes, tài nguyên thiếu, schema và lỗi JSON cho từng thay đổi. Dùng `node:test` và Playwright đã cài; không thêm framework test.
3. Chạy `npm test`, `npm run test:edge`, `npm run build`; test output `dist` không JS. Các test auth dữ liệu thật chỉ chạy với tài khoản thử nghiệm.
4. Deploy preview ở bước triển khai và chạy HTTP smoke trên URL đó. Vite dev/preview không đại diện cho Routing Middleware/CDN Vercel.
5. Chạy browser regression: `tests/landing-ui.mjs`, `tests/i18n.mjs`, `tests/accessibility.mjs`, `tests/browser.mjs` theo môi trường phù hợp. So ảnh landing desktop/mobile và sáng/tối nếu thay markup/CSS.
6. Sau khi bản triển khai được đưa lên production, chạy lại HTTP smoke chỉ đọc và quét Ora. Tách kết quả tự kiểm khỏi điểm thực tế của scanner; khả năng xuất hiện trong tìm kiếm cần thời gian index.

Các lệnh HTTP kiểm tra cuối, chạy bằng `curl.exe` trong PowerShell:

```powershell
curl.exe -sS -L -i -H "Accept: text/html" https://huybui.vercel.app/
curl.exe -sS -L -i -H "Accept: text/markdown" https://huybui.vercel.app/
curl.exe -sS -L -i -H "Accept: text/markdown;q=0, text/html;q=1" https://huybui.vercel.app/
curl.exe -sS -L -i -H "Accept: text/markdown" https://huybui.vercel.app/agent-audit-missing-20261026
curl.exe -sS -L -i https://huybui.vercel.app/api/agent-audit-missing
curl.exe -sS -L -i https://huybui.vercel.app/robots.txt
curl.exe -sS -L -i https://huybui.vercel.app/llms.txt
curl.exe -sS -L -i https://huybui.vercel.app/sitemap.xml
```

Kiểm tra thêm `/about`, `/contact`, `/privacy`, CSS/JS có thật, asset không tồn tại; `/openapi.json`, `/docs`, `/developers`, MCP chỉ khi đã triển khai scope tương ứng. Kiểm tra status cuối sau redirect, MIME và body; 200 riêng lẻ không đủ.

## 6. Thứ tự giao việc và quy mô

| Đợt | Phạm vi | Công sức sơ bộ | Điều kiện hoàn tất |
|---|---|---|---|
| A | Giai đoạn 0–1: baseline, HTML, real 404 | 1–2 ngày công | Không JS đọc được; app/auth/asset giữ hoạt động |
| B | Giai đoạn 2–3: Markdown, metadata, discovery, trust | 1–2 ngày công kỹ thuật, thêm thời gian xác minh nội dung | Đúng status/MIME/cache; trang và dữ liệu danh tính đúng thực tế |
| C | Giai đoạn 4: lỗi JSON, API docs/spec theo scope | 1–2 ngày công nếu chỉ tài liệu hóa; API mới ước lượng riêng | Spec/contract đúng backend, không thay quyền dữ liệu |
| D | Giai đoạn 5: MCP | Ước lượng sau khi chốt tool/auth/rate limit | Client thật handshake và dùng tool được |

Ước lượng là công sức triển khai và kiểm thử ban đầu, chưa gồm thời gian index tìm kiếm hoặc thay đổi chính sách sản phẩm.

## 7. Quyết định còn cần khi triển khai

- Email liên hệ nào được công khai? Tác giả là cá nhân hay tổ chức, có địa chỉ công khai hợp lệ không?
- Chính sách lưu/xóa dữ liệu và nhà cung cấp AI thực tế là gì?
- Có hỗ trợ nhà phát triển bên ngoài gọi API không? Nếu có: endpoint, auth, hạn mức, quyền dùng nội dung?
- Có use case MCP thật và client mục tiêu không?

Không cần chờ các quyết định trên để bắt đầu sửa HTML, routing, Markdown và metadata không chứa thông tin chưa xác minh.

## 8. Nguồn đối chiếu

- HTTP trực tiếp website và Supabase, mã nguồn và kết quả test ngày 26/10/2026 như ghi ở trên.
- Báo cáo Ora do người dùng cung cấp: dùng làm danh sách tiêu chí, không coi mọi kết luận registry/tìm kiếm là đã xác nhận.
- Vercel Routing Middleware: https://vercel.com/docs/routing-middleware và https://vercel.com/docs/routing-middleware/api — đã đối chiếu tài liệu qua Context7; convention `middleware.ts` ở root, `proxy.entrypoint` dành cho tên/vị trí tùy chỉnh.
- Khi triển khai spec/protocol, đối chiếu phiên bản chính thức: https://spec.openapis.org/oas/v3.1.1.html ; https://modelcontextprotocol.io/specification ; https://llmstxt.org/ ; https://schema.org/SoftwareApplication . Các nguồn này là checklist cho bước triển khai, chưa tuyên bố đã kiểm chứng mọi định dạng trong lần lập kế hoạch.
