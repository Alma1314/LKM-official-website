<template>
  <div class="blog-comments mt-12 pt-8 border-t border-[var(--surface-3)]">
    <h3 class="text-lg font-semibold font-heading text-[var(--deep-text)] mb-6">读者评论</h3>

    <div v-if="isReady" ref="giscusContainer" class="giscus" />

    <div v-else-if="loading" class="flex items-center justify-center py-12">
      <span class="loading loading-spinner loading-md text-[var(--primary)]" />
      <span class="ml-3 text-sm text-[var(--deep-text)]/50">评论加载中...</span>
    </div>

    <div v-else class="text-center py-8 bg-[var(--page-bg)] rounded-xl">
      <svg
        class="w-10 h-10 mx-auto mb-3 text-[var(--deep-text)]/30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <p class="text-sm text-[var(--deep-text)]/50">
        评论功能需要配置 Giscus。
        <a
          href="https://giscus.app/zh-CN"
          target="_blank"
          rel="noopener noreferrer"
          class="text-[var(--primary)] hover:underline"
        >
          前往配置
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

interface Props {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  term?: string;
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific';
  reactionsEnabled?: boolean;
  theme?: string;
}

const props = withDefaults(defineProps<Props>(), {
  repo: '',
  repoId: '',
  category: 'Announcements',
  categoryId: '',
  term: '',
  mapping: 'pathname',
  reactionsEnabled: true,
  theme: 'preferred_color_scheme',
});

const giscusContainer = ref<HTMLElement | null>(null);
const isReady = ref(false);
const loading = ref(false);
let isUnmounted = false;

const isConfigured = (): boolean => !!props.repo && !!props.repoId && !!props.categoryId;

function loadGiscus() {
  if (!isConfigured()) return;
  if (!giscusContainer.value) return;

  loading.value = true;

  const existing = document.querySelector('.giscus-script');
  if (existing) {
    existing.remove();
  }

  const container = giscusContainer.value;
  container.innerHTML = '';

  const script = document.createElement('script');
  script.className = 'giscus-script';
  script.src = 'https://giscus.app/client.js';
  script.setAttribute('data-repo', props.repo);
  script.setAttribute('data-repo-id', props.repoId);
  script.setAttribute('data-category', props.category);
  script.setAttribute('data-category-id', props.categoryId);
  script.setAttribute('data-mapping', props.mapping);
  script.setAttribute('data-term', props.term);
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', props.reactionsEnabled ? '1' : '0');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'bottom');
  // data-theme removed — using .dark class instead
  script.setAttribute('data-lang', 'zh-CN');
  script.setAttribute('data-loading', 'lazy');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;

  script.onload = () => {
    if (isUnmounted) return;
    loading.value = false;
    isReady.value = true;
  };

  script.onerror = () => {
    if (isUnmounted) return;
    loading.value = false;
    isReady.value = false;
  };

  container.appendChild(script);
}

onMounted(() => {
  if (isConfigured()) {
    loadGiscus();
  }
});

onBeforeUnmount(() => {
  isUnmounted = true;
  const frame = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
  if (frame) {
    frame.remove();
  }
  const script = document.querySelector('.giscus-script');
  if (script) {
    script.remove();
  }
});
</script>
