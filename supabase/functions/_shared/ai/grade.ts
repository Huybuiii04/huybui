import { computeOverall, verifyEvidence, type EvidenceLocation } from "../jobs.ts";

export const GRADING_SCHEMA_VERSION = "grading-v1";

export type CriterionName =
  | "task_achievement"
  | "task_response"
  | "coherence_ability"
  | "lexical_resource"
  | "grammatical_range";

export type TaskCheckStatus = "met" | "partial" | "not_met" | "not_applicable";

export interface GradingCriterionOutput {
  criterion: CriterionName;
  score: number;
  rationale: string;
  evidence: string[];
  improvements: string[];
}

export interface GradingModelOutput {
  status: "ok" | "needs_reference";
  criteria?: GradingCriterionOutput[];
  missing_reference?: string[];
  summary: string;
  strengths: string[];
  priority_actions: string[];
  task_checks: Array<{
    requirement: string;
    status: TaskCheckStatus;
    note: string;
  }>;
}

export interface GradingCriterionFeedback {
  score: number;
  rationale: string;
  evidence: EvidenceLocation[];
  improvements: string[];
}

export interface GradingScores {
  task_achievement: number | null;
  task_response: number | null;
  coherence_ability: number | null;
  lexical_resource: number | null;
  grammatical_range: number | null;
}

export interface GradingResult {
  status: "ok" | "needs_reference";
  scores: GradingScores;
  overallRaw: number | null;
  overallDisplay: number | null;
  feedback: {
    status: "ok" | "needs_reference";
    summary: string;
    strengths: string[];
    priority_actions: string[];
    task_checks: Array<{
      requirement: string;
      status: TaskCheckStatus;
      note: string;
    }>;
    missing_reference?: string[];
    criteria: Partial<Record<CriterionName, GradingCriterionFeedback>>;
  };
}

export class AiContractError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "AiContractError";
  }
}

const ALL_CRITERIA: CriterionName[] = [
  "task_achievement",
  "task_response",
  "coherence_ability",
  "lexical_resource",
  "grammatical_range",
];

const TASK_CHECK_STATUSES: TaskCheckStatus[] = ["met", "partial", "not_met", "not_applicable"];

export const GRADING_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["status", "summary", "strengths", "priority_actions", "task_checks"],
  properties: {
    status: { type: "string", enum: ["ok", "needs_reference"] },
    criteria: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["criterion", "score", "rationale", "evidence", "improvements"],
        properties: {
          criterion: { type: "string", enum: ALL_CRITERIA },
          score: { type: "integer", minimum: 0, maximum: 9 },
          rationale: { type: "string" },
          evidence: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
        },
      },
    },
    missing_reference: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    priority_actions: { type: "array", items: { type: "string" } },
    task_checks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["requirement", "status", "note"],
        properties: {
          requirement: { type: "string" },
          status: { type: "string", enum: TASK_CHECK_STATUSES },
          note: { type: "string" },
        },
      },
    },
  },
} as const;

