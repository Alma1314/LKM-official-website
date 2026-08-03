import { get } from '../../http/client';

export interface FileEntry {
  id: string;
  name: string;
  description: string;
  fileType: string;
  fileSize: number;
  downloadCount: number;
  authorName: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const fileLibraryApi = {
  getFiles: (page = 1, limit = 20) =>
    get<PaginatedResponse<FileEntry>>('/api/files', { page, limit }),

  getFile: (id: string) =>
    get<FileEntry>(`/api/files/${id}`),
};
