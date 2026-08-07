<template>
  <div class="w-full">
    <div class="flex justify-between gap-2">
      <label class="label pb-1" :for="`${id}-0`">
        <span class="label-text font-medium">验证码</span>
      </label>
      <!-- 测试模式标记仅用于演示，非交互 -->
    </div>
    <div class="flex gap-2" role="group" :aria-describedby="error ? `${id}-error` : undefined">
      <input
        v-for="(v, i) in digits"
        :key="i"
        :id="`${id}-${i}`"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="1"
        class="input input-bordered w-12 h-12 text-center text-lg"
        :class="{ 'input-error': error }"
        :value="v"
        :aria-label="`第 ${i + 1} 位验证码`"
        :aria-invalid="!!error"
        @input="onInput(i, $event)"
        @keydown.backspace.prevent="onBackspace(i)"
        @paste="onPaste($event)"
      />
    </div>
    <span v-if="error" :id="`${id}-error`" class="label-text-alt text-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    error?: string;
    id?: string;
  }>(),
  { id: 'verify', modelValue: '' }
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'complete'): void;
}>();

// 6 位独立输入槽
const numCells = 6;
const cells = ref<string[]>(Array.from({ length: numCells }, () => ''));

// 由外部 modelValue 同步（外部清空/填整串）
watch(
  () => props.modelValue,
  (val) => {
    syncFromString(val ?? '');
  },
  { immediate: true }
);

const digits = computed(() => cells.value);

function syncFromString(str: string): void {
  const next = Array.from({ length: numCells }, (_, i) => (str[i] ?? '').toString());
  cells.value = next;
}

function joinCells(): string {
  return cells.value.join('');
}

function focusIndex(idx: number): void {
  const el = document.getElementById(`${props.id}-${idx}`) as HTMLInputElement | null;
  if (el) el.focus();
}

function onInput(i: number, e: Event): void {
  const t = e.target as HTMLInputElement;
  let value = t.value;
  // 仅保留一位数字
  value = value.replace(/\D/g, '').slice(0, 1);
  cells.value[i] = value;
  if (value && i < numCells - 1) {
    focusIndex(i + 1);
  }
  pushValue();
}

function onBackspace(i: number): void {
  if (cells.value[i]) {
    cells.value[i] = '';
  } else if (i > 0) {
    cells.value[i - 1] = '';
    focusIndex(i - 1);
  }
  pushValue();
}

function onPaste(e: Event): void {
  const clip = (e as ClipboardEvent).clipboardData?.getData('text') ?? '';
  e.preventDefault();
  const code = clip.replace(/\D/g, '').slice(0, numCells);
  if (code) {
    syncFromString(code);
    const last = Math.min(code.length, numCells) - 1;
    focusIndex(last);
    pushValue();
  }
}

function pushValue(): void {
  const code = joinCells();
  emit('update:modelValue', code);
  if (code.length === numCells) {
    emit('complete');
  }
}
</script>
