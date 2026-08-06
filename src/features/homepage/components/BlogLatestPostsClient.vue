<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchWithCache } from '~/lib/cache-client';

interface OfficialArticle {
  slug: string;
  title: string;
  description: string;
  cover: string;
  published: string;
}

const articles = ref<OfficialArticle[]>([]);
const loading = ref(true);
const API_BASE = 'http://localhost:8000';

const CACHE_KEY = 'articles:latest';
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

onMounted(async () => {
  try {
    const { data, fromCache } = await fetchWithCache<OfficialArticle[]>(
      `${API_BASE}/api/articles?page=1&page_size=6`,
      CACHE_KEY,
      CACHE_TTL,
    );
    if (data) {
      articles.value = data;
    }
    // SWR: 缓存命中已立即返回，后台已在静默更新
    void fromCache; // 标记使用
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading" class="text-center py-4 text-gray-500">加载中...</div>
  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <a
      v-for="article in articles"
      :key="article.slug"
      :href="`${(window as any).__BASE_URL__ || ''}official/articles/${article.slug}`"
      class="border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <img
        v-if="article.cover"
        :src="article.cover"
        :alt="article.title"
        class="w-full h-40 object-cover rounded mb-3"
      />
      <h3 class="font-semibold mb-1">{{ article.title }}</h3>
      <p v-if="article.description" class="text-sm text-gray-600 line-clamp-2">{{ article.description }}</p>
      <span class="text-xs text-gray-400 mt-2 block">{{
        new Date(article.published).toLocaleDateString('zh-CN')
      }}</span>
    </a>
  </div>
</template>
