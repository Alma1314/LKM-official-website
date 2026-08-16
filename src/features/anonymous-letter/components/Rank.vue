<template>
  <div class="rank">
    <h1 class="page-title">🏆 {{ t("treehole.rank.title") }}</h1>
    <p class="page-sub">{{ t("treehole.rank.subtitle") }}</p>

    <div class="tabs">
      <button
        class="chip"
        :class="{ active: range === 'today' }"
        @click="range = 'today'"
      >
        {{ t("treehole.rank.todayTab") }}
      </button>
      <button
        class="chip"
        :class="{ active: range === 'week' }"
        @click="range = 'week'"
      >
        {{ t("treehole.rank.weekTab") }}
      </button>
    </div>

    <section v-if="rankList.length" class="rank-list">
      <div
        v-for="(l, i) in rankList"
        :key="l.id"
        class="rank-item glass glass-hover"
      >
        <div class="rank-no" :class="'no' + (i + 1)">{{ i + 1 }}</div>
        <div class="rank-body">
          <div class="rank-head">
            <span
              class="rank-cat"
              :style="{ background: getCategory(l.category).color }"
              >{{ getCategory(l.category).emoji }}</span
            >
            <span class="rank-code">{{ l.codename }}</span>
            <span class="rank-heat"
              >🔥 {{ (l.likes || 0) + (l.favorites || 0) }}</span
            >
          </div>
          <p class="rank-content">{{ l.content }}</p>
        </div>
      </div>
    </section>
    <EmptyState
      v-else
      :title="t('treehole.rank.emptyTitle')"
      :sub="t('treehole.rank.emptySub')"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import EmptyState from "../components/EmptyState.vue";
import { getCategory } from "../stores/constants";
import { getLetters } from "../stores/storage";
import { t } from "~/lib/i18n";

const range = ref("today");
const letters = ref([]);
onMounted(() => {
  letters.value = getLetters().filter(
    (l) => l.status === "published" && l.privacy === "public",
  );
});

const rankList = computed(() => {
  const now = Date.now();
  const within = range.value === "today" ? 86400000 : 7 * 86400000;
  return letters.value
    .filter((l) => now - l.createdAt < within)
    .sort(
      (a, b) =>
        (b.likes || 0) +
        (b.favorites || 0) -
        (a.likes || 0) -
        (a.favorites || 0),
    )
    .slice(0, 20);
});
</script>

<style scoped>
.page-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 4px;
}
.page-sub {
  color: var(--text-sub);
  margin: 0 0 18px;
  font-size: 14px;
}
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rank-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  align-items: flex-start;
}
.rank-no {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.5);
  color: var(--text-sub);
  flex-shrink: 0;
}
.rank-no.no1 {
  background: linear-gradient(135deg, #ffd86b, #ff9a3c);
  color: #fff;
}
.rank-no.no2 {
  background: linear-gradient(135deg, #d6e4ff, #a0c4ff);
  color: #fff;
}
.rank-no.no3 {
  background: linear-gradient(135deg, #ffd6c2, #ffb38a);
  color: #fff;
}
.rank-body {
  flex: 1;
  min-width: 0;
}
.rank-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.rank-cat {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
}
.rank-code {
  font-size: 13px;
  font-weight: 700;
}
.rank-heat {
  margin-left: auto;
  font-size: 12px;
  color: var(--accent);
}
.rank-content {
  margin: 0;
  font-size: calc(14px * var(--font-scale));
  line-height: 1.7;
  white-space: pre-wrap;
}
</style>
