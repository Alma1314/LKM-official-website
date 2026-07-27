export interface QuizQuestion {
  id: string;
  field: string;
  fieldLabel: string;
  stem: string;
  options: string[];
  answer: number; // 正确选项的 index
}

export const quizQuestions: QuizQuestion[] = [
  // 物理学
  {
    id: 'p1',
    field: 'physics',
    fieldLabel: '物理学',
    stem: '光速在真空中约为多少？',
    options: ['3×10⁶ m/s', '3×10⁷ m/s', '3×10⁸ m/s', '3×10⁹ m/s'],
    answer: 2,
  },
  {
    id: 'p2',
    field: 'physics',
    fieldLabel: '物理学',
    stem: '牛顿第二定律的表达式是？',
    options: ['F = mv', 'F = ma', 'F = m/v', 'F = m²a'],
    answer: 1,
  },
  {
    id: 'p3',
    field: 'physics',
    fieldLabel: '物理学',
    stem: '以下哪个是基本粒子？',
    options: ['质子', '中子', '电子', '原子'],
    answer: 2,
  },
  {
    id: 'p4',
    field: 'physics',
    fieldLabel: '物理学',
    stem: '能量守恒定律是谁提出的？',
    options: ['牛顿', '爱因斯坦', '焦耳', '亥姆霍兹'],
    answer: 3,
  },
  {
    id: 'p5',
    field: 'physics',
    fieldLabel: '物理学',
    stem: '以下哪种现象是波的干涉？',
    options: ['彩虹', '肥皂泡彩色', '影子', '闪电'],
    answer: 1,
  },
  // 数学
  {
    id: 'm1',
    field: 'math',
    fieldLabel: '数学',
    stem: '欧拉公式 e^(iπ) + 1 = ?',
    options: ['0', '1', '-1', 'i'],
    answer: 0,
  },
  {
    id: 'm2',
    field: 'math',
    fieldLabel: '数学',
    stem: '以下哪个是质数？',
    options: ['51', '57', '91', '97'],
    answer: 3,
  },
  { id: 'm3', field: 'math', fieldLabel: '数学', stem: 'sin²x + cos²x = ?', options: ['0', '1', '2', 'x'], answer: 1 },
  {
    id: 'm4',
    field: 'math',
    fieldLabel: '数学',
    stem: '级数 1 + 1/2 + 1/4 + 1/8 + ... 的和是？',
    options: ['1', '2', '∞', 'e'],
    answer: 1,
  },
  {
    id: 'm5',
    field: 'math',
    fieldLabel: '数学',
    stem: '费马大定理是由谁证明的？',
    options: ['欧拉', '高斯', '安德鲁·怀尔斯', '希尔伯特'],
    answer: 2,
  },
  // 化学
  {
    id: 'c1',
    field: 'chemistry',
    fieldLabel: '化学',
    stem: '水的化学式是？',
    options: ['H₂O', 'CO₂', 'NaCl', 'O₂'],
    answer: 0,
  },
  {
    id: 'c2',
    field: 'chemistry',
    fieldLabel: '化学',
    stem: '以下哪个是惰性气体？',
    options: ['氧气', '氮气', '氩气', '氢气'],
    answer: 2,
  },
  {
    id: 'c3',
    field: 'chemistry',
    fieldLabel: '化学',
    stem: 'pH=7 表示溶液是？',
    options: ['酸性', '碱性', '中性', '不确定'],
    answer: 2,
  },
  {
    id: 'c4',
    field: 'chemistry',
    fieldLabel: '化学',
    stem: '催化剂在化学反应中的作用是？',
    options: ['提高产率', '降低活化能', '改变平衡常数', '消耗反应物'],
    answer: 1,
  },
  {
    id: 'c5',
    field: 'chemistry',
    fieldLabel: '化学',
    stem: '以下哪种元素的原子序数是 6？',
    options: ['氮', '碳', '氧', '硼'],
    answer: 1,
  },
  // 生物学
  {
    id: 'b1',
    field: 'biology',
    fieldLabel: '生物学',
    stem: 'DNA 的全称是？',
    options: ['脱氧核酸', '脱氧核糖核酸', '核糖核酸', '脱氧核苷酸'],
    answer: 1,
  },
  {
    id: 'b2',
    field: 'biology',
    fieldLabel: '生物学',
    stem: '细胞分裂的哪个阶段染色体数目加倍？',
    options: ['间期', '前期', '中期', '后期'],
    answer: 3,
  },
  {
    id: 'b3',
    field: 'biology',
    fieldLabel: '生物学',
    stem: '以下哪项是线粒体的功能？',
    options: ['光合作用', '蛋白质合成', '有氧呼吸', '细胞运动'],
    answer: 2,
  },
  {
    id: 'b4',
    field: 'biology',
    fieldLabel: '生物学',
    stem: '孟德尔遗传定律中，F₂ 代表现型比例约为？',
    options: ['1:1', '3:1', '9:3:3:1', '1:2:1'],
    answer: 1,
  },
  {
    id: 'b5',
    field: 'biology',
    fieldLabel: '生物学',
    stem: '以下哪项是 RNA 不同于 DNA 的特征？',
    options: ['双链结构', '含脱氧核糖', '含尿嘧啶', '含胸腺嘧啶'],
    answer: 2,
  },
  // 信息科学
  {
    id: 'cs1',
    field: 'cs',
    fieldLabel: '信息科学',
    stem: '二分查找的时间复杂度是？',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'],
    answer: 2,
  },
  {
    id: 'cs2',
    field: 'cs',
    fieldLabel: '信息科学',
    stem: 'TCP 协议位于 OSI 模型的哪一层？',
    options: ['应用层', '网络层', '传输层', '数据链路层'],
    answer: 2,
  },
  {
    id: 'cs3',
    field: 'cs',
    fieldLabel: '信息科学',
    stem: '以下哪种排序算法是稳定的？',
    options: ['快速排序', '堆排序', '归并排序', '选择排序'],
    answer: 2,
  },
  {
    id: 'cs4',
    field: 'cs',
    fieldLabel: '信息科学',
    stem: '在二进制中，1010 + 0110 = ?',
    options: ['10000', '11000', '11110', '10110'],
    answer: 0,
  },
  {
    id: 'cs5',
    field: 'cs',
    fieldLabel: '信息科学',
    stem: 'RESTful API 中，用于更新资源的 HTTP 方法是？',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    answer: 2,
  },
];

export const quizFields = [
  { value: 'physics', label: '物理学' },
  { value: 'math', label: '数学' },
  { value: 'chemistry', label: '化学' },
  { value: 'biology', label: '生物学' },
  { value: 'cs', label: '信息科学' },
];
