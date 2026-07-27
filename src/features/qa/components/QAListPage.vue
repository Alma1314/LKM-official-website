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
          {{ tab.label }}
          <div
            v-if="activeTab === tab.key"
            class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
          ></div>
        </button>
      </div>
      <a href="/qa/ask" class="btn-primary px-4 py-2 rounded-lg text-sm font-semibold shrink-0">我要提问</a>
    </div>

    <div class="space-y-3">
      <a v-for="q in filteredQuestions" :key="q.id" :href="`/qa/${q.id}`" class="profile-card group block">
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
              {{ q.status === 'resolved' ? '已解决' : '待解决' }}
            </span>
            <span v-if="q.bounty" class="text-xs text-amber-500 font-medium">{{ q.bounty }} 积分悬赏</span>
          </div>
          <h3 class="font-semibold text-deep-text group-hover:text-primary transition-colors line-clamp-1">
            {{ q.title }}
          </h3>
          <div class="flex items-center justify-between text-xs text-text-muted/60">
            <span>{{ q.askerName }} · {{ formatTime(q.createdAt) }}</span>
            <span>{{ q.answerCount }} 回答 · {{ q.viewCount }} 浏览</span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { mockQuestions } from '../data/mock-questions';

const activeTab = ref('general');
const tabs = [
  { key: 'general', label: '求助' },
  { key: 'volunteer', label: '志愿/专业推荐' },
];

const filteredQuestions = computed(() => mockQuestions.filter((q) => q.type === activeTab.value));

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
</script>
