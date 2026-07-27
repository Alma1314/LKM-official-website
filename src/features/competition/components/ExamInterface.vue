<template>
  <div class="flex gap-4 max-w-4xl mx-auto">
    <!-- 左侧题号导航 -->
    <div class="w-12 shrink-0 space-y-1 hidden sm:block">
      <button
        v-for="(q, i) in questions"
        :key="i"
        class="w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
        :class="
          currentIndex === i
            ? 'bg-primary text-on-primary'
            : answers[i] !== undefined
              ? 'bg-primary/20 text-primary'
              : 'bg-surface-3 text-text-muted'
        "
        @click="currentIndex = i"
      >
        {{ i + 1 }}
      </button>
    </div>

    <!-- 答题区 -->
    <div class="flex-1">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm text-text-muted">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
        <span class="text-sm font-mono font-bold" :class="remaining < 300 ? 'text-red-500' : 'text-primary'">
          {{ formatTime(remaining) }}
        </span>
      </div>

      <div class="bg-card-bg border border-surface-3 rounded-xl p-6">
        <p class="text-deep-text font-medium mb-4">{{ currentQ.stem }}</p>
        <div class="space-y-2">
          <button
            v-for="(opt, i) in currentQ.options"
            :key="i"
            class="w-full text-left px-4 py-3 rounded-lg text-sm border transition-colors"
            :class="
              answers[currentIndex] === i
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-surface-3 text-deep-text hover:border-primary/40'
            "
            @click="answers[currentIndex] = i"
          >
            <span class="font-mono text-text-muted mr-2">{{ labels[i] }}.</span>{{ opt }}
          </button>
        </div>
      </div>

      <div class="flex justify-between mt-4">
        <button class="btn-ghost text-sm px-4 py-2" :disabled="currentIndex === 0" @click="currentIndex--">
          上一题
        </button>
        <div class="flex gap-2">
          <span class="text-xs text-text-muted self-center">已答 {{ answeredCount }}/{{ questions.length }}</span>
          <button
            v-if="currentIndex < questions.length - 1"
            class="btn-primary px-5 py-2 rounded-lg text-sm"
            @click="currentIndex++"
          >
            下一题
          </button>
          <button v-else class="btn-primary px-5 py-2 rounded-lg text-sm font-bold" @click="submit">提交答卷</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { mockQuestions } from '../data/mock-competitions';

const questions = ref(mockQuestions.slice(0, 8));
const answers = ref<(number | undefined)[]>(new Array(questions.value.length).fill(undefined));
const currentIndex = ref(0);
const remaining = ref(7200); // 120 minutes
let timer: ReturnType<typeof setInterval>;

const currentQ = computed(() => questions.value[currentIndex.value]);
const answeredCount = computed(() => answers.value.filter((a) => a !== undefined).length);

const labels = ['A', 'B', 'C', 'D'];

onMounted(() => {
  timer = setInterval(() => {
    if (remaining.value > 0) remaining.value--;
  }, 1000);
});

onUnmounted(() => clearInterval(timer));

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function submit() {
  const correct = answers.value.filter((a, i) => a === questions.value[i].answer).length;
  clearInterval(timer);
  alert(`答卷已提交！正确 ${correct}/${questions.length}（${Math.round((correct / questions.length) * 100)}%）`);
  window.location.href = '/competition';
}
</script>
