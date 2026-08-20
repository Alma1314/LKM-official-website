import { get } from "../../http/client";
import type { PaginatedResponse } from "../types";

export type { PaginatedResponse } from "../types";

export interface Notification {
  id: string;
  type: "reply" | "like" | "follow" | "system";
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: (page = 1) =>
    get<PaginatedResponse<Notification>>("/api/notifications", { page }),

  getUnreadCount: () =>
    get<{ count: number }>("/api/notifications/unread-count"),
};
