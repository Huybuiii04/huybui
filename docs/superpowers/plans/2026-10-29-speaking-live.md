# Kế hoạch: Luyện nói trực tiếp (Live Speaking) — AI examiner hỏi, người học trả lời bằng mic

Ngày: 2026-10-29 · Trạng thái: backend Speaking đã cập nhật; frontend triển khai qua GitHub và Vercel theo yêu cầu người dùng.

## 1. Vấn đề & ràng buộc đã đo

Module Speaking hiện có là mô hình **record → grade**: người học ghi âm từng turn, upload, rồi
worker chấm. Có thay đổi để trở thành hội thoại trực tiếp như `toey.app` / `theieltsdictionary.com`.

Những ràng buộc đã đo bằng request thật (không đoán):

| Đường | Kết quả |
|---|---|
| Gemini Live API (`generativelanguage.googleapis.com`) | **Chỉ hỗ trợ WebSocket**, không có WebRTC native (Google xác nhận trên forum + docs: protocol = stateful WSS). WebRTC cần gateway bên thứ ba (Pipecat / Daily / LiveKit) — không chạy được trên Edge Functions. |
| Key hiện tại (`AI_API_KEY` → proxy `api.apiz.vn`) | 38 model, **không có model `*-live-*`**; WebSocket handshake `v1beta`/`v1alpha` đều đóng `1006`; `/v1/realtime` → 404. → **Không làm được duplex realtime với key hiện tại.** |
| TTS MiniMax (`/v1/audio/speech`) | Chạy được: 2.0–3.2 s/câu, `audio/mpeg`, 2 giọng hợp lệ (`English_expressive_narrator`, `English_Trustworthy_Man`). |
| TTS Gemini (`gemini-3.1-flash-tts-preview`) | Chạy được nhưng **6.5–7.6 s**, không streaming → chỉ dùng làm nhánh dự phòng. |
| STT Gemini (`gemini-3.8-flash`) | 5.8–6.6 s/clip → quá chậm cho lượt nói. |
| "AI examiner" (`gemini-3.8-flash`, JSON) | 6.7–15.6 s (model có thinking) → giới hạn 8 s, quá hạn thì bỏ follow-up. |
| `claude-haiku-5-5` cùng prompt | 3.6 s → nhanh gấp 2–4 lần, dùng được nếu đổi `AI_MODEL_LIVE`. |

Kết luận kiến trúc: **giữ `gemini-3.8-flash` làm model chính** (theo yêu cầu), nhưng độ trễ được
giấu bằng cách **tổng hợp trước giọng cho toàn bộ câu hỏi** của đề. Lượt hỏi chính phát ngay
(0 ms), chỉ câu follow-up sinh động mới phải chờ.

## 2. Kiến trúc

```
Trình duyệt                              Edge Function (Supabase)          Provider (apiz.vn)
────────────                              ───────────────────────          ────────────────
getUserMedia + AudioWorklet
  ├─ VAD (client)  ── hết lượt ─┐
  ├─ MediaRecorder (webm/opus)  │
  └─ Web Speech (transcript)    │
                                 ├── POST speaking-live action=start ──► tạo phiên + token
                                 ├── POST speaking-live action=voice ──► MiniMax TTS → audio/mpeg
                                 ├── POST speaking-live action=brain ──► gemini-3.8-flash (JSON)
                                 ├── POST submit-speaking prepare ────► attempt + turn + signed URL
                                 ├── PUT  storage (signed upload) ─────► bản ghi âm
                                 └── POST submit-speaking commit ─────► enqueue job 'grade-speaking'
                                                                              │
                                             worker: Gemini đọc audio + Claude chấm rubric ETS
```

Quyết định tái dùng: **không** tạo bảng câu hỏi/turn mới cho live. Phiên live dùng chính
`speaking_questions` (đề Cambridge 12–20) + `speaking_attempts` + `speaking_turns`, nên chấm điểm
dùng lại nguyên pipeline `grade-speaking` đã có test (Gemini đọc audio → Claude chấm rubric ETS).

## 3. Luật thi (theo IELTS)

| Phần | Chuẩn bị | Trả lời | Ghi âm |
|---|---|---|---|
| Part 1 | 0 s | mỗi câu ≤ 45 s | 1 recording liên tục cho cả part |
| Part 2 | **60 s** | ≤ **2 phút** | 1 recording (cue card đọc trước) |
| Part 3 | 0 s | mỗi câu ≤ 90 s | 1 recording mỗi chủ đề |

