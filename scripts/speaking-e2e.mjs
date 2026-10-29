/**
 * E2E: tao user test -> prepare -> upload audio -> commit -> cho worker chay -> doc ket qua.
 * Chay: node --env-file-if-exists=.env.local scripts/speaking-e2e.mjs
 */
import fs from 'node:fs';

const env = {};
for (const line of fs.readFileSync('D:/ielts/.env.local', 'utf8').split(/\r?\n/)) {
  const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}

const URL_BASE = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
// Admin API can JWT `service_role`; khoa `sb_secret_` moi khong phai JWT nen thu tu uu tien key JWT.
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY;
const FUNCTIONS = `${URL_BASE}/functions/v1`;
const AUDIO = 'C:/Users/ACER/AppData/Local/Temp/opencode/speech-test.wav';

const EMAIL = 'speaking-e2e@example.com';
const PASSWORD = 'SpeakingE2E-2026!';

const log = (...args) => console.log('[e2e]', ...args);

async function api(path, { method = 'GET', body, token, headers = {} } = {}) {
  const response = await fetch(`${URL_BASE}${path}`, {
    method,
    headers: {
      apikey: token ?? ANON,
      Authorization: `Bearer ${token ?? SERVICE}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* raw */ }
  return { status: response.status, json, text };
}

async function ensureUser() {
  const existing = await signIn();
  if (existing) {
    log('user test da ton tai');
    return existing;
  }
  const created = await api('/auth/v1/admin/users', {
    method: 'POST',
    body: { email: EMAIL, password: PASSWORD, email_confirm: true },
  });
  if (created.status !== 200 && created.status !== 201) {
    throw new Error(`tao user that bai: ${created.status} ${created.text}`);
  }
  log('tao user test moi');
  return signIn();
}

async function signIn() {
  try {
    const response = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const json = await response.json();
    return json.access_token ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const token = await ensureUser();
  if (!token) throw new Error('dang nhap that bai');
  log('dang nhap OK');

  // --- 1) prepare ---
  const prepared = await api('/functions/v1/submit-speaking', {
    method: 'POST',
    token,
    body: { action: 'prepare', mode: 'part-1', question: 'Where do you live?', feedbackLocale: 'vi' },
  });
  if (prepared.status !== 201) throw new Error(`prepare that bai: ${prepared.status} ${prepared.text}`);
  const attempt = prepared.json;
  log('prepare OK — attempt', attempt.attemptId, '| turns:', attempt.turns.length);
  const turn = attempt.turns[0];
  log('  turn', turn.turnId, '| part', turn.part, '| max', turn.maxDurationMs, 'ms');
  log('  prompt:', turn.promptText);

  // --- 2) upload ---
  const bytes = fs.readFileSync(AUDIO);
  const upload = await fetch(turn.uploadUrl, {
    method: 'PUT',
    headers: { 'content-type': 'audio/wav' },
    body: bytes,
  });
  log('upload ->', upload.status);
  if (!upload.ok) throw new Error(`upload that bai: ${upload.status} ${await upload.text()}`);

  // --- 3) commit ---
  const committed = await api('/functions/v1/submit-speaking', {
    method: 'POST',
    token,
    body: {
      action: 'commit',
      attemptId: attempt.attemptId,
      turnId: turn.turnId,
      mimeType: 'audio/wav',
      byteSize: bytes.length,
      durationMs: 7000,
    },
  });
  log('commit ->', committed.status, JSON.stringify(committed.json));
  if (committed.status !== 202) throw new Error(`commit that bai: ${committed.text}`);

  // --- 4) cho worker chay (cron 30s) ---
  log('cho worker process-ai-jobs chay (cron 30s)...');
  let result = null;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const status = await api(
      `/rest/v1/speaking_attempts?select=status,error_code&id=eq.${attempt.attemptId}`,
      { token: SERVICE },
    );
    const row = status.json?.[0];
    log(`  [${(i + 1) * 5}s] status =`, row?.status, row?.error_code ?? '');
    if (row?.status === 'succeeded') { result = row; break; }
    if (row?.status === 'failed') throw new Error(`job that bai: ${row.error_code}`);
  }
  if (!result) throw new Error('het thoi gian cho worker');

  // --- 5) doc ket qua ---
  const rows = await api(
    `/rest/v1/speaking_results?select=*&attempt_id=eq.${attempt.attemptId}`,
    { token: SERVICE },
  );
  const row = rows.json?.[0];
  if (!row) throw new Error('khong co speaking_results');
  console.log('\n================ KET QUA ================');
  console.log('band tong       :', row.overall_display, `(raw ${row.overall_raw})`);
  console.log('fluency        :', row.fluency);
  console.log('lexical        :', row.lexical_resource);
  console.log('grammar        :', row.grammatical_range);
  console.log('pronunciation  :', row.pronunciation);
  console.log('model          :', row.model);
  console.log('transcript     :', String(row.transcript).slice(0, 400));
  const fb = row.feedback ?? {};
  console.log('\nturns:', fb.turns?.length ?? 0);
  for (const t of fb.turns ?? []) {
    console.log(`  turn ${t.turnId.slice(0, 8)}: ${t.summary?.slice(0, 160)}`);
    for (const cr of t.criteria ?? []) {
      console.log(`    - ${cr.criterion}: ${cr.score} | ${cr.rationale?.slice(0, 120)}`);
      if (cr.evidence?.length) console.log(`      evidence: ${JSON.stringify(cr.evidence).slice(0, 200)}`);
    }
  }
  console.log('\noverall:', fb.overall?.summary?.slice(0, 400));
  console.log('priority actions:', JSON.stringify(fb.overall?.priority_actions ?? []).slice(0, 400));
  console.log('audio analysis:', JSON.stringify(row.audio_analysis).slice(0, 500));

  // --- 6) audio da duoc xoa chua? ---
  const objects = await api(
    `/storage/v1/object/list/speaking-audio/${attempt.attemptId}`,
    { token: SERVICE },
  );
  console.log('\nobject con lai trong bucket sau khi cham:', Array.isArray(objects.json) ? objects.json.length : objects.text);
}

main().catch((error) => {
  console.error('\n[E2E FAIL]', error.message);
  process.exit(1);
});
