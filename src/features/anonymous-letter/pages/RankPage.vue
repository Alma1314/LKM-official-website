<template>
  <div class="th-app" :class="{ 'low-perf': lowPerf, 'high-contrast': highContrast }">
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
            <a :href="`${base}treehole`" class="nav-link">广场</a>
            <a :href="`${base}treehole/random`" class="nav-link">随机</a>
            <a :href="`${base}treehole/bottle`" class="nav-link">漂流瓶</a>
            <a :href="`${base}treehole/wish`" class="nav-link">许愿墙</a>
            <a :href="`${base}treehole/rank`" class="nav-link active">榜单</a>
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
          <a :href="`${base}treehole`" class="mobile-nav-link">🏠 广场</a>
          <a :href="`${base}treehole/write`" class="mobile-nav-link">✍️ 写信</a>
          <a :href="`${base}treehole/random`" class="mobile-nav-link">🎲 随机树洞</a>
          <a :href="`${base}treehole/bottle`" class="mobile-nav-link">🍾 漂流瓶</a>
          <a :href="`${base}treehole/wish`" class="mobile-nav-link">⭐ 许愿墙</a>
          <a :href="`${base}treehole/rank`" class="mobile-nav-link active">🏆 榜单</a>
          <a :href="`${base}treehole/mine`" class="mobile-nav-link">📬 我的信箱</a>
          <a :href="`${base}treehole/messages`" class="mobile-nav-link">💬 私信</a>
          <a :href="`${base}treehole/settings`" class="mobile-nav-link">⚙️ 设置</a>
        </nav>
      </transition>

      <!-- ==================== 主内容区 ==================== -->
      <main class="main-content float-up">
        <div class="container">

          <h1 class="page-title">🏆 热门树洞榜单</h1>
          <p class="page-sub">此刻最被温柔以待的匿名信。</p>

          <div class="tabs">
            <button class="chip" :class="{ active: range === 'today' }" @click="range = 'today'">今日热榜</button>
            <button class="chip" :class="{ active: range === 'week' }" @click="range = 'week'">本周榜单</button>
          </div>

          <section v-if="rankList.length" class="rank-list">
            <div
              v-for="(l, i) in rankList" :key="l.id"
              class="rank-item glass glass-hover"
            >
              <div class="rank-no" :class="'no' + (i + 1)">{{ i + 1 }}</div>
              <div class="rank-body">
                <div class="rank-head">
                  <span class="rank-cat" :style="{ background: getCategory(l.category).color }">{{ getCategory(l.category).emoji }}</span>
                  <span class="rank-code">{{ l.codename }}</span>
                  <span class="rank-heat">🔥 {{ (l.likes || 0) + (l.favorites || 0) }}</span>
                </div>
                <p class="rank-content">{{ l.content }}</p>
              </div>
            </div>
          </section>
          <EmptyState v-else title="榜单还没数据" sub="多去广场点赞收藏，榜单就会热闹起来" />

        </div>
      </main>

      <!-- ==================== 移动端底部导航栏 ==================== -->
      <nav class="bottom-nav glass" aria-label="移动端底部导航">
        <a :href="`${base}treehole`" class="bn-item">
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
import EmptyState from '../components/EmptyState.vue'
import Particles from '../components/Particles.vue'
import { getCategory } from '../store/constants'
import { getLetters } from '../store/storage'
import { useApp } from '../store/app'
import '../styles/global.css'

const base = import.meta.env.BASE_URL || '/'

const app = useApp()
const { lowPerf, highContrast } = app

function toggleTheme() {
  app.toggleTheme()
  const isNight = document.documentElement.getAttribute('data-theme') === 'night'
  document.documentElement.classList.toggle('dark', isNight)
}

const range = ref('today')
const letters = ref([])
const mobileMenuOpen = ref(false)

onMounted(() => {
  // Sync initial theme from Astro's <html class="dark"> to treehole's data-theme
  const isDark = document.documentElement.classList.contains('dark')
  const html = document.documentElement
  if (isDark) {
    html.setAttribute('data-theme', 'night')
    if (app.isNight.value === false) app.setTheme('night')
  } else {
    html.setAttribute('data-theme', 'day')
    if (app.isNight.value === true) app.setTheme('day')
  }
  // Watch for Astro theme changes
  const observer = new MutationObserver(() => {
    const nowDark = document.documentElement.classList.contains('dark')
    const treeholeTheme = document.documentElement.getAttribute('data-theme')
    if (nowDark && treeholeTheme !== 'night') {
      app.setTheme('night')
    } else if (!nowDark && treeholeTheme !== 'day') {
      app.setTheme('day')
    }
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  letters.value = getLetters().filter(l => l.status === 'published' && l.privacy === 'public')
})

const rankList = computed(() => {
  const now = Date.now()
  const within = range.value === 'today' ? 86400000 : 7 * 86400000
  return letters.value
    .filter(l => now - l.createdAt < within)
    .sort((a, b) => (b.likes || 0) + (b.favorites || 0) - (a.likes || 0) - (a.favorites || 0))
    .slice(0, 20)
})
</script>

<style scoped>
/* ============================================================
   全局容器样式（与 HomePage 一致）
   ============================================================ */

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

/* ========== Rank 页面内容样式 ========== */

.page-title { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
.page-sub { color: var(--text-sub); margin: 0 0 18px; font-size: 14px; }

.tabs { display: flex; gap: 8px; margin-bottom: 16px; }

.rank-list { display: flex; flex-direction: column; gap: 12px; }

.rank-item { display: flex; gap: 14px; padding: 16px; border-radius: 18px; align-items: flex-start; }
.rank-no { width: 34px; height: 34px; border-radius: 12px; display: grid; place-items: center; font-weight: 800; font-size: 16px; background: rgba(255,255,255,0.5); color: var(--text-sub); flex-shrink: 0; }
.rank-no.no1 { background: linear-gradient(135deg,#ffd86b,#ff9a3c); color: #fff; }
.rank-no.no2 { background: linear-gradient(135deg,#d6e4ff,#a0c4ff); color: #fff; }
.rank-no.no3 { background: linear-gradient(135deg,#ffd6c2,#ffb38a); color: #fff; }
.rank-body { flex: 1; min-width: 0; }
.rank-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.rank-cat { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: 14px; }
.rank-code { font-size: 13px; font-weight: 700; }
.rank-heat { margin-left: auto; font-size: 12px; color: var(--accent); }
.rank-content { margin: 0; font-size: calc(14px * var(--font-scale)); line-height: 1.7; white-space: pre-wrap; }

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
  .main-content { padding-top: 66px; padding-bottom: 100px; }
  .top-nav { height: 50px; }
  .nav-links { display: none; }
  .nav-write-btn { display: none; }
  .hamburger { display: flex; }
  .bottom-nav { display: flex; }
}
</style>
