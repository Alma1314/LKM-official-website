<template>
  <div class="th-app" :class="{ 'low-perf': lowPerf, 'high-contrast': highContrast }">
    <div class="app-root">

      <!-- 背景层 -->
      <div class="bg-flow" aria-hidden="true"></div>
      <Particles />
      <div class="corner-deco tl"></div>
      <div class="corner-deco br"></div>
      <div class="corner-deco tr"></div>

      <!-- ==================== 顶部导航栏 ==================== -->
      <header class="top-nav glass">
        <div class="nav-inner">
          <a :href="`${base}apps`" class="nav-exit-btn" title="返回主站">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </a>
          <a :href="`${base}treehole`" class="nav-brand" aria-label="拾光树洞首页">
            <span class="brand-icon">🌳</span>
            <span class="brand-text grad-text">拾光树洞</span>
          </a>
          <nav class="nav-links" aria-label="主导航">
            <a :href="`${base}treehole`" class="nav-link">广场</a>
            <a :href="`${base}treehole/random`" class="nav-link">随机</a>
            <a :href="`${base}treehole/bottle`" class="nav-link">漂流瓶</a>
            <a :href="`${base}treehole/wish`" class="nav-link active">许愿墙</a>
            <a :href="`${base}treehole/rank`" class="nav-link">榜单</a>
          </nav>
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
          <a :href="`${base}treehole/wish`" class="mobile-nav-link active">⭐ 许愿墙</a>
          <a :href="`${base}treehole/rank`" class="mobile-nav-link">🏆 榜单</a>
          <a :href="`${base}treehole/mine`" class="mobile-nav-link">📬 我的信箱</a>
          <a :href="`${base}treehole/messages`" class="mobile-nav-link">💬 私信</a>
          <a :href="`${base}treehole/settings`" class="mobile-nav-link">⚙️ 设置</a>
        </nav>
      </transition>

      <!-- ==================== 主内容区 ==================== -->
      <main class="main-content float-up">
        <div class="container">

          <!-- 头部 -->
          <section class="wish-head glass float-up">
            <h1 class="page-title">🌟 许愿墙</h1>
            <button class="btn-grad" @click="makeDialogOpen = true">+ 许个愿</button>
          </section>

          <!-- 空状态 -->
          <section v-if="wishes.length === 0" class="wish-empty glass float-up">
            <div class="empty-icon">🌟</div>
            <p class="empty-text">许愿墙上还没有愿望</p>
            <p class="empty-sub">点亮第一颗星吧</p>
            <button class="btn-grad" @click="makeDialogOpen = true">✨ 许个愿</button>
          </section>

          <!-- 许愿墙网格 -->
          <section v-else class="wish-grid">
            <div
              v-for="w in wishes"
              :key="w.id"
              class="wish-card glass float-up"
              :style="{ borderLeftColor: cardColor(w.id) }"
            >
              <p class="wish-text">{{ w.text }}</p>
              <div class="wish-meta">
                <button class="light-btn" @click="onLight(w)" :title="'点亮这个愿望'">
                  🕯️ {{ w.lights || 0 }}
                </button>
                <span class="wish-date">{{ formatDate(w.createdAt) }}</span>
                <template v-if="w.ownerId === 'me_local'">
                  <button class="wish-action-chip" @click="openEdit(w)">✏️</button>
                  <button class="wish-action-chip wish-del" @click="onDelete(w)">🗑️</button>
                </template>
              </div>
            </div>
          </section>

        </div>
      </main>

      <!-- 许愿弹窗 -->
      <div v-if="makeDialogOpen" class="dialog-overlay" @click.self="makeDialogOpen = false">
        <div class="dialog-box glass">
          <h3 class="dialog-title">🌟 许个愿</h3>
          <p class="dialog-desc">写下你的愿望，让星星听到。</p>
          <textarea
            v-model="makeText"
            class="dialog-textarea"
            placeholder="我希望..."
            rows="4"
          ></textarea>
          <div class="dialog-actions">
            <button class="chip" @click="makeDialogOpen = false; makeText = ''">取消</button>
            <button
              class="btn-grad btn-sm"
              @click="onMake"
              :disabled="!makeText.trim()"
            >
              🌟 点亮愿望
            </button>
          </div>
        </div>
      </div>

      <!-- 编辑弹窗 -->
      <div v-if="editDialogOpen" class="dialog-overlay" @click.self="editDialogOpen = false">
        <div class="dialog-box glass">
          <h3 class="dialog-title">✏️ 编辑愿望</h3>
          <textarea
            v-model="editText"
            class="dialog-textarea"
            placeholder="修改你的愿望..."
            rows="4"
          ></textarea>
          <div class="dialog-actions">
            <button class="chip" @click="editDialogOpen = false">取消</button>
            <button
              class="btn-grad btn-sm"
              @click="onSaveEdit"
              :disabled="!editText.trim()"
            >
              💾 保存
            </button>
          </div>
        </div>
      </div>

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
import { ref, onMounted } from 'vue'
import { getWishes, addWish, lightWish, saveWishes } from '../store/storage'
import { useApp } from '../store/app'
import Particles from '../components/Particles.vue'
import '../styles/global.css'

