// src/lib/api/types.ts — API 层共享类型
// 供各资源模块（forum/qa/column/files...）复用，消除各自的重复定义。

/** 后端通用分页响应（{items,total,page,pages}） */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
