import { get, post, del } from '../../http/client';

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  tags: string[];
  isPinned: boolean;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  floorNumber: number;
  parentId?: string;
  likeCount: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const forumApi = {
  getPosts: (page = 1, limit = 20) => get<PaginatedResponse<Post>>('/api/forum/posts', { page, limit }),

  getPost: (id: string) => get<Post>(`/api/forum/posts/${id}`),

  getComments: (postId: string, page = 1) =>
    get<PaginatedResponse<Comment>>(`/api/forum/posts/${postId}/comments`, { page }),

  createPost: (data: { title: string; content: string; categoryId: string; tags?: string[] }) =>
    post<Post>('/api/forum/posts', data),

  likePost: (id: string) => post<void>(`/api/forum/posts/${id}/like`),

  deletePost: (id: string) => del<void>(`/api/forum/posts/${id}`),
};
