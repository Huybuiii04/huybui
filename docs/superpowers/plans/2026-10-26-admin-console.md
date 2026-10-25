# Admin Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bảng quản trị 2 lớp (đăng nhập app + mật khẩu admin) với dashboard, chi tiết từng user (đề đã làm / đề còn lại), quản lý đề bài, từ vựng, job AI và nhật ký admin.

**Architecture:** Đọc dữ liệu admin qua PostgREST (RLS `private.is_admin()`); mọi thao tác ghi qua Edge Function `admin-data` (service_role + token HMAC) để có audit log. Token do `admin-session` cấp sau khi kiểm tra mật khẩu trong secret `ADMIN_PASSWORD`.

**Tech Stack:** React 19 + TypeScript + Vite · Supabase (Postgres/RLS/Edge Functions/Deno) · node:test · Playwright · Vercel

**Spec:** `docs/superpowers/specs/2026-10-26-admin-console-design.md`

---

### Task 1: Ký/xác minh token quản trị

**Files:**
- Create: `supabase/functions/_shared/adminSession.ts`
- Create: `supabase/functions/_shared/tests/adminSession.test.ts`

- [ ] **Step 1: Viết test đỏ**

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { signAdminToken, verifyAdminToken } from "../adminSession.ts";

const secret = "admin-password-123";
const future = Date.now() + 60_000;

describe("admin session token", () => {
  it("round-trips a token for the same user", async () => {
    const token = await signAdminToken("user-1", future, secret);
    assert.equal(await verifyAdminToken(token, "user-1", future + 1000, secret), true);
  });

  it("rejects a token issued for another user", async () => {
    const token = await signAdminToken("user-1", future, secret);
    assert.equal(await verifyAdminToken(token, "user-2", future + 1000, secret), false);
  });

  it("rejects an expired token", async () => {
    const token = await signAdminToken("user-1", future, secret);
    assert.equal(await verifyAdminToken(token, "user-1", future - 1000, secret), false);
  });

  it("rejects a tampered signature", async () => {
    const token = await signAdminToken("user-1", future, secret);
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    assert.equal(await verifyAdminToken(tampered, "user-1", future + 1000, secret), false);
  });

  it("rejects a token signed with another secret", async () => {
    const token = await signAdminToken("user-1", future, "other-secret");
    assert.equal(await verifyAdminToken(token, "user-1", future + 1000, secret), false);
  });
});
```

- [ ] **Step 2: Chạy test → FAIL** (`Cannot find module '../adminSession.ts'`)

- [ ] **Step 3: Implement**

```typescript
// supabase/functions/_shared/adminSession.ts
import { constantTimeEqual } from "./security.ts";

const encoder = new TextEncoder();

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64Url(new Uint8Array(signature));
}

/** Token = base64url(userId|expiresAt) + "." + base64url(HMAC). */
export async function signAdminToken(userId: string, expiresAt: number, secret: string): Promise<string> {
  const payload = base64Url(encoder.encode(`${userId}|${expiresAt}`));
  return `${payload}.${await hmac(payload, secret)}`;
}

/** Kiểm tra chữ ký + hạn + user khớp. */
export async function verifyAdminToken(token: string, userId: string, now: number, secret: string): Promise<boolean> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = await hmac(payload, secret);
  if (!(await constantTimeEqual(expected, signature))) return false;
  let decoded: string;
  try {
    const binary = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    decoded = new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)));
  } catch {
    return false;
  }
  const [tokenUser, expiresRaw] = decoded.split("|");
  const expiresAt = Number(expiresRaw);
  if (tokenUser !== userId) return false;
  if (!Number.isFinite(expiresAt)) return false;
  return expiresAt > now;
}
```

- [ ] **Step 4: Chạy test → PASS (5/5)**

- [ ] **Step 5: Chạy `npm run test:edge` → PASS**

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/_shared/adminSession.ts supabase/functions/_shared/tests/adminSession.test.ts
git commit -m "feat(admin): ky va xac minh token quan tri"
```

