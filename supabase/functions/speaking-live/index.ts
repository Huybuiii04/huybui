/**
 * `speaking-live` — API của chế độ luyện nói TRỰC TIẾP.
 *
 * action `start`      : mở phiên live (gắn với 1 attempt của module Speaking),
 *                       cấp token ngắn hạn và trả kế hoạch câu hỏi từ database.
 * action `brain`      : hỏi "AI examiner" (gemini-3.8-flash) câu tiếp theo / follow-up.
 * action `transcribe` : chép lời người học (dự phòng khi trình duyệt không có SpeechRecognition).
 * action `finish`     : kết thúc phiên, lưu transcript.
 *
 * Mọi lời gọi ra provider đều đi qua server: API key không bao giờ tới trình duyệt.
 * Token phiên ngắn hạn ràng buộc client vào đúng phiên đã mở và tự hết hạn sau 2 giờ.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAuthenticatedUser } from "../_shared/auth.ts";
import {
  AppError,
  databaseError,
  errorResponse,
  getEnv,
  jsonResponse,
  preflightResponse,
  readJsonBody,
  requestId,
  requireMethod,
} from "../_shared/http.ts";
import {
  buildLiveTurnPlan,
  countQuestions,
  LIVE_LIMITS,
  signLiveToken,
  transcriptToText,
  verifyLiveToken,
  type LiveBrainInput,
  type LiveTokenPayload,
  type LiveTranscriptEntry,
  type LiveTurnPlan,
} from "../_shared/ai/liveSpeaking.ts";
import { callAudioModel } from "../_shared/ai/audioProvider.ts";
import { callBrain, liveAnswerAudio } from "../_shared/ai/liveBrain.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAuthenticatedUser(request);
    const body = (await readJsonBody(request, 6 * 1024 * 1024)) as Record<string, unknown>;
    const action = String(body.action ?? "");

    if (action === "start") return await start(request, context.service, context.userId, body, id);
    if (action === "brain") return await brain(request, context.service, context.userId, body, id);
    if (action === "transcribe") return await transcribe(request, context.service, context.userId, body, id);
    if (action === "finish") return await finish(request, context.service, context.userId, body, id);
    throw new AppError(400, "invalid_action", "Unknown action");
  } catch (error) {
    return errorResponse(request, error, id);
  }
});

type LiveSessionRow = {
  id: string;
  attempt_id: string;
  user_id: string;
  mode: string;
  status: string;
  brain_calls: number;
  question_count: number;
  transcript: unknown;
};

type TurnRow = {
  id: string;
  order_index: number;
  part: string;
  prompt_text: string;
  questions: string[] | null;
  cue_card: unknown;
};

// ------------------------------------------------------------------ start

async function start(
  request: Request,
  service: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
  id: string,
): Promise<Response> {
  const attemptId = String(body.attemptId ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(attemptId)) {
    throw new AppError(400, "invalid_request", "A valid attemptId is required");
  }
  const voice = body.voice === "en-US" ? "en-US" : "en-GB";

  const attemptResult = await service
    .from("speaking_attempts")
    .select("id,user_id,mode,status")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();
  if (attemptResult.error) throw databaseError("load the speaking attempt");
  const attempt = attemptResult.data as { id: string; user_id: string; mode: string; status: string } | null;
  if (!attempt) throw new AppError(404, "attempt_not_found", "Speaking attempt not found");
  if (attempt.status !== "recording") {
    throw new AppError(409, "attempt_closed", "This speaking attempt has already been submitted");
  }

  const turns = await loadTurns(service, attemptId, userId);
  if (!turns.length) throw new AppError(409, "no_speaking_questions", "This attempt has no turns");

  // Chi phí: số phiên live trong 24 giờ gần nhất.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recent = await service
    .from("speaking_live_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);
  if (recent.error) throw databaseError("count the live sessions");
  if ((recent.count ?? 0) >= LIVE_LIMITS.maxSessionsPerDay) {
    throw new AppError(429, "rate_limited", "You have reached the daily live-session limit", 3600);
  }

  const plan = buildLiveTurnPlan(
    turns.map((turn) => ({
      turnId: turn.id,
      orderIndex: turn.order_index,
      part: turn.part as LiveTurnPlan["part"],
      promptText: turn.prompt_text,
      questions: turn.questions ?? [],
      cueCard: (turn.cue_card ?? null) as LiveTurnPlan["cueCard"],
    })),
  );

  const insert = await service
    .from("speaking_live_sessions")
    .insert({
      attempt_id: attemptId,
      user_id: userId,
      mode: attempt.mode,
      status: "live",
      voice,
      question_count: countQuestions(plan),
    })
    .select("id")
    .maybeSingle();
  if (insert.error || !insert.data) throw databaseError("create the live session");
  const sessionId = insert.data.id as string;

  const secret = getEnv("WORKER_SECRET");
  if (!secret) throw new AppError(503, "server_misconfigured", "The live session secret is not configured");
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000;
  const token = await signLiveToken(secret, { sid: sessionId, uid: userId, exp: expiresAt });

  return jsonResponse(
    request,
    201,
    {
      sessionId,
      token,
      expiresAt,
      voice,
      mode: attempt.mode,
      limits: {
        maxDurationMs: LIVE_LIMITS.maxDurationMs,
        maxBrainCalls: LIVE_LIMITS.maxBrainCalls,
      },
      plan: plan.map((turn) => ({
        turnId: turn.turnId,
        orderIndex: turn.orderIndex,
        part: turn.part,
        prepMs: turn.prepMs,
        maxAnswerMs: turn.maxAnswerMs,
        steps: turn.steps,
      })),
    },
    { requestId: id },
  );
}

// ------------------------------------------------------------------ brain

async function brain(
  request: Request,
  service: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
  id: string,
): Promise<Response> {
  const { session, payload } = await authorize(service, userId, body);

  if (session.brain_calls >= LIVE_LIMITS.maxBrainCalls) {
    throw new AppError(429, "rate_limited", "This live session has reached its AI limit");
  }

  const turnIndex = Number(body.turnIndex ?? 0);
  const stepIndex = Number(body.stepIndex ?? 0);
  const candidateAnswer = String(body.candidateAnswer ?? "").slice(0, 4000);
  const allowFollowUp = body.allowFollowUp === true;
  const audio = liveAnswerAudio(body);

  const plan = await loadPlan(service, session);
  const turn = plan[turnIndex];
  if (!turn) throw new AppError(404, "turn_not_found", "Speaking turn not found");
  const step = turn.steps[stepIndex];
  const nextQuestion = turn.steps[stepIndex + 1]?.text ?? null;

  const transcript = Array.isArray(session.transcript) ? (session.transcript as LiveTranscriptEntry[]) : [];
  const input: LiveBrainInput = {
    mode: session.mode as LiveBrainInput["mode"],
    part: turn.part,
    topic: turn.cueCard?.topic ?? turn.promptText,
    asked: turn.steps.slice(0, stepIndex + 1).map((item) => item.text),
    nextQuestion,
    candidateAnswer,
    transcript: transcriptToText(transcript),
    allowFollowUp,
  };

  // Cả lượt gọi lỗi cũng tiêu hạn mức, tránh thử vô hạn khi provider hỏng.
  await service
    .from("speaking_live_sessions")
    .update({ brain_calls: session.brain_calls + 1, updated_at: new Date().toISOString() })
    .eq("id", session.id)
    .eq("user_id", userId);
  const reply = await callBrain(input, audio);

  return jsonResponse(
    request,
    200,
    {
      sessionId: session.id,
      ack: reply.ack,
      followUp: reply.followUp,
      advance: reply.advance || nextQuestion === null,
      nextStepIndex: nextQuestion === null ? null : stepIndex + 1,
      tokenExpiresAt: payload.exp,
    },
    { requestId: id },
  );
}

// ------------------------------------------------------------------ transcribe

async function transcribe(
  request: Request,
  service: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
  id: string,
): Promise<Response> {
  await authorize(service, userId, body);
  const audioBase64 = String(body.audioBase64 ?? "").trim();
  if (!audioBase64) throw new AppError(400, "invalid_request", "The audio payload is required");
  const mimeType = String(body.mimeType ?? "audio/webm");

  const result = await callAudioModel({
    audioBase64,
    mimeType,
    prompt: "You are transcribing an IELTS Speaking answer. Return the transcript exactly as spoken.",
  });

  return jsonResponse(request, 200, { transcript: result.analysis.transcript }, { requestId: id });
}

// ------------------------------------------------------------------ finish

async function finish(
  request: Request,
  service: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
  id: string,
): Promise<Response> {
  const { session } = await authorize(service, userId, body);
  const transcript = Array.isArray(body.transcript)
    ? (body.transcript as LiveTranscriptEntry[]).slice(0, 400)
    : [];

  const queued = await service.rpc("queue_speaking_grading", {
    p_attempt_id: session.attempt_id,
    p_user_id: userId,
    p_allow_partial: true,
  });
  if (queued.error?.message === "no_speech_detected") {
    throw new AppError(422, "no_speech_detected", "There is no recording to grade");
  }
  if (queued.error) throw databaseError("queue the speaking attempt");

  const saved = await service
    .from("speaking_live_sessions")
    .update({
      status: "finished",
      transcript,
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.id)
    .eq("user_id", userId);
  if (saved.error) throw databaseError("finish the live session");

  return jsonResponse(request, 200, { sessionId: session.id, status: "finished" }, { requestId: id });
}

// ------------------------------------------------------------------ helpers

async function authorize(
  service: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
): Promise<{ session: LiveSessionRow; payload: LiveTokenPayload }> {
  const sessionId = String(body.sessionId ?? "").trim();
  const token = String(body.token ?? "").trim();
  if (!sessionId || !token) {
    throw new AppError(401, "invalid_live_token", "A live session token is required");
  }
  const secret = getEnv("WORKER_SECRET");
  if (!secret) throw new AppError(503, "server_misconfigured", "The live session secret is not configured");

  const result = await service
    .from("speaking_live_sessions")
    .select("id,attempt_id,user_id,mode,status,brain_calls,question_count,transcript")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (result.error) throw databaseError("load the live session");
  const session = result.data as LiveSessionRow | null;
  if (!session) throw new AppError(404, "session_not_found", "Live session not found");

  const payload = await verifyLiveToken(secret, token, { sessionId, userId }, Date.now());
  if (!payload) throw new AppError(401, "invalid_live_token", "The live session token is invalid or expired");
  return { session, payload };
}

async function loadTurns(service: SupabaseClient, attemptId: string, userId: string): Promise<TurnRow[]> {
  const result = await service
    .from("speaking_turns")
    .select("id,order_index,part,prompt_text,questions,cue_card")
    .eq("attempt_id", attemptId)
    .eq("user_id", userId)
    .order("order_index", { ascending: true });
  if (result.error) throw databaseError("load the speaking turns");
  return (result.data ?? []) as TurnRow[];
}

async function loadPlan(service: SupabaseClient, session: LiveSessionRow): Promise<LiveTurnPlan[]> {
  const turns = await loadTurns(service, session.attempt_id, session.user_id);
  return buildLiveTurnPlan(
    turns.map((turn) => ({
      turnId: turn.id,
      orderIndex: turn.order_index,
      part: turn.part as LiveTurnPlan["part"],
      promptText: turn.prompt_text,
      questions: turn.questions ?? [],
      cueCard: (turn.cue_card ?? null) as LiveTurnPlan["cueCard"],
    })),
  );
}
