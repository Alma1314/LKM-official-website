<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from '~/lib/constants/constants';
import I18nKey from '~/lib/i18n/i18nKey';
import { i18n } from '~/lib/i18n/translation';
import { Icon } from '@iconify/vue';
import { applyThemeToDocument, getStoredTheme, setTheme } from '~/lib/utils/setting-utils';
import type { LIGHT_DARK_MODE } from '~/types/config';

const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
const mode = ref<LIGHT_DARK_MODE>(AUTO_MODE);

onMounted(() => {
  mode.value = getStoredTheme();
  const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
  const changeThemeWhenSchemeChanged = () => {
    applyThemeToDocument(mode.value);
  };
  darkModePreference.addEventListener('change', changeThemeWhenSchemeChanged);
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
  mode.value = newMode;
  setTheme(newMode);
}

function toggleScheme() {
  const idx = seq.indexOf(mode.value);
  switchScheme(seq[(idx + 1) % seq.length]);
}

function showPanel() {
  const panel = document.querySelector('#light-dark-panel');
  panel?.classList.remove('float-panel-closed');
}

function hidePanel() {
  const panel = document.querySelector('#light-dark-panel');
  panel?.classList.add('float-panel-closed');
}
</script>

<template>
  <div class="relative z-50" role="menu" tabindex="-1" @mouseleave="hidePanel">
    <!-- 主切换按钮 -->
    <button
      aria-label="Light/Dark Mode"
      role="menuitem"
      class="relative scale-animation rounded-lg h-11 w-11 active:scale-90 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      id="scheme-switch"
      @click="toggleScheme"
      @mouseenter="showPanel"
    >
      <div class="absolute transition-opacity duration-200" :class="{ 'opacity-0': mode !== LIGHT_MODE }">
        <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]" />
      </div>
      <div class="absolute transition-opacity duration-200" :class="{ 'opacity-0': mode !== DARK_MODE }">
        <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]" />
      </div>
      <div class="absolute transition-opacity duration-200" :class="{ 'opacity-0': mode !== AUTO_MODE }">
        <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem]" />
      </div>
    </button>

    <!-- 下拉面板 -->
    <div id="light-dark-panel" class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5">
      <div
        class="bg-white dark:bg-[oklch(0.23_0.015_var(--hue))] border border-black/5 dark:border-white/10 rounded-[var(--radius-large)] overflow-hidden shadow-lg dark:shadow-none float-panel p-1.5"
      >
        <!-- 亮色模式选项 -->
        <button
          class="flex transition-all whitespace-nowrap items-center !justify-start w-full scale-animation rounded-lg h-9 px-3 text-sm font-medium active:scale-95 mb-0.5"
          :class="
            mode === LIGHT_MODE
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary hover:bg-black/5 dark:hover:bg-white/10'
          "
          @click="switchScheme(LIGHT_MODE)"
        >
          <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem] mr-2.5" />
          {{ i18n(I18nKey.lightMode) }}
        </button>

        <!-- 暗色模式选项 -->
        <button
          class="flex transition-all whitespace-nowrap items-center !justify-start w-full scale-animation rounded-lg h-9 px-3 text-sm font-medium active:scale-95 mb-0.5"
          :class="
            mode === DARK_MODE
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary hover:bg-black/5 dark:hover:bg-white/10'
          "
          @click="switchScheme(DARK_MODE)"
        >
          <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem] mr-2.5" />
          {{ i18n(I18nKey.darkMode) }}
        </button>

        <!-- 跟随系统选项 -->
        <button
          class="flex transition-all whitespace-nowrap items-center !justify-start w-full scale-animation rounded-lg h-9 px-3 text-sm font-medium active:scale-95"
          :class="
            mode === AUTO_MODE
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary hover:bg-black/5 dark:hover:bg-white/10'
          "
          @click="switchScheme(AUTO_MODE)"
        >
          <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem] mr-2.5" />
          {{ i18n(I18nKey.systemMode) }}
        </button>
      </div>
    </div>
  </div>
</template>