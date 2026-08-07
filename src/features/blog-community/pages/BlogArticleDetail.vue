<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBlogPost } from '../composables/useBlogPost';
import { blogApi } from '~/lib/api';
import type { BlogArticleDetail } from '../types/blog';

const _props = defineProps<{ slug: string }>();

const article = ref<BlogArticleDetail | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const { MDXComponent: _MDXComponent, fetchAndCompile } = useBlogPost();

onMounted(async () => {
  loading.value = true;
  const result = await blogApi.getArticleDetail(_props.slug);
  if (result.isErr()) {
    error.value = result.error.message;
    loading.value = false;
    return;
  }
  article.value = result.value;

  // Load MDX content via the existing composable (simulated: use content field directly)
  await fetchAndCompile(0, ''); // placeholder; BlogArticleDetail.content will be rendered via a different path
  loading.value = false;
});
</script>

<template>
  <div v-if="loading" class="text-center py-12">加载中...</div>
  <div v-else-if="error" class="text-red-500 py-12">{{ error }}</div>
  <article v-else-if="article" class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold mb-4">{{ article.title }}</h1>
    <div class="flex items-center gap-4 text-gray-500 mb-8">
      <span>{{ new Date(article.published).toLocaleDateString('zh-CN') }}</span>
      <span v-if="article.updated">更新于 {{ new Date(article.updated).toLocaleDateString('zh-CN') }}</span>
      <span>{{ article.word_count }} 字 · {{ article.reading_time }} 分钟</span>
    </div>
    <img v-if="article.cover_url" :src="article.cover_url" :alt="article.title" class="w-full rounded-lg mb-8" />
    <div class="flex gap-2 mb-8">
      <span v-if="article.category" class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{{
        article.category
      }}</span>
      <span v-for="tag in article.tags" :key="tag" class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{{
        tag
      }}</span>
    </div>

    <!-- MDX content rendered client-side -->
    <div class="prose max-w-none mb-12">
      <div v-html="article.content"></div>
    </div>

    <!-- Share -->
    <div class="flex items-center gap-4 py-4 border-t border-b mb-8">
      <button @click="copyShareLink" class="text-sm text-gray-500 hover:text-blue-600">复制链接</button>
    </div>

    <!-- Prev/Next -->
    <nav class="flex justify-between mb-12">
      <router-link
        v-if="article.prev_article"
        :to="`/blog/posts/${article.prev_article.slug}`"
        class="text-blue-600 hover:underline"
        >← {{ article.prev_article.title }}</router-link
      >
      <span v-else></span>
      <router-link
        v-if="article.next_article"
        :to="`/blog/posts/${article.next_article.slug}`"
        class="text-blue-600 hover:underline"
        >{{ article.next_article.title }} →</router-link
      >
      <span v-else></span>
    </nav>
  </article>
</template>
