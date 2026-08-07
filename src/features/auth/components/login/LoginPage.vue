<template>
  <component
    :is="mode === 'modal' ? 'div' : AuthShell"
    :max-width="mode === 'modal' ? undefined : '440px'"
    :class="mode === 'modal' ? 'w-full' : undefined"
  >
    <AuthCard
      :title="flow.loggedIn ? '登录成功' : flow.mode === '2fa' ? '双因素认证' : '登录'"
      subtitle="登录理科迷账号，访问社区资源与文档"
      :test-mode="testMode"
      :mode="mode"
    >
      <!-- 登录成功态：停留在登录卡片，不自动跳转 -->
      <div v-if="flow.loggedIn" class="text-center space-y-4 py-4">
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
        <p class="text-sm text-text-muted">
          欢迎回来，<span class="font-semibold text-deep-text">{{ flow.account || '用户' }}</span>
        </p>
      </div>

      <!-- 未登录：登录方式切换等 -->
      <template v-else>
        <!-- 登录方式切换 -->
        <AuthSegmentedControl
          v-if="flow.mode === 'password' || flow.mode === 'code'"
          :options="segmentedOptions"
          :model-value="flow.mode"
          @update:model-value="flow.mode = $event as LoginMode"
          class="mb-6"
        />

        <!-- 状态提示 -->
        <AuthStatus v-if="flow.error" type="error" class="mb-4" :message="flow.error" />
        <AuthStatus v-else-if="flow.successMessage" type="success" class="mb-4" :message="flow.successMessage" />

        <!-- 密码登录 -->
        <form v-if="flow.mode === 'password'" class="space-y-4" @submit.prevent="flow.submitPassword()">
          <AuthField
            label="用户名 / 邮箱 / 手机号"
            placeholder="请输入用户名、邮箱或手机号"
            autocomplete="username"
            v-model="flow.account"
          />
          <AuthField
            label="密码"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            v-model="flow.password"
          />
          <div class="flex justify-end">
            <a :href="getAuthPath('account/recovery')" class="text-sm text-primary font-semibold hover:underline">
              忘记密码？
            </a>
          </div>
          <button
            type="submit"
            class="btn btn-primary w-full active:scale-[0.98] transition-transform"
            :disabled="flow.loading"
          >
            <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>登录</span>
          </button>
        </form>

        <!-- 验证码登录 -->
        <form v-else-if="flow.mode === 'code'" class="space-y-4" @submit.prevent="flow.submitCode()">
          <AuthField label="邮箱 / 手机号" placeholder="请输入接收验证码的账号" v-model="flow.account" />
          <div>
            <VerificationCodeField id="login-code" v-model="flow.code" :error="flow.error ?? undefined" />
          </div>
          <button
            type="button"
            class="btn btn-outline w-full"
            :disabled="flow.countdownRunning || flow.loading"
            @click="flow.requestCode()"
          >
            <span v-if="!flow.countdownRunning">获取验证码</span>
            <span v-else>{{ flow.countdown }}s 后重新获取</span>
          </button>
          <button
            type="submit"
            class="btn btn-primary w-full active:scale-[0.98] transition-transform"
            :disabled="flow.loading || flow.code.length < 6"
          >
            <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>登录</span>
          </button>
        </form>

        <!-- 其他登录方式 -->
        <template v-if="flow.mode === 'password' || flow.mode === 'code'">
          <div class="my-6 flex items-center gap-3">
            <div class="h-px flex-1 bg-[var(--surface-3)]"></div>
            <span class="text-xs text-text-muted">其他登录方式</span>
            <div class="h-px flex-1 bg-[var(--surface-3)]"></div>
          </div>
          <div class="space-y-3">
            <AuthMethodButton label="使用 GitHub 登录" @click="flow.startGithub()" :disabled="flow.loading" />
            <AuthMethodButton label="Magic Link 登录" @click="flow.startMagic()" :disabled="flow.loading" />
            <AuthMethodButton label="Passkey 通行密钥" @click="flow.startPasskey()" :disabled="flow.loading" />
          </div>
        </template>

        <!-- Magic 态：发送后提示 + 在当前设备继续 -->
        <div v-else-if="flow.mode === 'magic'" class="space-y-4">
          <AuthStatus v-if="flow.magicSent" type="info" message="Magic Link 已发送，请查收邮箱" />
          <p class="text-sm text-text-muted">没有收到邮件？可重试发送，或换用其他登录方式。</p>
          <button type="button" class="btn btn-outline w-full" :disabled="flow.loading" @click="flow.continueMagic()">
            <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>在当前设备继续</span>
          </button>
          <button type="button" class="btn btn-ghost btn-sm w-full" @click="flow.reset()">返回登录</button>
        </div>

        <!-- GitHub 态：模拟授权 -->
        <div v-else-if="flow.mode === 'github'" class="space-y-4">
          <AuthStatus v-if="!flow.loading" type="info" message="正在通过 GitHub 登录…" />
          <button type="button" class="btn btn-outline w-full" :disabled="flow.loading" @click="flow.submitGithub()">
            <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>完成模拟授权</span>
          </button>
          <button type="button" class="btn btn-ghost btn-sm w-full" @click="flow.reset()">返回登录</button>
        </div>

        <!-- Passkey 态 -->
        <div v-else-if="flow.mode === 'passkey'" class="space-y-4">
          <AuthStatus v-if="!flow.loading" type="info" message="正在进行 Passkey 通行密钥验证…" />
          <button type="button" class="btn btn-outline w-full" disabled>等待设备验证</button>
          <button type="button" class="btn btn-ghost btn-sm w-full" @click="flow.reset()">返回登录</button>
        </div>

        <!-- 2FA 态 -->
        <form v-else-if="flow.mode === '2fa'" class="space-y-4" @submit.prevent="flow.submit2FA(flow.code)">
          <VerificationCodeField id="login-2fa" v-model="flow.code" :error="flow.error ?? undefined" />
          <button
            type="submit"
            class="btn btn-primary w-full active:scale-[0.98] transition-transform"
            :disabled="flow.loading"
          >
            <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>验证</span>
          </button>
          <button type="button" class="btn btn-ghost btn-sm w-full" @click="flow.reset()">返回登录</button>
        </form>

        <!-- 底部注册入口 -->
        <p class="mt-6 text-center text-[13px] text-text-muted">
          没有账号？
          <button type="button" class="text-primary font-semibold hover:underline" @click="switchToRegister">
            立即注册
          </button>
        </p>
      </template>
    </AuthCard>
  </component>
