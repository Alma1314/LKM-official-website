<template>
  <div class="th-app" :class="{ 'low-perf': lowPerf, 'high-contrast': highContrast }">
    <!-- 全局 CSS 变量 + 主题导入 -->
    <div class="app-root">

      <!-- 背景层 -->
      <div class="bg-flow" aria-hidden="true"></div>
      <Particles />
      <!-- 角落装饰 -->
      <div class="corner-deco tl"></div>
      <div class="corner-deco br"></div>
      <div class="corner-deco tr"></div>

      <!-- ==================== 顶部导航栏 ==================== -->
      <header class="top-nav glass">
        <div class="nav-inner">
          <!-- 返回主站 -->
          <a :href="`${base}apps`" class="nav-exit-btn" title="返回主站">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </a>
          <!-- 品牌 -->
          <a :href="`${base}treehole`" class="nav-brand" aria-label="拾光树洞首页">
            <span class="brand-icon">🌳</span>
            <span class="brand-text grad-text">拾光树洞</span>
          </a>

          <!-- 桌面导航链接 -->
          <nav class="nav-links" aria-label="主导航">
            <a :href="`${base}treehole`" class="nav-link active">广场</a>
            <a :href="`${base}treehole/random`" class="nav-link">随机</a>
            <a :href="`${base}treehole/bottle`" class="nav-link">漂流瓶</a>
            <a :href="`${base}treehole/wish`" class="nav-link">许愿墙</a>
            <a :href="`${base}treehole/rank`" class="nav-link">榜单</a>
          </nav>

          <!-- 右侧操作 -->
          <div class="nav-actions">
            <a :href="`${base}treehole/write`" class="btn-grad nav-write-btn">✍️ 写信</a>
            <button class="nav-icon-btn" @click="toggleTheme" :aria-label="app.isNight ? '切换到日间模式' : '切换到夜间模式'">
              {{ app.isNight ? '☀️' : '🌙' }}
            </button>
            <button class="nav-icon-btn hamburger" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="菜单">
              <span :class="{ open: mobileMenuOpen }">☰</span>
            </button>
          </div>
        </div>
      </header>

      <!-- 移动端下拉菜单 -->
      <transition name="slide-down">
        <nav v-if="mobileMenuOpen" class="mobile-menu glass" aria-label="移动端导航" @click="mobileMenuOpen = false">
          <a :href="`${base}treehole`" class="mobile-nav-link active">🏠 广场</a>
          <a :href="`${base}treehole/write`" class="mobile-nav-link">✍️ 写信</a>
          <a :href="`${base}treehole/random`" class="mobile-nav-link">🎲 随机树洞</a>
          <a :href="`${base}treehole/bottle`" class="mobile-nav-link">🍾 漂流瓶</a>
          <a :href="`${base}treehole/wish`" class="mobile-nav-link">⭐ 许愿墙</a>
          <a :href="`${base}treehole/rank`" class="mobile-nav-link">🏆 榜单</a>
          <a :href="`${base}treehole/mine`" class="mobile-nav-link">📬 我的信箱</a>
          <a :href="`${base}treehole/messages`" class="mobile-nav-link">💬 私信</a>
          <a :href="`${base}treehole/settings`" class="mobile-nav-link">⚙️ 设置</a>
        </nav>
      </transition>

      <!-- ==================== 主内容区 ==================== -->
      <main class="main-content float-up">
        <div class="container">

          <!-- 首页 Hero：打字机 slogan + 每日治愈文案 -->
          <section class="hero glass float-up">
            <h1 class="hero-title">
              <span class="grad-text typewriter">{{ typed }}</span><span class="caret">|</span>
            </h1>
            <p class="hero-sub">把心事交给风，把秘密留给树洞。</p>
            <div class="hero-quote">
              <span class="quote-mark">"</span>{{ quote }}<span class="quote-mark">"</span>
            </div>
            <div class="hero-acts">
              <a :href="`${base}treehole/write`" class="btn-grad">✍️ 写一封信</a>
              <a :href="`${base}treehole/random`" class="chip">🎲 随机树洞</a>
            </div>
          </section>

          <!-- 筛选栏：分类 + 排序 + 标签 -->
          <section class="filters glass">
            <div class="filter-row">
              <span class="filter-label">分类</span>
              <div class="chips">
                <button class="chip" :class="{ active: activeCat === 'all' }" @click="setCat('all')">全部</button>
                <button
                  v-for="c in categories" :key="c.key"
                  class="chip" :class="{ active: activeCat === c.key }"
                  @click="setCat(c.key)"
                >{{ c.emoji }} {{ c.label }}</button>
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
                  v-for="t in tags" :key="t.key"
                  class="chip" :class="{ active: activeTag === t.key }"
                  @click="setTag(t.key)"
                >{{ t.emoji }} {{ t.label }}</button>
              </div>
            </div>
          </section>

          <!-- 瀑布流信件广场 -->
          <section v-if="filtered.length" class="masonry">
            <div v-for="l in filtered" :key="l.id" class="masonry-col">
              <LetterCard
                :letter="l"
                @like="onLike" @fav="onFav" @same-type="onSameType"
              />
            </div>
          </section>
          <EmptyState v-else title="这个分类还没有信件" sub="换个分类，或写下第一封匿名信吧～" />

          <!-- 心情云标签墙 -->
          <section class="mood-cloud glass">
            <div class="mc-head">
              <span>🏷️ 心情云标签墙</span>
              <span class="mc-hint">点击标签筛选同心情信件</span>
            </div>
            <div class="mc-tags">
              <button
                v-for="(cnt, m) in moodStats" :key="m"
                class="mc-tag" :style="{ fontSize: 12 + Math.min(cnt, 8) + 'px' }"
                @click="filterByMood(m)"
              >#{{ m }}</button>
            </div>
          </section>

        </div>
      </main>

      <!-- ==================== 移动端底部导航栏 ==================== -->
      <nav class="bottom-nav glass" aria-label="移动端底部导航">
        <a :href="`${base}treehole`" class="bn-item active">
          <span class="bn-icon">🏠</span>
          <span class="bn-label">广场</span>
        </a>
        <a :href="`${base}treehole/random`" class="bn-item">
          <span class="bn-icon">🎲</span>
          <span class="bn-label">随机</span>
        </a>
        <a :href="`${base}treehole/write`" class="bn-item bn-center">
          <span class="bn-center-circle">✍️</span>
        </a>
        <a :href="`${base}treehole/bottle`" class="bn-item">
          <span class="bn-icon">🍾</span>
          <span class="bn-label">漂流瓶</span>
        </a>
        <a :href="`${base}treehole/mine`" class="bn-item">
          <span class="bn-icon">📬</span>
          <span class="bn-label">信箱</span>
        </a>
      </nav>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import LetterCard from '../components/LetterCard.vue'
