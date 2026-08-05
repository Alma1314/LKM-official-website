<script setup lang="ts">
import { ref } from 'vue';
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';
import { parseColor, buildRgba, type ParsedColor } from '../lib/colorUtils';
import { SpatialGrid } from '../lib/spatialGrid';

const props = withDefaults(
  defineProps<{
    particleCount?: number | null;
    mouseRadius?: number;
    particleColor?: string;
    connectionColor?: string;
    rippleColor?: string;
    className?: string;
    particleSizeMin?: number;
    particleSizeMax?: number;
    particleSpeedMultiplier?: number;
    connectionDistance?: number;
    connectionOpacityMultiplier?: number;
    rippleMaxRadius?: number;
    rippleGrowthRate?: number;
    rippleLineWidth?: number;
  }>(),
  {
    particleCount: null,
    mouseRadius: 150,
    particleSizeMin: 0.5,
    particleSizeMax: 3,
    particleSpeedMultiplier: 1,
    connectionDistance: 120,
    connectionOpacityMultiplier: 0.3,
    rippleMaxRadius: 150,
    rippleGrowthRate: 3,
    rippleLineWidth: 2,
  }
);

const mode = useColorMode();

const particleColor = props.particleColor || (mode.value === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)');
const connectionColor = props.connectionColor || (mode.value === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)');
const rippleColor = props.rippleColor || (mode.value === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.08)');

const parsedParticleColor = parseColor(particleColor);
const parsedConnectionColor = parseColor(connectionColor);
const parsedRippleColor = parseColor(rippleColor);

function fastRgba(c: ParsedColor, a: number): string {
  return buildRgba(c.r, c.g, c.b, Math.max(0, Math.min(1, a)));
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  randomSpeed: number;
  randomDirection: number;
  randomOffset: number;
  baseX: number;
  baseY: number;
  shooting: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  growing: boolean;
}

const QUALITY_MULTIPLIER: Record<BackgroundFrame['performance']['quality'], number> = {
  high: 1,
  medium: 0.68,
  low: 0.4,
};
const BASE_FRAME_RATE = 60;

const particlesRef = ref<Particle[]>([]);
const backgroundRef = ref<Particle[]>([]);
const ripplesRef = ref<Ripple[]>([]);
const lastSizeRef = ref({ width: 0, height: 0 });
const lastQualityRef = ref<BackgroundFrame['performance']['quality'] | null>(null);

function createParticles(width: number, height: number, multiplier: number) {
  const baseCount = props.particleCount || Math.floor((width * height) / 8000);
  const count = Math.max(1, Math.floor(baseCount * multiplier));
  const particles: Particle[] = [];
  const background: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const isShooter = Math.random() < 0.05;
    const radius = isShooter
      ? props.particleSizeMin
      : props.particleSizeMin + Math.random() * (props.particleSizeMax - props.particleSizeMin);
    const vx =
      (Math.random() - 0.5) * (isShooter ? 2 * props.particleSpeedMultiplier : 0.5 * props.particleSpeedMultiplier);
    const vy =
      (Math.random() - 0.5) * (isShooter ? 2 * props.particleSpeedMultiplier : 0.5 * props.particleSpeedMultiplier);
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx,
      vy,
      radius,
      opacity: Math.random() * 0.5 + 0.3,
      randomSpeed: Math.random() * 0.5 + 0.2,
      randomDirection: Math.random() * Math.PI * 2,
      randomOffset: Math.random() * 1000,
      baseX: 0,
      baseY: 0,
      shooting: isShooter,
    });
  }

  const backgroundCount = Math.floor(count * 0.3 * multiplier);
  for (let i = 0; i < backgroundCount; i++) {
    background.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: Math.random() * (props.particleSizeMax * 0.5),
      opacity: Math.random() * 0.3,
      randomSpeed: 0,
      randomDirection: 0,
      randomOffset: 0,
      baseX: 0,
      baseY: 0,
      shooting: false,
    });
  }

  return { particles, background };
}

function init(_canvas: HTMLCanvasElement, frame: BackgroundFrame) {
  lastSizeRef.value = { width: frame.width, height: frame.height };
  const { particles, background } = createParticles(
    frame.width,
    frame.height,
    QUALITY_MULTIPLIER[frame.performance.quality]
  );
  particlesRef.value = particles;
  backgroundRef.value = background;
}

