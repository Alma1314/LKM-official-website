<script setup lang="ts">
import { onMounted } from "vue";
// 使用 @sentry/vue（仅 @sentry/vue 单一依赖，不做构建期 @sentry/astro 集成，
// 避免污染本仓库精细的 SSR/manualChunks 构建链路）。空 DSN 时组件本身不挂载，
// 见 BaseLayout.astro 的条件注入（PUBLIC_SENTRY_DSN 为空则整个组件不渲染）。
import * as Sentry from "@sentry/vue";

const dsn = (import.meta.env.PUBLIC_SENTRY_DSN as string | undefined)?.trim();

// 模块级守卫：无论本组件被实例化多少次（SSR 直出 + 客户端水合 / 多 island），
// Sentry 全局只初始化一次。Sentry.init 自身是全局幂等的（重复调用会告警），
// 这里前置守卫避免重复 init 的开销与告警噪声。
let initialized = false;

onMounted(() => {
  // 正常情况下 dsn 非空才会挂载本组件；仍做一次兜底，防异常配置注入。
  if (!dsn || initialized) return;

  initialized = true;
  Sentry.init({
    dsn,
    // RUM 采样率：0.2 = 20% 会话上传，控制成本（计划模块 0 定案）
    tracesSampleRate: 0.2,
    // 自动采集 Web Vitals（LCP/CLS/INP field data）+ 错误捕获
    integrations: [Sentry.browserTracingIntegration()],
  });
});
</script>

<!-- 空渲染：Sentry 初始化是副作用，无任何视觉/DOM 输出 -->
<template></template>
