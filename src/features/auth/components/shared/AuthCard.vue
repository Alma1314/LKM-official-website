<template>
  <section class="card-base relative w-full p-6 sm:p-8" :class="{ 'rounded-2xl': mode === 'page' }" role="group">
    <!-- 标题区 -->
    <header v-if="title || subtitle" class="mb-6">
      <h2 v-if="title" class="text-xl font-semibold text-deep-text leading-tight">{{ title }}</h2>
      <p v-if="subtitle" class="mt-1 text-sm text-text-muted">{{ subtitle }}</p>
    </header>

    <!-- 内容区（右上角 modal 关闭按钮由 AuthModal 负责，本组件不渲染） -->
    <div class="w-full">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    mode?: 'page' | 'modal';
  }>(),
  { mode: 'page' }
);
</script>
