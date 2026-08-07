<template>
  <div>
    <div class="text-center mb-6">
      <h1 class="text-3xl font-semibold mb-2">密码找回</h1>
      <p class="text-sm text-text-muted">重置您的登录密码</p>
    </div>

    <div v-if="errorMsg" class="alert alert-warning text-sm mb-4">{{ errorMsg }}</div>

    <div v-else class="space-y-4 text-center">
      <p class="text-sm text-text-muted">密码找回功能正在接入后端，暂不可用。</p>
      <p class="text-xs text-text-muted">如有需要，请联系管理员协助重置密码。</p>
    </div>

    <button type="button" class="btn btn-ghost btn-sm w-full mt-4" @click="switchToLogin">返回登录</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const errorMsg = ref('');

function switchToLogin() {
  window.dispatchEvent(new CustomEvent('close-auth-modal'));
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { view: 'login' } }));
  }, 150);
}
</script>
