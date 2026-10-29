/**
 * Sinh file `speaking-questions.json` từ dữ liệu đã trích từ các trang sample
 * public của toey.app (sitemap: /en/ielts/speaking-part-{1,2,3}/...).
 *
 *   node --env-file-if-exists=.env.local scripts/build-speaking-questions.mjs
 *
 * Chỉ lấy **câu hỏi** (Part 1 / Part 3) và **bullet của cue card** (Part 2) —
 * đây là dạng câu hỏi IELTS tiêu chuẩn, dùng chung trong mọi tài liệu luyện thi.
 * KHÔNG lấy phần "Band 9 sample answer" / phần phân tích của toey.app (bản quyền của họ).
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const part1 = [
  ['hometown-and-hobbies', 'Hometown & Hobbies', ['Where is your hometown?', 'What do you like most about your hometown?', 'What do you like to do in your free time?', 'Have you had any hobbies since you were a child?', 'Do you prefer indoor or outdoor activities?']],
  ['work-or-study', 'Work or Study', ['Do you work or are you a student?', 'What do you like most about your job?', 'Why did you choose that line of work?', 'Is there anything you would change about it?', 'What would you like to do in the future?']],
  ['daily-routine', 'Daily Routine', ['Can you describe a typical day for you?', 'Which part of the day do you enjoy most?', 'Has your routine changed compared to a few years ago?', 'Do you think it is important to have a daily routine?', 'Is there anything about your routine you would like to change?']],
  ['food-and-cooking', 'Food and Cooking', ['What kind of food do you enjoy most?', 'Who usually does the cooking in your home?', 'Do you prefer eating at home or eating out?', 'Have you ever tried cooking a dish yourself for the first time?', 'Do you watch any cooking shows?']],
  ['music', 'Music', ['What kind of music do you enjoy?', 'When do you usually listen to music?', 'Did you learn to play a musical instrument as a child?', 'Do you think it is important for children to learn music?', 'Has your taste in music changed over the years?']],
  ['sports-and-exercise', 'Sports and Exercise', ['Do you do any sports or exercise?', 'Did you play any sports when you were a child?', 'Do you prefer team sports or individual sports?', 'Do you think people today do enough exercise?', 'Would you like to try a new sport in the future?']],
  ['weather-and-seasons', 'Weather and Seasons', ['What is the weather usually like where you live?', 'Which season do you like best?', 'Does the weather affect your mood or daily life?', 'Do you prefer hot weather or cold weather?', 'Has the weather in your country changed over the years?']],
  ['reading-and-books', 'Reading and Books', ['Do you enjoy reading?', 'What kind of books do you like to read?', 'Did you read a lot as a child?', 'Do you prefer paper books or e-books?', 'Would you like to write a book one day?']],
  ['the-internet-and-social-media', 'The Internet and Social Media', ['How often do you use the internet?', 'What do you mainly use the internet for?', 'Do you use social media a lot?', 'Do you think you spend too much time online?', 'How has the internet changed your daily life?']],
  ['films-and-tv', 'Films and TV', ['Do you enjoy watching films?', 'What kind of films do you like?', 'Do you prefer watching films at the cinema or at home?', 'Do you watch much television?', 'Have your tastes in films changed over time?']],
  ['transport-and-getting-around', 'Transport and Getting Around', ['How do you usually travel around?', 'Do you prefer public transport or driving yourself?', 'Is the public transport good where you live?', 'Has the way people travel changed in recent years?', 'How could transport be improved in your city?']],
  ['festivals-and-celebrations', 'Festivals and Celebrations', ['What is the most important festival in your country?', 'How do people usually celebrate it?', 'Do you enjoy celebrating festivals?', 'Have festivals changed since you were a child?', 'Are there any festivals from other countries you would like to experience?']],
  ['animals-and-pets', 'Animals and Pets', ['Do you have any pets?', 'Did you have any pets when you were a child?', 'Do you think keeping pets is good for people?', 'What is your favourite animal?', "Are people's attitudes to animals changing?"]],
  ['clothes-and-fashion', 'Clothes and Fashion', ['What kind of clothes do you usually wear?', 'Are you interested in fashion?', 'Do you prefer comfortable clothes or fashionable clothes?', 'Have your clothing tastes changed over the years?', 'Do people in your country care about fashion?']],
  ['accommodation-and-home', 'Accommodation and Home', ['Do you live in a house or an apartment?', 'What is your favourite room in your home?', 'Would you like to change anything about your home?', 'Do you prefer living in the city or the countryside?', 'What kind of home would you like to have in the future?']],
  ['shopping-and-markets', 'Shopping and Markets', ['Do you enjoy shopping?', 'Do you prefer shopping online or in physical stores?', 'Do you like going to markets?', 'Has the way people shop changed in recent years?', 'Do you think people buy too many unnecessary things?']],
  ['colours', 'Colours', ['What is your favourite colour?', 'Are there any colours you dislike?', 'Do you like to wear colourful clothes?', 'What colours are common in your home?', "Do you think colours affect people's moods?"]],
  ['celebrities', 'Celebrities', ['Is there a celebrity you admire?', 'Do you follow news about celebrities?', 'Would you like to be famous?', 'How do people usually become famous in your country?', 'Do you think celebrities have a responsibility to be good role models?']],
  ['sleep', 'Sleep', ['How many hours do you usually sleep?', 'Do you like to take naps during the day?', 'Do you usually sleep well?', 'Has your sleep changed compared to when you were younger?', 'What advice would you give for sleeping well?']],
  ['photography', 'Photography', ['Do you like taking photographs?', 'Do you prefer taking photos with a camera or a phone?', 'What kind of photos do you like to take?', 'Do you keep your old photographs?', 'Do you like having your photo taken?']],
  ['time-management', 'Time Management', ['Are you good at managing your time?', 'Are you usually punctual?', 'How do you usually plan your day?', 'Do you think you sometimes waste time?', 'Is it important to be on time in your culture?']],
  ['free-time-and-relaxation', 'Free Time and Relaxation', ['What do you usually do in your free time?', 'How do you usually relax after a busy day?', 'Do you have enough free time these days?', 'Did you have more free time when you were younger?', 'Is it important to have hobbies?']],
  ['the-news-and-newspapers', 'The News and Newspapers', ['How do you usually get your news?', 'How often do you follow the news?', 'What kinds of news are you most interested in?', 'Do you prefer to read the news or watch it on TV?', 'Do you think it is important to keep up with the news?']],
  ['birthdays', 'Birthdays', ['How do you usually celebrate your birthday?', 'Do you enjoy celebrating your birthday?', 'What did you do on your last birthday?', 'Do people in your country give presents on birthdays?', 'Are birthdays important in your culture?']],
  ['flowers-and-plants', 'Flowers and Plants', ['Do you like flowers?', 'Do you have any plants at home?', 'Do people in your country often give flowers as gifts?', 'Would you like to learn more about growing plants?', 'Do you prefer wild flowers or garden flowers?']],
]

const part2 = [
  ['describe-a-person-you-admire', 'Describe a Person You Admire', ['who this person is', 'how you know this person', 'what this person is like', 'and explain why you admire this person']],
  ['describe-a-memorable-trip', 'Describe a Memorable Trip', ['where you went', 'who you went with', 'what you did there', 'and explain why this trip was memorable']],
  ['describe-a-place-you-want-to-visit', 'Describe a Place You Want to Visit', ['where this place is', 'how you found out about it', 'what you would do there', 'and explain why you want to visit it']],
  ['describe-a-book-you-enjoyed', 'Describe a Book You Enjoyed', ['what the book is', 'what it is about', 'when and why you read it', 'and explain why you enjoyed it']],
  ['describe-a-useful-skill-you-learned', 'Describe a Useful Skill You Learned', ['what the skill is', 'how and when you learned it', 'who taught you or how you picked it up', 'and explain why it has been useful']],
  ['describe-a-favourite-piece-of-technology', 'Describe a Favourite Piece of Technology', ['what the piece of technology is', 'how you use it', 'how long you have had it', 'and explain why it is so useful to you']],
  ['describe-a-special-day-you-remember', 'Describe a Special Day You Remember', ['what day it was', 'where you were and who you were with', 'what happened', 'and explain why it was so special to you']],
  ['describe-a-hobby-you-enjoy', 'Describe a Hobby You Enjoy', ['what the hobby is', 'how and when you got into it', 'how often you do it', 'and explain why you enjoy it']],
  ['describe-an-important-decision-you-made', 'Describe an Important Decision You Made', ['what the decision was', 'when and why you had to make it', 'how you decided', 'and explain why it was so important']],
  ['describe-your-best-friend', 'Describe Your Best Friend', ['who your best friend is', 'how and when you met', 'what this person is like', 'and explain why you get on so well']],
  ['describe-a-city-you-have-visited', 'Describe a City You Have Visited', ['which city you visited', 'when you went and who with', 'what you did there', 'and explain what impression it left on you']],
  ['describe-your-dream-home', 'Describe Your Dream Home', ['where this home would be', 'what it would look like', 'who you would live there with', 'and explain why it appeals to you']],
  ['describe-a-film-you-watched-recently', 'Describe a Film You Watched Recently', ['what the film was', 'when and where you watched it', 'what it was about', 'and explain what you thought of it']],
  ['describe-a-teacher-who-influenced-you', 'Describe a Teacher Who Influenced You', ['who this teacher was', 'what subject they taught', 'what they were like', 'and explain how they influenced you']],
  ['describe-a-goal-you-want-to-achieve', 'Describe a Goal You Want to Achieve', ['what the goal is', 'when you set it', 'what you are doing to achieve it', 'and explain why it is important to you']],
  ['describe-an-object-you-value', 'Describe an Object You Value', ['what the object is', 'how you got it', 'how long you have had it', 'and explain why it is so important to you']],
  ['describe-a-time-you-helped-someone', 'Describe a Time You Helped Someone', ['who you helped', 'what the situation was', 'what you did to help', 'and explain how you felt about it']],
  ['describe-a-website-or-app-you-use', 'Describe a Website or App You Use', ['what the website or app is', 'how you found out about it', 'what you use it for', 'and explain why it is so useful to you']],
  ['describe-a-piece-of-good-news-you-received', 'Describe a Piece of Good News You Received', ['what the good news was', 'how you received it', 'who you shared it with', 'and explain how you felt about it']],
  ['describe-a-restaurant-you-like', 'Describe a Restaurant You Like', ['what kind of restaurant it is', 'where it is', 'what you usually eat there', 'and explain why you like it so much']],
  ['describe-a-gift-you-received', 'Describe a Gift You Received', ['what the gift was', 'who gave it to you', 'when you received it', 'and explain why it was so special']],
  ['describe-a-photo-you-like', 'Describe a Photo You Like', ['what the photo shows', 'who took it', 'when it was taken', 'and explain why you like it so much']],
  ['describe-an-invention', 'Describe an Invention', ['what the invention is', 'what it does', 'how it has changed daily life', 'and explain why you think it is so important']],
  ['describe-a-song-you-like', 'Describe a Song You Like', ['what the song is', 'what it is about', 'when you usually listen to it', 'and explain why you like it so much']],
  ['describe-a-happy-childhood-memory', 'Describe a Happy Childhood Memory', ['what the memory is', 'when it happened', 'who you were with', 'and explain why it is such a happy memory']],
  ['describe-your-favourite-food', 'Describe Your Favourite Food', ['what the dish is', 'how it is made', 'when you usually eat it', 'and explain why you love it so much']],
  ['describe-a-work-of-art', 'Describe a Work of Art', ['what the work of art is', 'where you saw it', 'what it looks like', 'and explain why you like it so much']],
  ['describe-an-old-person-you-admire', 'Describe an Old Person You Admire', ['who the person is', 'how you know them', 'what they are like', 'and explain why you admire them so much']],
  ['describe-a-piece-of-advice', 'Describe a Piece of Advice', ['what the advice was', 'who gave it to you', 'when you received it', 'and explain why it was so useful']],
  ['describe-a-tourist-attraction', 'Describe a Tourist Attraction', ['what the attraction is', 'where it is located', 'what visitors can do there', 'and explain why it is worth visiting']],
  ['describe-a-tv-programme-you-like', 'Describe a TV Programme You Like', ['what the programme is', 'what it is about', 'when and how often you watch it', 'and explain why you like it so much']],
  ['describe-a-plan-you-have-for-the-future', 'Describe a Plan You Have for the Future', ['what the plan is', 'when you hope to achieve it', 'how you intend to make it happen', 'and explain why it is important to you']],
  ['describe-a-journey-you-remember', 'Describe a Journey You Remember', ['where you went', 'who you travelled with', 'how you got there', 'and explain why the journey was so memorable']],
  ['describe-a-quiet-place-you-like', 'Describe a Quiet Place You Like', ['where the place is', 'how often you go there', 'what you do there', 'and explain why you like this quiet place']],
]

const part3 = [
  ['technology-and-communication', 'Technology and Communication', ['How has technology changed the way people communicate?', 'Do you think face-to-face communication will become less common?', 'What are the downsides of relying on technology to communicate?', 'Should there be limits on how much children use social media?']],
  ['education-and-learning', 'Education and Learning', ['What are the advantages of online learning compared to traditional classrooms?', 'Are there any drawbacks to studying online?', 'How do you think education will change in the next 20 years?', "Do you think exams are the best way to measure a student's ability?"]],
  ['work-and-careers', 'Work and Careers', ['Why do some jobs pay much more than others?', 'Do you think salary is the most important factor when choosing a job?', 'How is the world of work likely to change in the future?', 'Should governments do more to reduce unemployment?']],
  ['shopping-and-consumerism', 'Shopping and Consumerism', ['How does advertising influence what people buy?', 'Do you think people today buy more than they actually need?', 'What are the advantages of shopping online rather than in physical stores?', 'Should there be limits on advertising aimed at children?']],
  ['travel-and-tourism', 'Travel and Tourism', ['What can people learn from travelling to other countries?', "How does tourism benefit a country's economy?", 'Are there any downsides to mass tourism?', 'Do you think people will travel more or less in the future?']],
  ['the-environment', 'The Environment', ['What are the most serious environmental problems facing the world today?', 'Whose responsibility is it to protect the environment — individuals or governments?', 'Do you think people are willing to change their habits to help the environment?', 'How can technology help solve environmental problems?']],
  ['health-and-lifestyle', 'Health and Lifestyle', ['Why do you think many people today have unhealthy lifestyles?', 'Whose responsibility is it to keep people healthy — individuals or the government?', 'Do you think mental health is taken as seriously as physical health?', 'How can people be encouraged to live healthier lives?']],
  ['family-and-society', 'Family and Society', ['How have families changed compared to the past?', 'Do you think the family is still the most important influence on children?', 'Who should be responsible for caring for elderly relatives?', 'What are the advantages of children growing up with grandparents nearby?']],
  ['art-and-creativity', 'Art and Creativity', ['Why do you think art is important in society?', 'Should governments fund the arts, or should they focus on other things?', 'Do you think creativity can be taught, or is it a natural talent?', 'How has technology changed the way art is made and shared?']],
  ['cities-and-urban-life', 'Cities and Urban Life', ['Why do so many people move to cities?', 'What are the main problems of living in a big city?', 'Do you think cities or the countryside offer a better quality of life?', 'How can cities be made better places to live?']],
  ['crime-and-the-law', 'Crime and the Law', ['What do you think are the main causes of crime?', 'Do you think prison is an effective way of dealing with criminals?', 'Should the punishment always fit the crime?', 'How can technology help to reduce crime?']],
  ['money-and-finance', 'Money and Finance', ['Do you think money can buy happiness?', 'Do you think children should be taught how to manage money?', 'Why do you think some people spend more than they can afford?', 'Is it better to save money or to spend it and enjoy life?']],
  ['success-and-ambition', 'Success and Ambition', ['How do you think most people define success?', 'Is ambition a positive or a negative quality?', 'Do you think success is more about talent or hard work?', 'Do you think people are under more pressure to succeed nowadays?']],
  ['science-and-society', 'Science and Society', ["How has science improved people's lives?", 'Are there any dangers associated with scientific progress?', 'Should governments fund all scientific research, or only useful projects?', 'Do you think people trust scientists as much as they used to?']],
  ['the-media-and-news', 'The Media and News', ['How do most people get their news these days?', 'Do you think the news we see is always reliable?', 'Is it important for people to keep up with the news?', 'What responsibilities do the media have to society?']],
  ['advertising-and-marketing', 'Advertising and Marketing', ['Why is advertising so common nowadays?', 'Do you think advertising influences what people buy?', 'Should there be more control over advertising?', 'What makes an advertisement effective?']],
  ['globalisation-and-culture', 'Globalisation and Culture', ['How has globalisation affected your country?', 'Do you think globalisation is making cultures more similar?', 'What are the benefits of learning about other cultures?', 'Is it important to protect traditional cultures?']],
  ['history-and-the-past', 'History and the Past', ['Why is it important to learn about history?', 'Do you think young people are interested in history?', 'How can people learn about the past?', 'Should governments spend money preserving historical buildings?']],
  ['happiness-and-well-being', 'Happiness and Well-being', ['What makes people happy?', 'Do you think people today are happier than in the past?', 'Can money make people happy?', 'How can governments improve people’s well-being?']],
  ['leadership-and-role-models', 'Leadership and Role Models', ['What qualities make a good leader?', 'Are leaders born or made?', 'Why are role models important for young people?', 'Do you think celebrities make good role models?']],
]

/**
 * Part 3 trong kỳ thi thật nối chủ đề với Part 2. Map cue card → topic Part 3 liên quan,
 * để mode "Full mock" chọn đúng cặp. Cuộc Part 3 không có mapping thì fallback random.
 */
