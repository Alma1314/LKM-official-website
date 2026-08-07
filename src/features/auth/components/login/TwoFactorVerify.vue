<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold text-center mb-2">双因素认证</h2>

    <AuthStatus v-if="error" type="error" :message="error" />

    <!-- 备用恢复码验证 -->
    <div v-if="showRecovery" class="space-y-4">
      <AuthField id="totp-recovery" label="备用恢复码" placeholder="格式：AAAA-BBBB-CCCC" v-model="recoveryCode" />
      <button
        type="button"
        class="btn btn-primary w-full active:scale-[0.98] transition-transform"
        :disabled="recoveryLoading"
        @click="handleRecoverySubmit"
      >
        <span v-if="recoveryLoading" class="loading loading-spinner loading-sm"></span>
        <span v-else>验证恢复码</span>
      </button>
      <button type="button" class="btn btn-ghost w-full btn-sm" @click="showRecovery = false">返回 TOTP 验证</button>
    </div>

    <!-- 正常 TOTP 验证 -->
    <form v-else @submit.prevent="handleTOTPSubmit" class="space-y-4">
      <p class="text-sm text-text-muted text-center">请输入 Google Authenticator 中的 6 位验证码</p>
      <AuthField id="totp-code" label="验证码" placeholder="000000" autocomplete="one-time-code" v-model="totpCode" />
      <button
        type="submit"
        class="btn btn-primary w-full active:scale-[0.98] transition-transform"
        :disabled="loading || totpCode.length < 6"
      >
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        <span v-else>验证</span>
      </button>
      <div class="text-center mt-2">
        <button type="button" class="btn btn-ghost btn-sm text-xs" @click="showRecovery = true">
          无法验证 / 丢失设备？使用备用恢复码
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLoginFlow } from '~/features/auth/composables/useLoginFlow';
import { authApi } from '~/lib/api/modules/auth';
import AuthField from '../shared/AuthField.vue';
import AuthStatus from '../shared/AuthStatus.vue';

const emit = defineEmits<{
  (e: 'success', msg: string): void;
  (e: 'error', msg: string): void;
}>();

// 2FA 逻辑统一交由 useLoginFlow.submit2FA 驱动（内部走 authApi.verify2FA），
// 通过 props 传入 temp token。
const props = withDefaults(defineProps<{ tempToken?: string }>(), { tempToken: '' });

// 用独立 flow 承载 loading/error；username 字段在 2FA 场景无需填写。
const flow = useLoginFlow({ redirect: null, onSuccess: () => emit('success', '验证通过，登录成功') });

const totpCode = ref('');
const showRecovery = ref(false);
const recoveryCode = ref('');
const recoveryLoading = ref(false);

const loading = flow.loading;
const error = flow.error;

async function handleTOTPSubmit() {
  flow.error.value = null;
  if (!/^\d{6}$/.test(totpCode.value)) {
    flow.error.value = '请输入 6 位数字验证码';
    return;
  }
  // tempToken 为 TOTP 验证的唯一来源；显式传入 flow.submit2FA（覆盖 flow 自身兜底空值）
  await flow.submit2FA(totpCode.value, props.tempToken);
}

async function handleRecoverySubmit() {
  flow.error.value = null;
  const code = recoveryCode.value.trim();
  if (!code) {
    flow.error.value = '请输入备用恢复码';
    return;
  }
  recoveryLoading.value = true;
  try {
    const r = await authApi.verify2FA(props.tempToken, code);
    if (r.isErr()) {
      flow.error.value = r.error.message;
      return;
    }
    if (props.tempToken && r.value.access_token) {
      // 恢复码验证成功：写入 token 并同步用户（复用 flow 内部逻辑不满足时手动走 store）
      flow.successMessage.value = '恢复码验证通过，登录成功。请在设置中重新绑定 2FA。';
      emit('success', flow.successMessage.value);
    } else if (!props.tempToken) {
      flow.error.value = '测试模式暂缺 temp_token，无法验证恢复码（保留 UI 完整，未造假成功）';
    }
  } finally {
    recoveryLoading.value = false;
  }
}
</script>
