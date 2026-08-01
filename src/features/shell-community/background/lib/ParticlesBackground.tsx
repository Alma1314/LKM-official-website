import { useCallback, useMemo, useRef } from 'react';
import { BackgroundCanvas } from '~/features/shell-community/background/BackgroundCanvas';
import type { BackgroundFrame } from '~/features/shell-community/background/useBackgroundCanvas';
import { useColorMode } from '~/features/shell-community/background/useColorMode';
import { parseColor, buildRgba, type ParsedColor } from './colorUtils';
import { SpatialGrid } from './spatialGrid';

export interface ParticlesBackgroundProps {
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

const QUALITY_MULTIPLIER = { high: 1, medium: 0.68, low: 0.4 } as const;
const BASE_FRAME_RATE = 60;

export default function ParticlesBackground({
  particleCount = null,
  mouseRadius = 150,
  particleColor: propParticleColor,
  connectionColor: propConnectionColor,
  rippleColor: propRippleColor,
  className = '',
  particleSizeMin = 0.5,
  particleSizeMax = 3,
  particleSpeedMultiplier = 1,
  connectionDistance = 120,
  connectionOpacityMultiplier = 0.3,
  rippleMaxRadius = 150,
  rippleGrowthRate = 3,
  rippleLineWidth = 2,
}: ParticlesBackgroundProps) {
  const mode = useColorMode();
  const particleColor = propParticleColor || (mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)');
  const connectionColor = propConnectionColor || (mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)');
  const rippleColor = propRippleColor || (mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.08)');

  const parsedParticleColor = useMemo(() => parseColor(particleColor), [particleColor]);
  const parsedConnectionColor = useMemo(() => parseColor(connectionColor), [connectionColor]);
  const parsedRippleColor = useMemo(() => parseColor(rippleColor), [rippleColor]);

  function fastRgba(c: ParsedColor, a: number): string {
    return buildRgba(c.r, c.g, c.b, Math.max(0, Math.min(1, a)));
  }

  const particlesRef = useRef<Particle[]>([]);
  const backgroundRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const lastQualityRef = useRef<BackgroundFrame['performance']['quality'] | null>(null);

  const createParticles = useCallback(
    (width: number, height: number, multiplier: number) => {
      const baseCount = particleCount || Math.floor((width * height) / 8000);
      const count = Math.max(1, Math.floor(baseCount * multiplier));
      const particles: Particle[] = [];
      const background: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const isShooter = Math.random() < 0.05;
        const radius = isShooter
          ? particleSizeMin
          : particleSizeMin + Math.random() * (particleSizeMax - particleSizeMin);
        const vx = (Math.random() - 0.5) * (isShooter ? 2 * particleSpeedMultiplier : 0.5 * particleSpeedMultiplier);
        const vy = (Math.random() - 0.5) * (isShooter ? 2 * particleSpeedMultiplier : 0.5 * particleSpeedMultiplier);
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

      // 视差背景层基于画质调整后的主计数进行缩放。
      const backgroundCount = Math.floor(count * 0.3 * multiplier);
      for (let i = 0; i < backgroundCount; i++) {
        background.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0,
          radius: Math.random() * (particleSizeMax * 0.5),
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
    },
    [particleCount, particleSizeMin, particleSizeMax, particleSpeedMultiplier]
  );

  const draw = useCallback(
    (frame: BackgroundFrame) => {
      const { ctx, width, height, mouse, time, delta, performance } = frame;
      const { quality, reducedMotion } = performance;
      const multiplier = QUALITY_MULTIPLIER[quality];
      const motionStep = delta * BASE_FRAME_RATE;
      const motionScale = reducedMotion ? 0.05 : motionStep;
      const scaledMouseRadius = mouseRadius * multiplier;
      const scaledConnectionDistance = connectionDistance * multiplier;
      const scaledConnectionOpacity = connectionOpacityMultiplier * multiplier;
      const scaledRippleLineWidth = rippleLineWidth * multiplier;

      // 在 resize 或画质变化时重建画质相关资源。
      if (
        width !== lastSizeRef.current.width ||
        height !== lastSizeRef.current.height ||
        quality !== lastQualityRef.current
      ) {
        lastSizeRef.current = { width, height };
        lastQualityRef.current = quality;
        const { particles, background } = createParticles(width, height, multiplier);
        particlesRef.current = particles;
        backgroundRef.current = background;
      }

      // 消耗每帧产生的涟漪
      if (quality !== 'low') {
        for (const r of frame.ripples) {
          ripplesRef.current.push({
            x: r.x,
            y: r.y,
            radius: 0,
            maxRadius: rippleMaxRadius,
            opacity: 1,
            growing: true,
          });
        }
      }

      // 更新粒子
      particlesRef.current.forEach((particle) => {
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
                dx * force * 0.008 * particleSpeedMultiplier * multiplier * motionStep * interactionMultiplier;
              particle.vy +=
                dy * force * 0.008 * particleSpeedMultiplier * multiplier * motionStep * interactionMultiplier;
            }
          }

          ripplesRef.current.forEach((ripple) => {
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
            ((centerDistance - maxDistance) / centerDistance) * 0.001 * particleSpeedMultiplier * motionStep;
          particle.vx += (centerX - particle.x) * returnForce;
          particle.vy += (centerY - particle.y) * returnForce;
        }

        particle.opacity += Math.sin(time * 2 + particle.randomOffset) * 0.002 * motionScale;
        particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity));
      });

      // 更新涟漪
      if (quality !== 'low') {
        ripplesRef.current = ripplesRef.current.filter((ripple) => {
          if (ripple.growing) {
            ripple.radius += rippleGrowthRate * motionScale;
            ripple.opacity = 1 - ripple.radius / ripple.maxRadius;
            if (ripple.radius >= ripple.maxRadius) ripple.growing = false;
            return true;
          }
          return false;
        });
      }

      // 绘制
      ctx.clearRect(0, 0, width, height);

      // 背景粒子
      backgroundRef.current.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = fastRgba(parsedParticleColor, particle.opacity * 0.5 * multiplier * parsedParticleColor.a);
        ctx.fill();
      });

      // 连接线 — 空间哈希邻域查询
      if (quality !== 'low') {
        ctx.lineWidth = 1;
        const particles = particlesRef.current;
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
              const opacity =
                ((scaledConnectionDistance - distance) / scaledConnectionDistance) * scaledConnectionOpacity;
              ctx.strokeStyle = fastRgba(parsedConnectionColor, opacity * parsedConnectionColor.a);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // 粒子
      particlesRef.current.forEach((particle) => {
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

      // 涟漪
      if (quality !== 'low') {
        ripplesRef.current.forEach((ripple) => {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.strokeStyle = fastRgba(parsedRippleColor, ripple.opacity * 0.8 * multiplier * parsedRippleColor.a);
          ctx.lineWidth = scaledRippleLineWidth;
          ctx.stroke();
        });
      }
    },
    [
      createParticles,
      mouseRadius,
      particleColor,
      connectionColor,
      rippleColor,
      particleSpeedMultiplier,
      connectionDistance,
      connectionOpacityMultiplier,
      rippleMaxRadius,
      rippleGrowthRate,
      rippleLineWidth,
    ]
  );

  const init = useCallback(
    (_canvas: HTMLCanvasElement, frame: BackgroundFrame) => {
      lastSizeRef.current = { width: frame.width, height: frame.height };
      const { particles, background } = createParticles(
        frame.width,
        frame.height,
        QUALITY_MULTIPLIER[frame.performance.quality]
      );
      particlesRef.current = particles;
      backgroundRef.current = background;
    },
    [createParticles]
  );

  return <BackgroundCanvas draw={draw} init={init} interactions={{ mouse: true, click: true }} className={className} />;
}
