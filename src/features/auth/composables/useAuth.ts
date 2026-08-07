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
import { AppError, ErrorCode } from '~/lib/errors';
import { ok, err } from '~/lib/errors/result';

const AUTH_KEY = Symbol('auth');

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  flow: 'idle',
  tempSession: null,
  loginMethod: null,
};

export function useAuthProvider() {
  const store = useAuthStore();
  const state = reactive<AuthState>({ ...initialState });

  // 从 Pinia store 恢复持久化状态
  store.restoreFromStorage();
  if (store.isLoggedIn && store.user) {
    state.isLoggedIn = true;
    state.user = { ...store.user, account_level: store.user.account_level as 'local' | 'normal' | 'admin' };
    state.flow = store.flow as AuthState['flow'];
  }

  // 双向同步：reactive state -> Pinia store
  watch(
    () => ({ ...state }),
    (val) => {
      if (val.isLoggedIn && val.user) {
        store.user = { ...store.user, ...val.user };
        store.isLoggedIn = true;
        store.flow = val.flow as 'idle' | 'logging_in' | '2fa_required' | '2fa_setup_required' | 'logged_in';
        store.persistToStorage();
      } else {
        store.resetState();
        store.persistToStorage();
      }
    },
    { deep: true }
  );

  // ── 登录结果处理 ──

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
    state.user = store.user as User;
    state.flow = 'logged_in';
    state.tempSession = null;
    return ok({});
  }

  // ── 登录方法分流 ──

  async function login(method: LoginMethod, credentials: Record<string, string>, _account?: User): Promise<LoginResult> {
    state.flow = 'logging_in';
    state.loginMethod = method;

    if (method === 'password') {
      const result = await store.loginPassword(credentials.username || credentials.account || '', credentials.password || '');
      if (result.isErr()) return err(result.error);
      return applyLoginResult(result.value);
    }

    if (method === 'sms') {
      const contact = credentials.phoneOrEmail || credentials.contact || '';
      const result = await store.loginCode(contact, credentials.code || '');
      if (result.isErr()) return err(result.error);
      return applyLoginResult(result.value);
    }

    if (method === 'github') {
      state.flow = 'idle';
      return err(new AppError(ErrorCode.AUTH_ERROR, 'GitHub OAuth 登录尚未接入后端，请使用密码或验证码登录'));
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
      if (result.isErr()) return err(result.error);
      return applyLoginResult(result.value);
    }

    if (method === 'passkey') {
      state.flow = 'idle';
      return err(new AppError(ErrorCode.AUTH_ERROR, 'Passkey 登录尚未接入后端，请使用其他方式'));
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
      state.user = store.user as User;
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

  async function logout() {
    await store.logout();
    Object.assign(state, { ...initialState });
  }

  function updateUser(user: User) {
    state.user = user;
    store.updateUser(user);
    store.persistToStorage();
  }

  const ctx: AuthContextType = {
    state,
    // async functions require cast since AuthContextType declares sync return types.
    // Consumers (LoginPage etc.) will be updated to use await in Tasks 8-11.
    login: login as unknown as (method: LoginMethod, credentials: Record<string, string>, account?: User) => LoginResult,
    register: register as unknown as (type: 'local' | 'normal', data: RegisterData) => RegisterResult,
    logout,
    updateUser,
    // Store delegates — cast to match interface type
    registerNormal: store.registerNormal as unknown as (username: string, password: string, email?: string, phone?: string) => Promise<RegisterResult>,
    verifyNormalRegister: store.verifyNormalRegister as unknown as (txnId: string, code: string, type: 'email' | 'phone') => Promise<LoginResult>,
    requestLoginCode: store.requestLoginCode,
    loginCode: store.loginCode as unknown as (contact: string, code: string) => LoginResult,
    requestMagicLink: store.requestMagicLink,
    verifyMagicLink: store.verifyMagicLink as unknown as (token: string) => LoginResult,
  };

  provide(AUTH_KEY, ctx);

  return ctx;
}

export function useAuth(): AuthContextType {
  const ctx = inject<AuthContextType>(AUTH_KEY);
  if (!ctx) throw new Error('useAuth must be used within a component that calls useAuthProvider()');
  return ctx;
}
