// Nội dung song ngữ dùng chung cho: React page, bản static trong HTML và bản Markdown cho agent.
// Copy = [tiếng Việt, tiếng Anh]. Agent-facing file luôn dùng index 1 (tiếng Anh).
export type Copy = readonly [string, string]
export type ContentSection = { id: string; heading: Copy; body: Copy[]; list?: Copy[] }
export type ContentPage = { id: string; path: string; title: Copy; summary: Copy; sections: ContentSection[] }

export const home: ContentPage = {
  id: 'home',
  path: '/',
  title: ['IELTS Writing Studio — luyện IELTS Writing miễn phí', 'IELTS Writing Studio — free IELTS Writing practice'],
  summary: [
    'Không gian luyện IELTS Writing Task 1 và Task 2: chọn đề, viết bài, nhận chấm theo band và lưu lại từ vựng của riêng bạn.',
    'A free practice space for IELTS Writing Task 1 and Task 2: pick a prompt, write an essay, get band-style feedback and keep your own vocabulary.',
  ],
  sections: [
    {
      id: 'practice',
      heading: ['Luyện viết có hệ thống', 'A deliberate writing practice'],
      body: [
        [
          'Mỗi bài viết đều được chấm theo bốn tiêu chí Task 2 (Task 1: ba tiêu chí), kèm nhận xét và gợi ý cải thiện cụ thể cho từng đoạn.',
          'Every essay is graded against the four Task 2 criteria (three criteria for Task 1), with concrete, paragraph-level notes on what to improve next.',
        ],
        [
          'Bản nháp tự lưu, thư viện đề sẵn có biểu đồ và câu hỏi đầy đủ, sổ từ vựng có lịch ôn tập — tất cả trong một tài khoản duy nhất.',
          'Drafts save automatically, the prompt library ships with charts and full task text, and your vocabulary library comes with a spaced-review schedule — all under one account.',
        ],
      ],
      list: [
        ['Task 1 (Academic & General) và Task 2', 'Task 1 (Academic & General) and Task 2'],
        ['Chấm bài theo band, có người sửa lỗi lặp lại', 'Band scoring with a repeatable error logbook'],
        ['Từ vựng ôn theo lịch, không mất trình độ', 'Vocabulary reviewed on a schedule, so progress sticks'],
        ['Không paywall, không quảng cáo', 'No paywalls and no advertising'],
      ],
    },
    {
      id: 'audience',
      heading: ['Dành cho ai?', 'Who it is for'],
      body: [
        [
          'Người học cần phản hồi nhanh, muốn biết mình lỗi ở đâu và cần một lịch ôn từ vựng đều đặn. Không cần tài khoản trả phí, không cần thẻ tín dụng.',
          'Learners who want fast feedback, a clear view of recurring mistakes and a vocabulary routine. No paid tier, no credit card, no sign-up wall for the free practice flow.',
        ],
      ],
    },
    {
      id: 'for-agents',
      heading: ['Cho công cụ và trợ lý AI', 'Built for tools and AI agents'],
      body: [
        [
          'Trang này có nội dung đọc được ngay trong HTML (không cần chạy JavaScript), phản hồi Markdown khi agent gửi Accept: text/markdown, và mã lỗi JSON có mã lỗi cùng gợi ý xử lý.',
          'This page ships readable content directly in HTML (no JavaScript required), serves Markdown when an agent asks for it with Accept: text/markdown, and answers the public API with structured JSON errors that carry a code and a resolution hint.',
        ],
        [
          'Bản đặc tả OpenAPI nằm ở /openapi.json, chỉ mục agent ở /llms.txt, sitemap ở /sitemap.xml và MCP server ở /api/mcp.',
          'The OpenAPI specification lives at /openapi.json, the agent index at /llms.txt, the sitemap at /sitemap.xml and the MCP server at /api/mcp.',
        ],
      ],
    },
  ],
}

