<template>
  <!-- Form step -->
  <form v-if="flow.stage === 'form'" @submit.prevent="flow.submit()" class="space-y-4">
    <p class="text-sm text-text-muted text-center">
      {{ flow.useEmail ? t('register.normal.onlyEmail') : t('register.normal.onlyPhone') }}
    </p>
    <AuthField
      id="reg-normal-user"
      :label="t('register.normal.username')"
      :placeholder="t('register.normal.usernamePlaceholder')"
      autocomplete="username"
      v-model="flow.username"
    />
    <AuthField
      id="reg-normal-password"
      :label="t('register.normal.password')"
      type="password"
      :placeholder="t('register.normal.passwordPlaceholder')"
      autocomplete="new-password"
      v-model="flow.password"
    />
    <AuthField
      id="reg-normal-confirm"
      :label="t('register.normal.confirm')"
      type="password"
      :placeholder="t('register.normal.confirmPlaceholder')"
      autocomplete="new-password"
      v-model="flow.confirm"
    />
    <div class="flex gap-2">
      <button
        type="button"
        class="btn btn-xs"
        :class="flow.useEmail ? 'btn-primary' : 'btn-ghost'"
        @click="flow.useEmail = true"
      >
        {{ t('register.normal.useEmail') }}
      </button>
      <button
        type="button"
        class="btn btn-xs"
        :class="!flow.useEmail ? 'btn-primary' : 'btn-ghost'"
        @click="flow.useEmail = false"
      >
        {{ t('register.normal.usePhone') }}
      </button>
    </div>
    <AuthField
      :id="flow.useEmail ? 'reg-normal-email' : 'reg-normal-phone'"
      :label="flow.useEmail ? t('register.normal.email') : t('register.normal.phone')"
      :type="flow.useEmail ? 'email' : 'tel'"
      :placeholder="flow.useEmail ? t('register.normal.emailPlaceholder') : t('register.normal.phonePlaceholder')"
      :autocomplete="flow.useEmail ? 'email' : 'tel'"
      v-model="flow.contact"
    />
    <AuthStatus v-if="flow.error" type="error" :message="flow.error" />
    <button
      type="submit"
      class="btn btn-primary w-full active:scale-[0.98] transition-transform"
      :disabled="flow.loading"
    >
      <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
      <span v-else>{{ t('register.normal.sendCode') }}</span>
    </button>
  </form>

  <!-- Verify step -->
  <form v-else-if="flow.stage === 'verify'" @submit.prevent="flow.submitCode()" class="space-y-4">
    <p class="text-sm text-text-muted text-center">
      {{ flow.useEmail ? t('register.normal.codeSentEmail') : t('register.normal.codeSentPhone') }}
    </p>
    <AuthField
      id="reg-verify"
      :label="t('register.normal.code')"
      :placeholder="t('register.normal.codePlaceholder')"
      autocomplete="one-time-code"
      v-model="flow.code"
    />
    <AuthStatus v-if="flow.error" type="error" :message="flow.error" />
    <button
      type="submit"
      class="btn btn-primary w-full active:scale-[0.98] transition-transform"
      :disabled="flow.loading || flow.code.length < 1"
    >
      <span v-if="flow.loading" class="loading loading-spinner loading-sm"></span>
      <span v-else>{{ t('register.normal.verifyAndFinish') }}</span>
    </button>
    <button type="button" class="btn btn-ghost w-full btn-sm" @click="flow.reset()">
      {{ t('register.normal.backToEdit') }}
    </button>
  </form>
</template>

<script setup lang="ts">
import type { RegisterFlow } from '~/features/auth/composables/useRegisterFlow';
import { t } from '~/lib/i18n';
import AuthField from '../shared/AuthField.vue';
import AuthStatus from '../shared/AuthStatus.vue';

defineProps<{ flow: RegisterFlow }>();
</script>
