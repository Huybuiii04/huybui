import { AiContractError } from "./grade.ts";

export { AiContractError } from "./grade.ts";

export const ENRICHMENT_SCHEMA_VERSION = "enrichment-v2";

/** Câu viết chưa hợp lý / lặp ý / thiếu căn cứ trong bài. */
export interface EnrichmentUnnaturalPoint {
  quote: string;
  issue: string;
  suggestion: string;
  severity: "minor" | "major";
}

/** Từ vựng nên học cho chủ đề bài ở band mục tiêu. */
export interface EnrichmentVocabularyWord {
  word: string;
  meaning: string;
  example: string;
  why: string;
}

/** Một bước trong lộ trình nâng band. */
export interface EnrichmentBandStep {
  title: string;
  detail: string;
  criterion: string;
  expected_gain: string;
}

export interface EnrichmentOutput {
  structure: {
    paragraphs: Array<{
      index: number;
      role: string;
      summary: string;
      link_to_next: string;
    }>;
  };
  lexical: {
    examples: Array<{
      term: string;
      meaning: string;
      evidence: string;
      correction: string;
    }>;
  };
  grammar: {
    examples: Array<{
      error: string;
      correction: string;
    }>;
  };
  errors: Array<{
    fingerprint: string;
    criterion: string;
    category: string;
    quote: string;
    correction: string;
    explanation: string;
    skill_tags: string[];
  }>;
  unnatural: EnrichmentUnnaturalPoint[];
  vocabulary_plan: {
    topic: string;
    words: EnrichmentVocabularyWord[];
  };
  band_plan: {
    current_band: number | null;
    target_band: number | null;
    steps: EnrichmentBandStep[];
  };
}

export const ENRICHMENT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "structure",
    "lexical",
    "grammar",
    "errors",
    "unnatural",
    "vocabulary_plan",
    "band_plan",
  ],
  properties: {
    structure: {
      type: "object",
      additionalProperties: false,
      required: ["paragraphs"],
      properties: {
        paragraphs: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["index", "role", "summary", "link_to_next"],
            properties: {
              index: { type: "integer", minimum: 0 },
              role: { type: "string" },
              summary: { type: "string" },
              link_to_next: { type: "string" },
            },
          },
        },
      },
    },
    lexical: {
      type: "object",
      additionalProperties: false,
      required: ["examples"],
      properties: {
        examples: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["term", "meaning", "evidence", "correction"],
            properties: {
              term: { type: "string" },
              meaning: { type: "string" },
              evidence: { type: "string" },
              correction: { type: "string" },
            },
          },
        },
      },
    },
    grammar: {
      type: "object",
      additionalProperties: false,
      required: ["examples"],
      properties: {
        examples: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["error", "correction"],
            properties: {
              error: { type: "string" },
              correction: { type: "string" },
            },
          },
        },
      },
    },
    errors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["fingerprint", "criterion", "category", "quote", "correction", "explanation", "skill_tags"],
        properties: {
          fingerprint: { type: "string" },
          criterion: { type: "string" },
          category: { type: "string" },
          quote: { type: "string" },
          correction: { type: "string" },
          explanation: { type: "string" },
          skill_tags: { type: "array", items: { type: "string" } },
        },
      },
    },
    unnatural: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["quote", "issue", "suggestion", "severity"],
        properties: {
          quote: { type: "string" },
          issue: { type: "string" },
          suggestion: { type: "string" },
          severity: { type: "string", enum: ["minor", "major"] },
        },
      },
    },
    vocabulary_plan: {
      type: "object",
      additionalProperties: false,
      required: ["topic", "words"],
      properties: {
        topic: { type: "string" },
        words: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["word", "meaning", "example", "why"],
            properties: {
              word: { type: "string" },
              meaning: { type: "string" },
              example: { type: "string" },
              why: { type: "string" },
            },
          },
        },
      },
    },
    band_plan: {
      type: "object",
      additionalProperties: false,
      required: ["current_band", "target_band", "steps"],
      properties: {
        current_band: { type: ["number", "null"] },
        target_band: { type: ["number", "null"] },
        steps: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "detail", "criterion", "expected_gain"],
            properties: {
              title: { type: "string" },
              detail: { type: "string" },
              criterion: { type: "string" },
              expected_gain: { type: "string" },
            },
          },
        },
      },
    },
  },
} as const;


