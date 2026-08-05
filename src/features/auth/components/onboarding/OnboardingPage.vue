<template>
  <div class="min-h-screen bg-page-bg flex flex-col">
    <!-- 顶部步骤条 -->
    <div class="bg-card-bg border-b border-surface-3">
      <div class="max-w-xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div v-for="(step, i) in steps" :key="i" class="flex items-center">
            <!-- 步骤圆点 -->
            <div class="flex flex-col items-center">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                :class="stepClass(i)"
              >
                <Icon v-if="i < currentStep" icon="material-symbols:check" class="w-4 h-4" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span
                class="text-xs mt-1 whitespace-nowrap"
                :class="i <= currentStep ? 'text-deep-text font-medium' : 'text-text-muted'"
              >
                {{ step.label }}
              </span>
            </div>
            <!-- 连接线 -->
            <div
              v-if="i < steps.length - 1"
              class="w-8 sm:w-16 h-0.5 mx-1 mt-[-1rem]"
              :class="i < currentStep ? 'bg-primary' : 'bg-surface-3'"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="flex-1 flex items-start justify-center px-4 py-8">
      <div class="w-full max-w-lg">
        <!-- 步骤标题 -->
        <div class="text-center mb-2">
          <span class="text-xs text-text-muted/60">
            {{ steps[currentStep].optional ? '此步骤可跳过' : steps[currentStep].required ? '此步骤为必填' : '' }}
          </span>
        </div>

        <!-- 动态组件 -->
        <component :is="steps[currentStep].component" :ref="setStepRef" />

        <!-- 底部按钮 -->
        <div class="flex justify-between mt-8">
          <button v-if="currentStep > 0" type="button" class="btn-ghost text-sm px-4 py-2" @click="prevStep">
            上一步
          </button>
          <div v-else></div>

          <div class="flex gap-2">
            <button
              v-if="steps[currentStep].optional"
              type="button"
              class="btn-ghost text-sm px-4 py-2 text-text-muted"
              @click="nextStep"
            >
              跳过
            </button>
            <button
              v-if="currentStep < steps.length - 1"
              type="button"
              class="btn-primary px-6 py-2 rounded-lg text-sm font-semibold"
              :disabled="!canProceed"
              :class="!canProceed ? 'opacity-50 cursor-not-allowed' : ''"
              @click="nextStep"
            >
              {{ steps[currentStep].buttonText || '下一步' }}
            </button>
            <button v-else type="button" class="btn-primary px-6 py-2 rounded-lg text-sm font-semibold" @click="finish">
              完成引导
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import IdentityTags from './IdentityTags.vue';
import FollowRecommend from './FollowRecommend.vue';
import AnswerQuiz from './AnswerQuiz.vue';
import NewbieTasks from './NewbieTasks.vue';
import { buildUrl } from '~/lib/utils/paths';

interface StepConfig {
  label: string;
  component: any;
  optional: boolean;
  required: boolean;
  buttonText?: string;
}

const steps: StepConfig[] = [
  { label: '身份标签', component: IdentityTags, optional: true, required: false, buttonText: '下一步' },
  { label: '关注推荐', component: FollowRecommend, optional: false, required: true, buttonText: '一键关注' },
  { label: '答题升级', component: AnswerQuiz, optional: true, required: false, buttonText: '提交' },
  { label: '新手任务', component: NewbieTasks, optional: false, required: false, buttonText: '完成' },
];

const currentStep = ref(0);
const stepRefs = ref<Record<number, any>>({});

function setStepRef(el: any) {
  if (el) {
    stepRefs.value[currentStep.value] = el;
  }
}

const canProceed = computed(() => {
  const ref = stepRefs.value[currentStep.value];
  if (!ref) return true;
  if (steps[currentStep.value].optional) return true;
  if (ref.isComplete) return ref.isComplete();
  return true;
});

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function finish() {
  // 收集所有步骤数据
  const allData: Record<string, any> = {};
  for (const [i, ref] of Object.entries(stepRefs.value)) {
    if (ref && ref.getData) {
      allData[i] = ref.getData();
    }
  }
  // 写入 localStorage 模拟完成引导
  localStorage.setItem('lkm-onboarding-done', 'true');
  localStorage.setItem('lkm-onboarding-data', JSON.stringify(allData));
  // 跳转到首页
  window.location.href = buildUrl('');
}

function stepClass(i: number) {
  if (i < currentStep.value) return 'bg-primary text-on-primary';
  if (i === currentStep.value) return 'bg-primary text-on-primary';
  return 'bg-surface-3 text-text-muted';
}
</script>
