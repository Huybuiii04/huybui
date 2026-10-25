# Research Brief: Làm cho LLM IELTS Writing Grader chính xác hơn và sâu hơn

**Ngày:** 2026-10-25 · **Người viết:** web research agent · **Phạm vi:** web research only, không sửa code.

**Bối cảnh sản phẩm hiện tại:** chấm bài IELTS Writing bằng LLM (`claude-haiku-5-5` qua proxy Anthropic-compatible), structured output JSON-schema, 2 lần gọi:
- **Call 1 (grade):** 4 criteria scores (Task Response/Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range), `summary`, `strengths`, `priority_actions`, `task_checks`
- **Call 2 (enrich):** structure paragraphs, lexical examples, grammar examples, "unnatural" sentences, `vocabulary_plan`, `band_plan`, `error_logs` (quote/correction/explanation)

**Mục tiêu của brief:** các kỹ thuật cụ thể, có thể kiểm chứng, để tăng độ chính xác (accuracy) và độ sâu (depth) của grader.

> **Cách đọc:** Mỗi finding có 3 phần — **Kỹ thuật** (cái gì), **Tại sao giúp** (bằng chứng/empirical), **Cách làm** (prompt/logic cụ thể). Mỗi finding đều có URL nguồn. Mục 10 là bảng xếp hạng theo impact/effort.

---

## Tóm tắt nhanh (tiếng Việt cho team)

**10 điều quan trọng nhất tìm được:**

1. **Rubric chính thức có "sàn" (floor) chứ không chỉ có "trần".** Trong PDF band descriptors của IELTS, phần **in đậm (bold)** trong mô tả band N là các đặc điểm **tiêu cực giới hạn điểm ở band N**. Muốn chấm band 7 thì phải "fully fit the positive features" của band 7 **và không** dính bất kỳ feature tiêu cực nào của band 6. Grader hiện tại chắc chắn đang bỏ qua cơ chế này → đây là lỗi lớn nhất.
2. **Thêm rubric vào prompt KHÔNG đảm bảo tốt hơn — có khi còn tệ hơn.** Nghiên cứu 2026 (DeepSeek-R1): accuracy 37.6% → 29.8% khi thêm rubric, kèm thêm "inflation bias". Phần "calibration" (nói cho model biết phân bố điểm thực tế) mới là thứ tạo ra +19 đến +24 điểm phần trăm.
3. **Claude nhạy cảm nhất với "scoring strategy"** (32% phương sai) chứ không phải với độ chi tiết của rubric (không đáng kể). Nghĩa là: **thay đổi cách hỏi (decompose hay deliberate) quan trọng hơn thêm mô tả rubric**. Đây là finding cụ thể nhất cho đúng model chúng ta đang dùng.
4. **Band trung bình bị nén về giữa thang điểm (score compression / central tendency).** Đây là lỗi hệ thống phổ biến nhất của LLM judge. LLM "không dám" cho 8.0 hoặc 5.0.
5. **Hai lần gọi nên là: Advocate (điểm mạnh) → Skeptic (điểm yếu) → Judge (tổng hợp)** — không phải grade → enrich. Thứ tự Advocate-đầu tốt hơn Skeptic-đầu (QWK ~0.00 nếu Skeptic-đầu, do framing tiêu cực → under-scoring). Chỉ 1 vòng tranh luận; 2 vòng làm QWK sập.
6. **Retrieval exemplar là "driver" chính của calibration**, debate chỉ là refinement thứ hai. Nếu chỉ có 1-2 call, hãy dùng call đó để **retrieve exemplars đã biết điểm** (band 5, 6, 7, 8 cùng task type) thay vì làm "enrich" thuần.
7. **Không dùng AI-text detector để phát hiện bài mẫu.** Liang et al. (Patterns 2023): detector gắn nhãn "AI" cho **61.3%** bài TOEFL của người không bản ngữ. Phải dùng **n-gram / shingle overlap** với corpus bài mẫu, không dùng "AI detector".
8. **Lỗi phổ biến nhất của LLM grader: nâng Lexical Resource theo vài từ hiếm, rồi kéo cả overall lên, trong khi Task Response vẫn mỏng.** Đó là lý do học sinh bị "ảo giác Band 7".
9. **Điểm theo tiêu chí chỉ có band tròn (0-9).** Overall Task band mới có .5 (do trung bình 4 tiêu chí). Nếu app đang trả về 6.5 cho từng tiêu chí, đó là sai rubric — và dễ gây ra "band không khớp" so với examiner.
10. **Không có "prompt recipe" dùng chung cho mọi model.** 3 model frontier khác nhau → dimension quan trọng nhất khác nhau. Phải có eval set riêng (30-50 bài có điểm chính thức) và chạy A/B mỗi khi đổi prompt.

---

# 1. Official band descriptors — nguồn sự thật gốc

## 1.1 Nguồn chính thức (tải về dùng được)

| Tài liệu | URL | Nội dung |
|---|---|---|
| **Writing Band Descriptors** (Updated May 2023) | https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf | Bảng band 0–9 cho Task 1 và Task 2, 4 tiêu chí. 9 trang. |
| **Writing Key Assessment Criteria** (4 trang) | https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf | Định nghĩa criterion + penalty rules. |
| **IELTS Academic Writing Sample Tasks** (26 trang) | https://ielts.org/cdn/Sample-tests/ielts-academic-writing-sample-tasks-2023.pdf | **11 bài mẫu + examiner comment + band score** (Task 1A/1B/1C, Task 2A/2B). Vàng cho exemplar set. |
| Scoring in detail (web) | https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail | Quy tắc tính điểm, bảng band score. |
| Bản sao (British Council) | https://takeielts.britishcouncil.org/sites/default/files/IELTS_task_2_Writing_band_descriptors.pdf | Bản Task 2 riêng. |
| Bản sao (IELTS Liz) | https://ieltsliz.com/wp-content/uploads/2024/07/ielts_writing_band_descriptors-1.pdf | Mirror để dễ diff. |

