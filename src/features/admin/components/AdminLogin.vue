<script setup lang="ts">
import { ref } from 'vue';
import { NForm, NFormItem, NInput, NButton, useMessage, NAlert } from 'naive-ui';
import { useAdminAuthStore } from '~/stores/adminAuth';

const auth = useAdminAuthStore();
const message = useMessage();

const username = ref('');
const password = ref('');
const submitting = ref(false);
const error = ref('');
const success = ref(false);

async function handleSubmit() {
  error.value = '';
  if (!username.value.trim() || !password.value) {
    error.value = '请输入用户名和密码';
    return;
  }
  submitting.value = true;
  try {
    await auth.login(username.value.trim(), password.value);
    success.value = true;
    message.success('登录成功');
    // 稍作停留展示成功态后跳回后台首页
    window.setTimeout(() => {
      window.location.href = '/admin';
    }, 600);
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-page-bg flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="bg-card-bg border border-surface-3 rounded-xl p-8 shadow-sm">
        <h1 class="text-xl font-bold text-deep-text text-center mb-1">管理后台</h1>
        <p class="text-sm text-text-muted text-center mb-6">管理员登录 · 理科迷</p>

        <NAlert v-if="error" type="error" :show-icon="false" class="mb-4">
          {{ error }}
        </NAlert>
        <NAlert v-else-if="success" type="success" :show-icon="false" class="mb-4">
          登录成功，正在进入后台…
        </NAlert>

        <NForm @submit.prevent="handleSubmit">
          <NFormItem label="用户名" class="mb-3">
            <NInput
              v-model:value="username"
              placeholder="请输入管理员用户名"
              size="large"
              :disabled="submitting"
              autocomplete="username"
            />
          </NFormItem>
          <NFormItem label="密码" class="mb-4">
            <NInput
              v-model:value="password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :disabled="submitting"
              autocomplete="current-password"
              show-password-on="click"
            />
          </NFormItem>
          <NButton type="primary" attr-type="submit" block size="large" :loading="submitting">
            登录
          </NButton>
        </NForm>

        <div class="mt-6 text-center">
          <a href="/" class="text-xs text-text-muted hover:text-primary transition-colors">← 返回前台</a>
        </div>
      </div>
    </div>
  </div>
</template>
