<template>
  <div class="th-app" :class="{ 'low-perf': lowPerf.value, 'high-contrast': highContrast.value }">
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
          <!-- 品牌 -->
          <a href="/treehole" class="nav-brand" aria-label="拾光树洞首页">
            <span class="brand-icon">🌳</span>
            <span class="brand-text grad-text">拾光树洞</span>
          </a>

          <!-- 桌面导航链接 -->
          <nav class="nav-links" aria-label="主导航">
            <a href="/treehole" class="nav-link">广场</a>
            <a href="/treehole/random" class="nav-link">随机</a>
            <a href="/treehole/bottle" class="nav-link">漂流瓶</a>
            <a href="/treehole/wish" class="nav-link">许愿墙</a>
            <a href="/treehole/rank" class="nav-link">榜单</a>
          </nav>

          <!-- 右侧操作 -->
          <div class="nav-actions">
            <a href="/treehole/write" class="btn-grad nav-write-btn">✍️ 写信</a>
            <button class="nav-icon-btn" @click="app.toggleTheme()" :aria-label="app.isNight.value ? '切换到日间模式' : '切换到夜间模式'">
              {{ app.isNight.value ? '☀️' : '🌙' }}
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
          <a href="/treehole" class="mobile-nav-link">🏠 广场</a>
          <a href="/treehole/write" class="mobile-nav-link">✍️ 写信</a>
          <a href="/treehole/random" class="mobile-nav-link">🎲 随机树洞</a>
          <a href="/treehole/bottle" class="mobile-nav-link">🍾 漂流瓶</a>
          <a href="/treehole/wish" class="mobile-nav-link">⭐ 许愿墙</a>
          <a href="/treehole/rank" class="mobile-nav-link">🏆 榜单</a>
          <a href="/treehole/mine" class="mobile-nav-link active">📬 我的信箱</a>
          <a href="/treehole/messages" class="mobile-nav-link">💬 私信</a>
          <a href="/treehole/settings" class="mobile-nav-link">⚙️ 设置</a>
        </nav>
      </transition>

      <!-- ==================== 主内容区 ==================== -->
      <main class="main-content float-up">
        <div class="container">

          <h1 class="page-title">🌙 我的本地树洞</h1>
          <p class="page-sub">这里展示你发布的所有信件、收藏与草稿，数据保存在本地浏览器。</p>

          <!-- 统计 -->
          <section class="stats">
            <div class="stat glass"><b>{{ letters.length }}</b><span>发布信件</span></div>
            <div class="stat glass"><b>{{ favList.length }}</b><span>收藏树洞</span></div>
            <div class="stat glass"><b>{{ drafts.length }}</b><span>本地草稿</span></div>
          </section>

          <div class="tabs">
            <button class="chip" :class="{ active: tab === 'letters' }" @click="tab = 'letters'">我的信件</button>
            <button class="chip" :class="{ active: tab === 'fav' }" @click="tab = 'fav'">收藏夹</button>
            <button class="chip" :class="{ active: tab === 'drafts' }" @click="tab = 'drafts'">本地草稿</button>
          </div>

          <!-- 我的信件 -->
          <section v-if="tab === 'letters'">
            <div v-if="letters.length" class="list">
              <div v-for="l in letters" :key="l.id" class="item glass">
                <div class="item-head">
                  <span class="item-cat" :style="{ background: getCategory(l.category).color }">{{ getCategory(l.category).emoji }} {{ getCategory(l.category).label }}</span>
                  <span class="item-status" :class="l.status">{{ statusLabel(l.status) }}</span>
                </div>
                <p class="item-content">{{ l.content }}</p>
                <div class="item-foot">
                  <span>{{ timeText(l.createdAt) }}</span>
                  <div class="item-acts">
                    <a v-if="['pending','rejected','scheduled'].includes(l.status)" :href="'/treehole/write?letterId=' + l.id" class="mini">✏️ 编辑</a>
                    <button class="mini danger" @click="removeLetter(l)">🗑️ 删除</button>
                  </div>
                </div>
              </div>
            </div>
            <EmptyState v-else title="还没有发布任何信件" sub="去写信页，投出第一封匿名信吧～" />
          </section>

          <!-- 收藏夹 -->
          <section v-if="tab === 'fav'">
            <div v-if="favList.length" class="masonry">
              <div v-for="l in favList" :key="l.id" class="masonry-col">
                <LetterCard :letter="l" @fav="refreshFavs" />
              </div>
            </div>
            <EmptyState v-else title="还没有收藏的树洞" sub="在广场点亮 ⭐ 收藏喜欢的信件" />
          </section>

          <!-- 草稿（本地） -->
          <section v-if="tab === 'drafts'">
            <div v-if="drafts.length" class="list">
              <div v-for="d in drafts" :key="d.id" class="item glass">
                <p class="item-content">{{ d.content || '（空草稿）' }}</p>
                <div class="item-foot">
                  <span>{{ timeText(d.updatedAt) }}</span>
                  <div class="item-acts">
                    <a :href="'/treehole/write?draftId=' + d.id" class="mini">继续编辑</a>
                    <button class="mini danger" @click="removeDraft(d)">删除</button>
                  </div>
                </div>
              </div>
            </div>
            <EmptyState v-else title="暂无本地草稿" sub="写信时可随时保存草稿" />
          </section>

          <!-- 数据备份 -->
          <BackupPanel />

          <!-- 危险操作 -->
          <section class="danger-zone glass">
            <div>
              <b>清空全部本地草稿</b>
              <p>仅删除本机保存的草稿，不可恢复。</p>
            </div>
            <button class="btn-reset" @click="resetDraftsConfirm">清空草稿</button>
          </section>

        </div>
      </main>

      <!-- ==================== 移动端底部导航栏 ==================== -->
      <nav class="bottom-nav glass" aria-label="移动端底部导航">
        <a href="/treehole" class="bn-item">
          <span class="bn-icon">🏠</span>
          <span class="bn-label">广场</span>
        </a>
        <a href="/treehole/random" class="bn-item">
          <span class="bn-icon">🎲</span>
          <span class="bn-label">随机</span>
        </a>
        <a href="/treehole/write" class="bn-item bn-center">
          <span class="bn-center-circle">✍️</span>
        </a>
        <a href="/treehole/bottle" class="bn-item">
          <span class="bn-icon">🍾</span>
          <span class="bn-label">漂流瓶</span>
        </a>
        <a href="/treehole/mine" class="bn-item active">
          <span class="bn-icon">📬</span>
          <span class="bn-label">信箱</span>
        </a>
      </nav>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LetterCard from '../components/LetterCard.vue'
