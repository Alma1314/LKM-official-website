import { reactive, ref, toRef } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { authApi } from '~/lib/api/modules/auth';
import { AppError, ErrorCode } from '~/lib/errors/error-codes';
import { useVerificationCountdown } from './useVerificationCountdown';
import { authenticate } from '../lib/webauthn';

export type LoginMode = 'password' | 'code' | 'github' | 'magic' | 'passkey' | '2fa';

export interface LoginFlowOptions {
  redirect?: string | null;
  onSuccess?: (dst: string) => void;
}

export interface LoginFlow {
  // state —— 由 reactive 包裹的 ref 已解包，模板里可直接 flow.mode=… / flow.mode===…
  mode: LoginMode;
  account: string;
  password: string;
  code: string;
  txnId: string;
  tempToken: string;
  magicSent: boolean;
  loading: boolean;
  error: null | string;
  successMessage: string;
  loggedIn: boolean;
  codeSent: boolean;
  countdown: number;
  countdownRunning: boolean;
  // methods
  submitPassword: () => Promise<void>;
  requestCode: () => Promise<void>;
  submitCode: () => Promise<void>;
  startGithub: () => Promise<void>;
  startMagic: () => Promise<void>;
  continueMagic: () => Promise<void>;
  startPasskey: () => Promise<void>;
  submit2FA: (verifyCode: string, tempTokenArg?: string) => Promise<void>;
  reset: () => void;
  errorMessageByCode: (err: AppError) => string;
}

/** API_BASE：SSR 用 API_URL，浏览器同域。与 http/client 的 base 策略一致。 */
function getApiBase(): string {
  if (typeof window === 'undefined') {
    return ((import.meta as unknown as { env: Record<string, unknown> }).env.API_URL as string) || '';
  }
  return '';
}

/**
 * 登录流程 Composable。
 *
 * 统一驱动密码 / 验证码 / GitHub(302) / Magic Link / Passkey / 2FA 登录，
 * 复用 AuthStore 已封装的 store 方法与 authApi 高级方法。
 * Passkey 走真实 WebAuthn；GitHub 走整页跳转后端 302；2FA 用 store 暂存的 temp_token。
 */
