/**
 * Kế hoạch phiên luyện nói: server sinh ra danh sách turn (mỗi turn = 1 recording)
 * dựa trên chế độ người học chọn.
 *
 * File thuần, không I/O — test được bằng `node --test`.
 *
 * Mỗi "test" của Cambridge gồm 4 dòng trong `speaking_questions`:
 *   part-1 (1 dòng) · part-2 (1 dòng) · part-3 (2 dòng: chủ đề A và chủ đề B).
 */

import type { SpeakingMode, SpeakingPart } from "../schemas.ts";

export type SpeakingCueCard = {
  topic: string;
  bullets: string[];
  time_limit_seconds: number;
  explain?: string;
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
  /** 0 cho Part 1/2; 0 và 1 cho hai chủ đề của Part 3. */
  sub_index?: number;
  book_number?: number | null;
  test_number?: number | null;
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

/** Sắp xếp các dòng của 1 test theo thứ tự luyện: P1 → P2 → P3A → P3B. */
function sortSetRows(rows: SpeakingQuestionRow[]): SpeakingQuestionRow[] {
  const partOrder: Record<SpeakingPart, number> = { "part-1": 0, "part-2": 1, "part-3": 2 };
  return [...rows].sort((a, b) => {
    if (partOrder[a.part] !== partOrder[b.part]) return partOrder[a.part] - partOrder[b.part];
    return (a.sub_index ?? 0) - (b.sub_index ?? 0);
  });
}

/**
 * Sinh kế hoạch phiên.
 *
 * - `part-1` / `part-2` / `part-3`: đúng 1 turn, lấy từ `setRows` (dòng của test được chọn).
 *   `part-3` ưu tiên dòng được chỉ định (`questionRow`), nếu không thì lấy chủ đề A.
 * - `mock` (full 3 phần): 4 turn — Part 1 → Part 2 → Part 3 chủ đề A → Part 3 chủ đề B.
 * - Khi không có `setRows`, `mock` rơi về cách chọn ngẫu nhiên trong kho câu hỏi cũ.
 */
export function buildSpeakingPlan(input: {
  mode: SpeakingMode;
  question: string | null;
  questionRow: SpeakingQuestionRow | null;
  setRows: SpeakingQuestionRow[];
  pool: { part1: SpeakingQuestionRow[]; part2: SpeakingQuestionRow[]; part3: SpeakingQuestionRow[] };
}): SpeakingPlanTurn[] {
  const { mode, question, questionRow, setRows, pool } = input;

  if (mode !== "mock") {
    if (setRows.length) {
      const wanted = mode as SpeakingPart;
      const candidates = sortSetRows(setRows).filter((row) => row.part === wanted);
      const picked =
        wanted === "part-3" && questionRow && questionRow.part === "part-3"
          ? questionRow
          : candidates[0];
      return picked ? [turnFromRow(picked, 0)] : [];
    }
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

  if (setRows.length) {
    return sortSetRows(setRows).map((row, index) => turnFromRow(row, index));
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
