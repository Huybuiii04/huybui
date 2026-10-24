import type { ErrorLogEntry, EssayFeatures } from '../lib/aiLogic.ts'

/** Dữ liệu minh họa cho trang demo — không phải kết quả chấm thật. */
export const sampleFeatures: EssayFeatures = {
  structure: [
    { index: 0, role: 'Introduction', summary: 'Rewrites the question and states a clear position.', linkToNext: 'Introduces the first body paragraph with a topic sentence.' },
    { index: 1, role: 'Body paragraph 1', summary: 'Explains the first main idea with one example.', linkToNext: 'Links back to the thesis with "this matters because".' },
    { index: 2, role: 'Body paragraph 2', summary: 'Counter-argument is raised but never developed.', linkToNext: 'Ends with a short conclusion.' },
    { index: 3, role: 'Conclusion', summary: 'Restates the position in one sentence.', linkToNext: '' },
  ],
  lexical: [
    { term: 'a big problem', meaning: 'Unclear and informal.', evidence: 'This is a big problem for society.', correction: 'a pressing threat to social cohesion' },
    { term: 'very good', meaning: 'Vague and repetitive.', evidence: 'The policy is very good for families.', correction: 'measurably improves household incomes' },
  ],
  grammar: [
    { error: 'I think the most important thing that peoples should do.', correction: 'The most important step, in my view, is the one governments must take.' },
  ],
  unnatural: [
    { quote: 'In conclusion, everything has both good and bad, like coins.', issue: 'The metaphor is unclear and does not support the argument.', suggestion: 'State plainly which trade-off matters most and why.', severity: 'major' },
    { quote: 'Firstly I want to talk about the first reason.', issue: 'The signposting is repetitive and adds no information.', suggestion: 'Name the reason directly: "Government funding is the first lever".', severity: 'minor' },
  ],
  vocabularyPlan: {
    topic: 'Urban green space',
    words: [
      { word: 'mitigate', meaning: 'To make something less severe.', example: 'Trees mitigate the urban heat island effect.', why: 'Replaces a weak verb like "reduce" with a precise academic one.' },
      { word: 'green space', meaning: 'Parks and other vegetated areas in a city.', example: 'Access to green space improves residents health.', why: 'The topic term the examiner expects.' },
      { word: 'trade-off', meaning: 'A balance between two things that cannot both be maximised.', example: 'There is a trade-off between housing supply and green space.', why: 'Names the central tension of the essay.' },
    ],
  },
  bandPlan: {
    currentBand: 6,
    targetBand: 7.5,
    steps: [
      { title: 'Develop the counter-argument', detail: 'Give the opposing view a full sentence of explanation plus one concrete example.', criterion: 'task_response', expectedGain: '+0.5 on Task Response' },
      { title: 'Replace vague vocabulary', detail: 'Two words repeat the same vague idea. Use the precise alternatives listed above.', criterion: 'lexical_resource', expectedGain: '+0.5 on Lexical Resource' },
      { title: 'Fix article and plural', detail: 'One article error and one subject-verb agreement error remain.', criterion: 'grammatical_range', expectedGain: '+0.5 on Grammar' },
    ],
  },
}

export const sampleErrors: ErrorLogEntry[] = [
  { id: 'sample-1', criterion: 'grammatical_range', category: 'article', quote: 'peoples should do', correction: 'people should take', explanation: 'Use the plural "people" and a modal verb instead of "do".', skillTags: ['articles', 'modals'] },
  { id: 'sample-2', criterion: 'coherence_ability', category: 'linkers', quote: 'Firstly I want to talk about the first reason.', correction: 'Government funding is the first lever.', explanation: 'Name the point instead of announcing its position.', skillTags: ['cohesion'] },
]
