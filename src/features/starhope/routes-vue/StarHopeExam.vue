<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuestionBankStore } from '../stores-vue/question-bank';
const bank = useQuestionBankStore();
onMounted(async () => { await bank.loadQuestions(); });
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-deep-text mb-6">模拟考试</h1>
    <div class="card-base p-6 text-center text-text-muted">
      <div class="text-5xl mb-4">📝</div>
      <p>共 {{ bank.questions.value.length }} 道题目可选用于考试</p>
    </div>
  </div>
</template>
