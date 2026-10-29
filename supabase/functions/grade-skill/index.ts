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
import { parseGradeSkill } from "../_shared/schemas.ts";
import { bandFromRaw, gradeQuestions, type GradingResultItem } from "../_shared/skillGrading.ts";

type QuestionRow = {
  id: string;
  group_id: string;
  order_index: number;
  answer_key: string | null;
  accepted_answers: string[] | null;
  explanation: string | null;
  answerGroup?: string;
};

type GroupRow = { id: string; section_id: string; order_index: number; config: { answerSlots?: number } | null };

/** Kết quả có kèm giải thích: cột `explanation` không mở cho client đọc. */
type GradedResultItem = GradingResultItem & { explanation: string };

/** Đọc nhóm + câu hỏi của một đề theo đúng thứ tự section → group → order. */
async function loadQuestions(service: SupabaseClient, testId: string): Promise<QuestionRow[]> {
  const sectionResult = await service
    .from("skill_sections")
    .select("id,section_no")
    .eq("test_id", testId)
    .order("section_no", { ascending: true });
  if (sectionResult.error) throw databaseError("load the test sections");
  const sections = (sectionResult.data ?? []) as { id: string; section_no: number }[];
  if (!sections.length) throw new AppError(404, "test_not_found", "This test has no sections");

  const groupResult = await service
    .from("skill_question_groups")
    .select("id,section_id,order_index,config")
    .in("section_id", sections.map(section => section.id))
    .order("order_index", { ascending: true });
  if (groupResult.error) throw databaseError("load the question groups");
  const groups = (groupResult.data ?? []) as GroupRow[];
  if (!groups.length) throw new AppError(404, "test_not_found", "This test has no questions");

  const questionResult = await service
    .from("skill_questions")
    .select("id,group_id,order_index,answer_key,accepted_answers,explanation")
    .in("group_id", groups.map(group => group.id))
    .order("order_index", { ascending: true });
  if (questionResult.error) throw databaseError("load the questions");

  const sectionNo = new Map(sections.map(section => [section.id, section.section_no]));
  const groupOrder = new Map(groups.map(group => [group.id, group.order_index]));
  return ((questionResult.data ?? []) as QuestionRow[]).map(row => ({
    ...row,
    answerGroup: (groups.find(group => group.id === row.group_id)?.config?.answerSlots ?? 0) > 1 ? row.group_id : undefined,
  })).sort((left, right) => {
    const leftGroup = groups.find(group => group.id === left.group_id);
    const rightGroup = groups.find(group => group.id === right.group_id);
    const bySection = (sectionNo.get(leftGroup?.section_id ?? "") ?? 0) - (sectionNo.get(rightGroup?.section_id ?? "") ?? 0);
    if (bySection !== 0) return bySection;
    const byGroup = (groupOrder.get(left.group_id) ?? 0) - (groupOrder.get(right.group_id) ?? 0);
    if (byGroup !== 0) return byGroup;
    return left.order_index - right.order_index;
  });
}

/** Chấm và gắn thêm giải thích cho từng câu. */
function buildResults(rows: QuestionRow[], answers: Record<string, string>): GradedResultItem[] {
  const graded = gradeQuestions(
    rows.map((row, index) => ({
      order: index + 1,
      answerKey: row.answer_key ?? "",
      acceptedAnswers: row.accepted_answers ?? [],
      answerGroup: row.answerGroup,
    })),
    answers,
  );
  return graded.map((item, index) => ({
    ...item,
    explanation: rows[index].explanation ?? "",
  }));
}

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["GET", "POST"]);
    const context = await requireAuthenticatedUser(request);

    // GET /grade-skill với header x-attempt-id : xem lại một lần làm bài đã lưu.
    if (request.method === "GET") {
      const url = new URL(request.url);
      const attemptId = request.headers.get("x-attempt-id") ?? url.searchParams.get("attemptId") ?? "";
      if (!/^[0-9a-f-]{36}$/i.test(attemptId)) {
        throw new AppError(400, "invalid_request", "A valid attemptId is required");
      }
      const attemptResult = await context.service
        .from("skill_attempts")
        .select("id,test_id,skill,answers,correct_count,total_count,band")
        .eq("id", attemptId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (attemptResult.error) throw databaseError("load the attempt");
      const attempt = attemptResult.data;
      if (!attempt) throw new AppError(404, "attempt_not_found", "Attempt not found");

      const testResult = await context.service
        .from("skill_tests")
        .select("id,skill,title")
        .eq("id", attempt.test_id)
        .maybeSingle();
      if (testResult.error) throw databaseError("load the test");

      const rows = await loadQuestions(context.service, attempt.test_id as string);
      const results = buildResults(rows, (attempt.answers ?? {}) as Record<string, string>);
      return jsonResponse(
        request,
        200,
        {
          attemptId: attempt.id,
          skill: attempt.skill,
          title: testResult.data?.title ?? "",
          correctCount: attempt.correct_count,
          totalCount: attempt.total_count,
          band: attempt.band === null ? null : Number(attempt.band),
          results,
        },
        { requestId: id },
      );
    }

    // POST /grade-skill : chấm bài mới và lưu lịch sử.
    const input = parseGradeSkill(await readJsonBody(request));

    const testResult = await context.service
      .from("skill_tests")
      .select("id,skill,title,test_type,status")
      .eq("id", input.testId)
      .maybeSingle();
    if (testResult.error) throw databaseError("load the test");
    const test = testResult.data;
    if (!test) throw new AppError(404, "test_not_found", "Test not found");
    if (test.status !== "published") {
      throw new AppError(409, "test_unavailable", "This test is not available right now");
    }

    const rows = await loadQuestions(context.service, input.testId);
    const results = buildResults(rows, input.answers);

    const correctCount = results.filter(item => item.isCorrect).length;
    const band = results.length
      ? bandFromRaw(correctCount, results.length, test.test_type === "general" ? "general" : "academic")
      : null;

    const attemptResult = await context.service
      .from("skill_attempts")
      .insert({
        user_id: context.userId,
        test_id: input.testId,
        skill: test.skill,
        answers: input.answers,
        correct_count: correctCount,
        total_count: results.length,
        band,
        time_spent_seconds: input.timeSpentSeconds,
      })
      .select("id,created_at")
      .maybeSingle();
    if (attemptResult.error) throw databaseError("save the attempt");

    return jsonResponse(
      request,
      200,
      {
        attemptId: attemptResult.data?.id ?? null,
        skill: test.skill,
        title: test.title,
        correctCount,
        totalCount: results.length,
        band,
        results,
      },
      { requestId: id },
    );
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
