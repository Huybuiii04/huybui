import type { ChartSpec } from '../components/ChartPreview'

export type TaskKind = 'task2' | 'academic_task1' | 'general_task1'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type Source = 'practice' | 'recalled' | 'predicted'

export type PromptItem = {
  slug: string
  task: TaskKind
  subtype: string
  typeLabel: string
  source: Source
  setName?: string
  difficulty: Difficulty
  topics: string[]
  title: [string, string]
  text: string
  reference?: string
  chart?: ChartSpec
  minutes: number
  hint: [string, string]
}

export type EssayType = { key: string; label: string; description: [string, string] }
export type LetterType = { key: string; label: string; description: [string, string] }
export type ChartType = { key: string; labelVi: string; labelEn: string; descriptionVi: string; descriptionEn: string; sortOrder: number }
export type TopicType = { key: string; labelVi: string; labelEn: string; descriptionVi: string; descriptionEn: string; subtopics: string[]; sortOrder: number }

export const essayTypes: EssayType[] = [
  { key: 'opinion', label: 'Opinion', description: ['Nêu quan điểm cá nhân, đồng thuận hoặc không đồng thuận với một phát biểu.', 'Express your personal viewpoint, agreeing or disagreeing with a given statement.'] },
  { key: 'discussion', label: 'Discussion', description: ['Thảo luận cả hai phía của một vấn đề rồi đưa ra ý kiến của bạn.', 'Discuss both sides of an argument and give your own opinion.'] },
  { key: 'problem', label: 'Problem-Solution', description: ['Phân tích nguyên nhân, hậu quả hoặc đề xuất cách giải quyết cụ thể.', 'Explore the causes, effects, or propose specific solutions.'] },
  { key: 'advantage', label: 'Advantage-Disadvantage', description: ['Thảo luận lợi ích và bất lợi của một vấn đề cụ thể.', 'Discuss the advantages and disadvantages of a specific issue.'] },
  { key: 'two-part', label: 'Two-part / Double Questions', description: ['Phân tích và viết bài luận trả lời hai câu hỏi cùng chủ đề.', 'Analyze and write an essay to answer two questions on the same topic.'] },
]

export const letterTypes: LetterType[] = [
  { key: 'request', label: 'Request', description: ['Gửi yêu cầu hoặc hỏi thông tin về một vấn đề cụ thể.', 'Make a request or inquire about details related to a particular issue.'] },
  { key: 'complaint', label: 'Complaint', description: ['Khiếu nại về một sự cố, dịch vụ kém hoặc trải nghiệm không tốt.', 'Complain about an incident, poor service, or unsatisfactory experience.'] },
  { key: 'apology', label: 'Apology', description: ['Bày tỏ lời xin lỗi về một hành động hoặc sự cố cụ thể.', 'Express an apology for a specific action or event that occurred.'] },
  { key: 'thanks', label: 'Thank-you', description: ['Cảm ơn sự giúp đỡ, lời mời hoặc một cử chỉ tốt đẹp.', 'Express gratitude for help, an invitation, or a kind gesture.'] },
  { key: 'invitation', label: 'Invitation', description: ['Gửi lời mời đến một sự kiện, buổi gặp gỡ hoặc dịp đặc biệt.', 'Send an invitation to an event, gathering, or special occasion.'] },
  { key: 'advice', label: 'Advice', description: ['Xin hoặc đưa ra lời khuyên về một tình huống cụ thể.', 'Request or provide advice related to a specific real-life circumstance.'] },
  { key: 'explanation', label: 'Explanation', description: ['Giải thích lý do đứng sau một hành động, quyết định hoặc sự cố.', 'Explain the reason behind an action, decision, or incident.'] },
  { key: 'recommendation', label: 'Recommendation', description: ['Giới thiệu một ứng viên, khóa học hoặc gợi ý một điều hữu ích.', 'Recommend someone for a job, course, or suggest something helpful.'] },
]

