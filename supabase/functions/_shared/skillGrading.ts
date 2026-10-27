// Logic chấm điểm cho Reading / Listening.
//
// NGUỒN SỰ THẬT DUY NHẤT của quy tắc chấm. File này thuần (không import Deno,
// không import React) để chạy được trong Edge Function lẫn test của Node.
//
// Đáp án chỉ được đọc bằng service role trong Edge Function `grade-skill`;
// frontend không bao giờ nhận answer_key trước khi nộp bài.

export type GradingQuestion = {
  order: number;
  answerKey: string;
  acceptedAnswers: string[];
};

export type GradingResultItem = {
  order: number;
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
};

const ACADEMIC_BANDS: readonly (readonly [number, number])[] = [
  [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6],
  [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 2],
];

const GENERAL_BANDS: readonly (readonly [number, number])[] = [
  [40, 9], [39, 8.5], [37, 8], [36, 7.5], [34, 7], [32, 6.5], [30, 6],
  [27, 5.5], [23, 5], [19, 4.5], [15, 4], [12, 3.5], [9, 3], [6, 2.5], [0, 2],
];

/** Quy đổi số câu đúng sang band. Đề ngắn hơn 40 câu được quy về thang 40. */
export function bandFromRaw(
  correct: number,
  total: number,
  testType: "academic" | "general" = "academic",
): number {
  if (total <= 0) return 0;
  const scaled = Math.round((correct / total) * 40);
  const table = testType === "general" ? GENERAL_BANDS : ACADEMIC_BANDS;
  for (const [minimum, band] of table) {
    if (scaled >= minimum) return band;
  }
  return 0;
}

const normalize = (value: string): string => value.toLowerCase().replace(/\s+/g, " ").trim();

/** Expand mọi nhóm "(...)" thành biến thể có và không có phần trong ngoặc. */
function expandOptionalParens(text: string): string[] {
  const open = text.indexOf("(");
  if (open === -1) return [text];
  const close = text.indexOf(")", open);
  if (close === -1) return [text];
  const before = text.slice(0, open);
  const inner = text.slice(open + 1, close);
  const after = text.slice(close + 1);
  return [
    ...expandOptionalParens(before + inner + after),
    ...expandOptionalParens(before + after),
  ];
}

/**
 * "/" trong đáp án có thể thay cả cụm hoặc từng từ:
 * "after 11(:00)/eleven (o'clock)" = "after [11 | 11:00 | eleven | eleven o'clock]".
 */
function expandWordLevelSlashes(text: string): string[] {
  let phrases = [""];
  for (const token of text.split(/\s+/)) {
    const choices = token.includes("/") ? token.split("/").filter(Boolean) : [token];
    if (choices.length === 0) continue;
    phrases = phrases.flatMap((phrase) => choices.map((choice) => (phrase ? `${phrase} ${choice}` : choice)));
    if (phrases.length > 64) return [];
  }
  return phrases;
}

/** Tất cả dạng chuẩn hoá mà một đáp án kiểu Cambridge chấp nhận. */
export function expandAnswerKey(answerKey: string): string[] {
  const variants = new Set<string>();
  const addExpanded = (alternative: string) => {
    for (const variant of expandOptionalParens(alternative)) {
      const normalized = normalize(variant);
      if (normalized) variants.add(normalized);
    }
  };
  for (const phrase of answerKey.split(/\[or\]/i)) {
    for (const alternative of phrase.split("/")) addExpanded(alternative);
    if (phrase.includes("/")) {
      for (const alternative of expandWordLevelSlashes(phrase)) addExpanded(alternative);
    }
  }
  return [...variants];
}