export const about: ContentPage = {
  id: 'about',
  path: '/about',
  title: ['Về IELTS Writing Studio', 'About IELTS Writing Studio'],
  summary: [
    'Một dự án cá nhân xây dựng để việc luyện IELTS Writing trở nên công khai, có phản hồi thật và không tốn tiền.',
    'A one-person project built to make IELTS Writing practice open, genuinely feedback-driven and free to use.',
  ],
  sections: [
    {
      id: 'mission',
      heading: ['Mục tiêu', 'What this project is for'],
      body: [
        [
          'IELTS Writing Studio là không gian luyện viết dành riêng cho IELTS Writing Task 1 và Task 2. Học viên chọn một đề trong thư viện, viết trong không gian viết có lưu nháp tự động, rồi nhận chấm bài theo đúng tiêu chí band của IELTS kèm nhận xét chi tiết và các lỗi thường gặp được gom vào sổ lỗi sai.',
          'IELTS Writing Studio is a practice space built only for IELTS Writing Task 1 and Task 2. Learners pick a prompt from the library, write in an editor that saves drafts automatically, then receive band-style grading against the real IELTS criteria together with detailed notes and the recurring mistakes collected into an error logbook.',
        ],
        [
          'Mọi nội dung học tập — kho đề, khung bài, mẫu bài và thẻ từ vựng — đều mở cho mọi người, không có bậc trả phí và không có quảng cáo. Đóng góp tự nguyện giúp duy trì hạ tầng và phát triển thêm tài liệu.',
          'All learning content — the prompt library, essay frameworks, sample answers and vocabulary cards — stays open to everyone. There are no paid tiers and no advertising. Voluntary donations keep the infrastructure running and fund new learning material.',
        ],
      ],
    },
    {
      id: 'how-it-works',
      heading: ['Cách hoạt động', 'How it works'],
      body: [
        [
          'Bài của bạn được gửi tới nhà cung cấp AI đã cấu hình để chấm theo rubric, rồi kết quả được tách thành điểm từng tiêu chí, nhận xét theo đoạn và danh sách lỗi ngữ pháp để luyện lại. Bạn sở hữu toàn bộ bài viết và có thể xoá bất kỳ lúc nào.',
          'Your essay is sent to the configured AI provider for rubric-based grading, and the result is split into per-criterion scores, paragraph-level notes and a grammar error list to practise from. You own every essay and can delete it whenever you like.',
        ],
        [
          'Tài khoản, bài viết, thẻ từ vựng và lịch ôn tập được lưu trong Postgres của dự án; phiên đăng nhập do Supabase quản lý. Trang này không dùng cookie quảng cáo hay tracker bên thứ ba.',
          'Accounts, essays, vocabulary cards and review schedules are stored in the project Postgres database, and sessions are handled by Supabase. This site sets no advertising cookies and loads no third-party trackers.',
        ],
      ],
    },
    {
      id: 'maintainer',
      heading: ['Người duy trì', 'Who maintains it'],
      body: [
        [
          'Dự án do một lập trình viên cá nhân tại Việt Nam duy trì, mã nguồn mở trên GitHub. Mọi góp ý về nội dung, bản dịch hoặc trải nghiệm học đều được hoan nghênh qua trang liên hệ.',
          'The project is maintained by a single developer based in Vietnam, with the source code published on GitHub. Feedback on content, translations or the learning experience is welcome through the contact page.',
        ],
      ],
    },
  ],
}

