import { get } from '../../http/client';

export interface Notification {
  id: string;
  type: 'reply' | 'like' | 'follow' | 'system';
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const notificationApi = {
  getNotifications: (page = 1) => get<PaginatedResponse<Notification>>('/api/notifications', { page }),

  getUnreadCount: () => get<{ count: number }>('/api/notifications/unread-count'),
};
