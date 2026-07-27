export interface MockCompetition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number; // 答题时长（分钟）
  status: 'upcoming' | 'ongoing' | 'ended';
  participantCount: number;
  category: string;
}

export interface MockQuestion {
  id: string;
  type: 'single' | 'multiple' | 'true_false';
  stem: string;
  options: string[];
  answer: number | number[];
  explanation: string;
  difficulty: number;
}

export const mockCompetitions: MockCompetition[] = [
  { id: 'comp-1', title: '2026 暑假物理竞赛', description: '涵盖力学、电磁学、热学、光学、近代物理等，适合高中及以上学生参加。', startDate: '2026-07-20', endDate: '2026-08-10', duration: 120, status: 'ongoing', participantCount: 156, category: '物理' },
  { id: 'comp-2', title: '2026 数学建模挑战赛', description: '三人组队参赛，解决实际问题并提交论文。', startDate: '2026-08-15', endDate: '2026-08-25', duration: 4320, status: 'upcoming', participantCount: 0, category: '数学' },
  { id: 'comp-3', title: '2026 编程马拉松', description: '48 小时极限编程挑战，不限语言和工具。', startDate: '2026-09-01', endDate: '2026-09-03', duration: 2880, status: 'upcoming', participantCount: 0, category: '信息科学' },
  { id: 'comp-4', title: '2026 化学方程式平衡大赛', description: '限时完成化学方程式配平挑战。', startDate: '2026-07-01', endDate: '2026-07-15', duration: 60, status: 'ended', participantCount: 89, category: '化学' },
];

export const mockQuestions: MockQuestion[] = [
  { id: 'q1', type: 'single', stem: '光速在真空中约为？', options: ['3×10⁶ m/s', '3×10⁷ m/s', '3×10⁸ m/s', '3×10⁹ m/s'], answer: 2, explanation: '光速 c = 299,792,458 m/s ≈ 3×10⁸ m/s', difficulty: 1 },
  { id: 'q2', type: 'single', stem: '以下哪种力不是基本力？', options: ['引力', '电磁力', '摩擦力', '强相互作用力'], answer: 2, explanation: '摩擦力是电磁力的宏观表现，不是基本力。四种基本力是：引力、电磁力、强相互作用、弱相互作用。', difficulty: 2 },
  { id: 'q3', type: 'single', stem: '一个质量为 2kg 的物体，受到 10N 的力，加速度是多少？', options: ['2 m/s²', '5 m/s²', '10 m/s²', '20 m/s²'], answer: 1, explanation: 'F=ma，a=F/m=10/2=5 m/s²', difficulty: 1 },
  { id: 'q4', type: 'true_false', stem: '声音可以在真空中传播。', options: ['正确', '错误'], answer: 1, explanation: '声音是机械波，需要介质传播，真空无法传声。', difficulty: 1 },
  { id: 'q5', type: 'single', stem: '下列哪个是矢量？', options: ['质量', '温度', '速度', '时间'], answer: 2, explanation: '矢量有大小和方向。速度有大小和方向，质量和温度只有大小。', difficulty: 1 },
  { id: 'q6', type: 'single', stem: '闭合电路中，电阻增加时电流会？', options: ['增加', '减小', '不变', '先增后减'], answer: 1, explanation: '欧姆定律：I=U/R，电压不变时，电阻越大电流越小。', difficulty: 2 },
  { id: 'q7', type: 'single', stem: 'π (pi) 的值最接近？', options: ['3.12', '3.14', '3.16', '3.18'], answer: 1, explanation: 'π ≈ 3.14159...', difficulty: 1 },
  { id: 'q8', type: 'single', stem: '以下哪个算法的时间复杂度最低？', options: ['O(n²)', 'O(n log n)', 'O(log n)', 'O(2ⁿ)'], answer: 2, explanation: 'O(log n) 增长最慢。排序：O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)', difficulty: 2 },
];

export const QUESTION_CATEGORIES = ['全部', '物理', '数学', '化学', '生物', '信息科学'];
