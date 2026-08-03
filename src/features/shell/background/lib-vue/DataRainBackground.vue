<script setup lang="ts">
import { useColorMode } from '../vue/useColorMode';
import BackgroundCanvas from '../vue/BackgroundCanvas.vue';
import type { BackgroundFrame } from '../vue/useBackgroundCanvas';
const props = defineProps<Record<string, any>>();
const mode = useColorMode();
function draw(frame: BackgroundFrame) {
  const { ctx, width, height } = frame;
  ctx.fillStyle = mode.value === 'dark' ? '#0a0a1a' : '#f0f0ff';
  ctx.fillRect(0, 0, width, height);
}
</script>
<template><BackgroundCanvas :draw="draw" :interactions="{ mouse: true, click: true }" /></template>
