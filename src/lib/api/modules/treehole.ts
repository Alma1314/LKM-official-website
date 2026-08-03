import { get, post } from '../../http/client';

export interface TreeholeMessage {
  id: string;
  content: string;
  authorName?: string;
  isAnonymous: boolean;
  likeCount: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const treeholeApi = {
  getMessages: (page = 1, limit = 20) =>
    get<PaginatedResponse<TreeholeMessage>>('/api/treehole/messages', { page, limit }),

  createMessage: (data: { content: string; isAnonymous: boolean }) =>
    post<TreeholeMessage>('/api/treehole/messages', data),
};
