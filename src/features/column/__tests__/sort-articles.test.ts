import { describe, expect, it } from 'vitest';
import type { MockColumnArticle } from '../data/mock-columns';
import { sortArticles } from '../utils';

const articles: MockColumnArticle[] = [
  {
    id: 'a',
    columnId: 'c',
    columnSlug: 'c',
    title: 'A',
    excerpt: '',
    content: '',
    tags: [],
    viewCount: 1,
    likeCount: 10,
    commentCount: 0,
    createdAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'b',
    columnId: 'c',
    columnSlug: 'c',
    title: 'B',
    excerpt: '',
    content: '',
    tags: [],
    viewCount: 2,
    likeCount: 30,
    commentCount: 0,
    createdAt: '2026-07-03T00:00:00Z',
  },
  {
    id: 'c',
    columnId: 'c',
    columnSlug: 'c',
    title: 'C',
    excerpt: '',
    content: '',
    tags: [],
    viewCount: 3,
    likeCount: 20,
    commentCount: 0,
    createdAt: '2026-07-02T00:00:00Z',
  },
];

describe('sortArticles', () => {
  it('按赞同倒序（最多赞同在前）', () => {
    expect(sortArticles(articles, 'like', 'desc').map((a) => a.id)).toEqual(['b', 'c', 'a']);
  });

  it('按赞同正序（最少赞同在前）', () => {
    expect(sortArticles(articles, 'like', 'asc').map((a) => a.id)).toEqual(['a', 'c', 'b']);
  });

  it('按发布时间倒序（最新在前）', () => {
    expect(sortArticles(articles, 'time', 'desc').map((a) => a.id)).toEqual(['b', 'c', 'a']);
  });

  it('按发布时间正序（最早在前）', () => {
    expect(sortArticles(articles, 'time', 'asc').map((a) => a.id)).toEqual(['a', 'c', 'b']);
  });

  it('不修改原数组（纯函数）', () => {
    const original = [...articles];
    sortArticles(articles, 'like', 'desc');
    expect(articles).toEqual(original);
  });
});
