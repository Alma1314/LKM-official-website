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
            <a :href="`${base}treehole/random`" class="nav-link active">随机</a>
            <a :href="`${base}treehole/bottle`" class="nav-link">漂流瓶</a>
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
          <a :href="`${base}treehole/random`" class="mobile-nav-link active">🎲 随机树洞</a>
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

          <!-- 抽取状态 -->
          <section v-if="!current" class="random-hero glass float-up">
            <div class="random-pick-area">
              <div class="pick-emoji">🌌</div>
              <p class="pick-slogan">每一次随机，都是一次未知的相遇</p>
              <button class="btn-grad pick-btn" @click="pickRandom" :disabled="picking">
                {{ picking ? '✨ 抽取中...' : '🎲 随机抽取一封' }}
              </button>
              <p v-if="poolCount === 0" class="empty-hint">还没有公开信件，去写一封吧～</p>
              <p v-else class="pool-hint">共有 {{ poolCount }} 封公开信件等待相遇</p>
            </div>
          </section>

          <!-- 阅读状态 -->
          <section v-else class="letter-read glass float-up">
            <div class="letter-paper" :style="{ background: paperBg }">
              <!-- 信件元信息 -->
              <div class="letter-meta">
                <span class="letter-cat">
                  <span class="cat-emoji">{{ catInfo.emoji }}</span>
                  {{ catInfo.label }}
                </span>
              </div>

              <!-- 信件内容 -->
              <div class="letter-body" :style="{ fontSize: letterFontSize }">
                {{ current.content }}
              </div>

              <!-- 心情标签 -->
              <div v-if="current.moods && current.moods.length" class="letter-moods">
                <span v-for="m in current.moods" :key="m" class="mood-tag">#{{ m }}</span>
              </div>

              <!-- 署名 + 日期 -->
              <div class="letter-footer">
                <span class="letter-codename">—— {{ current.codename || '匿名' }}</span>
                <span class="letter-date">{{ formatDate(current.createdAt) }}</span>
              </div>
            </div>

            <!-- 操作栏 -->
            <div class="read-actions">
              <button class="chip" @click="pickRandom">🎲 换一封</button>
              <button class="chip" @click="current = null">← 返回</button>
            </div>

            <!-- 回复区域 -->
            <div class="reply-section">
              <p class="reply-label">💬 给 {{ current.codename || '匿名' }} 写匿名回信</p>
              <textarea
                v-model="replyText"
                class="reply-textarea"
                :style="{ fontSize: replyFontSize }"
                :placeholder="'用温柔的话回应这封信...'"
                rows="3"
              ></textarea>
              <div class="reply-bar">
                <button class="chip" @click="toggleReplyFont">
                  {{ replyFontLarge ? 'A⁻' : 'A⁺' }}
                </button>
                <button class="btn-grad btn-sm" @click="sendReply" :disabled="!replyText.trim()">
                  📨 发送回信
                </button>
              </div>
              <p v-if="replySent" class="reply-ok">回信已发送，愿文字温暖彼此 🌿</p>
            </div>
          </section>

        </div>
      </main>

      <!-- ==================== 移动端底部导航栏 ==================== -->
      <nav class="bottom-nav glass" aria-label="移动端底部导航">
        <a :href="`${base}treehole`" class="bn-item">
          <span class="bn-icon">🏠</span>
          <span class="bn-label">广场</span>
        </a>
        <a :href="`${base}treehole/random`" class="bn-item active">
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
import { getCategory, getPaper } from '../store/constants'
import { getLetters, getOrCreateConversation, appendMessage } from '../store/storage'
import { useApp } from '../store/app'
import Particles from '../components/Particles.vue'
import '../styles/global.css'

const base = import.meta.env.BASE_URL || '/'

const app = useApp()
const { lowPerf, highContrast } = app

const current = ref(null)
const picking = ref(false)
const replyText = ref('')
const replyFontLarge = ref(false)
const replySent = ref(false)

const mobileMenuOpen = ref(false)

const poolCount = computed(() => {
  const all = getLetters()
  return all.filter(l => l.status === 'published' && l.privacy === 'public').length
})

