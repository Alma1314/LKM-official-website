<script setup lang="ts">
import { useAuthStore } from "../stores/auth";
import StarHopeLoginRequired from "../routes/StarHopeLoginRequired.vue";

const { isLoggedIn } = useAuthStore();
</script>

<template>
  <StarHopeLoginRequired v-if="!isLoggedIn" />
  <slot v-else />
</template>