Đã tải & trích text (đã lưu tại `D:\ielts\docs\research\_pdf\`):
`writing-band-descriptors.txt`, `writing-key-assessment-criteria.txt`, `ielts-sample-scripts.txt`, `qiu2024-paclic.txt`.

## 1.2 Cơ chế "floor" — điều quan trọng nhất của toàn bộ rubric

Dưới mỗi bảng band descriptor, IELTS ghi rõ:

> *"A script must fully fit the positive features of the descriptor at a particular level. **Bolded text indicates negative features that will limit a rating.**"*
> — https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf

**Ý nghĩa (đây là thứ ít prompt nào làm đúng):**
- Muốn **band N**: phải có **đủ tất cả** positive features của band N, **và không được** dính bất kỳ negative feature (chữ đậm) nào ở band N.
- Negative feature ở band N-1 chính là **cái trần giới hạn** của band N.

**Ví dụ Task 2 Task Response:**
- Band 5 negative (in đậm): *"The main parts of the prompt are **incompletely addressed**."* → Nếu bỏ sót 1 phần của đề → **trần Task Response = 5**.
- Band 6 negative: *"…some may be **more fully covered than others**"*, *"conclusions drawn may be **unclear, unjustified or repetitive**"*, *"some may be **insufficiently developed**"*.
- Band 7 negative: *"there may be a **tendency to over-generalise** or there may be a **lack of focus and precision**"*, *"A few lapses may occur, but these are minor"*, *"with **some inaccuracies or some over/under use**"* (CC), *"**only a few** errors in spelling and/or word formation"*.

**Cách làm (prompt + logic):**
Thêm vào system prompt một block riêng, đặt **trước** phần yêu cầu điểm:

```
SCORING RULE — "band floor" mechanic (from the official IELTS descriptors)
A script must FULLY FIT all positive features of the descriptor for its band.
The bolded (negative) features in the band descriptor are the features that LIMIT the rating.
For each criterion, before you assign a band:
  1. List which band you are considering.
  2. Quote (verbatim, from the essay) the evidence for EVERY positive feature of that band.
  3. Check EVERY negative feature of that band. If ANY negative feature of band N is present,
     the script cannot score N for that criterion — drop to the highest band whose negative
     features are all absent.
  4. Only then output the band.
```

Và bắt model output bằng schema:

```json
"per_criterion": [
  {"criterion":"task_response", "band": 6.0,
   "positive_evidence":[{"feature":"main parts of prompt addressed","quote":"..."}],
   "negative_features_present":[{"feature":"conclusions unclear or repetitive","quote":"..."}],
   "floor_reasoning":"Band 7 rejected: 'conclusions drawn may be unclear, unjustified or repetitive' is present."}
]
```

**Vì sao giúp:** LLM mặc định làm "impressionistic scoring" — đọc bài rồi cho cảm giác. Cơ chế floor buộc nó **kiểm tra từng feature**, biến score thành **verification task** thay vì **estimation task**. Đây chính là "separation of analysis from scoring" mà research yêu cầu.

## 1.3 Threshold checklist per criterion (để máy hoá)

### Task 2 — Task Response (TR)

| Band | Positive features (phải có đủ) | Negative features (nếu có → trần ở band này) |
|---|---|---|
| 9 | prompt addressed & explored in depth; clear + fully developed position trả lời trực tiếp; ideas relevant, fully extended, well supported; lapses cực hiếm | — |
| 8 | prompt appropriately & sufficiently addressed; clear + well-developed position; ideas relevant, well extended & supported | occasional omissions or lapses in content |
| 7 | **main parts** of prompt appropriately addressed; clear + developed position; main ideas extended & supported | tendency to over-generalise; lack of focus/precision in supporting ideas; a few lapses |
| 6 | main parts addressed (**some more fully covered than others**); appropriate format; position directly relevant | conclusions **unclear, unjustified or repetitive**; some ideas **insufficiently developed**/lack clarity; some supporting args/evidence **less relevant or inadequate** |
| 5 | main parts **incompletely addressed**; format may be inappropriate; position expressed nhưng development không rõ | ideas limited, not sufficiently developed, irrelevant detail, repetition |
| 4 | prompt tackled minimally / tangential; format may be inappropriate; position phải đọc kỹ mới thấy | main ideas difficult to identify; large parts repetitive |

**Máy hoá thành boolean check:**
- `all_parts_addressed` — có đạt từng part của đề không? (đây là check số 1, chặn trần band 5)
- `position_clear_and_kept_throughout` — có nêu rõ position ở intro và giữ xuyên suốt?
- `each_main_idea_has_support` — mỗi main idea có explanation/example không? (đây là phân biệt 6 vs 7)
- `no_repetition_in_conclusion`
- `format_appropriate`

### Task 2 — Coherence & Cohesion (CC)

| Band | Positive | Negative (trần) |
|---|---|---|
| 8 | message followed with ease; logically sequenced; cohesion well managed; paragraphing used sufficiently & appropriately | occasional lapses in coherence/cohesion |
| 7 | logically organised + clear progression throughout; range of cohesive devices **including reference and substitution** used flexibly; paragraphing generally effective; sequencing within paragraph generally logical | a few lapses (minor); some inaccuracies or some over/under use of devices |
| 6 | generally arranged coherently + clear overall progression; devices used to some good effect | cohesion **faulty or mechanical** due to misuse/overuse/omission; reference & substitution **lack flexibility or clarity** → some repetition or error; paragraphing may not always be logical / central topic not always clear |
| 5 | organisation evident nhưng không hoàn toàn logical; không có overall progression; có underlying coherence | sentences **not fluently linked**; limited/overuse of devices with inaccuracy; repetitive do reference/substitution kém; **paragraphing may be inadequate or missing** |
| 4 | evident nhưng không coherent, không progression | relationships unclear; basic devices inaccurate/repetitive; inaccurate use of substitution/referencing; **no paragraphing and/or no clear main topic** |

### Task 2 — Lexical Resource (LR)

| Band | Positive | Negative (trần) |
|---|---|---|
| 8 | wide resource fluently & flexibly used to convey **precise** meanings; skilful use of uncommon/idiomatic items when appropriate | occasional inaccuracies in word choice/collocation; occasional spelling/word formation errors |
| 7 | resource sufficient to allow **some flexibility and precision**; **some** ability to use less common/idiomatic items; awareness of style and collocation evident | inappropriacies occur; **only a few** errors in spelling/word formation (không detract from overall clarity) |
| 6 | resource generally adequate & appropriate; meaning generally clear | **rather restricted range** hoặc **lack of precision**; nếu risk-taker thì inaccuracy/inappropriacy cao hơn; **some** errors in spelling/word formation (không impede communication) |
| 5 | resource limited nhưng minimally adequate; simple vocabulary accurate | frequent lapses in appropriacy; lack of flexibility; frequent simplifications/repetitions; errors noticeable → cause difficulty for reader |
| 4 | limited & inadequate for/unrelated to task; basic, repetitive | **inappropriate use of lexical chunks (e.g. memorised phrases, formulaic language and/or language from the input material)** ← đây là chỗ bắt template essay |

### Task 2 — Grammatical Range & Accuracy (GRA)

| Band | Positive | Negative (trần) |
|---|---|---|
| 8 | wide range of structures **flexibly and accurately** used; **majority of sentences are error-free**; punctuation well managed | occasional, non-systematic errors & inappropriacies |
| 7 | **variety of complex structures** with some flexibility & accuracy; grammar & punctuation generally well controlled; **error-free sentences are frequent** | a few errors in grammar persist (không impede communication) |
| 6 | **mix of simple and complex** sentence forms nhưng flexibility limited; examples of complex structures **not marked by the same level of accuracy** as simple structures | errors in grammar & punctuation occur, nhưng **rarely** impede communication |
| 5 | range **limited and rather repetitive**; complex sentences attempted nhưng **faulty**; greatest accuracy on simple sentences | grammatical errors **frequent** → cause some difficulty; punctuation may be faulty |
| 4 | very limited range; subordinate clauses rare; simple sentences predominate | grammatical errors **frequent** and may impede meaning; punctuation often faulty |

**Máy hoá GRA thành số đếm được (rất quan trọng — LLMs over-score GRA):**
- `total_sentences`, `error_free_sentences`, `error_rate`, `error_count_by_type` (article, subject-verb agreement, plural/uncountable, tense, word order, punctuation)
- Band 7 cần "error-free sentences are **frequent**" → tỷ lệ câu không lỗi **cao**; Band 6 chấp nhận lỗi nhưng không impede; Band 5 lỗi **frequent** → gây khó đọc.
- Band 8 cần "**majority** of sentences are error-free" → >50% câu sạch lỗi.
- Và mốc chuyển band quan trọng: **complex structure accuracy** — band 6 cho phép "complex structures not marked by the same level of accuracy as simple structures"; band 7 cần "variety of complex structures with some flexibility and accuracy". Đếm: có bao nhiêu cấu trúc phức tạp (relative clause, participial, conditional, inversion, cleft…) và bao nhiêu sai.

### Task 1 — Task Achievement (TA) (khác Task 2 hoàn toàn)

| Band | Positive | Negative (trần) |
|---|---|---|
| 8 | covers all requirements appropriately/relevantly/sufficiently; **(Academic)** key features **skilfully selected**, clearly presented, highlighted, illustrated | occasional omissions or lapses in content |
| 7 | covers requirements; content relevant & accurate — a few omissions/lapses; format appropriate; **(Academic)** key features covered & clearly highlighted but **could be more fully or more appropriately illustrated or extended**; **presents a clear overview**, data **appropriately categorised**, main trends/differences identified; **(GT)** all bullet points covered & clearly highlighted but could be more fully illustrated/extended; clear purpose; tone consistent & appropriate | a few omissions/lapses (Academic: key features could be more fully illustrated) |
| 6 | focuses on requirements; appropriate format; **(Academic)** key features covered & adequately highlighted; **a relevant overview is attempted**; information appropriately selected & supported using figures/data; **(GT)** all bullet points covered & adequately highlighted; purpose generally clear | **some irrelevant, inappropriate or inaccurate information** in areas of detail/illustrating; **some details may be missing (or excessive)**; further extension needed; cohesion may be faulty/mechanical; reference/substitution lacks flexibility → some repetition or error |
| 5 | generally addresses requirements; format may be inappropriate in places; **(Academic)** key features **not adequately covered**; recounting of detail is **mainly mechanical**; **there may be no data to support the description**; **(GT)** all bullet points presented nhưng một hoặc nhiều chưa adequately covered; purpose may be unclear; tone variable | tendency to focus on details **without referring to the bigger picture**; **irrelevant, inappropriate or inaccurate material in key areas**; limited detail |
| 4 | attempt to address; **(Academic)** few key features selected; **(GT)** not all bullet points presented | key features/bullet points presented may be **irrelevant, repetitive, inaccurate or inappropriate**; format may be inappropriate |

**Band 0:** *"used a language other than English throughout, or where there is proof that a candidate's answer has been totally memorised."*
**Band 1:** *"Responses of 20 words or fewer are rated at Band 1."*
**Band 2:** *"The content barely relates to the task… the entire response may be off-topic."*
**Band 3 (LR):** *"The resource is inadequate (which may be due to the response being **significantly underlength**)."*

**Nguồn:** https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf

## 1.4 Key Assessment Criteria — định nghĩa từng tiêu chí (dùng cho phần "checklist" trong prompt)

Từ https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf:

**Task 1 Academic (TA)** phải làm 5 việc:
1. selecting key features of the information
2. providing sufficient detail to illustrate these features
3. reporting the information, figures and trends **accurately**
4. **comparing or contrasting** the information by highlighting identifiable trends/principal changes/differences *(rather than mechanical description reporting detail)*
5. presenting the response in an appropriate format

**Task 1 GT (TA):** clearly explain purpose of letter; fully address the three bullet-pointed requirements; extend these three functions appropriately and relevantly; use appropriate format; consistently use appropriate tone.

**Task 2 (TR):** how fully the candidate responds; how adequately main ideas are extended and supported; how relevant the ideas are; how clearly the candidate opens the discourse, establishes their position and formulates conclusions; how appropriate the format is.

**CC assesses:** logical organisation/progression; appropriate paragraphing; logical sequencing within & across paragraphs; **flexible use of reference and substitution (e.g. definite articles, pronouns)**; appropriate use of discourse markers to mark stages and signal relationships.

**LR assesses:** range of general words (synonyms to avoid repetition); adequacy & appropriacy (topic-specific items, indicators of attitude); precision of word choice; control/use of collocations, idiomatic expressions, sophisticated phrasing; **density and communicative effect** of spelling errors; **density and communicative effect** of word-formation errors.

**GRA assesses:** range and appropriacy of structures (simple/compound/complex); accuracy of simple/compound/complex; **density and communicative effect** of grammatical errors; accurate and appropriate use of punctuation.

> **Điểm quan trọng về mật độ (density) + communicative effect:** đây là hai cụm từ bị bỏ qua nhiều nhất. Không phải "có lỗi hay không" mà là **mật độ lỗi** và **lỗi có làm nghĩa khó hiểu không**. Một lỗi article trong 250 từ không cắt band 6→5; 10 lỗi word order mà làm nghĩa khó hiểu thì cắt.

---

# 2. Cách tính band score (chính xác, máy hoá được)

## 2.1 Quy tắc

**Bước 1 — Task band.** Mỗi task được chấm độc lập, 4 tiêu chí **trọng số bằng nhau**:
```
Task_Band = mean(TR, CC, LR, GRA)
```
**Bước 2 — Writing band.** Task 2 trọng số gấp đôi Task 1:
```
Writing_Band_raw = (Task1_Band + 2 × Task2_Band) / 3
```
**Bước 3 — Rounding.** Làm tròn tới 0.5 gần nhất, với quy tắc .25 → lên, .75 → lên (tức round-half-up ở bước 0.25):
```
Writing_Band = floor(raw × 2 + 0.5) / 2
```
**Bước 4 — Overall band.** Trung bình 4 kỹ năng, cùng quy tắc rounding:
```
Overall = floor((L + R + W + S)/4 × 2 + 0.5) / 2
```

**Bảng kiểm chứng (từ chính ielts.org):**

| Case | Average | Band |
|---|---|---|
| A | 6.25 | **6.5** (.25 → lên) |
| B | 3.875 | **4.0** |
| C | 6.125 | **6.0** |
| Task 2 example (IELTS Liz) | (6+7+6+6)/4 = 6.25 | **6.5** |
| Task1=6.0, Task2=7.0 | (6+2×7)/3 = 6.667 | **6.5** |
| Task1=6.5, Task2=7.5 | (6.5+15)/3 = 7.167 | **7.0** |
| Task1=6.0, Task2=8.0 | (6+16)/3 = 7.333 | **7.5** |

**Nguồn:**
- https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail — "Each task is assessed independently. The criteria are weighted equally and the score on the task is the average. The assessment of Task 2 carries more weight in marking than Task 1." + bảng rounding .25/.75.
- https://ieltsliz.com/ielts-band-scores — các ví dụ 6.1→6.0, 6.85→7.0, 6.25→6.5, 6.75→7.0.
- https://ieltsliz.com/ielts-writing-task-2-band-scores-5-to-8 — ví dụ Task 2 6+7+6+6=25/4=6.25 → 6.5.
- https://resources.cathoven.com/ielts-writing-task-1/band-scores — công thức (T1×1/3)+(T2×2/3), "Cambridge Assessment English, 2024".

## 2.2 Điểm tiêu chí chỉ có band TRÒN — đây là một bug có thể đang có trong app

- Official descriptors định nghĩa band **0–9 (số nguyên)** cho từng tiêu chí. Không có band 6.5 hay 7.5 ở cấp tiêu chí trong rubric chính thức.
- PDF sample scripts: *"Writing responses are marked by trained and certificated IELTS examiners. **Scores may be reported as whole bands or half-bands.**"* (https://ielts.org/cdn/Sample-tests/ielts-academic-writing-sample-tasks-2023.pdf, trang 8) — nói về **reported score**, không phải criterion.
- Ví dụ tính điển hình (IELTS Liz): tiêu chí là **6, 7, 6, 6** (đều tròn) → task band 6.5.

**Vì sao quan trọng:** Khi model tự do trả về 6.5/7.5 cho một tiêu chí, nó đang **sáng tác** điểm ngoài rubric → dễ lệch so với examiner thật, và tạo ra "điểm không khớp" (task band không khớp trung bình). Test thực tế trên YouTube: một bài bị ChatGPT chấm grammar = 5.5, và người test nhận xét "**in IELTS, you can only get a band five or a band six for each criterion**".

**Cách làm:**
- Schema: `band` cho mỗi tiêu chí phải là **integer trong {0..9}**. Nếu muốn hiển thị .5 ở tiêu chí, gọi nó là *derived* và tính bằng code, không để model bịa.
- Thêm vào prompt: *"Each criterion receives an integer band from 0 to 9, exactly as the official descriptors are defined. Half bands do not exist at criterion level; the half band arises only from averaging."*

## 2.3 Nguồn dữ liệu để calibrate

**HuggingFace `chillies/IELTS-writing-task-2-evaluation`** — 10,324 Task 2 essays (prompt + essay + overall band + 4 analytic scores do LLM sinh ra).
**Kaggle `arsenycheplukov/raw-ielts-essays`** — 6,944 essays (overall band + CEFR + human-written feedback).
Cả hai được dùng bởi nghiên cứu 2026 (https://arxiv.org/html/2603.06424v1).

**Cảnh báo quan trọng:** analytic scores trong HF dataset được sinh bởi Gemini model cũ với prompt lỏng lẻo, **không phải human examiner**; nhóm tác giả phải regenerate lại. Overall band thì từ human examiner → **dùng overall band làm gold, đừng dùng analytic 4 tiêu chí làm gold**.

---

# 3. Nghiên cứu độ chính xác: LLM chấm IELTS sai ở đâu

## 3.1 Bảng số liệu tổng hợp

| Nghiên cứu | Mô hình / thiết lập | Kết quả chính |
|---|---|---|
| **Qiu et al. 2024** (PACLIC) — https://aclanthology.org/2024.paclic-1.36.pdf | GPT-4o & Llama-3-70B chấm 400 Task 2 essays có điểm chính thức | **GPT-4o + example essays: r = 0.71, RMSE = 1.05**. **GPT-4o không example: r = 0.72, RMSE = 1.13**. Llama-3 **có** example: r = 0.56, RMSE = 1.25; **không** example: r = 0.63, RMSE = 0.99. |
| **Huang & Wilson 2025** (AIME-Con) — https://aclanthology.org/2025.aimecon-wip.9.pdf | QWK vs human, so sánh prompting strategies | **Human–human QWK = .91**; PEG (feature-based) .76; **GPT-4o .46 (baseline CoT) → .72 (context-enhanced + few-shot)**; Gemini 2.5 Flash .43→.60; **Claude Sonnet 4 .30 → .69**. |
| **Nguyễn et al. 2026** (arXiv 2603.06424) | IELTS Task 2, 4 paradigm | Prompting: GPT-4o 0.71–0.72; Llama-3-70B 0.56–0.63; **Gemini 2.5 Pro zero-shot 0.9616**. **k-Instruction Tuning + RAG (Llama-3.1-8B): accuracy 0.9902, F1 0.9350**. SFT+DPO+RAG: 0.9870, RMSE 0.58 (calibrated nhất). |
| **Choi, Tate & Warschauer 2026** (Assessing Writing 69:101053) — https://doi.org/10.1016/j.asw.2026.101053 | Rubric vs source material vs **anchor papers** | "**providing anchor papers significantly improves LLM-human agreement, bringing it closer to human-human scoring reliability**". GPT-4o mạnh nhất; **GPT-4o mini tương đương với chi phí thấp hơn nhiều**. |
| **Sanghi 2026** (NHSJS) — https://nhsjs.com/2026/prompt-design-for-llm-essay-scoring-from-rubrics-to-calibration | 5,099 discourse elements, 3 prompt conditions | **Rubric-guided prompting LÀM GIẢM accuracy của DeepSeek-R1: 37.6% → 29.8%**, đồng thời inflation 8.5%→17.1%. **Calibration: DeepSeek 37.6→57.6%, Qwen 43.5→68.2% (+19 đến +24 pp)**. Ablation: **distribution prior làm gần hết phần gain** (+19.0), discourse rules riêng +8.1 (không đáng kể khi có prior). Qwen2.5-**72B** tệ hơn 7B (Effective recall 0.31→0.03 — **collapse về majority class**). |
| **Corsi et al. 2026** (EDM poster) — https://educationaldatamining.org/edm2026/proceedings/2026.EDM.poster-demo-papers.391/index.html | 3×3×3 factorial (criteria specificity × calibration × scoring strategy) trên GPT-5.4 / **Claude Opus 4.6** / Gemini 3 Flash, 153 essays | **Claude: scoring strategy = 32% phương sai (p<.01), calibration = 24% (p<.05), criteria specificity = ns.** GPT: strategy 35%. Gemini: criteria 57%. **Gap best–worst = 3.8–5.1 RMSE points**; **worst config tệ hơn naive baseline** (cohort mean). "**no universal prompt recipe exists**". |
| **Keramati et al. 2026** (MADRAG, arXiv 2606.06754) | ASAP sets 7 & 8, 4 backbones | ZS-LLM (GPT-3.5) QWK 0.05–0.31; **MADRAG (GPT-5) Ideas 0.75 > human–human 0.69**. Ở **extreme scores**: SA/MA **MAE > 1.5** (regression về giữa), MADRAG **MAE ≈ 1.0**. **Retrieval là driver chính của calibration**; debate chỉ refine. Ablation transcript: **Advocate-only R1 tốt nhất**; **Skeptic-only R1 gần như 0**; **2 vòng debate làm QWK sập** (vd Organization 0.64→0.24). |
| **Norman, Rivera & Hughes 2026** (arXiv 2606.19544) — 21 judge, 541k judgments | LLM-as-judge meta-eval | **Kappa deflation universal 33.8–41.3 pp** (exact match overstates). Anthropic judges có **position bias thấp nhất cohort (avg 0.020)**; Claude Opus 4.6 = 0.004, Claude Haiku 4.5 = 0.041. "**consistency–bias paradox**": test–retest > 0.95 đi kèm position bias > 0.10. Verbosity bias < 0.011 (nhỏ hơn nhiều so với literature 2023). |
| **Lee et al. 2024** (MTS, EMNLP Findings) — https://arxiv.org/abs/2404.04941 | Multi-trait specialization | **Tách proficiency thành traits, chấm từng trait qua các round riêng, rồi aggregate bằng averaging + min-max scaling.** Gain QWK tối đa **+0.437** (TOEFL11), +0.355 (ASAP). Llama2-13b-chat **vượt ChatGPT**. |
| **Collova et al. 2025** (arXiv 2508.02442) | 5 LLM, 3 replications, 67 essays | Human–LLM QWK **thấp & không significant**; **thiên lệch inflate Coherence**; concordance "negligible" cho Pertinence & Feasibility. |
| **Liu, Ye & Yan 2026** (Comput. Educ. AI 100565) | GPT-4.1, Llama 4 Maverick, Gemini 2.5 Flash, **Claude Sonnet 4**, DeepSeek R1 | Có model đạt reproducibility gần hoàn hảo + alignment tốt; có model **inconsistent, score compression, hoặc systematic underestimation**. **Causal discovery: "most models prioritizing lexical precision and fluency"** → thiên về LR/GRA, bỏ qua TR. |
| **Pack, Barrett & Escalante 2024** (CAEAI 100234) | GPT-3.5/GPT-4/PaLM2, 119 ELL essays, 2 sessions | GPT-4 best (**excellent intrarater reliability, good validity**); intrarater reliability **tăng** theo thời gian nhưng **interrater reliability giảm**. |

## 3.2 Error pattern tổng hợp — LLM khác human ở đâu

| # | Lỗi | Bằng chứng | Ảnh hưởng tới app |
|---|---|---|---|
| **E1** | **Score compression / central tendency** — LLM né band 8 và band 5, dồn về 6.5-7 | Lee et al. 2024: "LLM-as-judge tends to **regress toward the middle of the scoring scale**, failing to distinguish clearly between exceptional and weak inputs"; MADRAG: SA/MA MAE >1.5 ở extremes | App sẽ cho band 6.5/7 cho mọi bài → không dùng được để luyện |
| **E2** | **Over-weight Lexical Resource / flashy vocabulary, under-weight Task Response** | ieltsgrader: "Flashy vocabulary masks weak Task Response… upgrades Lexical Resource — then quietly lifts the overall band too"; Liu et al. 2026: models prioritize "lexical precision and fluency" | Đây là **bug số 1** gây ảo giác Band 7 |
| **E3** | **Helpfulness bias / band inflation** | ChatGPT trained để agreeable; "Saying 'This looks like Band 7.5 — well done!' feels supportive" (ieltsgrader) | Model có xu hướng cho band cao |
| **E4** | **Bỏ qua cơ chế "floor" của descriptor** | Không nguồn nào nói model làm được; nhưng đây là điều band descriptor yêu cầu, và LLMs làm impressionistic scoring | App không bao giờ "cap" được điểm theo feature tiêu cực |
| **E5** | **Rubric-template collapse** — model dùng câu mẫu band thay vì đọc kỹ bài | MADRAG Theme 3: "**under uncertainty, MADRAG falls back on plausible-sounding rubric prose**, reducing sensitivity to extremes" | Feedback chung chung, không chỉ ra lỗi cụ thể |
| **E6** | **Debate capture / không verify claim** | MADRAG Theme 2: "the judge echoes Advocate/Skeptic framing… **without checking whether the claimed defect is supported by the essay**" | Nếu app dùng pass 2 để "enrich" rồi để score pass 1, pass 1 không bị challenge |
| **E7** | **Token myopia** — model đếm lỗi "mechanical" không có | MADRAG Theme 1: anonymization tokens bị coi là lỗi capitalization → **systematic under-scoring** | Bài IELTS copy từ template có thể bị chấm thấp oan |
| **E8** | **Điểm không ổn định giữa các lần chạy** | Stureborg et al.: same-verdict > 95% ở temp 0 nhưng **rơi xuống 70% ở temp 1**; NHSJS: dù temp 0 vẫn có variance; Anthropic docs: "**even with temperature of 0.0, the results will not be fully deterministic**" | Band nhảy 0.5 giữa 2 lần submit → mất niềm tin |
| **E9** | **Inconsistency theo prompt variant** | Corsi et al. 2026: best–worst gap 4-5 RMSE points; Brennan chapter: "the same two responses evaluated with slightly different prompts can produce opposite verdicts" | Đổi wording = đổi điểm |
| **E10** | **Chấm sai đặc điểm riêng của Task 1** | Key Assessment Criteria: Task 1 Academic cần overview + categorisation + comparison, **không** phải argument | Nếu app dùng chung prompt Task 1/Task 2 → Task 1 bị chấm sai |
| **E11** | **Verifier verbosity bias** | NHSJS: judge ưu tiên feedback dài; khi match độ dài ±5 từ, preference 65%→41%, ties 33%→56% | Nếu dùng LLM judge để chấm feedback → feedback dài luôn thắng, không phải feedback đúng |

## 3.3 Quan điểm từ thực tế (product/blog/forum)

- **ieltsgrader.com — "Why ChatGPT Overestimates IELTS Band Scores"** (https://www.ieltsgrader.com/blog/why-chatgpt-overestimates-ielts-band-scores): 5 cơ chế inflation: (1) helpfulness bias beats descriptor discipline; (2) flashy vocabulary masks weak Task Response; (3) missing/unstable four-criterion scoring — "re-asking in a new chat often moves numbers by half a band or more"; (4) no exam constraints (250+ words, all parts of question); (5) prompt gaming = roleplay not calibration. Có ví dụ cụ thể: bài ~180 từ → descriptor-aligned ≈6.5 vs ChatGPT "Band 7.5, ready for a high score!".
- **ieltsgrader.com — "What Caps Band 6.5 vs 7 on Task 2"** (https://www.ieltsgrader.com/blog/what-caps-band-6-5-vs-7-task-2) — 170 Task 2 practice attempts, bảng "weakest criterion":
  - 6.0–6.49: TR là yếu nhất 9/22; GRA 7/22; LR 6/22
  - 6.5–6.99: LR 5/11; TR 4/11
  - 7.0–7.49: TR 5/11 → "Band 7 không phải là 'vocabulary đã giải quyết xong'"
  - **Word count vs TR**: under 250 → avg TR **4.14**, overall **3.49**; 250–290 → TR 5.57 / 4.66; 291–350 → 5.84 / 5.27; over 350 → 6.02 / 5.81.
- **Video test "ChatGPT vs. IELTS Examiner: Writing"** (https://www.youtube.com/watch?v=CVmDicq5RRU): chấm lại nhiều bài có điểm examiner → "the scores were now mostly **just half a band lower** than they should be… **Not a single essay got a score higher than it deserved**" (sau khi bỏ "dùng nửa điểm cho tiêu chí"). Cũng chỉ ra lỗi: ChatGPT trả criterion 5.5 (không hợp lệ) và điểm tổng sai 2.5 band.
- **Reddit r/IELTS**: "ChatGPT doesn't give anything above 7… You can use it to look for [errors] but not for accurate scores" (https://www.reddit.com/r/IELTS/comments/1hv0bkn/) → **dùng LLM để tìm lỗi, không dùng để chấm điểm**.

---

# 4. Prompt-engineering cho rubric-based scoring

## 4.1 "Scoring strategy" là chiều quan trọng nhất với Claude (finding cụ thể nhất cho app)

Từ Corsi et al. 2026 (EDM 2026), 3 chiều × 3 mức:

**(A) Criteria specificity:** A1 = không rubric; A2 = summary band boundaries; A3 = full analytic rubric với per-dimension descriptors.
→ Claude: **không significant**. Gemini: 57%.

**(B) Calibration intervention:** B1 = không; B2 = **distributional base-rate** ("~25% of essays in this cohort receive a First"); B3 = base-rate + **explicit debiasing instruction** ("…be aware that LLMs tend to compress scores towards the mean").
→ Claude: **24%** (p<.05). GPT: ns. Gemini: ns.

**(C) Scoring strategy:** C1 = **holistic-direct** (chấm thẳng, không structured reasoning); C2 = **analytic-decomposed** (chấm riêng substantive quality / use of evidence / clarity of expression rồi tổng hợp); C3 = **holistic-deliberative** (trước hết **xác định band boundary**, cân evidence **for và against**, rồi mới gán điểm cụ thể trong band đó).
→ **Claude: 32% (p<.01) — lớn nhất. GPT: 35%. Gemini: ns.**

**Cách làm cho app:** đổi từ "chấm 4 tiêu chí và ra điểm" sang **hybrid**:
- **Call 1 (analysis):** phân tích từng tiêu chí, **quote evidence**, chưa chấm điểm.
- **Call 2 (deliberation + score):** nhận analysis của Call 1, **xác định band boundary trước** (holistic-deliberative), **liệt kê evidence for và against** mỗi band candidate, rồi mới chấm.

Hoặc nếu giữ 1 call: dùng **C3 holistic-deliberative** — bắt đầu bằng "which band is the best fit, and which band is it NOT?" rồi mới chấm.

Prompt (rút từ mô tả C3 của nghiên cứu):
```
SCORING STRATEGY — holistic-deliberative (do not score directly)

Step 1. For the overall band, name the band you are CONSIDERING and the band you are
        rejecting (e.g. "Considering Band 7; Band 7.5 rejected because ...").
Step 2. For the chosen band, list the evidence FOR reaching it (with quotes).
Step 3. List the evidence AGAINST reaching it (with quotes).
Step 4. Only then, decide the band inside the boundary you identified.
Step 5. Now do the same for each criterion separately.
```

## 4.2 Calibration / distribution prior — finding có effect size lớn nhất

**Công thức chính xác từ nghiên cứu (Sanghi 2026, ablation 4 điều kiện, Qwen2.5-7B, held-out 40%):**

| Condition | Accuracy | Δ vs rubric-only |
|---|---|---|
| Rubric only | 0.499 | baseline |
| **Rubric + distribution prior** | **0.689** | **+19.0** |
| Rubric + discourse rules | 0.580 | +8.1 |
| Rubric + both | 0.693 | +19.4 (không khác prior, p=0.61) |

→ **Distribution prior làm gần hết phần gain.**

**Exact phrasing (từ bản "Calibrated" của nghiên cứu):**
> *"most elements are rated Adequate"*, *"prefer Adequate when in doubt"*, *"Effective" and "Ineffective" should be reserved for clearly strong or clearly weak cases.*

**Chuyển sang IELTS:** thay "Adequate" bằng phân bố band thực tế của Writing Task 2 (theo dữ liệu HF 10,324 essays mean 5.5, std 1.2). Bản prompt mẫu:
```
CALIBRATION — realistic score distribution
In a typical set of IELTS Writing Task 2 responses, most scripts score between Band 5.5 and Band 7.5.
Very few reach Band 8 or above; very few fall below Band 5.
Do NOT inflate. If you are between two bands, prefer the LOWER one unless the essay clearly
meets every positive feature of the higher band and none of its negative features.
Band 7 is not the default. Band 6.5 is a common, legitimate result.
You are also prone to the opposite error — compressing everything toward Band 7. If your
evidence only supports "adequate but limited", that is Band 6, not Band 7.
```
Và B3-style (thêm debiasing instruction):
> *"LLMs tend to compress scores towards the mean. Actively check that you have not defaulted to Band 7, and that you have not defaulted to Band 6.5."*

**Vì sao giúp:** score compression (E1) là lỗi hệ thống #1 của LLM judge. Prior phân bố đưa model về đúng vùng trung tâm thực tế thay vì điểm 7 mặc định. Nghiên cứu cũng nói: đây là "common and legitimate calibration practice" — tương tự việc báo cho giáo viên biết phần lớn bài nằm ở dải giữa trước khi chấm.

## 4.3 Exemplar anchors — có bằng chứng mạnh nhất

- **Choi, Tate & Warschauer 2026**: anchor papers (bài mẫu đã có điểm) **significantly improve LLM-human agreement, đưa nó về gần human-human reliability**. "GPT-4o is strongest; but **GPT-4o mini gives similar accuracy at lower cost**."
- **Nguyễn et al. 2026**: k-Instruction Tuning + **RAG với 2-shot retrieval** → accuracy 0.9902. Retrieval là "the primary driver of calibration gains" (MADRAG).
- **Qiu et al. 2024** — cảnh báo quan trọng: exemplar **giúp** GPT-4o về RMSE (1.13→1.05) nhưng hơi giảm correlation (0.72→0.71); với Llama-3 thì exemplar **hại** (r 0.63→0.56, RMSE 0.99→1.25). → **Hiệu ứng exemplar phụ thuộc model → phải A/B test trên eval set của chính mình.**

**Exemplar set tốt nhất, miễn phí, chính thức:**
https://ielts.org/cdn/Sample-tests/ielts-academic-writing-sample-tasks-2023.pdf — 11 bài mẫu **có band score + examiner comment**:
- Task 1A Script A = **Band 5**, Script B = **Band 6**
- Task 1B Script A = Band 6, Script B = Band 7
- Task 1C Script A = Band 5, Script B = Band 8.5, Script C = Band 4
- Task 2A Scripts A/B/C = Band 6.5, Band 5.5, Band 8.5 (ví dụ)
- Task 2B Scripts A/B = Band 7, Band 5.5
(comment mẫu, Task 1A Script A Band 5: *"There is a good attempt to describe the overall trends but the content would have been greatly improved if the candidate had included some reference to the figures given on the graph… the structures are fairly simple and efforts to produce more complex sentences are not successful."*)

**Cách làm:** retrieval theo **task type + band**, 1 exemplar cho mỗi band 5/6/7/8. Theo MADRAG: "retrieves **one exemplar essay for each score value within the valid score range**", filter theo score của trait rồi chọn nearest theo embedding. Với app chỉ 1-2 call, cách rẻ nhất:
- Task 2: 4 exemplar (band 5.5, 6.5, 7, 8.5) — lấy từ PDF sample scripts + IELTS Liz.
- Task 1: 4 exemplar (band 5, 6, 7, 8.5) — Task 1A/1B/1C từ PDF.
- Prompt placement: exemplar **trước** bài cần chấm, rubric ở giữa, câu hỏi/instruction ở cuối (xem 4.7).

**Định dạng exemplar nên dùng** (từ MADRAG & Choi):
```
<exemplar band="6.5" task="task2" criterion="task_response">
  <essay>...</essay>
  <exemplar_comment>...</exemplar_comment>
</exemplar>
```
MADRAG dùng "rubric-aligned exemplar retrieval" — exemplar được gắn **theo rubric trait**, không chỉ theo band tổng.

## 4.4 Criterion-isolated prompts (tách tiêu chí) + score rồi reconcile

**MTS (Lee et al. 2024, EMNLP Findings):** "we automatically decompose writing proficiency into distinct traits and generate scoring criteria for each trait. Then, an LLM is prompted to extract trait scores from **several conversational rounds, each round scoring one of the traits**. Finally, we derive the overall score via **trait averaging and min-max scaling**." Gain QWK tối đa **+0.437**.

**Template prompt chính xác (Nguyễn et al. 2026, Appendix B.3)** — copy được:
```
Instruction (Task Response)
You are an IELTS Writing Task 2 examiner. Evaluate the essay focusing ONLY on the
criterion Task Response (TR).
Input:
Essay prompt: {prompt}
Essay: {essay}
Output (JSON):
{"score": float}

Instruction (Coherence and Cohesion)
... focusing ONLY on the criterion Coherence and Cohesion (CC).
Output (JSON):
{"score": float, "comment": string}

Instruction (Lexical Resource)  → {"score": float, "comment": string}
Instruction (Grammatical Range and Accuracy) → {"score": float, "comment": string}
```

**Template prompt chấm band tổng (Appendix B.1)**:
```
You are a certified IELTS Writing Task 2 examiner. Evaluate the following essay strictly
according to IELTS band descriptors.
CONTEXT (Reference Essays with Scores): {context}
ESSAY TO EVALUATE:
{question}
RESPONSE FORMAT:
Return only the final overall band score (e.g., 6.5).
```

**Template prompt regenerate analytic scores có soft constraint (Appendix A)** — kỹ thuật hay: **cho model biết overall band rồi yêu cầu 4 tiêu chí có mean khớp**:
```
You are an IELTS Writing Task 2 examiner. The official overall band score of the essay is:
{overall_band}. Your task is to evaluate the essay strictly according to IELTS Writing Task 2
band descriptors.
...
• Assign a band score (0–9, half bands allowed) for each criterion.
• The arithmetic mean of the four analytic scores should be as close as possible to the
  given overall band: {overall_band}.
Output Format (strict JSON only):
{
  "Task_Response": {"Band": <score>, "Comment": "..."},
  "Coherence_and_Cohesion": {"Band": <score>, "Comment": "..."},
  "Lexical_Resource": {"Band": <score>, "Mistakes": [...], "Corrections": [...], "Comment": "..."},
  "Grammatical_Range_and_Accuracy": {"Band": <score>, "Mistakes": [...], "Corrections": [...], "Comment": "..."},
  "Overall_Band_Score": <overall_band>,
  "General_Feedback": "..."
}
```
> **Áp dụng ngược cho app:** dùng **cơ chế soft constraint** này như một **consistency check giữa 2 call**: Call 2 (verify) được biết overall band từ Call 1 và phải **xác nhận hoặc điều chỉnh có lý do**, không được tự chấm rời.

**Vì sao giúp:** (i) giảm hiệu ứng "band mặc định 7" vì mỗi tiêu chí phải tự biện minh; (ii) tách tiêu chí = giảm redundancy & tránh việc model "cân bằng" 4 tiêu chí cho ra 6.5 mỗi thứ; (iii) theo EDM 2026, **scoring strategy là chiều mạnh nhất với Claude** → đây là cách hiện thực hoá nó với 2 call.

## 4.5 Forced evidence quoting (chống hallucination + chống rubric-template collapse)

**Anthropic docs** (https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices):
> *"**Ground responses in quotes:** For long document tasks, ask Claude to **quote relevant parts of the documents first** before carrying out its task. This helps Claude focus on the relevant content and ignore the rest of the document."*
> *"**Ask Claude to self-check.** Append something like 'Before you finish, verify your answer against [test criteria].'"*

**Cách làm (kết hợp 2 call):**
```
Call 1 — ANALYSIS ONLY (no scores)
For each of the four criteria, list 2-4 VERBATIM quotes from the essay (copy exact words,
do not paraphrase) that are the strongest evidence for that criterion's rating, and 1-3 quotes
that work AGAINST it. If you cannot find a quote for a feature, the feature is absent —
write "NOT PRESENT" instead of describing it.
Output JSON: { "criterion": ..., "for": [{"quote": "...", "feature": "..."}],
               "against": [{"quote": "...", "feature": "..."}] }

Call 2 — SCORE (given Call 1's quotes)
Using only the quotes above, assign each criterion a band. Every band must be supported by
at least one quote. If a quote is missing from the essay, it does not exist.
Then verify: for each criterion, check every negative feature of the band above your chosen
band. If any is present, drop the band.
Finally: "Before you finish, verify each band against the quotes you used."
```

**Vì sao giúp:**
- Chống **E6 (debate capture / unverified claims)**: nếu score pass phải dựa trên quote đã trích, thì pass 2 "enrich" không thể nói "disorganized" nếu không có quote.
- Chống **E5 (rubric-template collapse)**: "NOT PRESENT" là cách ép model thừa nhận feature không có, thay vì dùng câu mẫu band.
- Chống hallucination: mọi nhận xét đều trace được về một câu cụ thể → app có thể **validate tự động** (quote phải là substring thực sự của bài, nếu không → drop score và retry).

## 4.6 "Band X achieved if…" decision list

Đây là biến thể prompt-engineering được hỏi trong đề bài, và nó khớp với cơ chế "floor" của IELTS descriptor (§1.2). Cách viết:
```
DECISION LIST — score each criterion top-down. Stop at the first band whose requirements are ALL met.

BAND 8 requires:
  [ ] Task Response: prompt appropriately AND sufficiently addressed; clear, well-developed position;
      ideas relevant, well extended AND supported; only occasional omissions/lapses.
      EVIDENCE (quote): "..."
  [ ] No Band 7 negative feature present: no over-generalisation, no lack of focus/precision,
      no minor lapses in coherence, no inappropriacies in collocation, no non-systematic errors.
      EVIDENCE (quote): "..."
  If ALL boxes ticked → Band 8. Otherwise go to Band 7.

BAND 7 requires:
  [ ] ... (same structure)
```
**Lưu ý phản hồi vòng lặp:** yêu cầu "stop at the first band whose requirements are ALL met" làm giảm score inflation vì model phải đi qua từng band, không nhảy thẳng lên band giữa. Nhưng đừng quá dài — prompt quá dài làm giảm sự chú ý. Ưu tiên **2 call** (call 1 trích quote + tìm band candidate, call 2 quyết định) thay vì 1 call dài.

## 4.7 Cấu trúc prompt theo Anthropic (Claude 5.x)

Từ https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices:

| Kỹ thuật | Chi tiết áp dụng cho app |
|---|---|
| **Long data at top, query at end** | *"Place your long documents and inputs near the top of your prompt, above your query, instructions, and examples. This improves performance across all models."* + *"**Queries at the end can improve response quality by up to 30 percent** in tests, especially with complex, multidocument inputs."* → Thứ tự: `<exemplars>` → `<rubric>` → `<essay>` → `<question/instruction>` ở cuối. |
| **XML tags** | "Wrap each type of content in its own tag… reduces misinterpretation." Dùng: `<exemplars>`, `<rubric>`, `<essay>`, `<question>`, `<instructions>`, `<output_schema>`. |
| **Few-shot 3-5 examples** | "Include **3–5 examples** for best results", relevant + diverse + structured trong `<examples><example>`. Nhưng xem cảnh báo bên dưới. |
| **"Tell what to do, not what not to do"** | Thay vì "don't hallucinate" → "every quote must be a verbatim substring of <essay>". |
| **Ground in quotes** | Xem §4.5. |
| **Self-check** | "Before you finish, verify your answer against [criteria]." (Lưu ý: Opus 5 tự verify quá nhiều → bỏ instruction này nếu dùng Opus 5; Haiku 5.5 ở low/medium có thể bỏ qua → dùng effort cao hơn.) |
| **Prefill removed** | Từ Claude 4.6+ prefill trả **400 error**. Dùng structured outputs thay vì prefill để ép JSON. |
| **Prompt caching** | "Static content first, variable content last" → cache được rubric + exemplars (prefix). Essay thay đổi → đặt sau. |

## 4.8 Những kỹ thuật KHÔNG nên dùng (có bằng chứng phản đối)

| Kỹ thuật | Vì sao bỏ | Nguồn |
|---|---|---|
| **Role prompting ("You are a strict IELTS examiner")** | Không có controlled ablation nào chứng minh cải thiện accuracy trên model hiện đại. "irrelevant persona detail" gây giảm **~30 điểm phần trăm**. Anthropic: *"Skip the role setting… It infers the appropriate level of expertise from the task and context you provide."* | https://journal.daniellopes.dev/p/prompt-engineering-techniques (tổng hợp Wharton arXiv 2512.05858; EMNLP 2025 aclanthology 2025.emnlp-main.1364) |
| **"Let's think step by step" / CoT thủ công** | "CoT is mostly a math-formatting effect" — 95% gain MMLU đến từ câu có "=". Trên reasoning model bị deprecated, tốn 20-80% thời gian. | https://journal.daniellopes.dev/p/prompt-engineering-techniques |
| **Self-consistency (nhiều sample + median)** | Trên frontier model: Gemini-2.5-Pro MATH-500 98% → 99.6% với **15 paths × 15 tokens**. Không đáng để trả 15× token cho bài IELTS 250 từ. | cùng nguồn, cite arXiv 2511.00751v2 |
| **1-shot duy nhất** | "**One example is the count most likely to make things worse**": GPT-4o-mini AG News 0.8446 F1 zero-shot → 0.8248 one-shot. Nếu ship 1-shot mà chưa test zero-shot → mất tiền mà giảm accuracy. | cùng nguồn, cite arXiv 2607.22969 |
| **"Harsh examiner" prompt** | "Accuracy that depends on clever prompting is **roleplay, not calibrated assessment**" — và không ổn định giữa các chat. | https://www.ieltsgrader.com/blog/why-chatgpt-overestimates-ielts-band-scores |
| **AI-text detector để chấm điểm** | 61.3% false positive trên TOEFL essays của người không bản ngữ. | Liang et al., *Patterns* 2023 — https://pmc.ncbi.nlm.nih.gov/articles/PMC10382961/ |

**Lưu ý về self-consistency — cách rẻ thay thế (Qiu et al. 2024):**
> *"the models generated **two independent scores** for each essay. These scores were averaged if they differed by no more than **two points**. If the scores diverged by more than two points, the essay was **re-evaluated up to three times** to achieve consistency."* — https://aclanthology.org/2024.paclic-1.36.pdf

Đây là mẫu rẻ, 2 call, phù hợp budget của app: **Call 1 = score; Call 2 = independent re-score (không thấy output của Call 1) + reconcile**. Nếu lệch > 1.0 band → escalate (call thứ 3 hoặc flag cho human).

## 4.9 Design để "separation of analysis from scoring"

Từ Brennan, *Evaluation Prompt Engineering* (https://mbrenndoerfer.com/writing/evaluation-prompt-engineering):
- "Chain-of-thought evaluation is worth the additional token cost in most situations. Studies have found that judges using chain-of-thought formats show **higher agreement with human raters and greater consistency across prompt variants** than judges creating direct scores. The mechanism… When the judge must write down its reasoning before scoring, it is effectively **constrained to produce a score that is consistent with the written reasoning**."
- "**Single-dimension vs. multi-dimension evaluation**: The most common design mistake is asking a judge to evaluate multiple quality dimensions with a single score… that weighting is opaque, unstable." → **Chấm từng tiêu chí riêng rồi aggregate bằng code** (đúng như mô hình của app), đừng để model tự tính trung bình.
- "**Criterion independence**:… Redundant criteria amplify the weight of underlying dimensions… a rubric that lists fluency, readability, grammaticality, and coherence as separate criteria is effectively weighting surface-level language quality four times as heavily." → IELTS đã tách LR và GRA nên ổn; nhưng **đừng thêm tiêu chí mới** (vd "vocabulary variety") vì sẽ double-count với LR.
- "**Do not truncate responses to fixed lengths before presenting them to the judge.**" — liên quan: khi trích quote, **đừng cắt bài**.
- "**Formatting artifacts**: Markdown headings, bullet points… are interpreted differently by LLM judges than by human readers." → **Viết bài ứng viên vào prompt dưới dạng plain text, giữ nguyên paragraph breaks**, không markdown hóa (bullet points của app cũngnguyên dạng).
- "**Criteria ordering**: If your prompt lists accuracy, clarity, and helpfulness, the judge tends to weight criteria listed first more heavily." → Thứ tự tiêu chí trong prompt có ảnh hưởng; nên test thứ tự.

---

# 5. Task 1 vs Task 2: bẫy riêng + penalties

## 5.1 Task 1 (Academic) — 5 checks bắt buộc

Từ Key Assessment Criteria + band descriptors, Task 1 cần:
1. **Key feature selection** (chọn feature quan trọng, không liệt kê tất cả số liệu)
2. **Sufficient detail / illustration** cho feature đó
3. **Accuracy** trong báo cáo số liệu & trend
4. **Comparison/contrast** — "rather than **mechanical description reporting detail**"
5. **Appropriate format** (report, không phải opinion/conclusion)

**Ba điểm phân biệt band rõ nhất (checklist máy hoá được):**

| Feature | Band 5 | Band 6 | Band 7 | Band 8 |
|---|---|---|---|---|
| **Overview** | không có overview | "**a relevant overview is attempted**" | "**presents a clear overview**" + data **appropriately categorised** + main trends/differences **identified** | "key features are **skilfully selected**" |
| **Data support** | "**there may be no data to support the description**"; recounting "mainly mechanical" | "Information is appropriately selected and **supported using figures/data**" | key features "covered and clearly highlighted but could be **more fully or more appropriately illustrated or extended**" | clearly presented, highlighted **and illustrated** |
| **Grouping / categorisation** | không rõ | cơ bản | **"the data are appropriately categorised"** | — |

**Vì sao quan trọng:** Task 1 là **information-transfer task**, không phải argument. Nếu app chấm Task 1 bằng logic Task Response (position, development, argument), nó sẽ chấm sai hoàn toàn. Đây là lỗi kiến trúc lớn nhất nếu app hiện dùng chung một rubric.

**Checklist máy hoá cho Task 1 (đưa vào `task_checks`):**
```
Task 1 — Academic
[ ] overview_present          (band 6+ yêu cầu; "a relevant overview is attempted")
[ ] overview_is_clear         (band 7+)
[ ] data_categorised           (band 7+)
[ ] main_trends_or_differences_identified (band 7+)
[ ] key_features_selected_not_listed   (band 8)
[ ] figures_accurately_reported
[ ] comparison_present_not_mechanical
[ ] no_opinion_or_conclusion   (Task 1 không có conclusion kiểu opinion)
[ ] word_count >= 150
Task 1 — General Training (letter)
[ ] purpose_of_letter_explained
[ ] all_three_bullet_points_covered
[ ] each_bullet_point_extended
[ ] tone_consistent_and_appropriate
[ ] format_appropriate
```

## 5.2 Task 2 — checks

```
[ ] all_parts_of_prompt_addressed      (thiếu 1 phần → TR trần 5)
[ ] position_clear_from_intro_and_maintained
[ ] every_main_idea_has_explanation_or_example
[ ] evidence_supports_each_claim
[ ] conclusion_formulated (không lặp lại)
[ ] no_irrelevant_detail
[ ] no_repetition
[ ] format_appropriate (essay, không bullet/note)
[ ] word_count >= 250
```
Nguồn: IDP — *"You must answer all parts of the question to reach a band 6 or higher"* (https://ielts.idp.com/prepare/article-ielts-writing-task-2-8-steps-to-band-8).

## 5.3 Penalties (chính thức)

Từ https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf:
> *"Candidates should note that scripts may be penalised if they are **a) partly or wholly plagiarised**, **b) not written as full, connected text** (e.g. using bullet points in any part of the response, or note form, is not appropriate, etc.)."*

Từ band descriptors:
| Tình huống | Hậu quả |
|---|---|
| **≤ 20 từ** | Band 1 (mọi tiêu chí) |
| **Toàn bộ bài bị học thuộc** | **Band 0** |
| **Một phần bị học thuộc / plagiarised** | bị penalise; có thể **không được tính là có năng lực** ở tiêu chí đó |
| **Bullet points / note form** | bị penalise (không phải "full connected text") |
| **Off-topic** | Task band 2; Task 1 band 2 "entire response may be off-topic" |
| **Significantly underlength** | LR/GRA band 3: "resource is inadequate (**which may be due to the response being significantly underlength**)"; Task Response "main parts **incompletely addressed**" → band 5 |
| **Không đúng format** | Task band ≤ 6 |

**Về underlength — số liệu thực tế (ieltsgrader practice corpus, n=170 Task 2):**
| Word count | n | Avg TR | Avg overall |
|---|---|---|---|
| Under 250 | 47 | **4.14** | **3.49** |
| 250–290 | 47 | 5.57 | 4.66 |
| 291–350 | 52 | 5.84 | 5.27 |
| Over 350 | 24 | 6.02 | 5.81 |

→ **Dưới 250 từ là "band 4-ish" trên TR, không phải band 6.** App nên:
1. **Đếm từ trước** (code, không hỏi LLM — LLM đếm từ sai).
2. Nếu < 250 → **cap Task Response ở 5** và **ghi rõ lý do** vào output.
3. Nếu < 150 (Task 1) → tương tự.

**Về "memorised"/template (xem thêm §7).**

## 5.4 Word count: đếm bằng code, không hỏi LLM

Không có nguồn nào ủng hộ việc để LLM tự đếm từ — và LLM đếm từ **rất** không đáng tin. Nên:
- Tokenize + count ở server, truyền `word_count` vào prompt như một **fact**.
- Nhớ: **words copied from the question are not counted** (theo bản cũ của ielts.org band descriptors note; hiện đã bị gỡ khỏi PDF 2023, nhưng vẫn là thông lệ chấm). Trừ số từ lặp lại từ đề khi đếm.

---

# 6. Public prompt templates & rubric JSON schemas (dùng được ngay)

| # | Nguồn | URL | Chất lượng | Ghi chú |
|---|---|---|---|---|
| 1 | **Nguyễn et al. 2026** (arXiv 2603.06424) | https://arxiv.org/html/2603.06424v1 | ⭐⭐⭐⭐⭐ | **4 prompt template** ở Appendix B.1 / B.2 / B.3 + strict-JSON template ở Appendix A (Fig. 10). Bắt nguồn từ IELTS Task 2 dataset thật. Đây là nguồn tốt nhất để lấy JSON schema. |
| 2 | **IELTS official band descriptors** | https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf | ⭐⭐⭐⭐⭐ | Nguồn sự thật gốc cho rubric text (đã trích ở §1). |
| 3 | **IELTS official sample scripts + examiner comments** | https://ielts.org/cdn/Sample-tests/ielts-academic-writing-sample-tasks-2023.pdf | ⭐⭐⭐⭐⭐ | 11 exemplar có band + examiner comment → làm exemplar set. |
| 4 | **IELTS official Key Assessment Criteria** | https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf | ⭐⭐⭐⭐⭐ | Định nghĩa tiêu chí + penalties. |
| 5 | **hung20gg/ielts_w2** (GitHub, MIT-ish) | https://github.com/hung20gg/ielts_w2 | ⭐⭐⭐ | `prompt/explain_metric.txt` — per-criterion band descriptors dạng text + `output_format.txt` + `output_suggestion_format.txt`. **CẢNH BÁO: file này có bug — phần "Band 7 Lexical Resource" copy nhầm nội dung Coherence & Cohesion.** Dùng làm skeleton, **không** copy mù. Repo cũng chứa `agent.py`, `writing_task_1.py`, `writing_task_2.py` (multi-agent, self-correction) — đáng đọc để học cách tách agent. |
| 6 | **IELTS Liz** | https://ieltsliz.com/ielts-writing-task-2-band-scores-5-to-8 + https://ieltsliz.com/ielts-writing-task-1-band-scores/ | ⭐⭐⭐⭐ | Band descriptor dạng ảnh (Task 1 & Task 2) + ví dụ tính điểm. Cũng có PDF mirror: https://ieltsliz.com/wp-content/uploads/2024/07/ielts_writing_band_descriptors-1.pdf |
| 7 | **MADRAG** (Keramati et al. 2026) | https://arxiv.org/html/2606.06754v1 | ⭐⭐⭐⭐ | Appendix A.6 có **prompt templates cho Advocate / Skeptic / Judge** + A.7 exemplar construction + A.5 score parsing constraints. Rất sát với việc tách app thành 2 call. |
| 8 | **JihanBot_Ielts** (GitHub) | https://github.com/langkhachhoha/JihanBot_Ielts | ⭐⭐ | Agentic IELTS writing system (generate→refine→analyse, extract vocab/collocations). |
| 9 | **bandladder.com** | https://bandladder.com/guides/ielts-writing-task-2-band-descriptors | ⭐⭐⭐ | Band descriptors bằng plain English (tiện cho prompt, nhưng **không thay thế** wording chính thức). |

---

# 7. Phát hiện bài mẫu / memorized band-9 boilerplate

## 7.1 Quy tắc chính thức

- **Band 0**: *"Should only be used where… there is **proof that a candidate's answer has been totally memorised**."*
- **Band 4 LR**: *"There may be **inappropriate use of lexical chunks (e.g. memorised phrases, formulaic language and/or language from the input material)**."*
- **Penalty**: *"scripts may be penalised if they are **a) partly or wholly plagiarised**"*.
- IELTS Liz (https://ieltsliz.com/ielts-penalty-for-writing-under-word-count): *"**Memorised answer** — if your essay answer is memorised, it will not be accepted and could result in a **0 band score**."* Và: *"The examiner will recognise it is a copy because the **memorised parts will be band 9** and the parts you put in will be band 6 or 7."* (→ **mixed essay = hỗn hợp band 9 và band 6/7, không phải band 9**)
- Magoosh (https://magoosh.com/ielts/ielts-writing-task-2): *"**Do not memorize entire essays.** Examiners recognize memorized content and will penalize it."*

## 7.2 Vì sao KHÔNG dùng AI-text detector

**Liang et al., *Patterns* 2023** (Stanford): 7 detector chạy trên TOEFL essays của người không bản ngữ:
- **Average false-positive rate 61.3%**; 19.8% bị cả 7 detector cùng flag; **97.8%** bị ít nhất 1 detector flag.
- Trên bài của học sinh Mỹ (8th grade): gần hoàn hảo.
- Kết luận của tác giả: *"we **strongly caution against the use of GPT detectors in evaluative or educational settings**, particularly when assessing the work of non-native English speakers."*
→ https://pmc.ncbi.nlm.nih.gov/articles/PMC10382961/ ; https://hai.stanford.edu/news/ai-detectors-biased-against-non-native-english-writers

**Hậu quả cho app:** nếu app gắn nhãn "AI-generated" bằng detector, **học sinh Việt sẽ bị flag sai hàng loạt**. Đây là rủi ro sản phẩm rất lớn.

## 7.3 Cách phát hiện đúng: plagiarism-style n-gram overlap (không phải AI detection)

**Bước 1 — Build corpus bài mẫu.** Thu thập model essays band 8-9 từ các nguồn public:
- IELTSPodcast 35 band-9 essays: https://www.ieltspodcast.com/writing-task-2/band-9-sample-essays
- Magoosh band-9 essays: https://magoosh.com/ielts/ielts-writing-task-2
- IELTS Advantage Task 1: https://www.ieltsadvantage.com/writing-task-1
- bandladder.com, customuniversitypapers.com, speechful.ai/blog/blog-ielts-writing-task-2-essay-templates
- **IELTS official sample scripts** (PDF ở §6 #3) — 11 bài, có band + examiner comment, **nhiều nhất về uy tín**

**Bước 2 — Tính overlap (nhanh, deterministic, không tốn token).**
```
- Chuẩn hóa: lowercase, bỏ dấu câu, collapse whitespace.
- Tokenize thành word shingles, n = 8 (8-gram) hoặc 10.
- Với mỗi bài mẫu: đếm tỷ lệ shingle của bài ứng viên xuất hiện trong bài mẫu.
- max_shingle_overlap = max trên toàn bộ corpus.
- covered_fraction = số shingle khớp liên tiếp / tổng số shingle (đo "phần nào của bài bị copy").
- Đồng thời đo: lexical_diversity, type_token_ratio, sentence_length_variance, số câu dài bất thường.
```
Nghiên cứu nền cho ngưỡng: **word-level n-gram (n=4..8) là hiệu quả nhất** cho plagiarism detection có reference corpus (Barron & Rosso, ECIR 2009 — https://personales.upv.es/prosso/resources/BarronRosso_ECIR09.pdf); và **stopword n-gram** phát hiện được cả paraphrase (Stamatatos).

**Bước 3 — LLM check (chỉ 1 câu, rẻ).** Đưa **các đoạn nghi ngờ** (đoạn có overlap cao) vào prompt, hỏi:
```
These passages were taken from published band-8/9 IELTS model answers.
Decide, for EACH passage separately:
  (a) Is it generic enough to be reusable for MANY different essay topics?
  (b) Is it topic-specific to this prompt?
If (a) is true and (b) is false → flag as MEMORISED/TEMPLATE.
Also flag if the essay appears to be an AI-generated generic essay rather than human-written:
  - perfect uniform sentence length
  - no personal experience / no concrete named example
  - no errors, no imperfection, no unusual idiom
  - every paragraph starts with the same structural formula
Output: {passages: [{id, memorised: bool, generic: bool, reason}]}
```
**Vì sao dùng LLM cho bước này:** N-gram bắt được **verbatim**, không bắt được "template có thay từ". LLM bắt được "topic-agnostic boilerplate".

**Bước 4 — Áp vào rubric (đừng phạt trực tiếp).**
- Đừng set band = 0 (không đủ bằng chứng, và sẽ tệ nếu false positive).
- Làm đúng như **examiner**: **tách phần bị học thuộc ra khỏi phần của học sinh**. → **Band cho phần memorised = 9 (nó quá tốt, không phải do người viết), band cho phần còn lại = như thật.** Rồi lấy trung bình.
  - Đây chính xác là cơ chế Liz mô tả: "memorised parts will be band 9 and the parts you put in will be band 6 or 7".
- Trả về user một cờu `memorised_risk: "high" | "medium" | "low"` + **quote các đoạn bị nghi ngờ** để học sinh tự biết (transparency quan trọng vì detector có tỷ lệ sai cao).

**Bước 5 — Nhớ caveat quan trọng (MADRAG E.3 Theme 1).** Trước khi trừ điểm cho "lỗi" hãy chắc chắn đó **không phải artifact** của input (ví dụ placeholder @CAPS, @PERSON bị đếm là lỗi capitalization → under-scoring). Trong app: normalize/mask trước khi chấm.

---

# 8. Best practices 2025-2026 cho Claude trong evaluation/scoring

Nguồn chính: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices và https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5

## 8.1 Thinking / effort (rất quan trọng cho Haiku 5.5)

| Điểm | Chi tiết |
|---|---|
| **Adaptive thinking** | `thinking: {"type": "adaptive"}` + `output_config: {"effort": "high"}`. *"In internal evaluations, adaptive thinking reliably drives better performance than extended thinking. Consider moving to adaptive thinking."* |
| **Haiku 5.5 mặc định thinking ON** | *"On Claude Opus 5, Claude Sonnet 5.5, Claude Sonnet 5, and **Claude Haiku 5.5**, thinking is on by default when you omit the `thinking` parameter… On Claude Haiku 5.5, you can disable it only at effort `high` or lower."* |
| **Effort levels (Haiku 5.5 đầu tiên có)** | `low` (rẻ/nhanh) · `medium` (default) · `high` (knowledge work, strict instruction following) · `xhigh` · `max`. *"Compare two or three of these levels **on your own evals**."* |
| **max_tokens phải chừa chỗ cho thinking** | *"Thinking is on by default and counts toward `max_tokens`, which can go up to 128,000. A `max_tokens` value sized for Claude Haiku 4.5 requests that ran without thinking can **cut the reply off**."* → **TĂNG max_tokens** so với hiện tại nếu chưa. |
| **Không tắt thinking bằng prompt** | *"In Anthropic's testing, telling the model in the prompt to answer directly didn't stop it from thinking."* → phải dùng `thinking: {"type":"disabled"}` (chỉ ở low/medium/high; ở xhigh/max → 400 error). |
| **JSON output + tool call** | *"With thinking off, Claude Haiku 5.5 might skip a tool call it needs when you also request JSON output… Use adaptive thinking"* hoặc thêm: *"The JSON output format applies to your final answer only. When you need a tool, call it first, with no text before the call, and write the JSON once you have the results."* |
| **Temperature trên reasoning model** | Anthropic docs: trên Opus 5 / Sonnet 5, **trả 400 error** nếu set temperature/top_p/top_k khác default. → **Đừng truyền temperature=0 nếu proxy/model đó từ chối.** Dùng `effort` thay thế. |
| **Không deterministic tuyệt đối** | *"even with temperature of 0.0, the results will not be fully deterministic."* |

**Khuyến nghị cụ thể cho app:** thử 3 cấu hình trên eval set của bạn — (a) `effort: low` + không exemplar, (b) `effort: medium` + 4 exemplar, (c) `effort: high` + 4 exemplar + retrieval theo band. Đo RMSE/QWK từng cấu hình.

## 8.2 Prompt structure

- **XML tags** cho mọi khối: `<exemplars>`, `<rubric>`, `<essay>`, `<question>`, `<instructions>`.
- **Long data at top, query at end** → +30% quality (docs).
- **"Tell, don't prohibit"** → định dạng output bằng mô tả hành vi mong muốn.
- **Few-shot 3-5** trong `<examples><example>`; examples phải relevant + diverse + structured.
- **Self-check**: *"Before you finish, verify each criterion band against the quotes you used."*
- **Prefill không dùng được** (400 error từ 4.6+) → dùng structured outputs.
- **Prompt caching**: rubric + exemplars static → đặt trước để cache hit; essay thay đổi → sau.

## 8.3 Prompt rot — phải có eval

> *"A 2025 migration case study found prompts stabilized for GPT-4-32k passing at only **98%** on GPT-4.1 and **97.3%** on GPT-4.5-preview. **Prompts rot like dependencies**, and nothing in CI notices unless you wrote the eval."*
> — https://journal.daniellopes.dev/p/prompt-engineering-techniques (cite arXiv 2507.05573)

Checklist vận hành từ cùng nguồn + Hamel Husain:
1. Thu thập 50-100 input thật **trước khi** viết prompt (kể cả case xấu).
2. Bắt đầu zero-shot + output format rõ ràng; chạy 3-5 lần/input.
3. **Error analysis trước, rubric sau.**
4. Đổi **một biến** mỗi lần (wording / examples / format / technique).
5. **Version mọi prompt**, log mọi run; dùng registry (PromptLayer / LangSmith / Langfuse).
6. **Gate merge lên eval regression** (DeepEval `--official` baseline).
7. Track token + cost theo từng prompt version.

## 8.4 Minimum Viable Validation Protocol (MVVP) — áp cho app

Từ Norman et al. 2026 (https://arxiv.org/html/2606.19544v1), "before deploying an LLM judge":
1. **Chance-correct**: report Cohen's κ (hoặc Krippendorff's α) cùng exact-match; lấy metric đã chance-correct làm headline. (Exact match overstates 33.8-41.3 pp.)
2. **Swap positions**: đo position bias bằng paired AB+BA → report |P(A wins) − 0.5|.
3. **Replicate**: test–retest ≥ 3 runs độc lập, temperature 0, **response caching disabled**.
4. **Cross-validate**: ≥ 2 benchmark.
5. **Audit the paradox**: nếu test–retest > 0.95, phải xác nhận position bias < 0.10.

**Bổ sung từ Nguyen et al. 2026 (cho IELTS):** tách **analytic scores** và **overall band** làm 2 metric riêng vì chúng lệch nhau; và dùng **QWK** (Quadratic Weighted Kappa) làm metric chính vì nó phạt nặng sai lệch lớn — phù hợp vì trong IELTS sai 1 band là fail.

---

# 9. Kiến trúc đề xuất (2 LLM call, giữ nguyên budget)

```
┌─ INPUT ─────────────────────────────────────────────────────────────┐
│ question (task type + full prompt + bullet points)                  │
│ essay (plain text, giữ paragraph breaks)                            │
│ word_count (computed server-side, KHÔNG để LLM đếm)                │
│ task_type ∈ {task1_academic, task1_general, task2}                  │
└──────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────▼─────────────────────┐
        │ CALL 1 — "ADVOCATE + ANALYSIS" (no scores) │
        │  effort: high · adaptive thinking on      │
        │  rubric = official descriptor excerpt     │
        │  + 4 retrieved exemplars (band 5/6/7/8)   │
        │  + calibration prior                       │
        │  Output JSON:                             │
        │   - quotes_for[criterion] (verbatim)      │
        │   - quotes_against[criterion]             │
        │   - task_checks (Task1/Task2 checklists)   │
        │   - error_stats (GRA: sentences, clean,   │
        │     by type; LR: spelling, word formation) │
        │   - memorised_risk (if triggers)          │
        │   - candidate_bands[] + floor_reasons[]   │
        └─────────────────────┬─────────────────────┘
                              │
        ┌─────────────────────▼─────────────────────┐
        │ CALL 2 — "SKEPTIC + JUDGE"               │
        │  Input: essay + CALL 1 output (full)      │
        │  + rubric + exemplars (band-matched)       │
        │  + calibration prior                        │
        │  Role: independently challenge, then decide│
        │  Output JSON:                              │
        │   - per_criterion: band (int 0-9),         │
        │     evidence quotes, floor check,          │
        │     weaknesses, priority fix               │
        │   - overall_band (computed by CODE)        │
        │   - enrichment (structure, examples,       │
        │     error_logs, vocabulary/band plan)      │
        └─────────────────────┬─────────────────────┘
                              │
        ┌─────────────────────▼─────────────────────┐
        │ CODE (deterministic)                      │
        │  - verify every quote ⊂ essay (substring)  │
        │    → nếu sai: drop field, flag, optional  │
        │      1 retry                                │
        │  - Task_Band = mean(4 int bands)           │
        │  - Writing = (T1 + 2×T2)/3 → nearest 0.5  │
        │  - apply word_count caps (<250 → TR ≤ 5)   │
        │  - apply memorised_risk adjustments        │
        │  - if |Call1 candidate − Call2 band| > 1.0 │
        │    → flag "borderline / needs 3rd pass"    │
        └────────────────────────────────────────────┘
```

**Quyết định thiết kế chính, dựa trên bằng chứng:**
- **Call 2 = Skeptic + Judge**, không phải "enricher" thuần. Lý do: MADRAG cho thấy **Skeptic-only transcript gần như 0 QWK** nhưng **Advocate-first → Skeptic → Judge** là tốt nhất; và **2 vòng debate làm QWK sập** → chỉ 1 vòng.
- **Call 1 output là input của Call 2** → "debate capture" vẫn có thể xảy ra, nên Call 2 phải có ràng buộc verify: *"Every criticism must be supported by a verbatim quote from the essay. If you cannot quote it, do not report it."*
- **Đổi thứ tự nếu cần**: Skeptic-đầu tạo under-scoring → **luôn để Call 1 (Advocate) trước**.
- **Judge quyết định band, code tính overall** → tránh lỗi "model tự tính trung bình sai".

---

# 10. TOP 10 đề xuất, xếp theo impact/effort

| # | Đề xuất | Impact | Effort | Vì sao (bằng chứng) | Nguồn |
|---|---|---|---|---|---|
| **1** | **Implement cơ chế "band floor"** — mỗi tiêu chí phải check *mọi* negative feature của band ngay trên kia; nếu có → hạ band. Output kèm `floor_reasoning` + quote. | 🔴 Rất cao | 🟡 Trung bình | Đây là điều rubric chính thức yêu cầu và hiện chắc chắn đang bị bỏ qua. Biến score từ estimation → verification. | [band descriptors PDF](https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf) |
| **2** | **Thêm calibration/distribution prior** vào cả 2 prompt (kèm debiasing instruction "LLMs compress toward the mean"). | 🔴 Rất cao | 🟢 Thấp | **+19.0 điểm %** accuracy (ablation, held-out). Sửa lỗi lớn nhất của LLM judge (score compression). | [Sanghi 2026](https://nhsjs.com/2026/prompt-design-for-llm-essay-scoring-from-rubrics-to-calibration) |
| **3** | **Tách Task 1 rubric khỏi Task 2 rubric** + thêm task-specific `task_checks` (Task 1: overview/categorisation/comparison/no-data; Task 2: all-parts/position/development). | 🔴 Rất cao | 🟡 Trung bình | Key Assessment Criteria: Task 1 là information-transfer, Task 2 là argument. Task 1 band 6 = "a relevant overview is **attempted**" vs Task 2 band 6 = "some parts more fully covered than others". | [key criteria PDF](https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf) |
| **4** | **Restructure 2 call thành Advocate(analysis+quote) → Skeptic+Judge(score+enrich)**, Call 2 phải verify quote. | 🔴 Rất cao | 🟡 Trung bình | **Scoring strategy = 32% phương sai với Claude Opus 4.6** (chiều mạnh nhất). Skeptic-only ≈ 0 QWK; 2 vòng làm QWK sập. | [Corsi et al. 2026 (EDM)](https://educationaldatamining.org/edm2026/proceedings/2026.EDM.poster-demo-papers.391/index.html), [MADRAG](https://arxiv.org/html/2606.06754v1) |
| **5** | **Tách tiêu chí độc lập + aggregate bằng code** (không để model tự tính trung bình); overall = code tính `(T1+2×T2)/3` rồi round `floor(x*2+0.5)/2`. | 🔴 Cao | 🟢 Thấp | MTS gain QWK +0.437; Brennan: multi-dimension single score = implicit weighting "opaque, unstable". Rule chính thức: mean 4 tiêu chí, T2 × 2. | [Lee et al. 2024](https://arxiv.org/abs/2404.04941), [ielts.org](https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail) |
| **6** | **Thêm 4 exemplar đã biết điểm** (Task 1 band 5/6/7/8, Task 2 band 5.5/6.5/7/8.5) lấy từ PDF sample scripts chính thức; đặt exemplar ở đầu prompt. | 🔴 Cao | 🟡 Trung bình | "**providing anchor papers significantly improves LLM-human agreement, bringing it closer to human-human scoring reliability**". Retrieval là driver chính của calibration (MADRAG). Nguồn exemplar miễn phí & chính thức. | [Choi et al. 2026](https://doi.org/10.1016/j.asw.2026.101053), [sample scripts PDF](https://ielts.org/cdn/Sample-tests/ielts-academic-writing-sample-tasks-2023.pdf) |
| **7** | **Đếm word_count bằng code, cap Task Response** (<250 → TR ≤ 5; <150 Task 1 → tương tự), và hiển thị lý do cap. | 🔴 Cao | 🟢 Rất thấp | Dữ liệu thực tế: under 250 → avg TR **4.14** vs 250-290 → 5.57. Không cap = cho điểm sai ~1.5 band. | [ieltsgrader 6.5 vs 7](https://www.ieltsgrader.com/blog/what-caps-band-6-5-vs-7-task-2), [key criteria](https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf) |
| **8** | **Force verbatim quotes** cho mọi nhận xét + validate bằng code (quote phải là substring thật) → drop & retry nếu sai. | 🟠 Cao | 🟡 Trung bình | Chống rubric-template collapse & unverified claims (2 failure mode lớn của MADRAG). Anthropic khuyến nghị "quote first". Cũng cho feedback có căn cứ + kiểm chứng được. | [MADRAG E.3](https://arxiv.org/html/2606.06754v1), [Anthropic docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |
| **9** | **Đổi model call config**: `thinking: adaptive` + `output_config.effort: high`, **tăng max_tokens** (thinking mặc định ở Haiku 5.5), đặt rubric+exemplar ở đầu, câu hỏi ở cuối, XML tags. | 🟠 Cao | 🟢 Thấp | Query-at-end **+30%** quality; adaptive thinking > extended thinking; Haiku 5.5 thinking ON by default và ăn vào max_tokens (thiếu chỗ → cắt reply). | [Anthropic best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [Haiku 5.5 guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5) |
| **10** | **Xây eval harness 30-50 bài có điểm chính thức** (từ HF `chillies/IELTS-writing-task-2-evaluation`, dùng **overall band** làm gold) + chạy A/B mỗi khi đổi prompt; theo MVVP (κ + AB/BA + ≥3 replicate). | 🟠 Cao (bật đầu) | 🟡 Trung bình | "**no universal prompt recipe exists**… responsible deployment requires **empirical prompt calibration as a prerequisite**"; gap best-worst = 4-5 RMSE points; kappa deflation 33.8-41.3 pp. Không có eval = mọi "cải thiện" trên là tin đồn. | [Corsi et al. 2026](https://educationaldatamining.org/edm2026/proceedings/2026.EDM.poster-demo-papers.391/index.html), [Norman et al. 2026](https://arxiv.org/html/2606.19544v1), [HF dataset](https://huggingface.co/datasets/chillies/IELTS-writing-task-2-evaluation) |

**Kèm theo (rẻ, nên làm luôn):**
- **#11** Kiểm tra & sửa: tiêu chí phải là **integer 0-9**; nếu app đang trả 6.5/7.5 cho tiêu chí → sửa thành integer + tính .5 bằng code. *(Source: descriptors chỉ có band tròn; [ieltsliz example](https://ieltsliz.com/ielts-writing-task-2-band-scores-5-to-8))*
- **#12** Bỏ "You are a strict IELTS examiner" / persona dài → thay bằng mô tả tiêu chuẩn cụ thể. *(Source: [prompt engineering 2026](https://journal.daniellopes.dev/p/prompt-engineering-techniques))*
- **#13** Thêm `memorised_risk` bằng **n-gram overlap** (không dùng AI detector) + đánh giá phần bị copy như band 9, phần còn lại như thật. *(Source: [Liang et al. Patterns 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10382961/), [band descriptors band 0/3/4](https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf))*
- **#14** Version prompt + log mọi run + gate merge lên eval regression. *(Source: [prompt rot](https://journal.daniellopes.dev/p/prompt-engineering-techniques))*

---

# 11. Lỗi có thể đang tồn tại trong sản phẩm hiện tại — checklist kiểm tra

| # | Kiểm tra | Vì sao |
|---|---|---|
| 1 | Rubric Task 1 có khác Task 2 không? | Task 1 = information-transfer; dùng chung rubric = chấm sai toàn bộ Task 1 |
| 2 | Có check "all parts of prompt" / "overview present" không? | Đây là hai trần band phổ biến nhất |
| 3 | Word count do code đếm hay LLM đếm? | LLM đếm từ sai; dưới 250 → TR ~4.1 |
| 4 | Tiêu chí trả về integer hay có .5? | Rubric chính thức chỉ có band tròn |
| 5 | Overall band tính bằng code hay để LLM tự làm? | Rule (T1+2×T2)/3 + round .25-up |
| 6 | Call 2 có verify score của Call 1 hay chỉ enrich? | Nếu chỉ enrich → không có cơ chế bắt lỗi |
| 7 | Mọi feedback có quote từ bài không? | Chống hallucination + rubric-template collapse |
| 8 | Có calibration prior không? | Score compression → band 7 cho mọi bài |
| 9 | Có exemplar band 5/6/7/8 không? | Anchor paper là cải thiện agreement đã được chứng minh |
| 10 | Có detect "unnatural sentences" (pass 2) nhưng không dùng để chấm? | Đó là 1 call LLM bị lãng phí — hãy dùng làm Skeptic |
| 11 | `error_logs` có bị double-count với `unnatural` không? | Hai nguồn lỗi trùng nhau → thành 2 lỗi 1 lỗi |
| 12 | Có word_count/format check cho bullet points không? | Penalty chính thức |

---

# 12. Appendix: tóm tắt prompt mẫu (để copy vào repo)

```xml
<system>
You are an IELTS Writing examiner applying the public IELTS Writing band descriptors.
You assess against the four criteria only. You never reward or punish a script for
anything not covered by the descriptors below.

SCORING RULES
1. Each criterion receives an INTEGER band from 0 to 9. Half bands do not exist at
   criterion level; a half band arises only from averaging.
2. A script must FULLY FIT the positive features of the descriptor for its band.
   The negative features listed for a band are the features that LIMIT the rating:
   if any negative feature of band N is present, the criterion cannot score N.
3. Judge the band you can PROVE from the essay, not the band you expect from
   the essay's topic or quality. Most Task 2 responses score between 5.5 and 7.5.
   Band 7 is not the default. If your evidence supports only "adequate but limited",
   that is Band 6.
4. Check your own bias: you tend to compress scores toward the middle. Do not default
   to Band 7, and do not default to Band 6.5.
5. Every judgement must cite a VERBATIM quote from the essay.
</system>

<exemplars>
  <!-- 4 retrieved exemplars, one per band, matching the task type.
       Each carries its official band and examiner comment. -->
</exemplars>

<rubric>
  <!-- Verbatim official descriptor text for THIS task type only, bands 9..5,
       with each band split into POSITIVE features and NEGATIVE features. -->
</rubric>

<essay><![CDATA[...]]></essay>

<question><![CDATA[...full task prompt + bullet points...]]></question>

<instructions>
TASK: <task_type> | WORD COUNT (counted by the system, excluding words copied from the question): <word_count>

Step 1 — TASK CHECKS. Run every applicable check and mark pass/fail with a quote.
Step 2 — EVIDENCE. For each of the four criteria, list 2-4 VERBATIM quotes that
         support the rating and 1-3 quotes that argue against it. Write "NOT PRESENT"
         for any feature you cannot quote.
Step 3 — ERROR STATISTICS. Count sentences, error-free sentences, and errors by type.
         For Lexical Resource count spelling and word-formation errors and state whether
         any error impedes communication.
Step 4 — MEMORISED RISK (only if triggered). Is any passage reusable across many topics
         without change? Flag and quote it. Do not penalise; flag only.
Step 5 — CANDIDATE BANDS. For each criterion, name the band you are considering AND the
         band you are rejecting, list the evidence FOR and AGAINST the chosen band, then
         check EVERY negative feature of the chosen band. If one is present, drop the band
         and repeat. Give the final band and the floor_reasoning.
Step 6 — SELF-CHECK. Before you finish, verify each criterion band against the quotes
         you used, and verify that the four bands are consistent with the task checks.
</instructions>

<output_format>
Return a single JSON object matching the provided schema. No prose outside the JSON.
</output_format>
```

**Call 2 (Judge) — phần khác biệt so với Call 1:**
```
You previously produced an analysis of this essay. You are now the independent judge.
Re-read the essay yourself. Your job is to CHALLENGE the analysis, then decide.

Step A — SKEPTIC PASS. For each criterion, list the strongest criticism of the earlier
         analysis. Every criticism MUST be backed by a verbatim quote. If you cannot quote
         it, do not report it. Where the earlier analysis was wrong, say so.
Step B — VERIFY THE FLOOR. For each criterion, list every negative feature of the band
         you are considering, and confirm it is absent (with a quote).
Step C — DECIDE. Give the final integer band per criterion with the evidence.
Step D — ENRICH. Only now: structure paragraphs, lexical and grammar examples,
         error_logs (quote / correction / explanation), vocabulary_plan, band_plan.
         Correct the earlier analysis wherever the evidence requires it.
```

---

# 13. Danh sách nguồn

**Official IELTS**
- Writing band descriptors: https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf
- Writing key assessment criteria: https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf
- Scoring in detail: https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail
- Academic Writing sample tasks + examiner comments: https://ielts.org/cdn/Sample-tests/ielts-academic-writing-sample-tasks-2023.pdf
- News: band descriptors & key criteria published: https://ielts.org/news-and-insights/ielts-writing-band-descriptors-and-key-assessment-criteria
- IDP band scores: https://ielts.idp.com/results/scores/writing ; Task 2 8 steps: https://ielts.idp.com/prepare/article-ielts-writing-task-2-8-steps-to-band-8
- British Council mirror: https://takeielts.britishcouncil.org/sites/default/files/IELTS_task_2_Writing_band_descriptors.pdf
- IELTS.com.au calculation: https://ielts.com.au/australia/results/band-score-calculation

**Secondary explainers**
- IELTS Liz band scores: https://ieltsliz.com/ielts-band-scores ; Task 2 bands: https://ieltsliz.com/ielts-writing-task-2-band-scores-5-to-8 ; Task 1: https://ieltsliz.com/ielts-writing-task-1-band-scores/ ; underlength penalty: https://ieltsliz.com/ielts-penalty-for-writing-under-word-count ; Task 1 paragraphs: https://ieltsliz.com/writing-task-1-paragraphs
- IELTS Advantage Task 1: https://www.ieltsadvantage.com/writing-task-1
- Magoosh Task 2: https://magoosh.com/ielts/ielts-writing-task-2
- IELTSPodcast 35 band-9 essays: https://www.ieltspodcast.com/writing-task-2/band-9-sample-essays
- bandladder: https://bandladder.com/guides/ielts-writing-task-2-band-descriptors ; https://bandladder.com/guides/how-ielts-score-is-calculated
- Cathoven Writing band formula: https://resources.cathoven.com/ielts-writing-task-1/band-scores
- ieltsgrader: methodology https://www.ieltsgrader.com/methodology ; inflation https://www.ieltsgrader.com/blog/why-chatgpt-overestimates-ielts-band-scores ; 6.5 vs 7 https://www.ieltsgrader.com/blog/what-caps-band-6-5-vs-7-task-2 ; dual-AI https://www.ieltsgrader.com/blog/dual-ai-grading-explained

**Academic**
- Qiu et al. 2024 (PACLIC), IELTS L2 writing assessment: https://aclanthology.org/2024.paclic-1.36.pdf
- Huang & Wilson 2025 (AIME-Con): https://aclanthology.org/2025.aimecon-wip.9.pdf
- Nguyen et al. 2026 (arXiv 2603.06424): https://arxiv.org/html/2603.06424v1
- Choi, Tate & Warschauer 2026, "Anchor is the key": https://doi.org/10.1016/j.asw.2026.101053 ; https://sciety.org/articles/activity/10.35542/osf.io/cbhgz_v1 ; https://markwarschauer.com/publications
- Sanghi 2026, "Prompt Design for LLM Essay Scoring: From Rubrics to Calibration": https://nhsjs.com/2026/prompt-design-for-llm-essay-scoring-from-rubrics-to-calibration
- Corsi et al. 2026 (EDM), "Prompt Sensitivity in LLM-Based Essay Scoring is Model-Specific": https://educationaldatamining.org/edm2026/proceedings/2026.EDM.poster-demo-papers.391/index.html
- Keramati et al. 2026, MADRAG: https://arxiv.org/abs/2606.06754 ; https://arxiv.org/html/2606.06754v1 ; https://aclanthology.org/2026.nlp4dh-1.30
- Norman, Rivera & Hughes 2026, "Reliability without Validity": https://arxiv.org/html/2606.19544v1
- Lee et al. 2024, MTS: https://arxiv.org/abs/2404.04941 ; https://aclanthology.org/2024.findings-emnlp.10
- Stahl et al. 2024 (BEA), joint scoring+feedback: https://aclanthology.org/2024.bea-1.23 ; https://downloads-cf.webis.de/publications/papers/stahl_2024b.pdf
- Pack, Barrett & Escalante 2024: https://www.sciencedirect.com/science/article/pii/S2666920X24000353
- Collova et al. 2025: https://arxiv.org/pdf/2508.02442
- Liu, Ye & Yan 2026 (CAEAI 100565): https://www.sciencedirect.com/science/article/pii/S2666920X26000275
- Korthals et al. 2026, SURE (MLKE 8(3) 74): https://www.mdpi.com/2504-4990/8/3/74 ; https://doi.org/10.3390/make8030074
- Liang et al. 2023, GPT detectors biased vs non-native (Patterns): https://pmc.ncbi.nlm.nih.gov/articles/PMC10382961/ ; https://hai.stanford.edu/news/ai-detectors-biased-against-non-native-english-writers
- Barron & Rosso 2009, n-gram plagiarism detection: https://personales.upv.es/prosso/resources/BarronRosso_ECIR09.pdf
- Abujadallah et al. 2025, prompt design for AES: https://doi.org/10.20944/preprints202511.1429.v1
- Kim 2025, TESOL Quarterly: https://doi.org/10.1002/tesq.3405
- Tang et al. 2024, Heliyon e34262: https://doi.org/10.1016/j.heliyon.2024.e34262

**Prompt engineering / eval**
- Anthropic prompting best practices: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Anthropic Haiku 5.5 guide: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5
- Anthropic think tool: https://www.anthropic.com/research/claude-think-tool
- Anthropic effective context engineering: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Brennan, Evaluation Prompt Engineering: https://mbrenndoerfer.com/writing/evaluation-prompt-engineering
- Lopes, "Prompt engineering in 2026": https://journal.daniellopes.dev/p/prompt-engineering-techniques
- Galileo LLM-as-judge prompt guide: https://docs.galileo.ai/concepts/metrics/custom-metrics/prompt-engineering
- Saito et al., verbosity bias: https://arxiv.org/abs/2310.10076
- Panickssery et al., self-preference: https://arxiv.org/abs/2404.13076
- The Prompt Report: https://arxiv.org/pdf/2406.06608

**Code / templates**
- hung20gg/ielts_w2: https://github.com/hung20gg/ielts_w2 (prompt/explain_metric.txt, prompt/output_format.txt, prompt/output_suggestion_format.txt)
- JihanBot_Ielts: https://github.com/langkhachhoha/JihanBot_Ielts
- HF dataset: https://huggingface.co/datasets/chillies/IELTS-writing-task-2-evaluation
- Kaggle raw IELTS essays: https://www.kaggle.com/datasets/arsenycheplukov/raw-ielts-essays
