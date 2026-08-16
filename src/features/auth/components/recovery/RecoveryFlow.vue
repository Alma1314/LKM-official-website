<template>
  <div>
    <AuthStatus v-if="flow.error" type="error" class="mb-4" :message="flow.error" />
    <AuthStatus v-else-if="flow.successMessage" type="info" class="mb-4" :message="flow.successMessage" />

    <!-- Step 1: account -->
    <form v-if="flow.stage === 'account'" @submit.prevent="flow.requestCode()" class="space-y-4">
      <p class="text-sm text-text-muted text-center">{{ t('recovery.accountHint') }}</p>
      <!-- 联系方式类型选择 -->
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="btn btn-sm"
          :class="flow.contact === 'email' ? 'btn-primary' : 'btn-ghost'"
          @click="flow.contact = 'email'"
        >
          {{ t('recovery.useEmail') }}
        </button>
        <button
          type="button"
          class="btn btn-sm"
          :class="flow.contact === 'phone' ? 'btn-primary' : 'btn-ghost'"
          @click="flow.contact = 'phone'"
        >
          {{ t('recovery.usePhone') }}
        </button>
      </div>
      <AuthField
        id="recovery-account"
        :label="flow.contact === 'phone' ? t('recovery.phone') : t('recovery.email')"
        :placeholder="flow.contact === 'phone' ? t('recovery.phonePlaceholder') : t('recovery.emailPlaceholder')"
        :autocomplete="flow.contact === 'phone' ? 'tel' : 'email'"
        v-model="flow.account"
      />
      <button
        type="submit"
        class="btn btn-primary w-full active:scale-[0.98] transition-transform"
        :disabled="flow.loading || !flow.isContactValid"
      >
        <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
        <span v-else>{{ t('recovery.sendCode') }}</span>
      </button>
    </form>

    <!-- Step 2: verify code -->
    <form v-else-if="flow.stage === 'verify'" @submit.prevent="flow.verifyCode()" class="space-y-4">
      <AuthField
        id="recovery-code"
        :label="t('recovery.code')"
        :placeholder="t('recovery.codePlaceholder')"
        autocomplete="one-time-code"
        v-model="flow.code"
      />
      <button
        type="submit"
        class="btn btn-primary w-full active:scale-[0.98] transition-transform"
        :disabled="flow.loading || flow.code.length < 6"
      >
        <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
        <span v-else>{{ t('recovery.verifyCode') }}</span>
      </button>
      <button type="button" class="btn btn-ghost w-full btn-sm" @click="flow.reset()">{{ t('common.back') }}</button>
    </form>

    <!-- Step 2.5: 2FA (MFA 场景) -->
    <div v-else-if="flow.stage === '2fa'" class="space-y-4">
      <p class="text-sm text-text-muted text-center">{{ t('recovery.twoFactorHint') }}</p>
      <AuthField
        id="recovery-totp"
        :label="t('recovery.totp')"
        :placeholder="t('recovery.totpPlaceholder')"
        inputmode="numeric"
        v-model="totpCode"
      />
      <button
        type="button"
        class="btn btn-primary w-full active:scale-[0.98] transition-transform"
        :disabled="flow.loading || totpCode.length < 6"
        @click="flow.submit2FA(totpCode)"
      >
        <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
        <span v-else>{{ t('common.verify') }}</span>
      </button>
      <button type="button" class="btn btn-ghost w-full btn-sm" @click="flow.reset()">
        {{ t('recovery.restart') }}
      </button>
    </div>

    <!-- Step 3: reset password -->
    <form v-else-if="flow.stage === 'reset'" @submit.prevent="flow.stepReset()" class="space-y-4">
      <AuthField
        id="recovery-new"
        :label="t('recovery.newPassword')"
        type="password"
        :placeholder="t('recovery.newPasswordPlaceholder')"
        autocomplete="new-password"
        v-model="flow.newPassword"
      />
      <AuthField
        id="recovery-confirm"
        :label="t('recovery.confirmPassword')"
        type="password"
        :placeholder="t('recovery.confirmPasswordPlaceholder')"
        autocomplete="new-password"
        v-model="flow.confirm"
      />
      <button
        type="submit"
        class="btn btn-primary w-full active:scale-[0.98] transition-transform"
        :disabled="flow.loading"
      >
        <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
        <span v-else>{{ t('recovery.resetPassword') }}</span>
      </button>
      <button type="button" class="btn btn-ghost w-full btn-sm" @click="flow.reset()">{{ t('common.back') }}</button>
    </form>

    <!-- Step 4: done -->
    <div v-else class="space-y-4 text-center">
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
      <p class="text-xl font-semibold">{{ t('recovery.done') }}</p>
      <p class="text-sm text-text-muted">{{ t('recovery.loginWithNewPassword') }}</p>
      <button type="button" class="btn btn-primary w-full" @click="emit('login')">{{ t('recovery.goLogin') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRecoveryFlow } from '~/features/auth/composables/useRecoveryFlow';
import { t } from '~/lib/i18n';
import AuthField from '../shared/AuthField.vue';
import AuthStatus from '../shared/AuthStatus.vue';

const emit = defineEmits<{ (e: 'login'): void }>();

const flow = useRecoveryFlow({
  onSuccess: () => {
    emit('login');
  },
});

const totpCode = ref('');

defineExpose({ flow });
</script>