- Part 2 **không** kết thúc lượt nói chỉ vì người học dừng lại (VAD im lặng không cắt Part 2) —
  chỉ dừng ở mốc 2 phút.
- Trong lúc thi **không** chấm điểm, không nhận xét, không đưa band score.
- Mỗi turn = 1 phần = 1 câu hỏi Cambridge tương ứng; giám khảo hỏi lần lượt các câu trong part.

## 4. VAD (client, `src/lib/liveVad.ts`)

- Giai đoạn hiệu chỉnh 700 ms đầu: lấy **giá trị nhỏ nhất** của RMS làm nền tiếng ồn (nhờ vậy tiếng
  nói xen kẽ không làm nền bị đẩy lên).
- Sau hiệu chỉnh: ngưỡng = `max(0.012, nền × 2)`, nền chỉ có thể **đi xuống**.
- Bắt đầu lượt nói khi vượt ngưỡng liên tục ≥ 250 ms; kết thúc khi im lặng liên tục ≥ 900 ms;
  có 400 ms cooldown để không bật/tắt liên hồi.
- Có test riêng (`tests/speaking-live.test.ts`).

## 5. Bảo mật & chi phí

- API key của provider **không bao giờ** tới trình duyệt: mọi lời gọi AI đi qua Edge Function.
- `action=start` cấp **token phiên ngắn hạn 2 giờ** ký HMAC-SHA256 bằng `WORKER_SECRET`
  (`payload.base64(hmac)`), ràng buộc đúng `sessionId` + `userId`; các action sau phải kèm token.
- Trần chi phí mỗi phiên: 30 phút, 40 lượt gọi "AI examiner", 60 lượt tổng hợp giọng,
  10 phiên live/ngày/user (429 `rate_limited`).
- Bộ đếm lưu trong `speaking_live_sessions` để kiểm soát và đối soát.

## 6. File đã thêm/sửa

| File | Vai trò |
|---|---|
| `supabase/migrations/029_speaking_live.sql` | Bảng `speaking_live_sessions` + RLS + index |
| `supabase/functions/_shared/ai/liveSpeaking.ts` | Logic thuần: kế hoạch lượt hỏi, luật thời gian, token phiên, prompt + hợp đồng JSON của AI examiner |
| `supabase/functions/_shared/ai/liveVoice.ts` | Tổng hợp giọng (MiniMax → dự phòng Gemini TTS), bọc PCM thành WAV |
| `supabase/functions/speaking-live/index.ts` | Edge Function: `start` / `voice` / `brain` / `transcribe` / `finish` |
| `supabase/functions/speaking-live/deno.json` | Import map cho `@supabase/supabase-js` (bắt buộc khi deploy) |
| `src/lib/liveVad.ts` | Máy trạng thái VAD (thuần, test được) |
| `src/lib/liveAudio.ts` | Mở mic, đo RMS, ghi âm, phát audio, Web Speech transcript |
| `src/lib/speakingLive.ts` | Client API của phiên live |
| `src/pages/SpeakingLive.tsx` | Trang luyện nói trực tiếp |
| `src/pages/Speaking.tsx`, `src/App.tsx` | Nút "Luyện nói trực tiếp" + route `/app/speaking/live` |
| `supabase/functions/_shared/tests/liveSpeaking.test.ts` | 13 test cho logic live |
| `tests/speaking-live.test.ts` | 6 test cho VAD |

Module **Reading** không bị đụng tới (mọi thay đổi là additive).

## 7. Giọng giám khảo: cache sẵn + dự phòng trình duyệt

Ba tầng, từ nhanh/ổn định nhất xuống:

| Tầng | Khi nào dùng | Độ trễ | Chi phí |
|---|---|---|---|
| **1. Cache sẵn** (Storage `speaking-voice`) | Câu hỏi Cambridge đã được dựng sẵn | ~0.3–1 s (đọc Storage) | 0 |
| **2. TTS server** (MiniMax → Gemini dự phòng) | Follow-up sinh động, câu chưa có trong cache | 2–7 s | có |
| **3. Giọng trình duyệt** (`SpeechSynthesis`) | Server lỗi/hết số dư | ~0 ms | 0 |

- Dựng sẵn: `node --env-file-if-exists=.env.local scripts/build-speaking-voice.mjs`
  (ghi từng câu hỏi vào `voices/{accent}/{sha256(text|accent)}.mp3`; script **chạy lại được**
  — file đã có thì bỏ qua).
