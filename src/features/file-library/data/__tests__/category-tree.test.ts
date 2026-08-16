import { describe, expect, it } from 'vitest';
import {
  fileCategories,
  getCategory,
  getChildren,
  getCategoryPath,
  isLeaf,
  countFilesInCategory,
  type FileCategory,
} from '../category-tree';

function mockFile(id: string, categoryId: string): { id: string; categoryId: string } {
  return { id, categoryId };
}

describe('category-tree 数据完整性', () => {
  it('一级分类 parentId 为 null', () => {
    const roots = getChildren(null);
    expect(roots.length).toBe(3);
    expect(roots.every((c) => c.parentId === null)).toBe(true);
  });

  it('每个 parentId 都指向存在的分类（无孤立节点、无缺省父）', () => {
    for (const c of fileCategories) {
      if (c.parentId !== null) {
        expect(getCategory(c.parentId), `父缺失: ${c.id}`).toBeDefined();
      }
    }
  });

  it('无自环：getCategoryPath 对所有节点都能返回到根', () => {
    for (const c of fileCategories) {
      const path = getCategoryPath(c.id);
      expect(
        path.map((p) => p.id),
        `无法回溯: ${c.id}`
      ).toContain(c.id);
      // 根能连到一级：路径首节点是一级
      expect(path[0] && path[0].parentId === null).toBe(true);
    }
  });
});

describe('getChildren', () => {
  it('空分类无子分类时返回空数组', () => {
    expect(getChildren('math-linear-algebra')).toEqual([]);
  });

  it('getChildren(null) 返回一级分类', () => {
    const ids = getChildren(null).map((c) => c.id);
    expect(ids).toEqual(['basic-science', 'applied-science', 'language']);
  });

  it('getChildren(二级) 返回三级叶子', () => {
    const ids = getChildren('math').map((c) => c.id);
    expect(ids).toEqual(['math-linear-algebra', 'math-modeling']);
  });
});

describe('getCategoryPath', () => {
  it('叶子分类回溯到根（四层路径）', () => {
    const path = getCategoryPath('math-linear-algebra');
    expect(path.map((c) => c.id)).toEqual(['basic-science', 'math', 'math-linear-algebra']);
    expect(path.map((c: FileCategory) => c.name)).toEqual([
      'fileLibraryData.categories.basicScience',
      'fileLibraryData.categories.math',
      'fileLibraryData.categories.mathLinearAlgebra',
    ]);
  });

  it('不存在的 id 返回空数组', () => {
    expect(getCategoryPath('nope')).toEqual([]);
  });
});

describe('isLeaf', () => {
  it('区分叶子与非叶子', () => {
    expect(isLeaf('math-linear-algebra')).toBe(true);
    expect(isLeaf('math')).toBe(false);
    expect(isLeaf('basic-science')).toBe(false);
  });
});

describe('countFilesInCategory', () => {
  it('递归合计该分类下（含子孙）文件数', () => {
    const files = [
      mockFile('a', 'math-linear-algebra'),
      mockFile('b', 'math-linear-algebra'),
      mockFile('c', 'math-modeling'),
      mockFile('d', 'math'), // 直接挂在非叶子
    ];
    // math 下：子两个(2 + 1) + 直接 1 = 4
    expect(countFilesInCategory('math', files)).toBe(4);
    expect(countFilesInCategory('basic-science', files)).toBe(4);
    expect(countFilesInCategory('physics-quantum', files)).toBe(0);
  });
});