export const contact: ContentPage = {
  id: 'contact',
  path: '/contact',
  title: ['Liên hệ', 'Contact'],
  summary: [
    'Cách nhanh nhất để liên hệ với dự án, và thông tin cần có trong tin nhắn để được xử lý nhanh.',
    'The fastest way to reach the project, plus what to include so your message can be handled quickly.',
  ],
  sections: [
    {
      id: 'channels',
      heading: ['Kênh liên hệ', 'How to reach us'],
      body: [
        [
          'Gửi email cho buidinhanhhuy@gmail.com, hoặc mở một issue trên GitHub tại github.com/Huybuiii04/huybui. Issue phù hợp hơn cho lỗi kỹ thuật và đề xuất tính năng; email phù hợp hơn cho câu hỏi riêng tư, hợp tác hoặc khiếu nại về quyền riêng tư.',
          'Email buidinhanhhuy@gmail.com, or open an issue on GitHub at github.com/Huybuiii04/huybui. Issues fit bug reports and feature requests better; email is better for private questions, collaborations or privacy complaints.',
        ],
        [
          'Kênh hỗ trợ chính thức duy nhất của dự án là email và GitHub Issues. Chúng tôi không nhận yêu cầu hỗ trợ qua mạng xã hội hay tin nhắn trực tiếp.',
          'The only official support channels are email and GitHub Issues. Support requests sent through social networks or direct messages cannot be answered.',
        ],
      ],
      list: [
        ['Email: buidinhanhhuy@gmail.com', 'Email: buidinhanhhuy@gmail.com'],
        ['GitHub Issues: github.com/Huybuiii04/huybui/issues', 'GitHub Issues: github.com/Huybuiii04/huybui/issues'],
        ['Mã nguồn: github.com/Huybuiii04/huybui', 'Source code: github.com/Huybuiii04/huybui'],
      ],
    },
    {
      id: 'include',
      heading: ['Nên gửi kèm gì', 'What to include'],
      body: [
        [
          'Với lỗi kỹ thuật, hãy gửi trình duyệt, hệ điều hành, bước tái hiện và ảnh chụp màn hình. Với câu hỏi về nội dung, gửi tên đề hoặc loại bài đang luyện. Với khiếu nại về dữ liệu cá nhân, nêu rõ tài khoản và loại dữ liệu cần xoá.',
          'For a bug, send the browser, operating system, reproduction steps and a screenshot. For a content question, name the prompt or essay type you were working on. For a privacy complaint, state the account and the data you want removed.',
        ],
        [
          'Phản hồi thường mất tối đa vài ngày làm việc. Báo cáo bảo mật được ưu tiên xử lý nhanh hơn các yêu cầu khác.',
          'Replies usually take a few working days. Security reports are prioritised over other requests.',
        ],
      ],
    },
    {
      id: 'scope',
      heading: ['Phạm vi hỗ trợ', 'What we can help with'],
      body: [
        [
          'Chúng tôi hỗ trợ về lỗi trang web, câu hỏi về nội dung học tập, đề xuất tính năng, góp ý về bản dịch Việt/Anh và các vấn đề quyền riêng tư. Chúng tôi không thể viết bài thay bạn, không chấm điểm bài IELTS chính thức và không tư vấn hồ sơ ứng tuyển.',
          'We support website bugs, learning-content questions, feature requests, Vietnamese and English translation feedback and privacy issues. We cannot write essays on your behalf, produce official IELTS scores, or advise on admissions.',
        ],
      ],
    },
  ],
}

export const privacy: ContentPage = {
  id: 'privacy',
  path: '/privacy',
  title: ['Chính sách bảo mật', 'Privacy Policy'],
  summary: [
    'Những gì dự án lưu, dùng để làm gì, và cách yêu cầu xoá dữ liệu.',
    'What this project stores, why it stores it, and how to ask for your data to be deleted.',
  ],
  sections: [
    {
      id: 'collect',
      heading: ['Dữ liệu được thu thập', 'What is collected'],
      body: [
        [
          'Khi bạn đăng ký, dự án lưu địa chỉ email, mật khẩu do Supabase quản lý (dạng băm) và hồ sơ học tập gồm tên hiển thị, band mục tiêu và ngôn ngữ phản hồi. Bài viết, bản nháp, thẻ từ vựng và lịch ôn tập được lưu trong cơ sở dữ liệu Postgres của dự án.',
          'When you register, the project stores your email address, a Supabase-managed hashed password and a learning profile with a display name, target band and feedback language. Essays, drafts, vocabulary cards and review schedules are stored in the project Postgres database.',
        ],
        [
          'Dữ liệu trong trình duyệt (bộ nhớ đệm cục bộ, lựa chọn ngôn ngữ, lựa chọn giao diện sáng/tối) được lưu trong localStorage của chính trình duyệt bạn và có thể xoá bằng chức năng "Xoá dữ liệu học tập" trong phần Cài đặt.',
          'Browser-side data (local cache, language choice, light/dark theme) lives in your own localStorage and can be cleared with the "Clear learning data" control in Settings.',
        ],
      ],
    },
    {
      id: 'ai-processing',
      heading: ['Xử lý bởi AI', 'AI processing'],
      body: [
        [
          'Khi bạn yêu cầu chấm bài, nội dung bài viết của bạn được gửi tới nhà cung cấp AI đã cấu hình cho dự án để tạo điểm, nhận xét và danh sách lỗi. Bài viết không được dùng để huấn luyện mô hình của bên thứ ba, và chúng tôi không gửi bất kỳ thông tin tài khoản nào kèm theo.',
          'When you request feedback, your essay text is sent to the AI provider configured for this project to produce scores, notes and error lists. Essay text is not used to train third-party models, and no account details are sent with it.',
        ],
      ],
    },
    {
      id: 'not-collected',
      heading: ['Điều chúng tôi không làm', 'What we do not do'],
      body: [
        [
          'Không quảng cáo, không tracker bên thứ ba, không bán hoặc chia sẻ dữ liệu người dùng, không dùng cookie để theo dõi hành vi. Dữ liệu chỉ được dùng để cung cấp chính sản phẩm luyện viết.',
          'No advertising, no third-party trackers, no selling or sharing user data, and no tracking cookies. Your data is used only to provide the writing practice product itself.',
        ],
      ],
    },
    {
      id: 'rights',
      heading: ['Quyền của bạn', 'Your rights'],
      body: [
        [
          'Bạn có thể xoá tài khoản và toàn bộ dữ liệu liên kết bất cứ lúc nào bằng nút "Xoá tài khoản" trong phần Cài đặt, hoặc gửi email cho chúng tôi. Chúng tôi phản hồi yêu cầu xoá trong vòng 30 ngày.',
          'You can delete your account and all linked data at any time with the "Delete account" control in Settings, or by emailing us. Deletion requests are completed within 30 days.',
        ],
        [
          'Bất kỳ câu hỏi nào về quyền riêng tư, gửi email tới buidinhanhhuy@gmail.com hoặc xem trang Liên hệ.',
          'For any privacy question, email buidinhanhhuy@gmail.com or read the Contact page.',
        ],
      ],
    },
    {
      id: 'changes',
      heading: ['Thay đổi chính sách', 'Policy changes'],
      body: [
        [
          'Chính sách này có thể được cập nhật khi tính năng thay đổi. Ngày cập nhật gần nhất hiển thị trên trang này; thay đổi lớn sẽ được thông báo trong giao diện ứng dụng.',
          'This policy may change as features evolve. The last updated date appears on this page, and significant changes are announced inside the app.',
        ],
      ],
    },
  ],
}

