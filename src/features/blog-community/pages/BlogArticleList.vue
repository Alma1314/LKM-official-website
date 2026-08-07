<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { blogApi } from '~/lib/api';
import type { BlogArticleInfo } from '../types/blog';

const articles = ref<BlogArticleInfo[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const page = ref(1);
const totalPages = ref(0);
const total = ref(0);

const hasPrev = computed(() => page.value > 1);
const hasNext = computed(() => page.value < totalPages.value);

async function fetchPage(p: number) {
  loading.value = true;
  error.value = null;
  const result = await blogApi.listArticles(p);
  if (result.isErr()) {
    error.value = result.error.message;
  } else {
    articles.value = result.value.items;
    totalPages.value = result.value.total_pages;
    total.value = result.value.total;
    page.value = result.value.page;
  }
  loading.value = false;
}

function goPage(p: number) {
  if (p >= 1 && p <= totalPages.value) {
    fetchPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

onMounted(() => fetchPage(1));
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">博客</h1>
    <p v-if="total" class="text-gray-500 mb-6">共 {{ total }} 篇文章</p>
    <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>
    <div v-else-if="error" class="text-red-500 py-12 text-center">{{ error }}</div>
    <div v-else-if="articles.length === 0" class="text-center py-12 text-gray-500">暂无文章</div>
    <div v-else class="grid gap-6">
      <article
        v-for="article in articles"
        :key="article.slug"
        class="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        @click="$router.push(`/blog/posts/${article.slug}`)"
      >
        <img
          v-if="article.cover_url"
          :src="article.cover_url"
          :alt="article.title"
          class="w-full h-48 object-cover rounded mb-4"
        />
        <h2 class="text-xl font-semibold mb-2">{{ article.title }}</h2>
        <p v-if="article.description" class="text-gray-600 mb-3">{{ article.description }}</p>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span>{{ new Date(article.published).toLocaleDateString('zh-CN') }}</span>
          <span v-if="article.category" class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{{
            article.category
          }}</span>
          <span>{{ article.word_count }} 字</span>
          <span>{{ article.reading_time }} 分钟</span>
        </div>
      </article>
    </div>
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8">
      <button :disabled="!hasPrev" @click="goPage(page - 1)" class="px-4 py-2 border rounded disabled:opacity-30">
        上一页
      </button>
      <span v-for="p in totalPages" :key="p">
        <button @click="goPage(p)" :class="p === page ? 'bg-blue-600 text-white' : 'border'" class="px-3 py-2 rounded">
          {{ p }}
        </button>
      </span>
      <button :disabled="!hasNext" @click="goPage(page + 1)" class="px-4 py-2 border rounded disabled:opacity-30">
        下一页
      </button>
    </div>
  </div>
</template>
