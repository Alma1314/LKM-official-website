<script setup lang="ts">
import { watch } from 'vue';
import StarHopeLayout from './StarHopeLayout.vue';
import StarHopeRouter from './StarHopeRouter.vue';
import { useAuthStore } from '../stores/auth';
import { pullAll } from '../sync/sync';

const { isLoggedIn, restore } = useAuthStore();

// 恢复主站登录态，确保进入 StarHope 时已识别登录状态（否则 AuthGuard 会误判未登录）
restore();

watch(
  isLoggedIn,
  (loggedIn) => {
    if (loggedIn) void pullAll();
  },
  { immediate: true }
);
</script>

<template>
  <div class="starhope-app min-h-screen bg-page-bg text-default">
    <StarHopeLayout>
      <StarHopeRouter />
    </StarHopeLayout>
  </div>
</template>
