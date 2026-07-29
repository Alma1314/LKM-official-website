// =============================================================
// 全局响应式状态 (composable)
// 让主题、设置、收件箱提醒在任意组件共享并实时更新
// =============================================================
import { reactive, computed, watch } from 'vue'
import * as store from './storage'
import type { TreeholeSettings } from './storage'

interface AppState {
  settings: TreeholeSettings
}

interface AppReturn {
  state: AppState
  isNight: import('vue').ComputedRef<boolean>
  lowPerf: import('vue').ComputedRef<boolean>
  highContrast: import('vue').ComputedRef<boolean>
  toggleTheme: () => void
  setTheme: (t: 'day' | 'night') => void
  toggleMuted: () => void
  setFontScale: (s: 'small' | 'normal' | 'large') => void
  setAccent: (a: string, b: string) => void
  toggleLowPerf: () => void
  toggleHighContrast: () => void
  setRateLimit: (n: number) => void
  acceptPrivacy: () => void
}

const state = reactive<AppState>({
  settings: store.getSettings()
})

// 主题切换 -> 写入 <html data-theme>
watch(
  () => state.settings.theme,
  (t) => { document.documentElement.setAttribute('data-theme', t) },
  { immediate: true }
)

// 字体大小 -> 写入根节点 css 变量
watch(
  () => state.settings.fontScale,
  (s) => {
    document.documentElement.style.setProperty('--font-scale', s === 'small' ? '0.9' : s === 'large' ? '1.15' : '1')
  },
  { immediate: true }
)

// 自定义强调色
watch(
  () => [state.settings.accent, state.settings.accent2],
  ([a, b]) => {
    document.documentElement.style.setProperty('--accent', a)
    document.documentElement.style.setProperty('--accent-2', b)
    document.documentElement.style.setProperty('--accent-grad', `linear-gradient(135deg, ${a}, ${b})`)
    document.documentElement.style.setProperty('--glow', hexToRgba(a, 0.55))
  },
  { immediate: true }
)

// 高对比度护眼模式
watch(
  () => state.settings.highContrast,
  (on) => {
    document.documentElement.classList.toggle('high-contrast', !!on)
  },
  { immediate: true }
)

// 低性能设备：关闭重特效
watch(
  () => state.settings.lowPerf,
  (on) => { document.documentElement.classList.toggle('low-perf', !!on) },
  { immediate: true }
)

// 同步设置到存储
watch(
  () => state.settings,
  (s) => store.saveSettings(s),
  { deep: true }
)

// 定时发布 / 限时封存 现在由后端定时任务处理，前端无需轮询

export function useApp(): AppReturn {
  const isNight = computed(() => state.settings.theme === 'night')
  const lowPerf = computed(() => state.settings.lowPerf || state.settings.muted)
  const highContrast = computed(() => state.settings.highContrast)

  function toggleTheme(): void { state.settings.theme = isNight.value ? 'day' : 'night' }
  function setTheme(t: 'day' | 'night'): void { state.settings.theme = t }
  function toggleMuted(): void { state.settings.muted = !state.settings.muted }
  function setFontScale(s: 'small' | 'normal' | 'large'): void { state.settings.fontScale = s }
  function setAccent(a: string, b: string): void { state.settings.accent = a; state.settings.accent2 = b }
  function toggleLowPerf(): void { state.settings.lowPerf = !state.settings.lowPerf }
  function toggleHighContrast(): void { state.settings.highContrast = !state.settings.highContrast }
  function setRateLimit(n: number): void { state.settings.rateLimit = n }
  function acceptPrivacy(): void { state.settings.privacyAccepted = true }

  return {
    state, isNight, lowPerf, highContrast,
    toggleTheme, setTheme, toggleMuted, setFontScale, setAccent,
    toggleLowPerf, toggleHighContrast, setRateLimit, acceptPrivacy
  }
}

function hexToRgba(hex: string, a: number): string {
  const h = (hex || '#e8a87c').replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}
