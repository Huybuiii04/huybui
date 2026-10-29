/**
 * `submit-speaking` — API 2 phase của module Speaking.
 *
 * phase `prepare`: tạo attempt + kế hoạch turn, trả signed upload URL cho từng turn.
 * phase `commit`  : đánh dấu 1 turn đã upload; khi ĐỦ turn thì enqueue job chấm.
 *
 * Vì sao 2 phase: worker có thể claim job trước khi client kịp PUT audio lên Storage.
 * Job chỉ được tạo sau khi mọi turn đã upload — server tự kiểm tra, không tin client.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAuthenticatedUser } from "../_shared/auth.ts";
import {
  AppError,
  databaseError,
  errorResponse,
  jsonResponse,
  preflightResponse,
  readJsonBody,
  requestId,
  requireMethod,
} from "../_shared/http.ts";
import {
  parseCommitSpeakingTurn,
  parsePrepareSpeaking,
  SPEAKING_MAX_DURATION_MS,
} from "../_shared/schemas.ts";
import { SPEAKING_AUDIO_BUCKET } from "../_shared/storage.ts";
import {
  buildSpeakingPlan,
  type SpeakingQuestionRow,
} from "../_shared/ai/speakingPlan.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAuthenticatedUser(request);
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const action = String(body.action ?? "");

    if (action === "prepare") {
      return await prepare(request, context.service, context.userId, body, id);
    }
    if (action === "commit") {
      return await commit(request, context.service, context.userId, body, id);
    }
    throw new AppError(400, "invalid_action", "Unknown action");
  } catch (error) {
    return errorResponse(request, error, id);
  }
});

async function prepare(
  request: Request,
  service: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
  id: string,
): Promise<Response> {
  const input = parsePrepareSpeaking(body);

  let questionRow: SpeakingQuestionRow | null = null;
  if (input.questionId) {
    const result = await service
      .from("speaking_questions")
      .select("id,part,slug,topic,prompt_text,questions,cue_card,related_part3_slug,sub_index,book_number,test_number")
      .eq("id", input.questionId)
      .eq("is_active", true)
      .maybeSingle();
    if (result.error) throw databaseError("load the speaking question");
    questionRow = (result.data as SpeakingQuestionRow | null) ?? null;
  }

  // Test được chọn: nạp đúng 4 dòng của test đó (P1, P2, P3 chủ đề A, P3 chủ đề B).
  const setRows = input.bookNumber !== null && input.testNumber !== null
    ? await loadTestRows(service, input.bookNumber, input.testNumber)
    : [];

  const pool = setRows.length ? { part1: [], part2: [], part3: [] } : await loadQuestionPool(service);
  const turns = buildSpeakingPlan({
    mode: input.mode,
    question: input.question,
    questionRow,
    setRows,
    pool,
  });
  if (!turns.length) {
    throw new AppError(
      409,
      "no_speaking_questions",
      "There is no speaking question available for this mode yet",
    );
  }

  const attemptInsert = await service
    .from("speaking_attempts")
    .insert({
      user_id: userId,
      mode: input.mode,
      target_band: input.targetBand,
      feedback_locale: input.feedbackLocale,
      turn_count: turns.length,
      book_number: input.bookNumber,
      test_number: input.testNumber,
      status: "recording",
    })
    .select("id")
    .maybeSingle();
  if (attemptInsert.error || !attemptInsert.data) throw databaseError("create the speaking attempt");
  const attemptId = attemptInsert.data.id as string;

  const turnInsert = await service
    .from("speaking_turns")
    .insert(
      turns.map((turn) => ({
        attempt_id: attemptId,
        user_id: userId,
        order_index: turn.orderIndex,
        part: turn.part,
        question_id: turn.questionId,
        prompt_text: turn.promptText,
        questions: turn.questions,
        cue_card: turn.cueCard,
        audio_path: "",
        mime_type: "audio/webm",
        byte_size: 0,
        duration_ms: 0,
        status: "pending",
      })),
    )
    .select("id,order_index")
    .order("order_index");
  if (turnInsert.error || !turnInsert.data) throw databaseError("create the speaking turns");

  const created = turnInsert.data as Array<{ id: string; order_index: number }>;
  const payload: Array<Record<string, unknown>> = [];

  for (const turn of turns) {
    const row = created.find((item) => item.order_index === turn.orderIndex);
    if (!row) throw databaseError("create the speaking turns");
    // Duong dan object CANON: client co the ghi am bang webm/mp4/wav/... nen khong
    // duoc doan ten file o thoi diem prepare. Mime that duoc client bao o buoc commit
    // va luu rieng trong DB (khong phai suy tu duoi file).
    const objectPath = `${userId}/${attemptId}/${row.id}.webm`;
    const signed = await service.storage
      .from(SPEAKING_AUDIO_BUCKET)
      .createSignedUploadUrl(objectPath, { upsert: false });
    if (signed.error) {
      throw new AppError(503, "storage_unavailable", "Could not prepare the recording upload. Please retry.");
    }
    payload.push({
      turnId: row.id,
      orderIndex: turn.orderIndex,
      part: turn.part,
      promptText: turn.promptText,
      questions: turn.questions,
      cueCard: turn.cueCard,
      maxDurationMs: SPEAKING_MAX_DURATION_MS[turn.part],
      uploadUrl: signed.data.signedUrl,
      token: signed.data.token,
      objectPath,
    });
  }

  return jsonResponse(
    request,
    201,
    { attemptId, mode: input.mode, turns: payload },
    { requestId: id },
  );
}

async function commit(
  request: Request,
  service: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
  id: string,
): Promise<Response> {
  const input = parseCommitSpeakingTurn(body);

  const attemptResult = await service
    .from("speaking_attempts")
    .select("id,user_id,status,turn_count")
    .eq("id", input.attemptId)
    .eq("user_id", userId)
    .maybeSingle();
  if (attemptResult.error) throw databaseError("load the speaking attempt");
  const attempt = attemptResult.data;
  if (!attempt) throw new AppError(404, "attempt_not_found", "Speaking attempt not found");
  if (attempt.status !== "recording") {
    throw new AppError(409, "attempt_closed", "This speaking attempt has already been submitted");
  }

  const turnResult = await service
    .from("speaking_turns")
    .select("id,attempt_id,status")
    .eq("id", input.turnId)
    .eq("attempt_id", input.attemptId)
    .eq("user_id", userId)
    .maybeSingle();
  if (turnResult.error) throw databaseError("load the speaking turn");
  const turn = turnResult.data;
  if (!turn) throw new AppError(404, "turn_not_found", "Speaking turn not found");
  if (turn.status !== "pending") {
    throw new AppError(409, "turn_already_uploaded", "This recording has already been submitted");
  }

  // Phai dung CHINH xac duong dan da cap o buoc prepare (canonical, duoi .webm).
  const objectPath = `${userId}/${input.attemptId}/${input.turnId}.webm`;

  // Xác minh audio thực sự đã nằm trên Storage.
  const download = await service.storage.from(SPEAKING_AUDIO_BUCKET).download(objectPath);
  if (download.error) {
    throw new AppError(400, "audio_not_uploaded", "The recording has not been uploaded yet");
  }

  const turnUpdate = await service
    .from("speaking_turns")
    .update({
      status: "uploaded",
      audio_path: objectPath,
      mime_type: input.mimeType,
      byte_size: input.byteSize,
      duration_ms: input.durationMs,
    })
    .eq("id", input.turnId)
    .eq("user_id", userId)
    .eq("status", "pending");
  if (turnUpdate.error) throw databaseError("save the speaking turn");

  const uploaded = await service
    .from("speaking_turns")
    .select("id")
    .eq("attempt_id", input.attemptId)
    .eq("status", "uploaded");
  if (uploaded.error) throw databaseError("count the uploaded speaking turns");

  if ((uploaded.data ?? []).length < Number(attempt.turn_count)) {
    return jsonResponse(
      request,
      202,
      { attemptId: input.attemptId, committed: false, jobId: null },
      { requestId: id },
    );
  }

  const attemptUpdate = await service
    .from("speaking_attempts")
    .update({ status: "queued" })
    .eq("id", input.attemptId)
    .eq("user_id", userId)
    .eq("status", "recording");
  if (attemptUpdate.error) throw databaseError("queue the speaking attempt");

  const jobInsert = await service
    .from("ai_jobs")
    .insert({
      user_id: userId,
      revision_id: null,
      operation: "grade-speaking",
      payload: { attemptId: input.attemptId },
      idempotency_key: input.idempotencyKey,
      status: "queued",
      next_attempt_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();
  if (jobInsert.error || !jobInsert.data) throw databaseError("create the speaking job");

  return jsonResponse(
    request,
    202,
    { attemptId: input.attemptId, committed: true, jobId: jobInsert.data.id },
    { requestId: id },
  );
}

async function loadQuestionPool(service: SupabaseClient): Promise<{
  part1: SpeakingQuestionRow[];
  part2: SpeakingQuestionRow[];
  part3: SpeakingQuestionRow[];
}> {
  const result = await service
    .from("speaking_questions")
    .select("id,part,slug,topic,prompt_text,questions,cue_card,related_part3_slug,sub_index,book_number,test_number")
    .eq("is_active", true);
  if (result.error) throw databaseError("load the speaking questions");
  const rows = (result.data ?? []) as SpeakingQuestionRow[];
  return {
    part1: rows.filter((row) => row.part === "part-1"),
    part2: rows.filter((row) => row.part === "part-2"),
    part3: rows.filter((row) => row.part === "part-3"),
  };
}

/** Nạp các dòng của 1 test Cambridge (P1, P2, P3 chủ đề A, P3 chủ đề B). */
async function loadTestRows(
  service: SupabaseClient,
  bookNumber: number,
  testNumber: number,
): Promise<SpeakingQuestionRow[]> {
  const result = await service
    .from("speaking_questions")
    .select("id,part,slug,topic,prompt_text,questions,cue_card,related_part3_slug,sub_index,book_number,test_number")
    .eq("is_active", true)
    .eq("book_number", bookNumber)
    .eq("test_number", testNumber);
  if (result.error) throw databaseError("load the speaking test");
  return (result.data ?? []) as SpeakingQuestionRow[];
}
