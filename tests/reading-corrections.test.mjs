import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { correctReading } from '../scripts/reading-corrections.mjs'
import { matchingOptionsFor, splitHtmlByBlanks } from '../src/lib/skillLogic.ts'
import { expandAnswerKey, gradeQuestions, matchesAnswerKey } from '../supabase/functions/_shared/skillGrading.ts'

test('Cambridge 21 has 160 usable questions with source choices and passages', () => {
  const dataset = JSON.parse(readFileSync(new URL('../supabase/seed/skill-reading-data.json', import.meta.url), 'utf8'))
  const exams = dataset.tests.filter(item => /^cam-21-[1-4]$/.test(item.slug))
  assert.equal(exams.length, 4)
  let groupCount = 0
  for (const exam of exams) {
    const groups = exam.passages.flatMap(p => p.groups)
    groupCount += groups.length
    assert.equal(exam.questionCount, 40, exam.slug)
    assert.deepEqual(groups.flatMap(g => g.questions.map(q => q.sourceNumber)), Array.from({ length: 40 }, (_, i) => i + 1), exam.slug)
    for (const passage of exam.passages) {
      assert.ok(passage.contentHtml.length > 3500, `${exam.slug}: complete passage ${passage.sectionNo}`)
      assert.doesNotMatch(passage.contentHtml, /\[Input\]|Drop heading|Practice this section/)
      const labels = [...passage.contentHtml.matchAll(/<strong>([A-J])<\/strong>/g)].map(m => m[1])
      if (labels.length) assert.deepEqual(labels, Array.from({ length: labels.length }, (_, i) => String.fromCharCode(65 + i)), exam.slug)
    }
    for (const group of groups) {
      assert.match(group.instructionHtml, new RegExp(`Questions ${group.questions[0].sourceNumber}`))
      const choices = matchingOptionsFor(group)
      if (group.displayType.startsWith('matching') || group.displayType === 'sentence-ending' || group.config.phraseOptions) {
        assert.ok(choices.length > 1, `${exam.slug}/${group.questions[0].sourceNumber}: choices`)
        for (const q of group.questions) assert.ok(choices.some(option => option.key.toLowerCase() === q.answerKey.toLowerCase()), `${exam.slug}/${q.sourceNumber}: answer in choices`)
      }
      const html = group.questions[0].questionHtml
      if (html) assert.deepEqual(splitHtmlByBlanks(html).filter(s => s.kind === 'blank').map(s => s.sourceNumber), group.questions.map(q => q.sourceNumber), `${exam.slug}: complete blanks`)
      if (group.displayType === 'table-completion') {
        const cells = [...html.matchAll(/<td>([\s\S]*?)<\/td>/g)].map(m => m[1]).join(' ')
        assert.deepEqual(splitHtmlByBlanks(cells).filter(s => s.kind === 'blank').map(s => s.sourceNumber), group.questions.map(q => q.sourceNumber), `${exam.slug}: blanks stay inside table cells`)
      }
      if (group.instructionHtml.includes('Label the diagram')) assert.match(html, /<img\b/)
      for (const q of group.questions) {
        assert.ok(q.prompt.trim() && q.answerKey.trim(), `${exam.slug}/${q.sourceNumber}: text and key`)
        assert.equal(q.displayType, group.displayType)
        if (q.type === 'mcq') assert.ok(q.options.length >= 4 && q.options.every(Boolean), `${exam.slug}/${q.sourceNumber}: options`)
        if (q.type === 'tfng') assert.ok(['TRUE', 'FALSE', 'NOT GIVEN'].includes(q.answerKey))
        if (q.type === 'ynng') assert.ok(['YES', 'NO', 'NOT GIVEN'].includes(q.answerKey))
        assert.ok(expandAnswerKey(q.answerKey).some(value => matchesAnswerKey(value, q.answerKey)), `${exam.slug}/${q.sourceNumber}: gradeable key`)
      }
      if (group.config.answerSlots) {
        const questions = group.questions.map((q, i) => ({ ...q, order: i + 1, answerGroup: 'shared' }))
        const answers = Object.fromEntries(questions.map((q, i) => [String(i + 1), questions.at(-i - 1).answerKey]))
        assert.equal(gradeQuestions(questions, answers).filter(q => q.isCorrect).length, questions.length, `${exam.slug}: any answer order`)
        for (const q of questions) answers[String(q.order)] = questions[0].answerKey
        assert.equal(gradeQuestions(questions, answers).filter(q => q.isCorrect).length, 1, `${exam.slug}: no duplicate credit`)
        answers['1'] = 'Z'
        assert.equal(gradeQuestions(questions, answers).filter(q => q.isCorrect).length, 1, `${exam.slug}: partial credit`)
      }
    }
  }
  assert.equal(groupCount, 33)
  const exam = slug => exams.find(t => t.slug === slug)
  const groups = slug => exam(slug).passages.flatMap(p => p.groups)
  assert.deepEqual(exams.map(t => t.sortOrder), [49, 50, 51, 52])
  assert.equal(groups('cam-21-4')[0].displayType, 'tfng')
  const table = groups('cam-21-2')[0].questions[0].questionHtml
  assert.deepEqual([...table.matchAll(/<tr>(.*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<td>/g)].length), [3, 3, 3, 3, 3])
  const two = groups('cam-21-2').find(g => g.config.answerSlots)
  assert.deepEqual(two.questions.map(q => q.answerKey), ['B', 'D'])
  for (const t of exams) for (const p of t.passages) for (const g of p.groups) for (const q of g.questions) {
    assert.ok(q.explanation.length > 30, `${t.slug}/${q.sourceNumber}: source explanation`)
    assert.doesNotMatch(q.prompt, /^Question \d+$/)
  }
  const q9 = groups('cam-21-4').flatMap(g => g.questions).find(q => q.sourceNumber === 9)
  assert.ok(q9.acceptedAnswers.includes('fermentation process'))
  const missing = structuredClone(dataset)
  missing.tests = missing.tests.filter(t => !/^cam-21-[1-4]$/.test(t.slug))
  assert.deepEqual(correctReading(missing), dataset, 'reimport restores all four tests')
  assert.deepEqual(correctReading(structuredClone(dataset)), dataset)
})

