/**
 * Band descriptor chính thức của IELTS Speaking, trích nguyên văn từ
 * https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf
 * (bản public, dùng chung cho Academic và General Training).
 *
 * Khác với Writing, ở Speaking mỗi band mô tả MỘT khối đặc tính duy nhất, không tách
 * dương/âm. Vì vậy `positive` = mô tả của band, còn `negative` = ràng buộc "phải đạt đủ"
 * theo ghi chú (i) của PDF:
 *
 *   (i) A candidate must fully fit the positive features of the descriptor at a particular level.
 *   (ii) A candidate will be rated on their average performance across all parts of the test.
 *
 * Band 7 / 5 / 3 của Pronunciation không có mô tả riêng — PDF định nghĩa chúng theo quan
 * hệ với band kề (xem PRONUNCIATION_RELATIVE_BANDS).
 */

export type SpeakingCriterion =
  | "fluency"
  | "lexical_resource"
  | "grammatical_range"
  | "pronunciation";

export type SpeakingBandDescriptor = {
  band: number;
  positive: string[];
  negative: string[];
};

export const SPEAKING_CRITERIA: SpeakingCriterion[] = [
  "fluency",
  "lexical_resource",
  "grammatical_range",
  "pronunciation",
];

export const CRITERION_LABELS: Record<SpeakingCriterion, string> = {
  fluency: "Fluency and Coherence",
  lexical_resource: "Lexical Resource",
  grammatical_range: "Grammatical Range and Accuracy",
  pronunciation: "Pronunciation",
};

/** Ghi chú bắt buộc từ PDF, đưa nguyên văn vào prompt. */
export const IELTS_SPEAKING_NOTES = [
  "(i) A candidate must fully fit the positive features of the descriptor at a particular level.",
  "(ii) A candidate will be rated on their average performance across all parts of the test.",
  "Band 7, 5 and 3 of Pronunciation have no stand-alone description: band 7 means all the positive features of band 6 plus some, but not all, of the positive features of band 8; band 5 means all the positive features of band 4 plus some, but not all, of the positive features of band 6; band 3 means some features of band 2 plus some, but not all, of the positive features of band 4.",
];

const FLUENCY: SpeakingBandDescriptor[] = [
  {
    band: 9,
    positive: [
      "Fluent with only very occasional repetition or self-correction.",
      "Any hesitation that occurs is used only to prepare the content of the next utterance and not to find words or grammar.",
      "Speech is situationally appropriate and cohesive features are fully acceptable.",
      "Topic development is fully coherent and appropriately extended.",
    ],
    negative: ["Must fully fit every positive feature of band 9."],
  },
  {
    band: 8,
    positive: [
      "Fluent with only very occasional repetition or self-correction.",
      "Hesitation may occasionally be used to find words or grammar, but most will be content related.",
      "Topic development is coherent, appropriate and relevant.",
    ],
    negative: ["Must fully fit every positive feature of band 8 and show none of the band 7 limitations."],
  },
  {
    band: 7,
    positive: [
      "Able to keep going and readily produce long turns without noticeable effort.",
      "Some hesitation, repetition and/or self-correction may occur, often mid-sentence and indicate problems with accessing appropriate language; however, these will not affect coherence.",
      "Flexible use of spoken discourse markers, connectives and cohesive features.",
    ],
    negative: ["Must fully fit every positive feature of band 7 and show none of the band 6 limitations."],
  },
  {
    band: 6,
    positive: [
      "Able to keep going and demonstrates a willingness to produce long turns.",
      "Coherence may be lost at times as a result of hesitation, repetition and/or self-correction.",
      "Uses a range of spoken discourse markers, connectives and cohesive features though not always appropriately.",
    ],
    negative: ["Must fully fit every positive feature of band 6 and show none of the band 5 limitations."],
  },
  {
    band: 5,
    positive: [
      "Usually able to keep going, but relies on repetition and self-correction to do so and/or on slow speech.",
      "Hesitations are often associated with mid-sentence searches for fairly basic lexis and grammar.",
      "Overuse of certain discourse markers, connectives and other cohesive features.",
      "More complex speech usually causes disfluency but simpler language may be produced fluently.",
    ],
    negative: ["Must fully fit every positive feature of band 5 and show none of the band 4 limitations."],
  },
  {
    band: 4,
    positive: [
      "Unable to keep going without noticeable pauses.",
      "Speech may be slow with frequent repetition.",
      "Often self-corrects.",
      "Can link simple sentences but often with repetitious use of connectives.",
      "Some breakdowns in coherence.",
    ],
    negative: ["Must fully fit every positive feature of band 4 and show none of the band 3 limitations."],
  },
  {
    band: 3,
    positive: [
      "Frequent, sometimes long, pauses occur while candidate searches for words.",
      "Limited ability to link simple sentences and go beyond simple responses to questions.",
      "Frequently unable to convey basic message.",
    ],
    negative: ["Must fully fit every positive feature of band 3 and show none of the band 2 limitations."],
  },
];

