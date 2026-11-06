// Nội dung song ngữ dùng chung cho: React page, bản static trong HTML và bản Markdown cho agent.
// Copy = [tiếng Việt, tiếng Anh]. Agent-facing file luôn dùng index 1 (tiếng Anh).
export type Copy = readonly [string, string]
export type ContentSection = { id: string; heading: Copy; body: Copy[]; list?: Copy[] }
export type ContentPage = { id: string; path: string; title: Copy; summary: Copy; sections: ContentSection[] }

export const home: ContentPage = {
  id: 'home',
  path: '/',
  title: ['Engloo.app — luyện IELTS miễn phí', 'Engloo.app — free IELTS practice'],
  summary: [
    'Không gian luyện IELTS miễn phí cho Listening, Reading, Writing và Speaking, với nhận xét chi tiết, sổ từ vựng và lịch ôn tập.',
    'A free IELTS practice space for Listening, Reading, Writing and Speaking, with detailed feedback, personal vocabulary and review.',
  ],
  sections: [
    {
      id: 'practice',
      heading: ['Bốn kỹ năng, một không gian luyện tập', 'Four skills, one practice space'],
      body: [
        [
          'Luyện Listening, Reading, Writing và Speaking để cải thiện khả năng nghe hiểu, đọc hiểu, viết và giao tiếp. Xem lại câu trả lời, nhận xét và lỗi thường gặp để biết nên tập trung vào đâu trong lần luyện tiếp theo.',
          'Build your Listening, Reading, Writing and Speaking skills through focused IELTS practice. Review your answers, feedback and recurring mistakes to see what to work on next.',
        ],
        [
          'Bản nháp tự lưu, thư viện đề sẵn có biểu đồ và câu hỏi đầy đủ, sổ từ vựng có lịch ôn tập — tất cả gắn với một tài khoản duy nhất.',
          'Drafts save automatically, the prompt library ships with charts and full task text, and your vocabulary library comes with a spaced-review schedule — all tied to one account.',
        ],
      ],
      list: [
        ['Listening, Reading, Writing và Speaking', 'Listening, Reading, Writing and Speaking'],
        ['Chấm bài theo band, có sổ lỗi sai lặp lại', 'Band scoring with a repeatable error logbook'],
        ['Từ vựng ôn theo lịch, không mất trình độ', 'Vocabulary reviewed on a schedule, so progress sticks'],
        ['Không paywall, không quảng cáo', 'No paywalls and no advertising'],
      ],
    },
    {
      id: 'sign-in',
      heading: ['Đăng nhập để luyện', 'Sign in to practise'],
      body: [
        [
          'Các tính năng luyện tập tương tác cần một tài khoản: bài luyện, kết quả, bài viết, bản nháp, thẻ từ vựng và lịch ôn tập được lưu theo tài khoản của bạn. Đăng nhập bằng email, miễn phí và không cần thẻ tín dụng.',
          'The interactive practice features need an account: your attempts, results, essays, drafts, vocabulary cards and review schedule are stored under your account. Sign in with an email address — it is free and needs no credit card.',
        ],
        [
          'Trang này được đọc ngay trong HTML mà không cần chạy JavaScript, nên bạn có thể xem trước nội dung và chính sách trước khi quyết định đăng nhập.',
          'This page is readable as plain HTML without JavaScript, so you can look through the content and the policy before you decide to sign in.',
        ],
      ],
    },
    {
      id: 'audience',
      heading: ['Dành cho ai?', 'Who it is for'],
      body: [
        [
          'Người học cần phản hồi nhanh, muốn biết mình lỗi ở đâu và cần một lịch ôn từ vựng đều đặn. Không có bậc trả phí, không có quảng cáo; chỉ cần một tài khoản để lưu tiến bộ của bạn.',
          'Learners who want fast feedback, a clear view of recurring mistakes and a vocabulary routine. There is no paid tier and no advertising; an account is all it takes to keep your progress.',
        ],
      ],
    },
    {
      id: 'for-agents',
      heading: ['Cho công cụ và trợ lý AI', 'Built for tools and AI agents'],
      body: [
        [
          'Nội dung của bốn trang công khai nằm ngay trong HTML (không cần chạy JavaScript), và chính nội dung đó được trả về dạng Markdown khi agent gửi Accept: text/markdown.',
          'The content of the four public pages sits directly in the HTML (no JavaScript required), and the same content is served as Markdown when an agent asks with Accept: text/markdown.',
        ],
        [
          'Sitemap ở /sitemap.xml. Dự án không phát hành API công khai: những gì bạn đọc được ở đây đều là nội dung tĩnh của chính trang này.',
          'The sitemap is at /sitemap.xml. The project publishes no public API: everything readable here is static content of these very pages.',
        ],
      ],
    },
  ],
}

