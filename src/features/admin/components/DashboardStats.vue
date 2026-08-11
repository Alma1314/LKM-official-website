<script setup lang="ts">
// 后台仪表盘统计 —— 接真实后端 GET /admin/stats
import { ref, onMounted } from 'vue';
import { adminFetch, readAdminResp } from '~/lib/api/admin';

interface AdminStats {
  user_count: number;
  post_count: number;
  file_count: number;
  file_pending_count: number;
}

const stats = ref<AdminStats | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const res = await adminFetch('/api/v1/admin/stats');
    const body = await readAdminResp(res);
    stats.value = body.data as AdminStats;
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <div v-if="error" class="text-sm text-red-500 mb-4">{{ error }}</div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="bg-card-bg border border-surface-3 rounded-xl p-5 animate-pulse h-24" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-card-bg border border-surface-3 rounded-xl p-5">
        <div class="text-2xl font-bold text-deep-text">{{ stats?.user_count ?? 0 }}</div>
        <div class="text-sm text-text-muted">注册用户</div>
      </div>
      <div class="bg-card-bg border border-surface-3 rounded-xl p-5">
        <div class="text-2xl font-bold text-deep-text">{{ stats?.post_count ?? 0 }}</div>
        <div class="text-sm text-text-muted">帖子总数</div>
      </div>
      <div class="bg-card-bg border border-surface-3 rounded-xl p-5">
        <div class="text-2xl font-bold text-deep-text">{{ stats?.file_count ?? 0 }}</div>
        <div class="text-sm text-text-muted">文件总数</div>
      </div>
      <div class="bg-card-bg border border-surface-3 rounded-xl p-5">
        <div class="text-2xl font-bold text-yellow-500">{{ stats?.file_pending_count ?? 0 }}</div>
        <div class="text-sm text-text-muted">待审核文件</div>
      </div>
    </div>
  </div>
</template>
