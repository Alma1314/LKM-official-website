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
          <a :href="`${base}treehole`" class="nav-brand" aria-label="拾光树洞首页">
            <span class="brand-icon">🌳</span>
            <span class="brand-text grad-text">拾光树洞</span>
          </a>
          <nav class="nav-links" aria-label="主导航">
            <a :href="`${base}treehole`" class="nav-link">广场</a>
            <a :href="`${base}treehole/random`" class="nav-link">随机</a>
            <a :href="`${base}treehole/bottle`" class="nav-link active">漂流瓶</a>
            <a :href="`${base}treehole/wish`" class="nav-link">许愿墙</a>
            <a :href="`${base}treehole/rank`" class="nav-link">榜单</a>
          </nav>
          <div class="nav-actions">
            <a :href="`${base}treehole/write`" class="btn-grad nav-write-btn">✍️ 写信</a>
            <button class="nav-icon-btn" @click="app.toggleTheme()" :aria-label="app.isNight ? '切换到日间模式' : '切换到夜间模式'">
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
          <a :href="`${base}treehole/bottle`" class="mobile-nav-link active">🍾 漂流瓶</a>
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

          <!-- 头部 -->
          <section class="bottle-head glass float-up">
            <h1 class="page-title">🍶 漂流瓶</h1>
            <button class="btn-grad" @click="throwDialogOpen = true">🍶 扔一个瓶</button>
          </section>

          <!-- 无漂流瓶状态 -->
          <section v-if="!currentBottle" class="bottle-empty glass float-up">
            <div class="bottle-sea">
              <div class="sea-emoji">🌊</div>
              <p class="sea-text">海里有 {{ bottleCount }} 个漂流瓶在漂流</p>
              <p class="sea-sub">每一个瓶子里都藏着一个故事</p>
              <button
                class="btn-grad"
                @click="pickBottleHandler"
                :disabled="picking || bottleCount === 0"
              >
                {{ picking ? '🌊 打捞中...' : '🫙 捞一个漂流瓶' }}
              </button>
            </div>
          </section>

          <!-- 当前瓶子 -->
          <section v-else class="bottle-current glass float-up">
            <div class="bottle-display">
              <div class="bottle-icon">🍶</div>
              <div class="bottle-text">{{ currentBottle.text }}</div>
              <div class="bottle-meta">
                <span class="bottle-from">—— {{ currentBottle.from || '海那边的陌生人' }}</span>
                <span class="bottle-date">{{ formatDate(currentBottle.createdAt) }}</span>
              </div>
            </div>

            <!-- 回复区域 -->
            <div class="bottle-reply">
              <textarea
                v-model="replyText"
                class="reply-textarea"
                placeholder="写下你的回复，然后放回海里..."
                rows="3"
              ></textarea>
              <div class="reply-actions">
                <button class="chip" @click="currentBottle = null; replyText = ''">← 换个瓶子</button>
                <button
                  class="btn-grad btn-sm"
                  @click="sendBottleReply"
                  :disabled="!replyText.trim()"
                >
                  📨 放回海里
                </button>
              </div>
              <p v-if="replyOk" class="reply-ok">回复已随海浪漂走 🌊</p>
            </div>
          </section>

          <!-- 扔漂流瓶弹窗 -->
          <div v-if="throwDialogOpen" class="dialog-overlay" @click.self="throwDialogOpen = false">
            <div class="dialog-box glass">
              <h3 class="dialog-title">🍶 扔一个漂流瓶</h3>
              <p class="dialog-desc">写下你想说的话，让海浪带走它。</p>
              <textarea
                v-model="throwText"
                class="dialog-textarea"
                placeholder="想对未知的某个人说些什么..."
                rows="4"
              ></textarea>
              <div class="dialog-actions">
                <button class="chip" @click="throwDialogOpen = false; throwText = ''">取消</button>
                <button
                  class="btn-grad btn-sm"
                  @click="throwBottle"
                  :disabled="!throwText.trim()"
                >
                  🍶 扔进海里
                </button>
              </div>
            </div>
          </div>

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
        <a :href="`${base}treehole/bottle`" class="bn-item active">
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
import { getBottles, addBottle, pickBottle, markBottlePicked } from '../store/storage'
import { useApp } from '../store/app'
import Particles from '../components/Particles.vue'
import '../styles/global.css'

