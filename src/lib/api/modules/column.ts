import { get } from '../../http/client';

export interface Column {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  articleCount: number;
  subscriberCount: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  columnId: string;
  excerpt: string;
  published: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const columnApi = {
  getColumns: (page = 1) =>
    get<PaginatedResponse<Column>>('/api/columns', { page }),

  getColumnBySlug: (slug: string) =>
    get<Column>(`/api/columns/${slug}`),

  getArticles: (columnSlug: string, page = 1) =>
    get<PaginatedResponse<Article>>(`/api/columns/${columnSlug}/articles`, { page }),
};
