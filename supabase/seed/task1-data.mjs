/**
 * Chỉnh sửa cho bộ đề Task 1 (70 đề trong debai/task1/IELTS_Task1_7_Types_70_Prompts.json).
 *
 * 1) TITLE_VI    — tiêu đề tiếng Việt cho từng đề (tiêu đề gốc trong JSON là tiếng Anh).
 * 2) CAM_PROMPT  — câu đề tiếng Anh cho 24 đề Cambridge Original. Trong JSON, các đề này
 *                  chỉ ghi "Original exam question shown in embedded source page image.",
 *                  nên ta dựng lại câu đề đúng dạng đề thi (nguyên văn nằm trong ảnh).
 * 3) TOPIC_KEYWORD — map từ khoá trong tiêu đề → key chủ đề dùng chung với prompt_topics.
 */

export const TITLE_VI = {
  'W1-001': 'Lượng khách du lịch tại một đảo Caribbean',
  'W1-002': 'Thiết bị điện và thời gian làm việc nhà',
  'W1-003': 'Số cửa hàng đóng và mở',
  'W1-004': 'Dân số sống ở thành phố',
  'W1-005': 'Biến động giá kim loại theo tháng',
  'W1-006': 'Số người tham gia hoạt động tại trung tâm thể thao',
  'W1-007': 'Việc làm theo nhóm kinh tế',
  'W1-008': 'Đi xe đạp đi làm trong thành phố, 2012–2024',
  'W1-009': 'Số vé xem phim bán ra, 2010–2025',
  'W1-010': 'Điện tái tạo sinh ra, 2000–2025',
  'W1-011': 'Thói quen uống cà phê và trà tại các thành phố Australia',
  'W1-012': 'Chi tiêu hằng tuần của các gia đình',
  'W1-013': 'Số hộ gia đình theo mức thu nhập',
  'W1-014': 'Lượt tham quan thư viện theo nhóm tuổi',
  'W1-015': 'Tỉ lệ hộ gia dùng máy tính ở năm nước',
  'W1-016': 'Lượng khách bảo tàng theo từng quý',
  'W1-017': 'Mức tiêu thụ nước theo ngành',
  'W1-018': 'Tỉ lệ nhân viên làm việc từ xa',
  'W1-019': 'Tỉ lệ tái chế ở bảy khu vực',
  'W1-020': 'Sinh viên quốc tế theo ngành học',
  'W1-021': 'Chi tiêu của hộ gia đình năm 2025',
  'W1-022': 'Nguồn điện sinh ra năm 2024',
  'W1-023': 'Cách học sinh đi học',
  'W1-024': 'Lý do ghé thăm bảo tàng',
  'W1-025': 'Thành phần rác thải sinh hoạt',
  'W1-026': 'Nước ngọt được sử dụng cho mục đích gì',
  'W1-027': 'Việc làm theo lĩnh vực',
  'W1-028': 'Công cụ học trực tuyến được yêu thích',
  'W1-029': 'Điểm đến kỳ nghỉ được chọn',
  'W1-030': 'Phân bổ ngân sách giao thông công cộng',
  'W1-031': 'Số sinh viên đăng ký theo khoa',
  'W1-032': 'Tiền thuê nhà trung bình mỗi tháng',
  'W1-033': 'Lượt khách thăm công viên quốc gia',
  'W1-034': 'Giá thực phẩm quốc tế',
  'W1-035': 'Nhân sự trong bệnh viện',
  'W1-036': 'Lượng mưa và nhiệt độ trung bình',
  'W1-037': 'Thời gian sử dụng internet theo nhóm tuổi',
  'W1-038': 'Giá trị xuất khẩu theo mặt hàng',
  'W1-039': 'Mức dùng năng lượng trong tòa nhà văn phòng',
  'W1-040': 'Tỉ lệ tham gia thể thao theo giới tính',
  'W1-041': 'Thay đổi tại một khu công nghiệp',
  'W1-042': 'Mặt bằng thư viện công cộng',
  'W1-043': 'Bố trí công viên trước và sau cải tạo',
  'W1-044': 'Thay đổi tại thư viện trường học',
  'W1-045': 'Một thị trấn ven sông, năm 2000 và 2025',
  'W1-046': 'Công viên công cộng trước và sau cải tạo',
  'W1-047': 'Khuôn viên trường đại học năm 2010 và 2025',
  'W1-048': 'Một khu dân cư ven biển năm 1995 và 2025',
  'W1-049': 'Một ngôi làng trước và sau cải tạo',
  'W1-050': 'Mặt bằng tầng một của trung tâm cộng đồng',
  'W1-051': 'Sản xuất mì gói ăn nhanh',
  'W1-052': 'Sản xuất đường từ cây mía',
  'W1-053': 'Tấm pin mặt trời và làm nước nóng',
  'W1-054': 'Tái chế chai nhựa',
  'W1-055': 'Sản xuất nhiên liệu sinh học',
  'W1-056': 'Hình thành một đảo núi lửa',
  'W1-057': 'Tái chế thủy tinh',
  'W1-058': 'Xử lý nước sông thành nước uống',
  'W1-059': 'Làm bánh theo quy mô công nghiệp',
  'W1-060': 'Tái chế giấy cũ thành sản phẩm mới',
  'W1-061': 'Sau khi ra trường, nhân học nhân văn học làm việc ở đâu',
  'W1-062': 'Phân bổ ngân sách công',
  'W1-063': 'Lớp học nhảy: địa điểm và số lượt',
  'W1-064': 'Ngành điện ảnh: thị trường và con số',
  'W1-065': 'Lượt hành khách đến sân bay và phương tiện đi lại',
  'W1-066': 'Năng lượng hộ gia đình: mức dùng và nguồn cung',
  'W1-067': 'Số tốt nghiệp và đường đi làm sau ra trường',
  'W1-068': 'Chi tiêu du lịch và số lượt khách',
  'W1-069': 'Mức hài lòng với giao thông công cộng và thời gian đi lại',
  'W1-070': 'Xe điện bán ra và số trạm sạc',
}

