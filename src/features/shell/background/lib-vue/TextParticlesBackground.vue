<script setup lang="ts">
import { ref } from 'vue';
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';
import { parseColor, buildRgba } from '../lib/colorUtils';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

const props = withDefaults(
  defineProps<{
    text?: string;
    fontSize?: number;
    density?: number;
    color?: string;
    className?: string;
  }>(),
  {
    text: '理科迷',
    fontSize: 120,
    density: 4,
  }
);

const mode = useColorMode();
const color = props.color || (mode.value === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)');
const parsedColor = parseColor(color);
const particlesRef = ref<Particle[]>([]);
const lastSizeRef = ref<{ width: number; height: number }>({ width: 0, height: 0 });

function createTextParticles(width: number, height: number, effectiveDensity = props.density) {
  const dpr = window.devicePixelRatio || 1;
  const pw = Math.round(width * dpr);
  const ph = Math.round(height * dpr);
  const offscreen = document.createElement('canvas');
  offscreen.width = pw;
  offscreen.height = ph;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return [];

  offCtx.scale(dpr, dpr);
  offCtx.font = `bold ${props.fontSize}px "Noto Sans SC", sans-serif`;
  offCtx.textAlign = 'center';
  offCtx.textBaseline = 'middle';
  offCtx.fillStyle = '#ffffff';
  offCtx.fillText(props.text, width / 2, height / 2);
  const imageData = offCtx.getImageData(0, 0, pw, ph);
  const data = imageData.data;

  const particles: Particle[] = [];
  for (let y = 0; y < height; y += effectiveDensity) {
    for (let x = 0; x < width; x += effectiveDensity) {
      const px = Math.round(x * dpr);
      const py = Math.round(y * dpr);
      const index = (py * pw + px) * 4;
      const alpha = data[index + 3];
      if (alpha > 128) {
        particles.push({
          x: x + Math.random() * 10 - 5,
          y: y + Math.random() * 10 - 5,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          size: 1.5,
          opacity: 1,
        });
      }
    }
  }

  const bgParticleCount = 200;
  for (let i = 0; i < bgParticleCount; i++) {
    const px = Math.random() * width;
    const py = Math.random() * height;
    const tooClose = particles.some((p) => Math.hypot(p.baseX - px, p.baseY - py) < 15);
    if (!tooClose) {
      particles.push({
        x: px,
        y: py,
        baseX: px,
        baseY: py,
        vx: 0,
        vy: 0,
        size: 1 + Math.random() * 1.5,
        opacity: 0.4 + Math.random() * 0.3,
      });
    }
  }

  return particles;
}

function draw(frame: BackgroundFrame) {
  const { ctx, width, height, mouse } = frame;

  const { quality } = frame.performance;
  if (width !== lastSizeRef.value.width || height !== lastSizeRef.value.height) {
    lastSizeRef.value = { width, height };
    const effectiveDensity = quality === 'low' ? props.density * 2.5 : props.density;
    particlesRef.value = createTextParticles(width, height, effectiveDensity);
  }

  ctx.clearRect(0, 0, width, height);

  particlesRef.value.forEach((p) => {
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = 80 / dist;
      if (dist < 80) {
        const angle = Math.atan2(dy, dx);
        p.vx -= Math.cos(angle) * force * 0.5;
        p.vy -= Math.sin(angle) * force * 0.5;
      }
    }

    const dxBase = p.baseX - p.x;
    const dyBase = p.baseY - p.y;
    p.vx += dxBase * 0.01;
    p.vy += dyBase * 0.01;
    p.vx *= 0.9;
    p.vy *= 0.9;
    p.x += p.vx;
    p.y += p.vy;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = buildRgba(parsedColor.r, parsedColor.g, parsedColor.b, p.opacity);
    ctx.fill();
  });
}

function init(_canvas: HTMLCanvasElement, frame: BackgroundFrame) {
  lastSizeRef.value = { width: frame.width, height: frame.height };
  particlesRef.value = createTextParticles(frame.width, frame.height);
}
</script>
<template>
  <BackgroundCanvas :draw="draw" :init="init" :interactions="{ mouse: true }" :class-name="props.className" />
</template>
