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
            <a :href="`${base}treehole/rank`" class="nav-link">榜单</a>
          </nav>

          <!-- 右侧操作 -->
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
          <a :href="`${base}treehole/bottle`" class="mobile-nav-link">🍾 漂流瓶</a>
          <a :href="`${base}treehole/wish`" class="mobile-nav-link">⭐ 许愿墙</a>
          <a :href="`${base}treehole/rank`" class="mobile-nav-link">🏆 榜单</a>
          <a :href="`${base}treehole/mine`" class="mobile-nav-link">📬 我的信箱</a>
          <a :href="`${base}treehole/messages`" class="mobile-nav-link active">💬 私信</a>
          <a :href="`${base}treehole/settings`" class="mobile-nav-link">⚙️ 设置</a>
        </nav>
      </transition>

      <!-- ==================== 主内容区 ==================== -->
      <main class="main-content float-up">
        <div class="container">

          <h1 class="page-title">💬 匿名回信</h1>
          <p class="page-sub">全程匿名，双方都不暴露真实身份。</p>

          <div class="msg-layout">
            <!-- 会话列表 -->
            <aside class="conv-list glass">
              <div class="conv-head">
                <span>对话 ({{ conversations.length }})</span>
              </div>
              <div v-if="conversations.length" class="conv-items">
                <div
                  v-for="c in conversations" :key="c.id"
                  class="conv-item" :class="{ active: activeId === c.id, blocked: c.blocked }"
                  @click="selectConv(c)"
                >
                  <div class="conv-avatar">{{ c.peerCodename.charAt(0) }}</div>
                  <div class="conv-info">
                    <b>{{ c.peerCodename }}</b>
                    <small>{{ lastMsg(c) }}</small>
                  </div>
                  <span v-if="c.blocked" class="conv-blocked">已屏蔽</span>
                </div>
              </div>
              <EmptyState v-else title="还没有任何对话" sub="去随机树洞给陌生人写回信吧" />
            </aside>

            <!-- 对话面板 -->
            <section class="chat glass" v-if="active">
              <div class="chat-head">
                <div class="chat-peer">
                  <div class="conv-avatar">{{ active.peerCodename.charAt(0) }}</div>
                  <div>
                    <b>{{ active.peerCodename }}</b>
                    <small>我的代号：{{ active.myCodename }}</small>
                  </div>
                </div>
                <div class="chat-acts">
                  <button class="mini" @click="blockConv" v-if="!active.blocked">屏蔽</button>
                  <button class="mini" @click="clearConvConfirm" v-if="active.messages.length">清空</button>
                  <button class="mini danger" @click="delConvConfirm">删除</button>
                </div>
              </div>

              <div class="chat-body" ref="chatBody">
                <div v-if="active.messages.length" class="bubbles">
                  <div
                    v-for="(m, i) in active.messages" :key="m.id || i"
                    class="bubble" :class="[m.from === 'me' ? 'mine' : 'peer', { recalled: m.recalled }]"
                  >
                    <template v-if="m.recalled">{{ m.text }}</template>
                    <template v-else>
                      <span class="bubble-text">{{ m.text }}</span>
                      <button v-if="m.from === 'me' && !m.recalled" class="bubble-recall" @click="recall(active.id, m)">撤回</button>
                    </template>
                  </div>
                </div>
                <EmptyState v-else title="还没有消息" sub="写下第一句匿名问候吧～" />
              </div>

              <div class="chat-input" v-if="!active.blocked">
                <textarea v-model="text" placeholder="匿名回复…" @keyup.enter.exact="send" rows="1"></textarea>
                <button class="btn-grad" :disabled="!text.trim()" @click="send">发送</button>
              </div>
              <div v-else class="chat-blocked">已屏蔽该陌生人，消息已停止。</div>
            </section>

            <EmptyState v-else class="chat-empty" title="选择左侧对话开始" />
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
import { ref, computed, onMounted, nextTick } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import Particles from '../components/Particles.vue'
import { getReplies, appendMessage, recallMessage, blockConversation, clearConversation, deleteConversation } from '../store/storage'
import { useApp } from '../store/app'
import '../styles/global.css'

const base = import.meta.env.BASE_URL || '/'

const app = useApp()
const { lowPerf, highContrast } = app

const conversations = ref([])
const activeId = ref('')
const text = ref('')
const chatBody = ref(null)
const mobileMenuOpen = ref(false)

const active = computed(() => conversations.value.find(c => c.id === activeId.value) || null)

onMounted(() => {
  conversations.value = getReplies()
  if (conversations.value.length) activeId.value = conversations.value[0].id
})

function lastMsg(c) {
  if (!c.messages.length) return '暂无消息'
  const m = c.messages[c.messages.length - 1]
  return (m.recalled ? '[撤回] ' : m.from === 'me' ? '我：' : '') + m.text
}

function selectConv(c) {
  activeId.value = c.id
}

