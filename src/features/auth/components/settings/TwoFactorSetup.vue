<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">双因素认证 (2FA)</h3>
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg">
      <div>
        <span class="font-medium">TOTP 动态验证码</span>
        <span class="badge badge-xs ml-2 badge-ghost">暂不可用</span>
      </div>
      <button type="button" class="btn btn-ghost btn-xs" disabled>开启</button>
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