import EmptyState from '../components/EmptyState.vue'
import BackupPanel from '../components/BackupPanel.vue'
import Particles from '../components/Particles.vue'
import { getCategory } from '../store/constants'
import { getLetters, getFavorites, getDrafts, deleteLetter, deleteDraft, resetDrafts } from '../store/storage'
import { useApp } from '../store/app'
import '../styles/global.css'

const app = useApp()
const { lowPerf, highContrast } = app

const tab = ref('letters')
const letters = ref([])
const favList = ref([])
const drafts = ref([])
const mobileMenuOpen = ref(false)

function load() {
  letters.value = getLetters()
  const favIds = getFavorites()
  favList.value = getLetters().filter(l => favIds.includes(l.id) && l.status === 'published' && l.privacy === 'public')
  drafts.value = getDrafts()
}

onMounted(() => { load() })

function refreshFavs() { load() }

function statusLabel(s) {
  return s === 'pending' ? '审核中' : s === 'published' ? '已公开' : s === 'rejected' ? '已驳回' : s === 'scheduled' ? '定时发布' : s === 'sealed' ? '已封存' : '个人可见'
}

function timeText(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function removeLetter(l) {
  if (confirm('确定删除这封信？')) {
    deleteLetter(l.id)
    load()
  }
}

function removeDraft(d) {
  if (confirm('确定删除这份草稿？')) {
    deleteDraft(d.id)
    load()
  }
}

function resetDraftsConfirm() {
  if (confirm('确定清空全部本地草稿？此操作不可恢复。')) {
    resetDrafts()
    load()
  }
}
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

/* ========== Mine 页面内容样式 ========== */

.page-title { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
.page-sub { color: var(--text-sub); margin: 0 0 18px; font-size: 14px; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.stat { padding: 16px; text-align: center; border-radius: 18px; display: flex; flex-direction: column; gap: 2px; }
.stat b { font-size: 24px; color: var(--accent); }
.stat span { font-size: 12px; color: var(--text-sub); }

.tabs { display: flex; gap: 8px; margin: 16px 0; flex-wrap: wrap; }

.list { display: flex; flex-direction: column; gap: 14px; }

.item { padding: 16px; border-radius: 18px; cursor: default; transition: all .2s; }
.item-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.item-cat { color: #5a4a3f; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.item-status { font-size: 11px; padding: 2px 9px; border-radius: 999px; background: rgba(255,255,255,0.5); color: var(--text-sub); }
.item-status.published { background: rgba(155,230,160,0.4); color: #3a7d44; }
.item-status.pending { background: rgba(255,218,165,0.4); color: #9a6a1f; }
.item-status.rejected { background: rgba(255,180,180,0.4); color: #b04a4a; }
.item-status.scheduled { background: rgba(200,184,245,0.4); color: #6b5bb0; }
.item-content { margin: 0 0 10px; white-space: pre-wrap; font-size: calc(14px * var(--font-scale)); line-height: 1.7; }
.item-foot { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--text-sub); }
.item-acts { display: flex; gap: 8px; }

.mini {
  border: 1px solid var(--card-border);
  background: rgba(255,255,255,0.4);
  color: var(--text-main);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all .2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.mini:hover { border-color: var(--accent); }
.mini.danger:hover { border-color: var(--danger); color: var(--danger); }

/* 收藏夹瀑布流 */
.masonry { columns: 3; column-gap: 16px; }
.masonry-col { break-inside: avoid; margin-bottom: 16px; display: inline-block; width: 100%; }

.danger-zone {
  margin-top: 8px;
  padding: 18px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid rgba(229,115,115,0.3);
}
.danger-zone b { font-size: 14px; color: var(--text-main); }
.danger-zone p { font-size: 12px; color: var(--text-sub); margin: 4px 0 0; }

.btn-reset {
  border: 1px solid var(--danger);
  color: var(--danger);
  background: rgba(229,115,115,0.1);
  border-radius: 999px;
  padding: 8px 18px;
  cursor: pointer;
  font-size: 13px;
  transition: all .2s;
  white-space: nowrap;
}
.btn-reset:hover { background: var(--danger); color: #fff; }

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
}

@media (max-width: 600px) {
  .masonry { columns: 1; }
  .stats { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .stat { padding: 12px 8px; }
  .stat b { font-size: 20px; }
}
</style>
