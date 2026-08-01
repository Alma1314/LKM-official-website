<template>
  <TreeholeShell active-nav="settings">
    <div class="container">
      <h1 class="page-title">⚙️ 设置中心</h1>
      <p class="page-sub">个性化你的树洞体验。</p>

      <section class="set-card glass">
        <!-- 主题模式 -->
        <div class="set-row">
          <div class="set-info">
            <b>🌗 主题模式</b>
            <small>白日温柔奶油风 / 暗夜深空渐变风</small>
          </div>
          <div class="theme-switch">
            <button class="theme-opt" :class="{ active: !isNight }" @click="setTheme('day')">☀️ 日间</button>
            <button class="theme-opt" :class="{ active: isNight }" @click="setTheme('night')">🌙 夜间</button>
          </div>
        </div>

        <!-- 自定义主题配色 -->
        <div class="set-row">
          <div class="set-info">
            <b>🎨 自定义主题配色</b>
            <small>点击色块切换强调色</small>
          </div>
          <div class="accent-picks">
            <button
              v-for="a in accents"
              :key="a[0]"
              class="accent-dot"
              :class="{ active: state.settings.accent === a[0] }"
              :style="{ background: `linear-gradient(135deg, ${a[0]}, ${a[1]})` }"
              @click="setAccent(a[0], a[1])"
            ></button>
            <input type="color" v-model="customA" class="accent-color" @input="onCustom" title="自定义主色" />
          </div>
        </div>

        <!-- 字体大小 -->
        <div class="set-row">
          <div class="set-info">
            <b>🔤 字体大小</b>
            <small>三档调节，全站生效</small>
          </div>
          <div class="theme-switch">
            <button
              class="theme-opt"
              :class="{ active: state.settings.fontScale === 'small' }"
              @click="setFontScale('small')"
            >
              小
            </button>
            <button
              class="theme-opt"
              :class="{ active: state.settings.fontScale === 'normal' }"
              @click="setFontScale('normal')"
            >
              中
            </button>
            <button
              class="theme-opt"
              :class="{ active: state.settings.fontScale === 'large' }"
              @click="setFontScale('large')"
            >
              大
            </button>
          </div>
        </div>

        <!-- 白噪音背景音乐 -->
        <div class="set-row">
          <div class="set-info">
            <b>🌫️ 白噪音背景音乐</b>
            <small>柔和雨声，沉浸书写</small>
          </div>
          <button class="switch" :class="{ on: state.settings.audioOn }" @click="toggleAudio">
            <span class="knob"></span>
          </button>
        </div>

        <!-- 高对比度护眼模式 -->
        <div class="set-row">
          <div class="set-info">
            <b>👁️ 高对比度护眼模式</b>
            <small>加深文字对比，缓解眼疲劳</small>
          </div>
          <button class="switch" :class="{ on: highContrast }" @click="toggleHighContrast()">
            <span class="knob"></span>
          </button>
        </div>

        <!-- 低性能设备特效开关 -->
        <div class="set-row">
          <div class="set-info">
            <b>🐢 低性能设备特效开关</b>
            <small>关闭重特效与粒子，更流畅</small>
          </div>
          <button class="switch" :class="{ on: lowPerf }" @click="toggleLowPerf()">
            <span class="knob"></span>
          </button>
        </div>

        <!-- 全站动效静音 -->
        <div class="set-row">
          <div class="set-info">
            <b>🔕 全站动效静音</b>
            <small>暂停漂浮粒子与过渡动画</small>
          </div>
          <button class="switch" :class="{ on: state.settings.muted }" @click="toggleMuted">
            <span class="knob"></span>
          </button>
        </div>

        <!-- 投稿限流 -->
        <div class="set-row">
          <div class="set-info">
            <b>🚦 投稿限流（自定义）</b>
            <small>每分钟最多可投稿 {{ state.settings.rateLimit }} 封</small>
          </div>
          <div class="rate-pick">
            <button
              v-for="n in [1, 2, 3, 5, 10]"
              :key="n"
              class="theme-opt"
              :class="{ active: state.settings.rateLimit === n }"
              @click="setRateLimit(n)"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- 隐私声明 -->
        <div class="set-row">
          <div class="set-info">
            <b>🔒 隐私声明</b>
            <small>查看数据本地存储说明</small>
          </div>
          <button class="mini" @click="showPrivacy = true">查看</button>
        </div>
      </section>

      <p class="foot-note">数据保存于本地浏览器（匿名），投稿发布至服务器数据库。</p>

      <PrivacyDialog v-model="showPrivacy" />
    </div>
  </TreeholeShell>
</template>

<script setup>
import { ref } from 'vue';
import TreeholeShell from '../components/TreeholeShell.vue';
import PrivacyDialog from '../components/PrivacyDialog.vue';
import { useApp } from '../store/app';
import * as store from '../store/storage';
import { buildUrl } from '~/core/utils/paths';

const app = useApp();
const {
  state,
  isNight,
  lowPerf,
  highContrast,
  setTheme,
  setFontScale,
  toggleMuted,
  setAccent,
  toggleLowPerf,
  toggleHighContrast,
  setRateLimit,
} = app;

const showPrivacy = ref(false);

const accents = [
  ['#e8a87c', '#c3aed6'],
  ['#8b7ff0', '#5fd0e0'],
  ['#ff9aa2', '#ffc6ff'],
  ['#7bdff2', '#b2f7ef'],
  ['#f6c28b', '#d9a7c7'],
  ['#a0c4ff', '#bdb2ff'],
];
const customA = ref(state.settings.accent);

function onCustom() {
  const b = customA.value;
  const b2 = shade(b, 40);
  setAccent(b, b2);
}

function shade(hex, amt) {
  const h = hex.replace('#', '');
  let r = parseInt(h.slice(0, 2), 16) + amt;
  let g = parseInt(h.slice(2, 4), 16) + amt;
  let bl = parseInt(h.slice(4, 6), 16) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  bl = Math.max(0, Math.min(255, bl));
  return '#' + [r, g, bl].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function toggleAudio() {
  state.settings.audioOn = !state.settings.audioOn;
  store.saveSettings({ audioOn: state.settings.audioOn });
}
</script>

<style scoped>
/* ========== Settings 页面内容样式 ========== */

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

.set-card {
  padding: 8px 18px;
  border-radius: 20px;
}
.set-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--card-border);
  gap: 12px;
}
.set-row:last-child {
  border-bottom: none;
}
.set-info b {
  font-size: 15px;
}
.set-info small {
  display: block;
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 2px;
}

.theme-switch,
.rate-pick,
.accent-picks {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.theme-opt {
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.4);
  color: var(--text-sub);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
}
.theme-opt.active {
  background: var(--grad-soft);
  color: var(--accent);
  border-color: var(--blue);
  box-shadow: 0 0 12px var(--glow);
}

.accent-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s;
}
.accent-dot.active {
  border-color: var(--text-main);
  transform: scale(1.15);
}
.accent-color {
  width: 32px;
  height: 30px;
  border: none;
  background: none;
  cursor: pointer;
}

.switch {
  width: 50px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid var(--card-border);
  background: transparent;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
  flex-shrink: 0;
}
.switch.on {
  background: var(--grad-soft);
  border-color: var(--blue);
}
.knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.switch.on .knob {
  transform: translateX(22px);
}

.mini {
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.4);
  color: var(--text-main);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
}

.foot-note {
  text-align: center;
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 18px;
}
</style>
