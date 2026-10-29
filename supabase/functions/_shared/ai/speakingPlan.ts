/**
 * Kế hoạch phiên luyện nói: server sinh ra danh sách turn (mỗi turn = 1 recording)
 * dựa trên chế độ người học chọn.
 *
 * File thuần, không I/O — test được bằng `node --test`.
 */

import type { SpeakingMode, SpeakingPart } from "../schemas.ts";

export type SpeakingCueCard = {
  topic: string;
  bullets: string[];
  time_limit_seconds: number;
};

export type SpeakingQuestionRow = {
  id: string;
  part: SpeakingPart;
  slug: string;
  topic: string;
  prompt_text: string;
  questions: string[];
  cue_card: SpeakingCueCard | null;
  related_part3_slug: string | null;
};

export type SpeakingPlanTurn = {
  orderIndex: number;
  part: SpeakingPart;
  questionId: string | null;
  promptText: string;
  questions: string[];
  cueCard: SpeakingCueCard | null;
};

/** Chọn ngẫu nhiên 1 phần tử, không lặp lại phần tử đã chọn. */
function pickDistinct<T>(items: T[], used: Set<T>): T | null {
  const available = items.filter((item) => !used.has(item));
  if (!available.length) return null;
  const chosen = available[Math.floor(Math.random() * available.length)];
  used.add(chosen);
  return chosen;
}

function turnFromRow(row: SpeakingQuestionRow, orderIndex: number): SpeakingPlanTurn {
  return {
    orderIndex,
    part: row.part,
    questionId: row.id,
    promptText: row.prompt_text || row.topic,
    questions: row.questions ?? [],
    cueCard: row.cue_card ?? null,
  };
}

/**
 * Sinh kế hoạch phiên.
 *
 * - `part-1` / `part-2` / `part-3`: đúng 1 turn, dùng câu hỏi đã chọn.
 * - `mock`: 4 turn — 2 topic Part 1, 1 cue card Part 2, 1 topic Part 3.
 *   Topic Part 3 được ưu tiên theo `related_part3_slug` của cue card Part 2 để
 *   giữ đúng chủ đề như kỳ thi thật; không có thì chọn ngẫu nhiên.
 */
export function buildSpeakingPlan(input: {
  mode: SpeakingMode;
  question: string | null;
  questionRow: SpeakingQuestionRow | null;
  pool: { part1: SpeakingQuestionRow[]; part2: SpeakingQuestionRow[]; part3: SpeakingQuestionRow[] };
}): SpeakingPlanTurn[] {
  const { mode, question, questionRow, pool } = input;

  if (mode !== "mock") {
    if (questionRow) return [turnFromRow(questionRow, 0)];
    // Câu hỏi tự nhập: chỉ hợp lệ với Part 1 (câu hỏi mở đầu).
    if (question && mode === "part-1") {
      return [
        {
          orderIndex: 0,
          part: "part-1",
          questionId: null,
          promptText: question,
          questions: [question],
          cueCard: null,
        },
      ];
    }
    return [];
  }

  const usedPart1 = new Set<SpeakingQuestionRow>();
  const first = pickDistinct(pool.part1, usedPart1);
  const second = pickDistinct(pool.part1, usedPart1);
  const cueCard = pickDistinct(pool.part2, new Set<SpeakingQuestionRow>());

  let part3: SpeakingQuestionRow | null = null;
  if (cueCard?.related_part3_slug) {
    part3 = pool.part3.find((row) => row.slug === cueCard.related_part3_slug) ?? null;
  }
  if (!part3) part3 = pickDistinct(pool.part3, new Set<SpeakingQuestionRow>());

  const turns: SpeakingPlanTurn[] = [];
  if (first) turns.push(turnFromRow(first, turns.length));
  if (second) turns.push(turnFromRow(second, turns.length));
  if (cueCard) turns.push(turnFromRow(cueCard, turns.length));
  if (part3) turns.push(turnFromRow(part3, turns.length));
  return turns;
}