---

### Task 2: Edge Function `admin-session`

**Files:**
- Modify: `supabase/functions/_shared/auth.ts` (thêm `requireAdminToken`)
- Create: `supabase/functions/admin-session/index.ts`
- Modify: `supabase/scripts/deploy-functions.mjs`

- [ ] **Step 1: Thêm `requireAdminToken` vào `_shared/auth.ts`**

```typescript
import { verifyAdminToken } from "./adminSession.ts";

/** Token quản trị (lớp 2): header x-admin-token, ký bằng ADMIN_PASSWORD. */
export async function requireAdminToken(request: Request, context: AuthenticatedContext): Promise<void> {
  const secret = getEnv("ADMIN_PASSWORD");
  if (!secret) throw new AppError(503, "server_misconfigured", "The admin password is not configured");
  const token = request.headers.get("x-admin-token");
  if (!token) throw new AppError(401, "invalid_admin_token", "The admin session token is missing");
  const ok = await verifyAdminToken(token, context.userId, Date.now(), secret);
  if (!ok) throw new AppError(401, "invalid_admin_token", "The admin session token is invalid or expired");
}
```

- [ ] **Step 2: Tạo `supabase/functions/admin-session/index.ts`**

```typescript
import { requireAdmin } from "../_shared/auth.ts";
import { signAdminToken } from "../_shared/adminSession.ts";
import { AppError, errorResponse, getEnv, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { constantTimeEqual } from "../_shared/security.ts";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAdmin(request);
    const secret = getEnv("ADMIN_PASSWORD");
    if (!secret) throw new AppError(503, "server_misconfigured", "The admin password is not configured");
    const body = await readJsonBody(request) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || !(await constantTimeEqual(password, secret))) {
      throw new AppError(401, "invalid_admin_password", "The admin password is incorrect");
    }
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const token = await signAdminToken(context.userId, expiresAt, secret);
    return jsonResponse(request, 200, { token, expiresAt }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
```

- [ ] **Step 3: Thêm vào `deploy-functions.mjs`**

- Thêm `'admin-session'` vào mảng `FUNCTIONS`.
- Thêm `['ADMIN_PASSWORD', env.ADMIN_PASSWORD]` vào `secretValues`.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/_shared/auth.ts supabase/functions/admin-session/index.ts supabase/scripts/deploy-functions.mjs
git commit -m "feat(admin): edge function admin-session cap token quan tri"
```

---

### Task 3: Edge Function `admin-data`

**Files:**
- Create: `supabase/functions/admin-data/index.ts`

Action (POST body `{ action, ... }`):
- `dashboard` → số liệu tổng quan.
- `delete_essay` → xoá bài viết (service_role) + audit.
- `prompt_set_status` → ẩn/hiện đề + audit.
- `vocabulary_update` / `vocabulary_delete` / `vocabulary_create` + audit.
- `job_retry` / `jobs_retry_failed` → đặt lại job `failed` về `queued` + audit.

Mọi action: `requireAdmin` + `requireAdminToken` + ghi `admin_audit_logs`.

- [ ] **Step 1: Implement `admin-data/index.ts`**

Dùng `context.service` (service_role). Dashboard gộp:
- `user_access` đếm tổng/suspended/admin.
- `profiles` đếm user mới 7 ngày.
- `essays` đếm tổng / 7 ngày / distinct `prompt_text`.
- `ai_jobs` đếm theo status.
- `ai_usage` tổng token + cost 30 ngày.
- `essay_revisions` đếm lần chấm.

- [ ] **Step 2: Deploy function**

```bash
npm run db:deploy
```

Expected: `admin-data` và `admin-session` lên production.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/admin-data/index.ts
git commit -m "feat(admin): edge function admin-data cho thao tac ghi"
```

---

### Task 4: Migration 019 — RLS admin đọc

