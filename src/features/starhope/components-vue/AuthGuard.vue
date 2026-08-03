<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores-vue/auth';
import StarHopeLoginRequired from '../routes-vue/StarHopeLoginRequired.vue';

const { isLoggedIn } = useAuthStore();
</script>

<template>
  <StarHopeLoginRequired v-if="!isLoggedIn" />
  <slot v-else />
</template>
