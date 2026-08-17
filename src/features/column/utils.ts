import type { ColumnArticle } from "../../lib/api/modules/column";

export type SortField = "like" | "time";
export type SortOrder = "asc" | "desc";

/** 按赞同数或发布时间排序；返回新数组，不修改入参。 */
export function sortArticles(
  articles: ColumnArticle[],
  field: SortField,
  order: SortOrder,
): ColumnArticle[] {
  return [...articles].sort((a, b) => {
    const cmp =
      field === "like"
        ? a.likeCount - b.likeCount
        : new Date(a.publishedAt ?? 0).getTime() -
          new Date(b.publishedAt ?? 0).getTime();
    return order === "asc" ? cmp : -cmp;
  });
}
