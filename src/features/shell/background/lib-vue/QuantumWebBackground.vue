<script setup lang="ts">
import { ref } from 'vue';
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';
import { SpatialGrid } from '../lib/spatialGrid';

type Range = [number, number];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  baseColor: string;
  trail: { x: number; y: number }[];
  maxTrail: number;
  isQuantum: boolean;
  phase: number;
  speed: number;
  lastX: number;
  lastY: number;
}

interface Connection {
  p1: Particle;
  p2: Particle;
  distance: number;
  opacity: number;
  strength: number;
}

const QUALITY_MULTIPLIER: Record<BackgroundFrame['performance']['quality'], number> = {
  high: 1,
  medium: 0.68,
  low: 0.4,
};
const BASE_FRAME_RATE = 60;

const randRange = (min: number, max: number) => Math.random() * (max - min) + min;

const props = withDefaults(
  defineProps<{
    quantumColor?: string;
    normalColor?: string;
    backgroundColor?: string;
    labelColor?: string;
    labelBg?: string;
    densityDivisor?: number;
    velocityMultiplier?: number;
    speedRange?: Range;
    phaseNoise?: number;
    velocityDamping?: number;
    quantumRadiusRange?: Range;
    normalRadiusRange?: Range;
    opacityRange?: Range;
    trailMaxRange?: [number, number];
    mouseRadius?: number;
    attractionForceFactor?: number;
    repulsionForceFactor?: number;
    connectionDistance?: number;
    connectionBaseOpacity?: number;
    connectionPulseRate?: number;
    connectionStrengthRange?: Range;
    connectionLineWidth?: number;
    glowMultiplier?: number;
  }>(),
  {
    densityDivisor: 5000,
    velocityMultiplier: 0.5,
    speedRange: [0.01, 0.05],
    phaseNoise: 0.01,
    velocityDamping: 0.98,
    quantumRadiusRange: [1, 3],
    normalRadiusRange: [0.5, 2],
    opacityRange: [0.2, 0.6],
    trailMaxRange: [5, 15],
    mouseRadius: 150,
    attractionForceFactor: 0.01,
    repulsionForceFactor: 0.05,
    connectionDistance: 150,
    connectionBaseOpacity: 0.7,
    connectionPulseRate: 3,
    connectionStrengthRange: [0.01, 0.06],
    connectionLineWidth: 1,
    glowMultiplier: 3,
  }
);

const mode = useColorMode();
const quantumColor = props.quantumColor || (mode.value === 'dark' ? '#7f5af0' : '#3f2d78');
const normalColor = props.normalColor || (mode.value === 'dark' ? '#2cb67d' : '#165b3e');

const particlesRef = ref<Particle[]>([]);
const connectionsRef = ref<Connection[]>([]);
const connectionFrameRef = ref(0);
const lastSizeRef = ref<{ width: number; height: number }>({ width: 0, height: 0 });
const lastQualityRef = ref<BackgroundFrame['performance']['quality'] | null>(null);

function createParticles(width: number, height: number, multiplier: number) {
  const particles: Particle[] = [];
  const particleCount = Math.max(10, Math.floor(((width * height) / props.densityDivisor) * multiplier));
  const maxTrailMultiplier = Math.max(multiplier, 0.2);
  for (let i = 0; i < particleCount; i++) {
    const isQuantum = Math.random() > 0.85;
    const radius = isQuantum
      ? randRange(props.quantumRadiusRange[0], props.quantumRadiusRange[1])
      : randRange(props.normalRadiusRange[0], props.normalRadiusRange[1]);
    const opacity = randRange(props.opacityRange[0], props.opacityRange[1]);
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * props.velocityMultiplier,
      vy: (Math.random() - 0.5) * props.velocityMultiplier,
      radius,
      opacity,
      baseColor: isQuantum ? quantumColor : normalColor,
      trail: [],
      maxTrail: Math.max(1, Math.floor(randRange(props.trailMaxRange[0], props.trailMaxRange[1]) * maxTrailMultiplier)),
      isQuantum,
      phase: Math.random() * Math.PI * 2,
      speed: randRange(props.speedRange[0], props.speedRange[1]),
      lastX: 0,
      lastY: 0,
    });
  }
  return particles;
}

function init(_canvas: HTMLCanvasElement, frame: BackgroundFrame) {
  lastSizeRef.value = { width: frame.width, height: frame.height };
  particlesRef.value = createParticles(frame.width, frame.height, QUALITY_MULTIPLIER[frame.performance.quality]);
  connectionsRef.value = [];
  connectionFrameRef.value = 0;
}

