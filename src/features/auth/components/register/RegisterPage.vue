<template>
  <component
    :is="mode === 'modal' ? 'div' : AuthShell"
    :max-width="mode === 'modal' ? undefined : '440px'"
    :class="mode === 'modal' ? 'w-full' : undefined"
  >
    <AuthCard title="注册" subtitle="创建理科迷账号" :mode="mode">
      <!-- 状态提示 -->
      <AuthStatus v-if="flow.error" type="error" class="mb-4" :message="flow.error" />

      <!-- Docker / done -->
      <div v-if="flow.stage === 'done'" class="text-center space-y-4">
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
        <p class="text-xl font-semibold">注册成功</p>
        <a :href="getAuthPath('')" class="btn btn-primary btn-sm w-full">返回首页</a>
      </div>

      <template v-else>
        <!-- 注册方式切换 -->
        <AuthSegmentedControl
          :options="segmentedOptions"
          :model-value="flow.type"
          @update:model-value="flow.type = $event as RegisterType"
          class="mb-6"
        />

        <!-- 本地账户：纯字段子表单 -->
        <LocalRegister v-if="flow.type === 'local'" :flow="flow" />

        <!-- 普通账户：纯字段子表单 -->
        <NormalRegister v-else :flow="flow" />

        <!-- GitHub 注册（简化，未接入） -->
        <template v-if="flow.stage === 'form'">
          <div class="my-6 flex items-center gap-3">
            <div class="h-px flex-1 bg-[var(--surface-3)]"></div>
            <span class="text-xs text-text-muted">或者</span>
            <div class="h-px flex-1 bg-[var(--surface-3)]"></div>
          </div>
          <AuthMethodButton label="使用 GitHub 注册" :disabled="flow.loading" @click="handleGithub" />
        </template>

        <!-- 已有账号 -->
        <p class="mt-6 text-center text-[13px] text-text-muted">
          已有账号？
          <button type="button" class="text-primary font-semibold hover:underline" @click="switchToLogin">
            立即登录
          </button>
        </p>
      </template>
    </AuthCard>
  </component>
</template>

<script setup lang="ts">
import { useRegisterFlow, type RegisterType } from '~/features/auth/composables/useRegisterFlow';
import { getAuthPath } from '~/features/auth/constants/auth-paths';
import AuthShell from '../shared/AuthShell.vue';
import AuthCard from '../shared/AuthCard.vue';
import AuthSegmentedControl from '../shared/AuthSegmentedControl.vue';
import AuthStatus from '../shared/AuthStatus.vue';
import AuthMethodButton from '../shared/AuthMethodButton.vue';
import LocalRegister from './LocalRegister.vue';
import NormalRegister from './NormalRegister.vue';

withDefaults(defineProps<{ mode?: 'page' | 'modal' }>(), { mode: 'page' });

const redirectRaw = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') : null;

const flow = useRegisterFlow({
  redirect: redirectRaw || '/',
  onSuccess: (dst) => {
    window.dispatchEvent(new CustomEvent('close-auth-modal'));
    window.location.href = dst;
  },
});

const segmentedOptions = [
  { key: 'normal' as RegisterType, label: '普通账户' },
  { key: 'local' as RegisterType, label: '本地账户' },
];

function handleGithub() {
  alert('GitHub OAuth 注册暂未接入');
}

function switchToLogin() {
  window.dispatchEvent(new CustomEvent('close-auth-modal'));
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { view: 'login' } }));
  }, 150);
}
</script>
