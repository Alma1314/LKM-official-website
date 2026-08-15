import { describe, it, expect } from 'vitest';
import { allMenuItems } from '../menus';

describe('menus', () => {
  it('统一菜单池含 8 个一级项', () => {
    expect(allMenuItems.length).toBe(8);
  });

  it('一级 name 全部唯一（主页与社区主页已区分）', () => {
    const names = allMenuItems.map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('每个一级项都有 url 与 children', () => {
    allMenuItems.forEach((item) => {
      expect(item.url).toBeTruthy();
      expect(Array.isArray(item.children)).toBe(true);
    });
  });

  it('七月团队子项 7 个且唯一', () => {
    const team = allMenuItems.find((item) => item.name === '七月团队');
    expect(team).toBeTruthy();
    const childNames = team!.children!.map((child) => child.name);
    expect(childNames).toHaveLength(7);
    expect(new Set(childNames).size).toBe(childNames.length);
  });
});
