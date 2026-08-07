<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
        {{ avatarLetter }}
      </div>
      <div>
        <div class="text-lg font-semibold">{{ user?.nickname || user?.username }}</div>
        <div class="text-sm text-text-muted">@{{ user?.username }}</div>
        <span class="badge badge-sm mt-1" :class="levelBadgeClass">{{ levelLabel }}</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8 text-text-muted">加载中...</div>

    <template v-else-if="user">
      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div class="rounded-lg bg-page-bg p-4 text-center">
          <div class="text-2xl font-bold text-primary">-</div>
          <div class="text-xs text-text-muted mt-1">帖子</div>
        </div>
        <div class="rounded-lg bg-page-bg p-4 text-center">
          <div class="text-2xl font-bold text-primary">-</div>
          <div class="text-xs text-text-muted mt-1">项目</div>
        </div>
        <div class="rounded-lg bg-page-bg p-4 text-center">
          <div class="text-2xl font-bold text-primary">-</div>
          <div class="text-xs text-text-muted mt-1">专栏</div>
        </div>
      </div>

      <!-- Info -->
      <div class="rounded-xl border border-surface-3 p-5 space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-text-muted">账户等级</span>
          <span class="badge badge-sm" :class="levelBadgeClass">{{ levelLabel }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-text-muted">角色</span>
          <span>{{ user.role || 'member' }}</span>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-8 text-text-muted">
      用户不存在
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { User } from '~/types/auth';

const props = defineProps<{ username: string }>();

const user = ref<User | null>(null);
const loading = ref(true);

const avatarLetter = computed(() =>
  (user.value?.nickname || user.value?.username || '?').charAt(0).toUpperCase()
);

const levelBadgeClass = computed(() => {
  const level = user.value?.account_level;
  return level === 'admin' ? 'badge-error' : level === 'normal' ? 'badge-primary' : 'badge-ghost';
});
const levelLabel = computed(() => {
  const level = user.value?.account_level;
  return level === 'admin' ? '管理员' : level === 'normal' ? '普通账户' : '本地账户';
});

onMounted(async () => {
  try {
    const res = await fetch(`/api/auth/user/by-username/${props.username}`);
    if (res.ok) {
      const json = await res.json();
      if (json.code === 0 && json.data) {
        user.value = {
          ...json.data,
          username: props.username,
          account_level: json.data.account_level || 'local',
        };
      }
    }
  } catch {
    // ignore
  }
  loading.value = false;
});
</script>
