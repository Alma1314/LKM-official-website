<script setup lang="ts">
import { ref } from 'vue';
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';
import { parseColor, buildRgba } from '../lib/colorUtils';


interface Column {
  x: number;
  originalX: number;
  yPositions: number[];
  chars: string[];
  speeds: number[];
  deflectionX: number[];
  deflectionDecay: number[];
}

interface LocalRipple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

const props = withDefaults(
  defineProps<{
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    rippleColor?: string;
    density?: number;
    className?: string;
    flickerSpeed?: number;
    trailLength?: number;
    charSet?: string[];
    charChangeRate?: number;
    deflectionForce?: number;
    mouseGlowRadius?: number;
    rippleGrowthRate?: number;
    rippleFadeRate?: number;
    rippleLineWidth?: number;
    charSpeedMin?: number;
    charSpeedMax?: number;
  }>(),
  {
    fontSize: 18,
    fontFamily: 'Space Grotesk',
    density: 0.05,
    flickerSpeed: 0.05,
    trailLength: 15,
    charSet: () => ['0', '1', 'あ', 'ｑ', 'Æ', 'Ψ'],
    charChangeRate: 0.1,
    deflectionForce: 50,
    mouseGlowRadius: 80,
    rippleGrowthRate: 3,
    rippleFadeRate: 0.015,
    rippleLineWidth: 2,
    charSpeedMin: 0.5,
    charSpeedMax: 2.5,
  }
);

const mode = useColorMode();
const color = props.color ?? (mode.value === 'dark' ? 'rgba(0,255,0,0.8)' : 'rgba(0,80,0,0.7)');
const rippleColor = props.rippleColor ?? (mode.value === 'dark' ? 'rgba(0,255,127,0.5)' : 'rgba(0,0,0,0.08)');

const parsedColor = parseColor(color);
const fontString = `${props.fontSize}px ${props.fontFamily}`;

const columnsRef = ref<Column[]>([]);
const ripplesRef = ref<LocalRipple[]>([]);
const mouseIntensityRef = ref(0);
const flickerRef = ref(0);
const lastMouseRef = ref<{ x: number | null; y: number | null }>({ x: null, y: null });
const lastSizeRef = ref({ width: 0, height: 0 });

function init(_canvas: HTMLCanvasElement, frame: BackgroundFrame) {
  const { width, height } = frame;
  lastSizeRef.value = { width, height };
  const columnCount = Math.floor(width * props.density);
  const columnWidth = width / columnCount;
  const charCount = Math.floor(height / props.fontSize);
  const columns: Column[] = [];
  for (let i = 0; i < columnCount; i++) {
    const x = i * columnWidth + columnWidth / 2;
    const yPositions: number[] = [];
    const chars: string[] = [];
    const speeds: number[] = [];
    const deflectionX: number[] = [];
    const deflectionDecay: number[] = [];
    for (let j = 0; j < charCount; j++) {
      yPositions.push(j * props.fontSize);
      chars.push(props.charSet[Math.floor(Math.random() * props.charSet.length)]);
      speeds.push(props.charSpeedMin + Math.random() * (props.charSpeedMax - props.charSpeedMin));
      deflectionX.push(0);
      deflectionDecay.push(0.95 + Math.random() * 0.04);
    }
    columns.push({ x, originalX: x, yPositions, chars, speeds, deflectionX, deflectionDecay });
  }
  columnsRef.value = columns;
  ripplesRef.value = [];
  mouseIntensityRef.value = 0;
  flickerRef.value = 0;
  lastMouseRef.value = { x: null, y: null };
}

