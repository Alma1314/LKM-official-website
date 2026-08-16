<template>
  <div
    v-if="store.session === 'restoring'"
    class="flex items-center justify-center min-h-[40vh]"
  >
    <span class="loading loading-spinner loading-lg"></span>
  </div>
  <div
    v-else-if="!store.isLoggedIn"
    class="flex items-center justify-center min-h-[40vh]"
  >
    <div class="text-center">
      <h2 class="text-xl font-semibold text-deep-text mb-2">
        {{ t("settings.loginRequired") }}
      </h2>
      <p class="text-text-muted mb-4">{{ t("settings.loginRequiredHint") }}</p>
      <a :href="getAuthPath('login')" class="btn btn-primary">{{
        t("settings.goLogin")
      }}</a>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { getAuthPath } from "~/features/auth/constants/auth-paths";
import { t } from "~/lib/i18n";

const store = useAuthStore();

onMounted(() => {
  // 覆盖「恢复中 + 未登录」场景：进入受保护页面时校验本地持久化会话
  if (!store.isLoggedIn && store.session !== "restoring") {
    void store.restoreAndValidate();
  }
});
</script>