/**
 * Làm sạch output của model: giữ lại phần đúng, bỏ phần hỏng.
 * Model đôi khi bỏ bớt field hoặc bỏ cả một nhóm — không nên vì vậy mất
 * toàn bộ phần tích đã có, nên ta chuẩn hoá thay vì ném lỗi.
 */
export function coerceEnrichmentOutput(value: unknown): EnrichmentOutput {
  const output = asRecord(value);
  const structure = asRecord(output.structure);
  const lexical = asRecord(output.lexical);
  const grammar = asRecord(output.grammar);
  const vocabularyPlan = asRecord(output.vocabulary_plan);
  const bandPlan = asRecord(output.band_plan);

  return {
    structure: {
      paragraphs: asArray(structure.paragraphs).flatMap(item => {
        const entry = asRecord(item);
        const role = asString(entry.role);
        if (!role) return [];
        return [{
          index: asNumber(entry.index) ?? 0,
          role,
          summary: asString(entry.summary) ?? "",
          link_to_next: asString(entry.link_to_next) ?? "",
        }];
      }),
    },
    lexical: {
      examples: asArray(lexical.examples).flatMap(item => {
        const entry = asRecord(item);
        const term = asString(entry.term);
        if (!term) return [];
        return [{
          term,
          meaning: asString(entry.meaning) ?? "",
          evidence: asString(entry.evidence) ?? "",
          correction: asString(entry.correction) ?? "",
        }];
      }),
    },
    grammar: {
      examples: asArray(grammar.examples).flatMap(item => {
        const entry = asRecord(item);
        const error = asString(entry.error);
        if (!error) return [];
        return [{ error, correction: asString(entry.correction) ?? "" }];
      }),
    },
    errors: asArray(output.errors).flatMap(item => {
      const entry = asRecord(item);
      const quote = asString(entry.quote);
      if (!quote) return [];
      return [{
        fingerprint: asString(entry.fingerprint) ?? "",
        criterion: asString(entry.criterion) ?? "",
        category: asString(entry.category) ?? "",
        quote,
        correction: asString(entry.correction) ?? "",
        explanation: asString(entry.explanation) ?? "",
        skill_tags: asArray(entry.skill_tags).filter((tag): tag is string => typeof tag === "string"),
      }];
    }),
    unnatural: asArray(output.unnatural).flatMap(item => {
      const entry = asRecord(item);
      const quote = asString(entry.quote);
      if (!quote) return [];
      return [{
        quote,
        issue: asString(entry.issue) ?? "",
        suggestion: asString(entry.suggestion) ?? "",
        severity: entry.severity === "major" ? "major" : "minor",
      }];
    }),
    vocabulary_plan: {
      topic: asString(vocabularyPlan.topic) ?? "",
      words: asArray(vocabularyPlan.words).flatMap(item => {
        const entry = asRecord(item);
        const word = asString(entry.word);
        if (!word) return [];
        return [{
          word,
          meaning: asString(entry.meaning) ?? "",
          example: asString(entry.example) ?? "",
          why: asString(entry.why) ?? "",
        }];
      }),
    },
    band_plan: {
      current_band: asNumber(bandPlan.current_band) ?? null,
      target_band: asNumber(bandPlan.target_band) ?? null,
      steps: asArray(bandPlan.steps).flatMap(item => {
        const entry = asRecord(item);
        const title = asString(entry.title);
        if (!title) return [];
        return [{
          title,
          detail: asString(entry.detail) ?? "",
          criterion: asString(entry.criterion) ?? "",
          expected_gain: asString(entry.expected_gain) ?? "",
        }];
      }),
    },
  };
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