const LEXICAL: SpeakingBandDescriptor[] = [
  {
    band: 9,
    positive: [
      "Total flexibility and precise use in all contexts.",
      "Sustained use of accurate and idiomatic language.",
    ],
    negative: ["Must fully fit every positive feature of band 9."],
  },
  {
    band: 8,
    positive: [
      "Wide resource, readily and flexibly used to discuss all topics and convey precise meaning.",
      "Skilful use of less common and idiomatic items despite occasional inaccuracies in word choice and collocation.",
      "Effective use of paraphrase as required.",
    ],
    negative: ["Must fully fit every positive feature of band 8 and show none of the band 7 limitations."],
  },
  {
    band: 7,
    positive: [
      "Resource flexibly used to discuss a variety of topics.",
      "Some ability to use less common and idiomatic items and an awareness of style and collocation is evident though inappropriacies occur.",
      "Effective use of paraphrase as required.",
    ],
    negative: ["Must fully fit every positive feature of band 7 and show none of the band 6 limitations."],
  },
  {
    band: 6,
    positive: [
      "Resource sufficient to discuss topics at length.",
      "Vocabulary use may be inappropriate but meaning is clear.",
      "Generally able to paraphrase successfully.",
    ],
    negative: ["Must fully fit every positive feature of band 6 and show none of the band 5 limitations."],
  },
  {
    band: 5,
    positive: [
      "Resource sufficient to discuss familiar and unfamiliar topics but there is limited flexibility.",
      "Attempts paraphrase but not always with success.",
    ],
    negative: ["Must fully fit every positive feature of band 5 and show none of the band 4 limitations."],
  },
  {
    band: 4,
    positive: [
      "Resource sufficient for familiar topics but only basic meaning can be conveyed on unfamiliar topics.",
      "Frequent inappropriacies and errors in word choice.",
      "Rarely attempts paraphrase.",
    ],
    negative: ["Must fully fit every positive feature of band 4 and show none of the band 3 limitations."],
  },
  {
    band: 3,
    positive: [
      "Resource limited to simple vocabulary used primarily to convey personal information.",
      "Vocabulary inadequate for unfamiliar topics.",
    ],
    negative: ["Must fully fit every positive feature of band 3 and show none of the band 2 limitations."],
  },
];

const GRAMMATICAL: SpeakingBandDescriptor[] = [
  {
    band: 9,
    positive: [
      "Structures are precise and accurate at all times, apart from 'mistakes' characteristic of native speaker speech.",
    ],
    negative: ["Must fully fit every positive feature of band 9."],
  },
  {
    band: 8,
    positive: [
      "Wide range of structures, flexibly used.",
      "The majority of sentences are error free.",
      "Occasional inappropriacies and non-systematic errors occur. A few basic errors may persist.",
    ],
    negative: ["Must fully fit every positive feature of band 8 and show none of the band 7 limitations."],
  },
  {
    band: 7,
    positive: [
      "A range of structures flexibly used.",
      "Error-free sentences are frequent.",
      "Both simple and complex sentences are used effectively despite some errors. A few basic errors persist.",
    ],
    negative: ["Must fully fit every positive feature of band 7 and show none of the band 6 limitations."],
  },
  {
    band: 6,
    positive: [
      "Produces a mix of short and complex sentence forms and a variety of structures with limited flexibility.",
      "Though errors frequently occur in complex structures, these rarely impede communication.",
    ],
    negative: ["Must fully fit every positive feature of band 6 and show none of the band 5 limitations."],
  },
  {
    band: 5,
    positive: [
      "Basic sentence forms are fairly well controlled for accuracy.",
      "Complex structures are attempted but these are limited in range, nearly always contain errors and may lead to the need for reformulation.",
    ],
    negative: ["Must fully fit every positive feature of band 5 and show none of the band 4 limitations."],
  },
  {
    band: 4,
    positive: [
      "Can produce basic sentence forms and some short utterances are error-free.",
      "Subordinate clauses are rare and, overall, turns are short, structures are repetitive and errors are frequent.",
    ],
    negative: ["Must fully fit every positive feature of band 4 and show none of the band 3 limitations."],
  },
  {
    band: 3,
    positive: [
      "Basic sentence forms are attempted but grammatical errors are numerous except in apparently memorised utterances.",
    ],
    negative: ["Must fully fit every positive feature of band 3 and show none of the band 2 limitations."],
  },
];

