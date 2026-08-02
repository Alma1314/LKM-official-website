<script setup lang="ts">
import { createRouter, createWebHistory } from 'vue-router';
import BlogHome from './components/pages/BlogHome.vue';
import BlogSeries from './components/pages/BlogSeries.vue';
import { useAuthProvider } from '~/features/auth/composables/useAuth';

// Provide auth context so child components can use useAuth()
useAuthProvider();

const props = defineProps<{ initialPath: string }>();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/community/blog',
      name: 'blog-home',
      component: BlogHome,
    },
    {
      path: '/community/blog/search',
      name: 'blog-search',
      component: () => import('./components/pages/BlogSearch.vue'),
    },
    {
      path: '/community/blog/series/:id',
      name: 'blog-series',
      component: BlogSeries,
      props: (route) => ({ seriesId: Number(route.params.id) }),
    },
    {
      path: '/community/blog/series/:id/:filepath(.*)',
      name: 'blog-post',
      component: () => import('./components/pages/BlogPost.vue'),
      props: (route) => ({
        seriesId: Number(route.params.id),
        filepath: Array.isArray(route.params.filepath)
          ? route.params.filepath.join('/')
          : route.params.filepath,
      }),
    },
  ],
});

// Set initial route from the catch-all Astro page
router.replace(props.initialPath);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <router-view :key="$route.fullPath" />
  </div>
</template>
