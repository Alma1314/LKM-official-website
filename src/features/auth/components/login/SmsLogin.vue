<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg">
      <span class="text-sm text-text-muted">{{ t("auth.login.sendTo") }}</span>
      <span class="text-sm font-medium">{{ target }}</span>
    </div>
    <button
      type="button"
      class="btn btn-outline w-full"
      @click="handleSendCode"
      :disabled="countdown > 0"
    >
      {{
        countdown > 0
          ? t("auth.login.resendCode", { count: countdown })
          : codeSent
            ? t("auth.login.resendCodeBtn")
            : t("auth.login.getCodeBtn")
      }}
    </button>
    <p v-if="codeSent" class="text-xs text-success text-center">
      {{ t("auth.login.codeSentHint") }}
    </p>
    <div>
      <label class="label pb-1" for="sms-code">
        <span class="label-text font-medium">{{
          t("auth.login.codeLabel")
        }}</span>
      </label>
      <input
        id="sms-code"
        type="text"
        class="input input-bordered w-full"
        :class="{ 'input-error': codeError }"
        v-model="code"
        :placeholder="t('auth.login.codePlaceholder6')"
        maxlength="6"
        @input="codeError = ''"
      />
      <span v-if="codeError" class="label-text-alt text-error">{{
        codeError
      }}</span>
    </div>
    <button
      type="submit"
      class="btn btn-primary w-full"
      :disabled="loading || !codeSent"
    >
      <span v-if="loading" class="loading loading-spinner loading-xs"></span>
      <template v-else>{{ t("auth.login.title") }}</template>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { t } from "~/lib/i18n";
import type { LoginMethod } from "~/types/auth";

const emit = defineEmits<{
  (e: "login", method: LoginMethod, credentials: Record<string, string>): void;
}>();

const props = defineProps<{
  identifiedAccount: { username: string; email?: string; phone?: string };
}>();

const target = computed(
  () => props.identifiedAccount.phone || props.identifiedAccount.email || "",
);

const code = ref("");
const codeError = ref("");
const countdown = ref(0);
const codeSent = ref(false);
const loading = ref(false);
const attempts = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

function handleSendCode() {
  codeSent.value = true;
  attempts.value = 0;
  countdown.value = 60;
  timer = setInterval(() => {
    if (countdown.value <= 1) {
      clearInterval(timer);
      countdown.value = 0;
      return;
    }
    countdown.value--;
  }, 1000);
}

async function handleSubmit() {
  if (!code.value.trim()) {
    codeError.value = t("auth.login.codeRequired");
    return;
  }
  if (attempts.value >= 3) {
    codeError.value = t("auth.login.tooManyAttempts");
    codeSent.value = false;
    code.value = "";
    attempts.value = 0;
    return;
  }
  loading.value = true;
  codeError.value = "";
  attempts.value++;
  emit("login", "sms", {
    phoneOrEmail: props.identifiedAccount.username,
    code: code.value,
  });
  loading.value = false;
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>