export const developers: ContentPage = {
  id: 'developers',
  path: '/developers',
  title: ['Developer Portal', 'Developer Portal'],
  summary: [
    'Tài liệu API công khai, quickstart, môi trường thử nghiệm và MCP server để gọi bằng công cụ AI.',
    'Public API documentation, a quickstart, the sandbox environment and an MCP server for AI tooling.',
  ],
  sections: [
    {
      id: 'quickstart',
      heading: ['Bắt đầu trong 30 giây', 'Quickstart in 30 seconds'],
      body: [
        [
          'Base URL của API là https://huybui.vercel.app. Các endpoint đọc không cần xác thực, nên bạn có thể gọi ngay bằng curl:',
          'The API base URL is https://huybui.vercel.app. Read endpoints need no authentication, so you can call them straight away with curl:',
        ],
      ],
      list: [
        ['curl https://huybui.vercel.app/api/health', 'curl https://huybui.vercel.app/api/health'],
        ['curl "https://huybui.vercel.app/api/prompts?task=task2&limit=3"', 'curl "https://huybui.vercel.app/api/prompts?task=task2&limit=3"'],
        ['curl https://huybui.vercel.app/api/prompts/<slug>', 'curl https://huybui.vercel.app/api/prompts/<slug>'],
        ['curl https://huybui.vercel.app/openapi.json', 'curl https://huybui.vercel.app/openapi.json'],
      ],
    },
    {
      id: 'auth',
      heading: ['Xác thực và API key', 'Authentication and API keys'],
      body: [
        [
          'Các endpoint công khai (/api/health, /api/prompts, /api/prompts/{slug}, /api/library) là read-only và không cần API key. API key theo lô chưa được cấp: các thao tác ghi dữ liệu (lưu bài, thẻ từ vựng, hồ sơ) vẫn đi qua phiên đăng nhập Supabase của chính ứng dụng, và chưa có hạ tầng phát hành khoá cho bên thứ ba.',
          'The public endpoints (/api/health, /api/prompts, /api/prompts/{slug}, /api/library) are read-only and need no API key. Per-project API keys are not issued yet: write operations (saving essays, vocabulary cards, profiles) still use the in-app Supabase session, and there is no key issuance infrastructure for third parties.',
        ],
        [
          'Khi chúng tôi bật API key, khoá sẽ được phát hành qua trang này, chỉ hiển thị một lần và gắn với một danh sách endpoint cho phép. Mọi lỗi trả về đều kèm mã lỗi và gợi ý xử lý để bạn không cần đoán.',
          'When API keys are enabled they will be issued on this page, shown once, and scoped to an allow-list of endpoints. Every error response carries an error code and a resolution hint so you never have to guess.',
        ],
      ],
    },
    {
      id: 'endpoints',
      heading: ['Các endpoint chính', 'Main endpoints'],
      body: [
        [
          'Bản đặc tả đầy đủ nằm ở /openapi.json (OpenAPI 3.1) và bản đọc cho người ở /docs.',
          'The full specification is at /openapi.json (OpenAPI 3.1) and the human-readable version is at /docs.',
        ],
      ],
      list: [
        ['GET /api/health — trạng thái dịch vụ và phiên bản', 'GET /api/health — service status and version'],
        ['GET /api/prompts — danh sách đề, lọc theo task, tìm kiếm, phân trang', 'GET /api/prompts — prompt list with task filter, search and pagination'],
        ['GET /api/prompts/{slug} — một đề kèm đầy đủ nội dung và rubric gợi ý', 'GET /api/prompts/{slug} — one prompt with full text and hint'],
        ['GET /api/library — khung bài, bài mẫu và thẻ từ vựng', 'GET /api/library — essay frameworks, sample answers and vocabulary cards'],
        ['POST /api/mcp — MCP server Streamable HTTP (JSON-RPC 2.0)', 'POST /api/mcp — MCP server over Streamable HTTP (JSON-RPC 2.0)'],
      ],
    },
    {
      id: 'mcp',
      heading: ['MCP server', 'MCP server'],
      body: [
        [
          'Dự án cung cấp MCP server tại https://huybui.vercel.app/api/mcp dùng transport Streamable HTTP, và manifest tại /.well-known/mcp. Các tool gồm list_prompts, get_prompt, get_learning_template và list_writing_frameworks, nên Claude, ChatGPT hay bất kỳ agent nào hỗ trợ MCP đều gọi được.',
          'The project ships an MCP server at https://huybui.vercel.app/api/mcp over Streamable HTTP, with its manifest at /.well-known/mcp. Tools include list_prompts, get_prompt, get_learning_template and list_writing_frameworks, so Claude, ChatGPT and any MCP-capable agent can call it.',
        ],
      ],
    },
    {
      id: 'sandbox',
      heading: ['Môi trường thử nghiệm', 'Sandbox environment'],
      body: [
        [
          'Chính trang này là môi trường thử nghiệm: mọi endpoint đọc đều trả về dữ liệu thật và không có tác động ghi. Endpoint ghi cần phiên đăng nhập, vì vậy trong khi chờ API key, hãy dùng bản demo trong ứng dụng (https://huybui.vercel.app/app/essays/demo) để xem luồng chấm bài.',
          'This site is the sandbox: every read endpoint returns live data and nothing is mutated. Write endpoints need a session, so until API keys exist, use the in-app demo (https://huybui.vercel.app/app/essays/demo) to see the grading flow.',
        ],
      ],
    },
    {
      id: 'limits',
      heading: ['Giới hạn và ổn định', 'Rate limits and stability'],
      body: [
        [
          'API hiện phục vụ ở mức tốt nhất có thể và không áp dụng rate limit cứng, nhưng chúng tôi có thể thêm giới hạn khi tải tăng. Không gọi lặp lại cùng một đề hàng nghìn lần; hãy dùng tham số limit và offset.',
          'The API currently serves best-effort and enforces no hard rate limit, though limits may be added as traffic grows. Do not poll the same prompt thousands of times; use the limit and offset parameters instead.',
        ],
        [
          'Khi có thay đổi phá vỡ tương thích, số phiên bản trong /api/health sẽ tăng và thay đổi sẽ được ghi trong mục thay đổi của trong /docs.',
          'When a breaking change lands, the version field in /api/health increments and the change is listed in the changelog section of /docs.',
        ],
      ],
    },
  ],
}

