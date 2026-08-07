import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '~/lib/api/modules/auth';
import { AppError, ErrorCode } from '~/lib/errors';
import { ok, err } from '~/lib/errors/result';
import type { Result } from '~/lib/errors/result';
import type { UserInfo, MessageResponse } from '~/lib/api/modules/auth';

type AuthFlow = 'idle' | 'logging_in' | '2fa_required' | '2fa_setup_required' | 'logged_in';

interface TempSession {
  userId: number;
  method: string;
  isRecovery?: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  // ── State ──
  const user = ref<UserInfo | null>(null);
  const isLoggedIn = ref(false);
  const flow = ref<AuthFlow>('idle');
  const tempSession = ref<TempSession | null>(null);
  const loginMethod = ref<string | null>(null);
  const _token = ref<string | null>(null);
  const _refreshToken = ref<string | null>(null);

  // ── Token 辅助函数 ──
  function setTokens(accessToken: string, refreshToken: string) {
    _token.value = accessToken;
    _refreshToken.value = refreshToken;
  }

  function clearTokens() {
    _token.value = null;
    _refreshToken.value = null;
  }

  // ── Getters ──
  const accountLevel = computed(() => user.value?.account_level ?? 'local');
  const username = computed(() => user.value?.username ?? '');

  // ── API: 获取当前用户 ──
  async function fetchMe(): Promise<Result<UserInfo, AppError>> {
    if (!_token.value) {
      return err(new AppError(ErrorCode.AUTH_ERROR, 'no token'));
    }
    const result = await authApi.getMe();
    if (result.isOk()) {
      user.value = result.value;
      isLoggedIn.value = true;
      flow.value = 'logged_in';
    }
    return result;
  }

  // ── API: 密码登录 ──
  async function loginPassword(account: string, password: string): Promise<Result<AuthSuccess, AppError>> {
    flow.value = 'logging_in';
    loginMethod.value = 'password';

    const result = await authApi.loginPassword(account, password);
    if (result.isErr()) {
      flow.value = 'idle';
      return err(result.error);
    }

    const data = result.value;
    if (data.requires_2fa || data.setup_required) {
      flow.value = data.setup_required ? '2fa_setup_required' : '2fa_required';
      tempSession.value = { userId: data.user_id, method: 'password' };
      return ok({ requires2FA: data.requires_2fa, requires2FASetup: data.setup_required });
    }

    if (data.access_token) {
      setTokens(data.access_token, data.refresh_token);
      persistToStorage();
    }

    return fetchMeAfterLogin(data.user_id);
  }

  // ── 登录后获取用户信息 ──
  async function fetchMeAfterLogin(_userId: number): Promise<Result<AuthSuccess, AppError>> {
    const meResult = await fetchMe();
    if (meResult.isOk()) {
      isLoggedIn.value = true;
      flow.value = 'logged_in';
      tempSession.value = null;
      return ok({});
    }
    return err(meResult.error);
  }

  // ── API: 注册本地账户 ──
  async function registerLocal(username: string, password: string): Promise<Result<AuthSuccess, AppError>> {
    flow.value = 'logging_in';
    const result = await authApi.registerLocal(username, password);
    if (result.isErr()) return err(result.error);
    if (result.value.access_token) {
      setTokens(result.value.access_token, result.value.refresh_token);
      persistToStorage();
    }
    return fetchMeAfterLogin(result.value.user_id);
  }

  // ── API: 注册普通账户（发送验证码） ──
  async function registerNormal(
    username: string,
    password: string,
    email?: string,
    phone?: string
  ): Promise<Result<{ txn_id: string; email_sent: boolean; phone_sent: boolean }, AppError>> {
    const result = await authApi.registerNormal(username, password, email ?? null, phone ?? null);
    return result;
  }

