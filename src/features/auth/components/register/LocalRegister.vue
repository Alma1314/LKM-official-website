<template>
  <form v-if="flow.stage === 'form'" @submit.prevent="flow.submit()" class="space-y-4">
    <p class="text-sm text-text-muted text-center">仅用户名 + 密码，无需绑定邮箱/手机</p>
    <AuthField
      id="reg-local-username"
      label="用户名"
      placeholder="请输入用户名（至少3位）"
      autocomplete="username"
      v-model="flow.username"
    />
    <AuthField
      id="reg-local-password"
      label="密码"
      type="password"
      placeholder="请输入密码（至少6位）"
      autocomplete="new-password"
      v-model="flow.password"
    />
    <AuthField
      id="reg-local-confirm"
      label="确认密码"
      type="password"
      placeholder="再次输入密码（至少6位）"
      autocomplete="new-password"
      v-model="flow.confirm"
    />
    <AuthStatus v-if="flow.error" type="error" :message="flow.error" />
    <button
      type="submit"
      class="btn btn-primary w-full active:scale-[0.98] transition-transform"
      :disabled="flow.loading"
    >
      <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
      <span v-else>注册本地账户</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import type { RegisterFlow } from '~/features/auth/composables/useRegisterFlow';
import AuthField from '../shared/AuthField.vue';
import AuthStatus from '../shared/AuthStatus.vue';

defineProps<{ flow: RegisterFlow }>();
</script>