const PRONUNCIATION: SpeakingBandDescriptor[] = [
  {
    band: 9,
    positive: [
      "Uses a full range of phonological features to convey precise and/or subtle meaning.",
      "Flexible use of features of connected speech is sustained throughout.",
      "Can be effortlessly understood throughout.",
      "Accent has no effect on intelligibility.",
    ],
    negative: ["Must fully fit every positive feature of band 9."],
  },
  {
    band: 8,
    positive: [
      "Uses a wide range of phonological features to convey precise and/or subtle meaning.",
      "Can sustain appropriate rhythm.",
      "Flexible use of stress and intonation across long utterances, despite occasional lapses.",
      "Can be easily understood throughout.",
      "Accent has minimal effect on intelligibility.",
    ],
    negative: ["Must fully fit every positive feature of band 8 and show none of the band 7 limitations."],
  },
  {
    band: 7,
    positive: [
      "Displays all the positive features of band 6, and some, but not all, of the positive features of band 8.",
    ],
    negative: ["Must fully fit every positive feature of band 7 and show none of the band 6 limitations."],
  },
  {
    band: 6,
    positive: [
      "Uses a range of phonological features, but control is variable.",
      "Chunking is generally appropriate, but rhythm may be affected by a lack of stress-timing and/or a rapid speech rate.",
      "Some effective use of intonation and stress, but this is not sustained.",
      "Individual words or phonemes may be mispronounced but this causes only occasional lack of clarity.",
      "Can generally be understood throughout without much effort.",
    ],
    negative: ["Must fully fit every positive feature of band 6 and show none of the band 5 limitations."],
  },
  {
    band: 5,
    positive: [
      "Displays all the positive features of band 4, and some, but not all, of the positive features of band 6.",
    ],
    negative: ["Must fully fit every positive feature of band 5 and show none of the band 4 limitations."],
  },
  {
    band: 4,
    positive: [
      "Uses some acceptable phonological features, but the range is limited.",
      "Produces some acceptable chunking, but there are frequent lapses in overall rhythm.",
      "Attempts to use intonation and stress, but control is limited.",
      "Individual words or phonemes are frequently mispronounced, causing lack of clarity.",
      "Understanding requires some effort and there may be patches of speech that cannot be understood.",
    ],
    negative: ["Must fully fit every positive feature of band 4 and show none of the band 3 limitations."],
  },
  {
    band: 3,
    positive: [
      "Displays some features of band 2, and some, but not all, of the positive features of band 4.",
    ],
    negative: ["Must fully fit every positive feature of band 3 and show none of the band 2 limitations."],
  },
];

export const SPEAKING_BAND_DESCRIPTORS: Record<SpeakingCriterion, SpeakingBandDescriptor[]> = {
  fluency: FLUENCY,
  lexical_resource: LEXICAL,
  grammatical_range: GRAMMATICAL,
  pronunciation: PRONUNCIATION,
};

/** Band descriptor của một tiêu chí, sắp theo band giảm dần. */
export function speakingBandDescriptor(criterion: SpeakingCriterion): SpeakingBandDescriptor[] {
  const descriptors = SPEAKING_BAND_DESCRIPTORS[criterion];
  if (!descriptors) return [];
  return [...descriptors].sort((left, right) => right.band - left.band);
}

/**
 * Render rubric thành text cho system prompt.
 * Chỉ lấy band 3–9: đây là dải thực tế người học IELTS quan tâm.
 */
export function renderSpeakingRubric(options: { minBand?: number; maxBand?: number } = {}): string {
  const minBand = options.minBand ?? 3;
  const maxBand = options.maxBand ?? 9;
  const lines: string[] = [];
  for (const criterion of SPEAKING_CRITERIA) {
    lines.push(`### ${CRITERION_LABELS[criterion]}`);
    for (const descriptor of speakingBandDescriptor(criterion)) {
      if (descriptor.band < minBand || descriptor.band > maxBand) continue;
      lines.push(`BAND ${descriptor.band}`);
      for (const feature of descriptor.positive) lines.push(`  + ${feature}`);
      for (const feature of descriptor.negative) lines.push(`  - ${feature}`);
    }
    lines.push("");
  }
  lines.push("NOTES");
  for (const note of IELTS_SPEAKING_NOTES) lines.push(`  ${note}`);
  return lines.join("\n");
}
