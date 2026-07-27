export interface MockFile {
  id: string;
  originalName: string;
  uploaderName: string;
  mimeType: string;
  size: number;
  categoryId: string;
  categoryName: string;
  description: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  downloadCount: number;
  viewCount: number;
  reviewComment?: string;
  createdAt: string;
}

export const mockFiles: MockFile[] = [
  {
    id: 'file-1', originalName: '天体物理数据集（2026版）.zip', uploaderName: '七月O',
    mimeType: 'application/zip', size: 134217728,
    categoryId: 'physics-astronomy', categoryName: '物理学&天文学',
    description: '整理的天体物理公开数据集，包含 SDSS、Gaia DR3 和 LIGO 事件数据，适用于学习和研究。',
    tags: ['天体物理', '数据集', '天文'],
    status: 'approved', downloadCount: 230, viewCount: 1200,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'file-2', originalName: '量子力学导论_讲义.pdf', uploaderName: '七月O',
    mimeType: 'application/pdf', size: 5242880,
    categoryId: 'physics-astronomy', categoryName: '物理学&天文学',
    description: '中国科学院量子力学课程讲义，涵盖从波函数到微扰论的完整内容。',
    tags: ['量子力学', '讲义', '物理'],
    status: 'approved', downloadCount: 456, viewCount: 2300,
    createdAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'file-3', originalName: '线性代数习题集_详解.pdf', uploaderName: '七月墨染',
    mimeType: 'application/pdf', size: 3145728,
    categoryId: 'math', categoryName: '数学',
    description: '线性代数经典习题集，含详细解答和解题思路分析，适合期末复习和考研备考。',
    tags: ['线性代数', '习题', '数学'],
    status: 'approved', downloadCount: 189, viewCount: 980,
    createdAt: '2026-07-22T14:00:00Z',
  },
  {
    id: 'file-4', originalName: '有机化学反应机理图解.pdf', uploaderName: '化学爱好者',
    mimeType: 'application/pdf', size: 8388608,
    categoryId: 'chemistry', categoryName: '化学',
    description: '图解常见有机化学反应机理，包括亲核取代、消除反应、加成反应等。',
    tags: ['有机化学', '反应机理', '图解'],
    status: 'approved', downloadCount: 120, viewCount: 670,
    createdAt: '2026-07-25T09:00:00Z',
  },
  {
    id: 'file-5', originalName: 'Python数据分析实战代码.zip', uploaderName: '七月墨染',
    mimeType: 'application/zip', size: 2097152,
    categoryId: 'cs', categoryName: '信息科学与技术',
    description: '配套 Pandas/NumPy/Matplotlib 教程的实战代码和数据文件。',
    tags: ['Python', '数据分析', '代码'],
    status: 'approved', downloadCount: 340, viewCount: 1500,
    createdAt: '2026-07-23T16:00:00Z',
  },
  {
    id: 'file-6', originalName: '数学建模竞赛优秀论文集.pdf', uploaderName: '七月花',
    mimeType: 'application/pdf', size: 15728640,
    categoryId: 'math', categoryName: '数学',
    description: '近三年全国大学生数学建模竞赛优秀论文汇编，含专家点评。',
    tags: ['数学建模', '竞赛', '论文集'],
    status: 'approved', downloadCount: 567, viewCount: 3200,
    createdAt: '2026-07-18T11:00:00Z',
  },
  {
    id: 'file-7', originalName: '芯片设计入门教程.pdf', uploaderName: '芯片工程师',
    mimeType: 'application/pdf', size: 12582912,
    categoryId: 'ic-semiconductor', categoryName: '集成电路与半导体',
    description: '从零开始的芯片设计入门教程，涵盖 Verilog 基础、综合、布局布线全流程。',
    tags: ['集成电路', '芯片设计', 'Verilog'],
    status: 'pending', downloadCount: 0, viewCount: 120,
    createdAt: '2026-07-27T08:00:00Z',
  },
  {
    id: 'file-8', originalName: '英语学术写作指南.pdf', uploaderName: '留学生小明',
    mimeType: 'application/pdf', size: 4194304,
    categoryId: 'lang-en', categoryName: '英语',
    description: '针对非英语母语研究者的学术写作指南，包含常用句式和范文。',
    tags: ['英语', '学术写作', '指南'],
    status: 'pending', downloadCount: 0, viewCount: 85,
    createdAt: '2026-07-26T15:00:00Z',
  },
];

export function getFileById(id: string): MockFile | undefined {
  return mockFiles.find((f) => f.id === id);
}

export function getFilesByCategory(categoryId: string): MockFile[] {
  return mockFiles.filter((f) => f.categoryId === categoryId);
}
