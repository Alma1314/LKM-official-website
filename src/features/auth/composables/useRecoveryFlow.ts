import { ref, type Ref } from 'vue';
import { authApi } from '~/lib/api/modules/auth';

export type RecoveryStage = 'account' | 'verify' | 'reset' | 'done';

export interface RecoveryFlowOptions {
  onSuccess?: (msg: string) => void;
}

export interface RecoveryFlow {
  // state
  stage: Ref<RecoveryStage>;
  account: Ref<string>;
  txnId: Ref<string>;
  code: Ref<string>;
  newPassword: Ref<string>;
  confirm: Ref<string>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  // methods
  stepRequest: () => Promise<void>;
  stepVerify: () => Promise<void>;
  stepReset: () => Promise<void>;
  reset: () => void;
}

/**
 * 找回密码 Composable。
 *
 * 承载四步：account→verify→reset→done。均复用 authApi 的 recovery 系列方法
 * （recoveryRequest / recoveryVerify / recoveryReset）。request 步签发挑战并回传
 * transaction_id；verify 步凭 txn+code 仅校验验证码（不改密）；校验通过后进入
 * reset 步，reset 步凭同一 txn 消费挑战并真正重置密码，随后进入 done。
 */
export function useRecoveryFlow(options: RecoveryFlowOptions = {}): RecoveryFlow {
  const { onSuccess } = options;

  // ── State ──
  const stage = ref<RecoveryStage>('account');
  const account = ref('');
  const txnId = ref('');
  const code = ref('');
  const newPassword = ref('');
  const confirm = ref('');
  const loading = ref(false);
  const error = ref<string | null>(null);

  function fail(msg?: string): void {
    error.value = msg ?? '操作失败，请重试';
  }

  // ── Step 1: 提交账号，请求验证码 ──
  async function stepRequest(): Promise<void> {
    error.value = null;
    if (!account.value.trim()) return fail('请输入注册时使用的账号');
    loading.value = true;
    try {
      const r = await authApi.recoveryRequest(account.value.trim());
      if (r.isErr()) return fail(r.error.message);
      // verify/reset 步均以后端签发的 transaction_id 关联挑战（与账号解耦）。
      txnId.value = r.value.transaction_id;
      stage.value = 'verify';
    } finally {
      loading.value = false;
    }
  }

  // ── Step 2: 校验验证码，进入重置步 ──
  async function stepVerify(): Promise<void> {
    error.value = null;
    if (!code.value.trim()) return fail('请输入验证码');
    loading.value = true;
    try {
      const r = await authApi.recoveryVerify(txnId.value, code.value.trim());
      if (r.isErr()) return fail(r.error.message);
      // 校验通过，进入设置新密码步（verify 仅校验验证码，不改密）
      stage.value = 'reset';
    } finally {
      loading.value = false;
    }
  }

  // ── Step 3: 重置密码 ← 真正改密 ──
  async function stepReset(): Promise<void> {
    error.value = null;
    if (newPassword.value.length < 6) return fail('密码长度不能少于 6 位');
    if (newPassword.value !== confirm.value) return fail('两次输入的密码不一致');
    loading.value = true;
    try {
      const r = await authApi.recoveryReset(txnId.value, code.value.trim(), newPassword.value);
      if (r.isErr()) return fail(r.error.message);
      stage.value = 'done';
      if (typeof onSuccess === 'function') onSuccess('密码已重置，请登录');
    } finally {
      loading.value = false;
    }
  }

  // ── 重置 ──
  function reset(): void {
    stage.value = 'account';
    account.value = '';
    txnId.value = '';
    code.value = '';
    newPassword.value = '';
    confirm.value = '';
    loading.value = false;
    error.value = null;
  }

  return {
    stage,
    account,
    txnId,
    code,
    newPassword,
    confirm,
    loading,
    error,
    stepRequest,
    stepVerify,
    stepReset,
    reset,
  };
}
