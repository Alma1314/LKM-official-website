import { ref, onMounted, onBeforeUnmount } from 'vue';

export interface Ripple { x: number; y: number; startTime: number; }

export interface BackgroundMouse { x: number | null; y: number | null; isDown: boolean; }

export type BackgroundQuality = 'high' | 'medium' | 'low';

export interface BackgroundPerformance { quality: BackgroundQuality; dpr: number; frameInterval: number; reducedMotion: boolean; }

export function getBackgroundPerformance(maxDpr = Number.POSITIVE_INFINITY): BackgroundPerformance {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { quality: 'medium', dpr: Math.min(1.25, maxDpr), frameInterval: 1000 / 45, reducedMotion: false };
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0;
  const cores = navigator.hardwareConcurrency;
  const quality: BackgroundQuality = reducedMotion || isMobile ? 'low' : !Number.isFinite(cores) || cores <= 0 || cores <= 4 ? 'medium' : 'high';
  const settings = { high: { dpr: 1.5, frameInterval: 1000 / 60 }, medium: { dpr: 1.25, frameInterval: 1000 / 45 }, low: { dpr: 1, frameInterval: isMobile ? 1000 / 20 : 1000 / 30 } }[quality];
  return { quality, dpr: Math.min(window.devicePixelRatio || 1, quality === 'low' && isMobile ? 1 : settings.dpr, maxDpr), frameInterval: settings.frameInterval, reducedMotion };
}

export interface BackgroundFrame {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
  performance: BackgroundPerformance;
  mouse: BackgroundMouse;
  ripples: Ripple[];
  keys: { shift: boolean };
  time: number;
  delta: number;
  sinceLastResize: number;
}

export interface BackgroundInteractions { mouse?: boolean; click?: boolean; keys?: boolean; }

export interface UseBackgroundCanvasOptions {
  draw: (frame: BackgroundFrame) => void;
  init?: (canvas: HTMLCanvasElement, frame: BackgroundFrame) => void | (() => void);
  interactions?: BackgroundInteractions;
  maxDpr?: number;
}

const DEFAULT_MAX_DPR = 1.5;

