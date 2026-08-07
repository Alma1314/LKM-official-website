import { get, post, put } from '../../http/client';

// ── 类型 ──

export interface UserInfo {
  id: number;
  username: string;
  account_level: string;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  user_id: number;
  account_level: string;
  requires_2fa?: boolean;
  setup_required?: boolean;
  temp_token?: string;
}

export interface ProfileInfo {
  nickname: string | null;
  avatar: string | null;
  role: string;
}

export interface RegNormalResponse {
  message: string;
  txn_id: string;
  email_sent: boolean;
  phone_sent: boolean;
  email_code?: string;
  phone_code?: string;
}

export interface MessageResponse {
  message: string;
}

// ── Auth API ──

export const authApi = {
  // ── 获取当前用户 ──
  getMe: () => get<UserInfo>('/api/auth/me'),

  // ── 密码登录 ──
  loginPassword: (account: string, password: string) =>
    post<TokenData>('/api/auth/login/password', { account, password }),

  // ── 短信/邮箱验证码登录（请求验证码） ──
  requestLoginCode: (contact: string) =>
    post<MessageResponse>(`/api/auth/login/code/request?contact=${encodeURIComponent(contact)}`),

  // ── 短信/邮箱验证码登录（验证） ──
  loginCode: (contact: string, code: string) =>
    post<TokenData>(`/api/auth/login/code?contact=${encodeURIComponent(contact)}&code=${encodeURIComponent(code)}`),

  // ── Magic Link 请求 ──
  requestMagicLink: (email: string) =>
    post<MessageResponse>(`/api/auth/login/magic-link/request?email=${encodeURIComponent(email)}`),

  // ── Magic Link 验证 ──
  verifyMagicLink: (token: string) =>
    get<TokenData>(`/api/auth/login/magic-link/verify?token=${encodeURIComponent(token)}`),

  // ── 注册本地账户 ──
  registerLocal: (username: string, password: string) =>
    post<TokenData>('/api/auth/reg/local', { username, password }),

  // ── 注册普通账户（发送验证码） ──
  registerNormal: (username: string, password: string, email: string | null, phone: string | null) =>
    post<RegNormalResponse>('/api/auth/reg/normal', { username, password, email, phone }),

  // ── 验证并完成普通账户注册 ──
  registerNormalVerify: (txnId: string, emailCode: string | null, phoneCode: string | null) => {
    const params = new URLSearchParams();
    params.set('txn_id', txnId);
    if (emailCode) params.set('email_code', emailCode);
    if (phoneCode) params.set('phone_code', phoneCode);
    return post<TokenData>(`/api/auth/reg/normal/verify?${params.toString()}`);
  },

  // ── 手机号注册（发送验证码） ──
  registerPhone: (phone: string) =>
    post<{ phone: string; message: string }>('/api/auth/reg/phone', { phone }),

  // ── 手机号注册（验证） ──
  registerPhoneVerify: (phone: string, code: string) =>
    post<TokenData>(`/api/auth/reg/phone/verify?phone=${encodeURIComponent(phone)}&code=${encodeURIComponent(code)}`),

  // ── 邮箱注册（发送验证码） ──
  registerEmail: (email: string) =>
    post<{ email: string; message: string }>('/api/auth/reg/email', { email }),

  // ── 邮箱注册（验证） ──
  registerEmailVerify: (email: string, code: string) =>
    post<TokenData>(`/api/auth/reg/email/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`),

  // ── 刷新 Token ──
  refreshToken: (refreshToken: string) =>
    post<{ access_token: string; refresh_token: string }>('/api/auth/refresh', { refresh_token: refreshToken }),

  // ── 登出 ──
  logout: () => post<MessageResponse>('/api/auth/logout'),

  // ── 获取用户资料 ──
  getUserProfile: (userId: number) => get<ProfileInfo>(`/api/auth/${userId}`),

  // ── 编辑用户资料 ──
  editProfile: (userId: number, info: { nickname?: string; avatar?: string }) =>
    put<ProfileInfo>(`/api/auth/${userId}/profile`, info),
};