function draw(frame: BackgroundFrame) {
  const { ctx, width, height, mouse, time, keys, delta, performance } = frame;
  const { quality, reducedMotion } = performance;
  const multiplier = QUALITY_MULTIPLIER[quality];
  const motionStep = delta * BASE_FRAME_RATE;
  const motionScale = reducedMotion ? 0.05 : motionStep;
  const scaledMouseRadius = props.mouseRadius * multiplier;
  const scaledAttractionForce = props.attractionForceFactor * multiplier;
  const scaledRepulsionForce = props.repulsionForceFactor * multiplier;
  const scaledConnectionDistance = props.connectionDistance * multiplier;
  const scaledGlowMultiplier = props.glowMultiplier * multiplier;

  if (width !== lastSizeRef.value.width || height !== lastSizeRef.value.height || quality !== lastQualityRef.value) {
    lastSizeRef.value = { width, height };
    lastQualityRef.value = quality;
    particlesRef.value = createParticles(width, height, multiplier);
    connectionsRef.value = [];
    connectionFrameRef.value = 0;
  }

  const particles = particlesRef.value;

  particles.forEach((particle) => {
    if (reducedMotion) {
      particle.phase += particle.speed * motionScale;
      return;
    }

    particle.lastX = particle.x;
    particle.lastY = particle.y;

    particle.trail.push({ x: particle.x, y: particle.y });
    if (particle.trail.length > particle.maxTrail) {
      particle.trail.shift();
    }

    particle.phase += particle.speed * motionStep;
    particle.vx += Math.sin(particle.phase) * props.phaseNoise * motionStep;
    particle.vy += Math.cos(particle.phase) * props.phaseNoise * motionStep;
    particle.vx *= Math.pow(props.velocityDamping, motionStep);
    particle.vy *= Math.pow(props.velocityDamping, motionStep);

    if (mouse.x !== null && mouse.y !== null) {
      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < scaledMouseRadius) {
        const force = (scaledMouseRadius - distance) / scaledMouseRadius;
        const angle = Math.atan2(dy, dx);
        const tx = mouse.x + Math.cos(angle) * scaledMouseRadius;
        const ty = mouse.y + Math.sin(angle) * scaledMouseRadius;
        if (keys.shift) {
          particle.vx += (mouse.x - particle.x) * force * scaledAttractionForce * motionStep;
          particle.vy += (mouse.y - particle.y) * force * scaledAttractionForce * motionStep;
        } else {
          particle.vx += (particle.x - tx) * force * scaledRepulsionForce * motionStep;
          particle.vy += (particle.y - ty) * force * scaledRepulsionForce * motionStep;
        }
      }
    }

    if (particle.x < -particle.radius) particle.x = width + particle.radius;
    if (particle.x > width + particle.radius) particle.x = -particle.radius;
    if (particle.y < -particle.radius) particle.y = height + particle.radius;
    if (particle.y > height + particle.radius) particle.y = -particle.radius;

    particle.x += particle.vx * motionScale;
    particle.y += particle.vy * motionScale;
  });

  connectionFrameRef.value += 1;
  const shouldUpdateConnections =
    connectionFrameRef.value === 1 || quality !== 'low' || connectionFrameRef.value % 3 === 0;
  if (shouldUpdateConnections) {
    const newConnections: Connection[] = [];
    const grid = new SpatialGrid<{ index: number; x: number; y: number }>(scaledConnectionDistance);
    for (let i = 0; i < particles.length; i++) {
      grid.insert(i, particles[i].x, particles[i].y, { index: i, x: particles[i].x, y: particles[i].y });
    }
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      const neighbors = grid.query(p1.x, p1.y, scaledConnectionDistance);
      for (const neighbor of neighbors) {
        if (neighbor.index <= i) continue;
        const p2 = particles[neighbor.index];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < scaledConnectionDistance) {
          const opacity = props.connectionBaseOpacity * multiplier * (1 - distance / scaledConnectionDistance);
          const pulse = reducedMotion ? 1 : Math.sin(time * props.connectionPulseRate) * 0.3 + 0.7;
          newConnections.push({
            p1,
            p2,
            distance,
            opacity: opacity * pulse,
            strength: randRange(props.connectionStrengthRange[0], props.connectionStrengthRange[1]),
          });
        }
      }
    }
    connectionsRef.value = newConnections;
  }

  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    if (particle.trail.length > 1) {
      const velocity = Math.sqrt(Math.pow(particle.x - particle.lastX, 2) + Math.pow(particle.y - particle.lastY, 2));
      const trailIntensity = Math.min(velocity * 20, 1);
      if (trailIntensity > 0.05) {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        for (let i = 1; i < particle.trail.length; i++) {
          ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
        }
        const gradient = ctx.createLinearGradient(particle.trail[0].x, particle.trail[0].y, particle.x, particle.y);
        gradient.addColorStop(0, `${particle.baseColor}00`);
        gradient.addColorStop(
          1,
          `${particle.baseColor}${Math.floor(trailIntensity * 80)
            .toString(16)
            .padStart(2, '0')}`
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = particle.isQuantum ? 1.5 : 1;
        ctx.stroke();
      }
    }
  });

  connectionsRef.value.forEach((connection) => {
    const { p1, p2 } = connection;
    const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    gradient.addColorStop(0, p1.isQuantum ? quantumColor : normalColor);
    gradient.addColorStop(1, p2.isQuantum ? quantumColor : normalColor);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = gradient;
    ctx.globalAlpha = connection.opacity;
    ctx.lineWidth = props.connectionLineWidth;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = particle.baseColor;
    ctx.fill();

    if (particle.isQuantum) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * scaledGlowMultiplier, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius * scaledGlowMultiplier
      );
      gradient.addColorStop(0, `${particle.baseColor}80`);
      gradient.addColorStop(1, `${particle.baseColor}00`);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  });
}
</script>
<template>
  <BackgroundCanvas :draw="draw" :init="init" :interactions="{ mouse: true, keys: true }" />
</template>
