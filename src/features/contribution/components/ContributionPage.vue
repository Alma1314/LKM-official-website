<template>
  <div class="space-y-6">
    <!-- 顶部用户积分卡片 -->
    <div class="bg-card-bg border border-surface-3 rounded-2xl p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div
          class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl"
        >
          我
        </div>
        <div class="flex-1">
          <h1 class="text-xl font-bold text-deep-text">贡献系统</h1>
          <div class="flex items-center gap-3 mt-1 text-sm">
            <span class="text-text-muted">当前积分：</span>
            <span class="text-2xl font-bold text-primary">12,500</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">专栏作者</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 导航 -->
    <div class="flex gap-1 overflow-x-auto pb-1">
      <button
        v-for="tab in pageTabs"
        :key="tab.key"
        class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0"
        :class="
          activeTab === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-3 text-text-muted hover:bg-surface-3/70'
        "
        @click="activeTab = tab.key"
      >
        <Icon :icon="tab.icon" class="w-4 h-4 inline mr-1" />
        {{ tab.label }}
      </button>
    </div>

    <!-- 成就墙 -->
    <div v-if="activeTab === 'achievements'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <div
        v-for="ach in allAchievements"
        :key="ach.id"
        class="rounded-xl p-4 text-center transition-colors"
        :class="
          ach.unlocked ? 'bg-card-bg border border-surface-3' : 'bg-surface-3/30 border border-surface-3 opacity-50'
        "
      >
        <div
          class="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2"
          :class="ach.unlocked ? 'bg-primary/10 text-primary' : 'bg-surface-3 text-text-muted'"
        >
          <Icon :icon="ach.icon" class="w-6 h-6" />
        </div>
        <div class="font-semibold text-sm" :class="ach.unlocked ? 'text-deep-text' : 'text-text-muted'">
          {{ ach.name }}
        </div>
        <div class="text-xs text-text-muted/60 mt-1">{{ ach.description }}</div>
        <div v-if="!ach.unlocked" class="mt-2">
          <div class="h-1.5 rounded-full bg-surface-3 overflow-hidden">
            <div class="h-full rounded-full bg-primary/40" :style="{ width: ach.progressPercent + '%' }"></div>
          </div>
          <div class="text-xs text-text-muted/50 mt-0.5">{{ ach.progress }}/{{ ach.threshold }}</div>
        </div>
      </div>
    </div>

    <!-- 积分明细 -->
    <div v-if="activeTab === 'points'" class="bg-card-bg border border-surface-3 rounded-2xl overflow-hidden">
      <div class="divide-y divide-surface-3">
        <div v-for="log in pointLogs" :key="log.id" class="flex items-center justify-between px-5 py-3">
          <div>
            <div class="text-sm text-deep-text">{{ log.reason }}</div>
            <div class="text-xs text-text-muted/60">{{ log.createdAt }}</div>
          </div>
          <span class="text-sm font-semibold" :class="log.amount > 0 ? 'text-green-500' : 'text-red-500'">
            {{ log.amount > 0 ? '+' : '' }}{{ log.amount }}
          </span>
        </div>
      </div>
    </div>

    <!-- 排行榜 -->
    <div v-if="activeTab === 'leaderboard'" class="bg-card-bg border border-surface-3 rounded-2xl overflow-hidden">
      <div class="flex border-b border-surface-3">
        <button
          v-for="p in ['daily', 'weekly', 'total']"
          :key="p"
          class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
          :class="
            leaderboardPeriod === p ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-deep-text'
          "
          @click="leaderboardPeriod = p"
        >
          {{ periodLabels[p] }}
        </button>
      </div>
      <div class="divide-y divide-surface-3">
        <div v-for="entry in currentLeaderboard" :key="entry.username" class="flex items-center gap-3 px-5 py-3">
          <span
            class="w-8 text-center font-bold text-sm"
            :class="
              entry.rank === 1
                ? 'text-yellow-400'
                : entry.rank === 2
                  ? 'text-gray-300'
                  : entry.rank === 3
                    ? 'text-amber-600'
                    : 'text-text-muted/60'
            "
          >
            {{ entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank }}
          </span>
          <div
            class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm"
          >
            {{ entry.displayName.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-deep-text truncate">{{ entry.displayName }}</div>
            <div class="text-xs text-text-muted/60">{{ entry.title }}</div>
          </div>
          <span class="text-sm font-semibold text-primary">{{ entry.points.toLocaleString() }} 分</span>
        </div>
      </div>
    </div>

    <!-- 兑换区 -->
    <div v-if="activeTab === 'exchange'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in exchangeItems"
        :key="item.id"
        class="bg-card-bg border border-surface-3 rounded-xl p-5 flex flex-col"
      >
        <div class="flex items-center gap-2 mb-2">
          <span
            class="text-xs px-1.5 py-0.5 rounded-full"
            :class="
              item.isVirtual
                ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-500'
                : 'bg-amber-100 dark:bg-amber-950/30 text-amber-500'
            "
          >
            {{ item.isVirtual ? '虚拟' : '实物' }}
          </span>
          <span v-if="item.stock > 0 && item.stock < 20" class="text-xs text-red-500">仅剩 {{ item.stock }}</span>
        </div>
        <h3 class="font-semibold text-deep-text mb-1">{{ item.name }}</h3>
        <p class="text-xs text-text-muted mb-3 flex-1">{{ item.description }}</p>
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold text-primary">{{ item.pointsCost }} 积分</span>
          <button
            class="btn-primary px-4 py-1.5 rounded-lg text-sm font-medium"
            :disabled="item.stock === 0"
            @click="handleExchange(item)"
          >
            {{ item.stock === 0 ? '已售罄' : '兑换' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 任务中心 -->
    <div v-if="activeTab === 'tasks'" class="space-y-4">
      <!-- 打卡 -->
      <div class="bg-card-bg border border-surface-3 rounded-2xl p-6 text-center">
        <div class="text-4xl mb-2">📅</div>
        <h3 class="text-lg font-semibold text-deep-text">每日打卡</h3>
        <p class="text-sm text-text-muted mb-3">连续打卡 {{ 7 }} 天</p>
        <button
          class="btn-primary px-8 py-3 rounded-xl text-base font-semibold"
          :class="dailyCheckedIn ? 'opacity-50 cursor-not-allowed' : ''"
          :disabled="dailyCheckedIn"
          @click="doCheckin"
        >
          {{ dailyCheckedIn ? '今日已打卡 ✓' : '打卡 +5 积分' }}
        </button>
      </div>

      <!-- 任务列表 -->
      <div class="bg-card-bg border border-surface-3 rounded-2xl p-6">
        <h3 class="font-semibold text-deep-text mb-4">今日任务</h3>
        <div class="space-y-3">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center gap-3 p-3 rounded-lg border"
            :class="
              task.completed
                ? 'border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-950/10'
                : 'border-surface-3'
            "
          >
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              :class="task.completed ? 'bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600 text-white' : 'border-surface-3 text-transparent'"
            >
              <Icon v-if="task.completed" icon="material-symbols:check" class="w-3 h-3" />
            </div>
            <div class="flex-1 min-w-0">
              <div
                class="text-sm font-medium"
                :class="task.completed ? 'text-text-muted line-through' : 'text-deep-text'"
              >
                {{ task.title }}
              </div>
              <div class="text-xs text-text-muted/60 mt-0.5">
                {{ task.description }} · 奖励 {{ task.rewardPoints }} 积分
              </div>
              <div class="mt-1.5">
                <div class="h-1.5 rounded-full bg-surface-3 overflow-hidden w-32">
                  <div
                    class="h-full rounded-full bg-primary transition-all"
                    :style="{ width: (task.currentProgress / task.requirementCount) * 100 + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-text-muted/50">{{ task.currentProgress }}/{{ task.requirementCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import {
  achievements,
  userAchievements,
  pointLogs,
  leaderboard,
  tasks,
  exchangeItems,
} from '../data/mock-contribution';

const activeTab = ref('achievements');
const leaderboardPeriod = ref<'daily' | 'weekly' | 'total'>('weekly');
const dailyCheckedIn = ref(false);

const pageTabs = [
  { key: 'achievements', label: '成就墙', icon: 'tabler:trophy' },
  { key: 'points', label: '积分明细', icon: 'tabler:coin' },
  { key: 'leaderboard', label: '排行榜', icon: 'tabler:chart-bar' },
  { key: 'exchange', label: '兑换区', icon: 'tabler:gift' },
  { key: 'tasks', label: '任务中心', icon: 'tabler:checklist' },
] as const;

const periodLabels = { daily: '日榜', weekly: '周榜', total: '总榜' };

const allAchievements = computed(() =>
  achievements.map((ach) => {
    const ua = userAchievements.find((u) => u.achievementId === ach.id);
    return {
      ...ach,
      unlocked: ua?.unlocked ?? false,
      progress: ua?.progress ?? 0,
      threshold: ach.requirement.threshold,
      progressPercent: Math.min(100, ((ua?.progress ?? 0) / ach.requirement.threshold) * 100),
    };
  })
);

const currentLeaderboard = computed(() => leaderboard[leaderboardPeriod.value]);

function doCheckin() {
  dailyCheckedIn.value = true;
}

function handleExchange(item: (typeof exchangeItems)[0]) {
  alert(`兑换成功！您已花费 ${item.pointsCost} 积分兑换"${item.name}"`);
}
</script>
