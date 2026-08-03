<script setup lang="ts">
import { useBackgroundCanvas, type BackgroundInteractions, type BackgroundFrame } from './useBackgroundCanvas';

const props = defineProps<{
  draw: (frame: BackgroundFrame) => void;
  init?: (canvas: HTMLCanvasElement, frame: BackgroundFrame) => void | (() => void);
  interactions?: BackgroundInteractions;
  className?: string;
}>();

const { canvasRef } = useBackgroundCanvas({
  draw: props.draw,
  init: props.init,
  interactions: props.interactions,
});
</script>

<template>
  <canvas ref="canvasRef" :class="`fixed inset-0 pointer-events-auto ${props.className ?? ''}`"
    style="z-index: 0; width: 100vw; height: 100vh" aria-hidden="true" />
  <slot />
</template>
