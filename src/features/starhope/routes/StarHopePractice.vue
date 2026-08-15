<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuestionBankStore } from '../stores/question-bank';
import { usePracticeStore } from '../stores/practice';
import { useNavigationStore } from '../stores/navigation';

const bank = useQuestionBankStore();
const practice = usePracticeStore();
const _nav = useNavigationStore();

onMounted(async () => {
  await bank.loadQuestions();
});

async function _start(_questionIds: string[]) {
  await practice.startPractice({ questionIds: _questionIds, mode: 'realtime', type: 'practice' });
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-deep-text mb-6">练习</h1>
    <div class="card-base p-6 text-center text-text-muted">
      <div class="text-5xl mb-4">✏️</div>
      <p>共 {{ bank.questions.value.length }} 道题目可选</p>
    </div>
  </div>
</template>