const RELATED_PART3 = {
  'describe-a-favourite-piece-of-technology': 'technology-and-communication',
  'describe-a-website-or-app-you-use': 'technology-and-communication',
  'describe-a-film-you-watched-recently': 'the-media-and-news',
  'describe-a-tv-programme-you-like': 'the-media-and-news',
  'describe-a-book-you-enjoyed': 'education-and-learning',
  'describe-a-teacher-who-influenced-you': 'education-and-learning',
  'describe-a-useful-skill-you-learned': 'work-and-careers',
  'describe-a-memorable-trip': 'travel-and-tourism',
  'describe-a-journey-you-remember': 'travel-and-tourism',
  'describe-a-place-you-want-to-visit': 'travel-and-tourism',
  'describe-a-tourist-attraction': 'travel-and-tourism',
  'describe-a-city-you-have-visited': 'cities-and-urban-life',
  'describe-your-favourite-food': 'health-and-lifestyle',
  'describe-a-restaurant-you-like': 'health-and-lifestyle',
  'describe-a-hobby-you-enjoy': 'happiness-and-well-being',
  'describe-a-piece-of-advice': 'happiness-and-well-being',
  'describe-an-invention': 'science-and-society',
  'describe-a-work-of-art': 'art-and-creativity',
  'describe-a-song-you-like': 'art-and-creativity',
  'describe-a-person-you-admire': 'leadership-and-role-models',
  'describe-an-old-person-you-admire': 'leadership-and-role-models',
  'describe-your-best-friend': 'family-and-society',
  'describe-a-time-you-helped-someone': 'family-and-society',
  'describe-a-goal-you-want-to-achieve': 'success-and-ambition',
  'describe-an-important-decision-you-made': 'success-and-ambition',
  'describe-your-dream-home': 'cities-and-urban-life',
}

