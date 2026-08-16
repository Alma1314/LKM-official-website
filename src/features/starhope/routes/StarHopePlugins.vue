<script setup lang="ts">
import { t } from "~/lib/i18n";

const plugins = [
  {
    id: "lottery",
    nameKey: "starhope.plugins.lottery.name",
    descKey: "starhope.plugins.lottery.desc",
  },
  {
    id: "timer",
    nameKey: "starhope.plugins.timer.name",
    descKey: "starhope.plugins.timer.desc",
  },
  {
    id: "calculator",
    nameKey: "starhope.plugins.calculator.name",
    descKey: "starhope.plugins.calculator.desc",
  },
] as const;
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-deep-text mb-6">
      {{ t("starhope.plugins.title") }}
    </h1>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="p in plugins" :key="p.id" class="card-base p-6 text-center">
        <div class="text-3xl mb-3">🧩</div>
        <h3 class="font-semibold text-deep-text">{{ t(p.nameKey) }}</h3>
        <p class="text-xs text-text-muted mt-1">{{ t(p.descKey) }}</p>
      </div>
    </div>
  </div>
</template>
