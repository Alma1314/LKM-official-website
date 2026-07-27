<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-semibold text-deep-text">专业知识答题</h3>
      <p class="text-sm text-text-muted mt-1">通过答题即可解锁专栏功能和专业资格（可跳过，之后也可以在设置中答题）</p>
    </div>

    <!-- 选择领域 -->
    <div v-if="!quizStarted">
      <label class="block text-sm font-medium text-deep-text mb-3 text-center">选择你擅长的领域</label>
      <div class="flex flex-wrap justify-center gap-2">
        <button
          v-for="f in quizFields"
          :key="f.value"
          type="button"
          class="px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors"
          :class="
            selectedField === f.value
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-surface-3 bg-card-bg text-text-muted hover:border-primary/40'
          "
          @click="selectedField = f.value"
        >
          {{ f.label }}
        </button>
      </div>
      <div class="text-center mt-4">
        <button
          type="button"
          class="btn-primary px-6 py-2 rounded-lg text-sm font-semibold"
          :disabled="!selectedField"
          :class="!selectedField ? 'opacity-50 cursor-not-allowed' : ''"
          @click="startQuiz"
        >
          开始答题（{{ questions.length }} 题）
        </button>
      </div>
    </div>

    <!-- 答题中 -->
    <div v-else-if="!quizFinished">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm text-text-muted">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
        <div class="flex gap-1">
          <span
            v-for="(_, i) in questions"
            :key="i"
            class="w-2 h-2 rounded-full"
            :class="
              answers[i] === undefined
                ? 'bg-surface-3'
                : answers[i] === questions[i].answer
                  ? 'bg-green-500'
                  : 'bg-red-500'
            "
          ></span>
        </div>
      </div>

      <div class="bg-card-bg border border-surface-3 rounded-xl p-6">
        <p class="text-deep-text font-medium mb-4">{{ questions[currentIndex].stem }}</p>
        <div class="space-y-2">
          <button
            v-for="(opt, i) in questions[currentIndex].options"
            :key="i"
            type="button"
            class="w-full text-left px-4 py-3 rounded-lg text-sm border transition-colors"
            :class="
              answers[currentIndex] === i
                ? i === questions[currentIndex].answer
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300'
                  : 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300'
                : 'border-surface-3 bg-card-bg text-deep-text hover:border-primary/40'
            "
            :disabled="answers[currentIndex] !== undefined"
            @click="answer(i)"
          >
            <span class="font-mono text-text-muted mr-2">{{ 'ABCD'[i] }}.</span>
            {{ opt }}
          </button>
        </div>
      </div>

      <div class="flex justify-between mt-4">
        <button type="button" class="btn-ghost text-sm" :disabled="currentIndex === 0" @click="currentIndex--">
          上一题
        </button>
        <button
          v-if="currentIndex < questions.length - 1 && answers[currentIndex] !== undefined"
          type="button"
          class="btn-primary px-4 py-2 rounded-lg text-sm"
          @click="currentIndex++"
        >
          下一题
        </button>
        <button v-if="allAnswered" type="button" class="btn-primary px-4 py-2 rounded-lg text-sm" @click="finishQuiz">
          提交
        </button>
      </div>
    </div>

    <!-- 答完结果 -->
    <div v-else class="text-center space-y-4">
      <div
        class="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
        :class="passed ? 'bg-green-100 dark:bg-green-950/30' : 'bg-red-100 dark:bg-red-950/30'"
      >
        <Icon
          :icon="passed ? 'material-symbols:check-circle-outline' : 'material-symbols:cancel-outline'"
          class="w-10 h-10"
          :class="passed ? 'text-green-500' : 'text-red-500'"
        />
      </div>
      <h3
        class="text-lg font-semibold"
        :class="passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
      >
        {{ passed ? '恭喜通过！' : '未通过' }}
      </h3>
      <p class="text-sm text-text-muted">
        正确 {{ correctCount }} / {{ questions.length }}（正确率
        {{ Math.round((correctCount / questions.length) * 100) }}%，{{ passed ? '≥60%' : '<60%' }}）
      </p>
      <p v-if="passed" class="text-sm text-primary font-medium">已解锁专栏功能和专业资格！</p>
      <p v-else class="text-sm text-text-muted">正确率达到 60% 即可通过，可以重新答题或稍后再试。</p>
      <button v-if="!passed" type="button" class="btn-ghost text-sm" @click="resetQuiz">重新答题</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { quizQuestions, quizFields } from '../../data/quiz-questions';

const selectedField = ref('');
const quizStarted = ref(false);
const quizFinished = ref(false);
const currentIndex = ref(0);
const answers = ref<(number | undefined)[]>([]);
const questions = ref<typeof quizQuestions>([]);

const allAnswered = computed(() => answers.value.every((a) => a !== undefined));
const correctCount = computed(() =>
  answers.value.reduce((sum, a, i) => sum + (a === questions.value[i]?.answer ? 1 : 0), 0)
);
const passed = computed(() => correctCount.value / questions.value.length >= 0.6);

function startQuiz() {
  const pool = quizQuestions.filter((q) => q.field === selectedField.value);
  // 随机选 5 题（或全部）
  questions.value = pool.sort(() => Math.random() - 0.5).slice(0, 5);
  answers.value = new Array(questions.value.length).fill(undefined);
  currentIndex.value = 0;
  quizStarted.value = true;
  quizFinished.value = false;
}

function answer(index: number) {
  answers.value[currentIndex.value] = index;
}

function finishQuiz() {
  quizFinished.value = true;
}

function resetQuiz() {
  quizStarted.value = false;
  quizFinished.value = false;
  selectedField.value = '';
  answers.value = [];
  questions.value = [];
  currentIndex.value = 0;
}

defineExpose({
  isComplete: () => quizFinished.value && passed.value,
  getData: () => ({ passed: passed.value, field: selectedField.value, correctCount: correctCount.value }),
});
</script>
