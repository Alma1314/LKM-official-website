<template>
  <div class="wish-page">
    <h1 class="page-title">🌟 许愿墙</h1>
    <p class="page-sub">把愿望交给星光，被温柔照亮。</p>
    <WishWall />
  </div>
</template>

<script setup>
import WishWall from '../components/WishWall.vue'
</script>

<style scoped>
.page-title { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
.page-sub { color: var(--text-sub); margin: 0 0 18px; font-size: 14px; }
</style>
