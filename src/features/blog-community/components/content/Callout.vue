<script setup lang="ts">
/**
 * Callout 共享展示组件（Vue 版），供社区博客 MDX <Callout/> 组件映射使用。
 * 输出 .lkm-* 统一类名，样式见 main.css；与 React 端 CalloutView 保持一致。
 */
withDefaults(defineProps<{ type?: 'info' | 'warning' | 'error' | 'success'; title?: string }>(), {
  type: 'info',
  title: '',
});

const ICONS: Record<string, string> = {
  info: 'ℹ',
  warning: '⚠',
  error: '✕',
  success: '✓',
};
const LABELS: Record<string, string> = {
  info: '信息',
  warning: '警告',
  error: '错误',
  success: '成功',
};

function icon(type: string): string {
  return ICONS[type] ?? ICONS.info;
}
function label(type: string): string {
  return LABELS[type] ?? type;
}
</script>

<template>
  <div class="lkm-callout" :class="`lkm-callout-${type}`">
    <span class="lkm-callout-icon">{{ icon(type) }}</span>
    <div class="lkm-callout-body">
      <h4 v-if="title">{{ title }}</h4>
      <p v-else>{{ label(type) }}</p>
      <slot />
    </div>
  </div>
</template>
