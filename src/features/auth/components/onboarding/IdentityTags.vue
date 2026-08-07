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
          :class="
            selectedGrade === g.value
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-surface-3 bg-card-bg text-text-muted hover:border-primary/40'
          "
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
          :class="
            selectedMajors.includes(m.value)
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-surface-3 bg-card-bg text-text-muted hover:border-primary/40'
          "
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
          :class="
            selectedInterests.includes(item.value)
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-surface-3 bg-card-bg text-text-muted hover:border-primary/40'
          "
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
import { Icon } from '@iconify/vue';

interface TagOption {
  value: string;
  label: string;
  icon?: string;
}

const gradeOptions: TagOption[] = [
  { value: 'junior_high', label: '初中' },
  { value: 'senior_high', label: '高中' },
  { value: 'university', label: '大学' },
  { value: 'graduate', label: '研究生' },
  { value: 'working', label: '已工作' },
];

const majorOptions: TagOption[] = [
  { value: 'math', label: '数学', icon: 'tabler:math' },
  { value: 'physics', label: '物理学', icon: 'tabler:atom' },
  { value: 'chemistry', label: '化学', icon: 'tabler:flask' },
  { value: 'biology', label: '生命科学', icon: 'tabler:microscope' },
  { value: 'astronomy', label: '天文学', icon: 'tabler:telescope' },
  { value: 'earth_science', label: '地球科学', icon: 'tabler:globe' },
  { value: 'cs', label: '信息科学', icon: 'tabler:code' },
  { value: 'ee', label: '电子电气', icon: 'tabler:bolt' },
  { value: 'engineering', label: '工程学', icon: 'tabler:tools' },
  { value: 'medicine', label: '医学', icon: 'tabler:heartbeat' },
  { value: 'social_science', label: '社会科学', icon: 'tabler:users' },
  { value: 'literature', label: '文学', icon: 'tabler:book' },
];

const interestOptions: TagOption[] = [
  { value: 'research', label: '科研' },
  { value: 'programming', label: '编程' },
  { value: 'reading', label: '阅读' },
  { value: 'writing', label: '写作' },
  { value: 'experiment', label: '实验' },
  { value: 'teaching', label: '教学' },
  { value: 'debate', label: '辩论' },
  { value: 'competition', label: '竞赛' },
  { value: 'astronomy_hobby', label: '天文观测' },
  { value: 'model', label: '模型制作' },
  { value: 'game', label: '游戏' },
  { value: 'music', label: '音乐' },
  { value: 'sci_fi', label: '科幻' },
  { value: 'cooking', label: '料理' },
  { value: 'chess', label: '棋牌' },
];

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
