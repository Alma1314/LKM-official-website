<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { blogApi } from '~/lib/api';

const content = ref('');
const loading = ref(false);

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
    <h1 class="text-3xl font-bold mb-8">关于</h1>
    <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>
    <div v-else class="prose max-w-none" v-html="content"></div>
  </div>
</template>