function draw(frame: BackgroundFrame) {
  const { ctx, width, height, mouse, time, delta, performance } = frame;
  const { quality, reducedMotion } = performance;
  const multiplier = QUALITY_MULTIPLIER[quality];
  const motionStep = delta * BASE_FRAME_RATE;
  const motionScale = reducedMotion ? 0.05 : motionStep;
  const scaledMouseRadius = props.mouseRadius * multiplier;
  const scaledConnectionDistance = props.connectionDistance * multiplier;
  const scaledConnectionOpacity = props.connectionOpacityMultiplier * multiplier;
  const scaledRippleLineWidth = props.rippleLineWidth * multiplier;

  if (width !== lastSizeRef.value.width || height !== lastSizeRef.value.height || quality !== lastQualityRef.value) {
    lastSizeRef.value = { width, height };
    lastQualityRef.value = quality;
    const { particles, background } = createParticles(width, height, multiplier);
    particlesRef.value = particles;
    backgroundRef.value = background;
  }

  if (quality !== 'low') {
    for (const r of frame.ripples) {
      ripplesRef.value.push({
        x: r.x,
        y: r.y,
        radius: 0,
        maxRadius: props.rippleMaxRadius,
        opacity: 1,
        growing: true,
      });
    }
  }

  particlesRef.value.forEach((particle) => {
    if (particle.baseX === 0 && particle.baseY === 0) {
      particle.baseX = particle.x;
      particle.baseY = particle.y;
    }

    const randomX = Math.sin(time * particle.randomSpeed + particle.randomOffset) * 20;
    const randomY = Math.cos(time * particle.randomSpeed * 0.8 + particle.randomOffset) * 15;
    const driftX = Math.cos(particle.randomDirection + time * 0.1) * 0.3;
    const driftY = Math.sin(particle.randomDirection + time * 0.1) * 0.3;

    if (!reducedMotion) {
      particle.vx += (driftX * 0.01 + randomX * 0.001) * motionStep;
      particle.vy += (driftY * 0.01 + randomY * 0.001) * motionStep;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < scaledMouseRadius) {
          const force = (scaledMouseRadius - distance) / scaledMouseRadius;
          const interactionMultiplier = quality === 'low' ? 0.5 : 1;
          particle.vx +=
            dx * force * 0.008 * props.particleSpeedMultiplier * multiplier * motionStep * interactionMultiplier;
          particle.vy +=
            dy * force * 0.008 * props.particleSpeedMultiplier * multiplier * motionStep * interactionMultiplier;
        }
      }

      ripplesRef.value.forEach((ripple) => {
        const rippleDx = particle.x - ripple.x;
        const rippleDy = particle.y - ripple.y;
        const rippleDistance = Math.sqrt(rippleDx * rippleDx + rippleDy * rippleDy);
        if (rippleDistance > 0 && rippleDistance < ripple.radius + 20 && rippleDistance > ripple.radius - 20) {
          const rippleForce = ripple.opacity * 0.8 * multiplier;
          particle.vx += (rippleDx / rippleDistance) * rippleForce * motionStep;
          particle.vy += (rippleDy / rippleDistance) * rippleForce * motionStep;
        }
      });
    }

    particle.x += particle.vx * motionScale;
    particle.y += particle.vy * motionScale;
    particle.vx *= Math.pow(0.985, motionStep);
    particle.vy *= Math.pow(0.985, motionStep);

    if (particle.x < 0 || particle.x > width) {
      particle.vx *= -0.3;
      particle.x = Math.max(0, Math.min(width, particle.x));
    }
    if (particle.y < 0 || particle.y > height) {
      particle.vy *= -0.3;
      particle.y = Math.max(0, Math.min(height, particle.y));
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const centerDistance = Math.sqrt(Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2));
    const maxDistance = Math.min(width, height) * 0.4;
    if (centerDistance > maxDistance) {
      const returnForce =
        ((centerDistance - maxDistance) / centerDistance) * 0.001 * props.particleSpeedMultiplier * motionStep;
      particle.vx += (centerX - particle.x) * returnForce;
      particle.vy += (centerY - particle.y) * returnForce;
    }

    particle.opacity += Math.sin(time * 2 + particle.randomOffset) * 0.002 * motionScale;
    particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity));
  });

  if (quality !== 'low') {
    ripplesRef.value = ripplesRef.value.filter((ripple) => {
      if (ripple.growing) {
        ripple.radius += props.rippleGrowthRate * motionScale;
        ripple.opacity = 1 - ripple.radius / ripple.maxRadius;
        if (ripple.radius >= ripple.maxRadius) ripple.growing = false;
        return true;
      }
      return false;
    });
  }

  ctx.clearRect(0, 0, width, height);

  backgroundRef.value.forEach((particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = fastRgba(parsedParticleColor, particle.opacity * 0.5 * multiplier * parsedParticleColor.a);
    ctx.fill();
  });

  if (quality !== 'low') {
    ctx.lineWidth = 1;
    const particles = particlesRef.value;
    const grid = new SpatialGrid<{ index: number; x: number; y: number }>(scaledConnectionDistance);
    for (let i = 0; i < particles.length; i++) {
      grid.insert(i, particles[i].x, particles[i].y, { index: i, x: particles[i].x, y: particles[i].y });
    }
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const neighbors = grid.query(p.x, p.y, scaledConnectionDistance);
      for (const neighbor of neighbors) {
        if (neighbor.index <= i) continue;
        const j = neighbor.index;
        const dx = p.x - particles[j].x;
        const dy = p.y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < scaledConnectionDistance) {
          const opacity = ((scaledConnectionDistance - distance) / scaledConnectionDistance) * scaledConnectionOpacity;
          ctx.strokeStyle = fastRgba(parsedConnectionColor, opacity * parsedConnectionColor.a);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  particlesRef.value.forEach((particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = fastRgba(parsedParticleColor, particle.opacity * multiplier * parsedParticleColor.a);
    ctx.fill();

    if (particle.shooting) {
      ctx.beginPath();
      ctx.moveTo(particle.x - particle.vx * 8, particle.y - particle.vy * 8);
      ctx.lineTo(particle.x, particle.y);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  if (quality !== 'low') {
    ripplesRef.value.forEach((ripple) => {
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.strokeStyle = fastRgba(parsedRippleColor, ripple.opacity * 0.8 * multiplier * parsedRippleColor.a);
      ctx.lineWidth = scaledRippleLineWidth;
      ctx.stroke();
    });
  }
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
