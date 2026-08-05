<template>
  <div v-if="!auth.state.isLoggedIn" class="flex items-center justify-center min-h-[40vh]">
    <div class="text-center">
      <h2 class="text-xl font-semibold text-deep-text mb-2">请先登录</h2>
      <p class="text-text-muted mb-4">访问此页面需要登录</p>
      <a :href="getAuthPath('login')" class="btn btn-primary">前往登录</a>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/useAuth';
import { getAuthPath } from '~/features/auth/constants/auth-paths';

const auth = useAuth();
</script>
