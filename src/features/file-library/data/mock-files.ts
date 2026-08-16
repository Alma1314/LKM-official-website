/**
 * 文件库 mock 数据 — 用户可见字段（uploaderName/categoryName/description/tags）已替换为 i18n key，
 * 渲染时需用 t(field) 显示。originalName 为文件名，保持原文。
 */

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
    id: 'file-1',
    originalName: '天体物理数据集（2026版）.zip',
    uploaderName: 'fileLibraryData.uploaders.qiyueO',
    mimeType: 'application/zip',
    size: 134217728,
    categoryId: 'physics-astrophysics',
    categoryName: 'fileLibraryData.categories.physicsAstrophysics',
    description: 'fileLibraryData.files.file1.description',
    tags: [
      'fileLibraryData.files.file1.tags.a',
      'fileLibraryData.files.file1.tags.b',
      'fileLibraryData.files.file1.tags.c',
    ],
    status: 'approved',
    downloadCount: 230,
    viewCount: 1200,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'file-2',
    originalName: '量子力学导论_讲义.pdf',
    uploaderName: 'fileLibraryData.uploaders.qiyueO',
    mimeType: 'application/pdf',
    size: 5242880,
    categoryId: 'physics-quantum',
    categoryName: 'fileLibraryData.categories.physicsQuantum',
    description: 'fileLibraryData.files.file2.description',
    tags: [
      'fileLibraryData.files.file2.tags.a',
      'fileLibraryData.files.file2.tags.b',
      'fileLibraryData.files.file2.tags.c',
    ],
    status: 'approved',
    downloadCount: 456,
    viewCount: 2300,
    createdAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'file-3',
    originalName: '线性代数习题集_详解.pdf',
    uploaderName: 'fileLibraryData.uploaders.qiyueMoran',
    mimeType: 'application/pdf',
    size: 3145728,
    categoryId: 'math-linear-algebra',
    categoryName: 'fileLibraryData.categories.mathLinearAlgebra',
    description: 'fileLibraryData.files.file3.description',
    tags: [
      'fileLibraryData.files.file3.tags.a',
      'fileLibraryData.files.file3.tags.b',
      'fileLibraryData.files.file3.tags.c',
    ],
    status: 'approved',
    downloadCount: 189,
    viewCount: 980,
    createdAt: '2026-07-22T14:00:00Z',
  },
  {
    id: 'file-4',
    originalName: '有机化学反应机理图解.pdf',
    uploaderName: 'fileLibraryData.uploaders.chemistryFan',
    mimeType: 'application/pdf',
    size: 8388608,
    categoryId: 'chemistry-organic',
    categoryName: 'fileLibraryData.categories.chemistryOrganic',
    description: 'fileLibraryData.files.file4.description',
    tags: [
      'fileLibraryData.files.file4.tags.a',
      'fileLibraryData.files.file4.tags.b',
      'fileLibraryData.files.file4.tags.c',
    ],
    status: 'approved',
    downloadCount: 120,
    viewCount: 670,
    createdAt: '2026-07-25T09:00:00Z',
  },
  {
    id: 'file-5',
    originalName: 'Python数据分析实战代码.zip',
    uploaderName: 'fileLibraryData.uploaders.qiyueMoran',
    mimeType: 'application/zip',
    size: 2097152,
    categoryId: 'cs-python',
    categoryName: 'fileLibraryData.categories.csPython',
    description: 'fileLibraryData.files.file5.description',
    tags: [
      'fileLibraryData.files.file5.tags.a',
      'fileLibraryData.files.file5.tags.b',
      'fileLibraryData.files.file5.tags.c',
    ],
    status: 'approved',
    downloadCount: 340,
    viewCount: 1500,
    createdAt: '2026-07-23T16:00:00Z',
  },
  {
    id: 'file-6',
    originalName: '数学建模竞赛优秀论文集.pdf',
    uploaderName: 'fileLibraryData.uploaders.qiyueHua',
    mimeType: 'application/pdf',
    size: 15728640,
    categoryId: 'math-modeling',
    categoryName: 'fileLibraryData.categories.mathModeling',
    description: 'fileLibraryData.files.file6.description',
    tags: [
      'fileLibraryData.files.file6.tags.a',
      'fileLibraryData.files.file6.tags.b',
      'fileLibraryData.files.file6.tags.c',
    ],
    status: 'approved',
    downloadCount: 567,
    viewCount: 3200,
    createdAt: '2026-07-18T11:00:00Z',
  },
  {
    id: 'file-7',
    originalName: '芯片设计入门教程.pdf',
    uploaderName: 'fileLibraryData.uploaders.chipEngineer',
    mimeType: 'application/pdf',
    size: 12582912,
    categoryId: 'ic-design',
    categoryName: 'fileLibraryData.categories.icDesign',
    description: 'fileLibraryData.files.file7.description',
    tags: [
      'fileLibraryData.files.file7.tags.a',
      'fileLibraryData.files.file7.tags.b',
      'fileLibraryData.files.file7.tags.c',
    ],
    status: 'pending',
    downloadCount: 0,
    viewCount: 120,
    createdAt: '2026-07-27T08:00:00Z',
  },
  {
    id: 'file-8',
    originalName: '英语学术写作指南.pdf',
    uploaderName: 'fileLibraryData.uploaders.overseasStudentXiaoMing',
    mimeType: 'application/pdf',
    size: 4194304,
    categoryId: 'lang-en-writing',
    categoryName: 'fileLibraryData.categories.langEnWriting',
    description: 'fileLibraryData.files.file8.description',
    tags: [
      'fileLibraryData.files.file8.tags.a',
      'fileLibraryData.files.file8.tags.b',
      'fileLibraryData.files.file8.tags.c',
    ],
    status: 'pending',
    downloadCount: 0,
    viewCount: 85,
    createdAt: '2026-07-26T15:00:00Z',
  },
];

export function getFileById(id: string): MockFile | undefined {
  return mockFiles.find((f) => f.id === id);
}

export function getFilesByCategory(categoryId: string): MockFile[] {
  return mockFiles.filter((f) => f.categoryId === categoryId);
}