const rows = []
for (const [slug, topic, questions] of part1) {
  rows.push({ part: 'part-1', slug, topic, prompt_text: questions[0], questions, cue_card: null, related_part3_slug: null })
}
for (const [slug, topic, bullets] of part2) {
  rows.push({
    part: 'part-2',
    slug,
    topic,
    prompt_text: `Describe ${/^[aeiou]/i.test(topic.replace(/^Describe a[n]? /, '')) ? 'an' : 'a'} ${topic.replace(/^Describe (a|an) /, '').toLowerCase()}`,
    questions: [],
    cue_card: { topic, bullets, time_limit_seconds: 120 },
    related_part3_slug: RELATED_PART3[slug] ?? null,
  })
}
for (const [slug, topic, questions] of part3) {
  rows.push({ part: 'part-3', slug, topic, prompt_text: questions[0], questions, cue_card: null, related_part3_slug: null })
}

const part3Slugs = new Set(part3.map(([slug]) => slug))
for (const [slug, related] of Object.entries(RELATED_PART3)) {
  if (!part3Slugs.has(related)) throw new Error(`related_part3_slug "${related}" của "${slug}" không tồn tại`)
  if (!part2.some(([part2Slug]) => part2Slug === slug)) throw new Error(`"${slug}" không có trong part2`)
}

const seen = new Set()
for (const row of rows) {
  const key = `${row.part}:${row.slug}`
  if (seen.has(key)) throw new Error(`duplicate ${key}`)
  seen.add(key)
}

const out = { generatedAt: '2026-10-29', source: 'IELTS standard speaking topic questions', rows }
const path = resolve(process.cwd(), 'supabase/seed/speaking-questions.json')
writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`)
console.log(`Wrote ${rows.length} rows to ${path}`)
console.log(`part-1=${rows.filter(r => r.part === 'part-1').length} part-2=${rows.filter(r => r.part === 'part-2').length} part-3=${rows.filter(r => r.part === 'part-3').length}`)
