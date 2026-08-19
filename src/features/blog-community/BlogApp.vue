<script setup lang="ts">
import { getCurrentInstance } from "vue";
import { createRouter, createWebHistory, useRoute } from "vue-router";
import { useAuthProvider } from "~/features/auth/composables/useAuth";

useAuthProvider();

const props = defineProps<{ initialPath: string }>();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 说明：/blog、/blog/posts/:slug、/blog/categories、/blog/tags、/blog/search、/blog/about 已迁 Astro SSR，
    // 由 src/pages/blog/*.astro 等具体路由优先渲染。此处仅保留未迁 SSR 的 SPA 路由：archive 与 series。
    {
      path: "/blog/archive",
      name: "blog-archive",
      component: () => import("./pages/BlogArchive.vue"),
    },
    {
      path: "/blog/series/:id",
      name: "blog-series",
      component: () => import("./pages/BlogSeries.vue"),
      props: (route) => ({ seriesId: Number(route.params.id) }),
    },
    {
      path: "/blog/series/:id/:filepath(.*)",
      name: "blog-series-post",
      component: () => import("./pages/BlogPost.vue"),
      props: (route) => ({
        seriesId: Number(route.params.id),
        filepath: Array.isArray(route.params.filepath)
          ? route.params.filepath.join("/")
          : route.params.filepath,
      }),
    },
  ],
});

// client:only island 中 vue-entry 无法 app.use(router)，此处手动安装，
// 注入 $route/$router 并让 <router-view> 正常工作，否则 $route 为 undefined 报错。
const app = getCurrentInstance()?.appContext.app;
app?.use?.(router as never);
const route = useRoute();

router.replace(props.initialPath);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <router-view :key="route.fullPath" />
  </div>
</template>
