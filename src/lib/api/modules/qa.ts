import { get, post } from "../../http/client";
import type { PaginatedResponse } from "../types";

export type { PaginatedResponse } from "../types";

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  tags: string[];
  viewCount: number;
  answerCount: number;
  voteCount: number;
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  authorName: string;
  content: string;
  voteCount: number;
  isAccepted: boolean;
  createdAt: string;
}

export const qaApi = {
  getQuestions: (page = 1, limit = 20) =>
    get<PaginatedResponse<Question>>("/api/qa/questions", { page, limit }),

  getQuestion: (id: string) => get<Question>(`/api/qa/questions/${id}`),

  getAnswers: (questionId: string, page = 1) =>
    get<PaginatedResponse<Answer>>(`/api/qa/questions/${questionId}/answers`, {
      page,
    }),

  createQuestion: (data: { title: string; content: string; tags?: string[] }) =>
    post<Question>("/api/qa/questions", data),

  createAnswer: (questionId: string, content: string) =>
    post<Answer>(`/api/qa/questions/${questionId}/answers`, { content }),
};
