<template>
  <div>
    <AuthStatus v-if="flow.error" type="error" class="mb-4" :message="flow.error" />
    <AuthStatus v-else-if="flow.stage === 'verify'" type="info" class="mb-4" message="验证码已发送，请查收" />

    <!-- Step 1: account -->
    <form v-if="flow.stage === 'account'" @submit.prevent="flow.stepRequest()" class="space-y-4">
      <p class="text-sm text-text-muted text-center">输入注册时使用的账号以接收验证码</p>
      <AuthField
        id="recovery-account"
        label="账号"
        placeholder="请输入用户名、邮箱或手机号"
        autocomplete="username"
        v-model="flow.account"
      />
      <button
        type="submit"
        class="btn btn-primary w-full active:scale-[0.98] transition-transform"
        :disabled="flow.loading"
      >
        <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
        <span v-else>发送验证码</span>
      </button>
    </form>

    <!-- Step 2: verify code -->
    <form v-else-if="flow.stage === 'verify'" @submit.prevent="flow.stepVerify()" class="space-y-4">
      <AuthField
        id="recovery-code"
        label="验证码"
        placeholder="请输入验证码"
        autocomplete="one-time-code"
        v-model="flow.code"
      />
      <button
        type="submit"
        class="btn btn-primary w-full active:scale-[0.98] transition-transform"
        :disabled="flow.loading || flow.code.length < 1"
      >
        <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
        <span v-else>校验验证码</span>
      </button>
      <button type="button" class="btn btn-ghost w-full btn-sm" @click="flow.reset()">返回</button>
    </form>

    <!-- Step 3: reset password -->
    <form v-else-if="flow.stage === 'reset'" @submit.prevent="flow.stepReset()" class="space-y-4">
      <AuthField
        id="recovery-new"
        label="新密码"
        type="password"
        placeholder="请输入新密码（至少6位）"
        autocomplete="new-password"
        v-model="flow.newPassword"
      />
      <AuthField
        id="recovery-confirm"
        label="确认新密码"
        type="password"
        placeholder="再次输入新密码"
        autocomplete="new-password"
        v-model="flow.confirm"
      />
      <button
        type="submit"
        class="btn btn-primary w-full active:scale-[0.98] transition-transform"
        :disabled="flow.loading"
      >
        <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
        <span v-else>重置密码</span>
      </button>
      <button type="button" class="btn btn-ghost w-full btn-sm" @click="flow.reset()">返回</button>
    </form>

    <!-- Step 4: done -->
    <div v-else class="space-y-4 text-center">
      <div class="flex justify-center">
        <svg
          class="w-14 h-14 text-success"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <p class="text-xl font-semibold">密码已重置</p>
      <p class="text-sm text-text-muted">请使用新密码登录</p>
      <button type="button" class="btn btn-primary w-full" @click="emit('login')">去登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRecoveryFlow } from '~/features/auth/composables/useRecoveryFlow';
import AuthField from '../shared/AuthField.vue';
import AuthStatus from '../shared/AuthStatus.vue';

const emit = defineEmits<{ (e: 'login'): void }>();

const flow = useRecoveryFlow({
  onSuccess: () => {
    emit('login');
  },
});

defineExpose({ flow });
</script>
