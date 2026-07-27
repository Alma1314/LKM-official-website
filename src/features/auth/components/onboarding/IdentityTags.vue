<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-semibold text-deep-text">选择你的身份标签</h3>
      <p class="text-sm text-text-muted mt-1">帮助我们为你推荐更合适的内容（可跳过）</p>
    </div>

    <!-- 年级 -->
    <div>
      <label class="block text-sm font-medium text-deep-text mb-2">年级阶段</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="g in gradeOptions"
          :key="g.value"
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          :class="selectedGrade === g.value
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-surface-3 bg-card-bg text-text-muted hover:border-primary/40'"
          @click="selectedGrade = selectedGrade === g.value ? '' : g.value"
        >
          {{ g.label }}
        </button>
      </div>
    </div>

    <!-- 专业方向 -->
    <div>
      <label class="block text-sm font-medium text-deep-text mb-2">专业方向（多选）</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="m in majorOptions"
          :key="m.value"
          type="button"
          class="px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-1.5"
          :class="selectedMajors.includes(m.value)
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-surface-3 bg-card-bg text-text-muted hover:border-primary/40'"
          @click="toggleMajor(m.value)"
        >
          <Icon v-if="m.icon" :icon="m.icon" class="w-4 h-4" />
          {{ m.label }}
        </button>
      </div>
    </div>

    <!-- 兴趣领域 -->
    <div>
      <label class="block text-sm font-medium text-deep-text mb-2">兴趣领域（多选）</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in interestOptions"
          :key="item.value"
          type="button"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors"
          :class="selectedInterests.includes(item.value)
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-surface-3 bg-card-bg text-text-muted hover:border-primary/40'"
          @click="toggleInterest(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { gradeOptions, majorOptions, interestOptions } from '../../data/onboarding-tags';
import { Icon } from '@iconify/vue';

const selectedGrade = ref('');
const selectedMajors = ref<string[]>([]);
const selectedInterests = ref<string[]>([]);

function toggleMajor(value: string) {
  const idx = selectedMajors.value.indexOf(value);
  if (idx >= 0) {
    selectedMajors.value.splice(idx, 1);
  } else {
    selectedMajors.value.push(value);
  }
}

function toggleInterest(value: string) {
  const idx = selectedInterests.value.indexOf(value);
  if (idx >= 0) {
    selectedInterests.value.splice(idx, 1);
  } else {
    selectedInterests.value.push(value);
  }
}

defineExpose({
  getData: () => ({
    grade: selectedGrade.value,
    majors: [...selectedMajors.value],
    interests: [...selectedInterests.value],
  }),
});
</script>
