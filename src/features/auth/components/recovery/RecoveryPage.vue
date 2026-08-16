<template>
  <component
    :is="mode === 'modal' ? 'div' : AuthShell"
    :max-width="mode === 'modal' ? undefined : '440px'"
    :class="mode === 'modal' ? 'w-full' : undefined"
  >
    <AuthCard :title="t('recovery.title')" :subtitle="t('recovery.subtitle')" :mode="mode">
      <RecoveryFlow @login="switchToLogin" />
    </AuthCard>
  </component>
</template>

<script setup lang="ts">
import { t } from '~/lib/i18n';
import AuthShell from '../shared/AuthShell.vue';
import AuthCard from '../shared/AuthCard.vue';
import RecoveryFlow from './RecoveryFlow.vue';

withDefaults(defineProps<{ mode?: 'page' | 'modal' }>(), { mode: 'page' });

function switchToLogin() {
  window.dispatchEvent(new CustomEvent('close-auth-modal'));
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { view: 'login' } }));
  }, 150);
}
</script>