  // ── API: 验证并完成普通账户注册 ──
  async function verifyNormalRegister(
    txnId: string,
    code: string,
    type: 'email' | 'phone'
  ): Promise<Result<AuthSuccess, AppError>> {
    const result = await authApi.registerNormalVerify(
      txnId,
      type === 'email' ? code : null,
      type === 'phone' ? code : null
    );
    if (result.isErr()) return err(result.error);
    if (result.value.access_token) {
      setTokens(result.value.access_token, result.value.refresh_token);
      persistToStorage();
    }
    return fetchMeAfterLogin(result.value.user_id);
  }

  // ── API: 短信/邮箱验证码登录（发送验证码） ──
  async function requestLoginCode(contact: string): Promise<Result<MessageResponse, AppError>> {
    return authApi.requestLoginCode(contact);
  }

  // ── API: 短信/邮箱验证码登录（验证） ──
  async function loginCode(contact: string, code: string): Promise<Result<AuthSuccess, AppError>> {
    flow.value = 'logging_in';
    loginMethod.value = 'sms';
    const result = await authApi.loginCode(contact, code);
    if (result.isErr()) {
      flow.value = 'idle';
      return err(result.error);
    }
    if (result.value.access_token) {
      setTokens(result.value.access_token, result.value.refresh_token);
      persistToStorage();
    }
    return fetchMeAfterLogin(result.value.user_id);
  }

  // ── API: Magic Link 请求 ──
  async function requestMagicLink(email: string): Promise<Result<MessageResponse, AppError>> {
    return authApi.requestMagicLink(email);
  }

  // ── API: Magic Link 验证 ──
  async function verifyMagicLink(token: string): Promise<Result<AuthSuccess, AppError>> {
    flow.value = 'logging_in';
    loginMethod.value = 'magic-link';
    const result = await authApi.verifyMagicLink(token);
    if (result.isErr()) {
      flow.value = 'idle';
      return err(result.error);
    }
    if (result.value.access_token) {
      setTokens(result.value.access_token, result.value.refresh_token);
      persistToStorage();
    }
    return fetchMeAfterLogin(result.value.user_id);
  }

  // ── API: 登出 ──
  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // 即使后端登出失败也清理本地状态
    }
    resetState();
  }

  // ── 更新用户 ──
  function updateUser(updated: UserInfo) {
    user.value = updated;
  }

  // ── 重置状态 ──
  function resetState() {
    user.value = null;
    isLoggedIn.value = false;
    flow.value = 'idle';
    tempSession.value = null;
    loginMethod.value = null;
    clearTokens();
  }

  // ── 从 localStorage 恢复 ──
  function restoreFromStorage() {
    try {
      const saved = localStorage.getItem('lkm-auth-store');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.user && data.isLoggedIn) {
          user.value = data.user;
          isLoggedIn.value = true;
          flow.value = 'logged_in';
          _token.value = data._token ?? null;
          _refreshToken.value = data._refreshToken ?? null;
        }
      }
    } catch {
      localStorage.removeItem('lkm-auth-store');
    }
  }

  // ── 持久化到 localStorage ──
  function persistToStorage() {
    if (_token.value) {
      localStorage.setItem(
        'lkm-auth-store',
        JSON.stringify({
          user: user.value,
          isLoggedIn: true,
          flow: flow.value,
          _token: _token.value,
          _refreshToken: _refreshToken.value,
        })
      );
    } else {
      localStorage.removeItem('lkm-auth-store');
    }
  }

  restoreFromStorage();

  return {
    // State
    user,
    isLoggedIn,
    flow,
    tempSession,
    loginMethod,
    // Getters
    accountLevel,
    username,
    // Actions
    fetchMe,
    loginPassword,
    registerLocal,
    registerNormal,
    verifyNormalRegister,
    requestLoginCode,
    loginCode,
    requestMagicLink,
    verifyMagicLink,
    logout,
    updateUser,
    resetState,
    restoreFromStorage,
    persistToStorage,
  };
});

export interface AuthSuccess {
  requires2FA?: boolean;
  requires2FASetup?: boolean;
}
