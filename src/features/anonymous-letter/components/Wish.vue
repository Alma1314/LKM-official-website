<template>
  <div class="wish-page">
    <h1 class="page-title">🌟 {{ t("treehole.wish.title") }}</h1>
    <p class="page-sub">{{ t("treehole.wish.subtitle") }}</p>
    <WishWall />
  </div>
</template>

<script setup>
import WishWall from "../components/WishWall.vue";
import { t } from "~/lib/i18n";
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
