<template>
  <div class="space-y-6">
    <div class="flex gap-2 border-b border-surface-3">
      <button
        v-for="tab in ['recruiting', 'showcase']"
        :key="tab"
        class="px-4 py-3 text-sm font-medium transition-colors relative"
        :class="activeTab === tab ? 'text-primary' : 'text-text-muted hover:text-deep-text'"
        @click="activeTab = tab"
      >
        {{ tab === 'recruiting' ? '招募' : '成果展示' }}
        <div v-if="activeTab === tab" class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"></div>
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <a
        v-for="proj in filteredProjects"
        :key="proj.id"
        :href="`/projects/${proj.id}`"
        class="profile-card group block"
      >
        <div class="profile-inner p-5 flex flex-col gap-2.5 h-full">
          <div class="flex items-center gap-2">
            <span
              v-if="proj.isPinned"
              class="text-xs px-1.5 py-0.5 rounded font-medium bg-red-100 dark:bg-red-950/30 text-red-600"
              >置顶</span
            >
            <span
              v-if="proj.isIncubated"
              class="text-xs px-1.5 py-0.5 rounded font-medium bg-amber-100 dark:bg-amber-950/30 text-amber-600"
              >七月孵化</span
            >
          </div>
          <h3 class="font-bold text-deep-text group-hover:text-primary transition-colors">{{ proj.name }}</h3>
          <p class="text-xs text-text-muted">{{ proj.initiatorName }} 发起</p>
          <div class="mt-1">
            <div class="h-1.5 rounded-full bg-surface-3">
              <div class="h-full rounded-full bg-primary transition-all" :style="{ width: proj.progress + '%' }"></div>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span :class="proj.isRecruiting ? 'text-green-500' : 'text-text-muted/60'">{{
              proj.isRecruiting ? '招募中' : '成果展示'
            }}</span>
            <span class="text-text-muted/60">进度 {{ proj.progress }}%</span>
          </div>
          <div v-if="proj.recruitingRoles.length" class="flex flex-wrap gap-1">
            <span
              v-for="r in proj.recruitingRoles"
              :key="r"
              class="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
              >缺{{ r }}</span
            >
          </div>
        </div>
      </a>
    </div>
    <div v-if="filteredProjects.length === 0" class="text-center py-12 text-sm text-text-muted">暂无项目</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { mockProjects } from '../data/mock-projects';

const activeTab = ref('recruiting');
const filteredProjects = computed(() =>
  mockProjects.filter((p) => p.type === activeTab.value).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
);
</script>
