export interface CacheKeyInput {
  ownerId: string;
  operation: string;
  task: string;
  subtype?: string;
  essayText: string;
  promptText: string;
  referenceData: string;
  imageHashes: string[];
  feedbackLocale: string;
  targetBand: number | null;
  model: string;
  promptVersion: string;
  rubricVersion: string;
  schemaVersion: string;
  additionalData?: unknown;
}

export interface RevisionInputHashInput {
  essayText: string;
  promptText: string;
  referenceData: string;
  feedbackLocale: string;
  model: string;
  imageHashes: string[];
}

export interface EvidenceLocation {
  text: string;
  start: number;
  end: number;
  paragraphIndex: number;
}

export async function sha256Hex(value: string | Uint8Array): Promise<string> {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes).buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function stableStringify(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) failSerialization("Non-finite number");
    return JSON.stringify(value);
  }
  if (typeof value === "bigint") return JSON.stringify(value.toString());
  if (typeof value === "undefined") return "null";
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
    return `{${entries.join(",")}}`;
  }
  failSerialization("Unsupported value");
}

export async function buildCacheKey(input: CacheKeyInput): Promise<string> {
  const canonical = {
    ownerId: input.ownerId,
    operation: input.operation,
    task: input.task,
    subtype: input.subtype ?? "",
    essayText: input.essayText,
    promptText: input.promptText,
    referenceData: input.referenceData,
    imageHashes: [...input.imageHashes].sort(),
    feedbackLocale: input.feedbackLocale,
    targetBand: input.targetBand,
    model: input.model,
    promptVersion: input.promptVersion,
    rubricVersion: input.rubricVersion,
    schemaVersion: input.schemaVersion,
    additionalData: input.additionalData ?? null,
  };
  return await sha256Hex(stableStringify(canonical));
}

export async function buildRevisionInputHash(input: RevisionInputHashInput): Promise<string> {
  return await sha256Hex(
    stableStringify({
      essayText: input.essayText,
      promptText: input.promptText,
      referenceData: input.referenceData,
      feedbackLocale: input.feedbackLocale,
      model: input.model,
      imageHashes: [...input.imageHashes].sort(),
    }),
  );
}

export async function deterministicUuid(namespace: string, ...parts: string[]): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${namespace}\u0000${parts.join("\u0000")}`)),
  );
  digest[6] = (digest[6] & 0x0f) | 0x50;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = Array.from(digest.slice(0, 16), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function computeOverall(scores: number[]): { overallRaw: number; overallDisplay: number } {
  if (scores.length !== 4 || scores.some((score) => !Number.isFinite(score))) {
    failSerialization("Exactly four finite criterion scores are required");
  }
  const overallRaw = scores.reduce((total, score) => total + score, 0) / 4;
  const overallDisplay = Math.round(overallRaw * 2) / 2;
  return { overallRaw, overallDisplay };
}

export function countWords(text: string): number {
  const matches = text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu);
  return matches?.length ?? 0;
}

export function verifyEvidence(text: string, evidence: string[]): EvidenceLocation[] {
  const locations: EvidenceLocation[] = [];
  for (const quote of evidence) {
    if (typeof quote !== "string" || quote.length === 0) continue;
    const start = text.indexOf(quote);
    if (start < 0) continue;
    const end = start + quote.length;
    const separators = text.slice(0, start).match(/\n\s*\n/g);
    locations.push({
      text: quote,
      start,
      end,
      paragraphIndex: separators?.length ?? 0,
    });
  }
  return locations;
}

function failSerialization(message: string): never {
  throw new TypeError(message);
}
