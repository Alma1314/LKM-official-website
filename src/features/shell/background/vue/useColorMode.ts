import { ref, onMounted, onBeforeUnmount } from 'vue';

const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

export function useColorMode() {
  const mode = ref<'light' | 'dark'>(isDark() ? 'dark' : 'light');
  let observer: MutationObserver | null = null;

  onMounted(() => {
    observer = new MutationObserver(() => {
      mode.value = isDark() ? 'dark' : 'light';
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });
  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  return mode;
}