function send() {
  if (!text.value.trim() || !active.value) return
  const msg = { id: 'm_' + Date.now() + Math.floor(Math.random() * 100), from: 'me', text: text.value.trim(), at: Date.now() }
  appendMessage(activeId.value, msg)
  conversations.value = getReplies()
  text.value = ''
  nextTick(scrollBottom)
}

function recall(convId, msg) {
  recallMessage(convId, msg.id)
  conversations.value = getReplies()
}

function blockConv() {
  if (confirm('确定屏蔽该陌生人？屏蔽后将无法收到新消息。')) {
    blockConversation(activeId.value)
    conversations.value = getReplies()
  }
}

function clearConvConfirm() {
  if (confirm('确定清空此对话的全部消息？')) {
    clearConversation(activeId.value)
    conversations.value = getReplies()
  }
}

function delConvConfirm() {
  if (confirm('确定删除此对话？')) {
    deleteConversation(activeId.value)
    conversations.value = getReplies()
    activeId.value = conversations.value[0]?.id || ''
  }
}

function scrollBottom() {
  const el = chatBody.value
  if (el) el.scrollTop = el.scrollHeight
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

/* ========== Messages 页面内容样式 ========== */

.page-title { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
.page-sub { color: var(--text-sub); margin: 0 0 18px; font-size: 14px; }

.msg-layout { display: grid; grid-template-columns: 300px 1fr; gap: 16px; align-items: start; }

.conv-list { padding: 14px; border-radius: 20px; max-height: 70vh; overflow-y: auto; }
.conv-head { display: flex; justify-content: space-between; align-items: center; font-weight: 700; margin-bottom: 10px; font-size: 14px; }
.conv-items { display: flex; flex-direction: column; gap: 8px; }
.conv-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 14px; cursor: pointer; transition: all .2s; border: 1px solid transparent; }
.conv-item:hover { background: rgba(255,255,255,0.4); }
.conv-item.active { background: rgba(255,255,255,0.55); border-color: var(--accent); box-shadow: 0 0 12px var(--glow); }
.conv-item.blocked { opacity: 0.55; }
.conv-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--grad-soft); color: var(--accent); border: 1px solid var(--card-border); display: grid; place-items: center; font-weight: 700; flex-shrink: 0; }
.conv-info { flex: 1; min-width: 0; }
.conv-info b { font-size: 13px; display: block; color: var(--text-main); }
.conv-info small { font-size: 11px; color: var(--text-sub); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.conv-blocked { font-size: 10px; color: var(--danger); }

.chat { padding: 16px; border-radius: 20px; display: flex; flex-direction: column; min-height: 60vh; }
.chat-head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--card-border); }
.chat-peer { display: flex; align-items: center; gap: 10px; }
.chat-peer small { display: block; font-size: 11px; color: var(--text-sub); }
.chat-acts { display: flex; gap: 6px; }

.mini {
  border: 1px solid var(--card-border);
  background: rgba(255,255,255,0.4);
  color: var(--text-main);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all .2s;
}
.mini:hover { border-color: var(--accent); }
.mini.danger:hover { border-color: var(--danger); color: var(--danger); }

.chat-body { flex: 1; overflow-y: auto; padding: 14px 4px; max-height: 52vh; }
.bubbles { display: flex; flex-direction: column; gap: 10px; }
.bubble { max-width: 72%; padding: 10px 14px; border-radius: 16px; font-size: calc(14px * var(--font-scale)); line-height: 1.6; word-break: break-word; animation: floatUpAni .3s both; position: relative; }
.bubble.mine { align-self: flex-end; background: var(--grad-soft); color: var(--accent); border: 1px solid var(--card-border); border-bottom-right-radius: 4px; }
.bubble.peer { align-self: flex-start; background: rgba(255,255,255,0.55); color: var(--text-main); border-bottom-left-radius: 4px; }
.bubble.recalled { opacity: 0.6; font-style: italic; font-size: 12px; }
.bubble-recall { position: absolute; top: -8px; right: 6px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.7); color: var(--text-sub); border-radius: 999px; font-size: 10px; padding: 1px 7px; cursor: pointer; }

@keyframes floatUpAni {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.chat-input { display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid var(--card-border); }
.chat-input textarea { flex: 1; border-radius: 14px; padding: 10px 14px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.45); color: var(--text-main); resize: none; outline: none; font-family: inherit; font-size: 14px; }
.chat-input textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--glow); }
.chat-blocked { text-align: center; color: var(--text-sub); font-size: 13px; padding: 16px; }
.chat-empty { grid-column: 2; }

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
  .main-content { padding-top: 66px; padding-bottom: 100px; }
  .top-nav { height: 50px; }
  .nav-links { display: none; }
  .nav-write-btn { display: none; }
  .hamburger { display: flex; }
  .bottom-nav { display: flex; }
  .msg-layout { grid-template-columns: 1fr; }
  .chat-empty { grid-column: 1; }
}
</style>
