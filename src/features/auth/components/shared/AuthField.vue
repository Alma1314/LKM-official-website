<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="label pb-1">
      <span class="label-text font-medium">{{ label }}</span>
    </label>
    <div class="relative">
      <input
        :id="id"
        :type="showPassword ? 'text' : type"
        class="input input-bordered w-full pr-10"
        :class="{ 'input-error': error }"
        :value="(modelValue as string | undefined) ?? ''"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :aria-describedby="
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        "
        :aria-invalid="!!error"
        @input="
          emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute right-2 inset-y-0 flex items-center px-2 text-text-muted"
        @click="showPassword = !showPassword"
        :aria-label="
          showPassword
            ? t('auth.field.hidePassword')
            : t('auth.field.showPassword')
        "
      >
        {{ showPassword ? t("auth.field.hide") : t("auth.field.show") }}
      </button>
    </div>
    <span v-if="error" :id="`${id}-error`" class="label-text-alt text-error">{{
      error
    }}</span>
    <span
      v-else-if="hint"
      :id="`${id}-hint`"
      class="label-text-alt text-text-muted"
      >{{ hint }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { t } from "~/lib/i18n";

withDefaults(
  defineProps<{
    id?: string;
    label?: string;
    error?: string;
    hint?: string;
    modelValue?: string;
    type?: string;
    autocomplete?: string;
    placeholder?: string;
  }>(),
  { type: "text" },
);

const emit = defineEmits<(e: "update:modelValue", v: string) => void>();
const showPassword = ref(false);
</script>
