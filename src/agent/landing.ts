import type { Copy } from './content.ts'
const pair = (vi: string, en: string): Copy => [vi, en]

// One content source for React, static HTML and language switching.
export const landingCopy = {
  skipToContent: pair('Đến nội dung', 'Skip to content'),
  navLabel: pair('Điều hướng chính', 'Main navigation'),
  navSkills: pair('Kỹ năng', 'Skills'),
  navPromptLibrary: pair('Kho đề bài', 'Prompt library'),
  navVocabulary: pair('Từ vựng', 'Vocabulary'),
  navOpenStudio: pair('Vào học ngay', 'Open studio'),
  languageSwitchLabel: pair('Ngôn ngữ', 'Language'),
  languageButtons: [{ code: 'vi', label: 'VI' }, { code: 'en', label: 'EN' }] as const,
  themeLabel: pair('Đổi giao diện sáng / tối', 'Toggle light / dark theme'),
  heroKicker: pair('Mỗi ngày tiến một chút', 'A little better. Every day.'),
  heroTitle: pair('Bốn kỹ năng.', 'Four skills.'),
  heroAccent: pair('Một nơi để ', 'One place to '),
  heroEmphasis: pair('tiến bộ', 'get better'),
  heroEnd: pair(' mỗi ngày.', ', every day.'),
  heroBody: pair('Luyện Listening, Reading, Writing, Speaking và xây vốn từ của riêng bạn. Miễn phí, song ngữ Việt – Anh.', 'Practise Listening, Reading, Writing and Speaking, and build a vocabulary of your own. Free, in Vietnamese and English.'),
  primaryCta: pair('Bắt đầu học', 'Start learning'),
  secondaryCta: pair('Xem bài mẫu', 'See sample feedback'),
  signInNote: pair('Một số tính năng cần tài khoản — đăng nhập miễn phí bằng email.', 'Some features need an account — sign in free with email.'),
  learningKicker: pair('Mọi thứ trong một không gian', 'Everything in one studio'),
  learningTitle: pair('Chọn kỹ năng bạn muốn luyện hôm nay.', 'Pick the skill you want to train today.'),
  comingSoon: pair('Sắp có', 'Coming soon'),
  features: [
    { id: 'listening', number: '01', href: '/app', title: pair('Listening', 'Listening'), body: pair('Luyện nghe theo từng phần, quen dần tốc độ và giọng của đề thi thật.', 'Train section by section and get used to the pace and accents of the real exam.'), action: pair('Section 1–4', 'Section 1–4'), comingSoon: true },
    { id: 'reading', number: '02', href: '/app/reading', title: pair('Reading', 'Reading'), body: pair('Đọc hiểu theo từng dạng câu hỏi, nâng tốc độ đọc và vốn từ học thuật.', 'Work through each question type while building reading speed and academic vocabulary.'), action: pair('Passage 1–3', 'Passage 1–3'), comingSoon: false },
    { id: 'writing', number: '03', href: '/app/write', title: pair('Writing', 'Writing'), body: pair('Biểu đồ và bài luận với nháp tự lưu, nhận xét theo band cho từng bài.', 'Charts and essays with autosaved drafts and band-style feedback on each piece.'), action: pair('Task 1 · Task 2', 'Task 1 · Task 2'), comingSoon: false },
    { id: 'speaking', number: '04', href: '/app', title: pair('Speaking', 'Speaking'), body: pair('Rèn phản xạ qua câu hỏi theo chủ đề, từ trả lời ngắn đến nói dài.', 'Build fluency with topic-based questions, from short answers to long turns.'), action: pair('Part 1 · 2 · 3', 'Part 1 · 2 · 3'), comingSoon: true },
    { id: 'vocabulary', number: '+', href: '/app/vocabulary', title: pair('Từ vựng', 'Vocabulary'), body: pair('Lưu cụm từ và cấu trúc hay, rồi ôn lại theo lịch để nhớ lâu hơn.', 'Save phrases and structures, then revisit them over time to remember more.'), action: pair('Sổ từ của riêng bạn', 'Your own word book'), comingSoon: false },
  ],
  rhythmKicker: pair('Nhịp học mỗi ngày', 'Your daily rhythm'),
  rhythmTitle: pair('Ba bước nhỏ, lặp lại mỗi ngày.', 'Three small steps, repeated daily.'),
  steps: [
    { title: pair('Chọn đề', 'Pick a prompt'), body: pair('Kho đề bài có sẵn đề đầy đủ kèm hình ảnh. Mở là luyện được ngay.', 'The prompt library has full tasks with charts. Open one and start.') },
    { title: pair('Luyện tập', 'Practise'), body: pair('Làm bài theo từng kỹ năng, nháp được tự lưu để ý tưởng không bị đứt.', 'Work skill by skill, with drafts autosaved so your ideas keep flowing.') },
    { title: pair('Nhận xét & ghi nhớ', 'Review & remember'), body: pair('Xem nhận xét, lưu từ mới vào sổ riêng và ôn lại khi đến hạn.', 'Read the feedback, save new words to your book and revisit them when due.') },
  ],
  feedbackKicker: pair('Nhận xét theo band', 'Band-style feedback'),
  feedbackTitle: pair('Viết xong, biết ngay mình đứng đâu.', 'Write it. Know where you stand.'),
  feedbackBody: pair('Mỗi bài Writing được nhìn qua 4 tiêu chí chấm của IELTS, kèm gợi ý sửa cụ thể.', 'Every Writing essay is read against the four IELTS criteria, with concrete fixes.'),
  feedbackAction: pair('Xem bài mẫu', 'See a sample'),
  sampleLabel: pair('Bài minh họa', 'Sample essay'),
  criteria: [{ title: 'Task Response', score: '7.0' }, { title: 'Coherence & Cohesion', score: '7.5' }, { title: 'Lexical Resource', score: '6.5' }, { title: 'Grammar', score: '7.0' }],
  ctaTitle: pair('Tri thức tốt hơn khi được sẻ chia.', 'Learning is better when it is shared.'),
  ctaBody: pair('Không gói Premium. Không rào cản học tập. Một không gian để bạn tiến bộ mỗi ngày.', 'No premium tiers. No paywalls. A space to grow a little every day.'),
  donateCta: pair('Ủng hộ dự án', 'Support the project'),
  footerLinks: [{ href: '/about', label: 'About' }, { href: '/contact', label: 'Contact' }, { href: '/privacy', label: 'Privacy' }],
  brandName: 'IELTS Studio',
  footerCopyright: '© 2026 IELTS Studio',
}

// Decorative artwork uses deterministic markup to avoid layout shifts on mount.
export function skillArtwork() {
  return `<div class="skill-tile listening"><span class="tile-number">01</span><div class="tile-visual"><div class="sound-wave">${[0, 3, 1, 5, 2, 4, 1].map(n => `<i style="--i:${n}"></i>`).join('')}</div></div><b>Listening</b></div>
<div class="skill-tile reading"><span class="tile-number">02</span><div class="tile-visual"><div class="reading-lines"><i></i><i></i><i></i></div></div><b>Reading</b></div>
<div class="skill-tile writing"><span class="tile-number">03</span><div class="tile-visual"><svg class="writing-stroke" viewBox="0 0 160 40"><path pathLength="1" d="M4 24c14-22 24 18 38 0s24-20 38 0 24 16 38 0 22-10 36-4"/></svg></div><b>Writing</b></div>
<div class="skill-tile speaking"><span class="tile-number">04</span><div class="tile-visual"><div class="speech-dots"><i style="--i:0"></i><i style="--i:1"></i><i style="--i:2"></i></div></div><b>Speaking</b></div>`
}
