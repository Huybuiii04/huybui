import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  entryRowToEntry,
  entryToCard,
  filterEntries,
  isInNotebook,
  topicRowToTopic,
  type VocabularyEntry,
  type VocabularyEntryRow,
} from '../src/lib/vocabularyLogic.ts'

const row: VocabularyEntryRow = {
  id: 'e-1',
  topic_key: 'education',
  term: 'early childhood education',
  pos: 'np',
  meaning: 'giáo dục mầm non',
  definition: 'danh từ không đếm được; invest in/expand + early childhood education',
  examples: ['Early childhood education narrows the gap.', 'The city doubled spending on early childhood education.'],
  ipa: null,
}

const entry: VocabularyEntry = {
  id: 'e-1',
  topicKey: 'education',
  term: 'early childhood education',
  pos: 'np',
  meaning: 'giáo dục mầm non',
  definition: 'danh từ không đếm được; invest in/expand + early childhood education',
  examples: row.examples,
  ipa: null,
}

test('entry rows map to the app entry shape', () => {
  assert.deepEqual(entryRowToEntry(row), entry)
})

test('missing optional columns fall back to empty values', () => {
  const mapped = entryRowToEntry({ id: 'e-2', topic_key: 'oceans', term: 'tide', pos: null, meaning: null, definition: null, examples: null, ipa: null })
  assert.equal(mapped.pos, '')
  assert.equal(mapped.meaning, '')
  assert.deepEqual(mapped.examples, [])
  assert.equal(mapped.ipa, null)
})

test('topic rows map to the app topic shape', () => {
  assert.deepEqual(topicRowToTopic({ key: 'oceans', number: 24, title: 'Oceans & Water', description: 'mo ta' }), {
    key: 'oceans',
    number: 24,
    title: 'Oceans & Water',
    description: 'mo ta',
  })
  assert.equal(topicRowToTopic({ key: 'x', number: 1, title: 'T', description: null }).description, '')
})

test('filter matches term, meaning and definition', () => {
  assert.deepEqual(filterEntries([entry], 'childhood').map(item => item.id), ['e-1'])
  assert.deepEqual(filterEntries([entry], 'giáo dục').map(item => item.id), ['e-1'])
  assert.deepEqual(filterEntries([entry], 'không đếm được').map(item => item.id), ['e-1'])
  assert.deepEqual(filterEntries([entry], 'xyz'), [])
})

test('an empty query keeps every entry', () => {
  assert.equal(filterEntries([entry], '   ').length, 1)
})

test('every catalog word is a vocabulary card, phrases included', () => {
  assert.equal(entryToCard(entry).kind, 'vocabulary')
  assert.equal(entryToCard({ ...entry, pos: 'phr' }).kind, 'vocabulary')
  assert.equal(entryToCard({ ...entry, pos: 'id' }).kind, 'vocabulary')
})

test('a card carries the topic as tag and one example sentence', () => {
  const card = entryToCard(entry)
  assert.equal(card.term, 'early childhood education')
  assert.equal(card.meaning, 'giáo dục mầm non')
  assert.equal(card.example, 'Early childhood education narrows the gap.')
  assert.deepEqual(card.tags, ['education'])
})

test('a word without examples still makes a card', () => {
  const card = entryToCard({ ...entry, examples: [] })
  assert.equal(card.example, '')
  assert.equal(card.term, 'early childhood education')
})

test('notebook membership ignores case and surrounding spaces', () => {
  const cards = [{ term: 'Early Childhood Education', kind: 'vocabulary' }]
  assert.equal(isInNotebook(entry, cards), true)
  assert.equal(isInNotebook(entry, []), false)
  assert.equal(isInNotebook({ ...entry, term: 'urbanisation' }, cards), false)
})
