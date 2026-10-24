/**
 * 7 dạng biểu đồ cho Task 1 Academic.
 * `key` khớp với prompts.subtype của các đề academic_task1.
 * Nạp vào public.prompt_chart_types (migration 008).
 */

export type SeedChartType = {
  key: string
  labelVi: string
  labelEn: string
  descriptionVi: string
  descriptionEn: string
  sortOrder: number
}

export const seedChartTypes: SeedChartType[] = [
  { key: 'line', labelVi: 'Biểu đồ đường', labelEn: 'Line Graph', descriptionVi: 'Theo dõi một đại lượng thay đổi theo thời gian — xu hướng tăng, giảm hay dao động.', descriptionEn: 'Track how one measure changes over time — rising, falling or fluctuating.', sortOrder: 10 },
  { key: 'bar', labelVi: 'Biểu đồ cột', labelEn: 'Bar Chart', descriptionVi: 'So sánh giá trị giữa các nhóm bằng chiều dài thanh.', descriptionEn: 'Compare values across groups using bar length.', sortOrder: 20 },
  { key: 'pie', labelVi: 'Biểu đồ tròn', labelEn: 'Pie Chart', descriptionVi: 'Thể hiện tỉ lệ phần trăm của các thành phần trong một tổng thể.', descriptionEn: 'Show percentage shares of parts within a whole.', sortOrder: 30 },
  { key: 'table', labelVi: 'Bảng số liệu', labelEn: 'Table', descriptionVi: 'Rút ra xu hướng và điểm nổi bật từ một bảng số liệu.', descriptionEn: 'Extract trends and standout points from a data table.', sortOrder: 40 },
  { key: 'map', labelVi: 'Bản đồ / sơ đồ mặt bằng', labelEn: 'Map / Floor Plan', descriptionVi: 'Mô tả sự thay đổi của một khu vực hoặc sơ đồ mặt bằng theo thời gian.', descriptionEn: 'Describe changes to an area or floor plan over time.', sortOrder: 50 },
  { key: 'process', labelVi: 'Quy trình sản xuất, tự nhiên', labelEn: 'Process Diagram', descriptionVi: 'Kể tiến trình sản xuất hoặc hiện tượng tự nhiên theo các bước.', descriptionEn: 'Describe a manufacturing or natural process step by step.', sortOrder: 60 },
  { key: 'mixed', labelVi: 'Biểu đồ kết hợp', labelEn: 'Mixed Charts', descriptionVi: 'Đọc hai biểu đồ cùng lúc và nối hai nguồn số liệu.', descriptionEn: 'Read two charts together and link the two data sets.', sortOrder: 70 },
]