export const docs: ContentPage = {
  id: 'docs',
  path: '/docs',
  title: ['API Documentation', 'API Documentation'],
  summary: [
    'Tài liệu endpoint, mã lỗi, ví dụ request/response và cách gọi MCP server.',
    'Endpoint reference, error codes, request and response examples, and how to talk to the MCP server.',
  ],
  sections: [
    {
      id: 'overview',
      heading: ['Tổng quan', 'Overview'],
      body: [
        [
          'API là REST JSON trên https://huybui.vercel.app/api, không cần xác thực cho các endpoint đọc. Đặc tả máy đọc nằm ở /openapi.json (OpenAPI 3.1.0); mỗi operation có operationId duy nhất, mô tả, tham số có kiểu và schema phản hồi để công cụ AI có thể ánh xạ trực tiếp sang function calling.',
          'The API is REST JSON on https://huybui.vercel.app/api and needs no authentication for read endpoints. The machine-readable specification lives at /openapi.json (OpenAPI 3.1.0); every operation carries a unique operationId, a description, typed parameters and response schemas so tools can map the API straight onto function calling.',
        ],
      ],
    },
    {
      id: 'conventions',
      heading: ['Quy ước chung', 'Shared conventions'],
      body: [
        [
          'Mọi phản hồi trả về Content-Type application/json. Danh sách dùng tham số limit (mặc định 20, tối đa 100) và offset (mặc định 0). Tham số không hợp lệ trả về HTTP 400 kèm mã invalid_parameter.',
          'Every response is served as application/json. Lists accept limit (default 20, maximum 100) and offset (default 0). Invalid parameters return HTTP 400 with the invalid_parameter code.',
        ],
      ],
    },
    {
      id: 'errors',
      heading: ['Định dạng lỗi', 'Error format'],
      body: [
        [
          'Lỗi luôn trả về cùng một cấu trúc: đối tượng error chứa code, message, hint, status và documentation. message nói chuyện gì đã xảy ra, hint chỉ cách sửa, nên agent có thể tự xử lý mà không cần đoán.',
          'Errors always use the same shape: an error object with code, message, hint, status and documentation. The message says what happened, the hint says how to fix it, so an agent can recover without guessing.',
        ],
      ],
    },
    {
      id: 'endpoints',
      heading: ['Danh sách endpoint', 'Endpoint reference'],
      body: [
        [
          'GET /api/health trả trạng thái dịch vụ, phiên bản và thời điểm phục vụ. GET /api/prompts trả danh sách đề luyện có phân trang, lọc theo task (task2, academic_task1, general_task1) và tìm kiếm theo tiêu đề hoặc nội dung. GET /api/prompts/{slug} trả một đề đầy đủ gồm đề bài, gợi ý và thời lượng đề xuất; slug không tồn tại trả về HTTP 404 với mã prompt_not_found.',
          'GET /api/health returns service status, version and timestamp. GET /api/prompts returns the practice prompt list with pagination, a task filter (task2, academic_task1, general_task1) and search across title and body. GET /api/prompts/{slug} returns a single prompt with full text, hint and suggested duration; an unknown slug returns HTTP 404 with the prompt_not_found code.',
        ],
        [
          'GET /api/library trả các khung bài, bài mẫu và thẻ từ vựng dùng để luyện. POST /api/mcp là MCP server Streamable HTTP: gửi JSON-RPC 2.0 với initialize, tools/list hoặc tools/call; phản hồi là JSON-RPC với protocolVersion và serverInfo.',
          'GET /api/library returns the essay frameworks, sample answers and vocabulary cards used for practice. POST /api/mcp is the MCP server over Streamable HTTP: send JSON-RPC 2.0 with initialize, tools/list or tools/call; the reply is JSON-RPC carrying protocolVersion and serverInfo.',
        ],
      ],
    },
    {
      id: 'mcp',
      heading: ['Gọi MCP server', 'Calling the MCP server'],
      body: [
        [
          'Bắt đầu bằng initialize, sau đó gọi tools/list để lấy danh sách tool và tools/call để chạy một tool. Ví dụ: {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"my-agent","version":"1.0.0"}}}.',
          'Start with initialize, then call tools/list to enumerate tools and tools/call to run one. Example: {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"my-agent","version":"1.0.0"}}}.',
        ],
      ],
    },
  ],
}

export const pages: ContentPage[] = [home, about, contact, privacy, developers, docs]

export function pageById(id: string) {
  return pages.find(page => page.id === id)
}

export function pageByPath(path: string) {
  return pages.find(page => page.path === path)
}

export function plainText(page: ContentPage, lang: 0 | 1 = 1) {
  const parts: string[] = [page.title[lang], page.summary[lang]]
  for (const section of page.sections) {
    parts.push(section.heading[lang])
    parts.push(...section.body.map(item => item[lang]))
    if (section.list) parts.push(...section.list.map(item => item[lang]))
  }
  return parts.filter(Boolean).join('\n\n')
}
