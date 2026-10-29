import { AppError, getEnv } from "../http.ts";
import { callAnthropic } from "../anthropic.ts";
import { extractJson } from "../provider.ts";
import { MAX_SPEAKING_AUDIO_BYTES, SPEAKING_AUDIO_MIME_TYPES } from "../schemas.ts";
import { LIVE_BRAIN_SCHEMA, liveBrainSystemPrompt, liveBrainUserPrompt, parseLiveBrainReply, type LiveBrainInput } from "./liveSpeaking.ts";

export const BRAIN_TIMEOUT_MS = 15_000;
export type LiveAnswerAudio = { mimeType: string; data: string };

export function liveAnswerAudio(body: Record<string, unknown>): LiveAnswerAudio | undefined {
  if (body.audioBase64 === undefined) return undefined;
  if (typeof body.audioBase64 !== "string" || typeof body.mimeType !== "string") {
    throw new AppError(400, "invalid_request", "Invalid answer audio");
  }
  const data = body.audioBase64;
  const bytes = data.length * 3 / 4 - (data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0);
  if (!data.length || data.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data) || bytes > MAX_SPEAKING_AUDIO_BYTES) {
    throw new AppError(400, "invalid_request", "Invalid answer audio");
  }
  if (!SPEAKING_AUDIO_MIME_TYPES.includes(body.mimeType as typeof SPEAKING_AUDIO_MIME_TYPES[number])) {
    throw new AppError(400, "invalid_mime_type", "Unsupported answer audio type");
  }
  return { data, mimeType: body.mimeType };
}

/** Một lượt gọi cho cả nghe audio và hỏi thêm, tránh chờ hai lượt AI liên tiếp. */
export async function callBrain(input: LiveBrainInput, audio?: LiveAnswerAudio) {
  const baseUrl = (getEnv("AI_API_BASE_URL") ?? "").replace(/\/+$/, "");
  const apiKey = getEnv("AI_API_KEY") ?? getEnv("ANTHROPIC_API_KEY");
  if (!baseUrl || !apiKey) throw new AppError(503, "server_misconfigured", "The AI provider is not configured");
  const model = getEnv("AI_MODEL_LIVE") || "gemini-3.8-flash";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BRAIN_TIMEOUT_MS);
  try {
    let parsed: unknown;
    if (!model.startsWith("gemini-")) {
      if (!input.candidateAnswer.trim()) throw new AppError(422, "browser_transcription_required", "This model needs a text transcript");
      const response = await callAnthropic(model, liveBrainSystemPrompt(), [{ role: "user", content: liveBrainUserPrompt(input) }], LIVE_BRAIN_SCHEMA, 512, BRAIN_TIMEOUT_MS);
      parsed = extractJson(response.rawText);
    } else {
      const response = await fetch(`${baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: liveBrainUserPrompt(input) }, ...(audio && !input.candidateAnswer.trim() ? [{ inlineData: audio }] : [])] }],
          systemInstruction: { parts: [{ text: liveBrainSystemPrompt() }] },
          generationConfig: {
            temperature: 0.4, maxOutputTokens: 512, responseMimeType: "application/json", responseSchema: LIVE_BRAIN_SCHEMA,
            ...(model.startsWith("gemini-3") ? { thinkingConfig: { thinkingLevel: "minimal" } } : {}),
          },
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new AppError(502, "brain_provider_error", "The follow-up provider request failed");
      const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }> };
      const text = (body.candidates?.[0]?.content?.parts ?? []).filter(part => !part.thought).map(part => part.text ?? "").join("");
      parsed = extractJson(text);
    }
    const result = parsed as Record<string, unknown> | null;
    if (!result || typeof result.ack !== "string" || typeof result.followUp !== "string" || typeof result.advance !== "boolean") {
      throw new AppError(502, "brain_invalid_output", "The follow-up provider returned invalid JSON");
    }
    return parseLiveBrainReply(result);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const code = controller.signal.aborted || (error as { code?: string })?.code === "provider_timeout" ? "brain_timeout" : "brain_provider_error";
    throw new AppError(502, code, "The follow-up provider could not complete this turn");
  } finally { clearTimeout(timeout); }
}
