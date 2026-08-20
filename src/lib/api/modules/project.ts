import { get } from "../../http/client";
import type { PaginatedResponse } from "../types";

export type { PaginatedResponse } from "../types";

export interface Project {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  status: string;
  memberCount: number;
  createdAt: string;
}

export const projectApi = {
  getProjects: (page = 1, limit = 20) =>
    get<PaginatedResponse<Project>>("/api/projects", { page, limit }),

  getProject: (id: string) => get<Project>(`/api/projects/${id}`),
};
