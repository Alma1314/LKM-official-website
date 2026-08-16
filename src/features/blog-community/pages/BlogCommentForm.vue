<script setup lang="ts">
import { ref } from "vue";
import { t } from "~/lib/i18n";

const _props = defineProps<{
  replyTo: string;
  isLoggedIn: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [content: string];
  cancel: [];
}>();

const content = ref("");

function handleSubmit() {
  if (!content.value.trim()) return;
  emit("submit", content.value.trim());
  content.value = "";
}
</script>

<template>
  <div class="mt-4">
    <div v-if="replyTo" class="text-sm text-text-muted mb-2">
      {{ t("blog.replyTo", { name: replyTo }) }}
      <button class="text-primary ml-2" @click="emit('cancel')">
        {{ t("common.cancel") }}
      </button>
    </div>
    <div v-if="!isLoggedIn" class="text-sm text-text-muted">
      {{ t("blog.loginPromptPrefix")
      }}<a href="/login" class="text-primary">{{ t("user.login") }}</a
      >{{ t("blog.loginPromptSuffix") }}
    </div>
    <form v-else @submit.prevent="handleSubmit" class="flex gap-2">
      <textarea
        v-model="content"
        class="flex-1 rounded-lg border border-border bg-input p-2 text-sm resize-none"
        rows="2"
        :placeholder="t('blog.commentPlaceholder')"
      />
      <button
        type="submit"
        class="btn-plain rounded-lg px-4 py-2 bg-primary text-white text-sm self-end"
        :disabled="submitting || !content.trim()"
      >
        {{ submitting ? t("blog.sending") : t("common.send") }}
      </button>
    </form>
  </div>
</template>
