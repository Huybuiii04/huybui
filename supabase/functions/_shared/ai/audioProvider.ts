/**
 * Lớp 1 của pipeline Speaking: đọc audio bằng Gemini Flash (multimodal).
 *
 * Audio được gửi qua route NATIVE của Gemini (`/v1beta/models/{model}:generateContent`
 * với `inlineData`) chứ không phải route OpenAI-compatible `input_audio`:
 * proxy `api.apiz.vn` nhận `input_audio` nhưng KHÔNG chuyển audio cho model — model
 * nghe nhầm rồi bịa transcript (cùng một file cho ra hai câu khác nhau). Route native
 * trả transcript đúng với cả mp3 lẫn webm/opus.
 *
 * File này không phụ thuộc mạng khi import; chỉ gọi ra ngoài trong `callAudioModel`.
 */

import { AppError, getEnv } from "../http.ts";
import { extractJson } from "../provider.ts";
import { parseAudioAnalysis, type AudioAnalysis } from "./speaking.ts";

export const AUDIO_MODEL_ENV = "AI_MODEL_AUDIO";
export const DEFAULT_AUDIO_MODEL = "gemini-3.8-flash";
export const AUDIO_TIMEOUT_MS = 90_000;

/** Route native của Gemini (proxy vẫn relay được). */
const NATIVE_AUDIO_PATH = "/v1beta/models";

export function audioModel(): string {
  const configured = (getEnv(AUDIO_MODEL_ENV) ?? "").trim();
  return configured || DEFAULT_AUDIO_MODEL;
}

/**
 * Map mime của file ghi âm sang mime audio mà Gemini chấp nhận.
 * Gemini đọc được cả webm/opus lẫn mp3/wav/mp4/ogg.
 */
export function audioMimeForFile(mimeType: string): string {
  const mime = (mimeType ?? "").toLowerCase();
  if (mime.includes("webm")) return "audio/webm";
  if (mime.includes("wav")) return "audio/wav";
  if (mime.includes("ogg")) return "audio/ogg";
  if (mime.includes("mp4")) return "audio/mp4";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "audio/mpeg";
  return "audio/mpeg";
}

/** Map mime sang `format` của route OpenAI-compatible (giữ cho tương thích). */
export function audioFormatForMime(mimeType: string): "webm" | "mp4" | "wav" | "mp3" | "ogg" {
  const mime = (mimeType ?? "").toLowerCase();
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  return "ogg";
}

export type AudioModelResult = {
  analysis: AudioAnalysis;
  model: string;
  latencyMs: number;
};

/**
 * Gửi một recording tới Gemini và nhận transcript + phân tích phát âm.
 * Trả về `AudioAnalysis` đã validate theo hợp đồng ở `speaking.ts`.
 */
export async function callAudioModel(options: {
  audioBase64: string;
  mimeType: string;
  prompt: string;
}): Promise<AudioModelResult> {
  const baseUrl = (getEnv("AI_API_BASE_URL") ?? "").replace(/\/+$/, "");
  const apiKey = getEnv("AI_API_KEY") ?? getEnv("ANTHROPIC_API_KEY");
  if (!baseUrl || !apiKey) {
    throw new AppError(503, "audio_provider_misconfigured", "The audio provider is not configured");
  }

  const model = audioModel();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUDIO_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetch(
      `${baseUrl}${NATIVE_AUDIO_PATH}/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: options.prompt },
                {
                  inlineData: {
                    mimeType: audioMimeForFile(options.mimeType),
                    data: options.audioBase64,
                  },
                },
              ],
            },
          ],
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new AppError(
        502,
        "audio_provider_error",
        `The audio provider failed with status ${response.status}`,
      );
    }

    const body = (await response.json()) as {
      modelVersion?: string;
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const parts = (body.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .filter((text) => text.trim().length > 0);

    // Model có thể thêm một phần "thought" trước khi trả JSON — thử từng phần từ
    // cuối về trước, rồi mới thử toàn bộ chuỗi.
    let json: unknown = null;
    for (let index = parts.length - 1; index >= 0 && json === null; index -= 1) {
      json = extractJson(parts[index]);
    }
    if (json === null && parts.length) json = extractJson(parts.join("\n"));
    if (!json) {
      throw new AppError(502, "audio_provider_invalid_output", "The audio provider returned invalid JSON");
    }

    return {
      analysis: parseAudioAnalysis(json),
      model: body.modelVersion || model,
      latencyMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}
