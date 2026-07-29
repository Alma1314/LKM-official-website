<template>
  <div class="layout">
    <!-- 流动渐变背景 -->
    <div class="bg-flow"></div>
    <Particles />

    <!-- 角落同款半圆弧淡渐变装饰 -->
    <div class="corner-deco tl"></div>
    <div class="corner-deco tr"></div>
    <div class="corner-deco br"></div>

    <!-- 细线性迷你装饰图标：水滴 / 坐标轴 / 幼苗 / 烧瓶 -->
    <div class="mini-deco md1" aria-hidden="true">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C12 3 6 11 6 15 a6 6 0 0 0 12 0 C18 11 12 3 12 3 Z"/><path d="M9 15 a3 3 0 0 0 3 3"/></svg>
    </div>
    <div class="mini-deco md2" aria-hidden="true">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 L19 5"/><path d="M5 19 L19 19"/><path d="M5 19 L5 5"/><path d="M19 5 l-2 2 M19 5 l-2 -2"/></svg>
    </div>
    <div class="mini-deco md3" aria-hidden="true">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 V11"/><path d="M12 11 C12 11 8 9 7 5 C10 6 12 9 12 11 Z"/><path d="M12 13 C12 13 16 11 17 7 C14 8 12 11 12 13 Z"/></svg>
    </div>
    <div class="mini-deco md4" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3 h6 M10 3 v6 l-4 8 a3 3 0 0 0 3 4 h6 a3 3 0 0 0 3 -4 l-4 -8 V3"/><path d="M7.5 17 h9"/></svg>
    </div>

    <!-- 桌面/悬浮顶部导航 -->
    <header class="nav glass" :class="{ 'nav-scrolled': scrolled }">
      <div class="nav-inner container">
        <div class="brand" @click="go('/')">
          <img class="brand-logo" src="../assets/logo.jpg" alt="logo" />
          <span class="brand-name grad-text">拾光树洞</span>
        </div>
        <nav class="nav-links">
          <router-link v-for="n in navItems" :key="n.to" :to="n.to" class="nav-link">
            <el-icon><component :is="n.icon" /></el-icon><span>{{ n.label }}</span>
          </router-link>
        </nav>
        <div class="nav-actions">
          <AudioPlayer />
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="nav-badge">
            <button class="icon-btn" @click="go('/messages')" title="消息回信">
              <el-icon><Bell /></el-icon>
            </button>
          </el-badge>
          <button class="icon-btn" @click="toggleTheme" :title="isNight ? '切换日间' : '切换夜间'">
            <el-icon><component :is="isNight ? Sunny : Moon" /></el-icon>
          </button>
          <button class="icon-btn" @click="moreOpen = true" title="更多">
            <el-icon><MoreFilled /></el-icon>
          </button>
          <button class="btn-grad nav-write" @click="go('/write')">✍️ 写信</button>
        </div>
      </div>
    </header>

    <!-- 路由页面 -->
    <main class="page container" :class="{ 'with-nav': !isMobile }">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 移动端底部导航 -->
    <nav v-if="isMobile" class="bottom-nav glass">
      <router-link v-for="n in navItemsMobile" :key="n.to" :to="n.to" class="bottom-item">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" :dot="n.to === '/messages'">
          <el-icon class="bottom-icon"><component :is="n.icon" /></el-icon>
        </el-badge>
        <span>{{ n.label }}</span>
      </router-link>
    </nav>

    <!-- 收到回信实时弹窗提醒 -->
    <transition name="dialog-fade">
      <div v-if="currentToast" class="toast-mask" @click.self="dismissToast">
        <div class="toast glass" @click="openMessage">
          <div class="toast-avatar">{{ (currentToast.peerCodename || '🌙').charAt(0) }}</div>
          <div class="toast-body">
            <div class="toast-title">收到一封匿名回信</div>
            <div class="toast-sub">{{ currentToast.peerCodename }} 给你写了信…</div>
          </div>
          <el-icon class="toast-close" @click.stop="dismissToast"><Close /></el-icon>
        </div>
      </div>
    </transition>

    <!-- 更多导航抽屉 -->
    <Drawer v-model="moreOpen" title="更多功能">
      <div class="more-list">
        <button v-for="n in moreItems" :key="n.to" class="more-item" @click="goMore(n.to)">
          <el-icon><component :is="n.icon" /></el-icon>
          <span>{{ n.label }}</span>
        </button>
      </div>
    </Drawer>

    <!-- 隐私声明弹窗 -->
    <PrivacyDialog v-model="showPrivacy" />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeFilled, EditPen, MagicStick, User, Bell, Setting,
  Sunny, Moon, DataAnalysis, Close, ChatDotRound, MoreFilled,
  Ship, Star, Histogram, Folder, Download, Bell as BellIcon
} from '@element-plus/icons-vue'
import Particles from '../components/Particles.vue'
import PrivacyDialog from '../components/PrivacyDialog.vue'
import Drawer from '../components/Drawer.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import { useApp } from '../store/app'

const router = useRouter()
const { state, isNight, toggleTheme } = useApp()

const scrolled = ref(false)
const isMobile = ref(window.innerWidth <= 768)

const navItems = [
  { to: '/', label: '树洞广场', icon: HomeFilled },
  { to: '/random', label: '随机树洞', icon: MagicStick },
  { to: '/rank', label: '榜单', icon: DataAnalysis },
  { to: '/mine', label: '我的树洞', icon: User },
  { to: '/settings', label: '设置', icon: Setting }
]
const navItemsMobile = [
  { to: '/', label: '广场', icon: HomeFilled },
  { to: '/random', label: '随机', icon: MagicStick },
  { to: '/messages', label: '消息', icon: ChatDotRound },
  { to: '/write', label: '写信', icon: EditPen },
  { to: '/mine', label: '我的', icon: User }
]
const moreItems = [
  { to: '/bottle', label: '漂流瓶', icon: Ship },
  { to: '/wish', label: '许愿墙', icon: Star },
  { to: '/mine', label: '我的树洞', icon: User },
  { to: '/settings', label: '设置', icon: Setting }
]
const moreOpen = ref(false)
function goMore(to) { moreOpen.value = false; router.push(to) }