/** Câu đề tiếng Anh cho các đề Cambridge Original (đề gốc trong JSON chỉ là placeholder). */
export const CAM_PROMPT = {
  'W1-001': 'The graph below shows the number of tourists visiting a particular Caribbean island between 2010 and 2017. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-002': 'The charts below show the percentage of households with electrical appliances and the number of hours of housework per week, per household, in one country between 1920 and 2019. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-003': 'The graph below gives information about how families in one country spent their weekly income in 1968 and in 2018. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-004': 'The graph below shows the percentage of the population in four Asian countries living in cities from 1970 to 2020, with predictions for 2030 and 2040. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-005': 'The graph below shows the average monthly change in the prices of three metals during 2014. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-006': 'The graph below gives information on the numbers of participants for different activities at one social centre in Melbourne, Australia for the period 2000 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-007': 'The graph below shows the number of people employed in different economic sectors in one country in 1990 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-011': 'The bar chart below shows the results of a survey about people’s coffee and tea buying and drinking habits in five cities in Australia. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-012': 'The bar chart below shows the changes in the weekly spending of families in three different income groups between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-013': 'The bar chart below shows the number of households in the US by their annual income in 2007, 2011 and 2015. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-041': 'The plans below show an industrial area in the town of Norbiton, and planned future development of the site. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-042': 'The diagram below shows the floor plan of a public library 20 years ago and how it looks now. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-043': 'The maps below show a park in a city in 1990 and in 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-044': 'The plans below show changes to a school library over a period of ten years. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-051': 'The diagram below shows how instant noodles are manufactured. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-052': 'The diagram below shows how sugar is produced from sugar cane. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-053': 'The diagram below shows how solar panels and hot water systems work together to provide electricity and hot water for a house. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-054': 'The diagram below shows how plastic bottles are recycled. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-055': 'The diagram below shows how a biofuel called ethanol is produced. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-056': 'The diagram below shows how a volcanic island is formed. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-061': 'The pie chart below shows the destination of anthropology graduates from one university, and the table shows the salaries of those graduates after five years of work. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-062': 'The table and charts below give information on the police budget for 2017 and 2018 in one area of Britain. The table shows where the money came from and the charts show how it was distributed. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-063': 'The charts below give information on the location and types of dance classes young people in a town in Australia are currently attending. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  'W1-064': 'The charts below give information about the film industry in three different countries, including market size and box-office figures. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
}