export const about: ContentPage = {
  id: 'about',
  path: '/about',
  title: ['Về Engloo.app', 'About Engloo.app'],
  summary: [
    'Một dự án cá nhân giúp bạn luyện cả bốn kỹ năng IELTS: Listening, Reading, Writing và Speaking, với phản hồi rõ ràng và hoàn toàn miễn phí.',
    'A one-person project for practising all four IELTS skills — Listening, Reading, Writing and Speaking — with clear feedback and free access.',
  ],
  sections: [
    {
      id: 'mission',
      heading: ['Mục tiêu', 'What this project is for'],
      body: [
        [
          'Engloo.app được xây dựng để giúp bạn luyện cả Listening, Reading, Writing và Speaking trong một không gian. Mục tiêu là rèn nghe hiểu và ghi chú, đọc hiểu và vốn từ, viết Task 1 và Task 2, cùng khả năng diễn đạt và phản xạ khi nói. Nội dung và bài luyện được bổ sung theo từng kỹ năng.',
          'Engloo.app is built to help you practise Listening, Reading, Writing and Speaking in one place. The aim is to develop listening comprehension and note-taking, reading comprehension and vocabulary, Task 1 and Task 2 writing, and confident spoken communication. Content and exercises are added skill by skill.',
        ],
        [
          'Nội dung học tập gồm kho đề, bài đọc, câu hỏi Speaking, hướng dẫn Writing, bài mẫu và thẻ từ vựng. Không có bậc trả phí hay quảng cáo. Đóng góp tự nguyện giúp duy trì hạ tầng và phát triển tài liệu cho cả bốn kỹ năng.',
          'Learning content includes the prompt library, reading passages, speaking questions, writing guides, sample answers and vocabulary cards. There are no paid tiers or advertising. Voluntary donations support the infrastructure and learning material across all four skills.',
        ],
      ],
    },
    {
      id: 'how-it-works',
      heading: ['Cách hoạt động', 'How it works'],
      body: [
        [
          'Chọn kỹ năng và bài luyện phù hợp, làm bài rồi xem lại kết quả. Reading được đối chiếu với đáp án kèm giải thích. Writing có nháp tự lưu và nhận xét theo tiêu chí IELTS; Speaking có hội thoại với AI và góp ý về câu trả lời. Sổ từ vựng và lịch ôn tập giúp bạn ghi nhớ những gì vừa học.',
          'Choose a skill and an exercise, practise, then review the result. Reading answers are checked against an answer key with explanations. Writing includes autosaved drafts and feedback against IELTS criteria; Speaking offers AI conversations and feedback on your responses. Your vocabulary library and review schedule help you retain what you learn.',
        ],
        [
          'Đăng nhập để lưu bài luyện, kết quả, bài viết, thẻ từ vựng và lịch ôn tập theo tài khoản. Phiên đăng nhập và dữ liệu học tập do Supabase quản lý. Trang này không dùng cookie quảng cáo hay tracker bên thứ ba.',
          'Sign in to keep your practice attempts, results, essays, vocabulary cards and review schedule under one account. Supabase manages sign-in sessions and learning data. This site sets no advertising cookies and loads no third-party trackers.',
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
        [
          'Engloo.app là công cụ luyện tập độc lập, không phải sản phẩm của IELTS, IDP hoặc British Council, và không được các tổ chức này bảo trợ hay chứng nhận. Điểm trong ứng dụng là ước lượng theo tiêu chí band công khai, không phải điểm chính thức.',
          'Engloo.app is an independent practice tool. It is not a product of IELTS, IDP or the British Council and is not endorsed or sponsored by them. The scores shown in the app are estimates based on the public band descriptors, not official results.',
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
          'Với lỗi kỹ thuật, hãy gửi trình duyệt, hệ điều hành, bước tái hiện và ảnh chụp màn hình. Với câu hỏi về nội dung, nêu kỹ năng Listening, Reading, Writing hay Speaking, tên bài và câu hỏi liên quan. Với khiếu nại về dữ liệu cá nhân, nêu rõ tài khoản và loại dữ liệu cần xoá.',
          'For a bug, send the browser, operating system, reproduction steps and a screenshot. For a content question, name the skill — Listening, Reading, Writing or Speaking — plus the exercise and question involved. For a privacy complaint, state the account and the data you want removed.',
        ],
        [
          'Phản hồi được gửi khi chúng tôi xử lý xong. Báo cáo bảo mật được ưu tiên hơn các yêu cầu khác.',
          'Replies are sent once we have handled them. Security reports are prioritised over other requests.',
        ],
      ],
    },
    {
      id: 'scope',
      heading: ['Phạm vi hỗ trợ', 'What we can help with'],
      body: [
        [
          'Chúng tôi hỗ trợ lỗi trang web và nội dung cho cả bốn kỹ năng, đề xuất tính năng, góp ý về bản dịch Việt/Anh và các vấn đề quyền riêng tư. Chúng tôi không làm bài thay bạn, không cấp điểm IELTS chính thức và không tư vấn hồ sơ ứng tuyển.',
          'We support website bugs and learning-content questions across all four skills, feature requests, Vietnamese and English translation feedback and privacy issues. We cannot complete exercises on your behalf, produce official IELTS scores, or advise on admissions.',
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
      heading: ['Dữ liệu được lưu', 'What is stored'],
      body: [
        [
          'Dữ liệu tài khoản và học tập nằm trong cơ sở dữ liệu Supabase/Postgres của dự án: email đăng ký, hồ sơ học tập gồm tên hiển thị, band mục tiêu và ngôn ngữ phản hồi; câu trả lời và kết quả bài luyện; bài viết và bản nháp; bản chép lời, nhận xét và điểm Speaking; thẻ từ vựng, lịch ôn tập và sổ lỗi sai. Bản ghi âm Speaking được tải lên khi bạn gửi bài bằng giọng nói.',
          'Account and learning data live in the project Supabase/Postgres database: your registered email and learning profile (display name, target band, feedback language); practice answers and results; essays and drafts; speaking transcripts, feedback and scores; vocabulary cards, review schedules and error logs. Speaking recordings are uploaded when you submit an audio response.',
        ],
        [
          'Phiên đăng nhập do Supabase Auth quản lý, và Supabase lưu credential đã băm của tài khoản; ứng dụng không giữ mật khẩu dạng rõ.',
          'Sign-in sessions are managed by Supabase Auth, which stores the hashed credential for your account; the app itself never keeps the plain-text password.',
        ],
      ],
    },
    {
      id: 'browser-data',
      heading: ['Dữ liệu trong trình duyệt của bạn', 'Data kept in your browser'],
      body: [
        [
          'Bản nháp, ảnh và trạng thái học tập đã cache nằm trong IndexedDB của trình duyệt; lựa chọn ngôn ngữ và giao diện sáng/tối nằm trong localStorage; token phiên quản trị nằm trong sessionStorage. Tất cả chỉ ở trên thiết bị của bạn, và nút "Xoá dữ liệu học tập trên thiết bị này" trong phần Cài đặt xoá cache cục bộ.',
          'Drafts, images and cached learning state live in your browser under IndexedDB; your language choice and light/dark theme are stored in localStorage; the administration session token is kept in sessionStorage. All of it stays on your own device, and the "Clear learning data on this device" control in Settings clears the local cache.',
        ],
      ],
    },
    {
      id: 'ai-processing',
      heading: ['Xử lý bởi AI', 'AI processing'],
      body: [
        [
          'Khi bạn yêu cầu nhận xét Writing hoặc luyện Speaking với AI, nội dung cần thiết để xử lý yêu cầu — bài viết, ảnh bạn chọn, câu trả lời, bản chép lời hoặc bản ghi âm — được gửi tới dịch vụ AI đã cấu hình. Bản ghi âm có thể được xử lý để chép lời và chấm bài nói. Mã nguồn hỗ trợ Anthropic API và các endpoint tương thích; dịch vụ đang dùng phụ thuộc vào cấu hình triển khai.',
          'When you request Writing feedback or practise Speaking with AI, the content needed for that request — essay text, selected images, responses, transcripts or recordings — is sent to the configured AI service. Recordings may be processed for transcription and speaking assessment. The code supports the Anthropic API and compatible endpoints; the active service depends on deployment configuration.',
        ],
        [
          'Dự án không cam kết về thời gian dịch vụ AI lưu giữ nội dung nhận được hay cách dịch vụ đó sử dụng nội dung sau đó. Nếu điều đó quan trọng với bạn, hãy hỏi trước khi gửi bài viết hoặc bản ghi âm.',
          'This project makes no promise about how long an AI service retains submitted content or how it uses that content afterwards. If that matters to you, please ask before submitting writing or recordings.',
        ],
      ],
    },
    {
      id: 'not-collected',
      heading: ['Điều chúng tôi không làm', 'What we do not do'],
      body: [
        [
          'Không quảng cáo, không tracker bên thứ ba, không bán dữ liệu người dùng và không dùng cookie để theo dõi hành vi. Dữ liệu chỉ được dùng để cung cấp tính năng luyện IELTS, lưu tiến độ và xử lý AI như mô tả ở trên.',
          'No advertising, no third-party trackers, no selling user data and no tracking cookies. Data is used to provide IELTS practice, save learning progress and perform the AI processing described above.',
        ],
      ],
    },
    {
      id: 'rights',
      heading: ['Quyền của bạn', 'Your rights'],
      body: [
        [
          'Bạn có thể yêu cầu xoá tài khoản và dữ liệu liên kết bất cứ lúc nào bằng cách gửi email cho chúng tôi. Khi thao tác xoá hoàn tất thành công, các job chấm đang chờ của tài khoản bị huỷ, các tệp bạn đã tải lên bị xoá khỏi bộ nhớ, user đăng nhập bị xoá, và dữ liệu học tập gắn với tài khoản (bài viết, bản nháp, thẻ từ vựng, lịch ôn tập, sổ lỗi sai) bị xoá theo cơ chế cascade của cơ sở dữ liệu.',
          'You can ask us to delete your account and the data linked to it at any time by emailing us. When the deletion completes successfully, the queued grading jobs for the account are cancelled, the files you uploaded are removed from storage, the authentication user is deleted, and the learning data attached to the account — essays, drafts, vocabulary cards, review schedules and error logs — is removed through the database cascade.',
        ],
        [
          'Ngoài ra, quản trị viên của trang có thể xoá một tài khoản khi có lý do hợp lệ.',
          'In addition, a site administrator may delete an account when there is a legitimate reason.',
        ],
        [
          'Cam kết đó áp dụng cho dữ liệu tài khoản nêu trên; nó không áp dụng cho backup, log hệ thống hay dữ liệu đã đi tới endpoint AI.',
          'That promise covers the account data described above; it does not extend to backups, system logs, or data that has already reached the AI endpoint.',
        ],
        [
          'Các bản ghi vận hành về mức sử dụng và chi phí AI không gắn trực tiếp với một tài khoản, nên có thể vẫn còn trong cơ sở dữ liệu để vận hành và kiểm toán.',
          'Operational records of AI usage and cost are not tied to a single account, so they can remain in the database for operations and audit purposes.',
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
          'Chính sách này được cập nhật khi tính năng thay đổi. Ngày cập nhật gần nhất hiển thị ngay dưới đây.',
          'This policy is updated as the features change. The last updated date is shown right below.',
        ],
        [
          'Cập nhật lần cuối: 30 tháng 10 năm 2026.',
          'Last updated: 30 October 2026.',
        ],
      ],
    },
  ],
}

export const pages: ContentPage[] = [home, about, contact, privacy]

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
