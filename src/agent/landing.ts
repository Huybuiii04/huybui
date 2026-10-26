// Copy song ngữ của landing: một nguồn duy nhất cho React (src/pages/Other.tsx)
// và bản HTML tĩnh (src/agent/html.ts). Mỗi chuỗi hiển thị là một cặp
// [tiếng Việt, tiếng Anh] - cùng kiểu Copy với content.ts.
// Chuỗi không phụ thuộc ngôn ngữ (nhãn thương hiệu, đoạn trích tiếng Anh)
// được giữ dạng string thường và hiển thị một lần ở cả hai bản.
import type { Copy } from './content.ts'

export type LandingFeatureIcon = 'pen' | 'clipboard' | 'lightbulb'

export type LandingFeature = {
  href: string
  icon: LandingFeatureIcon
  title: Copy
  body: Copy
  action: Copy
}

export type LandingLink = { href: string; label: Copy }

export type LandingCopy = {
  skipToContent: Copy
  navLabel: Copy
  navPromptLibrary: Copy
  navOpenStudio: Copy
  heroKicker: Copy
  heroTitle: Copy
  heroAccent: Copy
  heroEmphasis: Copy
  heroBody: Copy
  primaryCta: Copy
  secondaryCta: Copy
  perks: readonly Copy[]
  explore: Copy
  studioLabel: Copy
  studioMeta: Copy
  studioTitle: Copy
  studioTitleAccent: Copy
  studioPrompt: Copy
  studioInsightTitle: Copy
  studioInsightBody: Copy
  studioAction: Copy
  studioBottom: Copy
  learningKicker: Copy
  learningTitle: Copy
  learningBody: Copy
  features: readonly LandingFeature[]
  ctaKicker: Copy
  ctaTitle: Copy
  ctaBody: Copy
  donateCta: Copy
  footerStart: Copy
  footerLinks: readonly LandingLink[]
  brandName: string
  brandSub: string
  studioToolbar: string
  studioMetaLabel: string
  studioBottomLabel: string
  studioExcerptBefore: string
  studioExcerptHighlight: string
  studioExcerptAfter: string
  footerCopyright: string
}

export const landingCopy: LandingCopy = {
  skipToContent: ['Đến nội dung', 'Skip to content'],
  navLabel: ['Điều hướng chính', 'Main navigation'],
  navPromptLibrary: ['Kho đề bài', 'Prompt library'],
  navOpenStudio: ['Vào học ngay', 'Open studio'],
  heroKicker: ['KHÔNG GIAN CHO BƯỚC TIẾN MỚI', 'A LITTLE BETTER. EVERY DAY.'],
  heroTitle: ['Ý tưởng của bạn.', 'Your ideas.'],
  heroAccent: ['Diễn đạt ', 'Beautifully '],
  heroEmphasis: ['tốt hơn.', 'expressed.'],
  heroBody: [
    'Từ ý tưởng đầu tiên đến bài viết bạn tự hào. Luyện IELTS Writing, khám phá cách viết hay và xây dựng vốn từ của riêng bạn.',
    'From your first idea to an essay you are proud of. Practise IELTS Writing, discover great writing and build a vocabulary of your own.',
  ],
  primaryCta: ['Bắt đầu viết', 'Start writing'],
  secondaryCta: ['Xem bài mẫu', 'Explore sample feedback'],
  perks: [
    ['Miễn phí học tập', 'Free to learn'],
    ['Task 1 & Task 2', 'Task 1 & Task 2'],
    ['VI / EN', 'VI / EN'],
  ],
  explore: ['Khám phá cách học', 'Find your learning flow'],
  studioLabel: ['Xem trước không gian viết', 'Writing studio preview'],
  studioMeta: ['Bài viết minh họa', 'Sample essay'],
  studioTitle: ['Một trang trắng.', 'A blank page.'],
  studioTitleAccent: ['Vô vàn khả năng.', 'Endless possibilities.'],
  studioPrompt: [
    'Giáo dục trực tuyến có thể thay thế lớp học truyền thống?',
    'Can online education replace the traditional classroom?',
  ],
  studioInsightTitle: ['Mỗi câu viết, một bước tiến.', 'One sentence. One step forward.'],
  studioInsightBody: [
    'Luyện cách nối ý, chọn từ và diễn đạt rõ ràng hơn.',
    'Practise connecting ideas, choosing words and writing with clarity.',
  ],
  studioAction: ['Viết câu đầu tiên của bạn', 'Write your first sentence'],
  studioBottom: ['Học theo nhịp của bạn', 'Learn at your own pace'],
  learningKicker: ['TỪNG BƯỚC, MỖI NGÀY', 'BUILD YOUR WRITING RITUAL'],
  learningTitle: ['Một nơi. Trọn vẹn hành trình.', 'Your whole journey, in one place.'],
  learningBody: ['Viết, khám phá, ghi nhớ. Chọn bước tiếp theo của bạn.', 'Write, explore, remember. Choose your next step.'],
  features: [
    {
      href: '/app/write',
      icon: 'pen',
      title: ['Viết với mục đích', 'Write with purpose'],
      body: [
        'Luyện biểu đồ, thư và luận. Giữ dòng ý tưởng với nháp tự lưu.',
        'Practise charts, letters and essays. Keep your ideas flowing with autosaved drafts.',
      ],
      action: ['Mở không gian viết', 'Open your writing space'],
    },
    {
      href: '/app/prompts',
      icon: 'clipboard',
      title: ['Chọn đề ngay', 'Pick a prompt'],
      body: [
        'Kho đề bài sẵn có đề Task 1 và Task 2 kèm hình ảnh và đề bài đầy đủ.',
        'The prompt library holds ready Task 1 and Task 2 questions with charts and full task text.',
      ],
      action: ['Mở kho đề bài', 'Open the prompt library'],
    },
    {
      href: '/app/vocabulary',
      icon: 'lightbulb',
      title: ['Biến từ mới thành vốn riêng', 'Make new words yours'],
      body: [
        'Lưu cụm từ, cấu trúc và ôn tập theo lịch để ghi nhớ lâu hơn.',
        'Save phrases and structures, then revisit them over time to remember more.',
      ],
      action: ['Mở sổ từ vựng', 'Build your vocabulary'],
    },
  ],
  ctaKicker: ['CÙNG NHAU TIẾN XA', 'ROOM FOR EVERYONE'],
  ctaTitle: ['Tri thức tốt hơn khi được sẻ chia.', 'Learning is better when it is shared.'],
  ctaBody: [
    'Không gói Premium. Không rào cản học tập. Một không gian để bạn tiến bộ mỗi ngày.',
    'No premium tiers. No learning paywalls. A space to grow a little every day.',
  ],
  donateCta: ['Ủng hộ dự án', 'Support the project'],
  footerStart: ['Bắt đầu học', 'Start learning'],
  footerLinks: [
    { href: '/about', label: ['About', 'About'] },
    { href: '/contact', label: ['Contact', 'Contact'] },
    { href: '/privacy', label: ['Privacy', 'Privacy'] },
  ],
  brandName: 'IELTS',
  brandSub: 'WRITING STUDIO',
  studioToolbar: 'WRITING STUDIO',
  studioMetaLabel: 'ACADEMIC · TASK 2',
  studioBottomLabel: 'IELTS Writing',
  studioExcerptBefore: 'Education is no longer confined to the classroom. ',
  studioExcerptHighlight: 'As technology continues to evolve,',
  studioExcerptAfter: ' learners have more opportunities to shape their own journey.',
  footerCopyright: '© 2026 IELTS Writing Studio',
}
