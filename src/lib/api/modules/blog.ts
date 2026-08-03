import { get } from '../../http/client';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  lang: string;
  published: string;
  updated?: string;
  draft?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const blogApi = {
  getPosts: (page = 1, limit = 20) => get<PaginatedResponse<BlogPost>>('/api/blog/posts', { page, limit }),

  getPostBySlug: (slug: string) => get<BlogPost>(`/api/blog/posts/${slug}`),
};