export function useLoginFlow(options: LoginFlowOptions = {}): LoginFlow {
  const store = useAuthStore();
  const { onSuccess } = options;

  // ── State ──
  const mode = ref<LoginMode>('password');
  const account = ref('');
  const password = ref('');
  const code = ref('');
  const txnId = ref('');
  const tempToken = ref('');
  const magicSent = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref('');
  const loggedIn = ref(false);
  const codeSent = ref(false);
  const countdown = useVerificationCountdown(60);
  const countdownRunning = toRef(countdown, 'running');

  function errorMessageByCode(e: AppError): string {
    switch (e.code) {
      case ErrorCode.AUTH_ERROR:
      case ErrorCode.HTTP_CLIENT_ERROR:
        return '账号或密码错误';
      case ErrorCode.NETWORK_ERROR:
      case ErrorCode.HTTP_TIMEOUT:
      case ErrorCode.HTTP_SERVER_ERROR:
        return '网络连接失败，请稍后重试';
      default:
        return e.message || '操作失败，请重试';
    }
  }

  function setError(e: AppError): void {
    error.value = errorMessageByCode(e);
  }

  function succeed(): void {
    error.value = null;
    successMessage.value = '登录成功';
    loggedIn.value = true;
    if (typeof onSuccess === 'function') onSuccess('');
  }

  // ── 密码登录 ──
  async function submitPassword(): Promise<void> {
    error.value = null;
    loading.value = true;
    try {
      const r = await store.loginPassword(account.value, password.value);
      if (r.isErr()) {
        setError(r.error);
        return;
      }
      if (r.value.requires2FA || r.value.requires2FASetup) {
        mode.value = '2fa';
        // store 已在进入 2FA 时暂存 temp_token，取回填入 flow
        tempToken.value = store.getPending2FA() ?? '';
        if (r.value.requires2FASetup) {
          successMessage.value = '账号首次登录需先完成 2FA 设置，请配合扫码';
        }
        return;
      }
      succeed();
    } finally {
      loading.value = false;
    }
  }

  // ── 验证码登录：请求验证码 ──
  async function requestCode(): Promise<void> {
    error.value = null;
    loading.value = true;
    try {
      const r = await store.requestLoginCode(account.value);
      if (r.isErr()) {
        setError(r.error);
        return;
      }
      codeSent.value = true;
      countdown.start();
      successMessage.value = '验证码已发送，请查收';
    } finally {
      loading.value = false;
    }
  }

  // ── 验证码登录：提交验证码 ──
  async function submitCode(): Promise<void> {
    error.value = null;
    loading.value = true;
    try {
      const r = await store.loginCode(account.value, code.value);
      if (r.isErr()) {
        setError(r.error);
        return;
      }
      if (r.value.requires2FA || r.value.requires2FASetup) {
        mode.value = '2fa';
        tempToken.value = store.getPending2FA() ?? '';
        return;
      }
      succeed();
    } finally {
      loading.value = false;
    }
  }

  // ── GitHub（整页跳转到后端授权 URL，走 302）──
  async function startGithub(): Promise<void> {
    error.value = null;
    loading.value = true;
    try {
      const base = getApiBase().replace(/\/$/, '');
      const target = `${base}${authApi.githubLoginUrl()}`;
      // 整页跳转：必须用 window.location（axios 会吞 302 并拿到 GitHub HTML）
      window.location.assign(target);
      // 跳转后本页将被卸载；此处不重置 loading，避免闪烁
    } catch (e) {
      loading.value = false;
      setError(
        e instanceof AppError ? e : new AppError(ErrorCode.NETWORK_ERROR, '发起 GitHub 授权失败')
      );
    }
  }

  // ── Magic Link ──
  async function startMagic(): Promise<void> {
    error.value = null;
    loading.value = true;
    try {
      const r = await store.requestMagicLink(account.value);
      if (r.isErr()) {
        setError(r.error);
        return;
      }
      magicSent.value = true;
      successMessage.value = 'Magic Link 已发送，请查收邮箱';
    } finally {
      loading.value = false;
    }
  }

  // 校验 magic link 中的 token（通常由邮箱链接重定向到本站后携带 token 调用）。
  async function continueMagic(): Promise<void> {
    error.value = null;
    loading.value = true;
    try {
      const r = await store.verifyMagicLink(tempToken.value);
      if (r.isErr()) {
        setError(r.error);
        return;
      }
      succeed();
    } finally {
      loading.value = false;
    }
  }

  // ── Passkey（真实 WebAuthn 登录）──
  async function startPasskey(): Promise<void> {
    error.value = null;
    loading.value = true;
    try {
      const begin = await authApi.passkeyLoginBegin();
      if (begin.isErr()) {
        setError(begin.error);
        return;
      }
      const serialized = await authenticate(begin.value.public_key);
      const complete = await authApi.passkeyLoginComplete(
        serialized.rawId,
        begin.value.challenge_id,
        serialized.response
      );
      if (complete.isErr()) {
        setError(complete.error);
        return;
      }
      const data = complete.value;
      if (data.requires_2fa || data.setup_required) {
        mode.value = '2fa';
        store.holdPending2FA(data.temp_token ?? null);
        tempToken.value = data.temp_token ?? '';
        return;
      }
      await applyTokenData(data);
      succeed();
    } catch (e) {
      setError(
        e instanceof Error
          ? new AppError(ErrorCode.AUTH_ERROR, e.message)
          : new AppError(ErrorCode.AUTH_ERROR, '通行密钥登录失败')
      );
    } finally {
      loading.value = false;
    }
  }

  // ── 2FA 验证 ──
  async function submit2FA(verifyCode: string, tempTokenArg?: string): Promise<void> {
    error.value = null;
    loading.value = true;
    try {
      const tt = tempTokenArg ?? tempToken.value;
      if (!tt) {
        setError(new AppError(ErrorCode.AUTH_ERROR, '缺少临时会话令牌，请重新登录'));
        return;
      }
      const r = await authApi.verify2FA(tt, verifyCode);
      if (r.isErr()) {
        setError(r.error);
        return;
      }
      const data = r.value;
      if (data.access_token) {
        store.setTokens(data.access_token, data.refresh_token ?? '');
        await store.fetchMe();
        store.clearPending2FA();
      }
      // 2FA 设置流程（purpose=recovery / admin setup）可能不立即发会话 token，
      // 由上层 UI 另行引导；此处视为步骤完成。
      succeed();
    } finally {
      loading.value = false;
    }
  }

  async function applyTokenData(data: { access_token?: string | null; refresh_token?: string | null }): Promise<void> {
    if (data.access_token) {
      store.setTokens(data.access_token, data.refresh_token ?? '');
      await store.fetchMe();
    }
  }

  // ── 重置 ──
  function reset(): void {
    account.value = '';
    password.value = '';
    code.value = '';
    txnId.value = '';
    tempToken.value = '';
    magicSent.value = false;
    codeSent.value = false;
    loading.value = false;
    error.value = null;
    successMessage.value = '';
    loggedIn.value = false;
    countdown.stop();
    store.clearPending2FA();
    mode.value = 'password';
  }

  return reactive({
    mode,
    account,
    password,
    code,
    txnId,
    tempToken,
    magicSent,
    loading,
    error,
    successMessage,
    loggedIn,
    codeSent,
    countdown: toRef(countdown, 'countdown'),
    countdownRunning,
    submitPassword,
    requestCode,
    submitCode,
    startGithub,
    startMagic,
    continueMagic,
    startPasskey,
    submit2FA,
    reset,
    errorMessageByCode,
  });
}
