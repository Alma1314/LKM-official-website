<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">登录方式管理</h3>
    <div class="alert alert-info text-sm">设置功能正在接入后端，暂不可用</div>

    <div
      v-for="method in methods"
      :key="method.key"
      class="flex items-center justify-between p-3 bg-page-bg rounded-lg"
    >
      <div>
        <span class="font-medium">{{ method.label }}</span>
        <span class="text-xs text-text-muted ml-2">{{ method.detail }}</span>
        <span class="badge badge-xs ml-2" :class="method.bound ? 'badge-success' : 'badge-ghost'">
          {{ method.bound ? '已绑定' : '未绑定' }}
        </span>
      </div>
      <div class="flex gap-1">
        <button type="button" class="btn btn-ghost btn-xs" disabled>
          {{ method.bound ? '解绑' : '绑定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '~/types/auth';

defineEmits<{
  (e: 'update', user: User): void;
}>();

const props = defineProps<{
  user: User;
}>();

const methods = computed(() => [
  { key: 'email' as const, label: '邮箱', detail: props.user.email || '', bound: !!props.user.email },
  { key: 'phone' as const, label: '手机号', detail: props.user.phone || '', bound: !!props.user.phone },
  { key: 'github' as const, label: 'Github OAuth', detail: '', bound: false },
  { key: 'passkey' as const, label: 'Passkey 通行密钥', detail: '', bound: false },
]);
</script>