const base = import.meta.env.BASE_URL || '/'

const app = useApp()
const { lowPerf, highContrast } = app

function toggleTheme() {
  app.toggleTheme()
  const isNight = document.documentElement.getAttribute('data-theme') === 'night'
  document.documentElement.classList.toggle('dark', isNight)
}

const wishes = ref([])
const makeDialogOpen = ref(false)
const makeText = ref('')
const editDialogOpen = ref(false)
const editText = ref('')
const editId = ref('')
const mobileMenuOpen = ref(false)

function loadWishes() {
  wishes.value = getWishes()
}

function onMake() {
  if (!makeText.value.trim()) return
  addWish({
    id: 'wish_' + Date.now(),
    text: makeText.value.trim(),
    lights: 0,
    createdAt: Date.now(),
    ownerId: 'me_local'
  })
  makeText.value = ''
  makeDialogOpen.value = false
  loadWishes()
}

function onLight(w) {
  lightWish(w.id)
  loadWishes()
}

function openEdit(w) {
  editId.value = w.id
  editText.value = w.text
  editDialogOpen.value = true
}

function onSaveEdit() {
  if (!editText.value.trim()) return
  const list = getWishes()
  const idx = list.findIndex(w => w.id === editId.value)
  if (idx > -1) {
    list[idx].text = editText.value.trim()
    saveWishes(list)
  }
  editDialogOpen.value = false
  editText.value = ''
  editId.value = ''
  loadWishes()
}

function onDelete(w) {
  if (!confirm('确定删除这个愿望吗？')) return
  const list = getWishes().filter(x => x.id !== w.id)
  saveWishes(list)
  loadWishes()
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const COLORS = ['#ff9aa2', '#a0c4ff', '#ffd6a5', '#bdb2ff', '#9bf6ff', '#caffbf', '#ffc6ff', '#b9fbc0', '#ffadad', '#fdffb6']
function cardColor(id) {
  let hash = 0
  for (let i = 0; i < (id || '').length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

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

  loadWishes()
})
</script>

<style scoped>
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

/* ========== 许愿墙页面内容样式 ========== */

/* 头部 */
.wish-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-radius: 20px;
  margin-bottom: 18px;
}
.page-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
}

/* 空状态 */
.wish-empty {
  padding: 60px 26px;
  text-align: center;
  border-radius: 26px;
  max-width: 520px;
  margin: 0 auto;
}
.empty-icon {
  font-size: 72px;
  margin-bottom: 12px;
  animation: twinkle 2s ease-in-out infinite;
}
@keyframes twinkle {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
.empty-text {
  font-size: 17px;
  color: var(--text-main);
  font-weight: 600;
  margin: 0 0 6px;
}
.empty-sub {
  color: var(--text-sub);
  font-size: 14px;
  margin: 0 0 24px;
}

/* 许愿卡片网格 */
.wish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.wish-card {
  padding: 18px 20px;
  border-radius: 16px;
  border-left: 4px solid;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.wish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--glow);
}
.wish-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-main);
  white-space: pre-wrap;
}
.wish-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.light-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--card-border);
  background: rgba(255,255,255,0.45);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-main);
}
html[data-theme='night'] .light-btn { background: rgba(255,255,255,0.08); }
.light-btn:hover {
  background: var(--grad-soft);
  border-color: var(--accent);
  transform: scale(1.05);
}
.wish-date {
  font-size: 12px;
  color: var(--text-sub);
  margin-left: auto;
}
.wish-action-chip {
  border: none;
  background: rgba(255,255,255,0.45);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
html[data-theme='night'] .wish-action-chip { background: rgba(255,255,255,0.08); }
.wish-action-chip:hover { background: var(--grad-soft); }
.wish-del:hover { background: rgba(255, 100, 100, 0.2); }

/* 弹窗 */
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.dialog-box {
  padding: 28px 24px;
  border-radius: 20px;
  width: 90%;
  max-width: 440px;
  background: var(--nav-bg);
  box-shadow: var(--card-shadow);
}
.dialog-title {
  margin: 0 0 6px;
  font-size: 20px;
  color: var(--text-main);
}
.dialog-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--text-sub);
}
.dialog-textarea {
  width: 100%;
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 12px;
  background: var(--bg-card, rgba(255,255,255,0.6));
  color: var(--text-main);
  font-size: 1rem;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}
.dialog-textarea:focus { border-color: var(--accent); }
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
.btn-sm {
  padding: 8px 20px;
  font-size: 13px;
  border: none;
  cursor: pointer;
  border-radius: 999px;
}
.btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
  .main-content { padding-top: 66px; padding-bottom: 100px; }
  .top-nav { height: 50px; }
  .nav-links { display: none; }
  .nav-write-btn { display: none; }
  .hamburger { display: flex; }
  .bottom-nav { display: flex; }
  .wish-head { flex-direction: column; gap: 12px; }
  .page-title { font-size: 20px; }
  .wish-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
  .wish-empty { padding: 40px 16px; }
}

@media (max-width: 600px) {
  .wish-grid { grid-template-columns: 1fr; }
}
</style>
