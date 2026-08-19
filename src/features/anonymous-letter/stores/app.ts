// =============================================================
// 全局响应式状态 (composable)
// 主题跟随主站 .dark class，不自行管理 data-theme
// =============================================================
import { reactive, computed, watch, type ComputedRef } from "vue";
import * as store from "./storage";
import type { TreeholeSettings } from "./storage";

interface AppState {
  settings: TreeholeSettings;
}

const isClient = typeof document !== "undefined";

export function useApp(): {
  state: AppState;
  isNight: ComputedRef<boolean>;
  lowPerf: ComputedRef<boolean>;
  highContrast: ComputedRef<boolean>;
  toggleTheme: () => void;
  setTheme: (t: "day" | "night") => void;
  toggleMuted: () => void;
  setFontScale: (s: "small" | "normal" | "large") => void;
  setAccent: (a: string, b: string) => void;
  toggleLowPerf: () => void;
  toggleHighContrast: () => void;
  setRateLimit: (n: number) => void;
  acceptPrivacy: () => void;
} {
  const settings = store.getSettings();
  // 始终从主站 .dark class 同步初始主题，不被 localStorage 覆盖
  if (isClient) {
    settings.theme = document.documentElement.classList.contains("dark")
      ? "night"
      : "day";
  }

  const state = reactive<AppState>({ settings });

  // 监听主站 theme 变化（astro:after-swap 后 BasicScripts 会更新 .dark class）
  if (isClient) {
    document.addEventListener("astro:after-swap", () => {
      const isDark = document.documentElement.classList.contains("dark");
      state.settings.theme = isDark ? "night" : "day";
    });
  }

  const isNight = computed(() => state.settings.theme === "night");
  const lowPerf = computed(
    () => state.settings.lowPerf || state.settings.muted,
  );
  const highContrast = computed(() => state.settings.highContrast);

  // 字体大小 -> 写入根节点 css 变量
  watch(
    () => state.settings.fontScale,
    (s) => {
      if (isClient) {
        document.documentElement.style.setProperty(
          "--font-scale",
          s === "small" ? "0.9" : s === "large" ? "1.15" : "1",
        );
      }
    },
    { immediate: true },
  );

  // 高对比度护眼模式
  watch(
    () => state.settings.highContrast,
    (on) => {
      if (isClient)
        document.documentElement.classList.toggle("high-contrast", !!on);
    },
    { immediate: true },
  );

  // 低性能设备：关闭重特效
  watch(
    () => state.settings.lowPerf,
    (on) => {
      if (isClient) document.documentElement.classList.toggle("low-perf", !!on);
    },
    { immediate: true },
  );

  // 同步设置到存储
  watch(
    () => state.settings,
    (s) => store.saveSettings(s),
    { deep: true },
  );

  function toggleTheme(): void {
    const next = isNight.value ? "day" : "night";
    state.settings.theme = next;
    document.documentElement.classList.toggle("dark", next === "night");
    localStorage.theme = next === "night" ? "dark" : "light";
  }

  function setTheme(t: "day" | "night"): void {
    state.settings.theme = t;
  }
  function toggleMuted(): void {
    state.settings.muted = !state.settings.muted;
  }
  function setFontScale(s: "small" | "normal" | "large"): void {
    state.settings.fontScale = s;
  }
  function setAccent(a: string, b: string): void {
    state.settings.accent = a;
    state.settings.accent2 = b;
  }
  function toggleLowPerf(): void {
    state.settings.lowPerf = !state.settings.lowPerf;
  }
  function toggleHighContrast(): void {
    state.settings.highContrast = !state.settings.highContrast;
  }
  function setRateLimit(n: number): void {
    state.settings.rateLimit = n;
  }
  function acceptPrivacy(): void {
    state.settings.privacyAccepted = true;
  }

  return {
    state,
    isNight,
    lowPerf,
    highContrast,
    toggleTheme,
    setTheme,
    toggleMuted,
    setFontScale,
    setAccent,
    toggleLowPerf,
    toggleHighContrast,
    setRateLimit,
    acceptPrivacy,
  };
}