/** Đáp án nhiều chỗ trống ("Friday + Sunday"): mọi phần đều phải có, thứ tự không quan trọng. */
function matchesMultiPartKey(userAnswer: string, keyParts: string[]): boolean {
  let userParts: string[] | null = null;
  for (const separator of [/\s*\+\s*/, /\s*&\s*/, /\s*,\s*/, /\s+and\s+/i]) {
    const parts = userAnswer.split(separator).map((part) => part.trim()).filter(Boolean);
    if (parts.length === keyParts.length) {
      userParts = parts;
      break;
    }
  }
  if (!userParts) return false;

  const used = new Array(keyParts.length).fill(false);
  const assign = (index: number): boolean => {
    if (index === userParts!.length) return true;
    for (let key = 0; key < keyParts.length; key += 1) {
      if (used[key]) continue;
      if (!matchesAnswerKey(userParts![index], keyParts[key])) continue;
      used[key] = true;
      if (assign(index + 1)) return true;
      used[key] = false;
    }
    return false;
  };
  return assign(0);
}

/** Các đáp án True/False/Not Given có nhóm từ đồng nghĩa. */
const TFNG_ALIASES: Readonly<Record<string, string>> = {
  true: "true",
  yes: "true",
  false: "false",
  no: "false",
  "not given": "not given",
  notgiven: "not given",
  "not-given": "not given",
};

/** So khớp câu trả lời của học viên với đáp án, không phân biệt hoa thường. */
export function matchesAnswerKey(
  userAnswer: string | null | undefined,
  answerKey: string | null | undefined,
): boolean {
  if (!userAnswer || !answerKey) return false;

  const multiParts = answerKey.split("+").map((part) => part.trim()).filter(Boolean);
  if (multiParts.length > 1) return matchesMultiPartKey(userAnswer.trim(), multiParts);

  const user = normalize(userAnswer.replace(/[()]/g, ""));
  if (!user) return false;

  const key = normalize(answerKey);
  if (!key) return false;

  const keyAlias = TFNG_ALIASES[key];
  if (keyAlias) return TFNG_ALIASES[user] === keyAlias;

  if (/^[a-f]$/.test(key)) {
    return user === key || user.startsWith(`${key} `) || user.startsWith(`${key}.`);
  }

  // Đáp án nhiều chữ cái: "A,C" hoặc "B|C".
  //
  // Học viên phải chọn ĐÚNG số chữ cái như đáp án: thiếu một chữ cái là sai
  // (không chấp nhận bộ con), thứ tự không quan trọng.
  //
  // Chỉ coi "," và "|" là dấu phân cách khi mọi phần đều là MỘT chữ cái, nhờ vậy
  // "after 11(:00)/eleven (o'clock)" hay "breathing, reproduction" không bị đụng tới.
  const letterParts = answerKey.split(/[,|]/).map((part) => normalize(part)).filter(Boolean);
  if (letterParts.length > 1 && letterParts.every((part) => /^[a-z]$/.test(part))) {
    const userParts = user.split(/[,|]/).map((part) => part.trim()).filter(Boolean);
    if (userParts.length !== letterParts.length) return false;
    return [...userParts].sort().join(",") === [...letterParts].sort().join(",");
  }

  // Đáp án ghi kèm nhãn của lựa chọn ("D. to give money …" cho câu matching):
  // thí sinh chỉ chọn nhãn nên nhãn đơn cũng phải được chấp.
  const labelledKey = /^([a-z])\.\s/.exec(key);
  if (labelledKey) {
    if (user === labelledKey[1]) return true;
    return expandAnswerKey(answerKey).includes(user);
  }

  return expandAnswerKey(answerKey).includes(user);
}

/** Chấm một danh sách câu hỏi; trả về kết quả từng câu theo đúng thứ tự. */
export function gradeQuestions(
  questions: GradingQuestion[],
  answers: Record<string, string>,
): GradingResultItem[] {
  return questions.map((question) => {
    const userAnswer = (answers[String(question.order)] ?? "").trim();
    const key = question.answerKey ?? "";
    const accepted = question.acceptedAnswers ?? [];
    const isCorrect = Boolean(key) && (
      matchesAnswerKey(userAnswer, key) ||
      accepted.some((alternative) => matchesAnswerKey(userAnswer, alternative))
    );
    return {
      order: question.order,
      isCorrect,
      correctAnswer: key,
      userAnswer,
    };
  });
}
