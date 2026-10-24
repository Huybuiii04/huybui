/**
 * Siêu dữ liệu chủ đề cho kho đề bài.
 * Nạp vào public.prompt_topics (migration 007) — key khớp với prompts.topics.
 * `task` null nghĩa là chủ đề dùng cho cả ba loại bài.
 */

export type SeedTopic = {
  key: string
  labelVi: string
  labelEn: string
  subtopics: string[]
  task?: 'task2' | 'academic_task1' | 'general_task1'
  sortOrder: number
}

export const seedTopics: SeedTopic[] = [
  { key: 'education', labelVi: 'Giáo dục', labelEn: 'Education', subtopics: ['curriculum', 'home schooling', 'uniforms', 'discipline', 'teachers', 'tuition fees', 'vocational skills', 'distance learning', 'extracurricular', 'assessment'], sortOrder: 10 },
  { key: 'environment', labelVi: 'Môi trường', labelEn: 'Environment', subtopics: ['climate change', 'recycling', 'pollution', 'biodiversity', 'renewable energy', 'deforestation', 'waste', 'sustainability', 'emissions', 'habitats'], sortOrder: 20 },
  { key: 'technology', labelVi: 'Công nghệ', labelEn: 'Technology', subtopics: ['artificial intelligence', 'privacy', 'digital divide', 'automation', 'smart cities', 'online learning', 'robotics', 'surveillance', 'innovation', 'data storage'], sortOrder: 30 },
  { key: 'work', labelVi: 'Việc làm', labelEn: 'Work & Employment', subtopics: ['remote work', 'salaries', 'equality', 'unemployment', 'work-life balance', 'training', 'automation', 'self-employment', 'productivity', 'flexible hours'], sortOrder: 40 },
  { key: 'health', labelVi: 'Sức khỏe', labelEn: 'Health', subtopics: ['prevention', 'obesity', 'mental health', 'exercise', 'vaccination', 'hospitals', 'stress', 'nutrition', 'accessibility', 'public health'], sortOrder: 50 },
  { key: 'society', labelVi: 'Xã hội', labelEn: 'Society', subtopics: ['inequality', 'poverty', 'migration', 'housing', 'ageing population', 'multiculturalism', 'public services', 'community', 'demographics', 'inclusion'], sortOrder: 60 },
  { key: 'media', labelVi: 'Truyền thông & quảng cáo', labelEn: 'Media & Advertising', subtopics: ['censorship', 'misinformation', 'social media', 'celebrity culture', 'targeting advertising', 'journalism', 'regulation', 'privacy', 'bias', 'influencers'], sortOrder: 70 },
  { key: 'transport', labelVi: 'Giao thông', labelEn: 'Transport', subtopics: ['public transport', 'congestion', 'cycling', 'electric vehicles', 'road safety', 'aviation', 'rail', 'infrastructure', 'commuting', 'pollution'], sortOrder: 80 },
  { key: 'family', labelVi: 'Gia đình & trẻ em', labelEn: 'Family & Children', subtopics: ['parenting', 'childcare', 'discipline', 'family size', 'role models', 'siblings', 'allowance', 'independence', 'upbringing', 'values'], sortOrder: 90 },
  { key: 'culture', labelVi: 'Văn hoá & ngôn ngữ', labelEn: 'Culture & Language', subtopics: ['heritage', 'translation', 'bilingualism', 'dialects', 'preservation', 'immersion', 'globalisation', 'regional identity', 'language loss', 'travel'], sortOrder: 100 },
  { key: 'crime', labelVi: 'Tội phạm', labelEn: 'Crime', subtopics: ['punishment', 'rehabilitation', 'prisons', 'policing', 'prevention', 'sentencing', 'cybercrime', 'surveillance', 'drugs', 'youth crime'], sortOrder: 110 },
  { key: 'government', labelVi: 'Nhà nước & pháp luật', labelEn: 'Government & Law', subtopics: ['public spending', 'welfare', 'taxation', 'voting age', 'court system', 'policing funding', 'censorship laws', 'immigration policy', 'national service', 'local councils'], sortOrder: 120 },
  { key: 'money', labelVi: 'Tiền & kinh tế', labelEn: 'Money & Economy', subtopics: ['saving', 'spending', 'inequality', 'inflation', 'credit', 'debt', 'investment', 'unemployment', 'globalisation', 'small business'], sortOrder: 130 },
  { key: 'food', labelVi: 'Ẩm thực & dinh dưỡng', labelEn: 'Food & Diet', subtopics: ['obesity', 'fast food', 'nutrition', 'food security', 'organic food', 'processed food', 'vegetarianism', 'cooking', 'agriculture', 'labelling'], sortOrder: 140 },
  { key: 'art', labelVi: 'Nghệ thuật & sáng tạo', labelEn: 'Art & Creativity', subtopics: ['censorship', 'funding', 'galleries', 'heritage', 'public art', 'digital art', 'restoration', 'murals', 'sculpture', 'appreciation'], sortOrder: 150 },
  { key: 'sport', labelVi: 'Thể thao & thể lực', labelEn: 'Sport & Fitness', subtopics: ['professionalism', 'salaries', 'doping', 'sponsorship', 'youth sport', 'infrastructure', 'leisure', 'schools', 'teamwork', 'accessibility'], sortOrder: 160 },
  { key: 'travel', labelVi: 'Du lịch', labelEn: 'Travel & Tourism', subtopics: ['overtourism', 'sustainability', 'host communities', 'heritage', 'hospitality', 'visas', 'backpacking', 'adventure travel', 'cultural exchange', 'air travel'], sortOrder: 170 },
  { key: 'business', labelVi: 'Kinh doanh', labelEn: 'Business', subtopics: ['entrepreneurship', 'management', 'leadership', 'marketing', 'innovation', 'outsourcing', 'strategy', 'ethics', 'branding', 'productivity'], sortOrder: 180 },
  { key: 'communication', labelVi: 'Giao tiếp', labelEn: 'Communication', subtopics: ['social media', 'long-distance relationships', 'body language', 'barriers', 'email', 'texting', 'multicultural communication', 'non-verbal cues', 'privacy', 'diversity'], sortOrder: 190 },
]