test('Cambridge 16 Test 1 through 20 Test 4 have 800 usable questions with source choices and passages', () => {
  const dataset = JSON.parse(readFileSync(new URL('../supabase/seed/skill-reading-data.json', import.meta.url), 'utf8'))
  const exams = dataset.tests.filter(item => /^cam-(1[6-9]|20)-[1-4]$/.test(item.slug))
  assert.equal(exams.length, 20)
  let groupCount = 0
  for (const exam of exams) {
    const groups = exam.passages.flatMap(p => p.groups)
    groupCount += groups.length
    assert.equal(exam.questionCount, 40, exam.slug)
    assert.deepEqual(groups.flatMap(g => g.questions.map(q => q.sourceNumber)), Array.from({ length: 40 }, (_, i) => i + 1), exam.slug)
    for (const passage of exam.passages) {
      assert.ok(passage.contentHtml.length > 3500, `${exam.slug}: complete passage ${passage.sectionNo}`)
      assert.doesNotMatch(passage.contentHtml, /\[Input\]|Drop heading|Practice this section/)
      const labels = [...passage.contentHtml.matchAll(/<strong>([A-J])<\/strong>/g)].map(m => m[1])
      if (labels.length) assert.deepEqual(labels, Array.from({ length: labels.length }, (_, i) => String.fromCharCode(65 + i)), exam.slug)
    }
    for (const group of groups) {
      assert.match(group.instructionHtml, new RegExp(`Questions ${group.questions[0].sourceNumber}`))
      const choices = matchingOptionsFor(group)
      if (group.displayType.startsWith('matching') || group.displayType === 'sentence-ending' || group.config.phraseOptions) {
        assert.ok(choices.length > 1, `${exam.slug}/${group.questions[0].sourceNumber}: choices`)
        for (const q of group.questions) assert.ok(choices.some(option => option.key.toLowerCase() === q.answerKey.toLowerCase()), `${exam.slug}/${q.sourceNumber}: answer in choices`)
      }
      const html = group.questions[0].questionHtml
      if (html) assert.deepEqual(splitHtmlByBlanks(html).filter(s => s.kind === 'blank').map(s => s.sourceNumber), group.questions.map(q => q.sourceNumber), `${exam.slug}: complete blanks`)
      if (group.displayType === 'table-completion') {
        const cells = [...html.matchAll(/<td>([\s\S]*?)<\/td>/g)].map(m => m[1]).join(' ')
        assert.deepEqual(splitHtmlByBlanks(cells).filter(s => s.kind === 'blank').map(s => s.sourceNumber), group.questions.map(q => q.sourceNumber), `${exam.slug}: blanks stay inside table cells`)
      }
      if (group.instructionHtml.includes('Label the diagram')) assert.match(html, /<img\b/)
      for (const q of group.questions) {
        assert.ok(q.prompt.trim() && q.answerKey.trim(), `${exam.slug}/${q.sourceNumber}: text and key`)
        assert.equal(q.displayType, group.displayType)
        if (q.type === 'mcq') assert.ok(q.options.length >= 4 && q.options.every(Boolean), `${exam.slug}/${q.sourceNumber}: options`)
        if (q.type === 'tfng') assert.ok(['TRUE', 'FALSE', 'NOT GIVEN'].includes(q.answerKey))
        if (q.type === 'ynng') assert.ok(['YES', 'NO', 'NOT GIVEN'].includes(q.answerKey))
        assert.ok(expandAnswerKey(q.answerKey).some(value => matchesAnswerKey(value, q.answerKey)), `${exam.slug}/${q.sourceNumber}: gradeable key`)
      }
      if (group.config.answerSlots) {
        const questions = group.questions.map((q, i) => ({ ...q, order: i + 1, answerGroup: 'shared' }))
        const answers = Object.fromEntries(questions.map((q, i) => [String(i + 1), questions.at(-i - 1).answerKey]))
        assert.equal(gradeQuestions(questions, answers).filter(q => q.isCorrect).length, questions.length, `${exam.slug}: any answer order`)
        for (const q of questions) answers[String(q.order)] = questions[0].answerKey
        assert.equal(gradeQuestions(questions, answers).filter(q => q.isCorrect).length, 1, `${exam.slug}: no duplicate credit`)
        answers['1'] = 'Z'
        assert.equal(gradeQuestions(questions, answers).filter(q => q.isCorrect).length, 1, `${exam.slug}: partial credit`)
      }
    }
  }
  assert.equal(groupCount, 171)
  const exam = slug => exams.find(t => t.slug === slug)
  const groups = slug => exam(slug).passages.flatMap(p => p.groups)
  const stadium = groups('cam-17-1').filter(g => g.config.answerSlots)
  assert.deepEqual(stadium.map(g => g.questions.map(q => q.sourceNumber)), [[23, 24], [25, 26]])
  assert.deepEqual(stadium.map(g => g.questions.map(q => q.answerKey)), [['C', 'D'], ['B', 'E']])
  assert.notDeepEqual(stadium[0].questions[0].options, stadium[1].questions[0].options)
  assert.equal(groups('cam-19-2').flatMap(g => g.questions).find(q => q.sourceNumber === 17).answerKey, 'C')
  assert.equal(groups('cam-20-3').find(g => g.config.headings).config.headings.length, 7)
  assert.equal(groups('cam-20-3').flatMap(g => g.questions).find(q => q.sourceNumber === 37).options.length, 4)
  for (const slug of ['cam-19-1', 'cam-20-1']) assert.match(exam(slug).passages[1].contentHtml, /<strong>A<\/strong>/)
  assert.deepEqual(correctReading(structuredClone(dataset)), dataset)
})