export function useBackgroundCanvas({ draw, init, interactions = {}, maxDpr = DEFAULT_MAX_DPR }: UseBackgroundCanvasOptions) {
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  let frameRef: BackgroundFrame | null = null;
  let rafId: number | null = null;
  let startTime = 0;
  let pausedElapsed = 0;
  let lastActualDrawTime = 0;
  let lastDrawTime = 0;
  let paused = false;
  let initCleanup: (() => void) | void = undefined;
  let drawFn = draw;
  let initFn = init;
  let cleanup: (() => void) | null = null;

  function updateDrawAndInit() { drawFn = draw; initFn = init; }

  function setup() {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    updateDrawAndInit();

    const bgPerf = getBackgroundPerformance(maxDpr);
    let sinceLastResize = 0;

    const frame: BackgroundFrame = {
      ctx, width: 0, height: 0, dpr: bgPerf.dpr, performance: bgPerf,
      mouse: { x: null, y: null, isDown: false }, ripples: [], keys: { shift: false }, time: 0, delta: 0, sinceLastResize: 0,
    };
    frameRef = frame;

    let isVisible = !document.hidden;
    let isInViewport = true;
    let pausedStart: number | null = null;

    startTime = performance.now();
    lastActualDrawTime = startTime;
    pausedElapsed = 0;
    paused = false;

    const resize = () => {
      sinceLastResize = 0;
      const w = window.innerWidth, h = window.innerHeight;
      frame.performance = getBackgroundPerformance(maxDpr);
      frame.dpr = frame.performance.dpr;
      canvas.width = Math.max(1, Math.round(w * frame.dpr));
      canvas.height = Math.max(1, Math.round(h * frame.dpr));
      frame.width = w; frame.height = h;
      ctx.setTransform(frame.dpr, 0, 0, frame.dpr, 0, 0);
    };
    resize();

    initCleanup = initFn?.(canvas, frame);

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onReducedMotionChange = () => {
      const wasReduced = frame.performance.reducedMotion;
      resize();
      const now = performance.now();
      lastActualDrawTime = now;
      lastDrawTime = now - frame.performance.frameInterval;
      if (!wasReduced && frame.performance.reducedMotion) frame.ripples = [];
    };
    reducedQuery.addEventListener('change', onReducedMotionChange);

    const updatePause = () => {
      const shouldPause = !(isVisible && isInViewport);
      if (shouldPause === paused) return;
      const now = performance.now();
      paused = shouldPause;
      if (shouldPause) pausedStart = now;
      else if (pausedStart !== null) { pausedElapsed += now - pausedStart; pausedStart = null; }
      lastActualDrawTime = now;
    };
    updatePause();

    const io = new IntersectionObserver((entries) => { for (const e of entries) isInViewport = e.isIntersecting; updatePause(); }, { threshold: 0 });
    io.observe(canvas);
    const onVisibility = () => { isVisible = !document.hidden; updatePause(); };
    document.addEventListener('visibilitychange', onVisibility);

    const useMouse = !!interactions.mouse;
    const useClick = !!interactions.click;
    const useKeys = !!interactions.keys;

    const getCanvasPos = (e: PointerEvent) => ({ x: e.clientX, y: e.clientY });

    const onPointerMove = (e: PointerEvent) => { const pos = getCanvasPos(e); frame.mouse.x = pos.x; frame.mouse.y = pos.y; };
    const onPointerDown = (e: PointerEvent) => {
      const pos = getCanvasPos(e); frame.mouse.x = pos.x; frame.mouse.y = pos.y; frame.mouse.isDown = true;
      if (useClick && !frame.performance.reducedMotion) { frame.ripples.push({ x: pos.x, y: pos.y, startTime: frame.time }); }
    };
    const onPointerUp = () => { frame.mouse.isDown = false; };
    const onPointerLeave = () => { frame.mouse.x = null; frame.mouse.y = null; frame.mouse.isDown = false; };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') frame.keys.shift = true; };
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') frame.keys.shift = false; };

    if (useMouse) { canvas.addEventListener('pointermove', onPointerMove); canvas.addEventListener('pointerleave', onPointerLeave); }
    if (useClick || useMouse) { canvas.addEventListener('pointerdown', onPointerDown); canvas.addEventListener('pointerup', onPointerUp); }
    if (useKeys) { window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); }

    lastDrawTime = performance.now() - frame.performance.frameInterval;
    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      if (paused) { lastActualDrawTime = now; lastDrawTime = now - frame.performance.frameInterval; return; }
      const interval = frame.performance.reducedMotion ? Math.max(frame.performance.frameInterval, 1000) : frame.performance.frameInterval;
      const elapsedSinceDraw = now - lastDrawTime;
      if (elapsedSinceDraw + 0.1 < interval) return;
      const intervalsElapsed = Math.max(1, Math.floor(elapsedSinceDraw / interval));
      lastDrawTime += intervalsElapsed * interval;
      if (now - lastDrawTime > interval) lastDrawTime = now;
      if (sinceLastResize < 3) sinceLastResize++;
      frame.sinceLastResize = sinceLastResize;
      frame.time = (now - startTime - pausedElapsed) / 1000;
      frame.delta = Math.min((now - lastActualDrawTime) / 1000, 0.1);
      const ripplesBatch = frame.ripples;
      frame.ripples = [];
      drawFn({ ...frame, ripples: ripplesBatch });
      lastActualDrawTime = now;
    };
    rafId = requestAnimationFrame(loop);

    const onContextLost = (e: Event) => { e.preventDefault(); if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } };
    const onContextRestored = () => { resize(); rafId = requestAnimationFrame(loop); };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    cleanup = () => {
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      reducedQuery.removeEventListener('change', onReducedMotionChange);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (useMouse) { canvas.removeEventListener('pointermove', onPointerMove); canvas.removeEventListener('pointerleave', onPointerLeave); }
      if (useClick || useMouse) { canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointerup', onPointerUp); }
      if (useKeys) { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); }
      initCleanup?.();
      initCleanup = undefined;
      frameRef = null;
    };
  }

  onMounted(() => { setup(); });
  onBeforeUnmount(() => { cleanup?.(); });

  return { canvasRef };
}
