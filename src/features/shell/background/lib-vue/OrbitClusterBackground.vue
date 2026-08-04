<script setup lang="ts">
import { ref } from 'vue';
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';
import { parseColor, buildRgba } from '../lib/colorUtils';

interface Particle {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  opacity: number;
  depth: number;
}

interface Cluster {
  x: number;
  y: number;
  particles: Particle[];
}

interface GravityWarp {
  x: number;
  y: number;
  strength: number;
  active: boolean;
}

const props = withDefaults(
  defineProps<{
    clusterCount?: number;
    particlesPerCluster?: number;
    color?: string;
    className?: string;
    orbitDistanceMin?: number;
    orbitDistanceMax?: number;
    orbitSpeedMin?: number;
    orbitSpeedMax?: number;
    particleSizeMin?: number;
    particleSizeMax?: number;
    parallaxMultiplier?: number;
    gravityWarpStrength?: number;
    gravityWarpDecay?: number;
  }>(),
  {
    clusterCount: 6,
    particlesPerCluster: 25,
    orbitDistanceMin: 20,
    orbitDistanceMax: 80,
    orbitSpeedMin: 0.001,
    orbitSpeedMax: 0.004,
    particleSizeMin: 0.8,
    particleSizeMax: 2.5,
    parallaxMultiplier: 0.001,
    gravityWarpStrength: 20,
    gravityWarpDecay: 0.9,
  }
);

const mode = useColorMode();
const color = props.color || (mode.value === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)');
const parsedColor = parseColor(color);
const clustersRef = ref<Cluster[]>([]);
const gravityWarpRef = ref<GravityWarp | null>(null);
const lastSizeRef = ref<{ width: number; height: number }>({ width: 0, height: 0 });

function generateClusters(width: number, height: number) {
  const clusters: Cluster[] = [];
  for (let i = 0; i < props.clusterCount; i++) {
    const cluster: Cluster = {
      x: Math.random() * width,
      y: Math.random() * height,
      particles: [],
    };
    for (let j = 0; j < props.particlesPerCluster; j++) {
      cluster.particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: props.orbitDistanceMin + Math.random() * (props.orbitDistanceMax - props.orbitDistanceMin),
        speed: props.orbitSpeedMin + Math.random() * (props.orbitSpeedMax - props.orbitSpeedMin),
        size: props.particleSizeMin + Math.random() * (props.particleSizeMax - props.particleSizeMin),
        opacity: 0.4 + Math.random() * 0.6,
        depth: 0.5 + Math.random() * 0.5,
      });
    }
    clusters.push(cluster);
  }
  return clusters;
}

function draw(frame: BackgroundFrame) {
  const { ctx, width, height, mouse } = frame;

  if (width !== lastSizeRef.value.width || height !== lastSizeRef.value.height) {
    lastSizeRef.value = { width, height };
    clustersRef.value = generateClusters(width, height);
  }

  for (const r of frame.ripples) {
    gravityWarpRef.value = {
      x: r.x,
      y: r.y,
      strength: props.gravityWarpStrength,
      active: true,
    };
  }

  ctx.clearRect(0, 0, width, height);

  const mouseX = mouse.x ?? width / 2;
  const mouseY = mouse.y ?? height / 2;

  const quality = frame.performance.quality;
  const visibleClusters =
    quality === 'low'
      ? clustersRef.value.slice(0, Math.max(2, Math.floor(clustersRef.value.length * 0.4)))
      : clustersRef.value;
  visibleClusters.forEach((cluster) => {
    cluster.particles.forEach((p) => {
      p.angle += p.speed;

      let dX = Math.cos(p.angle) * p.distance;
      let dY = Math.sin(p.angle) * p.distance;

      if (gravityWarpRef.value?.active) {
        const dx = gravityWarpRef.value.x - cluster.x;
        const dy = gravityWarpRef.value.y - cluster.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const gravity = Math.min(gravityWarpRef.value.strength / (dist + 20), 5);
        dX += dx * gravity * 0.02;
        dY += dy * gravity * 0.02;
      }

      const offsetX = (mouseX - width / 2) * props.parallaxMultiplier * p.depth;
      const offsetY = (mouseY - height / 2) * props.parallaxMultiplier * p.depth;

      const x = cluster.x + dX + offsetX * 100;
      const y = cluster.y + dY + offsetY * 100;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = buildRgba(parsedColor.r, parsedColor.g, parsedColor.b, p.opacity);
      ctx.fill();
    });
  });

  if (gravityWarpRef.value?.active) {
    gravityWarpRef.value.strength *= props.gravityWarpDecay;
    if (gravityWarpRef.value.strength < 0.05) {
      gravityWarpRef.value.active = false;
    }
  }
}

function init(_canvas: HTMLCanvasElement, frame: BackgroundFrame) {
  lastSizeRef.value = { width: frame.width, height: frame.height };
  clustersRef.value = generateClusters(frame.width, frame.height);
}
</script>
<template>
  <BackgroundCanvas
    :draw="draw"
    :init="init"
    :interactions="{ mouse: true, click: true }"
    :class-name="props.className"
  />
</template>