</template>

<script setup lang="ts">
import { useLoginFlow, type LoginMode } from '~/features/auth/composables/useLoginFlow';
import { getAuthPath } from '~/features/auth/constants/auth-paths';
import AuthShell from '../shared/AuthShell.vue';
import AuthCard from '../shared/AuthCard.vue';
import AuthSegmentedControl from '../shared/AuthSegmentedControl.vue';
import AuthField from '../shared/AuthField.vue';
import AuthStatus from '../shared/AuthStatus.vue';
import AuthMethodButton from '../shared/AuthMethodButton.vue';
import VerificationCodeField from '../shared/VerificationCodeField.vue';

withDefaults(defineProps<{ mode?: 'page' | 'modal' }>(), { mode: 'page' });

const testMode = import.meta.env.PUBLIC_AUTH_TEST_MODE === 'true';

const flow = useLoginFlow({
  // 登录成功后在卡片内显示「登录成功」，不自动跳转（flow.loggedIn 驱动成功视图）
  redirect: '',
  onSuccess: () => {
    // 不导航、不关闭：由 flow.loggedIn 切换到成功画面
  },
});

const segmentedOptions = [
  { key: 'password', label: '密码登录' },
  { key: 'code', label: '验证码登录' },
];

function switchToRegister() {
  window.dispatchEvent(new CustomEvent('close-auth-modal'));
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { view: 'register' } }));
  }, 150);
}
</script>
