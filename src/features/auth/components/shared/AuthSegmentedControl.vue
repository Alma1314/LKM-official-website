<template>
  <div role="group" class="tabs tabs-boxed flex w-full" aria-label="选择登录方式">
    <button
      v-for="opt in options"
      :key="opt.key"
      type="button"
      class="tab flex-1"
      :class="{ 'tab-active': opt.key === modelValue }"
      :aria-pressed="opt.key === modelValue"
      @click="emit('update:modelValue', opt.key)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
type Option = { key: string; label: string };

withDefaults(
  defineProps<{
    options: Option[];
    modelValue: string;
  }>(),
  { options: () => [] }
);

const emit = defineEmits<(e: 'update:modelValue', v: string) => void>();
</script>
