<script setup lang="ts">
defineProps<{
  starred: boolean;
  starCount: number;
  loading: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <button
    class="flex items-center gap-1 text-sm btn-plain rounded-lg px-3 py-1.5 transition-colors"
    :class="{ 'text-yellow-500': starred, 'text-text-muted': !starred }"
    :disabled="loading"
    @click="emit('toggle')"
  >
    <span>{{ starred ? "★" : "☆" }}</span>
    <span>{{ starCount }}</span>
  </button>
</template>
