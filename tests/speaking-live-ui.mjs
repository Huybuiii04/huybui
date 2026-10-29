// Local UI/audio checks. Auth, provider, microphone and storage use fixtures.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const base = process.env.TEST_URL ?? 'http://127.0.0.1:5180'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname))
const out = 'test-results/speaking-live-ui'
mkdirSync(out, { recursive: true })
const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'preview@example.test', app_metadata: { provider: 'email' }, user_metadata: { display_name: 'Lan' } }
const token = ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'), 'preview-signature'].join('.')
const auth = { access_token: token, refresh_token: 'preview-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user }
const steps = Array.from({ length: 8 }, (_, index) => ({ index, text: `Question number ${index + 1}?`, isCueCard: false }))
const plan = [{ turnId: 'preview-turn', orderIndex: 0, part: 'part-1', prepMs: 0, maxAnswerMs: 45000, steps }]
const turn = { turnId: 'preview-turn', orderIndex: 0, part: 'part-1', promptText: steps[0].text, questions: steps.slice(1).map(step => step.text), cueCard: null, maxDurationMs: 60000, uploadUrl: 'https://fixture.invalid/upload' }
// Valid 100 ms PCM WAV exercises native audio decoding and ended events.
const audio = Buffer.alloc(44 + 4800)
audio.write('RIFF', 0); audio.writeUInt32LE(audio.length - 8, 4); audio.write('WAVEfmt ', 8)
audio.writeUInt32LE(16, 16); audio.writeUInt16LE(1, 20); audio.writeUInt16LE(1, 22)
audio.writeUInt32LE(24000, 24); audio.writeUInt32LE(48000, 28); audio.writeUInt16LE(2, 32); audio.writeUInt16LE(16, 34)
audio.write('data', 36); audio.writeUInt32LE(4800, 40)
const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] })
const errors = [], checked = []
try {
  for (const width of [1440, 768, 390]) for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ permissions: ['microphone'], viewport: { width, height: 900 } })
    await context.addInitScript(theme => {
      localStorage.setItem('ielts-language', 'en')
      localStorage.setItem('ielts-theme-v2', theme)
      AnalyserNode.prototype.getFloatTimeDomainData = function(buffer) { buffer.fill(0) }
      window.SpeechRecognition = undefined
      window.webkitSpeechRecognition = undefined
      window.__plays = 0
      window.__browserVoices = []
      const play = HTMLMediaElement.prototype.play
      HTMLMediaElement.prototype.play = function() { window.__plays += 1; return play.call(this) }
      window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text } }
      Object.defineProperty(window, 'speechSynthesis', { value: {
        getVoices: () => [{ name: 'Fixture English', lang: 'en-GB' }],
        cancel() {},
        speak(utterance) { window.__browserVoices.push(utterance.text); setTimeout(() => utterance.onend?.(), 25) },
      } })
    }, theme)
    const voices = [], actions = []
    let failVoice = false
    await context.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin === new URL(base).origin) return route.continue()
      let body = []
      if (url.pathname.endsWith('/auth/v1/token')) body = auth
      else if (url.pathname.endsWith('/auth/v1/user')) body = user
      else if (url.pathname.endsWith('/functions/v1/submit-speaking')) body = { attemptId: 'preview-attempt', mode: 'part-1', turns: [turn] }
      else if (url.pathname.endsWith('/functions/v1/speaking-live')) {
        const input = route.request().postDataJSON()
        actions.push(input.action)
        if (input.action === 'start') body = { sessionId: 'preview-session', token: 'preview-token', expiresAt: Date.now() + 3600000, voice: 'en-GB', mode: 'part-1', limits: {}, plan }
        else if (input.action === 'brain') body = { ack: '', followUp: 'Why do you think so?', advance: false, nextStepIndex: 1 }
        else if (input.action === 'voice') {
          voices.push(input.text)
          if (failVoice) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'voice_failed' } }) })
          return route.fulfill({ status: 200, contentType: 'audio/wav', body: audio })
        } else throw new Error(`Unexpected live action: ${input.action}`)
      } else if (url.pathname.endsWith('/profiles')) body = [{ id: user.id, display_name: 'Lan', target_band: 7, feedback_language: 'en' }]
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    await page.exposeFunction('voiceRequestCount', () => voices.length)
    await page.goto(base + '/auth')
    await page.getByLabel('Email', { exact: true }).fill(user.email)
    await page.locator('input[type=password]').fill('preview-password')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForURL(base + '/app')

    await page.goto(base + '/app/speaking/part-3/12/5?question=selected-topic')
    await page.waitForURL(base + '/app/speaking/live?mode=part-3&book=12&test=5&question=selected-topic')
    await page.getByRole('button', { name: 'Start', exact: true }).waitFor()
    assert.equal(actions.length, 0, 'Redirect must not start a paid session')
    await page.goto(base + '/app/speaking/part-1/12/5')
    await page.waitForURL(base + '/app/speaking/live?mode=part-1&book=12&test=5')
    await page.getByRole('button', { name: 'Start', exact: true }).click()
    await page.getByText('Ready for your answer', { exact: true }).waitFor()
    await page.waitForFunction(async () => await window.voiceRequestCount() >= 3)
    assert.deepEqual(voices, steps.slice(0, 3).map(step => step.text))
    assert.equal(await page.evaluate(() => window.__plays), 1, 'Examiner question plays automatically')
    await page.getByRole('button', { name: 'Replay question', exact: true }).click()
    await page.getByText('Ready for your answer', { exact: true }).waitFor()
    assert.equal(await page.evaluate(() => window.__plays), 2, 'Replay plays cached audio')
    assert.equal(voices.length, 3, 'Replay must not request TTS again')
    await page.getByRole('button', { name: 'Done answering', exact: true }).click()
    await page.locator('.live-question-text').getByText(steps[1].text, { exact: true }).waitFor()
    await page.getByText('Ready for your answer', { exact: true }).waitFor()
    assert.equal(actions.includes('brain'), false)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    assert.deepEqual(axe.violations.map(item => item.id), [])
    await page.screenshot({ path: `${out}/${theme}-${width}.png`, fullPage: true })

    if (width === 1440 && theme === 'light') {
      await page.goto(base + '/app/speaking/live?mode=part-1&book=12&test=5')
      await page.getByRole('checkbox').check()
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      await page.getByRole('button', { name: 'Done answering', exact: true }).click()
      await page.locator('.live-question-text').getByText('Why do you think so?', { exact: true }).waitFor()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      assert.equal(actions.filter(action => action === 'brain').length, 1)
      const followUpVoices = voices.length
      await page.getByRole('button', { name: 'Replay question', exact: true }).click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      assert.equal(voices.length, followUpVoices, 'Follow-up replay also uses cached audio')
      await page.getByRole('button', { name: 'Done answering', exact: true }).click()
      await page.locator('.live-question-text').getByText(steps[1].text, { exact: true }).waitFor()
      assert.equal(actions.filter(action => action === 'brain').length, 1, 'Wait for the follow-up answer before advancing')

      failVoice = true
      await page.goto(base + '/app/speaking/live?mode=part-1&book=12&test=5')
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      assert.deepEqual(await page.evaluate(() => window.__browserVoices), [steps[0].text], 'Browser voice works when server TTS fails')
      await page.goto(base + '/app/speaking/live?mode=part-1&book=12&test=5')
      await page.getByRole('button', { name: 'Start', exact: true }).waitFor()
      await page.evaluate(() => { window.speechSynthesis.getVoices = () => [] })
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByRole('button', { name: 'Back', exact: true }).waitFor()
      await page.getByRole('alert').waitFor()
      await page.getByRole('button', { name: 'Back', exact: true }).click()
      await page.getByRole('button', { name: 'Start', exact: true }).waitFor()
      await page.goto(base + '/app/speaking/part-1/12/5?record=1')
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByRole('button', { name: 'Record', exact: true }).waitFor()
      await page.getByText('Upload a file', { exact: true }).waitFor()
    }
    checked.push({ width, theme })
    console.log(`PASS live audio ${width} ${theme}`)
    await context.close()
  }
  assert.deepEqual(errors, [])
  writeFileSync(`${out}/report.json`, JSON.stringify({ checked, errors, network: 'mocked; native audio playback tested' }, null, 2))
} finally { await browser.close() }
