/**
 * Tổng hợp giọng nói cho giám khảo AI (chế độ luyện nói trực tiếp).
 *
 * Ưu tiên: MiniMax qua proxy OpenAI-compatible (`/v1/audio/speech`) — nhanh nhất
 * trong các provider hiện có (khoảng 2–3 giây cho một câu).
 * Dự phòng: Gemini TTS (`gemini-3.1-flash-tts-preview`) trả PCM 24 kHz — bọc
 * thành WAV để trình duyệt phát được.
 *
 * File này không phụ thuộc mạng khi import; chỉ gọi ra ngoài trong `synthesizeSpeech`.
 */

import { AppError, getEnv } from "../http.ts";

export type LiveVoiceAccent = "en-GB" | "en-US";

/**
 * Tên giọng của MiniMax cho từng accent.
 *
 * Provider hiện tại (proxy apiz) chỉ nhận đúng hai giọng này; tham số accent
 * của MiniMax không được relay nên accent chỉ là lựa chọn giữa hai giọng có sẵn.
 */
export const LIVE_VOICE_NAMES: Record<LiveVoiceAccent, string> = {
  "en-GB": "English_Trustworthy_Man",
  "en-US": "English_expressive_narrator",
};

/** Danh sách giọng hiển thị cho người học. */
export const LIVE_VOICE_LABELS: Record<LiveVoiceAccent, readonly [string, string]> = {
  "en-GB": ["Giọng nam · Anh-Anh", "Male voice · British English"],
  "en-US": ["Giọng nữ · Anh-Mỹ", "Female voice · American English"],
};

const VOICE_MODEL_ENV = "AI_MODEL_VOICE";
const DEFAULT_VOICE_MODEL = "minimax-speech-2.8-turbo";
const GEMINI_TTS_MODEL = "gemini-3.1-flash-tts-preview";
const VOICE_TIMEOUT_MS = 45_000;

export function voiceModel(): string {
  const configured = (getEnv(VOICE_MODEL_ENV) ?? "").trim();
  return configured || DEFAULT_VOICE_MODEL;
}

export function isLiveVoiceAccent(value: unknown): value is LiveVoiceAccent {
  return value === "en-GB" || value === "en-US";
}

/** Bọc PCM 16-bit mono thành WAV để trình duyệt phát được. */
export function pcmToWav(pcm: Uint8Array, sampleRate = 24_000): Uint8Array {
  const bytes = new Uint8Array(44 + pcm.length);
  const view = new DataView(bytes.buffer);
  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) bytes[offset + index] = text.charCodeAt(index);
  };
  writeText(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, pcm.length, true);
  bytes.set(pcm, 44);
  return bytes;
}

export type SpeechResult = {
  bytes: Uint8Array;
  mimeType: string;
  /** "minimax" | "gemini" — để ghi log vận hành. */
  engine: string;
};

/** Giải mã base64 (chuẩn, có padding) thành bytes. */
function decodeBase64(value: string): Uint8Array {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/**
 * Tổng hợp một câu thoại của giám khảo.
 *
 * Không dùng cache phía server: mỗi câu là nội dung khác nhau, và cache tĩnh sẽ
 * giữ audio của phiên lâu hơn mức cần thiết.
 */
export async function synthesizeSpeech(options: {
  text: string;
  accent: LiveVoiceAccent;
  signal?: AbortSignal;
}): Promise<SpeechResult> {
  const text = options.text.trim();
  if (!text) throw new AppError(400, "invalid_request", "The text to speak is empty");

  const baseUrl = (getEnv("AI_API_BASE_URL") ?? "").replace(/\/+$/, "");
  const apiKey = getEnv("AI_API_KEY") ?? getEnv("ANTHROPIC_API_KEY");
  if (!baseUrl || !apiKey) {
    throw new AppError(503, "server_misconfigured", "The voice provider is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VOICE_TIMEOUT_MS);
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const primary = await callMiniMax({ baseUrl, apiKey, text, accent: options.accent, signal: controller.signal });
    if (primary) return primary;
  } catch (error) {
    console.error(JSON.stringify({
      event: "live_voice_primary_failed",
      message: error instanceof Error ? error.message : "unknown",
    }));
  } finally {
    clearTimeout(timeout);
  }

  const fallback = await callGeminiTts({ baseUrl, apiKey, text, accent: options.accent, signal: controller.signal });
  return fallback;
}

/** Câu lệnh phong cách cho Gemini TTS (chỉ dùng ở nhánh dự phòng). */
function accentStyle(accent: LiveVoiceAccent): string {
  return accent === "en-GB"
    ? "Read this as a British IELTS examiner. "
    : "Read this as an American IELTS examiner. ";
}

async function callMiniMax(options: {
  baseUrl: string;
  apiKey: string;
  text: string;
  accent: LiveVoiceAccent;
  signal: AbortSignal;
}): Promise<SpeechResult | null> {
  const response = await fetch(`${options.baseUrl}/v1/audio/speech`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: voiceModel(),
      input: options.text,
      voice: LIVE_VOICE_NAMES[options.accent],
    }),
    signal: options.signal,
  });
  if (!response.ok) return null;
  const contentType = response.headers.get("content-type") ?? "audio/mpeg";
  if (!contentType.startsWith("audio/")) return null;
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length) return null;
  return { bytes, mimeType: contentType.split(";")[0], engine: "minimax" };
}

async function callGeminiTts(options: {
  baseUrl: string;
  apiKey: string;
  text: string;
  accent: LiveVoiceAccent;
  signal: AbortSignal;
}): Promise<SpeechResult> {
  const response = await fetch(
    `${options.baseUrl}/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${options.apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: accentStyle(options.accent) + options.text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
        },
      }),
      signal: options.signal,
    },
  );
  if (!response.ok) {
    throw new AppError(502, "voice_provider_error", `The voice provider failed with status ${response.status}`);
  }
  const body = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string } }> } }>;
  };
  const parts = body.candidates?.[0]?.content?.parts ?? [];
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (const part of parts) {
    const data = part.inlineData?.data;
    if (!data) continue;
    const bytes = decodeBase64(data);
    chunks.push(bytes);
    total += bytes.length;
  }
  if (!total) {
    throw new AppError(502, "voice_provider_error", "The voice provider returned no audio");
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return { bytes: pcmToWav(merged), mimeType: "audio/wav", engine: "gemini-tts" };
}