test('Cambridge 9 Test 3 through 15 Test 4 have 1040 usable questions with source choices and passages', () => {
  const dataset = JSON.parse(readFileSync(new URL('../supabase/seed/skill-reading-data.json', import.meta.url), 'utf8'))
  const exams = dataset.tests.filter(item => /^cam-(9-[34]|1[0-5]-[1-4])$/.test(item.slug))
  assert.equal(exams.length, 26)
  let groupCount = 0
  for (const exam of exams) {
    const groups = exam.passages.flatMap(p => p.groups)
    groupCount += groups.length
    assert.equal(exam.questionCount, 40, exam.slug)
    assert.deepEqual(groups.flatMap(g => g.questions.map(q => q.sourceNumber)), Array.from({ length: 40 }, (_, i) => i + 1), exam.slug)
    for (const passage of exam.passages) {
      assert.ok(passage.contentHtml.length > 3500, `${exam.slug}: complete passage ${passage.sectionNo}`)
      assert.doesNotMatch(passage.contentHtml, /\[Input\]|Drop heading|Practice this section/)
      const labels = [...passage.contentHtml.matchAll(/<strong>([A-J])<\/strong>/g)].map(m => m[1])
      if (labels.length) assert.deepEqual(labels, Array.from({ length: labels.length }, (_, i) => String.fromCharCode(65 + i)), exam.slug)
    }
    for (const group of groups) {
      assert.match(group.instructionHtml, new RegExp(`Questions ${group.questions[0].sourceNumber}`))
      const choices = matchingOptionsFor(group)
      if (group.displayType.startsWith('matching') || group.displayType === 'sentence-ending' || group.config.phraseOptions) {
        assert.ok(choices.length > 1, `${exam.slug}/${group.questions[0].sourceNumber}: choices`)
        for (const q of group.questions) assert.ok(choices.some(option => option.key.toLowerCase() === q.answerKey.toLowerCase()), `${exam.slug}/${q.sourceNumber}: answer in choices`)
      }
      const html = group.questions[0].questionHtml
      if (html) assert.deepEqual(splitHtmlByBlanks(html).filter(s => s.kind === 'blank').map(s => s.sourceNumber), group.questions.map(q => q.sourceNumber), `${exam.slug}: complete blanks`)
      if (group.displayType === 'table-completion') {
        const cells = [...html.matchAll(/<td>([\s\S]*?)<\/td>/g)].map(m => m[1]).join(' ')
        assert.deepEqual(splitHtmlByBlanks(cells).filter(s => s.kind === 'blank').map(s => s.sourceNumber), group.questions.map(q => q.sourceNumber), `${exam.slug}: blanks stay inside table cells`)
      }
      if (group.instructionHtml.includes('Label the diagram')) assert.match(html, /<img\b/)
      for (const q of group.questions) {
        assert.ok(q.prompt.trim() && q.answerKey.trim(), `${exam.slug}/${q.sourceNumber}: text and key`)
        assert.equal(q.displayType, group.displayType)
        if (q.type === 'mcq') assert.ok(q.options.length >= 4 && q.options.every(Boolean), `${exam.slug}/${q.sourceNumber}: options`)
        if (q.type === 'tfng') assert.ok(['TRUE', 'FALSE', 'NOT GIVEN'].includes(q.answerKey))
        if (q.type === 'ynng') assert.ok(['YES', 'NO', 'NOT GIVEN'].includes(q.answerKey))
        assert.ok(expandAnswerKey(q.answerKey).some(value => matchesAnswerKey(value, q.answerKey)), `${exam.slug}/${q.sourceNumber}: gradeable key`)
      }
      if (group.config.answerSlots) {
        const questions = group.questions.map((q, i) => ({ ...q, order: i + 1, answerGroup: 'shared' }))
        const answers = Object.fromEntries(questions.map((q, i) => [String(i + 1), questions.at(-i - 1).answerKey]))
        assert.equal(gradeQuestions(questions, answers).filter(q => q.isCorrect).length, questions.length, `${exam.slug}: any answer order`)
        for (const q of questions) answers[String(q.order)] = questions[0].answerKey
        assert.equal(gradeQuestions(questions, answers).filter(q => q.isCorrect).length, 1, `${exam.slug}: no duplicate credit`)
        answers['1'] = 'Z'
        assert.equal(gradeQuestions(questions, answers).filter(q => q.isCorrect).length, 1, `${exam.slug}: partial credit`)
      }
    }
  }
  assert.equal(groupCount, 216)
  const questions = slug => exams.find(t => t.slug === slug).passages.flatMap(p => p.groups.flatMap(g => g.questions))
  assert.equal(questions('cam-9-3')[32].answerKey, 'Jupiter')
  assert.equal(questions('cam-9-3')[34].answerKey, 'circuits')
  assert.deepEqual(questions('cam-11-4').slice(6, 8).map(q => q.answerKey), ['A', 'B'])
  assert.match(exams.find(t => t.slug === 'cam-11-3').passages[2].contentHtml, /Occasionally, in some difficult musical compositions/)
  assert.match(exams.find(t => t.slug === 'cam-9-4').passages[1].contentHtml, /A sense of self develops/)
  assert.doesNotMatch(exams.find(t => t.slug === 'cam-9-4').passages[1].contentHtml, /Hearing impairment/)
  assert.deepEqual(correctReading(structuredClone(dataset)), dataset)
})

