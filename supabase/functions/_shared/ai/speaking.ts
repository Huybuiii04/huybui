/**
 * Hợp đồng dữ liệu của module Speaking.
 *
 * File này thuần túy (không I/O) để test được bằng `node --test`:
 *  - JSON schema cho tool-use của Claude (lớp 2 — chấm rubric ETS)
 *  - validate + tổng hợp band (server tự tính, không tin điểm tổng của model)
 *  - validate kết quả lớp 1 (Gemini đọc audio)
 *
 * Quy tắc tổng hợp band bám theo ghi chú (ii) của PDF band descriptor chính thức:
 * "A candidate will be rated on their average performance across all parts of the test."
 * Nên: band mỗi tiêu chí = trung bình điểm của tiêu chí đó qua MỌI turn (làm tròn nửa
 * band), rồi overall = trung bình 4 band tiêu chí (làm tròn nửa band).
 */

import { computeOverall } from "../jobs.ts";
import { SPEAKING_CRITERIA, type SpeakingCriterion } from "./speakingRubric.ts";

export const SPEAKING_SCHEMA_VERSION = "speaking-v1";

export type SpeakingCriterionScore = {
  criterion: SpeakingCriterion;
  score: number;
  rationale: string;
  evidence: string[];
  improvements: string[];
};

export type SpeakingTurnModelOutput = {
  turnId: string;
  criteria: SpeakingCriterionScore[];
  summary: string;
  strengths: string[];
  priority_actions: string[];
};

export type SpeakingModelOutput = {
  turns: SpeakingTurnModelOutput[];
  overall: { summary: string; priority_actions: string[] };
};

export type SpeakingScores = {
  fluency: number | null;
  lexical_resource: number | null;
  grammatical_range: number | null;
  pronunciation: number | null;
};

export type SpeakingTurnFeedback = {
  turnId: string;
  criteria: SpeakingCriterionScore[];
  summary: string;
  strengths: string[];
  priority_actions: string[];
};

export type SpeakingResult = {
  scores: SpeakingScores;
  overallRaw: number;
  overallDisplay: number;
  turns: SpeakingTurnFeedback[];
  overall: { summary: string; priority_actions: string[] };
};

export type AudioAnalysis = {
  transcript: string;
  fillerWords: string[];
  mispronounced: Array<{ word: string; issue: string }>;
  intonationNotes: string[];
  estimatedWpm: number | null;
  confidence: "high" | "medium" | "low";
};

export class SpeakingContractError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "SpeakingContractError";
  }
}

export const SPEAKING_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["turns", "overall"],
  properties: {
    turns: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["turnId", "criteria", "summary", "strengths", "priority_actions"],
        properties: {
          turnId: { type: "string" },
          criteria: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["criterion", "score", "rationale", "evidence", "improvements"],
              properties: {
                criterion: { type: "string", enum: [...SPEAKING_CRITERIA] },
                score: { type: "integer", minimum: 0, maximum: 9 },
                rationale: { type: "string" },
                evidence: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
              },
            },
          },
          summary: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          priority_actions: { type: "array", items: { type: "string" } },
        },
      },
    },
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "priority_actions"],
      properties: {
        summary: { type: "string" },
        priority_actions: { type: "array", items: { type: "string" } },
      },
    },
  },
} as const;

