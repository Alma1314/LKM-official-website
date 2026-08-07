import { reactive, ref, toRef } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { resolveSafeRedirect } from '~/features/auth/utils/safe-redirect';
import { useVerificationCountdown } from './useVerificationCountdown';

export type RegisterType = 'normal' | 'local';
export type RegisterStage = 'form' | 'verify' | 'done';

export interface RegisterFlowOptions {
  redirect?: string | null;
  onSuccess?: (dst: string) => void;
}

export interface RegisterFlow {
  // state —— reactive 包裹的 ref 已解包，模板里直接 flow.username=…
  type: RegisterType;
  username: string;
  password: string;
  confirm: string;
  contact: string;
  useEmail: boolean;
  code: string;
  txnId: string;
  stage: RegisterStage;
  loading: boolean;
  error: string | null;
  countdown: number;
  countdownRunning: boolean;
  // methods
  submit: () => Promise<void>;
  submitCode: () => Promise<void>;
  reset: () => void;
  hasAgreedTerms: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 注册流程 Composable。
 *
 * 统一驱动本地 / 普通账户注册，复用 AuthStore 的 registerLocal / registerNormal /
 * verifyNormalRegister。**本地注册一律使用用户填写的密码，绝不生成随机密码。**
 * 普通账户注册成功进入 verify 步（提交验证码），成功后跳转统一走 resolveSafeRedirect。
 */
export function useRegisterFlow(options: RegisterFlowOptions = {}): RegisterFlow {
  const store = useAuthStore();
  const { redirect = null, onSuccess } = options;

  // ── State ──
  const type = ref<RegisterType>('normal');
  const username = ref('');
  const password = ref('');
  const confirm = ref('');
  const contact = ref('');
  const useEmail = ref(true);
  const code = ref('');
  const txnId = ref('');
  const stage = ref<RegisterStage>('form');
  const loading = ref(false);
  const error = ref<string | null>(null);
  const countdown = useVerificationCountdown(60);
  const countdownRunning = toRef(countdown, 'running');

  // 项目当前无真实可访问的 terms 页面（src/pages 下无 terms.*），故不提供该勾选，
  // 避免指向无效链接。见 task-7-report.md 依据。
  const hasAgreedTerms = ref(false);

  // ── 帮助 ──
  function fail(msg?: string): void {
    error.value = msg ?? '操作失败，请重试';
  }

  function succeed(): void {
    error.value = null;
    const dst = resolveSafeRedirect(redirect);
    if (typeof onSuccess === 'function') onSuccess(dst);
  }

  // ── 提交注册 ──
  async function submit(): Promise<void> {
    error.value = null;

    // 校验
    if (username.value.trim().length < 3) return fail('用户名至少 3 个字符');
    if (password.value.length < 6) return fail('密码长度不能少于 6 位');
    if (password.value !== confirm.value) return fail('两次输入的密码不一致');
    if (type.value === 'normal') {
      const contactValue = contact.value.trim();
      if (!contactValue) return fail(useEmail.value ? '请输入邮箱' : '请输入手机号');
      if (useEmail.value && !EMAIL_RE.test(contactValue)) return fail('请输入有效的邮箱地址');
    }

    loading.value = true;
    try {
      if (type.value === 'local') {
        // 本地注册：使用用户输入的密码，绝无随机生成
        const r = await store.registerLocal(username.value.trim(), password.value);
        if (r.isErr()) return fail(r.error.message);
        stage.value = 'done';
        succeed();
        return;
      }

      // 普通账户：发送验证码，进入 verify 步
      const email = useEmail.value ? contact.value.trim() : null;
      const phone = !useEmail.value ? contact.value.trim() : null;
      const r = await store.registerNormal(
        username.value.trim(),
        password.value,
        email ?? undefined,
        phone ?? undefined
      );
      if (r.isErr()) return fail(r.error.message);
      txnId.value = r.value.txn_id;
      stage.value = 'verify';
      countdown.start();
    } finally {
      loading.value = false;
    }
  }

  // ── 提交验证码 ──
  async function submitCode(): Promise<void> {
    error.value = null;
    if (!txnId.value) return fail('注册会话已失效，请重新提交');
    if (code.value.length < 1) return fail('请输入验证码');

    loading.value = true;
    try {
      const r = await store.verifyNormalRegister(txnId.value, code.value, useEmail.value ? 'email' : 'phone');
      if (r.isErr()) return fail(r.error.message);
      stage.value = 'done';
      succeed();
    } finally {
      loading.value = false;
    }
  }

  // ── 重置 ──
  function reset(): void {
    stage.value = 'form';
    username.value = '';
    password.value = '';
    confirm.value = '';
    contact.value = '';
    code.value = '';
    txnId.value = '';
    loading.value = false;
    error.value = null;
    countdown.stop();
    countdownRunning.value = false;
  }

  // reactive 包裹使 ref 解包（与 useLoginFlow 一致），模板里即值类型，消除 TS2367 误报
  return reactive({
    type,
    username,
    password,
    confirm,
    contact,
    useEmail,
    code,
    txnId,
    stage,
    loading,
    error,
    countdown: toRef(countdown, 'countdown'),
    countdownRunning,
    submit,
    submitCode,
    reset,
    hasAgreedTerms,
  });
}
