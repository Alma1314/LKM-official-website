<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <select
        v-model="filterCategory"
        class="px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary outline-none"
      >
        <option v-for="c in QUESTION_CATEGORIES" :key="c" :value="c === '全部' ? '' : c">
          {{ t(categoryLabels[c] ?? c) }}
        </option>
      </select>
      <select
        v-model="filterDifficulty"
        class="px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary outline-none"
      >
        <option value="0">{{ t('competition.allDifficulties') }}</option>
        <option value="1">{{ t('competition.difficultyEasy') }}</option>
        <option value="2">{{ t('competition.difficultyMedium') }}</option>
        <option value="3">{{ t('competition.difficultyHard') }}</option>
      </select>
    </div>
    <div class="space-y-3">
      <div v-for="q in filteredQuestions" :key="q.id" class="bg-card-bg border border-surface-3 rounded-xl p-4">
        <div class="flex items-start gap-2 mb-2">
          <span class="text-xs px-1.5 py-0.5 rounded-full bg-surface-3 text-text-muted shrink-0">{{
            q.type === 'single' ? t('competition.singleChoice') : t('competition.trueFalse')
          }}</span>
          <span class="text-sm font-medium text-deep-text">{{ q.stem }}</span>
        </div>
        <div class="text-xs text-text-muted/60 mt-2">
          {{ t('competition.answer') }}
          {{ Array.isArray(q.answer) ? q.answer.map((i: number) => 'ABCD'[i]).join(', ') : 'ABCD'[q.answer as number] }}
          <span class="mx-2">|</span> {{ t('competition.explanation') }}{{ q.explanation }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { mockQuestions, QUESTION_CATEGORIES } from '../data/mock-competitions';
import { t } from '~/lib/i18n';

const categoryLabels: Record<string, string> = {
  全部: 'competition.categoryAll',
  物理: 'competition.categoryPhysics',
  数学: 'competition.categoryMath',
  化学: 'competition.categoryChemistry',
  生物: 'competition.categoryBiology',
  信息科学: 'competition.categoryCs',
};

const filterCategory = ref('');
const filterDifficulty = ref('0');

const filteredQuestions = computed(() => {
  let qs = [...mockQuestions];
  if (filterDifficulty.value !== '0') qs = qs.filter((q) => q.difficulty === Number(filterDifficulty.value));
  return qs;
});
</script>
