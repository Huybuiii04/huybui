const url = process.env.SUPABASE_URL ?? 'https://fjlyjaomuxotqqjvugtv.supabase.co'
const secret = process.env.SUPABASE_SECRET_KEY
if (!secret) {
  console.error('Thiếu SUPABASE_SECRET_KEY')
  process.exit(1)
}

const stamp = Date.now()
const password = `Aa1!${stamp}`
const emailA = `rls-a-${stamp}@example.com`
const emailB = `rls-b-${stamp}@example.com`

let failures = 0
function check(label, ok, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` :: ${detail}` : ''}`)
}

async function api(path, { method = 'GET', body, token, anon = false, headers = {} } = {}) {
  // Header `apikey` luôn phải là key của project (publishable/anon hoặc secret).
  // JWT của user KHÔNG được dùng làm apikey → API trả "Invalid API key".
  const projectKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? secret
  // anon → publishable key (đóng vai role anon); user token → publishable key;
  // admin (không token) → secret key.
  const key = anon || token ? projectKey : secret
  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      apikey: key,
      // publishable key KHÔNG phải JWT → không gửi qua Authorization
      ...(anon ? {} : { Authorization: `Bearer ${token ?? secret}` }),
      'Content-Type': 'application/json',
      // Không có Prefer này PostgREST trả 204/rỗng cho INSERT/UPDATE/DELETE
      ...(method === 'GET' ? {} : { Prefer: 'return=representation' }),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: response.status, data }
}

async function createUser(email) {
  const result = await api('/auth/v1/admin/users', {
    method: 'POST',
    body: { email, password, email_confirm: true }
  })
  if (result.status >= 400) throw new Error(`createUser ${email}: ${JSON.stringify(result.data)}`)
  return result.data.id
}

async function signIn(email) {
  const result = await api('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password }
  })
  if (result.status >= 400) throw new Error(`signIn ${email}: ${JSON.stringify(result.data)}`)
  return result.data.access_token
}

let idA = null
let idB = null
let tokenA = null

try {
  idA = await createUser(emailA)
  idB = await createUser(emailB)
  tokenA = await signIn(emailA)
  const tokenB = await signIn(emailB)

  // Trigger đã tạo profile + user_access
  const profileA = await api('/rest/v1/profiles?select=id,display_name', { token: tokenA })
  check('profile tự tạo khi đăng ký', profileA.status === 200 && profileA.data?.length === 1, JSON.stringify(profileA.data))

  const accessA = await api('/rest/v1/user_access?select=user_id,role,status', { token: tokenA })
  check('user_access mặc định role=user/active', accessA.data?.[0]?.role === 'user' && accessA.data?.[0]?.status === 'active', JSON.stringify(accessA.data))

  // A tạo dữ liệu riêng
  const essay = await api('/rest/v1/essays', {
    method: 'POST', token: tokenA,
    body: { user_id: idA, title: 'RLS test essay', task_type: 'task2', body_text: 'Hello world' }
  })
  // POST trả về mảng các dòng đã insert
  const essayId = essay.data?.[0]?.id
  check('A tạo được essay của mình', essay.status === 201 && Boolean(essayId), JSON.stringify(essay.data))

  const card = await api('/rest/v1/study_cards', {
    method: 'POST', token: tokenA,
    body: { user_id: idA, kind: 'vocabulary', front: 'cohesion', back: 'mạch lạc', dedupe_key: 'cohesion::vocabulary' }
  })
  check('A tạo được thẻ học của mình', card.status === 201 && Boolean(card.data?.[0]?.id), JSON.stringify(card.data))

  // B không đọc được dữ liệu A
  const bSeesEssays = await api('/rest/v1/essays?select=id,title', { token: tokenB })
  check('B không thấy essay của A', bSeesEssays.status === 200 && bSeesEssays.data.length === 0, JSON.stringify(bSeesEssays.data))

  const bSeesCards = await api('/rest/v1/study_cards?select=id,front', { token: tokenB })
  check('B không thấy thẻ của A', bSeesCards.status === 200 && bSeesCards.data.length === 0, JSON.stringify(bSeesCards.data))

  // B không sửa được essay của A kể cả khi biết UUID
  const bTriesUpdate = await api(`/rest/v1/essays?id=eq.${essayId}`, {
    method: 'PATCH', token: tokenB, body: { title: 'hacked' }
  })
  check('B không sửa được essay của A', bTriesUpdate.status === 200 && bTriesUpdate.data?.length === 0, JSON.stringify(bTriesUpdate.data))

  // Anon không đọc được bảng user (đã revoke SELECT → 401/403)
  const anonSeesEssays = await api('/rest/v1/essays?select=id', { anon: true })
  check('anon không đọc được essays', anonSeesEssays.status === 401 || anonSeesEssays.status === 403, `status ${anonSeesEssays.status} ${JSON.stringify(anonSeesEssays.data)}`)

  // Anon đọc được nội dung published
  const anonContent = await api('/rest/v1/content_entries?select=kind,slug&limit=3', { anon: true })
  check('anon đọc được content published', anonContent.status === 200, `status ${anonContent.status}`)

  // RPC save_draft của A hoạt động, của B không đụng được bản của A
  const saveA = await api('/rest/v1/rpc/save_draft', {
    method: 'POST', token: tokenA, body: { p_task_type: 'task2', p_title: 'draft via rpc', p_body_text: 'text' }
  })
  check('RPC save_draft tạo nháp cho A', saveA.status === 200 && saveA.data?.essay_id, JSON.stringify(saveA.data))

  if (saveA.data?.essay_id) {
    const version = saveA.data.draft_version
    const conflict = await api('/rest/v1/rpc/save_draft', {
      method: 'POST', token: tokenA,
      body: { p_essay_id: saveA.data.essay_id, p_expected_version: version - 1, p_task_type: 'task2', p_title: 'stale' }
    })
    check('RPC save_draft trả 409 khi version cũ', conflict.status === 409, `status ${conflict.status} ${JSON.stringify(conflict.data)}`)

    const bTriesSave = await api('/rest/v1/rpc/save_draft', {
      method: 'POST', token: tokenB,
      body: { p_essay_id: saveA.data.essay_id, p_expected_version: version, p_task_type: 'task2', p_title: 'B overwrite' }
    })
    check('B không ghi được vào essay của A', bTriesSave.status >= 400, `status ${bTriesSave.status}`)
  }
} finally {
  // Dọn dẹp: luôn xoá test user, kể cả khi script lỗi giữa chừng
  if (idA && tokenA) {
    await api(`/rest/v1/essays?user_id=eq.${idA}`, { method: 'DELETE', token: tokenA })
    await api(`/rest/v1/study_cards?user_id=eq.${idA}`, { method: 'DELETE', token: tokenA })
  }
  if (idA) await api(`/auth/v1/admin/users/${idA}`, { method: 'DELETE' })
  if (idB) await api(`/auth/v1/admin/users/${idB}`, { method: 'DELETE' })
}

console.log(failures ? `\n${failures} kiểm tra RLS thất bại.` : '\nTất cả kiểm tra RLS đạt.')
process.exit(failures ? 1 : 0)
