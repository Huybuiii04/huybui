# IELTS — Design System

Nguồn: hướng dẫn UI UX Pro Max + lựa chọn đã duyệt. Phong cách **gradient mạnh + glassmorphism**, song ngữ VI/EN, hỗ trợ theme sáng và tối.

Toàn bộ màu, bo góc, shadow và blur đi qua biến CSS trong `src/styles.css`. Theme đổi bằng `data-theme` trên `<html>`: `light` hoặc `dark`.

## Token

| Token | Sáng | Tối | Dùng cho |
|---|---|---|---|
| `--bg` | `#eaf2ef` | `#070b14` | Nền trang (kèm 3 lớp radial gradient cố định) |
| `--surface` | `rgba(255,255,255,.66)` | `rgba(19,28,43,.68)` | Panel, card, sidebar, topbar |
| `--surface-strong` | `rgba(255,255,255,.88)` | `rgba(24,35,53,.88)` | Input, nút outline, thanh điều hướng dưới |
| `--surface-soft` | `rgba(255,255,255,.42)` | `rgba(28,40,60,.42)` | Nền phụ, chip, vùng editor |
| `--border` | `rgba(13,94,88,.13)` | `rgba(148,180,220,.15)` | Viền mảnh |
| `--border-strong` | `rgba(13,94,88,.30)` | `rgba(148,180,220,.32)` | Viền control cần nhận biết |
| `--text` | `#0d2b27` | `#e9effb` | Nội dung chính |
| `--text-muted` | `#45645b` | `#aab9cf` | Chú thích, mô tả |
| `--text-subtle` | `#63847a` | `#8697b0` | Metadata, eyebrow |
| `--brand` | `#0f766e` | `#2dd4bf` | Nhận diện, active, focus |
| `--brand-ink` | `#0b5a54` | `#5eead4` | Chữ trên nền brand nhạt |
| `--on-brand` | `#ffffff` | `#04211f` | Chữ trên nút primary |
| `--accent` | `#b45309` | `#f5b544` | Donate, nhấn mạnh |
| `--radius-lg` | `20px` | `20px` | Panel lớn |
| `--radius` | `16px` | `16px` | Card, nút, badge |
| `--radius-sm` | `11px` | `11px` | Input, chip nhỏ |
| `--glass` | `saturate(165%) blur(20px)` | như nhau | Lớp kính |

Bo góc lớn (16–20px) và pill cho nút/badge là dấu nhận dạng của sản phẩm; không dùng góc vuông.

## Nền và lớp kính

- Nền trang là gradient cố định: 3 vệt radial (teal, xanh, amber) trên `--bg`. Nền không đổi theo trang, nên lớp kính luôn nổi lên.
- Mọi `.panel`, sidebar, topbar, thanh điều hướng dưới dùng `backdrop-filter: var(--glass)` + viền 1px + `--shadow-sm`.
- Không dùng nền đục cho panel; nền đục chỉ dành cho hero, logo, avatar và nút primary.
- Hero dùng gradient nhiều lớp: nền xanh sâu + vệt teal/amber radial. Chữ nhấn trong hero dùng gradient text.

## Typography

- Outfit cho heading tiếng Anh; Work Sans cho body và heading tiếng Việt (`html[lang='vi']` đổi font heading).
- Base 15px; body 13.5–14px; metadata 12px; eyebrow 10–11px không dưới 10px. Không dùng cỡ 9px.
- `h1` clamp 28–38px, `h2` 19–25px, `h3` 16–19px; heading dùng `letter-spacing: -.03em`.
- Số liệu dùng `font-variant-numeric: tabular-nums`.

## Layout

- Sidebar 252px; topbar là pill kính dính ở trên cùng (margin 14px, bo tròn 999px); nội dung tối đa 1440px.
- Mobile: sidebar trượt vào (`visibility` để loại khỏi tab order), thanh dưới 4 mục, editor/feedback dùng tab.
- Dưới 768px: một cột; 768–1023px: sidebar thu gọn; từ 1024px: sidebar đầy đủ, editor hai cột.

## Component

- Nút primary: gradient teal + `--shadow-brand`, hover nâng 1px. Nút outline: nền kính + viền. Nút white: dùng trong hero.
- Card hover: nâng 3px + `--shadow-md` + viền đậm hơn.
- Active của sidebar: nền `--brand-soft` + thanh trượt gradient 4px bên trái.
- Thẻ thống kê: icon trong ô bo 12px nền màu, số 32px tabular, ghi chú 12px.
- Thẻ hướng dẫn: ảnh nền gradient theo chủ đề (teal / amber / indigo) + số thứ tự góc phải.
- Band điểm: khối gradient sâu, chữ trắng, số 72px.
- Thẻ nhớ: bo 26px, shadow lớn, mặt trước/ sau.
- Icon dùng SVG của Lucide, stroke 1.7–2.1, không dùng emoji.

## Theme

- Lựa chọn: Sáng / Tối / Theo hệ thống. Lưu ở `localStorage` (`ielts-theme`), mặc định theo hệ thống.
- Nút chuyển nhanh trên topbar (mặt trăng/mặt trời) và bộ chọn đầy đủ trong Cài đặt.
- Theme áp trước khi render để không nháy trắng khi tải trang.
- Cả hai theme phải pass axe WCAG 2.1 AA trên mọi route chính.

## Accessibility

- Contrast: chữ thường ≥ 4.5:1, thành phần điều khiển và focus ≥ 3:1; kiểm bằng axe ở cả hai theme.
- Focus luôn nhìn thấy: `outline: 3px solid var(--ring)` + offset 3px.
- Vùng kính không được đặt chữ trực tiếp lên nền gradient tương phản thấp.
- Icon-only button luôn có `aria-label`; nút chuyển theme có nhãn đầy đủ.
- `prefers-reduced-motion` tắt toàn bộ transition.

## Checklist nghiệm thu UI

- Viewport 375 / 768 / 1024 / 1440px; không tràn ngang ở bất kỳ route nào.
- Cả hai theme: axe WCAG 2.1 AA pass; chữ phụ vẫn đọc được.
- Không hiển thị API key, lỗi provider raw hay dữ liệu người dùng khác.
- Dữ liệu chưa có dùng nhãn trạng thái, không dùng số liệu giả.
