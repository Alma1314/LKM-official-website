<script setup lang="ts">
import { ref } from 'vue';
const _uploadedFile = ref<File | null>(null);
const _fileText = ref('');
const _fileName = ref('');
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-deep-text mb-6">阅读器</h1>
    <div class="card-base p-8 text-center text-text-muted">
      <div class="text-5xl mb-4">📖</div>
      <p>上传 PDF 开始阅读和标注</p>
    </div>
  </div>
</template>
