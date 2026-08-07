<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { blogApi } from '~/lib/api';
import type { BlogArticleInfo } from '../types/blog';
import { useRoute } from 'vue-router';

const route = useRoute();
const articles = ref<BlogArticleInfo[]>([]);
const loading = ref(false);

const _filterTag = computed(() => (route.query.tag as string) || '');
const _filterCategory = computed(() => (route.query.category as string) || '');

const groupedByYear = computed(() => {
  const groups: Record<string, BlogArticleInfo[]> = {};
  for (const a of articles.value) {
    const year = new Date(a.published).getFullYear().toString();
    if (!groups[year]) groups[year] = [];
    groups[year].push(a);
  }
  return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
});

onMounted(async () => {
  loading.value = true;
  const result = await blogApi.listArticles(1);
  if (result.isOk()) {
    articles.value = result.value.items;
  }
  loading.value = false;
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">文章归档</h1>
    <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>
    <div v-else v-for="[year, yearArticles] in groupedByYear" :key="year" class="mb-8">
      <h2 class="text-2xl font-bold text-gray-400 mb-4">{{ year }}</h2>
      <div class="space-y-3">
        <router-link
          v-for="article in yearArticles"
          :key="article.slug"
          :to="`/blog/posts/${article.slug}`"
          class="flex items-center justify-between border-b pb-3 hover:text-blue-600 transition-colors"
        >
          <span>{{ article.title }}</span>
          <span class="text-sm text-gray-500">{{
            new Date(article.published).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
          }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>
