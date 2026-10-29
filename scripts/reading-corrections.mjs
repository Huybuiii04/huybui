import { readFileSync } from 'node:fs'

const examRepairs = JSON.parse(readFileSync(new URL('../supabase/seed/reading-corrections.json', import.meta.url), 'utf8'))
const additionalExams = JSON.parse(readFileSync(new URL('../supabase/seed/cambridge-21-reading.json', import.meta.url), 'utf8'))

// Source: https://engnovate.com/ielts-reading-tests/cambridge-ielts-09-academic-reading-test-1/
export function correctReading(dataset) {
  dataset.tests = dataset.tests.filter(test => test.slug !== 'IELTS_Animals_Biology_B1')
  const test = dataset.tests.find(test => test.slug === 'cam-9-1')
  if (!test) throw new Error('Missing Cambridge 9 Test 1')
  const tfng = section => `<p>Do the following statements agree with the information given in Reading Passage ${section}?</p><p>Write</p><p><strong>TRUE</strong> if the statement agrees with the information</p><p><strong>FALSE</strong> if the statement contradicts the information</p><p><strong>NOT GIVEN</strong> if there is no information on this</p>`
  const shortAnswer = limit => `<p>Answer the questions below.</p><p>Choose <strong>NO MORE THAN ${limit}</strong> from the passage for each answer.</p>`
  const headings = [
    'Seeking the transmission of radio signals from planets',
    'Appropriate responses to signals from other civilisations',
    "Vast distances to Earth's closest neighbours",
    'Assumptions underlying the search for extra-terrestrial intelligence',
    'Reasons for the search for extra-terrestrial intelligence',
    'Knowledge of extra-terrestrial life forms',
    'Likelihood of life on other planets',
  ]
  const specs = [
    [[1, 7, 'tfng', 'tfng', tfng(1)], [8, 13, 'fill', 'fill-blank', shortAnswer('TWO WORDS')]],
    [[14, 17, 'matching', 'matching-heading', '<p>Reading Passage 2 has five paragraphs, A–E.</p><p>Choose the correct heading for paragraphs B–E from the list of headings below.</p><p>Write the correct number, i–vii.</p>'],
      [18, 20, 'fill', 'fill-blank', shortAnswer('THREE WORDS AND/OR A NUMBER')],
      [21, 26, 'ynng', 'ynng', '<p>Do the following statements agree with the views of the writer in Reading Passage 2?</p><p>Write</p><p><strong>YES</strong> if the statement agrees with the views of the writer</p><p><strong>NO</strong> if the statement contradicts the views of the writer</p><p><strong>NOT GIVEN</strong> if it is impossible to say what the writer thinks about this</p>']],
    [[27, 30, 'fill', 'fill-blank', shortAnswer('TWO WORDS')], [31, 33, 'tfng', 'tfng', tfng(3)],
      [34, 39, 'fill', 'note-completion', '<p>Complete the flow-chart below.</p><p>Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.</p>'],
      [40, 40, 'mcq', 'multiple-choice', '<p>Choose the correct letter, A, B, C or D.</p>']],
  ]
  // Keep existing question text, answers and explanations; repair boundaries and types.
  for (const [index, passage] of test.passages.entries()) {
    const questions = new Map(passage.groups.flatMap(group => group.questions).map(q => [q.sourceNumber, q]))
    passage.groups = specs[index].map(([start, end, type, displayType, instruction], groupIndex) => ({
      key: `cam-9-1-${index + 1}-${start}-${end}`,
      order: groupIndex + 1,
      displayType,
      instructionHtml: `<h3>Questions ${start}${start === end ? '' : `–${end}`}</h3>${instruction}`,
      config: displayType === 'matching-heading' ? { headings } : {},
      questions: Array.from({ length: end - start + 1 }, (_, offset) => {
        const number = start + offset
        const question = questions.get(number)
        if (!question) throw new Error(`Missing Cambridge 9 Test 1 question ${number}`)
        return { ...question, type, displayType, order: offset + 1, questionHtml: '' }
      }),
    }))
  }
  const flow = '<h4>Method of determining where the ancestors of turtles and tortoises come from</h4><p><strong>Step 1</strong></p><p>71 species of living turtles and tortoises were examined and a total of 34_______ were taken from the bones of their forelimbs.</p><p><strong>Step 2</strong></p><p>The data was recorded on a 35_______ (necessary for comparing the information).</p><p>Outcome: Land tortoises were represented by a dense 36_______ of points towards the top.</p><p>Sea turtles were grouped together in the bottom part.</p><p><strong>Step 3</strong></p><p>The same data was collected from some living 37_______ species and added to the other results.</p><p>Outcome: The points for these species turned out to be positioned about 38_______ up the triangle between the land tortoises and the sea turtles.</p><p><strong>Step 4</strong></p><p>Bones of P. quenstedti and P. talampayensis were examined in a similar way and the results added.</p><p>Outcome: The position of the points indicated that both these ancient creatures were 39_______.</p>'
  const q34 = test.passages[2].groups[2].questions[0]
  q34.questionHtml = flow
  q34.answerKey = 'three measurements'
  q34.acceptedAnswers = ['3 measurements']
  const q40 = test.passages[2].groups[3].questions[0]
  q40.prompt = 'According to the writer, the most significant thing about tortoises is that'
  q40.options = ['they are able to adapt to life in extremely dry environments.', 'their original life form was a kind of primeval bacteria.', 'they have so much in common with sea turtles.', 'they have made the transition from sea to land more than once.']
  // Source: https://engnovate.com/ielts-reading-tests/cambridge-ielts-09-academic-reading-test-2/
  const test2 = dataset.tests.find(item => item.slug === 'cam-9-2')
  if (!test2) throw new Error('Missing Cambridge 9 Test 2')
  const sectionStarts = [
    ['Hearing impairment or other', 'A preliminary study in New Zealand', 'Children with auditory function deficit are potentially', 'While the detrimental effects', 'Autism is considered', 'The attention deficit disorders', 'Children experiencing an auditory function deficit', 'The New Zealand Government', 'A number of countries'],
    ['On 8 June 2004', 'For centuries, transits of Venus', 'Halley was aware', 'Inspired by Halley', 'While the early transit timings', 'But astronomers laboured hard', 'June 2004'],
  ]
  for (const [index, starts] of sectionStarts.entries()) {
    const passage = test2.passages[index]
    passage.contentHtml = passage.contentHtml.replace(/(<p\b[^>]*>)([\s\S]*?)(<\/p>)/gi, (match, open, body, close) => {
      const plain = body.replace(/<[^>]*>/g, '').trim()
      const found = starts.findIndex(start => plain.startsWith(start) || plain.replace(/^[A-I]\s*_?\s+/, '').startsWith(start))
      if (found < 0 || (index === 1 && found === 6 && plain.includes('first passage'))) return match
      const letter = String.fromCharCode(65 + found)
      if (body.trim().startsWith(`<strong>${letter}</strong>`)) return match
      let clean = body.trim()
      if (!plain.startsWith(starts[found])) clean = clean.replace(/^[A-I]\s*_?\s+/, '')
      return `${open}<strong>${letter}</strong> ${clean}${close}`
    })
  }
  const people = ['Edmond Halley', 'Johannes Kepler', 'Guillaume Le Gentil', 'Johann Franz Encke']
  const endingGroup = test2.passages[2].groups.find(group => group.questions.some(q => q.sourceNumber === 38))
  const endings = endingGroup.config.sentenceEndings ?? endingGroup.questions.find(q => q.sourceNumber === 38).options
  const specs2 = [
    [[1, 6, 'matching', 'matching-info', '<p>Reading Passage 1 has nine sections, A–I.</p><p>Which section contains the following information?</p>', { sectionLabels: Array.from('ABCDEFGHI') }],
      [7, 10, 'fill', 'fill-blank', shortAnswer('TWO WORDS AND/OR A NUMBER')],
      [11, 12, 'mcq', 'multiple-choice-2', '<p>Choose <strong>TWO</strong> letters, A–F.</p><p>The list below includes factors contributing to classroom noise.</p>', { answerSlots: 2 }],
      [13, 13, 'mcq', 'multiple-choice', '<p>Choose the correct letter, A, B, C or D.</p>']],
    [[14, 17, 'matching', 'matching-info', '<p>Reading Passage 2 has seven paragraphs, A–G.</p><p>Which paragraph contains the following information?</p>', { sectionLabels: Array.from('ABCDEFG') }],
      [18, 21, 'matching', 'matching-feature', '<p>Look at the following statements and the list of people below.</p><p>Match each statement with the correct person, A, B, C or D.</p>', { featureOptions: people }],
      [22, 26, 'tfng', 'tfng', tfng(2)]],
    [[27, 31, 'mcq', 'multiple-choice', '<p>Choose the correct letter, A, B, C or D.</p>'],
      [32, 37, 'ynng', 'ynng', '<p>Do the following statements agree with the claims of the writer in Reading Passage 3?</p><p><strong>YES</strong> if the statement agrees with the claims of the writer</p><p><strong>NO</strong> if the statement contradicts the claims of the writer</p><p><strong>NOT GIVEN</strong> if it is impossible to say what the writer thinks about this</p>'],
      [38, 40, 'matching', 'sentence-ending', '<p>Complete each sentence with the correct ending, A–E, below.</p>', { sentenceEndings: endings }]],
  ]
  for (const [index, passage] of test2.passages.entries()) {
    const questions = new Map(passage.groups.flatMap(group => group.questions).map(q => [q.sourceNumber, q]))
    passage.groups = specs2[index].map(([start, end, type, displayType, instruction, config = {}], groupIndex) => ({
      key: `cam-9-2-${index + 1}-${start}-${end}`, order: groupIndex + 1, displayType, config,
      instructionHtml: `<h3>Questions ${start}${start === end ? '' : `–${end}`}</h3>${instruction}`,
      questions: Array.from({ length: end - start + 1 }, (_, offset) => {
        const number = start + offset
        const question = questions.get(number)
        if (!question) throw new Error(`Missing Cambridge 9 Test 2 question ${number}`)
        return { ...question, type, displayType, order: offset + 1, questionHtml: '',
          ...(type === 'matching' ? { options: [] } : {}),
          ...(number === 1 ? { answerKey: 'H', explanation: 'Đoạn H mô tả New Zealand Disability Strategy, chính sách quốc gia nhằm cải thiện cơ hội học tập cho người khuyết tật.' } : {}),
          ...([11, 12].includes(number) ? { prompt: questions.get(11).prompt, answerKey: number === 11 ? 'A' : 'C', acceptedAnswers: [number === 11 ? 'C' : 'A'] } : {}),
        }
      }),
    }))
  }
  for (const repair of examRepairs) {
    const exam = dataset.tests.find(item => item.slug === repair.slug)
    if (!exam) throw new Error(`Missing reading test ${repair.slug}`)
    for (const passage of exam.passages) {
      const section = repair.sections.find(item => item.section === passage.sectionNo)
      if (!section) throw new Error(`Missing section ${repair.slug}/${passage.sectionNo}`)
      passage.title = section.title
      passage.contentHtml = section.contentHtml
      const questions = new Map(passage.groups.flatMap(group => group.questions).map(q => [q.sourceNumber, q]))
      passage.groups = repair.groups.filter(group => group.section === passage.sectionNo).map((group, index) => ({
        key: `${repair.slug}-${passage.sectionNo}-${group.from}-${group.to}`,
        order: index + 1, instructionHtml: group.instructionHtml, displayType: group.displayType, config: group.config,
        questions: group.questions.map((spec, offset) => {
          const question = questions.get(spec.number)
          if (!question) throw new Error(`Missing question ${repair.slug}/${spec.number}`)
          const { number, ...fields } = spec
          return { ...question, ...fields, type: group.type, displayType: group.displayType, order: offset + 1,
            questionHtml: offset === 0 ? group.questionHtml : '' }
        }),
      }))
    }
    exam.questionCount = exam.passages.flatMap(passage => passage.groups.flatMap(group => group.questions)).length
    if (exam.questionCount !== 40) throw new Error(`Expected 40 questions in ${repair.slug}`)
  }
  for (const exam of additionalExams) {
    const index = dataset.tests.findIndex(item => item.slug === exam.slug)
    if (index < 0) dataset.tests.push(structuredClone(exam))
    else dataset.tests[index] = structuredClone(exam)
  }
  dataset.stats.tests = dataset.tests.length
  dataset.stats.passages = dataset.tests.reduce((sum, item) => sum + item.passages.length, 0)
  dataset.stats.questions = dataset.tests.reduce((sum, item) => sum + item.questionCount, 0)
  return dataset
}