import EmptyState from '../components/EmptyState.vue'
import Particles from '../components/Particles.vue'
import { CATEGORIES, TAGS, MOODS, randomQuote } from '../store/constants'
import { getLetters, getFavorites, getFavGroups, saveFavGroups, toggleFavorite } from '../store/storage'
import { useApp } from '../store/app'
import '../styles/global.css'

const base = import.meta.env.BASE_URL || '/'

const app = useApp()
const categories = CATEGORIES

function toggleTheme() {
  app.toggleTheme()
  const dark = document.documentElement.classList.contains("dark")
  document.documentElement.classList.toggle("dark", dark)
}

const tags = TAGS

const allLetters = ref([])
const activeCat = ref('all')
const activeTag = ref('')
const activeMood = ref('')
const sort = ref('new')
const mobileMenuOpen = ref(false)

const quote = ref(randomQuote())

// 打字机 slogan
const SLOGAN = '在拾光树洞，做回最真实的自己'
const typed = ref('')
let ti = 0
function typeLoop() {
  if (ti <= SLOGAN.length) {
    typed.value = SLOGAN.slice(0, ti)
    ti++
    setTimeout(typeLoop, 110)
  }
}

function load() {
  const all = getLetters()
  allLetters.value = all.filter(l => l.status === 'published' && l.privacy === 'public')
}