/** Từ khoá trong tiêu đề → key chủ đề dùng chung với bảng prompt_topics. */
export const TOPIC_KEYWORD = [
  ['bicycl', 'transport'], ['cycling', 'transport'], ['car', 'transport'], ['airport', 'transport'], ['transport', 'transport'], ['road', 'transport'],
  ['cinema', 'art'], ['museum', 'art'], ['gallery', 'art'], ['cultural', 'culture'], ['heritage', 'culture'], ['language', 'culture'],
  ['coffee', 'food'], ['tea', 'food'], ['food', 'food'], ['diet', 'food'], ['fresh', 'food'], ['bread', 'food'], ['bakery', 'food'],
  ['rainfall', 'environment'], ['recycl', 'environment'], ['waste', 'environment'], ['water', 'environment'], ['electricity', 'environment'], ['renewable', 'environment'], ['solar', 'environment'], ['energy', 'environment'], ['emission', 'environment'], ['volcanic', 'environment'], ['island', 'environment'], ['glass', 'environment'],
  ['student', 'education'], ['school', 'education'], ['university', 'education'], ['librar', 'education'], ['housework', 'education'], ['tuition', 'education'], ['enrol', 'education'], ['graduat', 'education'], ['faculty', 'education'], ['community centre', 'society'],
  ['hospital', 'health'], ['healthcare', 'health'], ['freshwater', 'health'], ['sport', 'sport'], ['fitness', 'sport'], ['exercise', 'health'],
  ['income', 'money'], ['spending', 'money'], ['salary', 'money'], ['rent', 'money'], ['export', 'money'], ['budget', 'government'], ['police', 'government'], ['public transport funding', 'government'],
  ['household', 'society'], ['family', 'family'], ['children', 'family'], ['parent', 'family'], ['population', 'society'], ['town', 'society'], ['village', 'society'], ['neighbourhood', 'society'], ['rural', 'society'], ['urban', 'society'], ['city', 'society'],
  ['holiday', 'travel'], ['tourism', 'travel'], ['tourist', 'travel'], ['visitor', 'travel'], ['travel', 'travel'], ['passenger', 'travel'], ['hotel', 'travel'],
  ['shop', 'business'], ['retail', 'business'], ['employ', 'work'], ['remote', 'work'], ['work', 'work'], ['job', 'work'], ['sector', 'work'],
  ['internet', 'technology'], ['online', 'technology'], ['computer', 'technology'], ['electric car', 'technology'], ['electric-vehicle', 'technology'], ['digital', 'technology'], ['car sales', 'technology'],
  ['metal', 'money'], ['price', 'money'], ['freshwater use', 'environment'], ['aircraft', 'transport'], ['satellite', 'technology'], ['charging', 'technology'],
  ['complaint', 'society'], ['public', 'society'], ['money', 'money'], ['park', 'society'], ['industrial', 'business'],
]

export function topicsFor(title) {
  const lower = title.toLowerCase()
  const found = new Set()
  for (const [keyword, topic] of TOPIC_KEYWORD) {
    if (lower.includes(keyword)) found.add(topic)
    if (found.size >= 2) break
  }
  return [...found]
}
