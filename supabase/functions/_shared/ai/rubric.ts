/**
 * Band descriptors chính thức của IELTS (rút gọn từ tài liệu ielts.org,
 * bản cập nhật 5/2023).
 *
 * Cơ chế quan trọng: mô tả band N gồm
 *   - `positive`: các đặc điểm PHẢI có để đạt band N
 *   - `negative`: các đặc điểm in đậm — nếu xuất hiện, band N KHÔNG đạt được
 *     (đây là "sàn" của band, theo đúng quy tắc của IELTS:
 *     "A script must fully fit the positive features of the descriptor at a
 *      particular level. Bolded text indicates negative features that will
 *      limit a rating.")
 *
 * Nguồn: https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf
 */

export type BandDescriptor = {
  /** Điểm của band (số nguyên 0–9). */
  band: number
  /** Đặc điểm phải có để đạt band này. */
  positive: string[]
  /** Đặc điểm tiêu cực — nếu có, phải hạ band. */
  negative: string[]
}

export type CriterionName =
  | "task_achievement"
  | "task_response"
  | "coherence_ability"
  | "lexical_resource"
  | "grammatical_range"

export type TaskType = "task1_academic" | "task1_general" | "task2"

/** Mô tả band cho từng tiêu chí, theo loại bài. */
export const BAND_DESCRIPTORS: Record<TaskType, Record<CriterionName, BandDescriptor[]>> = {
  task2: {
    task_response: [
      {
        band: 9,
        positive: [
          "The prompt is appropriately addressed and explored in depth.",
          "A clear and fully developed position is presented which directly answers the question/s.",
          "Ideas are relevant, fully extended and well supported.",
          "Any lapses in content or support are extremely rare.",
        ],
        negative: [],
      },
      {
        band: 8,
        positive: [
          "The prompt is appropriately and sufficiently addressed.",
          "A clear and well-developed position is presented in response to the question/s.",
          "Ideas are relevant, well extended and supported.",
        ],
        negative: ["Occasional omissions or lapses in content."],
      },
      {
        band: 7,
        positive: [
          "The main parts of the prompt are appropriately addressed.",
          "A clear and developed position is presented.",
          "Main ideas are extended and supported.",
        ],
        negative: [
          "There is a tendency to over-generalise or there is a lack of focus and precision in supporting ideas/material.",
          "A few lapses may occur, but these are minor.",
        ],
      },
      {
        band: 6,
        positive: [
          "The main parts of the prompt are addressed, though some may be more fully covered than others.",
          "An appropriate format is used.",
          "A position is presented that is directly relevant to the prompt.",
        ],
        negative: [
          "Conclusions drawn may be unclear, unjustified or repetitive.",
          "Some main ideas may be insufficiently developed or lack clarity.",
          "Some supporting arguments and evidence may be less relevant or inadequate.",
        ],
      },
      {
        band: 5,
        positive: [
          "The main parts of the prompt are incompletely addressed.",
          "The format may be inappropriate in places.",
          "The writer expresses a position, but the development is not always clear.",
        ],
        negative: [
          "Some main ideas are limited, not sufficiently developed and/or there may be irrelevant detail.",
          "There may be some repetition.",
        ],
      },
      {
        band: 4,
        positive: ["The prompt is tackled in a minimal way, or the answer is tangential."],
        negative: [
          "Main ideas are difficult to identify and may lack relevance, clarity and/or support.",
          "Large parts of the response may be repetitive.",
        ],
      },
    ],
    coherence_ability: [
      {
        band: 9,
        positive: [
          "The message can be followed effortlessly.",
          "Cohesion is used in such a way that it very rarely attracts attention.",
          "Paragraphing is skilfully managed.",
        ],
        negative: [],
      },
      {
        band: 8,
        positive: [
          "The message can be followed with ease.",
          "Information and ideas are logically sequenced, and cohesion is well managed.",
          "Paragraphing is used sufficiently and appropriately.",
        ],
        negative: ["Occasional lapses in coherence or cohesion."],
      },
      {
        band: 7,
        positive: [
          "Information and ideas are logically organised, and there is a clear progression throughout the response.",
          "A range of cohesive devices including reference and substitution is used flexibly.",
          "Paragraphing is generally used effectively to support overall coherence.",
        ],
        negative: [
          "A few lapses may occur, but these are minor.",
          "Some inaccuracies or some over/under use of cohesive devices.",
        ],
      },
      {
        band: 6,
        positive: [
          "Information and ideas are generally arranged coherently and there is a clear overall progression.",
          "Cohesive devices are used to some good effect.",
        ],
        negative: [
          "Cohesion within and/or between sentences may be faulty or mechanical due to misuse, overuse or omission.",
          "The use of reference and substitution may lack flexibility or clarity and result in some repetition or error.",
          "Paragraphing may not always be logical and/or the central topic may not always be clear.",
        ],
      },
      {
        band: 5,
        positive: [
          "Organisation is evident but is not wholly logical and there may be a lack of overall progression.",
          "Nevertheless, there is a sense of underlying coherence to the response.",
        ],
        negative: [
          "Sentences are not fluently linked to each other.",
          "There may be limited/overuse of cohesive devices with some inaccuracy.",
          "The writing may be repetitive due to inadequate and/or inaccurate use of reference and substitution.",
          "Paragraphing may be inadequate or missing.",
        ],
      },
      {
        band: 4,
        positive: ["Information and ideas are evident but not arranged coherently, and there is no clear progression."],
        negative: [
          "Relationships between ideas can be unclear and/or inadequately marked.",
          "There may be no paragraphing and/or no clear main topic within paragraphs.",
        ],
      },
    ],
    lexical_resource: [
      {
        band: 9,
        positive: [
          "A wide range of vocabulary is used accurately and appropriately with very natural and sophisticated control of lexical features.",
        ],
        negative: [],
      },
      {
        band: 8,
        positive: [
          "A wide resource is fluently and flexibly used to convey precise meanings within the scope of the task.",
          "There is skilful use of uncommon and/or idiomatic items when appropriate.",
        ],
        negative: ["Occasional inaccuracies in word choice and/or collocation."],
      },
      {
        band: 7,
        positive: [
          "The resource is sufficient to allow some flexibility and precision.",
          "There is some ability to use less common and/or idiomatic items.",
          "An awareness of style and collocation is evident.",
        ],
        negative: [
          "Inappropriacies occur.",
          "Only a few errors in spelling and/or word formation, and they do not detract from overall clarity.",
        ],
      },
      {
        band: 6,
        positive: [
          "The resource is generally adequate and appropriate for the task.",
          "The meaning is generally clear.",
        ],
        negative: [
          "A rather restricted range or a lack of precision in word choice.",
          "There are some errors in spelling and/or word formation, but they do not impede communication.",
        ],
      },
      {
        band: 5,
        positive: ["The resource is limited but minimally adequate for the task."],
        negative: [
          "There may be frequent lapses in the appropriacy of word choice, and a lack of flexibility is apparent in frequent simplifications/repetitions.",
          "Errors in spelling and/or word formation may be noticeable and may cause some difficulty for the reader.",
        ],
      },
      {
        band: 4,
        positive: ["The resource is limited and inadequate for or unrelated to the task."],
        negative: [
          "There may be inappropriate use of lexical chunks (e.g. memorised phrases, formulaic language and/or language from the input material).",
        ],
      },
    ],
    grammatical_range: [
      {
        band: 9,
        positive: [
          "A wide range of structures within the scope of the task is used with full flexibility and control.",
          "Punctuation and grammar are used appropriately throughout.",
        ],
        negative: [],
      },
      {
        band: 8,
        positive: [
          "A wide range of structures within the scope of the task is flexibly and accurately used.",
          "The majority of sentences are error-free, and punctuation is well managed.",
        ],
        negative: ["Occasional, non-systematic errors and inappropriacies occur."],
      },
      {
        band: 7,
        positive: [
          "A variety of complex structures is used with some flexibility and accuracy.",
          "Grammar and punctuation are generally well controlled, and error-free sentences are frequent.",
        ],
        negative: ["A few errors in grammar may persist, but they do not impede communication."],
      },
      {
        band: 6,
        positive: [
          "A mix of simple and complex sentence forms is used but flexibility is limited.",
        ],
        negative: [
          "Examples of more complex structures are not marked by the same level of accuracy as in simple structures.",
          "Errors in grammar and punctuation occur, but rarely impede communication.",
        ],
      },
      {
        band: 5,
        positive: ["The range of structures is limited and rather repetitive."],
        negative: [
          "Although complex sentences are attempted, they tend to be faulty, and the greatest accuracy is achieved on simple sentences.",
          "Grammatical errors may be frequent and cause some difficulty for the reader.",
          "Punctuation may be faulty.",
        ],
      },
      {
        band: 4,
        positive: ["A very limited range of structures is used."],
        negative: [
          "Grammatical errors are frequent and may impede meaning.",
          "Punctuation is often faulty or inadequate.",
        ],
      },
    ],
  },
  task1_academic: {
    task_achievement: [
      {
        band: 9,
        positive: [
          "All the requirements of the task are fully and appropriately satisfied.",
          "Key features are skilfully selected, clearly presented, highlighted and illustrated.",
        ],
        negative: [],
      },
      {
        band: 8,
        positive: [
          "The response covers all the requirements of the task appropriately, relevantly and sufficiently.",
          "Key features are skilfully selected, and clearly presented, highlighted and illustrated.",
        ],
        negative: ["Occasional omissions or lapses in content."],
      },
      {
        band: 7,
        positive: [
          "The response covers the requirements of the task; content is relevant and accurate.",
          "Key features which are selected are covered and clearly highlighted.",
          "It presents a clear overview, the data are appropriately categorised, and main trends or differences are identified.",
        ],
        negative: [
          "Key features could be more fully or more appropriately illustrated or extended.",
          "There may be a few omissions or lapses.",
        ],
      },
      {
        band: 6,
        positive: [
          "The response focuses on the requirements of the task and an appropriate format is used.",
          "Key features which are selected are covered and adequately highlighted.",
          "A relevant overview is attempted.",
          "Information is appropriately selected and supported using figures/data.",
        ],
        negative: [
          "Some irrelevant, inappropriate or inaccurate information may occur in areas of detail.",
          "Some details may be missing (or excessive) and further extension or illustration may be needed.",
        ],
      },
      {
        band: 5,
        positive: ["The response generally addresses the requirements of the task."],
        negative: [
          "Key features which are selected are not adequately covered.",
          "The recounting of detail is mainly mechanical; there may be no data to support the description.",
          "There may be a tendency to focus on details without referring to the bigger picture.",
          "Limited detail when extending and illustrating the main points.",
        ],
      },
      {
        band: 4,
        positive: ["The response is an attempt to address the task; few key features have been selected."],
        negative: [
          "Key features which are presented may be irrelevant, repetitive, inaccurate or inappropriate.",
        ],
      },
    ],
    coherence_ability: [
      {
        band: 8,
        positive: [
          "Information and ideas are logically sequenced, and cohesion is well managed.",
          "Paragraphing is used sufficiently and appropriately.",
        ],
        negative: ["Occasional lapses in coherence or cohesion."],
      },
      {
        band: 7,
        positive: [
          "Information and ideas are logically organised, and there is a clear progression throughout the response.",
          "A range of cohesive devices including reference and substitution is used flexibly.",
        ],
        negative: ["A few lapses may occur, but these are minor."],
      },
      {
        band: 6,
        positive: [
          "Information and ideas are generally arranged coherently and there is a clear overall progression.",
          "Cohesive devices are used to some good effect.",
        ],
        negative: [
          "Cohesion may be faulty or mechanical due to misuse, overuse or omission.",
          "The use of reference and substitution may lack flexibility or clarity and result in some repetition or error.",
        ],
      },
      {
        band: 5,
        positive: ["Organisation is evident but is not wholly logical; there is a sense of underlying coherence."],
        negative: [
          "Sentences are not fluently linked to each other.",
          "Limited/overuse of cohesive devices with some inaccuracy.",
          "Repetitive due to inadequate and/or inaccurate use of reference and substitution.",
        ],
      },
      {
        band: 4,
        positive: ["Information and ideas are evident but not arranged coherently."],
        negative: ["Relationships between ideas can be unclear and/or inadequately marked."],
      },
    ],
    lexical_resource: [
      {
        band: 8,
        positive: [
          "A wide resource is fluently and flexibly used to convey precise meanings within the scope of the task.",
          "There is skilful use of uncommon and/or idiomatic items when appropriate.",
        ],
        negative: ["Occasional inaccuracies in word choice and/or collocation."],
      },
      {
        band: 7,
        positive: [
          "The resource is sufficient to allow some flexibility and precision.",
          "There is some ability to use less common and/or idiomatic items.",
        ],
        negative: ["Inappropriacies occur."],
      },
      {
        band: 6,
        positive: ["The resource is generally adequate and appropriate for the task; meaning is generally clear."],
        negative: [
          "A rather restricted range or a lack of precision in word choice.",
          "Some errors in spelling and/or word formation, but they do not impede communication.",
        ],
      },
      {
        band: 5,
        positive: ["The resource is limited but minimally adequate for the task."],
        negative: [
          "Frequent lapses in the appropriacy of word choice; a lack of flexibility is apparent in frequent simplifications/repetitions.",
          "Errors in spelling and/or word formation may be noticeable and may cause some difficulty for the reader.",
        ],
      },
      {
        band: 4,
        positive: ["The resource is limited and inadequate for or unrelated to the task."],
        negative: ["Inappropriate use of lexical chunks (e.g. memorised phrases, formulaic language and/or language from the input material)."],
      },
    ],
    grammatical_range: [
      {
        band: 8,
        positive: [
          "A wide range of structures within the scope of the task is flexibly and accurately used.",
          "The majority of sentences are error-free, and punctuation is well managed.",
        ],
        negative: ["Occasional, non-systematic errors and inappropriacies occur."],
      },
      {
        band: 7,
        positive: [
          "A variety of complex structures is used with some flexibility and accuracy.",
          "Grammar and punctuation are generally well controlled, and error-free sentences are frequent.",
        ],
        negative: ["A few errors in grammar may persist, but they do not impede communication."],
      },
      {
        band: 6,
        positive: ["A mix of simple and complex sentence forms is used but flexibility is limited."],
        negative: [
          "Examples of more complex structures are not marked by the same level of accuracy as in simple structures.",
          "Errors in grammar and punctuation occur, but rarely impede communication.",
        ],
      },
      {
        band: 5,
        positive: ["The range of structures is limited and rather repetitive."],
        negative: [
          "Complex sentences are attempted but tend to be faulty; greatest accuracy is on simple sentences.",
          "Grammatical errors may be frequent and cause some difficulty for the reader.",
        ],
      },
      {
        band: 4,
        positive: ["A very limited range of structures is used."],
        negative: ["Grammatical errors are frequent and may impede meaning."],
      },
    ],
  },
  task1_general: {
    task_achievement: [
      {
        band: 8,
        positive: [
          "The response covers all the requirements of the task appropriately, relevantly and sufficiently.",
          "All bullet points are clearly presented, and appropriately illustrated or extended.",
        ],
        negative: ["Occasional omissions or lapses in content."],
      },
      {
        band: 7,
        positive: [
          "All bullet points are covered and clearly highlighted.",
          "It presents a clear purpose; the tone is consistent and appropriate to the task.",
        ],
        negative: ["Bullet points could be more fully or more appropriately illustrated or extended."],
      },
      {
        band: 6,
        positive: [
          "All bullet points are covered and adequately highlighted.",
          "The purpose is generally clear.",
        ],
        negative: [
          "Some irrelevant, inappropriate or inaccurate information may occur.",
          "Some details may be missing (or excessive); further extension or illustration may be needed.",
          "There may be minor inconsistencies in tone.",
        ],
      },
      {
        band: 5,
        positive: ["All bullet points are presented but one or more may not be adequately covered."],
        negative: [
          "The purpose may be unclear at times.",
          "The tone may be variable and sometimes inappropriate.",
        ],
      },
      {
        band: 4,
        positive: ["Not all bullet points are presented."],
        negative: ["The purpose of the letter is not clearly explained; the tone may be inappropriate."],
      },
    ],
    coherence_ability: [
      {
        band: 8,
        positive: [
          "Information and ideas are logically sequenced, and cohesion is well managed.",
          "Paragraphing is used sufficiently and appropriately.",
        ],
        negative: ["Occasional lapses in coherence or cohesion."],
      },
      {
        band: 7,
        positive: [
          "Information and ideas are logically organised, and there is a clear progression throughout the response.",
          "A range of cohesive devices including reference and substitution is used flexibly.",
        ],
        negative: ["A few lapses may occur, but these are minor."],
      },
      {
        band: 6,
        positive: [
          "Information and ideas are generally arranged coherently and there is a clear overall progression.",
          "Cohesive devices are used to some good effect.",
        ],
        negative: [
          "Cohesion may be faulty or mechanical due to misuse, overuse or omission.",
          "The use of reference and substitution may lack flexibility or clarity.",
        ],
      },
      {
        band: 5,
        positive: ["Organisation is evident but is not wholly logical."],
        negative: [
          "Sentences are not fluently linked to each other.",
          "Limited/overuse of cohesive devices with some inaccuracy.",
        ],
      },
      {
        band: 4,
        positive: ["Information and ideas are evident but not arranged coherently."],
        negative: ["Relationships between ideas can be unclear and/or inadequately marked."],
      },
    ],
    lexical_resource: [
      {
        band: 8,
        positive: [
          "A wide resource is fluently and flexibly used to convey precise meanings.",
          "There is skilful use of uncommon and/or idiomatic items when appropriate.",
        ],
        negative: ["Occasional inaccuracies in word choice and/or collocation."],
      },
      {
        band: 7,
        positive: [
          "The resource is sufficient to allow some flexibility and precision.",
          "There is some ability to use less common and/or idiomatic items.",
        ],
        negative: ["Inappropriacies occur."],
      },
      {
        band: 6,
        positive: ["The resource is generally adequate and appropriate; meaning is generally clear."],
        negative: ["A rather restricted range or a lack of precision in word choice."],
      },
      {
        band: 5,
        positive: ["The resource is limited but minimally adequate for the task."],
        negative: [
          "Frequent lapses in the appropriacy of word choice.",
          "Errors in spelling and/or word formation may be noticeable.",
        ],
      },
      {
        band: 4,
        positive: ["The resource is limited and inadequate for or unrelated to the task."],
        negative: ["Inappropriate use of lexical chunks."],
      },
    ],
    grammatical_range: [
      {
        band: 8,
        positive: [
          "A wide range of structures is flexibly and accurately used.",
          "The majority of sentences are error-free, and punctuation is well managed.",
        ],
        negative: ["Occasional, non-systematic errors and inappropriacies occur."],
      },
      {
        band: 7,
        positive: [
          "A variety of complex structures is used with some flexibility and accuracy.",
          "Grammar and punctuation are generally well controlled.",
        ],
        negative: ["A few errors in grammar may persist, but they do not impede communication."],
      },
      {
        band: 6,
        positive: ["A mix of simple and complex sentence forms is used but flexibility is limited."],
        negative: [
          "Examples of more complex structures are not marked by the same level of accuracy as simple structures.",
          "Errors in grammar and punctuation occur, but rarely impede communication.",
        ],
      },
      {
        band: 5,
        positive: ["The range of structures is limited and rather repetitive."],
        negative: [
          "Complex sentences are attempted but tend to be faulty.",
          "Grammatical errors may be frequent and cause some difficulty for the reader.",
        ],
      },
      {
        band: 4,
        positive: ["A very limited range of structures is used."],
        negative: ["Grammatical errors are frequent and may impede meaning."],
      },
    ],
  },
}