onMounted(() => {
  load()
  typeLoop()
  // Sync theme: ensure data-theme mirrors dark class
  const isDark = document.documentElement.classList.contains("dark")
  const html = document.documentElement
  if (isDark) {
    html.setAttribute('data-theme', 'night')
    if (app.isNight.value === false) app.setTheme('night')
  } else {
    html.setAttribute('data-theme', 'day')
    if (app.isNight.value === true) app.setTheme('day')
  }
})

// 跨标签页同步
if (typeof window !== 'undefined') {
  window.addEventListener('storage', load)
}

const filtered = computed(() => {
  let list = allLetters.value.slice()
  if (activeCat.value !== 'all') {
    list = list.filter(l => l.category === activeCat.value)
  }
  if (activeMood.value) {
    list = list.filter(l => (l.moods || []).includes(activeMood.value))
  }
  if (activeTag.value) {
    list = list.filter(l => (l.tags || []).includes(activeTag.value))
  }
  if (sort.value === 'hot') {
    list.sort((a, b) => ((b.likes || 0) + (b.favorites || 0)) - ((a.likes || 0) + (a.favorites || 0)))
  } else if (sort.value === 'random') {
    list.sort(() => Math.random() - 0.5)
  } else {
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }
  return list
})

const moodStats = computed(() => {
  const map = {}
  allLetters.value.forEach(l => (l.moods || []).forEach(m => { map[m] = (map[m] || 0) + 1 }))
  MOODS.forEach(m => { if (!map[m]) map[m] = 1 })
  return map
})

function setCat(c) { activeCat.value = c; activeMood.value = '' }
function setTag(t) { activeTag.value = t }
function filterByMood(m) {
  activeMood.value = activeMood.value === m ? '' : m
  activeCat.value = 'all'
}
function onSameType(cat) {
  activeCat.value = cat
  activeMood.value = ''
}

function onLike(letter) {
  letter.liked = !letter.liked
  letter.likes = Math.max(0, (letter.likes || 0) + (letter.liked ? 1 : -1))
  load()
}
function onFav({ letter }) {
  const added = toggleFavorite(letter.id)
  letter.favorites = Math.max(0, (letter.favorites || 0) + (added ? 1 : -1))
  load()
}
</script>

<style>
/* ============================================================
   全局样式（非 scoped，确保 CSS 变量和重置覆盖整个页面）
   这部分等价于 global.css 中未被 import 的规则，
   由于 global.css 已经通过 import 加载到组件中，
   这里只补充组件级别的覆盖和动画定义。
   ============================================================ */
</style>

<style scoped>
/* ============================================================
   HomePage 专用样式 —— 合并 AppLayout + Home 的完整布局
   ============================================================ */

/* ---------- 根容器 ---------- */
.th-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}
.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

/* ---------- 顶部导航栏 ---------- */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--card-border);
  height: 56px;
  display: flex;
  align-items: center;
}
.nav-inner {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.nav-exit-btn {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 10px;
  border: 1px solid var(--card-border); color: var(--text-sub);
  background: transparent; cursor: pointer; transition: all .2s;
  margin-right: 4px; flex-shrink: 0;
}
.nav-exit-btn:hover { color: var(--accent); border-color: var(--blue); transform: translateX(-2px); }

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}
.brand-icon { font-size: 22px; }
.brand-text {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.nav-links {
  display: flex;
  gap: 4px;
  align-items: center;
}
.nav-link {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-sub);
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}
.nav-link:hover { color: var(--accent); background: var(--grad-soft); }
.nav-link.active { color: var(--accent); font-weight: 700; }

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.nav-write-btn {
  padding: 6px 16px;
  font-size: 13px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.nav-icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--card-border);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--text-sub);
}
.nav-icon-btn:hover { border-color: var(--blue); color: var(--accent); }
.hamburger { display: none; }
.hamburger span { transition: transform 0.3s; display: inline-block; }
.hamburger span.open { transform: rotate(90deg); }

