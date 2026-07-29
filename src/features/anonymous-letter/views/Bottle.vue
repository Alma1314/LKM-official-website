<template>
  <div class="bottle-page">
    <h1 class="page-title">🍶 漂流瓶</h1>
    <p class="page-sub">把心事装进瓶子，交给海流，等一个陌生的回应。</p>
    <Bottle />
  </div>
</template>

<script setup>
import Bottle from '../components/Bottle.vue';
</script>

<style scoped>
.page-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 4px;
}
.page-sub {
  color: var(--text-sub);
  margin: 0 0 18px;
  font-size: 14px;
}
</style>
