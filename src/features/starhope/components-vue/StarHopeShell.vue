<script setup lang="ts">
import { watch } from 'vue';
import StarHopeLayout from './StarHopeLayout.vue';
import StarHopeRouter from './StarHopeRouter.vue';
import { useAuthStore } from '../stores-vue/auth';
import { pullAll } from '../sync/sync';

const { isLoggedIn } = useAuthStore();

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
