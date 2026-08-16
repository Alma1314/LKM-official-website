<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchWithCache } from '~/lib/cache-client';

interface OfficialArticle {
  slug: string;
  title: string;
  description: string;
  cover?: string;
  published: string;
}

const DEFAULT_COVER = `${import.meta.env.BASE_URL || '/'}images/article-default.png`;

const articles = ref<OfficialArticle[]>([]);
const loading = ref(true);

const baseUrl = import.meta.env.BASE_URL || '/';

const CACHE_KEY = 'articles:latest';
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

onMounted(async () => {
  try {
    const { data, fromCache } = await fetchWithCache<{ items: OfficialArticle[]; total: number }>(
      '/api/v1/articles?page=1&page_size=6',
      CACHE_KEY,
      CACHE_TTL
    );
    if (data?.items) {
      articles.value = data.items;
    }
    // SWR: 缓存命中已立即返回，后台已在静默更新
    void fromCache; // 标记使用
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading" class="text-center py-4 text-text-muted">加载中...</div>
  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <a
      v-for="article in articles"
      :key="article.slug"
      :href="`${baseUrl}official/articles/${article.slug}`"
      class="profile-card group flex flex-col"
    >
      <div class="profile-inner h-full flex flex-col">
        <img
          :src="article.cover || DEFAULT_COVER"
          :alt="article.title"
          class="w-full h-20 object-cover"
        />
        <div class="flex flex-col flex-1 p-5">
          <h3
            class="font-semibold text-deep-text mb-2 line-clamp-2 group-hover:text-primary transition-colors"
          >
            {{ article.title }}
          </h3>
          <p v-if="article.description" class="text-sm text-text-muted line-clamp-2">
            {{ article.description }}
          </p>
          <span class="text-xs text-text-muted mt-auto pt-4 block">{{
            new Date(article.published).toLocaleDateString('zh-CN')
          }}</span>
        </div>
      </div>
    </a>
  </div>
</template>
