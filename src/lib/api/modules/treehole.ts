import { get, post } from "../../http/client";
import type { PaginatedResponse } from "../types";

export type { PaginatedResponse } from "../types";

export interface TreeholeMessage {
  id: string;
  content: string;
  authorName?: string;
  isAnonymous: boolean;
  likeCount: number;
  createdAt: string;
}

export const treeholeApi = {
  getMessages: (page = 1, limit = 20) =>
    get<PaginatedResponse<TreeholeMessage>>("/api/treehole/messages", {
      page,
      limit,
    }),

  createMessage: (data: { content: string; isAnonymous: boolean }) =>
    post<TreeholeMessage>("/api/treehole/messages", data),
};
