<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-semibold text-deep-text">{{ t('onboarding.follow.title') }}</h3>
      <p class="text-sm text-text-muted mt-1">
        {{ t('onboarding.follow.hint', { min: 3, selected: selectedIds.length }) }}
      </p>
    </div>

    <!-- Tab 切换 -->
    <div class="flex justify-center gap-2">
      <button
        type="button"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="
          activeTab === 'category' ? 'bg-primary text-on-primary' : 'bg-surface-3 text-text-muted hover:bg-surface-3/70'
        "
        @click="activeTab = 'category'"
      >
        {{ t('onboarding.follow.categoriesTab') }}
      </button>
      <button
        type="button"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="
          activeTab === 'author' ? 'bg-primary text-on-primary' : 'bg-surface-3 text-text-muted hover:bg-surface-3/70'
        "
        @click="activeTab = 'author'"
      >
        {{ t('onboarding.follow.authorsTab') }}
      </button>
    </div>

    <!-- 板块列表 -->
    <div v-if="activeTab === 'category'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="item in recommendCategories"
        :key="item.id"
        type="button"
        class="flex items-start gap-3 p-3 rounded-lg border text-left transition-colors"
        :class="
          selectedIds.includes(item.id)
            ? 'border-primary bg-primary/5'
            : 'border-surface-3 bg-card-bg hover:border-primary/30'
        "
        @click="toggle(item.id)"
      >
        <Icon
          :icon="item.icon"
          class="w-8 h-8 shrink-0 mt-0.5"
          :class="selectedIds.includes(item.id) ? 'text-primary' : 'text-text-muted'"
        />
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm text-deep-text flex items-center gap-2">
            {{ item.name }}
            <span v-if="selectedIds.includes(item.id)" class="text-primary text-xs">✓</span>
          </div>
          <div class="text-xs text-text-muted mt-0.5 line-clamp-1">{{ item.description }}</div>
          <div class="text-xs text-text-muted/60 mt-1">{{ item.memberCount }} {{ t('onboarding.follow.members') }}</div>
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
        :class="
          selectedIds.includes(item.id)
            ? 'border-primary bg-primary/5'
            : 'border-surface-3 bg-card-bg hover:border-primary/30'
        "
        @click="toggle(item.id)"
      >
        <div
          class="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm"
        >
          {{ item.name.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm text-deep-text flex items-center gap-2">
            {{ item.name }}
            <span v-if="selectedIds.includes(item.id)" class="text-primary text-xs">✓</span>
          </div>
          <div class="text-xs text-text-muted mt-0.5 line-clamp-1">{{ item.description }}</div>
          <div class="text-xs text-text-muted/60 mt-1">
            {{ item.memberCount }} {{ t('onboarding.follow.followers') }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { t } from '~/lib/i18n';

interface RecommendItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
}

const recommendCategories: RecommendItem[] = [
  {
    id: 'basic-science',
    name: '基础学科',
    description: '数学、物理、化学、生物、天文等基础科学讨论区',
    icon: 'tabler:atom-2',
    memberCount: 1200,
  },
  {
    id: 'applied-science',
    name: '应用科学',
    description: '信息科学、电子电气、工程学、医学等应用领域',
    icon: 'tabler:robot',
    memberCount: 890,
  },
  {
    id: 'language',
    name: '语言学习',
    description: '英语、俄语、德语、日语等多语言学习交流',
    icon: 'tabler:language',
    memberCount: 340,
  },
  {
    id: 'hobby-chess',
    name: '棋牌社',
    description: '象棋、围棋、五子棋、桥牌等各类棋牌交流',
    icon: 'tabler:chess',
    memberCount: 280,
  },
  {
    id: 'hobby-game',
    name: '游戏社',
    description: '主机、PC、手游玩家聚集地',
    icon: 'tabler:device-gamepad-2',
    memberCount: 420,
  },
  {
    id: 'hobby-sci-fi',
    name: '科幻文学社',
    description: '科幻创作、经典赏析、未来构想',
    icon: 'tabler:rocket',
    memberCount: 190,
  },
  {
    id: 'hobby-music',
    name: '土鳖音乐社',
    description: '乐理讨论、乐器交流、联欢晚会筹备',
    icon: 'tabler:music',
    memberCount: 310,
  },
  {
    id: 'hobby-cooking',
    name: '料理学社',
    description: '厨艺交流、美食分享、料理教学',
    icon: 'tabler:chef-hat',
    memberCount: 160,
  },
  {
    id: 'math',
    name: '数学',
    description: '数学爱好者与专业人员的交流园地',
    icon: 'tabler:math-symbols',
    memberCount: 520,
  },
  {
    id: 'physics',
    name: '物理学&天文学',
    description: '探索宇宙奥秘，讨论物理前沿',
    icon: 'tabler:telescope',
    memberCount: 480,
  },
];

const recommendAuthors: RecommendItem[] = [
  {
    id: 'author-1',
    name: '七月O',
    description: '中国科学院国家天文台博士，引力波与黑洞物理方向',
    icon: 'tabler:user',
    memberCount: 350,
  },
  {
    id: 'author-2',
    name: '七月花',
    description: '有理想的博士，梦想每个孩子都能接触科学',
    icon: 'tabler:user',
    memberCount: 420,
  },
  {
    id: 'author-3',
    name: '七月墨染',
    description: '双非物理，卧薪尝胆三千日，大雪深埋终成金',
    icon: 'tabler:user',
    memberCount: 280,
  },
  {
    id: 'author-4',
    name: '七月郁离',
    description: '群务组组长，群务无小事，用心皆风景',
    icon: 'tabler:user',
    memberCount: 200,
  },
  {
    id: 'author-5',
    name: '七月有枝',
    description: '前活动策划组组员，且停且忘且随风',
    icon: 'tabler:user',
    memberCount: 150,
  },
];

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
