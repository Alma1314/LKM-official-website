import { get, post, put, patch, del } from '../../http/client';

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

/** 登录/续签成功后返回的令牌载荷（与 TokenData 同构）。 */
export type AuthTokenData = TokenData;

export interface ProfileInfo {
  nickname: string | null;
  avatar: string | null;
  role: string;
  account_level?: string;
  bio?: string | null;
  major?: string | null;
  grade?: string | null;
  interests?: string[];
  ideals?: string | null;
  points?: number;
  follower_count?: number;
  following_count?: number;
  post_count?: number;
  project_count?: number;
  column_article_count?: number;
  has_column_access?: boolean;
  title?: string;
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

export interface RecoveryRequestResponse {
  message: string;
  transaction_id: string;
}

export interface ChallengeData {
  transaction_id: string;
  expires_in: number;
  test_code?: string | null;
  test_continue_token?: string | null;
}

export interface SecurityState {
  two_factor_enabled: boolean;
  recovery_codes?: string[] | null;
}

export interface OnboardingState {
  step: number;
  completed: boolean;
  data?: Record<string, unknown> | null;
}

export interface PasskeyData {
  id: number;
  credential_id: string;
  name: string;
  created_at: string;
}

export interface BindingState {
  email?: string | null;
  phone?: string | null;
  github: boolean;
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
  registerLocal: (username: string, password: string) => post<TokenData>('/api/auth/reg/local', { username, password }),

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
  registerPhone: (phone: string) => post<{ phone: string; message: string }>('/api/auth/reg/phone', { phone }),

  // ── 手机号注册（验证） ──
  registerPhoneVerify: (phone: string, code: string) =>
    post<TokenData>(`/api/auth/reg/phone/verify?phone=${encodeURIComponent(phone)}&code=${encodeURIComponent(code)}`),

  // ── 邮箱注册（发送验证码） ──
  registerEmail: (email: string) => post<{ email: string; message: string }>('/api/auth/reg/email', { email }),

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
  editProfile: (userId: number, info: { nickname?: string | null; avatar?: string | null }) =>
    put<ProfileInfo>(`/api/auth/${userId}/profile`, info),

  // ── 根据用户名获取用户信息 ──
  getUserByUsername: (username: string) =>
    get<ProfileInfo>(`/api/auth/user/by-username/${encodeURIComponent(username)}`),

  // ── GitHub 模拟 ──
  githubStart: (hint: string) => post<ChallengeData>('/api/auth/github/start', { hint }),
  githubCallback: (token: string) => get<AuthTokenData>(`/api/auth/github/callback?token=${encodeURIComponent(token)}`),
  // ── Passkey 登录 ──
  loginPasskeyStart: () => post<ChallengeData>('/api/auth/login/passkey/start'),
  loginPasskeyComplete: (txn: string) =>
    post<AuthTokenData>('/api/auth/login/passkey/complete', { transaction_id: txn }),
  // ── 2FA ──
  verify2FA: (tempToken: string, code: string) =>
    post<AuthTokenData>('/api/auth/login/2fa/verify', { temp_token: tempToken, code }),
  start2FA: () => post<ChallengeData>('/api/auth/security/2fa/start'),
  verify2FAEnable: (code: string) => post<SecurityState>('/api/auth/security/2fa/verify', { code }),
  disable2FA: () => post<MessageResponse>('/api/auth/security/2fa/disable'),
  getRecoveryCodes: () => get<SecurityState>('/api/auth/security/recovery-codes'),
  // ── Passkey 管理 ──
  listPasskeys: () => get<PasskeyData[]>('/api/auth/security/passkeys'),
  createPasskey: (name: string) => post<PasskeyData>('/api/auth/security/passkeys', { name }),
  renamePasskey: (id: number, name: string) => patch<PasskeyData>(`/api/auth/security/passkeys/${id}`, { name }),
  deletePasskey: (id: number) => del<MessageResponse>(`/api/auth/security/passkeys/${id}`),
  // ── 绑定方式 ──
  getBindings: () => get<BindingState>('/api/auth/security/bindings'),
  bindingRequest: (contact: string, type: 'email' | 'phone') =>
    post<ChallengeData>('/api/auth/security/bindings/request', { contact, type }),
  bindingConfirm: (txn: string, code: string, contact: string, type: 'email' | 'phone') =>
    post<MessageResponse>('/api/auth/security/bindings/confirm', { transaction_id: txn, code, contact, type }),
  unbind: (type: 'email' | 'phone' | 'github') =>
    post<MessageResponse | BindingState>('/api/auth/security/bindings/unbind', { type }),
  bindingsGithubStart: () => post<ChallengeData>('/api/auth/security/bindings/github/start'),
  bindingsGithubCallback: (token: string) =>
    get<BindingState>('/api/auth/security/bindings/github/callback?token=' + encodeURIComponent(token)),
  // ── 找回密码 ──
  recoveryRequest: (account: string) => post<RecoveryRequestResponse>('/api/auth/recovery/request', { account }),
  recoveryVerify: (txn: string, code: string) =>
    post<MessageResponse>('/api/auth/recovery/verify', { transaction_id: txn, code }),
  recoveryReset: (txn: string, code: string, newPassword: string) =>
    post<MessageResponse>('/api/auth/recovery/reset', { transaction_id: txn, code, new_password: newPassword }),
  // ── Onboarding ──
  getOnboarding: () => get<OnboardingState>('/api/auth/onboarding'),
  setOnboardingStep: (step: number, data: Record<string, unknown>) =>
    put<OnboardingState>(`/api/auth/onboarding/steps/${step}`, { data }),
  skipOnboarding: () => post<OnboardingState>('/api/auth/onboarding/skip'),
};
