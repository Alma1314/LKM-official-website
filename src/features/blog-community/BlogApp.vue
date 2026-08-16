<script setup lang="ts">
import { getCurrentInstance } from "vue";
import { createRouter, createWebHistory, useRoute } from "vue-router";
import BlogHome from "./pages/BlogArticleList.vue";
import { useAuthProvider } from "~/features/auth/composables/useAuth";

useAuthProvider();

const props = defineProps<{ initialPath: string }>();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/blog",
      name: "blog-home",
      component: BlogHome,
    },
    {
      path: "/blog/posts/:slug",
      name: "blog-post",
      component: () => import("./pages/BlogArticleDetail.vue"),
      props: (route) => ({ slug: route.params.slug as string }),
    },
    {
      path: "/blog/categories",
      name: "blog-categories",
      component: () => import("./pages/BlogCategories.vue"),
    },
    {
      path: "/blog/tags",
      name: "blog-tags",
      component: () => import("./pages/BlogTags.vue"),
    },
    {
      path: "/blog/archive",
      name: "blog-archive",
      component: () => import("./pages/BlogArchive.vue"),
    },
    {
      path: "/blog/search",
      name: "blog-search",
      component: () => import("./pages/BlogSearch.vue"),
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
    {
      path: "/blog/about",
      name: "blog-about",
      component: () => import("./pages/BlogAbout.vue"),
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
