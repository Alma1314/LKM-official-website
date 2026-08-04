<script setup lang="ts">
import { ref } from 'vue';
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';
import { parseColor, buildRgba } from '../lib/colorUtils';

interface Column {
  x: number;
  yPositions: number[];
  chars: string[];
  speeds: number[];
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
    rippleGrowthRate?: number;
    rippleFadeRate?: number;
    rippleLineWidth?: number;
    mouseAffectRadius?: number;
  }>(),
  {
    fontSize: 18,
    fontFamily: 'Space Grotesk',
    density: 0.05,
    flickerSpeed: 0.05,
    trailLength: 15,
    charSet: () => ['0', '1'],
    charChangeRate: 0.1,
    rippleGrowthRate: 3,
    rippleFadeRate: 0.015,
    rippleLineWidth: 2,
    mouseAffectRadius: 200,
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
    for (let j = 0; j < charCount; j++) {
      yPositions.push(j * props.fontSize);
      chars.push(props.charSet[Math.floor(Math.random() * props.charSet.length)]);
      speeds.push(0.5 + Math.random() * 2);
    }
    columns.push({ x, yPositions, chars, speeds });
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
      for (let j = 0; j < charCount; j++) {
        yPositions.push(j * props.fontSize);
        chars.push(props.charSet[Math.floor(Math.random() * props.charSet.length)]);
        speeds.push(0.5 + Math.random() * 2);
      }
      columns.push({ x, yPositions, chars, speeds });
    }
    columnsRef.value = columns;
  }

  for (const r of frame.ripples) {
    ripplesRef.value.push({ x: r.x, y: r.y, radius: 0, opacity: 0.8 });
  }

  ctx.clearRect(0, 0, width, height);

  flickerRef.value = (flickerRef.value + props.flickerSpeed) % (Math.PI * 2);
  const flickerIntensity = 0.7 + Math.sin(flickerRef.value) * 0.3;

  if (mouse.x !== lastMouseRef.value.x || mouse.y !== lastMouseRef.value.y) {
    mouseIntensityRef.value = 1.0;
  }
  lastMouseRef.value = { x: mouse.x, y: mouse.y };
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
    const { x, yPositions, chars, speeds } = column;
    let columnChanged = false;

    const distToMouse = Math.sqrt(
      Math.pow(x - (mouse.x ?? -9999), 2) + Math.pow((yPositions[0] || 0) - (mouse.y ?? -9999), 2)
    );
    const isAffected = distToMouse < props.mouseAffectRadius && mouseIntensityRef.value > 0.1;

    for (let i = 0; i < yPositions.length; i++) {
      yPositions[i] += speeds[i];
      if (yPositions[i] > height + props.fontSize) {
        yPositions[i] = -props.fontSize;
        chars[i] = props.charSet[Math.floor(Math.random() * props.charSet.length)];
        speeds[i] = 0.5 + Math.random() * 2;
        columnChanged = true;
      }

      if (Math.random() < (isAffected ? props.charChangeRate * 3 : props.charChangeRate)) {
        chars[i] = props.charSet[Math.floor(Math.random() * props.charSet.length)];
        columnChanged = true;
      }

      const trailIndex = Math.min(i, props.trailLength);
      const opacity = 1 - trailIndex / props.trailLength;
      const brightness = i === 0 ? 1 : 0.3 + 0.7 * opacity;
      const currentFlicker = i === 0 ? flickerIntensity : 1;
      const mouseEffect = isAffected ? (1 - Math.min(distToMouse / 200, 1)) * mouseIntensityRef.value : 0;

      const alpha = opacity * brightness * currentFlicker + mouseEffect;
      const finalColor = buildRgba(parsedColor.r, parsedColor.g, parsedColor.b, Math.min(1, alpha));
      ctx.fillStyle = finalColor;
      ctx.fillText(chars[i], x, yPositions[i]);

      if (i === 0 && opacity > 0.2) {
        ctx.strokeStyle = finalColor;
        ctx.beginPath();
        ctx.moveTo(x, yPositions[i] - props.fontSize * 0.8);
        ctx.lineTo(x, yPositions[i] - props.fontSize * 2.5);
        ctx.stroke();
      }
    }

    if (columnChanged && Math.random() < 0.1) {
      yPositions.unshift(-props.fontSize);
      chars.unshift(props.charSet[Math.floor(Math.random() * props.charSet.length)]);
      speeds.unshift(0.5 + Math.random() * 2);
      if (yPositions.length > props.trailLength * 2) {
        yPositions.pop();
        chars.pop();
        speeds.pop();
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
