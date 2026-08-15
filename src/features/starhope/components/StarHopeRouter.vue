<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import AuthGuard from './AuthGuard.vue';
import StarHopeLoginRequired from '../routes/StarHopeLoginRequired.vue';
import { useNavigationStore } from '../stores/navigation';

const { currentRoute } = useNavigationStore();

const routes: Record<string, Record<string, unknown>> = {
  dashboard: defineAsyncComponent(() => import('../routes/StarHopeDashboard.vue')),
  bank: defineAsyncComponent(() => import('../routes/StarHopeBank.vue')),
  practice: defineAsyncComponent(() => import('../routes/StarHopePractice.vue')),
  exam: defineAsyncComponent(() => import('../routes/StarHopeExam.vue')),
  'wrong-book': defineAsyncComponent(() => import('../routes/StarHopeWrongBook.vue')),
  ai: defineAsyncComponent(() => import('../routes/StarHopeAi.vue')),
  reader: defineAsyncComponent(() => import('../routes/StarHopeReader.vue')),
  plugins: defineAsyncComponent(() => import('../routes/StarHopePlugins.vue')),
  settings: defineAsyncComponent(() => import('../routes/StarHopeSettings.vue')),
};
</script>

<template>
  <StarHopeLoginRequired v-if="currentRoute === 'login'" />
  <AuthGuard v-else>
    <component :is="routes[currentRoute] || routes.dashboard" />
  </AuthGuard>
</template>
