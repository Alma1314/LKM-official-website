<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBlogApi } from '~/features/blog-community/api/useBlogApi';
import type { BlogArticleInfo } from '~/features/blog-community/types/blog';

const api = useBlogApi();
const articles = ref<BlogArticleInfo[]>([]);
const loading = ref(true);

onMounted(async () => {
  const result = await api.listArticles(1);
  if (result.isOk()) {
    articles.value = result.value.items.slice(0, 6);
  }
  loading.value = false;
});
</script>

<template>
  <div v-if="loading" class="text-center py-4 text-gray-500">加载中...</div>
  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <a
      v-for="article in articles"
      :key="article.slug"
      :href="`/blog/posts/${article.slug}`"
      class="border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <img
        v-if="article.cover_url"
        :src="article.cover_url"
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
