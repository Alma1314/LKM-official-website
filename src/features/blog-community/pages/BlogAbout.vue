<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { blogApi } from '~/lib/api';
import { sanitizeHtmlContent } from '~/lib/utils/html-sanitize';
import { t } from '~/lib/i18n';

const content = ref('');
const loading = ref(false);
const safeContent = computed(() => sanitizeHtmlContent(content.value));

onMounted(async () => {
  loading.value = true;
  const result = await blogApi.getAbout();
  if (result.isOk()) {
    content.value = result.value.content;
  }
  loading.value = false;
});
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">{{ t('blog.aboutTitle') }}</h1>
    <div v-if="loading" class="text-center py-12 text-gray-500">{{ t('common.loading') }}</div>
    <div v-else class="prose max-w-none" v-html="safeContent"></div>
  </div>
</template>
