<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-semibold text-deep-text">关注你感兴趣的内容</h3>
      <p class="text-sm text-text-muted mt-1">
        至少选择 <span class="text-primary font-semibold">3 个</span> 板块或作者（已选 {{ selectedIds.length }}/3）
      </p>
    </div>

    <!-- Tab 切换 -->
    <div class="flex justify-center gap-2">
      <button
        type="button"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === 'category'
          ? 'bg-primary text-on-primary'
          : 'bg-surface-3 text-text-muted hover:bg-surface-3/70'"
        @click="activeTab = 'category'"
      >
        板块推荐
      </button>
      <button
        type="button"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === 'author'
          ? 'bg-primary text-on-primary'
          : 'bg-surface-3 text-text-muted hover:bg-surface-3/70'"
        @click="activeTab = 'author'"
      >
        作者推荐
      </button>
    </div>

    <!-- 板块列表 -->
    <div v-if="activeTab === 'category'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="item in recommendCategories"
        :key="item.id"
        type="button"
        class="flex items-start gap-3 p-3 rounded-lg border text-left transition-colors"
        :class="selectedIds.includes(item.id)
          ? 'border-primary bg-primary/5'
          : 'border-surface-3 bg-card-bg hover:border-primary/30'"
        @click="toggle(item.id)"
      >
        <Icon :icon="item.icon" class="w-8 h-8 shrink-0 mt-0.5" :class="selectedIds.includes(item.id) ? 'text-primary' : 'text-text-muted'" />
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm text-deep-text flex items-center gap-2">
            {{ item.name }}
            <span v-if="selectedIds.includes(item.id)" class="text-primary text-xs">✓</span>
          </div>
          <div class="text-xs text-text-muted mt-0.5 line-clamp-1">{{ item.description }}</div>
          <div class="text-xs text-text-muted/60 mt-1">{{ item.memberCount }} 成员</div>
        </div>
      </button>
    </div>

    <!-- 作者列表 -->
    <div v-if="activeTab === 'author'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="item in recommendAuthors"
        :key="item.id"
        type="button"
        class="flex items-start gap-3 p-3 rounded-lg border text-left transition-colors"
        :class="selectedIds.includes(item.id)
          ? 'border-primary bg-primary/5'
          : 'border-surface-3 bg-card-bg hover:border-primary/30'"
        @click="toggle(item.id)"
      >
        <div class="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {{ item.name.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm text-deep-text flex items-center gap-2">
            {{ item.name }}
            <span v-if="selectedIds.includes(item.id)" class="text-primary text-xs">✓</span>
          </div>
          <div class="text-xs text-text-muted mt-0.5 line-clamp-1">{{ item.description }}</div>
          <div class="text-xs text-text-muted/60 mt-1">{{ item.memberCount }} 关注者</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { recommendCategories, recommendAuthors } from '../../data/onboarding-tags';

const activeTab = ref<'category' | 'author'>('category');
const selectedIds = ref<string[]>([]);

function toggle(id: string) {
  const idx = selectedIds.value.indexOf(id);
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1);
  } else {
    selectedIds.value.push(id);
  }
}

defineExpose({
  isComplete: () => selectedIds.value.length >= 3,
  getData: () => [...selectedIds.value],
});
</script>
