/**
 * Mobile editor utilities: touch gestures, keyboard adaptation, viewport management.
 * These are applied as side effects / event listeners in the editor's useEffect.
 */

/** Scroll editor content into view when virtual keyboard appears on mobile */
export function setupKeyboardAutoScroll(editorEl: HTMLElement | null): () => void {
  if (!editorEl) return () => {};

  const vv = window.visualViewport;
  let rafId: number | null = null;

  if (vv) {
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const heightDiff = window.innerHeight - vv.height;
        if (heightDiff > 150) {
          // 键盘弹出：增加底部 padding 并滚动到焦点元素
          editorEl.style.paddingBottom = `${heightDiff}px`;
          const activeEl = document.activeElement as HTMLElement;
          if (activeEl && editorEl.contains(activeEl)) {
            activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        } else {
          // 键盘收起
          editorEl.style.paddingBottom = '';
        }
      });
    };

    vv.addEventListener('resize', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      editorEl.style.paddingBottom = '';
      if (rafId) cancelAnimationFrame(rafId);
    };
  }

  // Fallback: focus-based detection (old browsers without visualViewport)
  const handleFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (!editorEl.contains(target)) return;

    // Wait for keyboard animation to start
    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // If target is near the bottom half, scroll it up
      if (rect.bottom > viewportHeight * 0.4) {
        editorEl.style.paddingBottom = `${viewportHeight * 0.5}px`;
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 300);
  };

  const handleBlur = () => {
    editorEl.style.paddingBottom = '';
  };

  editorEl.addEventListener('focusin', handleFocusIn);
  editorEl.addEventListener('focusout', handleBlur);

  return () => {
    editorEl.removeEventListener('focusin', handleFocusIn);
    editorEl.removeEventListener('focusout', handleBlur);
    editorEl.style.paddingBottom = '';
  };
}

/** Mobile viewport: detect small screens */
export function isMobile(): boolean {
  return window.innerWidth < 768 || 'ontouchstart' in window;
}

/** Add "swipe to dismiss" and "long press" handling on a container */
export function setupTouchGestures(
  container: HTMLElement | null,
  handlers: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onLongPress?: (target: HTMLElement) => void;
  }
): () => void {
  if (!container) return () => {};

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let touchTarget: HTMLElement | null = null;
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
    touchTarget = e.target as HTMLElement;

    if (handlers.onLongPress) {
      longPressTimer = setTimeout(() => {
        if (touchTarget) handlers.onLongPress?.(touchTarget);
      }, 600);
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const dt = Date.now() - touchStartTime;

    if (dt > 500) return; // too slow — not a swipe
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return; // not horizontal enough

    if (dx > 0) {
      handlers.onSwipeRight?.();
    } else {
      handlers.onSwipeLeft?.();
    }
  };

  container.addEventListener('touchstart', onTouchStart);
  container.addEventListener('touchend', onTouchEnd);

  return () => {
    container.removeEventListener('touchstart', onTouchStart);
    container.removeEventListener('touchend', onTouchEnd);
    if (longPressTimer) clearTimeout(longPressTimer);
  };
}
