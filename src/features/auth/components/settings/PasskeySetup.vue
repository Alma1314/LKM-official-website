<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">通行密钥 (Passkey)</h3>
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg">
      <div>
        <span class="font-medium">生物识别 / PIN 码</span>
        <span class="badge badge-xs ml-2 badge-ghost">暂不可用</span>
      </div>
      <button type="button" class="btn btn-ghost btn-xs" disabled>创建</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types/auth';

defineEmits<{
  (e: 'update', user: User): void;
}>();

defineProps<{
  user: User;
}>();
</script>
