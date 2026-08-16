<script setup lang="ts">
import { t } from "~/lib/i18n";

/**
 * Figure 共享展示组件（Vue 版），供社区博客 MDX <Figure/> 组件映射使用。
 * 输出 .lkm-* 统一类名，样式见 main.css；与 React 端 FigureView 保持一致。
 */
withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    caption?: string;
    width?: number;
    align?: "left" | "center" | "right";
  }>(),
  {
    src: "",
    alt: "",
    caption: "",
    width: undefined,
    align: "center",
  },
);
</script>

<template>
  <figure class="lkm-figure" :class="`lkm-figure-${align}`">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      :style="width ? { width: `${width}px` } : undefined"
    />
    <span v-else class="lkm-figure-placeholder">{{
      t("editor.preview.noImage")
    }}</span>
    <figcaption v-if="caption" class="lkm-figure-caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>
