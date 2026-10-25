import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  loadVocabularyEntries,
  loadVocabularyTopics,
  type VocabularySource,
} from '../src/lib/vocabularyRepository.ts'

const source: VocabularySource = { url: 'https://demo.test', key: 'test-key' }

function stubFetch(body: unknown, capture?: (url: string) => void) {
  const original = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    capture?.(String(input))
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }) as typeof fetch
  return () => { globalThis.fetch = original }
}

test('repository loads topics and maps rows', async () => {
  let seen = ''
  const restore = stubFetch([{ key: 'education', number: 1, title: 'Education & Learning', description: 'mo ta' }], url => { seen = url })
  try {
    const topics = await loadVocabularyTopics(source)
    assert.equal(topics.length, 1)
    assert.equal(topics[0].key, 'education')
    assert.equal(topics[0].title, 'Education & Learning')
    assert.match(seen, /vocabulary_topics/)
    assert.match(seen, /order=number\.asc/)
  } finally {
    restore()
  }
})

test('repository sends topic and search filters', async () => {
  let seen = ''
  const restore = stubFetch([], url => { seen = url })
  try {
    const entries = await loadVocabularyEntries({ topic: 'oceans', search: 'tide', limit: 20 }, source)
    assert.deepEqual(entries, [])
    assert.match(seen, /topic_key=eq\.oceans/)
    assert.match(seen, /ilike/i)
    assert.match(seen, /limit=20/)
  } finally {
    restore()
  }
})

test('repository maps entry rows to app entries', async () => {
  const restore = stubFetch([
    { id: 'e-1', topic_key: 'oceans', term: 'seabed', pos: 'n', meaning: 'đáy biển', definition: '', examples: ['A.'], ipa: 'ˈsiːbed' },
  ])
  try {
    const entries = await loadVocabularyEntries({ topic: 'oceans' }, source)
    assert.equal(entries.length, 1)
    assert.equal(entries[0].term, 'seabed')
    assert.equal(entries[0].topicKey, 'oceans')
    assert.equal(entries[0].ipa, 'ˈsiːbed')
  } finally {
    restore()
  }
})

test('repository returns an empty list when the request fails', async () => {
  const original = globalThis.fetch
  globalThis.fetch = (async () => new Response('loi', { status: 500 })) as typeof fetch
  try {
    assert.deepEqual(await loadVocabularyTopics(source), [])
    assert.deepEqual(await loadVocabularyEntries({}, source), [])
  } finally {
    globalThis.fetch = original
  }
})
