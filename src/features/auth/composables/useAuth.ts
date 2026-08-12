import { reactive, watch, provide, inject } from 'vue';
import { useAuthStore } from '~/stores/auth';
import type {
  AuthState,
  AuthContextType,
  LoginResult,
  LoginMethod,
  RegisterData,
  RegisterResult,
  User,
} from '~/types/auth';
import { authApi } from '~/lib/api/modules/auth';
import { AppError, ErrorCode } from '~/lib/errors/error-codes';
import { ok, err } from '~/lib/errors/result';
import type { UserInfo } from '~/lib/api/modules/auth';

const AUTH_KEY = Symbol('auth');

// 把 store 的 UserInfo 投影为 AuthState 的 User（保留额外字段，仅归一化 account_level）
function toUser(u: UserInfo | null): User | null {
  if (!u) return null;
  const level = u.account_level as User['account_level'];
  return {
    ...u,
    account_level: level === 'admin' || level === 'normal' ? level : 'local',
  };
}

export function useAuthProvider(): AuthContextType {
  const store = useAuthStore();

  // 恢复持久化会话（幂等：无数据时维持 anonymous）
  store.restoreFromStorage();

  // state 是 store 单一状态源的响应式投影。
  // flow/tempSession/loginMethod 仅作为迁移期 UI 过渡状态保留（2FA 流程），不作为正式状态源。
  const state = reactive<AuthState>({
    isLoggedIn: store.isLoggedIn,
    user: toUser(store.user),
    flow: 'idle',
    tempSession: null,
    loginMethod: null,
    session: store.session,
  });

  // 单向同步 store -> state（store 是唯一状态源）
  watch(
    () => ({ isLoggedIn: store.isLoggedIn, user: toUser(store.user), session: store.session }),
    (val) => {
      state.isLoggedIn = val.isLoggedIn;
      state.user = val.user;
      state.session = val.session;
    }
  );

  // ── 登录结果处理（2FA 过渡态存于本地 state，不污染 store 的 session）──

  function applyLoginResult(success: { requires2FA?: boolean; requires2FASetup?: boolean }): LoginResult {
    if (success.requires2FA) {
      state.flow = '2fa_required';
      state.tempSession = { userId: store.user?.id ?? 0, method: state.loginMethod! };
      return ok({ requires2FA: true });
    }
    if (success.requires2FASetup) {
      state.flow = '2fa_setup_required';
      state.tempSession = { userId: store.user?.id ?? 0, method: state.loginMethod! };
      return ok({ requires2FASetup: true });
    }
    state.isLoggedIn = true;
    state.user = toUser(store.user);
    state.flow = 'logged_in';
    state.tempSession = null;
    return ok({});
  }

  // ── 登录方法分流（返回真实 Promise<Result>，无 unknown 强转）──

  async function login(
    method: LoginMethod,
    credentials: Record<string, string>,
    _account?: User
  ): Promise<LoginResult> {
    state.flow = 'logging_in';
    state.loginMethod = method;

    if (method === 'password') {
      const result = await store.loginPassword(
        credentials.username || credentials.account || '',
        credentials.password || ''
      );
      if (result.isErr()) {
        state.flow = 'idle';
        return err(result.error);
      }
      return applyLoginResult(result.value);
    }

    if (method === 'sms') {
      const contact = credentials.phoneOrEmail || credentials.contact || '';
      const result = await store.loginCode(contact, credentials.code || '');
      if (result.isErr()) {
        state.flow = 'idle';
        return err(result.error);
      }
      return applyLoginResult(result.value);
    }

    if (method === 'github') {
      // 整页跳转到真实后端授权入口（302 到 GitHub）
      const base = (
        typeof window === 'undefined'
          ? ((import.meta as unknown as { env: Record<string, unknown> }).env.API_URL as string) || ''
          : ''
      ).replace(/\/$/, '');
      window.location.assign(`${base}${authApi.githubLoginUrl()}`);
      return ok({});
    }

    if (method === 'magic-link') {
      const token = credentials.token || '';
      if (!token) {
        // 请求发送 magic link
        const reqResult = await store.requestMagicLink(credentials.email || '');
        if (reqResult.isErr()) {
          state.flow = 'idle';
          return err(reqResult.error);
        }
        state.flow = 'idle';
        return ok({});
      }
      const result = await store.verifyMagicLink(token);
      if (result.isErr()) {
        state.flow = 'idle';
        return err(result.error);
      }
      return applyLoginResult(result.value);
    }

    if (method === 'passkey') {
      state.flow = 'idle';
      // 完整 WebAuthn 流程由 useLoginFlow / 登录页承载；此处不让 Provider 误以为已登录
      return err(new AppError(ErrorCode.AUTH_ERROR, '请使用登录页的「通行密钥」方式完成认证'));
    }

    state.flow = 'idle';
    return err(new AppError(ErrorCode.AUTH_ERROR, '不支持的登录方式'));
  }

  // ── 注册 ──

  async function register(type: 'local' | 'normal', data: RegisterData): Promise<RegisterResult> {
    if (type === 'local') {
      const result = await store.registerLocal(data.username, data.password || '');
      if (result.isErr()) return err(result.error);
      state.isLoggedIn = true;
      state.user = toUser(store.user);
      state.flow = 'logged_in';
      state.tempSession = null;
      return ok(undefined);
    }

    if (type === 'normal') {
      const result = await store.registerNormal(data.username, data.password || '', data.email, data.phone);
      if (result.isErr()) return err(result.error);
      // 正常返回 txn_id，由 NormalRegister 组件处理后续 verify 步骤
      return ok(undefined);
    }
    return err(new AppError(ErrorCode.VALIDATION_ERROR, '不支持的注册类型'));
  }

  // ── 登出 ──

  async function logout(): Promise<void> {
    await store.logout();
    state.isLoggedIn = false;
    state.user = null;
    state.session = 'anonymous';
    state.flow = 'idle';
    state.tempSession = null;
    state.loginMethod = null;
  }

  function updateUser(user: User): void {
    state.user = user;
    store.updateUser(user);
  }

  const ctx: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateUser,
    registerNormal: async (username, password, email?, phone?) => {
      const r = await store.registerNormal(username ?? '', password ?? '', email, phone);
      if (r.isErr()) return err(r.error);
      return ok(undefined);
    },
    verifyNormalRegister: store.verifyNormalRegister,
    requestLoginCode: store.requestLoginCode,
    loginCode: store.loginCode,
    requestMagicLink: store.requestMagicLink,
    verifyMagicLink: store.verifyMagicLink,
  };

  provide(AUTH_KEY, ctx);

  return ctx;
}

export function useAuth(): AuthContextType {
  const ctx = inject<AuthContextType>(AUTH_KEY);
  if (!ctx) throw new Error('useAuth must be used within a component that calls useAuthProvider()');
  return ctx;
}
