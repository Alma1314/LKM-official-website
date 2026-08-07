<template>
  <div class="space-y-6">
    <div v-if="loading" class="text-center py-8 text-text-muted">加载中...</div>

    <template v-else-if="user">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
          {{ avatarLetter }}
        </div>
        <div>
          <div class="text-lg font-semibold">{{ user.nickname || user.username }}</div>
          <div class="text-sm text-text-muted">@{{ user.username }}</div>
          <span class="badge badge-sm mt-1" :class="levelBadgeClass">{{ levelLabel }}</span>
        </div>
      </div>

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

    <div v-else class="text-center py-12 space-y-3">
      <div class="w-16 h-16 mx-auto rounded-full bg-surface-2 flex items-center justify-center text-2xl text-text-muted">
        {{ props.username?.charAt(0).toUpperCase() || '?' }}
      </div>
      <div class="text-lg font-semibold text-text-muted">@{{ props.username }}</div>
      <div class="text-sm text-text-muted">用户不存在或数据加载失败</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { User } from '~/types/auth';
import { authApi } from '~/lib/api';

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
  const result = await authApi.getUserByUsername(props.username);
  result.match(
    (data) => {
      user.value = {
        id: 0,
        username: props.username,
        nickname: data.nickname ?? null,
        avatar: data.avatar ?? null,
        role: data.role,
        account_level: data.account_level || 'local',
      } as User;
    },
    () => {
      // user stays null
    }
  );
  loading.value = false;
});
</script>