const catInfo = computed(() => {
  if (!current.value) return { emoji: '💌', label: '' }
  return getCategory(current.value.category || 'confess')
})

const paperBg = computed(() => {
  if (!current.value) return 'transparent'
  return getPaper(current.value.paper || 'paper').gradient
})

const letterFontSize = computed(() => {
  const s = app.state.settings.fontScale
  return s === 'large' ? '1.15rem' : s === 'small' ? '0.9rem' : '1rem'
})

const replyFontSize = computed(() => {
  const base = parseFloat(letterFontSize.value)
  return (replyFontLarge.value ? base * 1.15 : base) + 'rem'
})

function pickRandom() {
  const all = getLetters()
  const pool = all.filter(l => l.status === 'published' && l.privacy === 'public')
  if (!pool.length) {
    current.value = null
    return
  }
  picking.value = true
  replyText.value = ''
  replySent.value = false
  // slight delay for animation feel
  setTimeout(() => {
    current.value = pool[Math.floor(Math.random() * pool.length)]
    picking.value = false
  }, 400)
}

function toggleReplyFont() {
  replyFontLarge.value = !replyFontLarge.value
}

function sendReply() {
  if (!current.value || !replyText.value.trim()) return
  const conv = getOrCreateConversation(
    'random_' + current.value.id,
    current.value.codename || '匿名',
    current.value.id
  )
  appendMessage(conv.id, {
    id: 'msg_' + Date.now(),
    text: replyText.value.trim(),
    from: 'me',
    createdAt: Date.now()
  })
  replyText.value = ''
  replySent.value = true
  setTimeout(() => { replySent.value = false }, 3000)
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

onMounted(() => {
  // optionally auto-pick on load? no, just show hero
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

/* ========== 随机树洞页面内容样式 ========== */

/* 抽取 Hero */
.random-hero {
  padding: 60px 26px;
  text-align: center;
  border-radius: 26px;
  max-width: 520px;
  margin: 0 auto;
}
.pick-emoji {
  font-size: 80px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.pick-slogan {
  color: var(--text-sub);
  font-size: 15px;
  margin: 0 0 24px;
}
.pick-btn {
  font-size: 16px;
  padding: 12px 36px;
  border: none;
  cursor: pointer;
}
.pick-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.empty-hint {
  color: var(--text-sub);
  margin-top: 14px;
  font-size: 13px;
}
.pool-hint {
  color: var(--text-sub);
  margin-top: 10px;
  font-size: 12px;
}

/* 阅读状态 */
.letter-read {
  padding: 24px;
  border-radius: 26px;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.letter-paper {
  padding: 28px 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.letter-meta {
  margin-bottom: 14px;
}
.letter-cat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-sub);
  background: var(--grad-soft);
  padding: 4px 14px;
  border-radius: 999px;
}
.cat-emoji { font-size: 16px; }
.letter-body {
  color: var(--text-main);
  line-height: 1.8;
  white-space: pre-wrap;
  margin-bottom: 16px;
}
.letter-moods {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.mood-tag {
  font-size: 12px;
  color: var(--accent);
  background: rgba(255,255,255,0.45);
  padding: 2px 10px;
  border-radius: 999px;
}
html[data-theme='night'] .mood-tag { background: rgba(255,255,255,0.08); }
.letter-footer {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-sub);
}
.letter-codename { font-style: italic; }

/* 操作栏 */
.read-actions {
  display: flex;
  gap: 10px;
}

/* 回复区域 */
.reply-section {
  border-top: 1px solid var(--card-border);
  padding-top: 16px;
}
.reply-label {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 600;
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
.reply-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
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

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
  .main-content { padding-top: 66px; padding-bottom: 100px; }
  .top-nav { height: 50px; }
  .nav-links { display: none; }
  .nav-write-btn { display: none; }
  .hamburger { display: flex; }
  .bottom-nav { display: flex; }
  .random-hero { padding: 40px 16px; }
  .pick-emoji { font-size: 60px; }
  .letter-read { padding: 16px; }
  .letter-paper { padding: 20px 16px; }
}

@media (max-width: 600px) {
  .pick-emoji { font-size: 48px; }
  .pick-slogan { font-size: 14px; }
}
</style>
