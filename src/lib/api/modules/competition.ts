import { get, post } from "../../http/client";

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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
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
