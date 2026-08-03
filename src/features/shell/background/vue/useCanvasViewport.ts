import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue';
import {
  getBackgroundPerformance,
  type BackgroundMouse,
  type Ripple,
  type BackgroundPerformance,
} from './useBackgroundCanvas';

export function useCanvasViewport(maxDpr?: number) {
  const containerRef = ref<HTMLElement | null>(null);
  const size = ref({ width: 0, height: 0 });
  const isVisible = ref(true);
  const backgroundPerformance = ref<BackgroundPerformance>(getBackgroundPerformance(maxDpr));
  const mouseRef = shallowRef<BackgroundMouse>({ x: null, y: null, isDown: false });
  const ripplesRef = ref<Ripple[]>([]);
  let resizeTimer: ReturnType<typeof setTimeout>;
  let ro: ResizeObserver;
  let cleanup: () => void;

  onMounted(() => {
    const el = containerRef.value!;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      size.value = { width: rect.width, height: rect.height };
    };
    const updateVisibility = () => {
      const rect = el.getBoundingClientRect();
      isVisible.value = !document.hidden && rect.bottom > 0 && rect.top < window.innerHeight;
    };
    resize();
    updateVisibility();
    ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
    ro.observe(el);
    document.addEventListener('visibilitychange', updateVisibility);
    window.addEventListener('scroll', updateVisibility);
    window.addEventListener('resize', resize);
    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      mouseRef.value = { x: e.clientX - rect.left, y: e.clientY - rect.top, isDown: true };
    };
    const onPointerLeave = () => {
      mouseRef.value = { x: null, y: null, isDown: false };
    };
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', onPointerLeave);
    cleanup = () => {
      ro.disconnect();
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', updateVisibility);
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', resize);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
    };
  });

  onBeforeUnmount(() => {
    cleanup?.();
  });
  return { containerRef, size, isVisible, backgroundPerformance, mouseRef, ripplesRef };
}