**Files:**
- Create: `supabase/migrations/019_admin_ops.sql`

- [ ] **Step 1: Viết migration**

```sql
-- 019_admin_ops.sql — admin đọc dữ liệu người dùng để theo dõi hoạt động.
begin;

drop policy if exists essays_read_admin on public.essays;
create policy essays_read_admin on public.essays
  for select to authenticated
  using (private.is_admin());

drop policy if exists study_cards_read_admin on public.study_cards;
create policy study_cards_read_admin on public.study_cards
  for select to authenticated
  using (private.is_admin());

drop policy if exists error_logs_read_admin on public.error_logs;
create policy error_logs_read_admin on public.error_logs
  for select to authenticated
  using (private.is_admin());

drop policy if exists essay_features_read_admin on public.essay_features;
create policy essay_features_read_admin on public.essay_features
  for select to authenticated
  using (private.is_admin());

drop policy if exists admin_audit_logs_read_admin on public.admin_audit_logs;
create policy admin_audit_logs_read_admin on public.admin_audit_logs
  for select to authenticated
  using (private.is_admin());

commit;
```

- [ ] **Step 2: Áp dụng `npm run db:migrate`**

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/019_admin_ops.sql
git commit -m "feat(db): RLS cho admin doc bai viet, the tu, log loi, nhat ky"
```

---

### Task 5: Lớp logic + repository phía frontend

**Files:**
- Create: `src/lib/adminLogic.ts`
- Create: `tests/admin.test.ts`
- Create: `src/lib/adminSession.ts`
- Create: `src/lib/adminRepository.ts`

- [ ] **Step 1: Test đỏ cho `adminLogic.ts`**

```typescript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { groupDonePrompts, remainingPrompts, coveragePercent, shortPrompt } from '../src/lib/adminLogic.ts'

const prompts = [
  { slug: 't2-a', task: 'task2', text: 'Some people think...' },
  { slug: 't2-b', task: 'task2', text: 'Agree or disagree...' },
  { slug: 't1-a', task: 'academic_task1', text: 'The chart shows...' },
]

const essays = [
  { id: 'e1', prompt_text: 'Some people think...', task_type: 'task2', created_at: '2026-10-20T00:00:00Z' },
  { id: 'e2', prompt_text: 'Some people think...', task_type: 'task2', created_at: '2026-10-21T00:00:00Z' },
]

test('done prompts group by prompt text with a count', () => {
  const groups = groupDonePrompts(essays, prompts)
  assert.equal(groups.length, 1)
  assert.equal(groups[0].slug, 't2-a')
  assert.equal(groups[0].count, 2)
  assert.equal(groups[0].lastAt, '2026-10-21T00:00:00Z')
})

test('remaining prompts exclude what the user already did', () => {
  const remaining = remainingPrompts(essays, prompts, 'task2')
  assert.deepEqual(remaining.map(item => item.slug), ['t2-b'])
})

test('coverage percent counts done prompts over the task total', () => {
  assert.equal(coveragePercent(essays, prompts, 'task2'), 50)
  assert.equal(coveragePercent(essays, prompts, 'academic_task1'), 0)
})

test('a long prompt is shortened for display', () => {
  assert.equal(shortPrompt('a'.repeat(200), 40).length, 41)
})
```

- [ ] **Step 2: Chạy test → FAIL**

- [ ] **Step 3: Implement `src/lib/adminLogic.ts`**

```typescript
// Logic thuần cho bảng quản trị: gom đề đã làm, tính đề còn lại và độ phủ.

export type AdminPrompt = { slug: string; task: string; text: string; titleVi?: string; titleEn?: string; status?: string }
export type AdminEssay = { id: string; prompt_text: string; task_type: string; created_at: string }

export type DonePrompt = {
  slug: string
  task: string
  text: string
  count: number
  lastAt: string
  essays: AdminEssay[]
}

