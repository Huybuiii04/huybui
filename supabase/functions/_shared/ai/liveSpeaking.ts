/**
 * Logic thuần cho chế độ "Luyện nói trực tiếp" (live speaking).
 *
 * File này KHÔNG gọi mạng, chỉ dựng kế hoạch lượt hỏi, luật thời gian, token phiên
 * và hợp đồng JSON của "AI examiner" — để test được bằng `node --test`.
 *
 * Mô hình lượt (giống hệt module Speaking hiện có):
 *   1 turn = 1 phần thi = 1 recording liên tục.
 *   Part 1: hỏi lần lượt các câu của part, người học trả lời liên tục.
 *   Part 2: 1 cue card + 60s chuẩn bị + tối đa 2 phút nói.
 *   Part 3: hỏi lần lượt các câu của chủ đề A rồi chủ đề B.
 */

import type { SpeakingMode, SpeakingPart } from "../schemas.ts";

/** Token phiên live sống tối đa 2 giờ — đủ cho một bài thi, đủ ngắn để lộ rò rỉ là vô hại. */
export const LIVE_TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

/** Trần chi phí/thời lượng của một phiên live. */
export const LIVE_LIMITS = {
  /** Một phiên live không được kéo dài quá 30 phút. */
  maxDurationMs: 30 * 60 * 1000,
  /** Số phiên live được mở trong một ngày. */
  maxSessionsPerDay: 10,
  /** Số lần gọi "AI examiner" (brain) trong một phiên. */
  maxBrainCalls: 40,
  /** Số lần tổng hợp giọng trong một phiên. */
  maxVoiceCalls: 60,
  /** Số câu hỏi tối đa của một phần. */
  maxQuestionsPerPart: 12,
} as const;

export type LiveTranscriptEntry = {
  role: "examiner" | "candidate";
  text: string;
  /** ms tính từ lúc mở phiên. */
  at: number;
};

export type LiveCueCard = {
  topic: string;
  bullets: string[];
  time_limit_seconds: number;
  explain?: string;
};

export type LiveTurnInput = {
  turnId: string;
  orderIndex: number;
  part: SpeakingPart;
  promptText: string;
  questions: string[];
  cueCard: LiveCueCard | null;
};

/** Một câu hỏi cụ thể mà giám khảo sẽ đọc ra. */
export type LiveQuestionStep = {
  index: number;
  text: string;
  /** true nếu đây là phần đọc cue card của Part 2. */
  isCueCard: boolean;
};

export type LiveTurnPlan = {
  turnId: string;
  orderIndex: number;
  part: SpeakingPart;
  promptText: string;
  questions: string[];
  cueCard: LiveCueCard | null;
  steps: LiveQuestionStep[];
  /** Thời gian chuẩn bị (ms) trước khi bắt đầu nói. */
  prepMs: number;
  /** Trần thời lượng của lượt nói (ms). */
  maxAnswerMs: number;
};

export type LiveTiming = {
  prepMs: number;
  maxAnswerMs: number;
};

/**
 * Luật thời gian theo từng phần.
 * - Part 1: không chuẩn bị, mỗi câu trả lời ≤ 45s.
 * - Part 2: 60s chuẩn bị, nói tối đa 2 phút (không tự kết thúc vì người học dừng lại).
 * - Part 3: không chuẩn bị, mỗi câu trả lời ≤ 90s.
 */
export function partTiming(part: SpeakingPart): LiveTiming {
  if (part === "part-2") return { prepMs: 60_000, maxAnswerMs: 120_000 };
  if (part === "part-3") return { prepMs: 0, maxAnswerMs: 90_000 };
  return { prepMs: 0, maxAnswerMs: 45_000 };
}

/** Câu hỏi đầu tiên của Part 2 (đọc cue card) — có dạng dài, hỏi cả phần giới thiệu. */
export function cueCardScript(cueCard: LiveCueCard | null): string {
  if (!cueCard) return "Here is your topic.";
  const bullets = cueCard.bullets.length ? cueCard.bullets.join(". ") : "";
  return `Here is your topic: ${cueCard.topic}. ${bullets ? `${bullets}. ` : ""}You have one minute to prepare, and then you have up to two minutes to talk about it.`;
}