/** Làm tròn nửa band — cùng quy tắc với `computeOverall` trong jobs.ts. */
export function roundHalfBand(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Validate output của Claude và tự tính lại band tổng.
 *
 * @param output   JSON model trả về
 * @param context  turnIds hợp lệ của phiên (theo thứ tự đã gửi lên)
 */
export function buildSpeakingResult(
  output: SpeakingModelOutput,
  context: { turnIds: string[] },
): SpeakingResult {
  if (!output || typeof output !== "object") {
    throw new SpeakingContractError("invalid_output", "The model output is not an object");
  }
  if (!Array.isArray(output.turns) || output.turns.length === 0) {
    throw new SpeakingContractError("missing_turns", "The model returned no turns");
  }
  if (!output.turns.every((turn) => turn && typeof turn === "object")) {
    throw new SpeakingContractError("invalid_turn", "A turn is not an object");
  }

  const expected = new Set(context.turnIds);
  const seen = new Set<string>();
  const turns: SpeakingTurnFeedback[] = [];

  for (const turn of output.turns) {
    const turnId = typeof turn.turnId === "string" ? turn.turnId : "";
    if (!expected.has(turnId)) {
      throw new SpeakingContractError("unknown_turn", "The model returned a turn that was not requested");
    }
    if (seen.has(turnId)) {
      throw new SpeakingContractError("duplicate_turn", "The model returned the same turn twice");
    }
    seen.add(turnId);

    if (!Array.isArray(turn.criteria) || turn.criteria.length !== 4) {
      throw new SpeakingContractError("criterion_count", "Exactly four criteria are required per turn");
    }

    const criteria: SpeakingCriterionScore[] = [];
    const criteriaSeen = new Set<SpeakingCriterion>();
    for (const criterion of turn.criteria) {
      if (!criterion || typeof criterion !== "object") {
        throw new SpeakingContractError("invalid_criterion", "A criterion is not an object");
      }
      if (!SPEAKING_CRITERIA.includes(criterion.criterion)) {
        throw new SpeakingContractError("invalid_criterion", "Unknown speaking criterion");
      }
      if (criteriaSeen.has(criterion.criterion)) {
        throw new SpeakingContractError("criterion_duplicate", "A criterion was returned more than once");
      }
      criteriaSeen.add(criterion.criterion);

      if (!Number.isInteger(criterion.score) || criterion.score < 0 || criterion.score > 9) {
        throw new SpeakingContractError("invalid_score", "Criterion scores must be whole bands from 0 to 9");
      }
      if (typeof criterion.rationale !== "string" || !criterion.rationale.trim()) {
        throw new SpeakingContractError("invalid_rationale", "Every criterion requires a rationale");
      }
      criteria.push({
        criterion: criterion.criterion,
        score: criterion.score,
        rationale: criterion.rationale,
        evidence: validateStringArray(criterion.evidence, "evidence"),
        improvements: validateStringArray(criterion.improvements, "improvements"),
      });
    }

    turns.push({
      turnId,
      criteria,
      summary: typeof turn.summary === "string" ? turn.summary : "",
      strengths: validateStringArray(turn.strengths, "strengths"),
      priority_actions: validateStringArray(turn.priority_actions, "priority_actions"),
    });
  }

  if (seen.size !== expected.size) {
    throw new SpeakingContractError("missing_turn", "The model did not score every turn");
  }

  const scores = aggregateTurnScores(turns);
  const overall = output.overall ?? { summary: "", priority_actions: [] };

  return {
    scores: scores.scores,
    overallRaw: scores.overallRaw,
    overallDisplay: scores.overallDisplay,
    turns,
    overall: {
      summary: typeof overall.summary === "string" ? overall.summary : "",
      priority_actions: validateStringArray(overall.priority_actions, "priority_actions"),
    },
  };
}

/**
 * Tính band từng tiêu chí bằng trung bình qua các turn, rồi tính overall.
 * Đây là hiện thực luật IELTS "average performance across all parts".
 */
export function aggregateTurnScores(turns: Array<{ criteria: Array<{ criterion: SpeakingCriterion; score: number }> }>): {
  scores: SpeakingScores;
  overallRaw: number;
  overallDisplay: number;
} {
  const scores = {} as SpeakingScores;
  for (const criterion of SPEAKING_CRITERIA) {
    const values = turns
      .map((turn) => turn.criteria.find((item) => item.criterion === criterion)?.score)
      .filter((value): value is number => typeof value === "number");
    const average = values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
    scores[criterion] = roundHalfBand(average);
  }
  const overall = computeOverall(SPEAKING_CRITERIA.map((criterion) => scores[criterion] ?? 0));
  return { scores, overallRaw: overall.overallRaw, overallDisplay: overall.overallDisplay };
}

/**
 * Đổi turnId mà model tự đặt về turnId thật.
 *
 * Với turnId là UUID, model hay "tiện tay" đặt lại thành nhãn đọc được
 * ("TURN 1 (part-1)") — hợp đồng validate yêu cầu đúng UUID nên phần chấm fail.
 * Ở đây ta gửi model mã đơn giản ("turn-1", "turn-2") rồi map ngược về UUID thật.
 */
export function remapTurnIds(output: SpeakingModelOutput, turnIds: string[]): SpeakingModelOutput {
  if (!output || !Array.isArray(output.turns)) return output;
  const promptIds = new Map<string, string>();
  turnIds.forEach((id, index) => promptIds.set(`turn-${index + 1}`, id));

  const used = new Set<string>();
  const turns = output.turns.map((turn, index) => {
    if (!turn || typeof turn !== "object") return turn;
    const raw = typeof turn.turnId === "string" ? turn.turnId.trim() : "";
    let target = promptIds.get(raw) ?? promptIds.get(raw.toLowerCase());
    if (!target) {
      // Model tự dán nhãn ("TURN 1 (part-1)") → khớp theo số thứ tự trong nhãn,
      // không có thì theo vị trí trong mảng.
      const match = /(\d+)/.exec(raw);
      const position = match ? Number(match[1]) - 1 : index;
      target = turnIds[position] ?? turnIds[index];
    }
    if (!target || used.has(target)) return turn;
    used.add(target);
    return { ...turn, turnId: target };
  });
  return { ...output, turns };
}

/** Validate kết quả lớp 1 (Gemini đọc audio). */
export function parseAudioAnalysis(value: unknown): AudioAnalysis {
  if (!value || typeof value !== "object") {
    throw new SpeakingContractError("invalid_audio_analysis", "The audio analysis is not an object");
  }
  const record = value as Record<string, unknown>;
  // Transcript rỗng là hợp lệ (người học nói quá nhỏ / không nói gì) — chỉ thiếu hẳn key
  // mới là lỗi hợp đồng. Pipeline sẽ tự báo `no_speech_detected` nếu mọi turn đều rỗng.
  if (typeof record.transcript !== "string") {
    throw new SpeakingContractError("missing_transcript", "The audio analysis has no transcript");
  }
  const transcript = record.transcript.trim();
  const confidence = record.confidence;
  if (confidence !== "high" && confidence !== "medium" && confidence !== "low") {
    throw new SpeakingContractError("invalid_confidence", "The audio confidence must be high, medium or low");
  }
  const wpm = record.estimatedWpm;
  if (wpm !== null && wpm !== undefined && typeof wpm !== "number") {
    throw new SpeakingContractError("invalid_wpm", "The estimated words per minute must be a number or null");
  }
  const mispronounced = Array.isArray(record.mispronounced) ? record.mispronounced : [];
  if (!mispronounced.every((item) => item && typeof item === "object" && typeof (item as { word?: unknown }).word === "string")) {
    throw new SpeakingContractError("invalid_mispronounced", "Mispronounced words must be objects with a word");
  }

  return {
    transcript,
    fillerWords: validateStringArray(record.fillerWords, "fillerWords"),
    mispronounced: mispronounced.map((item) => ({
      word: String((item as { word: string }).word),
      issue: String((item as { issue?: string }).issue ?? ""),
    })),
    intonationNotes: validateStringArray(record.intonationNotes, "intonationNotes"),
    estimatedWpm: typeof wpm === "number" ? wpm : null,
    confidence,
  };
}

function validateStringArray(value: unknown, field: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new SpeakingContractError("invalid_array", `${field} must be an array of strings`);
  }
  return value as string[];
}