/** Ánh xạ loại bài của app sang loại bài trong rubric. */
export function rubricTaskType(taskType: string): TaskType {
  if (taskType === "academic_task1") return "task1_academic";
  if (taskType === "general_task1") return "task1_general";
  return "task2";
}

/**
 * Render rubric thành text cho system prompt.
 * Chỉ lấy band 6–8: đó là dải người học thực tế nằm trong, và prompt
 * ngắn giúp model tập trung hơn (prompt quá dài làm chậm và dễ timeout).
 */
export function renderRubric(taskType: TaskType): string {
  const criteria = BAND_DESCRIPTORS[taskType];
  const names: Record<CriterionName, string> = {
    task_achievement: "Task Achievement",
    task_response: "Task Response",
    coherence_ability: "Coherence and Cohesion",
    lexical_resource: "Lexical Resource",
    grammatical_range: "Grammatical Range and Accuracy",
  };
  const lines: string[] = [];
  for (const [criterion, descriptors] of Object.entries(criteria)) {
    const key = criterion as CriterionName;
    if (!descriptors.length) continue;
    lines.push(`### ${names[key]}`);
    for (const descriptor of descriptors) {
      if (descriptor.band < 6 || descriptor.band > 8) continue;
      lines.push(`BAND ${descriptor.band}`);
      for (const feature of descriptor.positive) lines.push(`  + ${feature}`);
      for (const feature of descriptor.negative) lines.push(`  - ${feature}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

/** Checklist riêng cho từng loại bài — chuyển thành câu hỏi có/không. */
export const TASK_CHECKS: Record<TaskType, string[]> = {
  task2: [
    "All parts of the question are addressed (missing one part caps Task Response at Band 5).",
    "A clear position is stated in the introduction and maintained through to the conclusion.",
    "Every main idea is explained or supported with an example or evidence.",
    "The conclusion is formulated rather than simply repeating the introduction.",
    "No irrelevant detail and no large-scale repetition.",
    "The response is written as full connected text, not bullet points or notes.",
    "Word count is at least 250 words.",
  ],
  task1_academic: [
    "There is an overview of the main trend(s) (Band 6 requires an attempted overview; Band 7 requires a clear one).",
    "Key features are selected and grouped rather than every data point listed mechanically.",
    "Comparisons or contrasts between data are made, not just mechanical description.",
    "Figures and trends are reported accurately.",
    "No opinions, causes or speculation that the data do not support.",
    "The response is written as full connected text, not bullet points or notes.",
    "Word count is at least 150 words.",
  ],
  task1_general: [
    "The purpose of the letter is clearly explained.",
    "All three bullet-pointed requirements are covered.",
    "Each bullet point is extended, not merely mentioned.",
    "The tone is consistent and appropriate to the recipient.",
    "The response is written as full connected text, not bullet points or notes.",
    "Word count is at least 150 words.",
  ],
}

/**
 * Calibration prior: cho model biết phân bố điểm thực tế và chống nén điểm về giữa.
 * Nghiên cứu (NHSJS 2026) cho thấy thêm prior phân bố làm tăng ~19 điểm %
 * độ chính xác so với chỉ dùng rubric.
 */
export const CALIBRATION_PRIOR = [
  "CALIBRATION — realistic score distribution.",
  "In a typical set of IELTS Writing responses, most scripts score between Band 5.5 and Band 7.5.",
  "Very few reach Band 8 or above; very few fall below Band 5.",
  "Band 7 is not the default. Band 6.5 is a common, legitimate result.",
  "Do not inflate. If you are between two bands, prefer the LOWER one unless the essay clearly meets every positive feature of the higher band and none of its negative features.",
  "You are also prone to the opposite error — compressing everything toward Band 7. If your evidence only supports 'adequate but limited', that is Band 6, not Band 7.",
  "Actively check that you have not defaulted to Band 7, and that you have not defaulted to Band 6.5.",
].join("\n");

/**
 * Chỉ dẫn về cơ chế "sàn" của band descriptor.
 * Đây là điều phần lớn prompt chấm bỏ qua, và là nguồn sai lệch điểm lớn nhất.
 */
export const FLOOR_RULE = [
  'SCORING RULE — the band descriptor has a "floor", not just a ceiling.',
  "The official IELTS rule: a script must FULLY FIT all positive features of the descriptor for its band, and must show NONE of that band's negative features.",
  "For each criterion: choose the band you can PROVE, quote the evidence, then check EVERY negative feature of that band. If any is present, the criterion cannot score that band — drop to the next band down and check again.",
  "Never award a band whose negative features are present in the essay.",
].join("\n");
