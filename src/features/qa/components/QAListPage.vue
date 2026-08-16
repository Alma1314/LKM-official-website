<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex gap-2 border-b border-surface-3 flex-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-4 py-3 text-sm font-medium transition-colors relative"
          :class="activeTab === tab.key ? 'text-primary' : 'text-text-muted hover:text-deep-text'"
          @click="activeTab = tab.key"
        >
          {{ t(tab.label) }}
          <div
            v-if="activeTab === tab.key"
            class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
          ></div>
        </button>
      </div>
      <button class="btn-primary px-4 py-2 rounded-lg text-sm font-semibold shrink-0" @click="askModalOpen = true">
        {{ t('page.qa.ask') }}
      </button>
    </div>

    <div class="space-y-3">
      <a v-for="q in filteredQuestions" :key="q.id" :href="buildUrl(`/qa/${q.id}`)" class="profile-card group block">
        <div class="profile-inner p-4 flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span
              class="text-xs px-1.5 py-0.5 rounded-full font-medium"
              :class="
                q.status === 'resolved'
                  ? 'bg-green-100 dark:bg-green-950/30 text-green-500'
                  : 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-500'
              "
            >
              {{ q.status === 'resolved' ? t('page.qa.resolved') : t('page.qa.unresolved') }}
            </span>
            <span v-if="q.bounty" class="text-xs text-amber-500 font-medium">
              {{ t('page.qa.bounty', { count: q.bounty }) }}
            </span>
          </div>
          <h3 class="font-semibold text-deep-text group-hover:text-primary transition-colors line-clamp-1">
            {{ t(q.title) }}
          </h3>
          <div class="flex items-center justify-between text-xs text-text-muted/60">
            <span>{{ t(q.askerName) }} · {{ formatTime(q.createdAt) }}</span>
            <span>
              {{ t('page.qa.answers', { count: q.answerCount }) }} · {{ t('page.qa.views', { count: q.viewCount }) }}
            </span>
          </div>
        </div>
      </a>
    </div>

    <AskQuestionModal v-model:show="askModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { t } from '~/lib/i18n';
import { mockQuestions } from '../data/mock-questions';
import { buildUrl } from '~/lib/utils/paths';
import AskQuestionModal from './AskQuestionModal.vue';

const activeTab = ref('general');
const askModalOpen = ref(false);
const tabs = [
  { key: 'general', label: 'page.qa.tabHelp' },
  { key: 'volunteer', label: 'page.qa.tabVolunteer' },
];

const filteredQuestions = computed(() => mockQuestions.filter((q) => q.type === activeTab.value));

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return t('common.today');
  if (days === 1) return t('page.qa.yesterday');
  if (days < 7) return t('page.qa.daysAgo', { count: days });
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
</script>
