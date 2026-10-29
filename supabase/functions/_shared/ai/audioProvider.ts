/**
 * Lớp 1 của pipeline Speaking: đọc audio bằng Gemini Flash (multimodal).
 *
 * Khác với lớp 2 (Claude chấm rubric) là lớp này PHẢI nhận audio, nên nó đi qua route
 * OpenAI-compatible (`/v1/chat/completions` với `input_audio`) thay vì route Anthropic.
 * Đã verify: proxy `api.apiz.vn` nhận `input_audio` cho `gemini-3.8-flash` và trả về
 * `usage.prompt_tokens_details.audio_tokens > 0`.
 *
 * File này không phụ thuộc mạng khi import; chỉ gọi ra ngoài trong `callAudioModel`.
 */

import { getEnv } from "../http.ts";
import { parseProviderBody } from "../anthropic.ts";
import { providerEndpoint, providerHeaders, resolveProviderConfig } from "../provider.ts";
import { extractJson, parseProviderResponse } from "../provider.ts";
import { parseAudioAnalysis, type AudioAnalysis } from "./speaking.ts";

export const AUDIO_MODEL_ENV = "AI_MODEL_AUDIO";
export const DEFAULT_AUDIO_MODEL = "gemini-3.8-flash";
export const AUDIO_TIMEOUT_MS = 60_000;

export function audioModel(): string {
  const configured = (getEnv(AUDIO_MODEL_ENV) ?? "").trim();
  return configured || DEFAULT_AUDIO_MODEL;
}

/** Map mime của file ghi âm sang định dạng `input_audio` mà provider chấp nhận. */
export function audioFormatForMime(mimeType: string): "webm" | "mp4" | "wav" | "mp3" | "ogg" {
  const mime = mimeType.toLowerCase();
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
  const config = resolveProviderConfig({
    AI_API_BASE_URL: getEnv("AI_API_BASE_URL"),
    AI_API_KEY: getEnv("AI_API_KEY"),
    ANTHROPIC_API_KEY: getEnv("ANTHROPIC_API_KEY"),
  });
  if (!config.apiKey) {
    throw new Error("AI provider configuration is missing");
  }

  const model = audioModel();
  const endpoint = providerEndpoint(config, "openai");
  const headers = providerHeaders(config, "openai");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUDIO_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 4_000,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: options.prompt },
              {
                type: "input_audio",
                input_audio: {
                  data: options.audioBase64,
                  format: audioFormatForMime(options.mimeType),
                },
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Audio provider request failed with status ${response.status}`);
    }

    const parsed = parseProviderResponse(
      parseProviderBody(await response.text()),
      response.headers,
    );
    const json = extractJson(parsed.rawText);
    if (!json) {
      throw new Error("Audio provider returned invalid JSON");
    }

    return {
      analysis: parseAudioAnalysis(json),
      model: parsed.model || model,
      latencyMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}
