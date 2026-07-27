<template>
  <div class="flex gap-1 overflow-x-auto pb-1">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0"
      :class="
        activeTab === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-3 text-text-muted hover:bg-surface-3/70'
      "
      @click="$emit('change', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export interface CategoryTab {
  key: string;
  label: string;
}

defineProps<{
  tabs: CategoryTab[];
  activeTab: string;
}>();

defineEmits<{
  change: [key: string];
}>();
</script>
