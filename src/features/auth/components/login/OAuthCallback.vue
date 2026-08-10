<template>
  <div class="space-y-4 text-center">
    <AuthStatus v-if="error" type="error" :message="error" class="mb-4" />
    <div v-else class="flex flex-col items-center gap-3 py-6">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="text-sm text-text-muted">正在完成第三方登录…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import AuthStatus from '../shared/AuthStatus.vue';

/**
 * OAuth 回调处理页。
 *
 * 后端在 GitHub OAuth 成功后（需后端将回调改为重定向，见后端缺口清单 1）携带如下参数跳转到
 * `settings.frontend_callback`（如 /login/success）：
 *   - token / refresh_token：会话令牌
 *   - temp_token：若需 2FA 或首次设置
 *   - requires_2fa / setup_required：布尔标记
 *
 * 读取后写入 auth store；若需 2FA 则持久化 temp_token 供后续验证。
 */
const store = useAuthStore();
const error = ref<string | null>(null);

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const tempToken = params.get('temp_token');
  const requires2FA = params.get('requires_2fa') === '1' || params.get('requires_2fa') === 'true';
  const setupRequired = params.get('setup_required') === '1' || params.get('setup_required') === 'true';

  if (token) {
    store.setTokens(token, refreshToken ?? '');
  }
  if (requires2FA || setupRequired) {
    store.holdPending2FA(tempToken ?? null);
  }

  // 清理 URL 中的敏感参数，避免 token 留在地址栏/历史记录
  if (token || tempToken) {
    window.history.replaceState({}, '', window.location.pathname);
  }

  const finish = () => {
    window.dispatchEvent(new CustomEvent('close-auth-modal'));
  };

  // 有 token：立即同步用户并视为已登录
  if (token) {
    store
      .fetchMe()
      .then(() => {
        finish();
        window.location.replace('/');
      })
      .catch(() => {
        finish();
        window.location.replace('/login');
      });
    return;
  }

  // 需 2FA：跳转登录页进入 2FA 验证
  if (requires2FA || setupRequired) {
    finish();
    window.location.replace('/login?2fa=1');
    return;
  }

  error.value = '第三方登录未能完成，请重试';
});
</script>
