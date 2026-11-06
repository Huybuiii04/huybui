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
const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] })
const errors = [], checked = []
try {
  for (const width of [1440, 768, 390]) for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ permissions: ['microphone'], viewport: { width, height: 900 } })
    await context.addInitScript(theme => {
      localStorage.setItem('ielts-language', 'en')
      localStorage.setItem('ielts-theme-v2', theme)
      window.__level = 0
      AnalyserNode.prototype.getFloatTimeDomainData = function(buffer) { buffer.fill(window.__level) }
      window.__recorders = []
      const recorderStart = MediaRecorder.prototype.start
      MediaRecorder.prototype.start = function(...args) { window.__recorders.push(this); return recorderStart.apply(this, args) }
      const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
      navigator.mediaDevices.getUserMedia = async (...args) => { const stream = await getUserMedia(...args); window.__mic = stream; return stream }
      window.SpeechRecognition = undefined
      window.webkitSpeechRecognition = undefined
      window.__browserVoices = []
      window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text } }
      Object.defineProperty(window, 'speechSynthesis', { value: {
        getVoices: () => [{ name: 'Fixture British', lang: 'en-GB' }, { name: 'Fixture American', lang: 'en-US' }],
        cancel() {},
        speak(utterance) { window.__browserVoices.push({ text: utterance.text, lang: utterance.lang }); setTimeout(() => utterance.onend?.(), 25) },
      } })
    }, theme)
    const actions = [], commits = [], uploads = [], brains = [], finishes = []
    let fixturePlan = plan
    let brainFailure = ''
    let finishFailure = ''
    let resultPolls = 0
    await context.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin === new URL(base).origin) return route.continue()
      let body = []
      if (url.pathname.endsWith('/auth/v1/token')) body = auth
      else if (url.pathname.endsWith('/auth/v1/user')) body = user
      else if (url.hostname === 'fixture.invalid') { uploads.push(route.request().postDataBuffer()); body = {} }
      else if (url.pathname.endsWith('/functions/v1/submit-speaking')) {
        const input = route.request().postDataJSON()
        if (input.action === 'commit') { commits.push(input); body = { committed: true, jobId: 'preview-job' } }
        else body = { attemptId: 'preview-attempt', mode: input.mode, turns: fixturePlan.map(item => ({ ...turn, turnId: item.turnId, part: item.part })) }
      }
      else if (url.pathname.endsWith('/functions/v1/speaking-live')) {
        const input = route.request().postDataJSON()
        actions.push(input.action)
        if (input.action === 'start') body = { sessionId: 'preview-session', token: 'preview-token', expiresAt: Date.now() + 3600000, voice: 'en-GB', mode: 'part-1', limits: {}, plan: fixturePlan }
        else if (input.action === 'brain') {
          brains.push(input)
          if (brainFailure) return route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ error: { code: brainFailure } }) })
          body = { ack: '', followUp: 'Why do you think so?', advance: false, nextStepIndex: 1 }
        }
        else if (input.action === 'finish') {
          finishes.push(input)
          if (finishFailure) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: finishFailure } }) })
          body = { finished: true }
        }
        else throw new Error(`Unexpected live action: ${input.action}`)
      } else if (url.pathname.endsWith('/speaking_attempts')) { resultPolls += 1; body = { status: 'succeeded', speaking_results: { overall_display: 7, overall_raw: 7 } } }
      else if (url.pathname.endsWith('/profiles')) body = [{ id: user.id, display_name: 'Lan', target_band: 7, feedback_language: 'en' }]
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base + '/auth')
    await page.getByLabel('Email', { exact: true }).fill(user.email)
    await page.locator('input[type=password]').fill('preview-password')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForURL(base + '/app')

    await page.goto(base + '/app/speaking/part-3/12/5?question=selected-topic')
    await page.waitForURL(base + '/app/speaking/live?mode=part-3&book=12&test=5&question=selected-topic')
    await page.getByRole('button', { name: 'Start', exact: true }).waitFor()
    assert.equal(await page.getByRole('checkbox').count(), 0, 'Follow-up is automatic; no opt-in required')
    assert.equal(actions.length, 0, 'Redirect must not start a paid session')
    await page.goto(base + '/app/speaking/part-1/12/5')
    await page.waitForURL(base + '/app/speaking/live?mode=part-1&book=12&test=5')
    await page.getByRole('button', { name: 'Start', exact: true }).click()
    await page.getByText('Ready for your answer', { exact: true }).waitFor()
    const mic = page.locator('.live-mic-toggle')
    assert.equal(await mic.getAttribute('aria-pressed'), 'false')
    assert.equal(await page.evaluate(() => window.__mic.getAudioTracks()[0].enabled), false, 'Mic stays muted until user starts recording')
    assert.equal(await page.evaluate(() => window.__recorders.length), 0, 'Examiner audio is not recorded')
    assert.deepEqual(await page.evaluate(() => window.__browserVoices), [{ text: steps[0].text, lang: 'en-GB' }], 'Examiner uses browser voice without prefetching paid audio')
    await page.getByRole('button', { name: 'Replay question', exact: true }).click()
    await page.getByText('Ready for your answer', { exact: true }).waitFor()
    assert.equal(await page.evaluate(() => window.__browserVoices.length), 2, 'Replay uses browser voice')
    assert.equal(actions.includes('voice'), false, 'Playback and replay must not request paid TTS')
    await mic.click()
    assert.equal(await mic.getAttribute('aria-pressed'), 'true')
    assert.equal(await page.evaluate(() => window.__mic.getAudioTracks()[0].enabled), true)
    await page.locator('.live-message.is-recording').waitFor()
    assert.equal(await page.getByRole('button', { name: 'Replay question', exact: true }).isDisabled(), true)
    if (width === 1440 && theme === 'light') {
      // Speech followed by silence must keep recording until the second toggle.
      await page.waitForTimeout(800)
      await page.evaluate(() => { window.__level = .2 })
      await page.getByText('Listening to you…', { exact: true }).waitFor()
      await page.evaluate(() => { window.__level = 0 })
      await page.getByText('Mic on · Recording', { exact: true }).waitFor()
      assert.equal(await mic.getAttribute('aria-pressed'), 'true')
    }
    await page.waitForTimeout(150)
    await mic.click()
    await page.locator('.live-question-text').getByText('Why do you think so?', { exact: true }).waitFor()
    await page.getByText('Ready for your answer', { exact: true }).waitFor()
    await page.locator('.live-message.is-candidate').getByText('Voice recording').waitFor()
    assert.equal(await page.evaluate(() => window.__mic.getAudioTracks()[0].enabled), false)
    assert.equal(await page.evaluate(() => window.__recorders[0].state), 'paused', 'Whole-part recorder pauses instead of losing earlier answers')
    const messageSides = await page.evaluate(() => {
      const examiner = document.querySelector('.live-message.is-examiner').getBoundingClientRect()
      const candidate = document.querySelector('.live-message.is-candidate').getBoundingClientRect()
      return candidate.right > examiner.right && candidate.left > examiner.left
    })
    assert.equal(messageSides, true, 'Candidate recording sits on the right')
    await page.locator('.live-messages').focus()
    await page.keyboard.press('Space')
    assert.equal(await mic.getAttribute('aria-pressed'), 'true')
    await page.keyboard.down('Space')
    await page.keyboard.down('Space')
    await page.keyboard.up('Space')
    await page.locator('.live-question-text').getByText(steps[1].text, { exact: true }).waitFor()
    await page.getByText('Ready for your answer', { exact: true }).waitFor()
    assert.equal(await page.evaluate(() => window.__recorders.length), 2, 'Follow-up answer resumes the main recorder without another audio fallback recorder')
    assert.equal(await page.locator('.live-message.is-candidate').count(), 2)
    // Native button Space must toggle once; global shortcut must not double-toggle.
    await mic.focus()
    await page.keyboard.press('Space')
    assert.equal(await mic.getAttribute('aria-pressed'), 'true')
    await page.keyboard.press('Space')
    await page.locator('.live-question-text').getByText('Why do you think so?', { exact: true }).last().waitFor()
    await page.getByText('Ready for your answer', { exact: true }).waitFor()
    await page.evaluate(() => {
      const input = document.createElement('textarea'); input.id = 'shortcut-input'; document.body.append(input); input.focus()
    })
    await page.keyboard.press('Space')
    assert.equal(await mic.getAttribute('aria-pressed'), 'false', 'Space while typing must not record')
    await page.locator('#shortcut-input').evaluate(input => input.remove())
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0) })
    assert.equal(brains.length, 2, 'Main answers ask follow-ups automatically; follow-up answers advance the plan')
    assert.equal(brains.every(input => input.allowFollowUp === true), true)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    assert.deepEqual(axe.violations.map(item => item.id), [])
    const micPosition = await mic.boundingBox()
    assert.ok(micPosition.y + micPosition.height <= 842, 'Microphone stays above the mobile navigation on the first screen')
    await page.screenshot({ path: `${out}/${theme}-${width}.png`, fullPage: true })

    if (width === 1440 && theme === 'light') {
      await page.getByRole('button', { name: 'End and grade', exact: true }).click()
      await page.getByRole('heading', { name: 'Live speaking result', exact: true }).waitFor()
      assert.equal(uploads.length, 1)
      assert.ok(uploads[0].length > 100, 'Paused answers upload together as one real audio file')
      const decodedSeconds = await page.evaluate(async data => {
        const context = new AudioContext()
        try { return (await context.decodeAudioData(Uint8Array.from(data).buffer)).duration }
        finally { await context.close() }
      }, [...uploads[0]])
      assert.ok(decodedSeconds > 1, 'Combined recording remains decodable after pause/resume')
      assert.equal(commits.length, 1)
      assert.equal(commits[0].byteSize, uploads[0].length)
      assert.ok(commits[0].durationMs > 1000 && commits[0].durationMs < 6000, 'Duration counts recording time, excluding replay and idle time')
      assert.equal(finishes[0].transcript.some(entry => entry.text.includes('Voice recording')), false, 'Voice bubble labels must not become fabricated AI transcripts')
      assert.equal(await page.evaluate(() => window.__mic.getAudioTracks()[0].readyState), 'ended')
      const beforeFollowUp = brains.length
      await page.goto(base + '/app/speaking/live?mode=part-1&book=12&test=5')
      // Full navigation resets globals; install recognition before creating the session.
      await page.evaluate(() => {
        window.SpeechRecognition = class {
          start() {}
          stop() { setTimeout(() => { this.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: 'I enjoy local festivals.' } }] }); this.onend?.() }, 20) }
        }
      })
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      await mic.click()
      await mic.click()
      await page.locator('.live-question-text').getByText('Why do you think so?', { exact: true }).waitFor()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      assert.equal(brains.length, beforeFollowUp + 1)
      assert.equal(brains[beforeFollowUp].candidateAnswer, 'I enjoy local festivals.', 'Follow-up includes final speech result delivered after Stop')
      assert.equal(brains[beforeFollowUp].audioBase64, undefined, 'Recognized speech does not need an audio fallback request')
      const followUpVoices = await page.evaluate(() => window.__browserVoices.length)
      await page.getByRole('button', { name: 'Replay question', exact: true }).click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      assert.equal(await page.evaluate(() => window.__browserVoices.length), followUpVoices + 1, 'Follow-up replay uses browser voice')
      await mic.click()
      await mic.click()
      await page.locator('.live-question-text').getByText(steps[1].text, { exact: true }).waitFor()
      assert.equal(brains.length, beforeFollowUp + 1, 'Wait for the follow-up answer before advancing')

      await page.goto(base + '/app/speaking/live?mode=part-1&book=12&test=5')
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      // Recognition is unavailable again: each main answer needs its own complete audio container.
      for (let index = 0; index < 2; index += 1) {
        await mic.click(); await page.waitForTimeout(200); await mic.click()
        await page.getByText('Ready for your answer', { exact: true }).waitFor()
        await page.locator('.live-question-text').getByText('Why do you think so?', { exact: true }).last().waitFor()
        const request = brains.at(-1)
        assert.equal(request.candidateAnswer, '')
        assert.equal(request.mimeType, 'audio/webm')
        assert.ok(request.audioBase64.length > 100)
        const duration = await page.evaluate(async encoded => {
          const context = new AudioContext()
          try { return (await context.decodeAudioData(Uint8Array.from(atob(encoded), char => char.charCodeAt(0)).buffer)).duration }
          finally { await context.close() }
        }, request.audioBase64)
        assert.ok(duration > .05 && duration < 1, 'Fallback contains only this answer, with a valid audio header')
        const calls = brains.length
        await mic.click(); await page.waitForTimeout(150); await mic.click()
        await page.locator('.live-question-text').getByText(steps[index + 1].text, { exact: true }).waitFor()
        await page.getByText('Ready for your answer', { exact: true }).waitFor()
        assert.equal(brains.length, calls, 'Follow-up answer advances without another AI call')
      }
      brainFailure = 'brain_timeout'
      await mic.click(); await page.waitForTimeout(150); await mic.click()
      await page.getByText('The AI timed out. Continuing with the scripted question for this turn.', { exact: true }).waitFor()
      await page.locator('.live-question-text').getByText(steps[3].text, { exact: true }).waitFor()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      assert.equal(await mic.getAttribute('aria-pressed'), 'false', 'AI error leaves mic off and the session usable')
      brainFailure = ''

      fixturePlan = ['part-1', 'part-2', 'part-3'].map((part, index) => ({
        ...plan[0], turnId: `full-turn-${index}`, orderIndex: index, part,
        prepMs: part === 'part-2' ? 2000 : 0,
        steps: [{ index: 0, text: `Full test ${part}`, isCueCard: part === 'part-2' }],
      }))
      await page.goto(base + '/app/speaking/live?mode=mock&book=12&test=5')
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      await mic.click(); await page.waitForTimeout(150); await mic.click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      await mic.click(); await page.waitForTimeout(150); await mic.click()
      await page.getByText('Cue card · Prepare', { exact: true }).waitFor()
      assert.equal(await mic.isDisabled(), true, 'Part 2 preparation keeps microphone off')
      const cueVisible = await page.locator('.live-messages').evaluate(list => list.scrollTop + list.clientHeight >= list.scrollHeight - 1)
      assert.equal(cueVisible, true, 'Part 2 cue card appears at the end of the visible conversation')
      for (const part of ['part-2', 'part-3']) {
        await page.getByText('Ready for your answer', { exact: true }).waitFor()
        await page.locator('.live-question-text').getByText(`Full test ${part}`, { exact: true }).waitFor()
        assert.equal(await mic.getAttribute('aria-pressed'), 'false')
        await mic.click(); await page.waitForTimeout(150); await mic.click()
        await page.getByText('Ready for your answer', { exact: true }).waitFor()
        await mic.click(); await page.waitForTimeout(150); await mic.click()
      }
      await page.getByRole('heading', { name: 'Live speaking result', exact: true }).waitFor()
      assert.equal(commits.length, 4, 'Each part keeps its own complete audio upload')
      fixturePlan = fixturePlan.map((item, index) => index === 0 ? { ...item, steps } : item)
      brainFailure = 'brain_provider_error'
      await page.goto(base + '/app/speaking/live?mode=mock&book=12&test=5')
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      await mic.click(); await page.waitForTimeout(150); await mic.click()
      await page.getByText('The follow-up AI service failed. Continuing with the scripted question for this turn.', { exact: true }).waitFor()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      const beforeEarlyFinish = commits.length
      await page.getByRole('button', { name: 'End and grade', exact: true }).click()
      await page.getByRole('heading', { name: 'Live speaking result', exact: true }).waitFor()
      assert.equal(commits.length, beforeEarlyFinish + 1, 'Early finish uploads only the recorded part')
      assert.equal(await page.getByText('Follow-up unavailable for this turn', { exact: true }).count(), 0, 'Old follow-up warnings must not remain during grading')
      brainFailure = ''
      fixturePlan = plan

      await page.goto(base + '/app/speaking/live?mode=part-1&book=12&test=5')
      await page.getByLabel('Examiner voice').selectOption('en-US')
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      assert.deepEqual(await page.evaluate(() => window.__browserVoices), [{ text: steps[0].text, lang: 'en-US' }], 'Examiner uses selected American voice')
      await mic.click(); await page.waitForTimeout(150); await mic.click()
      await page.getByText('Ready for your answer', { exact: true }).waitFor()
      finishFailure = 'upload_failed'
      const beforeFailedFinish = resultPolls
      await page.getByRole('button', { name: 'End and grade', exact: true }).click()
      await page.getByRole('alert').waitFor()
      await page.getByRole('button', { name: 'Back', exact: true }).waitFor()
      assert.equal(resultPolls, beforeFailedFinish, 'Failed finalization must not poll an unqueued attempt')
      assert.equal(await page.getByText('Scoring your answers…', { exact: true }).count(), 0, 'Failed finalization must not enter endless grading')
      finishFailure = ''
      await page.goto(base + '/app/speaking/live?mode=part-1&book=12&test=5')
      await page.getByRole('button', { name: 'Start', exact: true }).waitFor()
      await page.evaluate(() => { window.speechSynthesis.getVoices = () => [] })
      const beforeMissingVoice = actions.length
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByRole('button', { name: 'Back', exact: true }).waitFor()
      await page.getByRole('alert').waitFor()
      assert.equal(actions.length, beforeMissingVoice, 'Missing English voice must fail before creating a server session')
      await page.getByText('English speech could not be played. Enable or install an English voice on your device, then try again.', { exact: true }).waitFor()
      await page.getByRole('button', { name: 'Back', exact: true }).click()
      await page.getByRole('button', { name: 'Start', exact: true }).waitFor()
      await page.goto(base + '/app/speaking/part-1/12/5?record=1')
      await page.getByRole('button', { name: 'Start', exact: true }).click()
      await page.getByRole('button', { name: 'Record', exact: true }).waitFor()
      await page.getByText('Upload a file', { exact: true }).waitFor()
    }
    assert.equal(actions.includes('voice'), false, 'No server TTS requests during questions, follow-ups or replay')
    checked.push({ width, theme })
    console.log(`PASS live audio ${width} ${theme}`)
    await context.close()
  }
  assert.deepEqual(errors, [])
  writeFileSync(`${out}/report.json`, JSON.stringify({ checked, errors, network: 'mocked; browser speech synthesis fixture; real microphone recording and decoding' }, null, 2))
} finally { await browser.close() }
