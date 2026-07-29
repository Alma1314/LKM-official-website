<template>
  <!-- 月度情绪图表（纯 SVG，无第三方库） -->
  <div class="mood-chart glass">
    <div class="mc-head">
      <span>📊 月度情绪</span>
      <select v-model="month" class="mc-select">
        <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
      </select>
    </div>
    <div v-if="hasData" class="mc-body">
      <svg :viewBox="`0 0 320 ${h}`" class="mc-svg">
        <!-- 网格线 -->
        <line
          v-for="g in gridY"
          :key="'g' + g"
          :x1="40"
          :x2="310"
          :y1="g"
          :y2="g"
          stroke="var(--card-border)"
          stroke-width="1"
        />
        <!-- 柱子 -->
        <g v-for="(d, i) in bars" :key="d.mood">
          <rect
            :x="50 + i * 38"
            :y="d.y"
            :width="26"
            :height="h - 30 - d.y"
            rx="6"
            :fill="colorOf(d.mood)"
            class="mc-bar"
          />
          <text :x="63 + i * 38" :y="h - 12" text-anchor="middle" font-size="9" fill="var(--text-sub)">
            {{ d.mood }}
          </text>
          <text :x="63 + i * 38" :y="d.y - 4" text-anchor="middle" font-size="9" fill="var(--text-main)">
            {{ d.count }}
          </text>
        </g>
        <line x1="40" :y1="h - 30" x2="310" :y2="h - 30" stroke="var(--text-sub)" stroke-width="1.5" />
      </svg>
      <p class="mc-tip">
        本月共记录 <b>{{ total }}</b> 次情绪，最常见：<b :style="{ color: topColor }">{{ topMood }}</b>
      </p>
    </div>
    <EmptyState v-else title="本月还没有情绪记录" sub="写信时选择心情标签即可统计" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import EmptyState from './EmptyState.vue';
import * as store from '../store/storage';
import { MOODS } from '../store/constants';

const months = ref([]);
const month = ref('');
const h = 200;
const gridY = [30, 70, 110, 150];

onMounted(() => {
  const all = store.getMoodLog();
  const ms = [...new Set(all.map((r) => r.month))].sort().reverse();
  months.value = ms.length ? ms : [new Date().toISOString().slice(0, 7)];
  month.value = months.value[0];
});

const data = computed(() => store.moodByMonth(month.value));
const hasData = computed(() => data.value.length > 0);
const total = computed(() => data.value.reduce((s, r) => s + r.count, 0));
const bars = computed(() => {
  const max = Math.max(1, ...data.value.map((d) => d.count));
  return data.value.map((d) => ({
    mood: d.mood,
    count: d.count,
    y: h - 30 - (d.count / max) * (h - 60),
  }));
});
const topMood = computed(() => (data.value.slice().sort((a, b) => b.count - a.count)[0] || {}).mood || '-');
const topColor = computed(() => colorOf(topMood.value));

const PALETTE = ['#e8a87c', '#c3aed6', '#a0c4ff', '#bdb2ff', '#ffd6a5', '#9bf6ff', '#ffc6ff', '#caffbf'];
function colorOf(mood) {
  const i = MOODS.indexOf(mood);
  return PALETTE[(i < 0 ? 0 : i) % PALETTE.length];
}
</script>

<style scoped>
.mood-chart {
  padding: 16px 18px;
  border-radius: var(--radius);
}
.mc-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  margin-bottom: 10px;
}
.mc-select {
  border-radius: var(--radius-pill);
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.4);
  color: var(--text-main);
  padding: 4px 10px;
  font-size: 12px;
}
.mc-svg {
  width: 100%;
  height: auto;
}
.mc-bar {
  transition: height 0.4s;
}
.mc-tip {
  font-size: 12px;
  color: var(--text-sub);
  text-align: center;
  margin: 8px 0 0;
}
</style>
