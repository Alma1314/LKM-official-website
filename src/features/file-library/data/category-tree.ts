// 文件库三级学科分类树（纯前端静态数据）。parentId 为 null 表示一级（根）。

export interface FileCategory {
  id: string;
  name: string;
  parentId: string | null;
}

export const fileCategories: FileCategory[] = [
  // ─── 一级 ───
  { id: 'basic-science', name: '基础学科', parentId: null },
  { id: 'applied-science', name: '应用学科', parentId: null },
  { id: 'language', name: '语言学习', parentId: null },

  // ─── 二级（基础学科下）───
  { id: 'math', name: '数学', parentId: 'basic-science' },
  { id: 'physics', name: '物理学', parentId: 'basic-science' },
  { id: 'chemistry', name: '化学', parentId: 'basic-science' },
  { id: 'biology', name: '生命学科', parentId: 'basic-science' },
  { id: 'earth-science', name: '地球科学', parentId: 'basic-science' },
  { id: 'cosmos-astronomy', name: '宇宙与天文学', parentId: 'basic-science' },

  // ─── 二级（应用学科下）───
  { id: 'cs', name: '信息科学与技术', parentId: 'applied-science' },
  { id: 'ic-semiconductor', name: '集成电路与半导体', parentId: 'applied-science' },

  // ─── 二级（语言学习下）───
  { id: 'lang-en', name: '英语', parentId: 'language' },

  // ─── 三级（叶子，挂文件）───
  { id: 'math-linear-algebra', name: '线性代数', parentId: 'math' },
  { id: 'math-modeling', name: '数学建模', parentId: 'math' },
  { id: 'physics-quantum', name: '量子力学', parentId: 'physics' },
  { id: 'physics-astrophysics', name: '天体物理', parentId: 'physics' },
  { id: 'chemistry-organic', name: '有机化学', parentId: 'chemistry' },
  { id: 'cs-python', name: 'Python 数据分析', parentId: 'cs' },
  { id: 'ic-design', name: '芯片设计', parentId: 'ic-semiconductor' },
  { id: 'lang-en-writing', name: '学术写作', parentId: 'lang-en' },
];

/** 按 id 查分类；不存在返回 undefined。 */
export function getCategory(id: string): FileCategory | undefined {
  return fileCategories.find((c) => c.id === id);
}

/** 取某层的子分类；根传 null。 */
export function getChildren(parentId: string | null): FileCategory[] {
  return fileCategories.filter((c) => c.parentId === parentId);
}

/** 从 id 回溯到根的路径数组（根→当前节点）；id 不存在返回 []。 */
export function getCategoryPath(id: string): FileCategory[] {
  const path: FileCategory[] = [];
  let current: FileCategory | undefined = getCategory(id);
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    current = current.parentId === null ? undefined : getCategory(current.parentId);
  }
  return current ? [] : path; // 遇环或父缺省时返回空，回退到根
}

/** 是否叶子：无子分类。 */
export function isLeaf(id: string): boolean {
  return getChildren(id).length === 0;
}

/** 递归统计该分类下（含子孙）的匹配文件总数。files 只需 categoryId 字段。 */
export function countFilesInCategory(id: string, files: { categoryId: string }[]): number {
  const direct = files.filter((f) => f.categoryId === id).length;
  const children = getChildren(id);
  if (children.length === 0) return direct;
  return direct + children.reduce((sum, c) => sum + countFilesInCategory(c.id, files), 0);
}
