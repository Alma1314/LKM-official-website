<template>
  <div class="rounded-2xl bg-card-bg shadow-2xl border border-surface-3 p-6 sm:p-8">
    <h2 class="text-xl font-semibold text-center mb-4">{{ t('auth.twoFactor.recoveryTitle') }}</h2>

    <!-- Verify email -->
    <form v-if="step === 'verify'" @submit.prevent="handleVerify" class="space-y-4">
      <p class="text-sm text-text-muted text-center">{{ t('auth.twoFactor.verifyIdentity') }}</p>
      <div>
        <label class="label pb-1"
          ><span class="label-text font-medium">{{ t('auth.twoFactor.email') }}</span></label
        >
        <input
          type="email"
          class="input input-bordered w-full"
          v-model="email"
          :placeholder="t('auth.twoFactor.enterBoundEmail')"
        />
      </div>
      <div>
        <label class="label pb-1"
          ><span class="label-text font-medium">{{ t('auth.twoFactor.code') }}</span></label
        >
        <input
          type="text"
          class="input input-bordered w-full"
          v-model="code"
          :placeholder="t('auth.twoFactor.enterSimulatedCode')"
          maxlength="6"
        />
      </div>
      <p class="text-xs text-success text-center">{{ t('auth.twoFactor.simulatedCode') }}</p>
      <div v-if="error" class="alert alert-error text-sm">{{ error }}</div>
      <button type="submit" class="btn btn-primary w-full">{{ t('auth.twoFactor.verify') }}</button>
      <button type="button" class="btn btn-ghost w-full btn-sm" @click="emit('back')">{{ t('common.back') }}</button>
    </form>

    <!-- Recovery code -->
    <form v-else-if="step === 'recovery'" @submit.prevent="handleRecovery" class="space-y-4">
      <p class="text-sm text-text-muted text-center">{{ t('auth.twoFactor.enterRecoveryTitle') }}</p>
      <div>
        <label class="label pb-1"
          ><span class="label-text font-medium">{{ t('auth.twoFactor.recoveryCodeName') }}</span></label
        >
        <input
          type="text"
          class="input input-bordered w-full"
          v-model="recoveryCode"
          :placeholder="t('auth.twoFactor.recoveryCodePlaceholder')"
        />
      </div>
      <div v-if="error" class="alert alert-error text-sm">{{ error }}</div>
      <button type="submit" class="btn btn-primary w-full">{{ t('auth.twoFactor.verify') }}</button>
      <button v-if="props.level === 'admin'" type="button" class="btn btn-ghost w-full btn-sm" @click="emit('success')">
        {{ t('auth.twoFactor.contactAdmin') }}
      </button>
    </form>

    <!-- Done -->
    <div v-else-if="step === 'done'" class="text-center space-y-4">
      <div class="flex justify-center">
        <svg
          class="w-14 h-14 text-success"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <p class="font-semibold">{{ t('auth.twoFactor.recoverySuccess2') }}</p>
      <p class="text-sm text-text-muted">{{ t('auth.twoFactor.pleaseReSetup2fa') }}</p>
      <button type="button" class="btn btn-primary btn-sm" @click="emit('success')">
        {{ t('auth.twoFactor.done') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { t } from '~/lib/i18n';

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'back'): void;
}>();

const props = defineProps<{
  level: 'normal' | 'admin';
}>();

const DUMMY_RECOVERY_CODES = ['AAAA-BBBB-CCCC', 'DDDD-EEEE-FFFF'];

const step = ref<'verify' | 'recovery' | 'done'>('verify');
const email = ref('');
const code = ref('');
const recoveryCode = ref('');
const error = ref('');

function handleVerify() {
  if (!email.value.trim()) {
    error.value = t('auth.twoFactor.enterEmailError');
    return;
  }
  if (code.value !== '000000') {
    error.value = t('auth.twoFactor.wrongCodeError');
    return;
  }
  error.value = '';
  step.value = 'recovery';
}

function handleRecovery() {
  if (DUMMY_RECOVERY_CODES.some((c) => c === recoveryCode.value.toUpperCase().trim())) {
    step.value = 'done';
  } else {
    error.value = t('auth.twoFactor.invalidRecoveryCode');
  }
}
</script>
