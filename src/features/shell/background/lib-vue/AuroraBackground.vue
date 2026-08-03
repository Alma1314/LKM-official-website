<script setup lang="ts">
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';

const props = withDefaults(defineProps<{
  mouseRadius?: number;
  rippleColor?: string;
  className?: string;
  layers?: number;
  baseWaveHeight?: number;
  waveSpacing?: number;
  waveSpeed?: number;
  lineWidthBase?: number;
  rippleMaxRadius?: number;
  rippleGrowthRate?: number;
  rippleLineWidth?: number;
}>(), {
  mouseRadius: 150, baseWaveHeight: 30, waveSpacing: 10, lineWidthBase: 2,
  rippleMaxRadius: 120, rippleGrowthRate: 3, rippleLineWidth: 2,
});

const mode = useColorMode();

const AURORA_THEME = {
  dark: { layers: 5, colors: ['#6366f1', '#818cf8', '#22d3ee'], alpha: [0.28, 0.2, 0.13], waveSpeed: 0.16, mouseStrength: 20 },
  light: { layers: 3, colors: ['#6366f1', '#06b6d4', '#67e8f9'], alpha: [0.16, 0.11, 0.07], waveSpeed: 0.11, mouseStrength: 10 },
} as const;

interface LocalRipple { x: number; y: number; radius: number; opacity: number; growing: boolean; }
const MAX_RIPPLES = 12;
const ripples: LocalRipple[] = [];

function draw(frame: BackgroundFrame) {
  const { ctx, width, height, mouse, time, delta, performance } = frame;
  const { quality, reducedMotion } = performance;
  const qualityScale = quality === 'high' ? 1 : quality === 'medium' ? 0.75 : 0.5;
  const visibleLayers = Math.max(1, Math.round((props.layers ?? AURORA_THEME[mode.value].layers) * qualityScale));
  const sampleStep = quality === 'low' ? 18 : quality === 'medium' ? 14 : 10;
  const motionScale = reducedMotion ? 0.02 : quality === 'low' ? 0.15 : 1;
  const mouseStrength = AURORA_THEME[mode.value].mouseStrength * qualityScale;
  const rippleOpacity = (mode.value === 'light' ? 0.45 : 0.8) * (quality === 'low' ? 0.5 : 1);
  const waveSpeed = (props.waveSpeed ?? AURORA_THEME[mode.value].waveSpeed) * motionScale;
  const rippleColor = props.rippleColor ?? (mode.value === 'dark' ? '#818cf8' : '#a5f3fc');

  if (quality !== 'low') {
    for (const ripple of frame.ripples) {
      ripples.push({ x: ripple.x, y: ripple.y, radius: 0, opacity: 1, growing: true });
    }
    if (ripples.length > MAX_RIPPLES) ripples.splice(0, ripples.length - MAX_RIPPLES);
  }

  ctx.clearRect(0, 0, width, height);
  for (let layer = 0; layer < visibleLayers; layer++) {
    ctx.beginPath();
    const waveHeight = props.baseWaveHeight! + layer * props.waveSpacing!;
    const waveOffset = time * waveSpeed + layer * 50;
    ctx.strokeStyle = AURORA_THEME[mode.value].colors[layer % AURORA_THEME[mode.value].colors.length];
    ctx.globalAlpha = AURORA_THEME[mode.value].alpha[layer % AURORA_THEME[mode.value].alpha.length];
    ctx.lineWidth = props.lineWidthBase! + layer * 1.5;
    for (let x = 0; x <= width; x += sampleStep) {
      const y = height / 2 + Math.sin(x * 0.01 + waveOffset) * waveHeight + (Math.sin(x * 0.02 + waveOffset * 1.3) * waveHeight) / 2;
      let finalY = y;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - x, dy = mouse.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const distort = dist < props.mouseRadius! ? ((props.mouseRadius! - dist) / props.mouseRadius!) * mouseStrength : 0;
        finalY = y - distort;
      }
      ctx.lineTo(x, finalY);
    }
    ctx.stroke();
  }

  if (quality !== 'low') {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]!;
      if (r.growing) {
        r.radius += props.rippleGrowthRate! * delta * 60 * qualityScale;
        r.opacity = 1 - r.radius / props.rippleMaxRadius!;
        if (r.radius >= props.rippleMaxRadius!) r.growing = false;
      } else { ripples.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rippleColor;
      ctx.globalAlpha = r.opacity * rippleOpacity;
      ctx.lineWidth = props.rippleLineWidth!;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
</script>

<template>
  <BackgroundCanvas :draw="draw" :interactions="{ mouse: true, click: true }" :class-name="props.className" />
</template>