test('Cambridge 9 Test 2 has source groups, matching choices and two distinct answer slots', () => {
  const dataset = JSON.parse(readFileSync(new URL('../supabase/seed/skill-reading-data.json', import.meta.url), 'utf8'))
  const exam = dataset.tests.find(item => item.slug === 'cam-9-2')
  const groups = exam.passages.flatMap(passage => passage.groups)
  assert.deepEqual(groups.map(group => [group.questions[0].sourceNumber, group.questions.at(-1).sourceNumber, group.displayType]), [
    [1, 6, 'matching-info'], [7, 10, 'fill-blank'], [11, 12, 'multiple-choice-2'], [13, 13, 'multiple-choice'],
    [14, 17, 'matching-info'], [18, 21, 'matching-feature'], [22, 26, 'tfng'],
    [27, 31, 'multiple-choice'], [32, 37, 'ynng'], [38, 40, 'sentence-ending'],
  ])
  assert.deepEqual(groups.flatMap(group => group.questions.map(q => q.sourceNumber)), Array.from({ length: 40 }, (_, i) => i + 1))
  assert.equal(groups[0].questions[0].answerKey, 'H')
  assert.deepEqual([...exam.passages[0].contentHtml.matchAll(/<strong>([A-I])<\/strong>/g)].map(match => match[1]), Array.from('ABCDEFGHI'))
  assert.deepEqual([...exam.passages[1].contentHtml.matchAll(/<strong>([A-G])<\/strong>/g)].map(match => match[1]), Array.from('ABCDEFG'))
  assert.equal(matchingOptionsFor(groups[0]).length, 9)
  assert.equal(matchingOptionsFor(groups[4]).length, 7)
  assert.equal(matchingOptionsFor(groups[5]).length, 4)
  assert.equal(matchingOptionsFor(groups[9]).length, 5)
  assert.equal(groups[2].config.answerSlots, 2)
  assert.deepEqual(groups[2].questions.map(q => [q.answerKey, q.acceptedAnswers]), [['A', ['C']], ['C', ['A']]])
  assert.deepEqual(correctReading(structuredClone(dataset)), dataset)
})

