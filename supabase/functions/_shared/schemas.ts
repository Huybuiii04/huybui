export const MAX_ESSAY_CHARS = 30_000;
export const MAX_PROMPT_CHARS = 6_000;
export const MAX_REFERENCE_CHARS = 20_000;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const SUPPORTED_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type ImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];
export type TaskType = "task2" | "academic_task1" | "general_task1";
export type WritingToolOperation =
  | "magic-rewrite"
  | "argument-stress-test"
  | "critical-thinking"
  | "read-image";

export class SchemaError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = "SchemaError";
  }
}

export interface SubmitEssayInput {
  essayId: string;
  expectedVersion: number;
  idempotencyKey: string;
  mode: string;
}

export interface PrepareUploadInput {
  essayId: string;
  mimeType: ImageMimeType;
  byteSize: number;
  sha256: string;
}

export interface RunWritingToolInput {
  operation: WritingToolOperation;
  revisionId?: string;
  text?: string;
  prompt?: string;
  assetIds?: string[];
  idempotencyKey: string;
}

export interface RetryJobInput {
  jobId: string;
  idempotencyKey: string;
}

export interface DeleteEssayInput {
  essayId: string;
}

export interface DeleteAccountInput {
  confirmText: string;
}

export type AdminContentAction = "upsert" | "publish" | "hide" | "delete";

export interface AdminContentEntryInput {
  id?: string;
  kind?: "vocabulary" | "template" | "sample" | "guide" | "exercise" | "prompt";
  slug?: string;
  taskType?: TaskType | null;
  skillTags?: string[];
  sortOrder?: number;
  status?: "draft" | "published" | "hidden";
  metadata?: Record<string, unknown>;
}

export interface AdminTranslationInput {
  locale: "vi" | "en";
  title: string;
  summary: string;
  body: string;
}

export interface AdminContentInput {
  action: AdminContentAction;
  entry: AdminContentEntryInput;
  translations?: AdminTranslationInput[];
}

export type AdminUserAction = "suspend" | "restore" | "make_admin" | "remove_admin" | "list" | "delete";

export type AdminUsersInput =
  | { action: "list" }
  | { action: "suspend" | "restore" | "make_admin" | "remove_admin"; userId: string }
  | { action: "delete"; userId: string; confirmEmail: string };

export interface UsageQueryInput {
  from: string;
  to: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/i;

function fail(field: string, message: string): never {
  throw new SchemaError(field, message);
}

function asRecord(input: unknown, field = "body"): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    fail(field, "Expected a JSON object");
  }
  return input as Record<string, unknown>;
}

function requiredString(
  record: Record<string, unknown>,
  field: string,
  options: { min?: number; max?: number; pattern?: RegExp } = {},
): string {
  const value = record[field];
  if (typeof value !== "string") fail(field, `${field} must be a string`);
  const min = options.min ?? 1;
  if (value.length < min) fail(field, `${field} is too short`);
  if (options.max !== undefined && value.length > options.max) {
    fail(field, `${field} is too long`);
  }
  if (options.pattern && !options.pattern.test(value)) fail(field, `${field} has an invalid format`);
  return value;
}

function optionalString(
  record: Record<string, unknown>,
  field: string,
  options: { min?: number; max?: number } = {},
): string | undefined {
  const value = record[field];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") fail(field, `${field} must be a string`);
  const min = options.min ?? 0;
  if (value.length < min) fail(field, `${field} is too short`);
  if (options.max !== undefined && value.length > options.max) fail(field, `${field} is too long`);
  return value;
}

function requiredUuid(record: Record<string, unknown>, field: string): string {
  return requiredString(record, field, { pattern: UUID_PATTERN });
}

function requiredIdempotencyKey(record: Record<string, unknown>): string {
  return requiredString(record, "idempotencyKey", { pattern: IDEMPOTENCY_PATTERN });
}

function optionalUuidArray(record: Record<string, unknown>, field: string, maxItems: number): string[] | undefined {
  const value = record[field];
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) fail(field, `${field} must be an array`);
  if (value.length > maxItems) fail(field, `${field} contains too many items`);
  const ids = value.map((item, index) => {
    if (typeof item !== "string" || !UUID_PATTERN.test(item)) {
      fail(`${field}[${index}]`, `${field} must contain UUIDs`);
    }
    return item;
  });
  if (new Set(ids).size !== ids.length) fail(field, `${field} must not contain duplicate UUIDs`);
  return ids;
}

function parseTaskType(value: unknown, field: string): TaskType | null {
  if (value === undefined || value === null) return null;
  if (value !== "task2" && value !== "academic_task1" && value !== "general_task1") {
    fail(field, "Unknown task type");
  }
  return value;
}