/** 7 dạng biểu đồ của Task 1 Academic — fallback khi DB chưa có `prompt_chart_types`. */
export const chartTypes: ChartType[] = [
  { key: 'line', labelVi: 'Biểu đồ đường', labelEn: 'Line Graph', descriptionVi: 'Theo dõi một đại lượng thay đổi theo thời gian — xu hướng tăng, giảm hay dao động.', descriptionEn: 'Track how one measure changes over time — rising, falling or fluctuating.', sortOrder: 10 },
  { key: 'bar', labelVi: 'Biểu đồ cột', labelEn: 'Bar Chart', descriptionVi: 'So sánh giá trị giữa các nhóm bằng chiều dài thanh.', descriptionEn: 'Compare values across groups using bar length.', sortOrder: 20 },
  { key: 'pie', labelVi: 'Biểu đồ tròn', labelEn: 'Pie Chart', descriptionVi: 'Thể hiện tỉ lệ phần trăm của các thành phần trong một tổng thể.', descriptionEn: 'Show percentage shares of parts within a whole.', sortOrder: 30 },
  { key: 'table', labelVi: 'Bảng số liệu', labelEn: 'Table', descriptionVi: 'Rút ra xu hướng và điểm nổi bật từ một bảng số liệu.', descriptionEn: 'Extract trends and standout points from a data table.', sortOrder: 40 },
  { key: 'map', labelVi: 'Bản đồ / sơ đồ mặt bằng', labelEn: 'Map / Floor Plan', descriptionVi: 'Mô tả sự thay đổi của một khu vực hoặc sơ đồ mặt bằng theo thời gian.', descriptionEn: 'Describe changes to an area or floor plan over time.', sortOrder: 50 },
  { key: 'process', labelVi: 'Quy trình sản xuất, tự nhiên', labelEn: 'Process Diagram', descriptionVi: 'Kể tiến trình sản xuất hoặc hiện tượng tự nhiên theo các bước.', descriptionEn: 'Describe a manufacturing or natural process step by step.', sortOrder: 60 },
  { key: 'mixed', labelVi: 'Biểu đồ kết hợp', labelEn: 'Mixed Charts', descriptionVi: 'Đọc hai biểu đồ cùng lúc và nối hai nguồn số liệu.', descriptionEn: 'Read two charts together and link the two data sets.', sortOrder: 70 },
]

