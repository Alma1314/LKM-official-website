<script setup lang="ts">
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';

const props = withDefaults(defineProps<{
  mouseRadius?: number; rippleColor?: string; className?: string; layers?: number;
  baseWaveHeight?: number; waveSpacing?: number; waveSpeed?: number; lineWidthBase?: number;
  rippleMaxRadius?: number; rippleGrowthRate?: number; rippleLineWidth?: number;
}>(), { mouseRadius: 150, baseWaveHeight: 30, waveSpacing: 10, lineWidthBase: 2, rippleMaxRadius: 120, rippleGrowthRate: 3, rippleLineWidth: 2 });

const mode = useColorMode();
const AURORA = {
  dark: { layers: 5, colors: ['#6366f1', '#818cf8', '#22d3ee'], alpha: [0.28, 0.2, 0.13], waveSpeed: 0.16, mouseStrength: 20 },
  light: { layers: 3, colors: ['#6366f1', '#06b6d4', '#67e8f9'], alpha: [0.16, 0.11, 0.07], waveSpeed: 0.11, mouseStrength: 10 },
} as const;

interface LRipple { x: number; y: number; radius: number; opacity: number; growing: boolean }
const ripples: LRipple[] = []; const MAX = 12;

function draw(frame: BackgroundFrame) {
  const { ctx, width, height, mouse, time, delta, performance } = frame;
  const { quality, reducedMotion } = performance;
  const qs = quality === 'high' ? 1 : quality === 'medium' ? 0.75 : 0.5;
  const theme = AURORA[mode.value];
  const vl = Math.max(1, Math.round((props.layers ?? theme.layers) * qs));
  const ss = quality === 'low' ? 18 : quality === 'medium' ? 14 : 10;
  const ms = reducedMotion ? 0.02 : quality === 'low' ? 0.15 : 1;
  const mstr = theme.mouseStrength * qs;
  const ro = (mode.value === 'light' ? 0.45 : 0.8) * (quality === 'low' ? 0.5 : 1);
  const ws = (props.waveSpeed ?? theme.waveSpeed) * ms;
  const rc = props.rippleColor ?? (mode.value === 'dark' ? '#818cf8' : '#a5f3fc');
  if (quality !== 'low') { for (const r of frame.ripples) ripples.push({ x: r.x, y: r.y, radius: 0, opacity: 1, growing: true }); if (ripples.length > MAX) ripples.splice(0, ripples.length - MAX); }
  ctx.clearRect(0, 0, width, height);
  for (let l = 0; l < vl; l++) {
    ctx.beginPath(); const wh = props.baseWaveHeight! + l * props.waveSpacing!; const wo = time * ws + l * 50;
    ctx.strokeStyle = theme.colors[l % theme.colors.length]; ctx.globalAlpha = theme.alpha[l % theme.alpha.length]; ctx.lineWidth = props.lineWidthBase! + l * 1.5;
    for (let x = 0; x <= width; x += ss) {
      const y = height / 2 + Math.sin(x * 0.01 + wo) * wh + (Math.sin(x * 0.02 + wo * 1.3) * wh) / 2;
      let fy = y;
      if (mouse.x !== null && mouse.y !== null) { const dx = mouse.x - x, dy = mouse.y - y; const dist = Math.sqrt(dx * dx + dy * dy); fy = y - (dist < props.mouseRadius! ? ((props.mouseRadius! - dist) / props.mouseRadius!) * mstr : 0); }
      ctx.lineTo(x, fy);
    }
    ctx.stroke();
  }
  if (quality !== 'low') {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]!; if (r.growing) { r.radius += props.rippleGrowthRate! * delta * 60 * qs; r.opacity = 1 - r.radius / props.rippleMaxRadius!; if (r.radius >= props.rippleMaxRadius!) r.growing = false; } else { ripples.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2); ctx.strokeStyle = rc; ctx.globalAlpha = r.opacity * ro; ctx.lineWidth = props.rippleLineWidth!; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
</script>
<template><BackgroundCanvas :draw="draw" :interactions="{ mouse: true, click: true }" :class-name="props.className" /></template>
