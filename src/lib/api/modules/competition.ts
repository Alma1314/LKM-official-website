import { get, post } from "../../http/client";
import type { PaginatedResponse } from "../types";

export type { PaginatedResponse } from "../types";

export interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: "upcoming" | "ongoing" | "ended";
  participantCount: number;
  category: string;
}

export const competitionApi = {
  getCompetitions: (page = 1, limit = 20) =>
    get<PaginatedResponse<Competition>>("/api/competition/list", {
      page,
      limit,
    }),

  getCompetition: (id: string) => get<Competition>(`/api/competition/${id}`),

  submitAnswer: (id: string, answers: Record<string, unknown>) =>
    post<{ score: number; total: number }>(`/api/competition/${id}/submit`, {
      answers,
    }),
};