/* ---------- 移动端下拉菜单 ---------- */
.mobile-menu {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  z-index: 99;
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--card-border);
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--card-shadow);
}
.mobile-nav-link {
  display: block;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  color: var(--text-main);
  text-decoration: none;
  transition: background 0.2s;
}
.mobile-nav-link:hover { background: var(--grad-soft); }
.mobile-nav-link.active { color: var(--accent); font-weight: 700; background: var(--grad-soft); }

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(.2,.8,.25,1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ---------- 主内容区 ---------- */
.main-content {
  flex: 1;
  padding-top: 76px;
  padding-bottom: 90px;
}

/* ---------- 移动端底部导航 ---------- */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--card-border);
  display: none;
  justify-content: space-around;
  align-items: center;
  height: 62px;
  padding: 0 8px;
}
.bn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: var(--text-sub);
  font-size: 10px;
  transition: color 0.2s;
  padding: 4px 10px;
}
.bn-item.active { color: var(--accent); }
.bn-icon { font-size: 20px; }
.bn-label { font-size: 10px; }
.bn-center {
  position: relative;
  top: -16px;
}
.bn-center-circle {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--grad);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 14px var(--glow);
  color: #fff;
}

/* ========== Home 页面内容样式 ========== */

.home { display: flex; flex-direction: column; gap: 18px; }
.hero { padding: 30px 26px; text-align: center; border-radius: 26px; }
.hero-title { font-size: clamp(22px, 4vw, 34px); font-weight: 800; margin: 0 0 6px; letter-spacing: 1px; }
.typewriter { border-right: none; }
.caret { color: var(--accent); animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }
.hero-sub { color: var(--text-sub); margin: 0 0 16px; font-size: 14px; }
.hero-quote {
  display: inline-block; max-width: 620px; font-style: italic;
  color: var(--text-main); background: rgba(255,255,255,0.4);
  padding: 12px 20px; border-radius: 16px; margin-bottom: 18px;
  font-size: calc(14px * var(--font-scale));
}
html[data-theme='night'] .hero-quote { background: rgba(255,255,255,0.06); }
.quote-mark { color: var(--accent); font-size: 20px; font-weight: 700; }
.hero-acts { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

.filters { padding: 16px 18px; border-radius: 20px; }
.filter-row { display: flex; align-items: flex-start; gap: 12px; margin: 6px 0; }
.filter-label { font-size: 13px; color: var(--text-sub); padding-top: 6px; flex-shrink: 0; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }

/* 瀑布流 */
.masonry { columns: 3; column-gap: 16px; }
.masonry-col { break-inside: avoid; margin-bottom: 16px; display: inline-block; width: 100%; }

.mood-cloud { padding: 16px 18px; border-radius: 20px; }
.mc-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; font-weight: 700; }
.mc-hint { font-size: 11px; color: var(--text-sub); font-weight: 400; }
.mc-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.mc-tag {
  border: none; background: rgba(255,255,255,0.45); color: var(--accent);
  padding: 4px 12px; border-radius: 999px; cursor: pointer; transition: all .2s;
}
html[data-theme='night'] .mc-tag { background: rgba(255,255,255,0.08); }
.mc-tag:hover { background: var(--grad-soft); color: var(--accent); border: 1px solid var(--blue); transform: translateY(-2px); }

/* ---------- 响应式 ---------- */
@media (max-width: 1024px) {
  .masonry { columns: 2; }
}

@media (max-width: 768px) {
  .main-content { padding-top: 66px; padding-bottom: 100px; }
  .top-nav { height: 50px; }
  .nav-links { display: none; }
  .nav-write-btn { display: none; }
  .hamburger { display: flex; }
  .bottom-nav { display: flex; }
  .hero { padding: 22px 16px; }
}

@media (max-width: 600px) {
  .masonry { columns: 1; }
  .hero-title { font-size: clamp(18px, 5vw, 24px); }
}
</style>
