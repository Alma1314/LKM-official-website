<template>
  <!-- Form step -->
  <form v-if="flow.stage === 'form'" @submit.prevent="flow.submit()" class="space-y-4">
    <p class="text-sm text-text-muted text-center">
      仅需用户名 + {{ flow.useEmail ? '邮箱' : '手机号' }}，验证后即可注册
    </p>
    <AuthField
      id="reg-normal-user"
      label="用户名"
      placeholder="请输入用户名（至少3位）"
      autocomplete="username"
      v-model="flow.username"
    />
    <AuthField
      id="reg-normal-password"
      label="密码"
      type="password"
      placeholder="请输入密码（至少6位）"
      autocomplete="new-password"
      v-model="flow.password"
    />
    <AuthField
      id="reg-normal-confirm"
      label="确认密码"
      type="password"
      placeholder="再次输入密码（至少6位）"
      autocomplete="new-password"
      v-model="flow.confirm"
    />
    <div class="flex gap-2">
      <button
        type="button"
        class="btn btn-xs"
        :class="flow.useEmail ? 'btn-primary' : 'btn-ghost'"
        @click="flow.useEmail = true"
      >
        使用邮箱
      </button>
      <button
        type="button"
        class="btn btn-xs"
        :class="!flow.useEmail ? 'btn-primary' : 'btn-ghost'"
        @click="flow.useEmail = false"
      >
        使用手机号
      </button>
    </div>
    <AuthField
      :id="flow.useEmail ? 'reg-normal-email' : 'reg-normal-phone'"
      :label="flow.useEmail ? '邮箱' : '手机号'"
      :type="flow.useEmail ? 'email' : 'tel'"
      :placeholder="flow.useEmail ? '请输入邮箱地址' : '请输入手机号'"
      :autocomplete="flow.useEmail ? 'email' : 'tel'"
      v-model="flow.contact"
    />
    <AuthStatus v-if="flow.error" type="error" :message="flow.error" />
    <button
      type="submit"
      class="btn btn-primary w-full active:scale-[0.98] transition-transform"
      :disabled="flow.loading"
    >
      <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
      <span v-else>发送验证码</span>
    </button>
  </form>

  <!-- Verify step -->
  <form v-else-if="flow.stage === 'verify'" @submit.prevent="flow.submitCode()" class="space-y-4">
    <p class="text-sm text-text-muted text-center">验证码已发送至 {{ flow.useEmail ? '邮箱' : '手机号' }}</p>
    <AuthField
      id="reg-verify"
      label="验证码"
      placeholder="请输入验证码"
      autocomplete="one-time-code"
      v-model="flow.code"
    />
    <AuthStatus v-if="flow.error" type="error" :message="flow.error" />
    <button
      type="submit"
      class="btn btn-primary w-full active:scale-[0.98] transition-transform"
      :disabled="flow.loading || flow.code.length < 1"
    >
      <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
      <span v-else>验证并完成注册</span>
    </button>
    <button type="button" class="btn btn-ghost w-full btn-sm" @click="flow.reset()">返回修改</button>
  </form>
</template>

<script setup lang="ts">
import type { RegisterFlow } from '~/features/auth/composables/useRegisterFlow';
import AuthField from '../shared/AuthField.vue';
import AuthStatus from '../shared/AuthStatus.vue';

defineProps<{ flow: RegisterFlow }>();
</script>
