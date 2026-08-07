<template>
  <component
    :is="mode === 'modal' ? 'div' : AuthShell"
    :max-width="mode === 'modal' ? undefined : '440px'"
    :class="mode === 'modal' ? 'w-full' : undefined"
  >
    <AuthCard title="密码找回" subtitle="重置您的登录密码" :mode="mode">
      <RecoveryFlow @login="switchToLogin" />
    </AuthCard>
  </component>
</template>

<script setup lang="ts">
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
