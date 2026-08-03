<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePracticeStore } from '../stores-vue/practice';
import type { Question } from '~/features/starhope/types';
const practice = usePracticeStore();
const wrongQuestions = ref<Question[]>([]);
onMounted(async () => {
  wrongQuestions.value = await practice.loadWrongQuestions();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-deep-text mb-6">错题本</h1>
    <div v-if="wrongQuestions.length === 0" class="card-base p-8 text-center text-text-muted">
      <div class="text-5xl mb-4">📕</div>
      <p>暂无错题</p>
    </div>
    <div v-else class="card-base p-4">
      <div v-for="q in wrongQuestions" :key="q.id" class="p-3 border-b border-surface-3 text-sm">{{ q.content }}</div>
    </div>
  </div>
</template>
