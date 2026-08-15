<!-- src/features/file-library/components/FolderBreadcrumb.vue -->
<!-- 面包屑导航：全部学科 / 基础学科 / 数学 / 线性代数；末尾当前层不可点 -->
<template>
  <nav class="flex flex-wrap items-center gap-1 text-sm" aria-label="分类路径">
    <button
      class="px-1.5 py-0.5 rounded-md text-deep-text hover:text-primary hover:bg-surface-3 transition-colors"
      :class="{ '!text-text-muted !cursor-default !hover:bg-transparent': path.length === 0 }"
      :disabled="path.length === 0"
      @click="emit('navigate', null)"
    >
      全部学科
    </button>
    <span v-for="node in path" :key="node.id" class="flex items-center gap-1">
      <span class="text-text-muted/60 select-none">/</span>
      <button
        class="px-1.5 py-0.5 rounded-md transition-colors"
        :class="
          node.id === path[path.length - 1].id
            ? 'text-primary font-medium cursor-default'
            : 'text-deep-text hover:text-primary hover:bg-surface-3'
        "
        :disabled="node.id === path[path.length - 1].id"
        @click="emit('navigate', node.id)"
      >
        {{ node.name }}
      </button>
    </span>
  </nav>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue';
import type { FileCategory } from '../data/category-tree';

withDefaults(defineProps<{ path: FileCategory[] }>(), { path: () => [] });
const emit = defineEmits<{ navigate: [categoryId: string | null] }>();
</script>
