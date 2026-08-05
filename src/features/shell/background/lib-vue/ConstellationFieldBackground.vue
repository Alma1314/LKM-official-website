<script setup lang="ts">
import { ref } from 'vue';
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';
import { parseColor, colorToString } from '../lib/colorUtils';
import { SpatialGrid } from '../lib/spatialGrid';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulse: number;
  trail: { x: number; y: number }[];
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
}

interface ConstellationName {
  x: number;
  y: number;
  name: string;
  opacity: number;
}

const NAMES = ['理科迷'];

const props = withDefaults(
  defineProps<{
    particleColor?: string;
    connectionColor?: string;
    particleCount?: number;
    maxDistance?: number;
    className?: string;
    constfill?: string;
    particleSpeed?: number;
    particleRadiusMin?: number;
    particleRadiusMax?: number;
    pulseMin?: number;
    pulseMax?: number;
    shootingStarChance?: number;
    shootingStarSpeedMin?: number;
    shootingStarSpeedMax?: number;
    shootingStarLengthMin?: number;
    shootingStarLengthMax?: number;
    shootingStarLineWidth?: number;
    shootingStarLifeDecay?: number;
    nameSpawnRate?: number;
    nameFadeRate?: number;
    trailMaxLength?: number;
    connectionLineWidth?: number;
  }>(),
  {
    particleCount: 120,
    maxDistance: 120,
    constfill: 'white',
    particleSpeed: 0.6,
    particleRadiusMin: 0.5,
    particleRadiusMax: 1.7,
    pulseMin: 0.5,
    pulseMax: 2.0,
    shootingStarChance: 0.01,
    shootingStarSpeedMin: 2,
    shootingStarSpeedMax: 6,
    shootingStarLengthMin: 40,
    shootingStarLengthMax: 100,
    shootingStarLineWidth: 2,
    shootingStarLifeDecay: 0.01,
    nameSpawnRate: 0.002,
    nameFadeRate: 0.003,
    trailMaxLength: 20,
    connectionLineWidth: 1,
  }
);

const mode = useColorMode();
const particleColor = props.particleColor || (mode.value === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)');
const connectionColor = props.connectionColor || (mode.value === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)');

const parsedParticleColor = parseColor(particleColor);
const parsedConnectionColor = parseColor(connectionColor);

const particlesRef = ref<Particle[]>([]);
const shootingStarsRef = ref<ShootingStar[]>([]);
const constellationNamesRef = ref<ConstellationName[]>([]);
const lastSizeRef = ref<{ width: number; height: number }>({ width: 0, height: 0 });

function createParticles(width: number, height: number) {
  const particles: Particle[] = [];
  for (let i = 0; i < props.particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * props.particleSpeed,
      vy: (Math.random() - 0.5) * props.particleSpeed,
      radius: Math.random() * (props.particleRadiusMax - props.particleRadiusMin) + props.particleRadiusMin,
      pulse: Math.random() * (props.pulseMax - props.pulseMin) + props.pulseMin,
      trail: [],
    });
  }
  return particles;
}

function init(_canvas: HTMLCanvasElement, frame: BackgroundFrame) {
  lastSizeRef.value = { width: frame.width, height: frame.height };
  particlesRef.value = createParticles(frame.width, frame.height);
}

function draw(frame: BackgroundFrame) {
  const { ctx, width, height, mouse, time } = frame;

  if (width !== lastSizeRef.value.width || height !== lastSizeRef.value.height) {
    lastSizeRef.value = { width, height };
    particlesRef.value = createParticles(width, height);
    shootingStarsRef.value = [];
    constellationNamesRef.value = [];
  }

  particlesRef.value.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    if (mouse.x !== null && mouse.y !== null) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * 0.1;
        p.vy += Math.sin(angle) * 0.1;
      }
    }

    if (mouse.isDown) {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > props.trailMaxLength) p.trail.shift();
    } else {
      p.trail = [];
    }
  });

  if (Math.random() < props.shootingStarChance) {
    shootingStarsRef.value.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.5,
      vx: -Math.random() * (props.shootingStarSpeedMax - props.shootingStarSpeedMin) - props.shootingStarSpeedMin,
      vy: Math.random() * (props.shootingStarSpeedMax - props.shootingStarSpeedMin) - props.shootingStarSpeedMin,
      length: Math.random() * (props.shootingStarLengthMax - props.shootingStarLengthMin) + props.shootingStarLengthMin,
      life: 1,
    });
  }
  shootingStarsRef.value = shootingStarsRef.value.filter((s) => s.life > 0);
  shootingStarsRef.value.forEach((s) => {
    s.x += s.vx;
    s.y += s.vy;
    s.life -= props.shootingStarLifeDecay;
  });

  if (Math.random() < props.nameSpawnRate) {
    constellationNamesRef.value.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.8 + 50,
      name: NAMES[Math.floor(Math.random() * NAMES.length)],
      opacity: 1,
    });
  }
  constellationNamesRef.value = constellationNamesRef.value.filter((n) => n.opacity > 0);
  constellationNamesRef.value.forEach((n) => {
    n.opacity -= props.nameFadeRate;
  });

  ctx.clearRect(0, 0, width, height);

  particlesRef.value.forEach((p) => {
    const pulseRadius = p.radius + Math.sin(time * 2 + p.pulse) * 0.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = particleColor;
    ctx.fill();

    if (p.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let i = 1; i < p.trail.length; i++) {
        ctx.lineTo(p.trail[i].x, p.trail[i].y);
      }
      ctx.strokeStyle = colorToString(parsedParticleColor, 0.1);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  const grid = new SpatialGrid<{ index: number; x: number; y: number }>(props.maxDistance);
  const pts = particlesRef.value;
  for (let i = 0; i < pts.length; i++) {
    grid.insert(i, pts[i].x, pts[i].y, { index: i, x: pts[i].x, y: pts[i].y });
  }
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const neighbors = grid.query(p1.x, p1.y, props.maxDistance);
    for (const neighbor of neighbors) {
      if (neighbor.index <= i) continue;
      const p2 = pts[neighbor.index];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < props.maxDistance) {
        const opacity = (props.maxDistance - distance) / props.maxDistance;
        ctx.strokeStyle = colorToString(parsedConnectionColor, opacity * parsedConnectionColor.a);
        ctx.lineWidth = props.connectionLineWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }

  shootingStarsRef.value.forEach((s) => {
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + s.length, s.y + s.length * 0.2);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = props.shootingStarLineWidth;
    ctx.stroke();
  });

  ctx.font = '19px Space Grotesk';
  ctx.textAlign = 'center';
  ctx.fillStyle = props.constfill;
  constellationNamesRef.value.forEach((n) => {
    ctx.globalAlpha = n.opacity;
    ctx.fillText(n.name, n.x, n.y);
  });
  ctx.globalAlpha = 1;
}
</script>
<template>
  <BackgroundCanvas :draw="draw" :init="init" :interactions="{ mouse: true }" :class-name="props.className" />
</template>
