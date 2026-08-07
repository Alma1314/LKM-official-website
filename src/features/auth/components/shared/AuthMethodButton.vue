<template>
  <button
    type="button"
    class="btn btn-outline w-full gap-2"
    :class="{ 'btn-disabled': disabled }"
    :disabled="disabled"
    @click="emit('click')"
  >
    <span v-if="icon" class="shrink-0 text-text-muted" aria-hidden="true">{{ icon }}</span>
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    icon?: string;
    disabled?: boolean;
  }>(),
  { disabled: false }
);

const emit = defineEmits<(e: 'click') => void>();
</script>