function norm(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

/** Gom bài viết theo đề (khớp prompt_text với prompts.text). */
export function groupDonePrompts(essays: AdminEssay[], prompts: AdminPrompt[]): DonePrompt[] {
  const byText = new Map(prompts.map(prompt => [norm(prompt.text), prompt]))
  const groups = new Map<string, DonePrompt>()
  for (const essay of essays) {
    const key = norm(essay.prompt_text)
    if (!key) continue
    const prompt = byText.get(key)
    const slug = prompt?.slug ?? `custom:${key.slice(0, 40)}`
    const existing = groups.get(slug)
    if (existing) {
      existing.count += 1
      existing.essays.push(essay)
      if (essay.created_at > existing.lastAt) existing.lastAt = essay.created_at
    } else {
      groups.set(slug, {
        slug,
        task: prompt?.task ?? essay.task_type,
        text: essay.prompt_text,
        count: 1,
        lastAt: essay.created_at,
        essays: [essay],
      })
    }
  }
  return [...groups.values()].sort((left, right) => right.count - left.count || (right.lastAt > left.lastAt ? 1 : -1))
}

/** Các đề published của một loại bài mà user chưa làm. */
export function remainingPrompts(essays: AdminEssay[], prompts: AdminPrompt[], task: string): AdminPrompt[] {
  const done = new Set(essays.filter(essay => essay.task_type === task).map(essay => norm(essay.prompt_text)))
  return prompts.filter(prompt => prompt.task === task && prompt.status !== 'hidden' && !done.has(norm(prompt.text)))
}

/** Phần trăm đề của một loại bài mà user đã làm. */
export function coveragePercent(essays: AdminEssay[], prompts: AdminPrompt[], task: string): number {
  const total = prompts.filter(prompt => prompt.task === task && prompt.status !== 'hidden').length
  if (!total) return 0
  const done = remainingPrompts(essays, prompts, task).length
  return Math.round(((total - done) / total) * 100)
}

/** Cắt chuỗi dài để hiển thị. */
export function shortPrompt(text: string, max = 80): string {
  const clean = text.trim().replace(/\s+/g, ' ')
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}
```

- [ ] **Step 4: Chạy test → PASS (4/4)**

- [ ] **Step 5: Implement `src/lib/adminSession.ts`**

```typescript
// Phiên quản trị lớp 2: token HMAC lưu trong sessionStorage.
import { supabase } from './supabase'

const STORAGE_KEY = 'ielts-admin-session'
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000

export type AdminSession = { token: string; expiresAt: number }

export function getAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminSession
    if (!parsed.token || parsed.expiresAt <= Date.now()) { clearAdminSession(); return null }
    return parsed
  } catch {
    return null
  }
}

export function clearAdminSession(): void {
  try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* storage bị chặn: phiên chỉ sống trong RAM */ }
}

export async function unlockAdmin(password: string): Promise<AdminSession | null> {
  const { data, error } = await supabase.functions.invoke('admin-session', { body: { password } })
  if (error || !data) return null
  const session = data as AdminSession
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session)) } catch { /* bỏ qua */ }
  return session
}

