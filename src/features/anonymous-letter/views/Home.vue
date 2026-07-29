<template>
  <div class="home">
    <!-- 首页 Hero：打字机 slogan + 每日治愈文案 -->
    <section class="hero glass float-up">
      <h1 class="hero-title">
        <span class="grad-text typewriter">{{ typed }}</span
        ><span class="caret">|</span>
      </h1>
      <p class="hero-sub">把心事交给风，把秘密留给树洞。</p>
      <div class="hero-quote"><span class="quote-mark">"</span>{{ quote }}<span class="quote-mark">"</span></div>
      <div class="hero-acts">
        <button class="btn-grad" @click="go('/write')">✍️ 写一封信</button>
        <button class="chip" @click="go('/random')">🎲 随机树洞</button>
      </div>
    </section>

    <!-- 筛选栏：分类 + 排序 -->
    <section class="filters glass">
      <div class="filter-row">
        <span class="filter-label">分类</span>
        <div class="chips">
          <button class="chip" :class="{ active: activeCat === 'all' }" @click="setCat('all')">全部</button>
          <button
            v-for="c in categories"
            :key="c.key"
            class="chip"
            :class="{ active: activeCat === c.key }"
            @click="setCat(c.key)"
          >
            {{ c.emoji }} {{ c.label }}
          </button>
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">排序</span>
        <div class="chips">
          <button class="chip" :class="{ active: sort === 'new' }" @click="sort = 'new'">最新</button>
          <button class="chip" :class="{ active: sort === 'hot' }" @click="sort = 'hot'">最热</button>
          <button class="chip" :class="{ active: sort === 'random' }" @click="sort = 'random'">随机</button>
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">标签</span>
        <div class="chips">
          <button class="chip" :class="{ active: activeTag === '' }" @click="setTag('')">全部</button>
          <button
            v-for="t in tags"
            :key="t.key"
            class="chip"
            :class="{ active: activeTag === t.key }"
            @click="setTag(t.key)"
          >
            {{ t.emoji }} {{ t.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- 瀑布流信件广场 -->
    <section v-if="filtered.length" class="masonry">
      <div v-for="l in filtered" :key="l.id" class="masonry-col">
        <LetterCard :letter="l" @like="onLike" @fav="onFav" @same-type="onSameType" />
      </div>
    </section>
    <EmptyState v-else title="这个分类还没有信件" sub="换个分类，或写下第一封匿名信吧～" />

    <!-- 心情云标签墙（折叠入口） -->
    <section class="mood-cloud glass">
      <div class="mc-head">
        <span>🏷️ 心情云标签墙</span>
        <span class="mc-hint">点击标签筛选同心情信件</span>
      </div>
      <div class="mc-tags">
        <button
          v-for="(cnt, m) in moodStats"
          :key="m"
          class="mc-tag"
          :style="{ fontSize: 12 + Math.min(cnt, 8) + 'px' }"
          @click="filterByMood(m)"
        >
          #{{ m }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import LetterCard from '../components/LetterCard.vue';
import EmptyState from '../components/EmptyState.vue';
import { CATEGORIES, TAGS, MOODS, randomQuote } from '../store/constants';
import { getLetters, getFavorites, getFavGroups, saveFavGroups, toggleFavorite } from '../store/storage';

const router = useRouter();
const categories = CATEGORIES;
const tags = TAGS;

const allLetters = ref([]);
const activeCat = ref('all');
const activeTag = ref('');
const activeMood = ref('');
const sort = ref('new');

const quote = ref(randomQuote());

// 打字机 slogan
const SLOGAN = '在拾光树洞，做回最真实的自己';
const typed = ref('');
let ti = 0;
function typeLoop() {
  if (ti <= SLOGAN.length) {
    typed.value = SLOGAN.slice(0, ti);
    ti++;
    setTimeout(typeLoop, 110);
  }
}

function load() {
  const all = getLetters();
  // 只展示已公开的信件
  allLetters.value = all.filter((l) => l.status === 'published' && l.privacy === 'public');
}
onMounted(() => {
  load();
  typeLoop();
});
// 监听 storage 事件以支持跨标签页同步
window.addEventListener('storage', load);

const filtered = computed(() => {
  let list = allLetters.value.slice();
  // 分类筛选
  if (activeCat.value !== 'all') {
    list = list.filter((l) => l.category === activeCat.value);
  }
  // 心情筛选
  if (activeMood.value) {
    list = list.filter((l) => (l.moods || []).includes(activeMood.value));
  }
  // 标签筛选
  if (activeTag.value) {
    list = list.filter((l) => (l.tags || []).includes(activeTag.value));
  }
  // 排序
  if (sort.value === 'hot') {
    list.sort((a, b) => (b.likes || 0) + (b.favorites || 0) - ((a.likes || 0) + (a.favorites || 0)));
  } else if (sort.value === 'random') {
    list.sort(() => Math.random() - 0.5);
  } else {
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  return list;
});

const moodStats = computed(() => {
  const map = {};
  allLetters.value.forEach((l) =>
    (l.moods || []).forEach((m) => {
      map[m] = (map[m] || 0) + 1;
    })
  );
  MOODS.forEach((m) => {
    if (!map[m]) map[m] = 1;
  });
  return map;
});

function reload() {
  load();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function setCat(c) {
  activeCat.value = c;
  activeMood.value = '';
}
function setTag(t) {
  activeTag.value = t;
}
function filterByMood(m) {
  activeMood.value = activeMood.value === m ? '' : m;
  activeCat.value = 'all';
}
function onSameType(cat) {
  activeCat.value = cat;
  activeMood.value = '';
}

function onLike(letter) {
  // toggle local like
  letter.liked = !letter.liked;
  letter.likes = Math.max(0, (letter.likes || 0) + (letter.liked ? 1 : -1));
  load();
}
function onFav({ letter }) {
  const added = toggleFavorite(letter.id);
  letter.favorites = Math.max(0, (letter.favorites || 0) + (added ? 1 : -1));
  load();
}

function go(to) {
  router.push(to);
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.hero {
  padding: 30px 26px;
  text-align: center;
  border-radius: 26px;
}
.hero-title {
  font-size: clamp(22px, 4vw, 34px);
  font-weight: 800;
  margin: 0 0 6px;
  letter-spacing: 1px;
}
.typewriter {
  border-right: none;
}
.caret {
  color: var(--accent);
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.hero-sub {
  color: var(--text-sub);
  margin: 0 0 16px;
  font-size: 14px;
}
.hero-quote {
  display: inline-block;
  max-width: 620px;
  font-style: italic;
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.4);
  padding: 12px 20px;
  border-radius: 16px;
  margin-bottom: 18px;
  font-size: calc(14px * var(--font-scale));
}
.quote-mark {
  color: var(--accent);
  font-size: 20px;
  font-weight: 700;
}
.hero-acts {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.filters {
  padding: 16px 18px;
  border-radius: 20px;
}
.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 6px 0;
}
.filter-label {
  font-size: 13px;
  color: var(--text-sub);
  padding-top: 6px;
  flex-shrink: 0;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 瀑布流 */
.masonry {
  columns: 3;
  column-gap: 16px;
}
.masonry-col {
  break-inside: avoid;
  margin-bottom: 16px;
  display: inline-block;
  width: 100%;
}
@media (max-width: 1024px) {
  .masonry {
    columns: 2;
  }
}
@media (max-width: 600px) {
  .masonry {
    columns: 1;
  }
}

.mood-cloud {
  padding: 16px 18px;
  border-radius: 20px;
}
.mc-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
  font-weight: 700;
}
.mc-hint {
  font-size: 11px;
  color: var(--text-sub);
  font-weight: 400;
}
.mc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.mc-tag {
  border: none;
  background: rgba(255, 255, 255, 0.45);
  color: var(--accent);
  padding: 4px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
}
.mc-tag:hover {
  background: var(--grad-soft);
  color: var(--accent);
  border: 1px solid var(--blue);
  transform: translateY(-2px);
}
</style>