const base = import.meta.env.BASE_URL || '/'

const app = useApp()
const { lowPerf, highContrast } = app

const allBottles = ref([])
const currentBottle = ref(null)
const picking = ref(false)
const replyText = ref('')
const replyOk = ref(false)
const throwDialogOpen = ref(false)
const throwText = ref('')
const mobileMenuOpen = ref(false)

const bottleCount = computed(() => {
  return allBottles.value.filter(b => !b.picked).length
})

function loadBottles() {
  allBottles.value = getBottles()
}

function pickBottleHandler() {
  picking.value = true
  replyText.value = ''
  replyOk.value = false
  setTimeout(() => {
    const bottle = pickBottle()
    currentBottle.value = bottle
    picking.value = false
  }, 500)
}

function sendBottleReply() {
  if (!currentBottle.value || !replyText.value.trim()) return
  markBottlePicked(currentBottle.value.id, replyText.value.trim())
  replyOk.value = true
  loadBottles()
  setTimeout(() => {
    currentBottle.value = null
    replyText.value = ''
    replyOk.value = false
  }, 1500)
}

function throwBottle() {
  if (!throwText.value.trim()) return
  addBottle({
    id: 'bottle_' + Date.now(),
    text: throwText.value.trim(),
    from: '海那边的陌生人',
    createdAt: Date.now(),
    picked: false,
    ownerId: 'me_local'
  })
  throwText.value = ''
  throwDialogOpen.value = false
  loadBottles()
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

onMounted(() => {
  loadBottles()
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

/* ========== 漂流瓶页面内容样式 ========== */

/* 头部 */
.bottle-head {
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
.bottle-empty {
  padding: 60px 26px;
  text-align: center;
  border-radius: 26px;
  max-width: 520px;
  margin: 0 auto;
}
.sea-emoji {
  font-size: 80px;
  margin-bottom: 16px;
  animation: wave 3s ease-in-out infinite;
}
@keyframes wave {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(-2deg); }
  75% { transform: translateY(4px) rotate(2deg); }
}
.sea-text {
  font-size: 17px;
  color: var(--text-main);
  font-weight: 600;
  margin: 0 0 6px;
}
.sea-sub {
  color: var(--text-sub);
  font-size: 14px;
  margin: 0 0 24px;
}

/* 当前瓶子 */
.bottle-current {
  padding: 24px;
  border-radius: 26px;
  max-width: 620px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.bottle-display {
  background: linear-gradient(135deg, rgba(173, 216, 230, 0.2), rgba(221, 160, 221, 0.15));
  padding: 28px 24px;
  border-radius: 16px;
  text-align: center;
}
html[data-theme='night'] .bottle-display {
  background: rgba(255,255,255,0.05);
}
.bottle-icon {
  font-size: 40px;
  margin-bottom: 12px;
}
.bottle-text {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-main);
  white-space: pre-wrap;
  margin-bottom: 16px;
}
.bottle-meta {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: var(--text-sub);
}
.bottle-from { font-style: italic; }

/* 回复区域 */
.bottle-reply {
  border-top: 1px solid var(--card-border);
  padding-top: 16px;
}
.reply-textarea {
  width: 100%;
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 12px;
  background: var(--bg-card, rgba(255,255,255,0.6));
  color: var(--text-main);
  font-size: 1rem;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.reply-textarea:focus { border-color: var(--accent); }
.reply-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}
.btn-sm {
  padding: 8px 20px;
  font-size: 13px;
  border: none;
  cursor: pointer;
  border-radius: 999px;
}
.btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }
.reply-ok {
  color: var(--accent);
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
}

/* 扔瓶子弹窗 */
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

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
  .main-content { padding-top: 66px; padding-bottom: 100px; }
  .top-nav { height: 50px; }
  .nav-links { display: none; }
  .nav-write-btn { display: none; }
  .hamburger { display: flex; }
  .bottom-nav { display: flex; }
  .bottle-head { flex-direction: column; gap: 12px; }
  .page-title { font-size: 20px; }
  .bottle-empty { padding: 40px 16px; }
  .sea-emoji { font-size: 60px; }
  .bottle-current { padding: 16px; }
  .bottle-display { padding: 20px 16px; }
}

@media (max-width: 600px) {
  .sea-emoji { font-size: 48px; }
}
</style>
