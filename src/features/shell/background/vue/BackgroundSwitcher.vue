<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent, watch, Teleport } from 'vue';
import { BACKGROUNDS, DEFAULT_BACKGROUND, type BackgroundId } from '../backgrounds';
import ErrorBoundary from './ErrorBoundary.vue';

const currentBg = ref<BackgroundId>(DEFAULT_BACKGROUND);
const isDark = ref(false);
const panelOpen = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const btnRef = ref<HTMLElement | null>(null);
const portalTarget = ref<HTMLElement | null>(null);

function getIsDark() { return document.documentElement.classList.contains('dark'); }

const lazyCache = new Map<string, ReturnType<typeof defineAsyncComponent>>();
function getLazyComponent(id: string, load: () => Promise<any>) {
  if (!lazyCache.has(id)) lazyCache.set(id, defineAsyncComponent(load));
  return lazyCache.get(id)!;
}

onMounted(() => {
  isDark.value = getIsDark();
  const observer = new MutationObserver(() => { isDark.value = getIsDark(); });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const stored = localStorage.getItem('interactiveBackground');
  if (stored && BACKGROUNDS.some(b => b.id === stored) && stored !== DEFAULT_BACKGROUND) {
    currentBg.value = stored as BackgroundId;
  }

  // Preload
  const defaultEntry = BACKGROUNDS.find(b => b.id === DEFAULT_BACKGROUND)!;
  if (defaultEntry.preload) defaultEntry.load();
  if (stored && stored !== DEFAULT_BACKGROUND) {
    const storedEntry = BACKGROUNDS.find(b => b.id === stored);
    if (storedEntry?.preload) storedEntry.load();
  }

  portalTarget.value = document.querySelector('[data-hero-section]');
});

const visibleBackgrounds = computed(() =>
  BACKGROUNDS.filter(b => b.theme === 'both' || b.theme === (isDark.value ? 'dark' : 'light'))
);

const activeEntry = computed(() => BACKGROUNDS.find(b => b.id === currentBg.value) || BACKGROUNDS.find(b => b.id === DEFAULT_BACKGROUND)!);
const ActiveComponent = computed(() => getLazyComponent(activeEntry.value.id, activeEntry.value.load));
const colorProps = computed(() => isDark.value ? (activeEntry.value as any).darkProps : (activeEntry.value as any).lightProps);
const bgKey = computed(() => `${currentBg.value}-${isDark.value ? 'dark' : 'light'}`);

function switchBg(id: BackgroundId) { currentBg.value = id; panelOpen.value = false; localStorage.setItem('interactiveBackground', id); }

// Close panel on outside click / Escape
function onDocMouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (panelRef.value && !panelRef.value.contains(target) && btnRef.value && !btnRef.value.contains(target)) {
    panelOpen.value = false;
  }
}
function onDocKeydown(e: KeyboardEvent) { if (e.key === 'Escape') panelOpen.value = false; }

watch(panelOpen, (val) => {
  if (val) {
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onDocKeydown);
  } else {
    document.removeEventListener('mousedown', onDocMouseDown);
    document.removeEventListener('keydown', onDocKeydown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMouseDown);
  document.removeEventListener('keydown', onDocKeydown);
});
</script>

<template>
  <div class="absolute inset-0 z-0" style="pointer-events: none">
    <!-- Canvas layer -->
    <div style="pointer-events: auto; position: absolute; inset: 0; overflow: hidden">
      <ErrorBoundary>
        <Suspense>
          <component :is="ActiveComponent" :key="bgKey" class="" v-bind="colorProps" />
          <template #fallback>
            <div class="fixed inset-0 bg-page-bg" style="z-index: 0" />
          </template>
        </Suspense>
      </ErrorBoundary>
    </div>

    <!-- Controls -->
    <Teleport :to="portalTarget || 'body'" :disabled="!portalTarget">
      <div style="pointer-events: auto">
        <button ref="btnRef"
          class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur flex items-center justify-center shadow-lg"
          @click="panelOpen = !panelOpen">
          <svg viewBox="0 0 24 24" class="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor"/></svg>
        </button>

        <div v-if="panelOpen" ref="panelRef"
          class="absolute top-14 right-4 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-2xl p-3 shadow-xl grid grid-cols-4 gap-2 w-64">
          <button v-for="bg in visibleBackgrounds" :key="bg.id"
            class="flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-colors hover:bg-surface-3"
            :class="{ 'bg-primary/15 text-primary ring-1 ring-primary/30': currentBg === bg.id }"
            @click="switchBg(bg.id)">
            <span class="text-lg">{{ bg.icon }}</span>
            <span>{{ bg.name }}</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
