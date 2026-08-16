<template>
  <div class="flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
    <div class="w-full" :style="{ maxWidth: maxWidth }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    maxWidth?: string;
  }>(),
  { maxWidth: "440px" },
);
</script>
