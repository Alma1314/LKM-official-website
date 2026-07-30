<template>
  <div class="space-y-4 text-center">
    <p class="text-sm text-text-muted">通行密钥登录（当前为模拟模式）</p>
    <div class="rounded-xl border border-surface-3 bg-page-bg p-6 space-y-4">
      <div class="text-5xl">🔑</div>
      <p class="font-semibold text-deep-text">使用通行密钥登录</p>
      <p class="text-xs text-text-muted">通过设备的指纹、面容或 PIN 码进行认证</p>
      <div v-if="errorMsg" class="alert alert-error text-sm">{{ errorMsg }}</div>
      <button type="button" class="btn btn-primary" @click="handleClick" :disabled="loading">
        <template v-if="loading"> <span class="loading loading-spinner loading-xs"></span> 正在验证... </template>
        <template v-else>使用通行密钥</template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { LoginMethod } from '~/types/auth';

const emit = defineEmits<{
  (e: 'login', method: LoginMethod, credentials: Record<string, string>): void;
}>();

const loading = ref(false);
const errorMsg = ref('');

async function handleClick() {
  loading.value = true;
  errorMsg.value = '';
  await new Promise((r) => setTimeout(r, 1000));
  emit('login', 'passkey', {});
  loading.value = false;
}
</script>
