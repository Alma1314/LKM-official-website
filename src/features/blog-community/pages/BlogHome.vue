<script setup lang="ts">
import { onMounted } from "vue";
import { useBlogArticles } from "../composables/useBlogArticles";
import BlogArticleCard from "./BlogArticleCard.vue";
import { t } from "~/lib/i18n";

const { articles, loading, error, fetchAll } = useBlogArticles();

onMounted(() => {
  fetchAll();
});
</script>

<template>
  <div class="blog-home">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">{{ t("blog.title") }}</h1>
      <p class="mt-2 text-text-muted">{{ t("blog.homeSubtitle") }}</p>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <div
        class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
      />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <button
        class="btn-plain rounded-lg px-4 py-2 bg-primary text-white"
        @click="fetchAll"
      >
        {{ t("common.retry") }}
      </button>
    </div>

    <div
      v-else-if="articles.length === 0"
      class="text-center py-16 text-text-muted"
    >
      <p>{{ t("blog.noArticlesYet") }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BlogArticleCard
        v-for="article in articles"
        :key="`${article.seriesId}-${article.filepath}`"
        :article="article"
      />
    </div>
  </div>
</template>