/** Gọi admin-data kèm token quản trị. */
export async function adminAction<T>(action: string, payload: Record<string, unknown> = {}): Promise<{ ok: true; value: T } | { ok: false; code: string }> {
  const session = getAdminSession()
  if (!session) return { ok: false, code: 'invalid_admin_token' }
  try {
    const response = await fetch(`${(import.meta.env.VITE_SUPABASE_URL as string)}/functions/v1/admin-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ''}`,
        'x-admin-token': session.token,
      },
      body: JSON.stringify({ action, ...payload }),
    })
    if (!response.ok) return { ok: false, code: response.status === 401 ? 'invalid_admin_token' : 'unknown' }
    return { ok: true, value: (await response.json()) as T }
  } catch {
    return { ok: false, code: 'unknown' }
  }
}
```

- [ ] **Step 6: Implement `src/lib/adminRepository.ts`** — đọc users, essays, cards, error logs, audit logs, prompts, vocabulary qua PostgREST + `adminAction` cho thao tác ghi.

- [ ] **Step 7: Chạy `npm test` → PASS**

- [ ] **Step 8: Commit**

```bash
git add src/lib/adminLogic.ts src/lib/adminSession.ts src/lib/adminRepository.ts tests/admin.test.ts package.json
git commit -m "feat(admin): logic, phien quan tri va repository"
```

---

### Task 6: Giao diện bảng quản trị

**Files:**
- Create: `src/components/AdminGate.tsx`
- Create: `src/pages/admin/DashboardTab.tsx`, `UsersTab.tsx`, `UserDetail.tsx`, `PromptsTab.tsx`, `VocabularyTab.tsx`, `JobsTab.tsx`, `AuditTab.tsx`
- Modify: `src/pages/Admin.tsx` (vỏ trang + tab + gate)

- [ ] **Step 1: `AdminGate.tsx`** — đọc role của chính mình (`user_access` policy `user_access_select_own`); không phải admin → Notice "không có quyền"; là admin mà chưa có token → form nhập mật khẩu quản trị.

- [ ] **Step 2: `src/pages/Admin.tsx`** — bọc `AdminGate`, giữ 4 tab cũ (nội dung, token) và thêm: tổng quan, người dùng, đề bài, từ vựng, AI jobs, nhật ký.

- [ ] **Step 3: Các tab** theo spec; mỗi tab tự load dữ liệu, có trạng thái loading/empty/error.

- [ ] **Step 4: CSS** — dùng lại token sẵn có (`.panel`, `.usage-table`, `.usage-row`, `.badge`, `.tabs`, `.stats-grid`); thêm `.admin-detail` / `.admin-prompt-list` nếu cần.

- [ ] **Step 5: `npm run build` → exit 0; `npm test` → PASS**

- [ ] **Step 6: Commit**

```bash
git add src/components/AdminGate.tsx src/pages/Admin.tsx src/pages/admin src/styles.css
git commit -m "feat(admin): bang quan tri voi dashboard va chi tiet nguoi dung"
```

---

### Task 7: Tạo tài khoản admin

- [ ] **Step 1: Tạo user + cấp quyền**

```bash
node --env-file-if-exists=.env.local scripts/create-admin.mjs
```

Script: dùng service key gọi `supabase.auth.admin.createUser({ email: 'admin@gmail.com', password: 'admin123', email_confirm: true })`, sau đó `update user_access set role='admin'` và `profiles.display_name='Admin'`. Idempotent (nếu user đã tồn tại → chỉ cập nhật quyền).

- [ ] **Step 2: Commit `scripts/create-admin.mjs`**

---

### Task 8: Test browser bảng quản trị

**Files:**
- Create: `tests/admin-console.mjs`

- [ ] **Step 1: Viết test** — đăng nhập `admin@gmail.com`, vào `/admin`, nhập mật khẩu quản trị, kiểm tra dashboard có số liệu, tab người dùng có dữ liệu, mở chi tiết một user thấy "đề đã làm" và "đề còn lại".

- [ ] **Step 2: Chạy với dev server → PASS**

- [ ] **Step 3: Commit**

---

### Task 9: Deploy

- [ ] **Step 1: `npm run db:migrate`** (019)
- [ ] **Step 2: `npm run db:deploy`** (admin-session, admin-data + secret ADMIN_PASSWORD)
- [ ] **Step 3: `git push origin main`** (kèm fix theme của user)
- [ ] **Step 4: `npx vercel --prod --yes`**
- [ ] **Step 5: Verify** — `TEST_URL=https://huybui.vercel.app node tests/production.mjs` + `TEST_URL=https://huybui.vercel.app node --env-file-if-exists=.env.test tests/admin-console.mjs`