export function parseSubmitEssay(input: unknown): SubmitEssayInput {
  const record = asRecord(input);
  const expectedVersion = record.expectedVersion;
  if (!Number.isInteger(expectedVersion) || (expectedVersion as number) < 1) {
    fail("expectedVersion", "expectedVersion must be a positive integer");
  }

  return {
    essayId: requiredUuid(record, "essayId"),
    expectedVersion: expectedVersion as number,
    idempotencyKey: requiredIdempotencyKey(record),
    mode: requiredString(record, "mode", { min: 1, max: 32 }),
  };
}

export function parsePrepareUpload(input: unknown): PrepareUploadInput {
  const record = asRecord(input);
  const mimeType = requiredString(record, "mimeType");
  if (!SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType as ImageMimeType)) {
    fail("mimeType", "Only PNG, JPEG, and WebP images are supported");
  }

  const byteSize = record.byteSize;
  if (!Number.isInteger(byteSize) || (byteSize as number) < 1 || (byteSize as number) > MAX_UPLOAD_BYTES) {
    fail("byteSize", "byteSize must be between 1 byte and 5 MiB");
  }

  return {
    essayId: requiredUuid(record, "essayId"),
    mimeType: mimeType as ImageMimeType,
    byteSize: byteSize as number,
    sha256: requiredString(record, "sha256", { pattern: SHA256_PATTERN }).toLowerCase(),
  };
}

export function parseRunWritingTool(input: unknown): RunWritingToolInput {
  const record = asRecord(input);
  const operation = requiredString(record, "operation");
  const allowed: WritingToolOperation[] = [
    "magic-rewrite",
    "argument-stress-test",
    "critical-thinking",
    "read-image",
  ];
  if (!allowed.includes(operation as WritingToolOperation)) {
    fail("operation", "Unsupported writing-tool operation");
  }

  const revisionId = optionalString(record, "revisionId", { max: 64 });
  if (revisionId !== undefined && !UUID_PATTERN.test(revisionId)) {
    fail("revisionId", "revisionId must be a UUID");
  }

  const text = optionalString(record, "text", { max: MAX_ESSAY_CHARS });
  const prompt = optionalString(record, "prompt", { max: MAX_PROMPT_CHARS });
  const assetIds = optionalUuidArray(record, "assetIds", 2);

  if (operation === "read-image" && (!assetIds || assetIds.length === 0)) {
    fail("assetIds", "read-image requires at least one assetId");
  }
  if (operation !== "read-image" && !revisionId && !text) {
    fail("text", "This operation requires revisionId or text");
  }

  return {
    operation: operation as WritingToolOperation,
    revisionId,
    text,
    prompt,
    assetIds,
    idempotencyKey: requiredIdempotencyKey(record),
  };
}

export function parseRetryJob(input: unknown): RetryJobInput {
  const record = asRecord(input);
  return {
    jobId: requiredUuid(record, "jobId"),
    idempotencyKey: requiredIdempotencyKey(record),
  };
}

export function parseDeleteEssay(input: unknown): DeleteEssayInput {
  const record = asRecord(input);
  return { essayId: requiredUuid(record, "essayId") };
}

export function parseDeleteAccount(input: unknown): DeleteAccountInput {
  const record = asRecord(input);
  const confirmText = requiredString(record, "confirmText", { max: 20 });
  if (confirmText !== "DELETE") fail("confirmText", "Type DELETE to confirm account deletion");
  return { confirmText };
}

