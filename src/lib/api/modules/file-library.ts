// 文件库 API 客户端 — 对接后端 /api/v1/files/*
//
// 后端 FileInfo 为 snake_case 字段，这里在客户端层映射为前端 UI 使用的 camelCase 形状。

import { get } from "../../http/client";

/** 文件展示形状（camelCase，由后端 FileInfo 映射而来）。 */
export interface FileEntry {
  id: number;
  originalName: string;
  uploaderName: string;
  mimeType: string;
  size: number;
  categoryId: string;
  categoryName: string;
  description: string;
  tags: string[];
  status: string;
  reviewComment: string | null;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
}

interface BackendFile {
  id: number;
  original_name: string;
  uploader_id: number;
  uploader_name: string;
  mime_type: string;
  size: number;
  category_id: string;
  category_name: string;
  description: string;
  tags: string[];
  status: string;
  review_comment: string | null;
  download_count: number;
  view_count: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

function mapFile(f: BackendFile): FileEntry {
  return {
    id: f.id,
    originalName: f.original_name,
    uploaderName: f.uploader_name,
    mimeType: f.mime_type,
    size: f.size,
    categoryId: f.category_id,
    categoryName: f.category_name,
    description: f.description,
    tags: f.tags ?? [],
    status: f.status,
    reviewComment: f.review_comment,
    downloadCount: f.download_count,
    viewCount: f.view_count,
    createdAt: f.created_at,
  };
}

export const fileLibraryApi = {
  getFiles: async (page = 1, limit = 20): Promise<FileEntry[]> => {
    const res = await get<PaginatedResponse<BackendFile>>("/api/v1/files", {
      page,
      limit,
    });
    if (res.isErr()) return [];
    return (res.value.items ?? []).map(mapFile);
  },

  getFile: async (id: string | number): Promise<FileEntry | null> => {
    const res = await get<BackendFile>(`/api/v1/files/${id}`);
    if (res.isErr()) return null;
    return mapFile(res.value);
  },
};
