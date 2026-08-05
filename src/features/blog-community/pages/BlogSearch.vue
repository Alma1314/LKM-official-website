<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useBlogArticles } from '../composables/useBlogArticles';
import BlogArticleCard from './BlogArticleCard.vue';

const { articles, fetchAll } = useBlogArticles();
const query = ref('');
const searched = ref(false);

onMounted(() => {
  fetchAll();
});

function doSearch() {
  searched.value = true;
}

const filteredArticles = computed(() => {
  if (!query.value.trim()) return articles.value;
  const q = query.value.toLowerCase();
  return articles.value.filter((a) => a.filename.toLowerCase().includes(q) || a.seriesTitle.toLowerCase().includes(q));
});
</script>

<template>
  <div class="blog-search">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">搜索博客</h1>
      <div class="flex gap-2">
        <input
          v-model="query"
          type="text"
          placeholder="搜索文章标题或系列名..."
          class="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          @keyup.enter="doSearch"
        />
        <button
          class="rounded-lg bg-primary px-6 py-2 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          @click="doSearch"
        >
          搜索
        </button>
      </div>
    </div>

    <div v-if="!searched" class="text-text-muted text-center py-8">输入关键词搜索博客文章</div>

    <div v-else-if="filteredArticles.length === 0" class="text-text-muted text-center py-8">没有找到相关文章</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BlogArticleCard
        v-for="article in filteredArticles"
        :key="`${article.seriesId}-${article.filepath}`"
        :article="article"
      />
    </div>
  </div>
</template>