export function buildGradingResult(
  output: GradingModelOutput,
  context: { taskType: string; essayText: string },
): GradingResult {
  if (!output || typeof output !== "object") {
    throw new AiContractError("invalid_output", "The model output is not an object");
  }
  validateCommonFields(output);

  if (output.status === "needs_reference") {
    const missingReference = validateStringArray(output.missing_reference, "missing_reference");
    return {
      status: "needs_reference",
      scores: emptyScores(),
      overallRaw: null,
      overallDisplay: null,
      feedback: {
        status: "needs_reference",
        summary: output.summary,
        strengths: validateStringArray(output.strengths, "strengths"),
        priority_actions: validateStringArray(output.priority_actions, "priority_actions"),
        task_checks: validateTaskChecks(output.task_checks),
        missing_reference: missingReference,
        criteria: {},
      },
    };
  }

  if (output.status !== "ok") {
    throw new AiContractError("invalid_status", "Unknown grading status");
  }
  if (!Array.isArray(output.criteria) || output.criteria.length !== 4) {
    throw new AiContractError("criterion_count", "Exactly four criteria are required");
  }

  const requiredCriterion = context.taskType === "task2" ? "task_response" : "task_achievement";
  const expectedCriteria = new Set<CriterionName>([
    requiredCriterion,
    "coherence_ability",
    "lexical_resource",
    "grammatical_range",
  ]);
  const seen = new Set<CriterionName>();
  const feedbackCriteria: Partial<Record<CriterionName, GradingCriterionFeedback>> = {};
  const scores: GradingScores = emptyScores();

  for (const criterion of output.criteria) {
    if (!criterion || typeof criterion !== "object" || !ALL_CRITERIA.includes(criterion.criterion)) {
      throw new AiContractError("invalid_criterion", "Unknown grading criterion");
    }
    if (seen.has(criterion.criterion)) {
      throw new AiContractError("criterion_duplicate", "A criterion was returned more than once");
    }
    seen.add(criterion.criterion);

    if (!Number.isFinite(criterion.score) || criterion.score < 0 || criterion.score > 9) {
      throw new AiContractError("invalid_score", "Criterion scores must be between 0 and 9");
    }
    // Rubric chính thức định nghĩa band nguyên 0–9 cho từng tiêu chí; nửa
    // điểm chỉ xuất hiện ở overall (do trung bình). Model trả 6.5 là bịa số.
    if (!Number.isInteger(criterion.score)) {
      throw new AiContractError("invalid_score", "Criterion scores must be whole bands from 0 to 9");
    }
    if (typeof criterion.rationale !== "string" || criterion.rationale.trim().length === 0) {
      throw new AiContractError("invalid_rationale", "Every criterion requires a rationale");
    }

    const evidence = validateStringArray(criterion.evidence, "evidence");
    const improvements = validateStringArray(criterion.improvements, "improvements");
    feedbackCriteria[criterion.criterion] = {
      score: criterion.score,
      rationale: criterion.rationale,
      evidence: verifyEvidence(context.essayText, evidence),
      improvements,
    };
    scores[criterion.criterion] = criterion.score;
  }

  if (seen.size !== 4 || [...expectedCriteria].some((criterion) => !seen.has(criterion))) {
    throw new AiContractError("criterion_mismatch", "The criterion set does not match the task");
  }

  const overall = computeOverall([
    scores.task_achievement ?? scores.task_response ?? 0,
    scores.coherence_ability ?? 0,
    scores.lexical_resource ?? 0,
    scores.grammatical_range ?? 0,
  ]);

  return {
    status: "ok",
    scores,
    overallRaw: overall.overallRaw,
    overallDisplay: overall.overallDisplay,
    feedback: {
      status: "ok",
      summary: output.summary,
      strengths: validateStringArray(output.strengths, "strengths"),
      priority_actions: validateStringArray(output.priority_actions, "priority_actions"),
      task_checks: validateTaskChecks(output.task_checks),
      criteria: feedbackCriteria,
    },
  };
}

function emptyScores(): GradingScores {
  return {
    task_achievement: null,
    task_response: null,
    coherence_ability: null,
    lexical_resource: null,
    grammatical_range: null,
  };
}

function validateCommonFields(output: GradingModelOutput): void {
  if (typeof output.summary !== "string" || output.summary.trim().length === 0) {
    throw new AiContractError("invalid_summary", "A non-empty summary is required");
  }
  validateStringArray(output.strengths, "strengths");
  validateStringArray(output.priority_actions, "priority_actions");
  validateTaskChecks(output.task_checks);
}

function validateStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new AiContractError("invalid_array", `${field} must be an array of strings`);
  }
  return value;
}

function validateTaskChecks(value: unknown): Array<{
  requirement: string;
  status: TaskCheckStatus;
  note: string;
}> {
  if (!Array.isArray(value)) {
    throw new AiContractError("invalid_task_checks", "task_checks must be an array");
  }
  for (const check of value) {
    if (
      !check ||
      typeof check !== "object" ||
      typeof check.requirement !== "string" ||
      typeof check.note !== "string" ||
      !TASK_CHECK_STATUSES.includes(check.status)
    ) {
      throw new AiContractError("invalid_task_checks", "Invalid task check");
    }
  }
  return value;
}
