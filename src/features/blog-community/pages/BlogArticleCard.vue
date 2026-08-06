<script setup lang="ts">
import type { BlogArticle } from '../types/blog';

const props = defineProps<{
  article: BlogArticle;
}>();

const targetPath = `/blog/series/${props.article.seriesId}/${props.article.filepath}`;
const displayTitle = props.article.filename.replace(/\.(md|mdx)$/i, '');
</script>

<template>
  <router-link
    :to="targetPath"
    class="block rounded-lg border border-border bg-card p-5 hover:shadow-md transition-shadow"
  >
    <div v-if="article.seriesCover" class="mb-3 rounded-md overflow-hidden">
      <img :src="article.seriesCover" :alt="article.seriesTitle" class="w-full h-40 object-cover" />
    </div>
    <h3 class="font-semibold text-lg mb-1 line-clamp-2">{{ displayTitle }}</h3>
    <p class="text-sm text-text-muted">{{ article.seriesTitle }}</p>
  </router-link>
</template>