test('Cambridge 9 Test 1 has 40 questions in the source groups; Animals Biology stays removed', () => {
  const dataset = JSON.parse(readFileSync(new URL('../supabase/seed/skill-reading-data.json', import.meta.url), 'utf8'))
  assert.ok(!dataset.tests.some(item => item.slug === 'IELTS_Animals_Biology_B1'))
  const exam = dataset.tests.find(item => item.slug === 'cam-9-1')
  const groups = exam.passages.flatMap(passage => passage.groups)
  assert.deepEqual(groups.map(group => [group.questions[0].sourceNumber, group.questions.at(-1).sourceNumber, group.displayType]), [
    [1, 7, 'tfng'], [8, 13, 'fill-blank'], [14, 17, 'matching-heading'],
    [18, 20, 'fill-blank'], [21, 26, 'ynng'], [27, 30, 'fill-blank'],
    [31, 33, 'tfng'], [34, 39, 'note-completion'], [40, 40, 'multiple-choice'],
  ])
  assert.deepEqual(groups.flatMap(group => group.questions.map(q => q.sourceNumber)), Array.from({ length: 40 }, (_, i) => i + 1))
  assert.ok(groups[0].questions.every(q => q.type === 'tfng'))
  assert.match(groups[1].instructionHtml, /TWO WORDS/)
  assert.equal(groups[7].questions[0].answerKey, 'three measurements')
  assert.deepEqual([...groups[7].questions[0].questionHtml.matchAll(/(\d+)_______/g)].map(match => Number(match[1])), [34, 35, 36, 37, 38, 39])
  assert.deepEqual(correctReading(structuredClone(dataset)), dataset, 'correction is idempotent')
})
