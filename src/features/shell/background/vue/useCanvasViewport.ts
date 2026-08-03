import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue';
import { getBackgroundPerformance, type BackgroundMouse, type Ripple, type BackgroundPerformance } from './useBackgroundCanvas';

export function useCanvasViewport(maxDpr?: number) {
  const containerRef = ref<HTMLElement | null>(null);
  const size = ref({ width: 0, height: 0 });
  const isVisible = ref(true);
  const backgroundPerformance = ref<BackgroundPerformance>(getBackgroundPerformance(maxDpr));
  const mouseRef = shallowRef<BackgroundMouse>({ x: null, y: null, isDown: false });
  const ripplesRef = ref<Ripple[]>([]);

  let resizeTimer: ReturnType<typeof setTimeout>;

  function resize() {
    const el = containerRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    size.value = { width: rect.width, height: rect.height };
  }

  function updateVisibility() {
    const el = containerRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    isVisible.value = !document.hidden && (rect.bottom > 0 && rect.top < window.innerHeight);
  }

  onMounted(() => {
    resize();
    updateVisibility();

    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
    ro.observe(containerRef.value!);

    document.addEventListener('visibilitychange', updateVisibility);
    window.addEventListener('scroll', updateVisibility);
    window.addEventListener('resize', resize);

    (containerRef.value as HTMLElement).addEventListener('pointermove', (e: PointerEvent) => {
      const rect = (containerRef.value as HTMLElement).getBoundingClientRect();
      mouseRef.value = { x: e.clientX - rect.left, y: e.clientY - rect.top, isDown: true };
    });
    containerRef.value!.addEventListener('pointerleave', () => {
      mouseRef.value = { x: null, y: null, isDown: false };
    });
    containerRef.value!.addEventListener('pointerdown', (e: PointerEvent) => {
      if (!backgroundPerformance.value.reducedMotion) {
        const rect = containerRef.value!.getBoundingClientRect();
        const newRipples = [...ripplesRef.value, { x: e.clientX - rect.left, y: e.clientY - rect.top, startTime: performance.now() / 1000 }];
        ripplesRef.value = newRipples.slice(-12);
      }
    });

    onBeforeUnmount(() => {
      ro.disconnect();
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', updateVisibility);
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', resize);
    });
  });

  return { containerRef, size, isVisible, backgroundPerformance, mouseRef, ripplesRef };
}