export function parseAdminContent(input: unknown): AdminContentInput {
  const record = asRecord(input);
  const action = requiredString(record, "action");
  const allowed: AdminContentAction[] = ["upsert", "publish", "hide", "delete"];
  if (!allowed.includes(action as AdminContentAction)) fail("action", "Unsupported admin-content action");

  const entryRecord = asRecord(record.entry, "entry");
  const id = optionalString(entryRecord, "id", { max: 64 });
  if (id !== undefined && !UUID_PATTERN.test(id)) fail("entry.id", "entry.id must be a UUID");

  const kind = optionalString(entryRecord, "kind", { max: 32 });
  const allowedKinds = ["vocabulary", "template", "sample", "guide", "exercise", "prompt"];
  if (kind !== undefined && !allowedKinds.includes(kind)) fail("entry.kind", "Unsupported content kind");

  const slug = optionalString(entryRecord, "slug", { min: 1, max: 160 });
  if (action === "upsert" && !kind) fail("entry.kind", "upsert requires entry.kind");
  if (action === "upsert" && !slug) fail("entry.slug", "upsert requires entry.slug");
  const taskType = parseTaskType(entryRecord.taskType, "entry.taskType");

  const skillTagsValue = entryRecord.skillTags;
  let skillTags: string[] | undefined;
  if (skillTagsValue !== undefined) {
    if (!Array.isArray(skillTagsValue) || skillTagsValue.length > 50) {
      fail("entry.skillTags", "entry.skillTags must be an array with at most 50 items");
    }
    skillTags = skillTagsValue.map((item, index) => {
      if (typeof item !== "string" || item.length > 80) {
        fail(`entry.skillTags[${index}]`, "Skill tags must be short strings");
      }
      return item;
    });
  }

  const sortOrderValue = entryRecord.sortOrder;
  if (sortOrderValue !== undefined && (!Number.isInteger(sortOrderValue) || Math.abs(sortOrderValue as number) > 1_000_000)) {
    fail("entry.sortOrder", "entry.sortOrder must be an integer");
  }

  const statusValue = entryRecord.status;
  if (
    statusValue !== undefined &&
    statusValue !== "draft" &&
    statusValue !== "published" &&
    statusValue !== "hidden"
  ) {
    fail("entry.status", "Unsupported content status");
  }

  const metadataValue = entryRecord.metadata;
  if (metadataValue !== undefined && (metadataValue === null || typeof metadataValue !== "object" || Array.isArray(metadataValue))) {
    fail("entry.metadata", "entry.metadata must be a JSON object");
  }

  if (action !== "upsert" && !id) fail("entry.id", `${action} requires entry.id`);

  const translationsValue = record.translations;
  const translations: AdminTranslationInput[] = [];
  if (translationsValue !== undefined) {
    if (!Array.isArray(translationsValue) || translationsValue.length > 2) {
      fail("translations", "At most two translations are allowed");
    }
    for (const [index, item] of translationsValue.entries()) {
      const translation = asRecord(item, `translations[${index}]`);
      const locale = requiredString(translation, "locale");
      if (locale !== "vi" && locale !== "en") fail(`translations[${index}].locale`, "Locale must be vi or en");
      translations.push({
        locale,
        title: requiredString(translation, "title", { max: 500 }),
        summary: requiredString(translation, "summary", { max: 5_000 }),
        body: requiredString(translation, "body", { max: 100_000 }),
      });
    }
  }

  return {
    action: action as AdminContentAction,
    entry: {
      id,
      kind: kind as AdminContentEntryInput["kind"],
      slug,
      taskType,
      skillTags,
      sortOrder: sortOrderValue as number | undefined,
      status: statusValue as AdminContentEntryInput["status"],
      metadata: metadataValue as Record<string, unknown> | undefined,
    },
    translations,
  };
}

export function parseAdminUsers(input: unknown): AdminUsersInput {
  const record = asRecord(input);
  const action = requiredString(record, "action");
  const allowed: AdminUserAction[] = ["suspend", "restore", "make_admin", "remove_admin", "list", "delete"];
  if (!allowed.includes(action as AdminUserAction)) fail("action", "Unsupported admin-users action");

  if (action === "list") return { action: "list" };

  const userId = requiredUuid(record, "userId");
  if (action === "delete") {
    const confirmEmail = requiredString(record, "confirmEmail", { min: 1, max: 320 });
    if (!confirmEmail.trim()) fail("confirmEmail", "confirmEmail must not be empty");
    return { action: "delete", userId, confirmEmail };
  }

  return {
    action: action as "suspend" | "restore" | "make_admin" | "remove_admin",
    userId,
  };
}

export function parseUsageQuery(input: unknown): UsageQueryInput {
  const record = asRecord(input);
  const from = requiredString(record, "from", { max: 64 });
  const to = requiredString(record, "to", { max: 64 });
  const fromTime = Date.parse(from);
  const toTime = Date.parse(to);
  if (!Number.isFinite(fromTime)) fail("from", "from must be an ISO-8601 timestamp");
  if (!Number.isFinite(toTime)) fail("to", "to must be an ISO-8601 timestamp");
  if (toTime < fromTime) fail("to", "to must be later than or equal to from");
  if (toTime - fromTime > 366 * 24 * 60 * 60 * 1_000) {
    fail("to", "The usage range cannot exceed 366 days");
  }
  return { from: new Date(fromTime).toISOString(), to: new Date(toTime).toISOString() };
}

export interface GradeSkillInput {
  testId: string;
  answers: Record<string, string>;
  timeSpentSeconds: number;
}

export function parseGradeSkill(input: unknown): GradeSkillInput {
  const record = asRecord(input);
  const testId = requiredUuid(record, "testId");
  const rawAnswers = record.answers;
  if (rawAnswers === null || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) {
    fail("answers", "answers must be an object");
  }
  const answers: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawAnswers as Record<string, unknown>)) {
    if (!/^\d{1,3}$/.test(key)) fail("answers", "answer keys must be question numbers");
    if (typeof value !== "string") fail("answers", "answer values must be strings");
    if (value.length > 200) fail("answers", "an answer is too long");
    answers[key] = value;
  }
  const timeSpentSeconds = record.timeSpentSeconds ?? 0;
  if (typeof timeSpentSeconds !== "number" || !Number.isFinite(timeSpentSeconds) || timeSpentSeconds < 0) {
    fail("timeSpentSeconds", "timeSpentSeconds must be a positive number");
  }
  return { testId, answers, timeSpentSeconds: Math.floor(timeSpentSeconds) };
}
