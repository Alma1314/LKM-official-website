import { get, post } from '../../http/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: string;
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    post<AuthTokens>('/api/auth/login', data),

  register: (data: { username: string; email: string; password: string }) =>
    post<AuthTokens>('/api/auth/register', data),

  logout: () =>
    post<void>('/api/auth/logout'),

  refreshToken: (refreshToken: string) =>
    post<AuthTokens>('/api/auth/refresh', { refreshToken }),

  getMe: () =>
    get<UserInfo>('/api/auth/me'),
};
