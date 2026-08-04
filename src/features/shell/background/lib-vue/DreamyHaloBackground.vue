<script setup lang="ts">
import { ref } from 'vue';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';

interface Halo {
  x: number;
  y: number;
  r: number;
  phase: number;
}

const props = withDefaults(
  defineProps<{
    baseHue?: number;
    className?: string;
    blurOverlay?: boolean;
    overlayOpacity?: number;
    haloCount?: number;
    haloRadiusMin?: number;
    haloRadiusMax?: number;
    pulseAmplitude?: number;
    saturation?: number;
    lightness?: number;
  }>(),
  {
    baseHue: 280,
    blurOverlay: true,
    overlayOpacity: 0.3,
    haloCount: 20,
    haloRadiusMin: 50,
    haloRadiusMax: 150,
    pulseAmplitude: 20,
    saturation: 100,
    lightness: 85,
  }
);

const halosRef = ref<Halo[]>([]);

function init(_canvas: HTMLCanvasElement, frame: BackgroundFrame) {
  const halos: Halo[] = [];
  for (let i = 0; i < props.haloCount; i++) {
    halos.push({
      x: Math.random() * frame.width,
      y: Math.random() * frame.height,
      r: Math.random() * (props.haloRadiusMax - props.haloRadiusMin) + props.haloRadiusMin,
      phase: Math.random() * Math.PI * 2,
    });
  }
  halosRef.value = halos;
  return () => {
    halosRef.value = [];
  };
}

function draw(frame: BackgroundFrame) {
  const { ctx, width, height, time } = frame;
  const quality = frame.performance.quality;
  ctx.clearRect(0, 0, width, height);
  const visibleHalos =
    quality === 'low' ? halosRef.value.slice(0, Math.max(3, Math.floor(halosRef.value.length * 0.3))) : halosRef.value;
  visibleHalos.forEach((halo, index) => {
    const pulse = Math.sin(time + halo.phase) * props.pulseAmplitude;
    const gradient = ctx.createRadialGradient(halo.x, halo.y, 0, halo.x, halo.y, halo.r + pulse);
    const hueShift = (props.baseHue + index * 10 + time * 10) % 360;
    gradient.addColorStop(0, `hsla(${hueShift}, ${props.saturation}%, ${props.lightness}%, 0.25)`);
    gradient.addColorStop(1, `hsla(${hueShift}, ${props.saturation}%, ${props.lightness}%, 0)`);
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(halo.x, halo.y, halo.r + pulse, 0, Math.PI * 2);
    ctx.fill();
  });
}
</script>
<template>
  <BackgroundCanvas :draw="draw" :init="init" :class-name="props.className">
    <div
      v-if="props.blurOverlay"
      class="absolute inset-0 backdrop-blur-md pointer-events-none"
      :style="{ zIndex: 1, backgroundColor: `rgba(255,255,255,${props.overlayOpacity})` }"
    />
  </BackgroundCanvas>
</template>