- Cache khớp với Edge Function vì cùng dùng `speakableQuestion()` + cùng cách ghép cue card.
- Tầng 3 tự kích hoạt khi `voice` trả lỗi → phiên thi không bị dừng.

## 8. Ba lỗi của pipeline chấm cũ phát hiện khi test live (đã sửa)

Live mode dùng lại pipeline `grade-speaking` nên nó lộ ra 3 lỗi có sẵn của module Speaking
(trước đây record mode cũng dính, chỉ là không ai thấy transcript sai):

1. **Proxy không chuyển audio cho model.** Route OpenAI-compatible `input_audio` của
   `api.apiz.vn` trả về "audio" nhưng model không nghe được — cùng một file cho ra hai
   transcript bịa khác nhau. Đã đổi sang route **native** Gemini
   (`/v1beta/models/{model}:generateContent` + `inlineData`): transcript đúng với cả mp3
   lẫn webm/opus. Sửa ở `_shared/ai/audioProvider.ts`.
2. **Model tự đặt lại `turnId`.** Gửi UUID cho model thì model hay ghi thành nhãn đọc được
   ("TURN 1 (part-1)") → hợp đồng validate fail → `invalid_model_output`. Đã gửi mã đơn giản
   (`turn-1`, `turn-2`) rồi map ngược về UUID bằng `remapTurnIds` trong `_shared/ai/speaking.ts`.
3. **`speaking_results` là quan hệ 1-1** (`attempt_id` UNIQUE) nên PostgREST trả về **object**,
   không phải mảng. Code đọc `results[0]` nên luôn ra `not_found` dù đã chấm xong — cả live
   lẫn record mode đều không hiện kết quả. Đã xử lý cả hai dạng trong `src/lib/speaking.ts`.

Ngoài ra `extractJson` giờ bóc được tool call mà provider trả dạng text
(`<tool_calls>[{...}]</tool_calls>`) và JSON lẫn trong prose.

## 8. Cách dùng

1. `/app/speaking` → chọn đề Cambridge → **Luyện nói trực tiếp**.
2. Chọn giọng giám khảo (`en-GB` / `en-US`); follow-up tự động bật, không cần tick.
3. Bấm **Bắt đầu** → cấp quyền mic → giám khảo hỏi, bạn trả lời; VAD tự chuyển câu.
4. Hết bài → upload → chấm → hiện band trên 4 tiêu chí (dùng lại `SpeakingResult`).

## 9. Kiểm chứng (đã chạy thật)

| Bước | Kết quả |
|---|---|
| `npm test` | 242 ✓ |
| `npm run test:edge` | 159 ✓ |
| `npm run build` | ✓ |
| `speaking-live` deploy Supabase | ✓ (start/voice/brain/finish) |
| E2E trình duyệt (mic bơm audio TTS) | hỏi 4 câu Cambridge → VAD chuyển câu → upload 194 KB webm → chấm → **band 5.5** |
| E2E chấm bằng audio thật | transcript đúng ("I live in Da Nang…") → band 5.5 |
| Migration `029` | ✓ đã áp dụng |

## 10. Giới hạn đã biết

- Sửa cục bộ ngày 29/10: khi Web Speech không có transcript, gửi bản ghi riêng của câu vừa trả lời
  vào cùng lượt gọi AI hỏi thêm. Bản ghi cả phần vẫn giữ riêng để chấm; mỗi câu chính có bản ghi phụ.
  Hỏi thêm tự động bật; prompt cho phép câu hỏi mới cùng chủ đề. Gemini 3 dùng mức thinking `minimal` và hạn
  chờ 15 giây. Timeout, lỗi provider, JSON lỗi và lượt không có follow-up đều được báo trên giao diện.
  Claude dùng API text của provider, cần transcript từ trình duyệt. Backend đã được deploy riêng cho Speaking.
- Follow-up có thể cần vài giây xử lý. Số đo cũ trước khi giảm thinking: 6–15 s với
  `gemini-3.8-flash`, 3.6 s với `claude-haiku-5-5`; đây không phải cam kết độ trễ sau sửa.
- Web Speech (Chrome/Edge) chỉ dùng làm transcript phụ cho bộ não giám khảo; transcript chính thức
  do Gemini đọc từ audio nên không phụ thuộc trình duyệt.
- Provider chỉ có 2 giọng cố định → nhãn `en-GB`/`en-US` là lựa chọn giữa hai giọng có sẵn, chưa phải
  accent tùy ý.
- Chưa hỗ trợ WebRTC thật (cần gateway riêng) — xem mục 1.
