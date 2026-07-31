<template>
  <div class="space-y-8">
    <div v-for="group in groupedCompetitions" :key="group.status">
      <h2 class="text-lg font-semibold text-deep-text mb-3">{{ statusLabel(group.status) }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="comp in group.items" :key="comp.id" class="bg-card-bg border border-surface-3 rounded-xl p-5">
          <h3 class="font-bold text-lg text-deep-text">{{ comp.title }}</h3>
          <p class="text-sm text-text-muted mt-1">{{ comp.description }}</p>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-text-muted/60">
            <span>开始：{{ comp.startDate }}</span>
            <span>结束：{{ comp.endDate }}</span>
            <span v-if="comp.status === 'ongoing'">答题时长：{{ comp.duration }} 分钟</span>
          </div>
          <div class="flex items-center justify-between mt-4">
            <span class="text-sm text-text-muted" v-if="comp.participantCount > 0"
              >{{ comp.participantCount }} 人参赛</span
            >
            <span v-else class="text-sm text-text-muted">即将开始</span>
            <a
              v-if="comp.status === 'ongoing'"
              :href="buildUrl(`/competition/${comp.id}/exam`)"
              class="btn-primary px-5 py-2 rounded-lg text-sm font-semibold"
              >进入答题</a
            >
            <span v-else-if="comp.status === 'upcoming'" class="text-sm text-primary font-medium">即将开始</span>
            <span v-else class="text-sm text-text-muted/60">已结束</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { mockCompetitions } from '../data/mock-competitions';
import { buildUrl } from '~/core/utils/paths';

const groupedCompetitions = computed(() => {
  const order = { ongoing: 0, upcoming: 1, ended: 2 };
  const groups: Record<string, typeof mockCompetitions> = { ongoing: [], upcoming: [], ended: [] };
  for (const c of mockCompetitions) groups[c.status].push(c);
  return Object.entries(groups)
    .sort(([a], [b]) => order[a] - order[b])
    .map(([status, items]) => ({ status, items }));
});

function statusLabel(s: string) {
  switch (s) {
    case 'ongoing':
      return '进行中';
    case 'upcoming':
      return '即将开始';
    case 'ended':
      return '已结束';
    default:
      return s;
  }
}
</script>
