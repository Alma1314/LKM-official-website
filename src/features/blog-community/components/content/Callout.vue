<script setup lang="ts">
/**
 * Callout 共享展示组件（Vue 版），供社区博客 MDX <Callout/> 组件映射使用。
 * 输出 .lkm-* 统一类名，样式见 main.css；与 React 端 CalloutView 保持一致。
 */
import { t } from "~/lib/i18n";

withDefaults(
  defineProps<{
    type?: "info" | "warning" | "error" | "success";
    title?: string;
  }>(),
  {
    type: "info",
    title: "",
  },
);

const ICONS: Record<string, string> = {
  info: "ℹ",
  warning: "⚠",
  error: "✕",
  success: "✓",
};
const LABEL_KEYS: Record<string, string> = {
  info: "editor.callout.info",
  warning: "editor.callout.warning",
  error: "editor.callout.error",
  success: "editor.callout.success",
};

function icon(type: string): string {
  return ICONS[type] ?? ICONS.info;
}
function label(type: string): string {
  return t(
    (LABEL_KEYS[type] ?? "editor.callout.info") as Parameters<typeof t>[0],
  );
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