/** 19 chủ đề luyện IELTS — fallback khi DB chưa có `prompt_topics`. */
export const topicLibrary: TopicType[] = [
  { key: 'education', labelVi: 'Giáo dục', labelEn: 'Education', descriptionVi: 'Chương trình, giáo viên, học phí và cách học.', descriptionEn: 'Curriculum, teachers, fees and how learning works.', subtopics: ['curriculum', 'home schooling', 'uniforms', 'discipline', 'teachers', 'tuition fees', 'vocational skills', 'distance learning', 'extracurricular', 'assessment'], sortOrder: 10 },
  { key: 'environment', labelVi: 'Môi trường', labelEn: 'Environment', descriptionVi: 'Khí hậu, rác thải, năng lượng sạch và bảo tồn.', descriptionEn: 'Climate, waste, clean energy and conservation.', subtopics: ['climate change', 'recycling', 'pollution', 'biodiversity', 'renewable energy', 'deforestation', 'waste', 'sustainability', 'emissions', 'habitats'], sortOrder: 20 },
  { key: 'technology', labelVi: 'Công nghệ', labelEn: 'Technology', descriptionVi: 'AI, quyền riêng tư, chênh lệch số và tự động hoá.', descriptionEn: 'AI, privacy, the digital divide and automation.', subtopics: ['artificial intelligence', 'privacy', 'digital divide', 'automation', 'smart cities', 'online learning', 'robotics', 'surveillance', 'innovation', 'data storage'], sortOrder: 30 },
  { key: 'work', labelVi: 'Việc làm', labelEn: 'Work & Employment', descriptionVi: 'Lương, cân bằng công việc, thất nghiệp và đào tạo.', descriptionEn: 'Pay, work-life balance, unemployment and training.', subtopics: ['remote work', 'salaries', 'equality', 'unemployment', 'work-life balance', 'training', 'automation', 'self-employment', 'productivity', 'flexible hours'], sortOrder: 40 },
  { key: 'health', labelVi: 'Sức khỏe', labelEn: 'Health', descriptionVi: 'Phòng bệnh, dinh dưỡng, tâm lý và hệ thống y tế.', descriptionEn: 'Prevention, nutrition, mental health and healthcare.', subtopics: ['prevention', 'obesity', 'mental health', 'exercise', 'vaccination', 'hospitals', 'stress', 'nutrition', 'accessibility', 'public health'], sortOrder: 50 },
  { key: 'society', labelVi: 'Xã hội', labelEn: 'Society', descriptionVi: 'Bất bình đẳng, di cư, nhà ở và dịch vụ công.', descriptionEn: 'Inequality, migration, housing and public services.', subtopics: ['inequality', 'poverty', 'migration', 'housing', 'ageing population', 'multiculturalism', 'public services', 'community', 'demographics', 'inclusion'], sortOrder: 60 },
  { key: 'media', labelVi: 'Truyền thông & quảng cáo', labelEn: 'Media & Advertising', descriptionVi: 'Kiểm duyệt, tin giả, mạng xã hội và quảng cáo nhắm đối tượng.', descriptionEn: 'Censorship, misinformation, social media and targeted ads.', subtopics: ['censorship', 'misinformation', 'social media', 'celebrity culture', 'targeting advertising', 'journalism', 'regulation', 'privacy', 'bias', 'influencers'], sortOrder: 70 },
  { key: 'transport', labelVi: 'Giao thông', labelEn: 'Transport', descriptionVi: 'Giao thông công cộng, ùn tắc, an toàn và xe điện.', descriptionEn: 'Public transport, congestion, safety and electric vehicles.', subtopics: ['public transport', 'congestion', 'cycling', 'electric vehicles', 'road safety', 'aviation', 'rail', 'infrastructure', 'commuting', 'pollution'], sortOrder: 80 },
  { key: 'family', labelVi: 'Gia đình & trẻ em', labelEn: 'Family & Children', descriptionVi: 'Nuôi dạy con, vai trò gia đình và sự độc lập.', descriptionEn: 'Parenting, family roles and growing independence.', subtopics: ['parenting', 'childcare', 'discipline', 'family size', 'role models', 'siblings', 'allowance', 'independence', 'upbringing', 'values'], sortOrder: 90 },
  { key: 'culture', labelVi: 'Văn hoá & ngôn ngữ', labelEn: 'Culture & Language', descriptionVi: 'Di sản, dịch thuật, tiếng bản địa và bảo tồn ngôn ngữ.', descriptionEn: 'Heritage, translation, dialects and language preservation.', subtopics: ['heritage', 'translation', 'bilingualism', 'dialects', 'preservation', 'immersion', 'globalisation', 'regional identity', 'language loss', 'travel'], sortOrder: 100 },
  { key: 'crime', labelVi: 'Tội phạm', labelEn: 'Crime', descriptionVi: 'Hình sự, cải tạo, cảnh sát và hình phạt.', descriptionEn: 'Punishment, rehabilitation, policing and sentencing.', subtopics: ['punishment', 'rehabilitation', 'prisons', 'policing', 'prevention', 'sentencing', 'cybercrime', 'surveillance', 'drugs', 'youth crime'], sortOrder: 110 },
  { key: 'government', labelVi: 'Nhà nước & pháp luật', labelEn: 'Government & Law', descriptionVi: 'Chi tiêu công, thuế, bầu cử và hệ thống tòa án.', descriptionEn: 'Public spending, taxation, voting and the courts.', subtopics: ['public spending', 'welfare', 'taxation', 'voting age', 'court system', 'policing funding', 'censorship laws', 'immigration policy', 'national service', 'local councils'], sortOrder: 120 },
  { key: 'money', labelVi: 'Tiền & kinh tế', labelEn: 'Money & Economy', descriptionVi: 'Tiết kiệm, tín dụng, lạm phát và bất bình đẳng.', descriptionEn: 'Saving, credit, inflation and inequality.', subtopics: ['saving', 'spending', 'inequality', 'inflation', 'credit', 'debt', 'investment', 'unemployment', 'globalisation', 'small business'], sortOrder: 130 },
  { key: 'food', labelVi: 'Ẩm thực & dinh dưỡng', labelEn: 'Food & Diet', descriptionVi: 'Thực phẩm chế biến, an toàn thực phẩm và lối sống.', descriptionEn: 'Processed food, food security and everyday diets.', subtopics: ['obesity', 'fast food', 'nutrition', 'food security', 'organic food', 'processed food', 'vegetarianism', 'cooking', 'agriculture', 'labelling'], sortOrder: 140 },
  { key: 'art', labelVi: 'Nghệ thuật & sáng tạo', labelEn: 'Art & Creativity', descriptionVi: 'Bảo tồn, tài trợ, phòng tranh và nghệ thuật công cộng.', descriptionEn: 'Conservation, funding, galleries and public art.', subtopics: ['censorship', 'funding', 'galleries', 'heritage', 'public art', 'digital art', 'restoration', 'murals', 'sculpture', 'appreciation'], sortOrder: 150 },
  { key: 'sport', labelVi: 'Thể thao & thể lực', labelEn: 'Sport & Fitness', descriptionVi: 'Chuyên nghiệp, doping, tài trợ và thể thao trường học.', descriptionEn: 'Professionalism, doping, sponsorship and school sport.', subtopics: ['professionalism', 'salaries', 'doping', 'sponsorship', 'youth sport', 'infrastructure', 'leisure', 'schools', 'teamwork', 'accessibility'], sortOrder: 160 },
  { key: 'travel', labelVi: 'Du lịch', labelEn: 'Travel & Tourism', descriptionVi: 'Du lịch quá tải, bền vững và ảnh hưởng tới cộng đồng.', descriptionEn: 'Overtourism, sustainability and host communities.', subtopics: ['overtourism', 'sustainability', 'host communities', 'heritage', 'hospitality', 'visas', 'backpacking', 'adventure travel', 'cultural exchange', 'air travel'], sortOrder: 170 },
  { key: 'business', labelVi: 'Kinh doanh', labelEn: 'Business', descriptionVi: 'Khởi nghiệp, quản lý, marketing và đạo đức kinh doanh.', descriptionEn: 'Startups, management, marketing and business ethics.', subtopics: ['entrepreneurship', 'management', 'leadership', 'marketing', 'innovation', 'outsourcing', 'strategy', 'ethics', 'branding', 'productivity'], sortOrder: 180 },
  { key: 'communication', labelVi: 'Giao tiếp', labelEn: 'Communication', descriptionVi: 'Mạng xã hội, ngôn ngữ cơ thể, email và rào cản giao tiếp.', descriptionEn: 'Social media, body language, email and barriers.', subtopics: ['social media', 'long-distance relationships', 'body language', 'barriers', 'email', 'texting', 'multicultural communication', 'non-verbal cues', 'privacy', 'diversity'], sortOrder: 190 },
]
