import type { MockFile } from "./mock-files";

/**
 * 全局搜索：query 去空白后小写，任一匹配字段（originalName/description/categoryName/
 * uploaderName/tags）包含关键词即命中；query 为空白返回 []。
 */
export function searchFiles(files: MockFile[], query: string): MockFile[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return [];
  return files.filter((f) => {
    const haystack = [
      f.originalName,
      f.description,
      f.categoryName,
      f.uploaderName,
      ...f.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(keyword);
  });
}
