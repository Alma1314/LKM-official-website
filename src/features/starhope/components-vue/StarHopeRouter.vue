<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import AuthGuard from './AuthGuard.vue';
import StarHopeLoginRequired from '../routes-vue/StarHopeLoginRequired.vue';
import { useNavigationStore } from '../stores-vue/navigation';

const { currentRoute } = useNavigationStore();

const routes: Record<string, any> = {
  dashboard: defineAsyncComponent(() => import('../routes-vue/StarHopeDashboard.vue')),
  bank: defineAsyncComponent(() => import('../routes-vue/StarHopeBank.vue')),
  practice: defineAsyncComponent(() => import('../routes-vue/StarHopePractice.vue')),
  exam: defineAsyncComponent(() => import('../routes-vue/StarHopeExam.vue')),
  'wrong-book': defineAsyncComponent(() => import('../routes-vue/StarHopeWrongBook.vue')),
  ai: defineAsyncComponent(() => import('../routes-vue/StarHopeAi.vue')),
  reader: defineAsyncComponent(() => import('../routes-vue/StarHopeReader.vue')),
  plugins: defineAsyncComponent(() => import('../routes-vue/StarHopePlugins.vue')),
  settings: defineAsyncComponent(() => import('../routes-vue/StarHopeSettings.vue')),
};
</script>

<template>
  <StarHopeLoginRequired v-if="currentRoute === 'login'" />
  <AuthGuard v-else>
    <component :is="routes[currentRoute] || routes.dashboard" />
  </AuthGuard>
</template>
