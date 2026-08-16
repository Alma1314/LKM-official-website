<script setup lang="ts">
import { ref, onMounted } from "vue";
import { blogApi } from "~/lib/api";
import type { BlogCategoryInfo } from "../types/blog";
import { t } from "~/lib/i18n";

const categories = ref<BlogCategoryInfo[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const result = await blogApi.listCategories();
  if (result.isOk()) {
    categories.value = result.value.items;
  }
  loading.value = false;
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">{{ t("blog.categoriesTitle") }}</h1>
    <div v-if="loading" class="text-center py-12 text-gray-500">
      {{ t("common.loading") }}
    </div>
    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <router-link
        v-for="cat in categories"
        :key="cat.slug"
        :to="`/blog?category=${cat.slug}`"
        class="border rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <h2 class="text-lg font-semibold">{{ cat.name }}</h2>
        <p class="text-gray-500 text-sm mt-1">
          {{ t("blog.categoryArticleCount", { count: cat.article_count }) }}
        </p>
      </router-link>
    </div>
  </div>
</template>
