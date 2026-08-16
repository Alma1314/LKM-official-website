<script setup lang="ts">
import { ref, onMounted } from "vue";
import { blogApi } from "~/lib/api";
import type { BlogTagInfo } from "../types/blog";
import { t } from "~/lib/i18n";

const tags = ref<BlogTagInfo[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const result = await blogApi.listTags();
  if (result.isOk()) {
    tags.value = result.value.items;
  }
  loading.value = false;
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">{{ t("blog.tagsTitle") }}</h1>
    <div v-if="loading" class="text-center py-12 text-gray-500">
      {{ t("common.loading") }}
    </div>
    <div v-else class="flex flex-wrap gap-3">
      <router-link
        v-for="tag in tags"
        :key="tag.slug"
        :to="`/blog?tag=${tag.slug}`"
        class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm transition-colors"
      >
        {{ tag.name }} ({{ tag.article_count }})
      </router-link>
    </div>
  </div>
</template>
