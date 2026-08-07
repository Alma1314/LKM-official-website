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
    <button
      aria-label="Light/Dark Mode"
      role="menuitem"
      class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
      id="scheme-switch"
      @click="toggleScheme"
      @mouseenter="showPanel"
    >
      <div class="absolute" :class="{ 'opacity-0': mode !== LIGHT_MODE }">
        <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]" />
      </div>
      <div class="absolute" :class="{ 'opacity-0': mode !== DARK_MODE }">
        <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]" />
      </div>
      <div class="absolute" :class="{ 'opacity-0': mode !== AUTO_MODE }">
        <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem]" />
      </div>
    </button>

    <div id="light-dark-panel" class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5">
      <div
        class="bg-white dark:bg-[oklch(0.23_0.015_var(--hue))] rounded-[var(--radius-large)] overflow-hidden shadow-sm dark:shadow-none float-panel p-2"
      >
        <button
          class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
          :class="{ 'current-theme-btn': mode === LIGHT_MODE }"
          @click="switchScheme(LIGHT_MODE)"
        >
          <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem] mr-3" />
          {{ i18n(I18nKey.lightMode) }}
        </button>
        <button
          class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
          :class="{ 'current-theme-btn': mode === DARK_MODE }"
          @click="switchScheme(DARK_MODE)"
        >
          <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem] mr-3" />
          {{ i18n(I18nKey.darkMode) }}
        </button>
        <button
          class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95"
          :class="{ 'current-theme-btn': mode === AUTO_MODE }"
          @click="switchScheme(AUTO_MODE)"
        >
          <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem] mr-3" />
          {{ i18n(I18nKey.systemMode) }}
        </button>
      </div>
    </div>
  </div>
</template>
