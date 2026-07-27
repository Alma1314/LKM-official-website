export interface MockQuestion {
  id: string;
  title: string;
  content: string;
  askerName: string;
  tags: string[];
  bounty: number;
  type: 'general' | 'volunteer';
  status: 'open' | 'resolved';
  viewCount: number;
  answerCount: number;
  createdAt: string;
}

export interface MockAnswer {
  id: string;
  questionId: string;
  authorName: string;
  content: string;
  isAccepted: boolean;
  likeCount: number;
  createdAt: string;
}

export const mockQuestions: MockQuestion[] = [
  {
    id: 'q-1',
    title: '量子力学入门有什么推荐的书？',
    askerName: '物理萌新',
    content: '我是物理系大一新生，想提前了解一下量子力学。有没有适合初学者的入门教材推荐？最好有中文版的。',
    tags: ['物理学', '量子力学', '推荐'],
    bounty: 30,
    type: 'general',
    status: 'resolved',
    viewCount: 560,
    answerCount: 5,
    createdAt: '2026-07-15',
  },
  {
    id: 'q-2',
    title: '考研数学一需要准备哪些资料？',
    askerName: '考研党',
    content: '准备 2027 年考研，目标是 985 院校。数学一需要买哪些参考书和习题集？时间线怎么安排比较合理？',
    tags: ['数学', '考研', '学习规划'],
    bounty: 20,
    type: 'general',
    status: 'open',
    viewCount: 890,
    answerCount: 8,
    createdAt: '2026-07-20',
  },
  {
    id: 'q-3',
    title: '高考志愿推荐：物理 vs 计算机',
    askerName: '高三学生小陈',
    content:
      '省份：广东\n分数/排名：640分 / 省排 12000\n选科：物理+化学+生物\n兴趣方向：物理学、计算机科学\n家庭情况：普通家庭，希望好就业',
    tags: ['志愿推荐', '高考', '广东'],
    bounty: 50,
    type: 'volunteer',
    status: 'resolved',
    viewCount: 1200,
    answerCount: 12,
    createdAt: '2026-07-10',
  },
  {
    id: 'q-4',
    title: 'Python 数据分析：Pandas 内存不足怎么办？',
    askerName: '数据分析新手',
    content:
      '在用 Pandas 处理一个 5GB 的 CSV 文件时总是内存不足。已经用了分块读取，但后续的聚合操作还是会爆内存。有没有更好的方案？',
    tags: ['Python', '数据处理', '大数据'],
    bounty: 25,
    type: 'general',
    status: 'open',
    viewCount: 340,
    answerCount: 4,
    createdAt: '2026-07-25',
  },
  {
    id: 'q-5',
    title: '实验室安全规范文档求助',
    askerName: '化学实验员',
    content: '需要一份化学实验室安全规范的文档模板，用于给新来的研究生做安全培训。最好是高校通用的标准版本。',
    tags: ['化学', '实验室', '文档'],
    bounty: 15,
    type: 'general',
    status: 'open',
    viewCount: 120,
    answerCount: 2,
    createdAt: '2026-07-26',
  },
];

export const mockAnswers: MockAnswer[] = [
  {
    id: 'a-1',
    questionId: 'q-1',
    authorName: '七月O',
    content:
      '推荐 Griffiths 的《Introduction to Quantum Mechanics》，有中文译本。如果数学基础还不太够，可以先看《量子力学概论》（David J. Griffiths 著，贾瑜 译）。另外推荐配套看 Feynman 物理学讲义第三卷，物理图像非常清晰。',
    isAccepted: true,
    likeCount: 35,
    createdAt: '2026-07-15T12:00:00Z',
  },
  {
    id: 'a-2',
    questionId: 'q-1',
    authorName: '物理教师',
    content:
      '如果只想初步了解，推荐《上帝掷骰子吗？量子物理史话》，非常通俗易懂的科普，读完会对量子力学的来龙去脉有很好的感觉。然后再看教材。',
    isAccepted: false,
    likeCount: 18,
    createdAt: '2026-07-15T14:00:00Z',
  },
  {
    id: 'a-3',
    questionId: 'q-3',
    authorName: '七月花',
    content:
      '广东省排 12000 是一个很不错的排名。物理和计算机都是好选择。建议从就业角度看，计算机就业面更广、起薪更高；但如果真心热爱物理研究，也可以选择物理专业后辅修计算机课程，这两个方向并不冲突。具体可以考虑华南理工或中山大学的计算机/物理相关专业。',
    isAccepted: true,
    likeCount: 42,
    createdAt: '2026-07-10T15:00:00Z',
  },
  {
    id: 'a-4',
    questionId: 'q-4',
    authorName: '数据工程师小张',
    content:
      '5GB CSV 建议换工具。如果坚持用 Python，可以试试：1) Dask DataFrame（和 Pandas API 几乎一样但是分布式的）2) Polars（比 Pandas 内存效率高很多）3) 如果是聚合操作，试试 SQLite（pandas 可以直接写 SQL）。分块读取 + 逐块聚合其实可行，但要注意聚合的复杂度。',
    isAccepted: false,
    likeCount: 15,
    createdAt: '2026-07-25T16:00:00Z',
  },
];

export function getQuestionById(id: string): MockQuestion | undefined {
  return mockQuestions.find((q) => q.id === id);
}

export function getAnswersByQuestionId(qid: string): MockAnswer[] {
  return mockAnswers.filter((a) => a.questionId === qid);
}
