<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-semibold text-deep-text">{{ t('onboarding.quiz.title') }}</h3>
      <p class="text-sm text-text-muted mt-1">{{ t('onboarding.quiz.subtitle') }}</p>
    </div>

    <!-- 选择领域 -->
    <div v-if="!quizStarted">
      <label class="block text-sm font-medium text-deep-text mb-3 text-center">{{
        t('onboarding.quiz.chooseField')
      }}</label>
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
          {{ t(f.labelKey) }}
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
          {{ t('onboarding.quiz.start', { count: questions.length }) }}
        </button>
      </div>
    </div>

    <!-- 答题中 -->
    <div v-else-if="!quizFinished">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm text-text-muted">{{
          t('onboarding.quiz.progress', { current: currentIndex + 1, total: questions.length })
        }}</span>
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
          {{ t('onboarding.quiz.prev') }}
        </button>
        <button
          v-if="currentIndex < questions.length - 1 && answers[currentIndex] !== undefined"
          type="button"
          class="btn-primary px-4 py-2 rounded-lg text-sm"
          @click="currentIndex++"
        >
          {{ t('onboarding.quiz.next') }}
        </button>
        <button v-if="allAnswered" type="button" class="btn-primary px-4 py-2 rounded-lg text-sm" @click="finishQuiz">
          {{ t('onboarding.submit') }}
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
        {{ passed ? t('onboarding.quiz.passed') : t('onboarding.quiz.failed') }}
      </h3>
      <p class="text-sm text-text-muted">
        {{
          t('onboarding.quiz.result', {
            correct: correctCount,
            total: questions.length,
            rate: Math.round((correctCount / questions.length) * 100),
          })
        }}
      </p>
      <p v-if="passed" class="text-sm text-primary font-medium">{{ t('onboarding.quiz.unlocked') }}</p>
      <p v-else class="text-sm text-text-muted">{{ t('onboarding.quiz.retryHint') }}</p>
      <button v-if="!passed" type="button" class="btn-ghost text-sm" @click="resetQuiz">
        {{ t('onboarding.quiz.retry') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { t, type TranslationKey } from '~/lib/i18n';

interface QuizQuestion {
  id: string;
  field: string;
  fieldLabel: string;
  stem: string;
  options: string[];
  answer: number;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'p1',
    field: 'physics',
    fieldLabel: '物理学',
    stem: '光速在真空中约为多少？',
    options: ['3×10⁶ m/s', '3×10⁷ m/s', '3×10⁸ m/s', '3×10⁹ m/s'],
    answer: 2,
  },
  {
    id: 'p2',
    field: 'physics',
    fieldLabel: '物理学',
    stem: '牛顿第二定律的表达式是？',
    options: ['F = mv', 'F = ma', 'F = m/v', 'F = m²a'],
    answer: 1,
  },
  {
    id: 'p3',
    field: 'physics',
    fieldLabel: '物理学',
    stem: '以下哪个是基本粒子？',
    options: ['质子', '中子', '电子', '原子'],
    answer: 2,
  },
  {
    id: 'p4',
    field: 'physics',
    fieldLabel: '物理学',
    stem: '能量守恒定律是谁提出的？',
    options: ['牛顿', '爱因斯坦', '焦耳', '亥姆霍兹'],
    answer: 3,
  },
  {
    id: 'p5',
    field: 'physics',
    fieldLabel: '物理学',
    stem: '以下哪种现象是波的干涉？',
    options: ['彩虹', '肥皂泡彩色', '影子', '闪电'],
    answer: 1,
  },
  {
    id: 'm1',
    field: 'math',
    fieldLabel: '数学',
    stem: '欧拉公式 e^(iπ) + 1 = ?',
    options: ['0', '1', '-1', 'i'],
    answer: 0,
  },
  {
    id: 'm2',
    field: 'math',
    fieldLabel: '数学',
    stem: '以下哪个是质数？',
    options: ['51', '57', '91', '97'],
    answer: 3,
  },
  { id: 'm3', field: 'math', fieldLabel: '数学', stem: 'sin²x + cos²x = ?', options: ['0', '1', '2', 'x'], answer: 1 },
  {
    id: 'm4',
    field: 'math',
    fieldLabel: '数学',
    stem: '级数 1 + 1/2 + 1/4 + 1/8 + ... 的和是？',
    options: ['1', '2', '∞', 'e'],
    answer: 1,
  },
  {
    id: 'm5',
    field: 'math',
    fieldLabel: '数学',
    stem: '费马大定理是由谁证明的？',
    options: ['欧拉', '高斯', '安德鲁·怀尔斯', '希尔伯特'],
    answer: 2,
  },
  {
    id: 'c1',
    field: 'chemistry',
    fieldLabel: '化学',
    stem: '水的化学式是？',
    options: ['H₂O', 'CO₂', 'NaCl', 'O₂'],
    answer: 0,
  },
  {
    id: 'c2',
    field: 'chemistry',
    fieldLabel: '化学',
    stem: '以下哪个是惰性气体？',
    options: ['氧气', '氮气', '氩气', '氢气'],
    answer: 2,
  },
  {
    id: 'c3',
    field: 'chemistry',
    fieldLabel: '化学',
    stem: 'pH=7 表示溶液是？',
    options: ['酸性', '碱性', '中性', '不确定'],
    answer: 2,
  },
  {
    id: 'c4',
    field: 'chemistry',
    fieldLabel: '化学',
    stem: '催化剂在化学反应中的作用是？',
    options: ['提高产率', '降低活化能', '改变平衡常数', '消耗反应物'],
    answer: 1,
  },
  {
    id: 'c5',
    field: 'chemistry',
    fieldLabel: '化学',
    stem: '以下哪种元素的原子序数是 6？',
    options: ['氮', '碳', '氧', '硼'],
    answer: 1,
  },
  {
    id: 'b1',
    field: 'biology',
    fieldLabel: '生物学',
    stem: 'DNA 的全称是？',
    options: ['脱氧核酸', '脱氧核糖核酸', '核糖核酸', '脱氧核苷酸'],
    answer: 1,
  },
  {
    id: 'b2',
    field: 'biology',
    fieldLabel: '生物学',
    stem: '细胞分裂的哪个阶段染色体数目加倍？',
    options: ['间期', '前期', '中期', '后期'],
    answer: 3,
  },
  {
    id: 'b3',
    field: 'biology',
    fieldLabel: '生物学',
    stem: '以下哪项是线粒体的功能？',
    options: ['光合作用', '蛋白质合成', '有氧呼吸', '细胞运动'],
    answer: 2,
  },
  {
    id: 'b4',
    field: 'biology',
    fieldLabel: '生物学',
    stem: '孟德尔遗传定律中，F₂ 代表现型比例约为？',
    options: ['1:1', '3:1', '9:3:3:1', '1:2:1'],
    answer: 1,
  },
  {
    id: 'b5',
    field: 'biology',
    fieldLabel: '生物学',
    stem: '以下哪项是 RNA 不同于 DNA 的特征？',
    options: ['双链结构', '含脱氧核糖', '含尿嘧啶', '含胸腺嘧啶'],
    answer: 2,
  },
  {
    id: 'cs1',
    field: 'cs',
    fieldLabel: '信息科学',
    stem: '二分查找的时间复杂度是？',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'],
    answer: 2,
  },
  {
    id: 'cs2',
    field: 'cs',
    fieldLabel: '信息科学',
    stem: 'TCP 协议位于 OSI 模型的哪一层？',
    options: ['应用层', '网络层', '传输层', '数据链路层'],
    answer: 2,
  },
  {
    id: 'cs3',
    field: 'cs',
    fieldLabel: '信息科学',
    stem: '以下哪种排序算法是稳定的？',
    options: ['快速排序', '堆排序', '归并排序', '选择排序'],
    answer: 2,
  },
  {
    id: 'cs4',
    field: 'cs',
    fieldLabel: '信息科学',
    stem: '在二进制中，1010 + 0110 = ?',
    options: ['10000', '11000', '11110', '10110'],
    answer: 0,
  },
  {
    id: 'cs5',
    field: 'cs',
    fieldLabel: '信息科学',
    stem: 'RESTful API 中，用于更新资源的 HTTP 方法是？',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    answer: 2,
  },
];

const quizFields = [
  { value: 'physics', labelKey: 'onboarding.tags.physics' as TranslationKey },
  { value: 'math', labelKey: 'onboarding.tags.math' as TranslationKey },
  { value: 'chemistry', labelKey: 'onboarding.tags.chemistry' as TranslationKey },
  { value: 'biology', labelKey: 'onboarding.tags.biology' as TranslationKey },
  { value: 'cs', labelKey: 'onboarding.tags.cs' as TranslationKey },
];

const selectedField = ref('');
const quizStarted = ref(false);
const quizFinished = ref(false);
const currentIndex = ref(0);
const answers = ref<(number | undefined)[]>([]);
const questions = ref<QuizQuestion[]>([]);

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
