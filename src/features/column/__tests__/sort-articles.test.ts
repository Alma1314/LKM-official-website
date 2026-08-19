import { describe, expect, it } from "vitest";
import type { ColumnArticle } from "../../../lib/api/modules/column";
import { sortArticles } from "../utils";

const articles: ColumnArticle[] = [
  {
    id: 1,
    columnId: 1,
    authorId: 1,
    title: "A",
    summary: "",
    content: "",
    coverImage: null,
    viewCount: 1,
    likeCount: 10,
    commentCount: 0,
    publishedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: 2,
    columnId: 1,
    authorId: 1,
    title: "B",
    summary: "",
    content: "",
    coverImage: null,
    viewCount: 2,
    likeCount: 30,
    commentCount: 0,
    publishedAt: "2026-07-03T00:00:00Z",
  },
  {
    id: 3,
    columnId: 1,
    authorId: 1,
    title: "C",
    summary: "",
    content: "",
    coverImage: null,
    viewCount: 3,
    likeCount: 20,
    commentCount: 0,
    publishedAt: "2026-07-02T00:00:00Z",
  },
];

describe("sortArticles", () => {
  it("按赞同倒序（最多赞同在前）", () => {
    expect(sortArticles(articles, "like", "desc").map((a) => a.id)).toEqual([
      2, 3, 1,
    ]);
  });

  it("按赞同正序（最少赞同在前）", () => {
    expect(sortArticles(articles, "like", "asc").map((a) => a.id)).toEqual([
      1, 3, 2,
    ]);
  });

  it("按发布时间倒序（最新在前）", () => {
    expect(sortArticles(articles, "time", "desc").map((a) => a.id)).toEqual([
      2, 3, 1,
    ]);
  });

  it("按发布时间正序（最早在前）", () => {
    expect(sortArticles(articles, "time", "asc").map((a) => a.id)).toEqual([
      1, 3, 2,
    ]);
  });

  it("不修改原数组（纯函数）", () => {
    const original = [...articles];
    sortArticles(articles, "like", "desc");
    expect(articles).toEqual(original);
  });
});