function draw(frame: BackgroundFrame) {
  const { ctx, width, height, mouse } = frame;
  const last = lastSizeRef.value;

  if (width !== last.width || height !== last.height) {
    lastSizeRef.value = { width, height };
    const effectiveDensity = frame.performance.quality === 'low' ? props.density * 0.5 : props.density;
    const columnCount = Math.floor(width * effectiveDensity);
    const columnWidth = width / columnCount;
    const charCount = Math.floor(height / props.fontSize);
    const columns: Column[] = [];
    for (let i = 0; i < columnCount; i++) {
      const x = i * columnWidth + columnWidth / 2;
      const yPositions: number[] = [];
      const chars: string[] = [];
      const speeds: number[] = [];
      const deflectionX: number[] = [];
      const deflectionDecay: number[] = [];
      for (let j = 0; j < charCount; j++) {
        yPositions.push(j * props.fontSize);
        chars.push(props.charSet[Math.floor(Math.random() * props.charSet.length)]);
        speeds.push(props.charSpeedMin + Math.random() * (props.charSpeedMax - props.charSpeedMin));
        deflectionX.push(0);
        deflectionDecay.push(0.95 + Math.random() * 0.04);
      }
      columns.push({ x, originalX: x, yPositions, chars, speeds, deflectionX, deflectionDecay });
    }
    columnsRef.value = columns;
  }

  for (const r of frame.ripples) {
    ripplesRef.value.push({ x: r.x, y: r.y, radius: 0, opacity: 0.8 });
  }

  ctx.clearRect(0, 0, width, height);

  flickerRef.value = (flickerRef.value + props.flickerSpeed) % (Math.PI * 2);
  const flickerIntensity = 0.7 + Math.sin(flickerRef.value) * 0.3;

  if (mouse.x !== null && mouse.y !== null) {
    const lastX = lastMouseRef.value.x;
    const lastY = lastMouseRef.value.y;
    if (lastX !== null && lastY !== null && (mouse.x !== lastX || mouse.y !== lastY)) {
      const velocityX = mouse.x - lastX;
      const velocityY = mouse.y - lastY;
      const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      mouseIntensityRef.value = Math.min(1.0, velocity / 8);
    }
    lastMouseRef.value = { x: mouse.x, y: mouse.y };
  } else {
    lastMouseRef.value = { x: null, y: null };
  }
  mouseIntensityRef.value *= 0.92;

  ripplesRef.value = ripplesRef.value.filter((ripple) => {
    ripple.radius += props.rippleGrowthRate;
    ripple.opacity -= props.rippleFadeRate;
    return ripple.opacity > 0;
  });

  ctx.lineWidth = props.rippleLineWidth;
  ripplesRef.value.forEach((ripple) => {
    ctx.globalAlpha = ripple.opacity;
    ctx.strokeStyle = rippleColor;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = ripple.opacity * 0.5;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  ctx.font = fontString;
  ctx.textAlign = 'center';

  columnsRef.value.forEach((column) => {
    const { originalX, yPositions, chars, speeds, deflectionX, deflectionDecay } = column;
    let columnChanged = false;

    for (let i = 0; i < yPositions.length; i++) {
      yPositions[i] += speeds[i];

      const distToMouse = Math.sqrt(
        Math.pow(originalX + deflectionX[i] - (mouse.x ?? -9999), 2) + Math.pow(yPositions[i] - (mouse.y ?? -9999), 2)
      );

      if (distToMouse < props.deflectionForce && mouseIntensityRef.value > 0.2) {
        const angle = Math.atan2(yPositions[i] - (mouse.y ?? -9999), originalX + deflectionX[i] - (mouse.x ?? -9999));
        const force = (props.deflectionForce - distToMouse) / props.deflectionForce;
        deflectionX[i] += Math.cos(angle) * force * mouseIntensityRef.value * 2;
      }

      deflectionX[i] *= deflectionDecay[i];
      column.x = originalX + deflectionX[i];

      if (yPositions[i] > height + props.fontSize) {
        yPositions[i] = -props.fontSize;
        chars[i] = props.charSet[Math.floor(Math.random() * props.charSet.length)];
        speeds[i] = 0.5 + Math.random() * 2;
        deflectionX[i] = 0;
        columnChanged = true;
      }

      const isAffected = distToMouse < props.mouseGlowRadius && mouseIntensityRef.value > 0.1;

      if (Math.random() < (isAffected ? props.charChangeRate * 4 : props.charChangeRate)) {
        chars[i] = props.charSet[Math.floor(Math.random() * props.charSet.length)];
        columnChanged = true;
      }

      const trailIndex = Math.min(i, props.trailLength);
      const opacity = 1 - trailIndex / props.trailLength;
      const brightness = i === 0 ? 1 : 0.3 + 0.7 * opacity;
      const currentFlicker = i === 0 ? flickerIntensity : 1;
      const mouseEffect = isAffected
        ? (1 - Math.min(distToMouse / props.mouseGlowRadius, 1)) * mouseIntensityRef.value * 0.6
        : 0;

      const alpha = opacity * brightness * currentFlicker + mouseEffect;
      const finalColor = buildRgba(parsedColor.r, parsedColor.g, parsedColor.b, Math.min(1, alpha));
      ctx.fillStyle = finalColor;
      ctx.fillText(chars[i], column.x, yPositions[i]);

      if (i === 0 && opacity > 0.2) {
        ctx.strokeStyle = finalColor;
        ctx.beginPath();
        ctx.moveTo(column.x, yPositions[i] - props.fontSize * 0.8);
        ctx.lineTo(column.x, yPositions[i] - props.fontSize * 2.5);
        ctx.stroke();
      }
    }

    if (columnChanged && Math.random() < 0.1) {
      yPositions.unshift(-props.fontSize);
      chars.unshift(props.charSet[Math.floor(Math.random() * props.charSet.length)]);
      speeds.unshift(0.5 + Math.random() * 2);
      deflectionX.unshift(0);
      deflectionDecay.unshift(0.95 + Math.random() * 0.04);
      if (yPositions.length > props.trailLength * 2) {
        yPositions.pop();
        chars.pop();
        speeds.pop();
        deflectionX.pop();
        deflectionDecay.pop();
      }
    }
  });
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
