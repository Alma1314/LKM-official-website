import { useEffect, useRef } from 'react';

export interface Ripple {
  x: number;
  y: number;
  startTime: number;
}

export interface BackgroundMouse {
  x: number | null;
  y: number | null;
  isDown: boolean;
}

export interface BackgroundFrame {
  ctx: CanvasRenderingContext2D;
  width: number; // CSS 像素
  height: number;
  dpr: number;
  mouse: BackgroundMouse;
  ripples: Ripple[];
  keys: { shift: boolean };
  time: number; // 秒，自启动累计；暂停期不增长
  delta: number; // 距上一帧秒数
}

export interface BackgroundInteractions {
  mouse?: boolean;
  click?: boolean;
  keys?: boolean;
}

export interface UseBackgroundCanvasOptions {
  draw: (frame: BackgroundFrame) => void;
  init?: (canvas: HTMLCanvasElement, frame: BackgroundFrame) => void | (() => void);
  interactions?: BackgroundInteractions;
  maxDpr?: number;
}

const DEFAULT_MAX_DPR = 1.5;
const RESIZE_DEBOUNCE_MS = 200;

export function useBackgroundCanvas({
  draw,
  init,
  interactions = {},
  maxDpr = DEFAULT_MAX_DPR,
}: UseBackgroundCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<BackgroundFrame | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);
  const initCleanupRef = useRef<(() => void) | void>(undefined);
  const didMountRef = useRef(false);

  // 保存最新 draw/init 引用，避免 effect 依赖抖动
  const drawRef = useRef(draw);
  const initRef = useRef(init);
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);
  useEffect(() => {
    initRef.current = init;
  }, [init]);

  // init 挂载点（init 变化时重跑）
  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    initCleanupRef.current?.();
    initCleanupRef.current = initRef.current?.(canvas, frame);
    return () => {
      initCleanupRef.current?.();
      initCleanupRef.current = undefined;
    };
  }, [init]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const frame: BackgroundFrame = {
      ctx,
      width: 0,
      height: 0,
      dpr,
      mouse: { x: null, y: null, isDown: false },
      ripples: [],
      keys: { shift: false },
      time: 0,
      delta: 0,
    };
    frameRef.current = frame;

    let isVisible = !document.hidden;
    let isInViewport = true;

    const resize = () => {
      // 用 canvas 自身的 rect，确保 frame 空间与事件坐标空间完全一致
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = Math.max(1, Math.round(rect.width * frame.dpr));
      canvas.height = Math.max(1, Math.round(rect.height * frame.dpr));
      frame.width = rect.width;
      frame.height = rect.height;
      ctx.setTransform(frame.dpr, 0, 0, frame.dpr, 0, 0);
      return true;
    };

    // 首帧用 rAF 延迟 resize，确保 canvas 已布局
    const initAfterLayout = () => {
      if (resize()) {
        initCleanupRef.current = initRef.current?.(canvas, frame);
        return true;
      }
      return false;
    };
    if (!initAfterLayout()) {
      requestAnimationFrame(() => {
        if (initAfterLayout()) return;
        requestAnimationFrame(() => {
          initAfterLayout();
        });
      });
    }

    // ResizeObserver（feedback：防抖 200ms）
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
      }, RESIZE_DEBOUNCE_MS);
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const updatePause = () => {
      pausedRef.current = !(isVisible && isInViewport);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) isInViewport = e.isIntersecting;
        updatePause();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      isVisible = !document.hidden;
      updatePause();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // 鼠标/触摸事件（canvas 局部坐标）
    const useMouse = !!interactions.mouse;
    const useClick = !!interactions.click;
    const useKeys = !!interactions.keys;

    const getCanvasPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      const pos = getCanvasPos(e);
      frame.mouse.x = pos.x;
      frame.mouse.y = pos.y;
    };
    const onPointerDown = (e: PointerEvent) => {
      const pos = getCanvasPos(e);
      frame.mouse.x = pos.x;
      frame.mouse.y = pos.y;
      frame.mouse.isDown = true;
      if (useClick) {
        frame.ripples.push({ x: pos.x, y: pos.y, startTime: frame.time });
      }
    };
    const onPointerUp = () => {
      frame.mouse.isDown = false;
    };
    const onPointerLeave = () => {
      frame.mouse.x = null;
      frame.mouse.y = null;
      frame.mouse.isDown = false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') frame.keys.shift = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') frame.keys.shift = false;
    };

    if (useMouse) {
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);
    }
    if (useClick || useMouse) {
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointerup', onPointerUp);
    }
    if (useKeys) {
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
    }

    // rAF 循环
    startTimeRef.current = performance.now();
    lastFrameRef.current = startTimeRef.current;
    pausedElapsedRef.current = 0;
    let pausedStart: number | null = null;

    const loop = (now: number) => {
      rafIdRef.current = requestAnimationFrame(loop);
      if (pausedRef.current) {
        if (pausedStart === null) pausedStart = now;
        lastFrameRef.current = now;
        return;
      }
      if (pausedStart !== null) {
        pausedElapsedRef.current += now - pausedStart;
        pausedStart = null;
      }
      frame.time = (now - startTimeRef.current - pausedElapsedRef.current) / 1000;
      frame.delta = Math.min((now - lastFrameRef.current) / 1000, 0.1);
      lastFrameRef.current = now;

      // Consume ripples produced since last frame; each frame's component sees one batch.
      const ripplesBatch = frame.ripples;
      frame.ripples = [];
      drawRef.current({ ...frame, ripples: ripplesBatch });
    };
    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      if (resizeTimer) clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (useMouse) {
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
      }
      if (useClick || useMouse) {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointerup', onPointerUp);
      }
      if (useKeys) {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      }
      initCleanupRef.current?.();
      initCleanupRef.current = undefined;
      frameRef.current = null;
    };
    // interactions 视为不可变配置；变化时整体重建
  }, [maxDpr, interactions.mouse, interactions.click, interactions.keys]);

  return { canvasRef };
}
