<template>
  <div class="min-h-screen bg-page-bg flex flex-col">
    <!-- 顶部精简步骤条 -->
    <div class="bg-card-bg border-b border-surface-3">
      <div class="max-w-xl mx-auto px-4 py-3">
        <ol class="flex items-center justify-between" aria-label="引导步骤">
          <li
            v-for="cfg in steps"
            :key="cfg.number"
            class="flex items-center"
            :class="{ 'flex-1': cfg.number < steps.length }"
          >
            <div class="flex flex-col items-center">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                :class="dotClass(cfg.number)"
              >
                <Icon
                  v-if="cfg.number < flow.step"
                  icon="material-symbols:check"
                  class="w-3.5 h-3.5"
                  aria-hidden="true"
                />
                <span v-else>{{ cfg.number }}</span>
              </div>
              <span
                class="text-[11px] mt-1 whitespace-nowrap hidden sm:block"
                :class="cfg.number <= flow.step ? 'text-deep-text font-medium' : 'text-text-muted'"
              >
                {{ cfg.label }}
              </span>
            </div>
            <!-- 连接线 -->
            <div
              v-if="cfg.number < steps.length"
              class="h-0.5 mx-1 mt-[-0.75rem] flex-1 min-w-[1.5rem]"
              :class="cfg.number < flow.step ? 'bg-primary' : 'bg-surface-3'"
            ></div>
          </li>
        </ol>
      </div>
    </div>

    <!-- 单张聚焦向导卡 -->
    <div class="flex-1 flex items-start justify-center px-4 py-8">
      <AuthCard class="max-w-lg">
        <div class="text-center mb-2">
          <span class="text-xs text-text-muted/70">{{ stepNote }}</span>
        </div>

        <Transition name="step" mode="out-in">
          <component :is="currentConfig.component" :key="flow.step" :ref="setStepRef" />
        </Transition>

        <div class="flex justify-between mt-8">
          <button
            v-if="flow.step > 1"
            type="button"
            class="btn-ghost text-sm px-4 py-2"
            :disabled="flow.loading"
            @click="prev"
          >
            上一步
          </button>
          <div v-else></div>

          <div class="flex gap-2">
            <button
              v-if="currentConfig.skippable"
              type="button"
              class="btn-ghost text-sm px-4 py-2 text-text-muted"
              :disabled="flow.loading"
              @click="skip"
            >
              跳过全部
            </button>
            <button
              v-if="currentConfig.number < 4"
              type="button"
              class="btn-primary px-6 py-2 rounded-lg text-sm font-semibold"
              :disabled="!canProceed || flow.loading"
              :class="!canProceed || flow.loading ? 'opacity-50 cursor-not-allowed' : ''"
              @click="next"
            >
              {{ currentConfig.buttonText || '下一步' }}
            </button>
            <button
              v-else
              type="button"
              class="btn-primary px-6 py-2 rounded-lg text-sm font-semibold"
              :disabled="!canProceed || flow.loading"
              :class="!canProceed || flow.loading ? 'opacity-50 cursor-not-allowed' : ''"
              @click="next"
            >
              完成引导
            </button>
          </div>
        </div>

        <div v-if="flow.error" class="mt-4">
          <AuthStatus type="error" :message="flow.error" />
        </div>
      </AuthCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import AuthCard from '../shared/AuthCard.vue';
import AuthStatus from '../shared/AuthStatus.vue';
import IdentityTags from './IdentityTags.vue';
import FollowRecommend from './FollowRecommend.vue';
import AnswerQuiz from './AnswerQuiz.vue';
import NewbieTasks from './NewbieTasks.vue';
import { useOnboardingFlow, type OnboardingStepNumber } from '~/features/auth/composables/useOnboardingFlow';
import { resolveSafeRedirect } from '~/features/auth/utils/safe-redirect';
import { buildUrl } from '~/lib/utils/paths';

interface StepConfig {
  number: OnboardingStepNumber;
  label: string;
  component: Record<string, unknown>;
  optional: boolean;
  required: boolean;
  skippable: boolean;
  buttonText?: string;
}

const props = defineProps<{ redirect?: string | null }>();

const steps: StepConfig[] = [
  {
    number: 1,
    label: '身份标签',
    component: IdentityTags,
    optional: true,
    required: false,
    skippable: true,
    buttonText: '下一步',
  },
  {
    number: 2,
    label: '关注推荐',
    component: FollowRecommend,
    optional: false,
    required: true,
    skippable: true,
    buttonText: '一键关注',
  },
  {
    number: 3,
    label: '答题升级',
    component: AnswerQuiz,
    optional: true,
    required: false,
    skippable: true,
    buttonText: '提交',
  },
  { number: 4, label: '新手任务', component: NewbieTasks, optional: false, required: false, skippable: false },
];

function navigate(dst: string): void {
  const url = buildUrl(dst);
  if (typeof window !== 'undefined') window.location.href = url;
}

const flow = useOnboardingFlow({ redirect: props.redirect ?? null, onDone: navigate });

const stepRefs = ref<Record<number, Record<string, unknown>>>({});

function setStepRef(el: Record<string, unknown> | null): void {
  if (el) stepRefs.value[flow.step] = el;
}

const currentConfig = computed(() => steps.find((s) => s.number === flow.step) ?? steps[0]);

const stepNote = computed(() => {
  if (currentConfig.value.optional) return '此步骤可跳过';
  if (currentConfig.value.required) return '此步骤为必填';
  return '';
});

const canProceed = computed(() => {
  const ref = stepRefs.value[flow.step];
  if (currentConfig.value.optional) return true;
  if (ref && typeof ref.isComplete === 'function') return !!ref.isComplete();
  return true;
});

async function collectData(): Promise<Record<string, unknown>> {
  const ref = stepRefs.value[flow.step];
  if (ref && typeof ref.getData === 'function') {
    const d = ref.getData();
    return typeof d === 'object' && d !== null ? (d as Record<string, unknown>) : {};
  }
  return {};
}

async function next(): Promise<void> {
  if (flow.step < 4) {
    const data = await collectData();
    const ok = await flow.saveStep(flow.step, data);
    if (!ok) return;
    flow.goNext();
    return;
  }
  // 最后一步：先一并持久化第 4 步资料，成功后才完成跳转（失败停留并显示错误）
  const ok = await flow.saveStep(4, await collectData());
  if (!ok) return;
  flow.markDone();
}

function prev(): void {
  flow.goPrev();
}

async function skip(): Promise<void> {
  await flow.skipAll();
}

onMounted(async () => {
  // 已完成用户（存量 localStorage 兜底）不重走
  if (localStorage.getItem('lkm-onboarding-done') === 'true') {
    navigate(resolveSafeRedirect(props.redirect ?? null));
    return;
  }
  await flow.load();
  if (flow.completed) {
    navigate(resolveSafeRedirect(props.redirect ?? null));
  }
});

function dotClass(number: number): string {
  if (number < flow.step || number === flow.step) return 'bg-primary text-on-primary';
  return 'bg-surface-3 text-text-muted';
}
</script>

<style scoped>
/* 步骤切换微动效（150-200ms），尊重 prefers-reduced-motion */
.step-enter-active,
.step-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.step-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
@media (prefers-reduced-motion: reduce) {
  .step-enter-active,
  .step-leave-active {
    transition: none;
  }
  .step-enter-from,
  .step-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