const unreadCount = computed(() => 0)

function go(to) { router.push(to) }

function onScroll() { scrolled.value = window.scrollY > 30 }
function onResize() { isMobile.value = window.innerWidth <= 768 }

// 隐私声明首次弹窗
const showPrivacy = ref(false)

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  if (!state.settings.privacyAccepted) showPrivacy.value = true
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.layout { min-height: 100vh; position: relative; }

.nav {
  position: fixed;
  top: 12px; left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 28px);
  max-width: 1180px;
  border-radius: 18px;
  z-index: 100;
  background: var(--nav-bg);
  border: 1px solid var(--card-border);
  transition: top .3s, box-shadow .3s, background .3s;
}
.nav-scrolled { top: 6px; box-shadow: 0 8px 24px var(--glow); }
.nav-inner {
  display: flex; align-items: center; justify-content: space-between;
  height: 62px; padding: 0 16px;
}
.brand { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 800; }
.brand-logo {
  width: 40px; height: 40px; border-radius: 50%;
  object-fit: contain; padding: 2px;
  box-shadow: 0 0 0 1px var(--card-border);
  transition: transform .3s;
}
.brand:hover .brand-logo { transform: rotate(-4deg) scale(1.05); }
.brand-name { font-size: 19px; letter-spacing: 1px; }
.nav-links { display: flex; gap: 6px; }
.nav-link {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px; border-radius: 12px;
  color: var(--text-sub); text-decoration: none; font-size: 14px;
  transition: all .25s;
}
.nav-link:hover { color: var(--accent); background: var(--grad-soft); }
.nav-link.router-link-active { color: var(--accent); background: var(--grad-soft); box-shadow: inset 0 0 0 1px var(--card-border); }
.nav-actions { display: flex; align-items: center; gap: 10px; }
.icon-btn {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid var(--card-border);
  background: transparent;
  color: var(--text-main);
  display: grid; place-items: center; cursor: pointer;
  font-size: 18px; transition: all .25s;
}
.icon-btn:hover { color: var(--accent); border-color: var(--blue); background: var(--grad-soft); transform: translateY(-2px); }
.user-chip {
  height: 40px; padding: 0 16px; border-radius: 999px;
  border: 1px solid var(--card-border); background: transparent;
  color: var(--text-main); cursor: pointer; font-size: 13px; transition: all .25s;
}
.user-chip:hover { border-color: var(--blue); color: var(--accent); background: var(--grad-soft); }
.nav-badge :deep(.el-badge__content) { border: none; background: var(--grad); }

.page { padding-top: 100px; padding-bottom: 60px; min-height: 100vh; }
.with-nav { padding-bottom: 120px; }

/* 移动端底部导航 */
.bottom-nav {
  position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%);
  width: calc(100% - 24px); max-width: 520px;
  display: flex; justify-content: space-around;
  padding: 8px 6px; border-radius: 20px; z-index: 100;
  background: var(--nav-bg); border: 1px solid var(--card-border);
}
.bottom-item {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  color: var(--text-sub); text-decoration: none; font-size: 11px;
  flex: 1; transition: color .2s;
}
.bottom-icon { font-size: 21px; }
.bottom-item.router-link-active { color: var(--accent); }

/* 回信弹窗提醒 */
.toast-mask {
  position: fixed; inset: 0; z-index: 200;
  background: var(--mask); backdrop-filter: blur(2px);
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 90px;
}
.toast {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: 18px; cursor: pointer;
  width: min(380px, 90vw); animation: floatUp .4s both;
}
.toast-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--grad-soft); color: var(--accent); border: 1px solid var(--card-border);
  display: grid; place-items: center; font-weight: 700; font-size: 18px;
  flex-shrink: 0;
}
.toast-body { flex: 1; }
.toast-title { font-weight: 700; }
.toast-sub { font-size: 12px; color: var(--text-sub); }
.toast-close { color: var(--text-sub); cursor: pointer; }

/* 迷你线性装饰图标定位 */
.mini-deco.md1 { top: 18%; left: 4%; }
.mini-deco.md2 { top: 42%; right: 5%; opacity: 0.4; }
.mini-deco.md3 { bottom: 22%; left: 6%; opacity: 0.42; }
.mini-deco.md4 { top: 70%; right: 7%; opacity: 0.4; }
@media (max-width: 768px) {
  .mini-deco { display: none; }
}

/* 更多抽屉列表 */
.more-list { display: flex; flex-direction: column; gap: 8px; }
.more-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: var(--radius-sm);
  border: 1px solid var(--card-border); background: var(--card-bg);
  color: var(--text-main); cursor: pointer; font-size: 15px; transition: all .2s;
}
.more-item:hover { transform: translateX(4px); border-color: var(--blue); background: var(--grad-soft); }
.more-item .el-icon { font-size: 18px; color: var(--accent); }

/* 页面切换过渡 */
.page-enter-active, .page-leave-active { transition: opacity .3s, transform .3s; }
.page-enter-from { opacity: 0; transform: translateY(12px); }
.page-leave-to { opacity: 0; transform: translateY(-12px); }

@media (max-width: 768px) {
  .nav-links, .nav-write { display: none; }
  .nav-inner { justify-content: space-between; }
  .page { padding-top: 84px; padding-bottom: 96px; }
}
</style>