/**
 * Làm sạch câu hỏi để đọc lên tiếng.
 *
 * Đề Cambridge ghi kèm các biến thể trong ngoặc vuông, ví dụ
 * "Is it important to you to eat healthy food? [Why?/Why not?]" — đọc nguyên văn
 * sẽ thành câu vô nghĩa, nên phần trong ngoặc bị bỏ đi.
 */
export function speakableQuestion(text: string): string {
  return (text ?? "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.?!])/g, "$1")
    .replace(/[\s:;,-]+$/, "")
    .trim();
}

/**
 * Mở rộng các turn của `speaking_turns` thành danh sách câu hỏi tuần tự mà
 * giám khảo sẽ đọc. Part 2 chỉ có 1 bước (đọc cue card), Part 1/3 có 1 bước
 * cho mỗi câu hỏi.
 */
export function buildLiveTurnPlan(turns: LiveTurnInput[]): LiveTurnPlan[] {
  return turns.map((turn) => {
    const timing = partTiming(turn.part);
    const steps: LiveQuestionStep[] = [];
    if (turn.part === "part-2") {
      steps.push({ index: 0, text: cueCardScript(turn.cueCard), isCueCard: true });
    } else {
      const questions = turn.questions.filter((question) => question.trim().length > 0);
      const source = questions.length ? questions : [turn.promptText];
      source.slice(0, LIVE_LIMITS.maxQuestionsPerPart).forEach((question, index) => {
        const text = speakableQuestion(question);
        steps.push({ index, text: text || "Could you tell me more?", isCueCard: false });
      });
    }
    return {
      turnId: turn.turnId,
      orderIndex: turn.orderIndex,
      part: turn.part,
      promptText: turn.promptText,
      questions: turn.questions,
      cueCard: turn.cueCard,
      steps,
      prepMs: timing.prepMs,
      maxAnswerMs: timing.maxAnswerMs,
    };
  });
}

/** Tổng số câu hỏi của cả phiên. */
export function countQuestions(plan: LiveTurnPlan[]): number {
  return plan.reduce((total, turn) => total + turn.steps.length, 0);
}

/** Bước tiếp theo sau `index` trong cùng một phần (null = hết câu của phần). */
export function nextStepIndex(plan: LiveTurnPlan[], turnIndex: number, stepIndex: number): number | null {
  const turn = plan[turnIndex];
  if (!turn) return null;
  const next = stepIndex + 1;
  return next < turn.steps.length ? next : null;
}

/** Câu hỏi cuối cùng đã hỏi (dùng để nhắc model không hỏi lại). */
export function askedQuestions(plan: LiveTurnPlan[], turnIndex: number, stepIndex: number): string[] {
  const turn = plan[turnIndex];
  if (!turn) return [];
  return turn.steps.slice(0, stepIndex + 1).map((step) => step.text);
}

/** Transcript dạng chuỗi để đưa cho model. */
export function transcriptToText(entries: LiveTranscriptEntry[]): string {
  return entries
    .map((entry) => `${entry.role === "examiner" ? "Examiner" : "Candidate"}: ${entry.text}`)
    .join("\n");
}

/** Thêm một lượt vào transcript, bỏ qua lượt rỗng. */
export function appendTranscript(
  entries: LiveTranscriptEntry[],
  entry: LiveTranscriptEntry,
): LiveTranscriptEntry[] {
  if (!entry.text.trim()) return entries;
  return [...entries, entry];
}

// ---------------------------------------------------------------- token phiên

export type LiveTokenPayload = {
  sid: string;
  uid: string;
  exp: number;
};

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return new Uint8Array(signature);
}

/** Ký token phiên: `base64(payload).base64(hmac)`. */
export async function signLiveToken(
  secret: string,
  payload: LiveTokenPayload,
): Promise<string> {
  const body = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = base64UrlEncode(await hmac(secret, body));
  return `${body}.${signature}`;
}

/**
 * Kiểm tra token phiên. Trả về payload nếu hợp lệ, null nếu sai/chữa hạn.
 * So sánh chữ ký bằng `timingSafeEqual` (thủ công, không phụ thuộc Node).
 */
