<template>
  <!-- 白噪音背景音乐（WebAudio 生成，无需音频文件） -->
  <div class="audio-player" :class="{ on: playing }" v-if="!lowPerf">
    <button class="audio-btn" @click="toggle" :title="playing ? '关闭白噪音' : '开启白噪音'">
      <span class="audio-icon">{{ playing ? '🔊' : '🔈' }}</span>
    </button>
    <span class="audio-label">{{ playing ? '白噪音·雨声' : '静音' }}</span>
    <input v-if="playing" class="audio-vol" type="range" min="0" max="1" step="0.05" :value="volume" @input="onVol" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useApp } from '../store/app';
import * as store from '../store/storage';

const { state, lowPerf } = useApp();
const playing = ref(false);
const volume = ref(0.4);
let ctx = null;
let node = null;
let gain = null;

onMounted(() => {
  playing.value = !!state.settings.audioOn;
  volume.value = state.settings.bgmVolume || 0.4;
  if (playing.value) start();
});

function start() {
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    node = ctx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    // 低通滤波，模拟柔和雨声
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    gain = ctx.createGain();
    gain.gain.value = volume.value;
    node.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    node.start(0);
  } catch (e) {}
}
function stop() {
  try {
    node && node.stop();
    ctx && ctx.close();
  } catch (e) {}
  node = null;
  ctx = null;
}
function toggle() {
  playing.value = !playing.value;
  store.saveSettings({ audioOn: playing.value });
  if (playing.value) start();
  else stop();
}
function onVol(e) {
  volume.value = parseFloat(e.target.value);
  if (gain) gain.gain.value = volume.value;
  store.saveSettings({ bgmVolume: volume.value });
}
onUnmounted(stop);
</script>

<style scoped>
.audio-player {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--card-border);
}
.audio-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 18px;
}
.audio-label {
  font-size: 12px;
  color: var(--text-sub);
}
.audio-vol {
  width: 70px;
  accent-color: var(--accent);
}
</style>
