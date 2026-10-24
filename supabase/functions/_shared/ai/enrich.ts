import { AiContractError } from "./grade.ts";

export { AiContractError } from "./grade.ts";

export const ENRICHMENT_SCHEMA_VERSION = "enrichment-v1";

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
}

export const ENRICHMENT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["structure", "lexical", "grammar", "errors"],
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
  },
} as const;

export function validateEnrichmentOutput(value: unknown): EnrichmentOutput {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const output = value as Record<string, unknown>;
  const structure = output.structure as Record<string, unknown> | undefined;
  const lexical = output.lexical as Record<string, unknown> | undefined;
  const grammar = output.grammar as Record<string, unknown> | undefined;
  if (!structure || !lexical || !grammar || !Array.isArray(output.errors)) invalid();

  const paragraphs = structure.paragraphs;
  const lexicalExamples = lexical.examples;
  const grammarExamples = grammar.examples;
  if (!Array.isArray(paragraphs) || !Array.isArray(lexicalExamples) || !Array.isArray(grammarExamples)) invalid();

  for (const paragraph of paragraphs) {
    if (
      !paragraph ||
      typeof paragraph !== "object" ||
      !Number.isInteger((paragraph as { index?: unknown }).index) ||
      typeof (paragraph as { role?: unknown }).role !== "string" ||
      typeof (paragraph as { summary?: unknown }).summary !== "string" ||
      typeof (paragraph as { link_to_next?: unknown }).link_to_next !== "string"
    ) invalid();
  }
  for (const example of lexicalExamples) {
    if (
      !example ||
      typeof example !== "object" ||
      typeof (example as { term?: unknown }).term !== "string" ||
      typeof (example as { meaning?: unknown }).meaning !== "string" ||
      typeof (example as { evidence?: unknown }).evidence !== "string" ||
      typeof (example as { correction?: unknown }).correction !== "string"
    ) invalid();
  }
  for (const example of grammarExamples) {
    if (
      !example ||
      typeof example !== "object" ||
      typeof (example as { error?: unknown }).error !== "string" ||
      typeof (example as { correction?: unknown }).correction !== "string"
    ) invalid();
  }
  for (const error of output.errors) {
    if (
      !error ||
      typeof error !== "object" ||
      typeof (error as { fingerprint?: unknown }).fingerprint !== "string" ||
      typeof (error as { criterion?: unknown }).criterion !== "string" ||
      typeof (error as { category?: unknown }).category !== "string" ||
      typeof (error as { quote?: unknown }).quote !== "string" ||
      typeof (error as { correction?: unknown }).correction !== "string" ||
      typeof (error as { explanation?: unknown }).explanation !== "string" ||
      !Array.isArray((error as { skill_tags?: unknown }).skill_tags) ||
      (error as { skill_tags: unknown[] }).skill_tags.some((tag) => typeof tag !== "string")
    ) invalid();
  }

  return output as unknown as EnrichmentOutput;
}

function invalid(): never {
  throw new AiContractError("invalid_enrichment", "Invalid enrichment output");
}
