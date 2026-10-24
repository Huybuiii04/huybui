import type { WritingToolOperation } from "../schemas.ts";
import { AiContractError } from "./grade.ts";

export { AiContractError } from "./grade.ts";

export const TOOL_SCHEMA_VERSION = "writing-tool-v1";

export interface MagicRewriteOutput {
  rewritten_text: string;
  changes: string[];
  cautions: string[];
}

export interface ReadImageOutput {
  extracted_data: Array<{
    label: string;
    value: string;
    unit: string;
    confidence: number;
    source_quote: string;
  }>;
  unreadable: string[];
  notes: string;
}

export interface ArgumentStressTestOutput {
  claims: Array<{
    claim: string;
    counterargument: string;
    strength: "weak" | "medium" | "strong";
    question: string;
  }>;
  weaknesses: string[];
  summary: string;
}

export interface CriticalThinkingOutput {
  questions: string[];
  assumptions: string[];
  counterarguments: string[];
  summary: string;
}

export type ToolOutput =
  | MagicRewriteOutput
  | ReadImageOutput
  | ArgumentStressTestOutput
  | CriticalThinkingOutput;

export const TOOL_JSON_SCHEMAS: Record<WritingToolOperation, Record<string, unknown>> = {
  "magic-rewrite": {
    type: "object",
    additionalProperties: false,
    required: ["rewritten_text", "changes", "cautions"],
    properties: {
      rewritten_text: { type: "string" },
      changes: { type: "array", items: { type: "string" } },
      cautions: { type: "array", items: { type: "string" } },
    },
  },
  "argument-stress-test": {
    type: "object",
    additionalProperties: false,
    required: ["claims", "weaknesses", "summary"],
    properties: {
      claims: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["claim", "counterargument", "strength", "question"],
          properties: {
            claim: { type: "string" },
            counterargument: { type: "string" },
            strength: { type: "string", enum: ["weak", "medium", "strong"] },
            question: { type: "string" },
          },
        },
      },
      weaknesses: { type: "array", items: { type: "string" } },
      summary: { type: "string" },
    },
  },
  "critical-thinking": {
    type: "object",
    additionalProperties: false,
    required: ["questions", "assumptions", "counterarguments", "summary"],
    properties: {
      questions: { type: "array", items: { type: "string" } },
      assumptions: { type: "array", items: { type: "string" } },
      counterarguments: { type: "array", items: { type: "string" } },
      summary: { type: "string" },
    },
  },
  "read-image": {
    type: "object",
    additionalProperties: false,
    required: ["extracted_data", "unreadable", "notes"],
    properties: {
      extracted_data: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "value", "unit", "confidence", "source_quote"],
          properties: {
            label: { type: "string" },
            value: { type: "string" },
            unit: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            source_quote: { type: "string" },
          },
        },
      },
      unreadable: { type: "array", items: { type: "string" } },
      notes: { type: "string" },
    },
  },
};

export function validateToolOutput(operation: WritingToolOperation, value: unknown): ToolOutput {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const output = value as Record<string, unknown>;

  if (operation === "magic-rewrite") {
    if (
      typeof output.rewritten_text !== "string" ||
      !isStringArray(output.changes) ||
      !isStringArray(output.cautions)
    ) invalid();
    return output as unknown as MagicRewriteOutput;
  }

  if (operation === "read-image") {
    if (!Array.isArray(output.extracted_data) || !isStringArray(output.unreadable) || typeof output.notes !== "string") {
      invalid();
    }
    for (const item of output.extracted_data) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof (item as { label?: unknown }).label !== "string" ||
        typeof (item as { value?: unknown }).value !== "string" ||
        typeof (item as { unit?: unknown }).unit !== "string" ||
        typeof (item as { confidence?: unknown }).confidence !== "number" ||
        typeof (item as { source_quote?: unknown }).source_quote !== "string"
      ) invalid();
    }
    return output as unknown as ReadImageOutput;
  }

  if (operation === "argument-stress-test") {
    if (!Array.isArray(output.claims) || !isStringArray(output.weaknesses) || typeof output.summary !== "string") {
      invalid();
    }
    for (const claim of output.claims) {
      if (
        !claim ||
        typeof claim !== "object" ||
        typeof (claim as { claim?: unknown }).claim !== "string" ||
        typeof (claim as { counterargument?: unknown }).counterargument !== "string" ||
        !["weak", "medium", "strong"].includes(String((claim as { strength?: unknown }).strength)) ||
        typeof (claim as { question?: unknown }).question !== "string"
      ) invalid();
    }
    return output as unknown as ArgumentStressTestOutput;
  }

  if (
    !isStringArray(output.questions) ||
    !isStringArray(output.assumptions) ||
    !isStringArray(output.counterarguments) ||
    typeof output.summary !== "string"
  ) {
    invalid();
  }
  return output as unknown as CriticalThinkingOutput;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function invalid(): never {
  throw new AiContractError("invalid_tool_output", "Invalid writing-tool output");
}
