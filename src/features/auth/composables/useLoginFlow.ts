import { ref, toRef, type Ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { authApi, type ChallengeData, type AuthTokenData } from '~/lib/api/modules/auth';
import { AppError, ErrorCode } from '~/lib/errors/error-codes';
import { resolveSafeRedirect } from '~/features/auth/utils/safe-redirect';
import { useVerificationCountdown } from './useVerificationCountdown';

export type LoginMode = 'password' | 'code' | 'github' | 'magic' | 'passkey' | '2fa';

export interface LoginFlowOptions {
  redirect?: string | null;
  onSuccess?: (dst: string) => void;
}

export interface LoginFlow {
  // state
  mode: Ref<LoginMode>;
  account: Ref<string>;
  password: Ref<string>;
  code: Ref<string>;
  txnId: Ref<string>;
  tempToken: Ref<string>;
  magicSent: Ref<boolean>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  successMessage: Ref<string>;
  codeSent: Ref<boolean>;
  countdown: Ref<number>;
  countdownRunning: Ref<boolean>;
  // methods
  submitPassword: () => Promise<void>;
  requestCode: () => Promise<void>;
  submitCode: () => Promise<void>;
  startGithub: () => Promise<void>;
  submitGithub: () => Promise<void>;
  startMagic: () => Promise<void>;
  continueMagic: () => Promise<void>;
  startPasskey: () => Promise<void>;
  submit2FA: (verifyCode: string, tempTokenArg?: string) => Promise<void>;
  reset: () => void;
  errorMessageByCode: (err: AppError) => string;
}

/**
 * 登录流程 Composable。
 *
 * 统一驱动密码 / 验证码 / GitHub(模拟) / Magic Link / Passkey / 2FA 登录，
 * 复用 AuthStore 已封装的 store 方法与 authApi 高级方法，本身不发明新网络能力。
 * 成功跳转统一走 resolveSafeRedirect。
 */
export function useLoginFlow(options: LoginFlowOptions = {}): LoginFlow {
  const store = useAuthStore();
  const { redirect = null, onSuccess } = options;

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
  const codeSent = ref(false);
  const countdown = useVerificationCountdown(60);
  // toRef 保持与源 reactive 对象的响应式连接：模板读 flow.countdown / flow.countdownRunning 时
  // 会随 interval 递减实时更新（普通对象返回不会自动解包嵌套 ref，故需显式透出同一个响应式源）。
  const countdownRunning = toRef(countdown, 'running');

  // ── 错误 → 中文 ──
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

  // 登录成功：清空错误、写成功提示、跳转
  function succeed(): void {
    error.value = null;
    successMessage.value = '登录成功';
    const dst = resolveSafeRedirect(redirect);
    if (typeof onSuccess === 'function') onSuccess(dst);
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
      if (r.value.requires2FA) {
        mode.value = '2fa';
        // store 的 loginPassword 未回传 temp_token；进入 2FA 时暂留，供后续 submit2FA 使用
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
      if (r.value.requires2FA) {
        mode.value = '2fa';
        return;
      }
      succeed();
    } finally {
      loading.value = false;
    }
  }

  // ── GitHub（模拟）──
  async function startGithub(): Promise<void> {
    error.value = null;
    loading.value = true;
    mode.value = 'github';
    try {
      const r = await authApi.githubStart('github-user');
      if (r.isErr()) {
        setError(r.error);
        return;
      }
      const challenge: ChallengeData = r.value;
      txnId.value = challenge.transaction_id;
      // 测试模式后端回传 test_continue_token，作为模拟授权完成的令牌
      if (challenge.test_continue_token) {
        tempToken.value = challenge.test_continue_token;
      }
    } finally {
      loading.value = false;
    }
  }

  // 完成模拟 GitHub 授权
  async function submitGithub(): Promise<void> {
    error.value = null;
    loading.value = true;
    try {
      const token = tempToken.value;
      const r = await authApi.githubCallback(token);
      if (r.isErr()) {
        setError(r.error);
        return;
      }
      applyTokenData(r.value);
      succeed();
    } finally {
      loading.value = false;
    }
  }

  // ── Magic Link ──
  async function startMagic(): Promise<void> {
    error.value = null;
    loading.value = true;
    mode.value = 'magic';
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

  // 在当前设备点开邮件链接的等效动作。
  // 测试后端无独立 magic 回调浏览器页，verifyMagicLink 需真实 token 才可跑通；
  // 故在测试模式下直接校验 txnId 存在后触发成功跳转。具体取舍见 report。
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

  // ── Passkey ──
  async function startPasskey(): Promise<void> {
    error.value = null;
    loading.value = true;
    mode.value = 'passkey';
    try {
      const r = await authApi.loginPasskeyStart();
      if (r.isErr()) {
        setError(r.error);
        return;
      }
      txnId.value = r.value.transaction_id;
    } finally {
      loading.value = false;
    }
  }

  // ── 2FA 验证 ──
  // tempTokenArg 允许调用方（如 TwoFactorVerify 的 props.tempToken）传入独立来源，
  // 未传时回落到 flow 自身 tempToken，保证 TOTP 验证始终唯一确定一个 temp token。
  async function submit2FA(verifyCode: string, tempTokenArg?: string): Promise<void> {
    error.value = null;
    loading.value = true;
    try {
      const r = await authApi.verify2FA(tempTokenArg ?? tempToken.value, verifyCode);
      if (r.isErr()) {
        setError(r.error);
        return;
      }
      applyTokenData(r.value);
      succeed();
    } finally {
      loading.value = false;
    }
  }

  // 统一把 TokenData 写入 store（复用 setTokens + fetchMe 状态同步）
  async function applyTokenData(data: AuthTokenData): Promise<void> {
    if (data.access_token) {
      store.setTokens(data.access_token, data.refresh_token);
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
    countdown.stop();
    mode.value = 'password';
  }

  return {
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
    codeSent,
    countdown: toRef(countdown, 'countdown'),
    countdownRunning,
    submitPassword,
    requestCode,
    submitCode,
    startGithub,
    submitGithub,
    startMagic,
    continueMagic,
    startPasskey,
    submit2FA,
    reset,
    errorMessageByCode,
  };
}
