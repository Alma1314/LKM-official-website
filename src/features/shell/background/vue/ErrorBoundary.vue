<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const hasError = ref(false);
const error = ref<Error | null>(null);

onErrorCaptured((err: Error) => {
  hasError.value = true;
  error.value = err;
  return false;
});

function handleRetry() {
  hasError.value = false;
  error.value = null;
}
</script>

<template>
  <div v-if="hasError" class="fixed inset-0 flex items-center justify-center z-10">
    <div class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md text-center">
      <p class="font-semibold text-red-600">组件加载失败</p>
      <p class="text-sm text-red-500 mt-1">{{ error?.message }}</p>
      <button @click="handleRetry" class="mt-3 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 rounded-lg text-sm">重试</button>
    </div>
  </div>
  <slot v-else />
</template>
