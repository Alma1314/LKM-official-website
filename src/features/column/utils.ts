import type { MockColumnArticle } from "./data/mock-columns";

export type SortField = "like" | "time";
export type SortOrder = "asc" | "desc";

/** 按赞同数或发布时间排序；返回新数组，不修改入参。 */
export function sortArticles(
  articles: MockColumnArticle[],
  field: SortField,
  order: SortOrder,
): MockColumnArticle[] {
  return [...articles].sort((a, b) => {
    const cmp =
      field === "like"
        ? a.likeCount - b.likeCount
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return order === "asc" ? cmp : -cmp;
  });
}
