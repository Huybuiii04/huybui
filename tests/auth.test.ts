import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  AUTH_ERROR_MESSAGES,
  authErrorCode,
  classifyRemoteError,
  normalizeBand,
  parseRemotePayload,
  profileFromRow,
  profileToRow,
} from '../src/lib/authLogic.ts'

test('auth errors map to friendly codes without leaking raw messages', () => {
  assert.equal(authErrorCode({ code: 'invalid_credentials', message: 'Invalid login credentials' }), 'invalid_credentials')
  assert.equal(authErrorCode({ message: 'User already registered' }), 'email_taken')
  assert.equal(authErrorCode({ code: 'weak_password', message: 'Password should be at least 8 characters.' }), 'weak_password')
  assert.equal(authErrorCode({ code: 'email_not_confirmed' }), 'email_not_confirmed')
  assert.equal(authErrorCode({ code: 'over_request_rate_limit', message: 'Rate limit exceeded' }), 'rate_limited')
  assert.equal(authErrorCode({ message: 'Failed to fetch' }), 'network')
  assert.equal(authErrorCode(new Error('boom')), 'unknown')
  assert.equal(authErrorCode(null), 'unknown')
})

test('every friendly code has a bilingual message', () => {
  for (const [code, message] of Object.entries(AUTH_ERROR_MESSAGES)) {
    assert.equal(message.length, 2, code)
    assert.ok(message[0].length > 0 && message[1].length > 0, code)
  }
})

test('remote payload reads the JSON error raised by private.raise_http_error', () => {
  const error = {
    code: 'PGRST',
    message: JSON.stringify({ code: 'suspended', message: 'This account is suspended', details: null, hint: null }),
    details: JSON.stringify({ status: 403, headers: {} }),
  }
  assert.equal(parseRemotePayload(error).code, 'suspended')
  assert.equal(parseRemotePayload(error).status, 403)
  assert.equal(parseRemotePayload({ message: 'not json' }).code, undefined)
})

test('suspended accounts and version conflicts are classified for the UI', () => {
  const suspended = {
    code: 'PGRST',
    message: JSON.stringify({ code: 'suspended', message: 'This account is suspended' }),
    details: JSON.stringify({ status: 403, headers: {} }),
  }
  assert.equal(classifyRemoteError(suspended), 'suspended')
  assert.equal(classifyRemoteError({ code: '42501', message: 'new row violates row-level security policy' }), 'suspended')
  const conflict = {
    code: 'PGRST',
    message: JSON.stringify({ code: 'draft_conflict', message: 'conflict' }),
    details: JSON.stringify({ status: 409, headers: {} }),
  }
  assert.equal(classifyRemoteError(conflict), 'conflict')
  assert.equal(classifyRemoteError({ code: 'PGRST', message: JSON.stringify({ code: 'unauthenticated' }) }), 'unauthenticated')
  assert.equal(classifyRemoteError({ code: 'PGRST', message: JSON.stringify({ code: 'card_not_found' }) }), 'not_found')
  assert.equal(classifyRemoteError({ code: 'PGRST', message: JSON.stringify({ code: 'card_not_due' }) }), 'not_found')
  assert.equal(classifyRemoteError({ code: 'PGRST', message: JSON.stringify({ code: 'invalid_card' }) }), 'invalid')
  assert.equal(classifyRemoteError({ message: 'Failed to fetch' }), 'network')
})

test('a missing grant is not reported as a suspended account', () => {
  assert.equal(classifyRemoteError({ code: '42501', message: 'permission denied for table profiles' }), 'invalid')
  assert.equal(classifyRemoteError({ code: '42501', message: 'permission denied for column display_name' }), 'invalid')
})

test('target band is normalised to numeric(2,1) shape', () => {
  assert.equal(normalizeBand('7'), '7.0')
  assert.equal(normalizeBand(7.5), '7.5')
  assert.equal(normalizeBand('7.55'), '7.6')
  assert.equal(normalizeBand('abc'), '7.0')
  assert.equal(normalizeBand(null), '7.0')
  assert.equal(normalizeBand(12), '9.0')
  assert.equal(normalizeBand(-3), '0.0')
})

test('profile rows convert to app state and back', () => {
  const row = { id: 'u1', display_name: 'Lan', ui_locale: 'en', feedback_locale: 'en', timezone: 'Asia/Ho_Chi_Minh', target_band: 7.5 }
  assert.deepEqual(profileFromRow(row), { name: 'Lan', target: '7.5', feedback: 'en' })
  assert.deepEqual(profileFromRow(null), { name: '', target: '7.0', feedback: 'vi' })
  const payload = profileToRow('u1', { name: '  Lan  ', target: '7.5', feedback: 'en' }, { uiLocale: 'en', timezone: 'Asia/Ho_Chi_Minh' })
  assert.deepEqual(payload, {
    id: 'u1',
    display_name: 'Lan',
    ui_locale: 'en',
    feedback_locale: 'en',
    timezone: 'Asia/Ho_Chi_Minh',
    target_band: 7.5,
  })
})