export async function verifyLiveToken(
  secret: string,
  token: string,
  expected: { sessionId: string; userId: string },
  now: number,
): Promise<LiveTokenPayload | null> {
  const parts = (token ?? "").split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  const expectedSignature = base64UrlEncode(await hmac(secret, body));
  if (!constantTimeEqualString(signature, expectedSignature)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as LiveTokenPayload;
    if (!payload || typeof payload !== "object") return null;
    if (payload.sid !== expected.sessionId) return null;
    if (payload.uid !== expected.userId) return null;
    if (!Number.isFinite(payload.exp) || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

function constantTimeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

// ---------------------------------------------------------------- AI examiner

export type LiveBrainInput = {
  mode: SpeakingMode;
  part: SpeakingPart;
  topic: string;
  /** Câu hỏi đã hỏi trong phần hiện tại. */
  asked: string[];
  /** Câu hỏi tiếp theo trong kế hoạch (null = hết câu của phần). */
  nextQuestion: string | null;
  /** Lời người học vừa nói (có thể rỗng nếu server chưa kịp chép). */
  candidateAnswer: string;
  /** Transcript đầy đủ cho tới giờ. */
  transcript: string;
  /** Có cho phép hỏi follow-up hay không. */
  allowFollowUp: boolean;
};

export type LiveBrainReply = {
  /** Câu thoại ngắn của giám khảo trước khi chuyển câu. */
  ack: string;
  /** Câu hỏi follow-up tuỳ chọn (chỉ khi được phép). */
  followUp: string | null;
  /** true nghĩa là hết câu của phần, chuyển sang phần/lượt tiếp theo. */
  advance: boolean;
};

/** Schema JSON của AI examiner (Gemini trả về đúng object này). */
export const LIVE_BRAIN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["ack", "followUp", "advance"],
  properties: {
    ack: { type: "string" },
    followUp: { type: "string" },
    advance: { type: "boolean" },
  },
} as const;

/** Chỉ dẫn cho AI examiner: hỏi đúng cấu trúc IELTS, không chấm điểm khi đang thi. */
export function liveBrainSystemPrompt(): string {
  return [
    "You are an IELTS Speaking examiner running a live mock test.",
    "Rules:",
    "1. Never grade, never give a band score, never give feedback during the test.",
    "2. Only use the questions from the given test plan. Do not invent new topics.",
    "3. Never repeat the next scripted question in your reply — the app plays it for you.",
    "4. `ack` is a short acknowledgement of at most 8 words (for example: \"That's interesting.\").",
    "5. `followUp` is ONE short follow-up question (at most 20 words) directly relevant to what the candidate just said, or an empty string when you do not ask one.",
    "6. Set advance=true only when there is no next scripted question.",
    "7. Reply with JSON only, immediately, without any reasoning: { \"ack\": string, \"followUp\": string, \"advance\": boolean }.",
  ].join("\n");
}

/** Dựng nội dung user cho lượt gọi AI examiner. */
export function liveBrainUserPrompt(input: LiveBrainInput): string {
  const asked = input.asked.length ? input.asked.map((item) => `- ${item}`).join("\n") : "- (none yet)";
  const next = input.nextQuestion ? input.nextQuestion : "(none — this part is finished)";
  return [
    `Mode: ${input.mode}`,
    `Part: ${input.part}`,
    `Topic: ${input.topic}`,
    `Questions already asked in this part:\n${asked}`,
    `Next scripted question: ${next}`,
    `Candidate's latest answer: ${input.candidateAnswer || "(unclear — ask the next scripted question)"}`,
    `Full transcript so far:\n${input.transcript || "(empty)"}`,
    `Follow-up allowed: ${input.allowFollowUp ? "yes" : "no"}`,
    "Reply with JSON only.",
  ].join("\n\n");
}

/** Validate + chuẩn hoá câu trả lời của AI examiner. */
export function parseLiveBrainReply(value: unknown): LiveBrainReply {
  const record = (value ?? {}) as Record<string, unknown>;
  const ack = typeof record.ack === "string" ? record.ack.trim() : "";
  const followUpRaw = typeof record.followUp === "string" ? record.followUp.trim() : "";
  const advance = record.advance === true;
  return {
    ack,
    followUp: followUpRaw ? followUpRaw : null,
    advance,
  };
}
