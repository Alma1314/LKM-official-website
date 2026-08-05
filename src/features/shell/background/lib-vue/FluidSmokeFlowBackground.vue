<script setup lang="ts">
import { ref } from 'vue';
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';

const props = withDefaults(
  defineProps<{
    particleColor?: string;
    lineWidth?: number;
    className?: string;
    particleCount?: number;
    interactionRadius?: number;
    interactionStrength?: number;
    backgroundFadeAlpha?: number;
  }>(),
  {
    lineWidth: 1,
    particleCount: 300,
    interactionRadius: 100,
    interactionStrength: 0.3,
    backgroundFadeAlpha: 0.08,
  }
);

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const QUALITY_MULTIPLIER: Record<BackgroundFrame['performance']['quality'], number> = {
  high: 1,
  medium: 0.68,
  low: 0.4,
};
const BASE_FRAME_RATE = 60;

const mode = useColorMode();
const particleColor = props.particleColor || (mode.value === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)');

const particlesRef = ref<Particle[]>([]);
const lastQualityRef = ref<BackgroundFrame['performance']['quality'] | null>(null);

function createParticles(width: number, height: number, quality: BackgroundFrame['performance']['quality']) {
  const count = Math.floor(props.particleCount * QUALITY_MULTIPLIER[quality]);
  particlesRef.value = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
  }));
  lastQualityRef.value = quality;
}

function init(_canvas: HTMLCanvasElement, frame: BackgroundFrame) {
  createParticles(frame.width, frame.height, frame.performance.quality);
  return () => {
    particlesRef.value = [];
  };
}

function draw(frame: BackgroundFrame) {
  const { ctx, width, height, mouse, delta, performance } = frame;
  const { quality } = performance;
  if (quality === 'low' && performance.reducedMotion) return;
  const multiplier = QUALITY_MULTIPLIER[quality];
  if (performance.quality !== lastQualityRef.value) {
    createParticles(width, height, performance.quality);
  }
  const motionStep = delta * BASE_FRAME_RATE;
  const motionScale = performance.reducedMotion ? 0.05 : motionStep;
  const scaledInteractionRadius = props.interactionRadius * multiplier;
  const scaledInteractionStrength = props.interactionStrength * multiplier;
  const cleanupAlpha = Math.min(1, props.backgroundFadeAlpha / multiplier);
  ctx.fillStyle = `rgba(0, 0, 0, ${cleanupAlpha})`;
  ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = props.lineWidth;
  ctx.strokeStyle = particleColor;

  particlesRef.value.forEach((p) => {
    if (!performance.reducedMotion && mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < scaledInteractionRadius) {
        const force = (scaledInteractionRadius - dist) / scaledInteractionRadius;
        const angle = Math.atan2(dy, dx);
        const effectiveStrength = quality === 'low' ? scaledInteractionStrength * 0.5 : scaledInteractionStrength;
        p.vx -= Math.cos(angle) * force * effectiveStrength * motionStep;
        p.vy -= Math.sin(angle) * force * effectiveStrength * motionStep;
      }
    }

    p.vx *= Math.pow(0.96, motionStep);
    p.vy *= Math.pow(0.96, motionStep);

    const prevX = p.x;
    const prevY = p.y;
    p.x += p.vx * motionScale;
    p.y += p.vy * motionScale;

    if (p.x < 0) p.x = width;
    if (p.y < 0) p.y = height;
    if (p.x > width) p.x = 0;
    if (p.y > height) p.y = 0;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
}
</script>
<template>
  <BackgroundCanvas :draw="draw" :init="init" :interactions="{ mouse: true }" :class-name="props.className" />
</template>
