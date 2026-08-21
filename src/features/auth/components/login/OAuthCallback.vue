<template>
  <div class="space-y-4 text-center">
    <AuthStatus v-if="error" type="error" :message="error" class="mb-4" />
    <div v-else class="flex flex-col items-center gap-3 py-6">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="text-sm text-text-muted">{{ t("auth.oauth.completing") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { t } from "~/lib/i18n";
import AuthStatus from "../shared/AuthStatus.vue";

/**
 * OAuth 回调处理页。
 *
 * 后端在 GitHub OAuth 成功后重定向到 `settings.frontend_callback`（如 /login/success），
 * 令牌放在 URL fragment（`#access_token=...`）中回传，避免进入 query/浏览器历史：
 *   - access_token / refresh_token：会话令牌
 *   - temp_token：若需 2FA 或首次设置
 *   - requires_2fa / setup_required：布尔标记
 *
 * 读取 fragment 后写入 auth store；若需 2FA 则持久化 temp_token 供后续验证。
 * 解析完随即清理 URL（含 hash），避免令牌留在地址栏/历史记录。
 */
const store = useAuthStore();
const error = ref<string | null>(null);

onMounted(() => {
  // 令牌在 #fragment 中。去除开头的 # 后按 query 语法解析。
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(raw);
  const token = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const tempToken = params.get("temp_token");
  const requires2FA =
    params.get("requires_2fa") === "1" || params.get("requires_2fa") === "true";
  const setupRequired =
    params.get("setup_required") === "1" ||
    params.get("setup_required") === "true";

  if (token) {
    store.setTokens(token, refreshToken ?? "");
  }
  if (requires2FA || setupRequired) {
    store.holdPending2FA(tempToken ?? null);
  }

  // 清理 URL 中的敏感参数，避免 token 留在地址栏/历史记录
  if (token || tempToken) {
    window.history.replaceState({}, "", window.location.pathname);
  }

  const finish = () => {
    window.dispatchEvent(new CustomEvent("close-auth-modal"));
  };

  // 有 token：立即同步用户并视为已登录（登录态持久化，刷新页面保持）
  if (token) {
    store
      .fetchMe()
      .then(() => {
        store.persistToStorage();
        finish();
        window.location.replace("/");
      })
      .catch(() => {
        finish();
        window.location.replace("/login");
      });
    return;
  }

  // 需 2FA：跳转登录页进入 2FA 验证
  if (requires2FA || setupRequired) {
    finish();
    window.location.replace("/login?2fa=1");
    return;
  }

  error.value = t("auth.oauth.failed");
});
</script>
