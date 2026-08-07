<template>
  <div
    class="relative rounded-2xl bg-white dark:bg-[oklch(0.23_0.015_var(--hue,250))] shadow-2xl border border-[var(--surface-3)] p-6 sm:p-8"
  >
    <button
      type="button"
      class="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle z-10"
      aria-label="关闭"
      @click="close"
    >
      &#10005;
    </button>
    <LoginPage v-if="view === 'login'" />
    <RegisterPage v-else-if="view === 'register'" />
    <RecoveryPage v-else-if="view === 'recovery'" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import LoginPage from './login/LoginPage.vue';
import RegisterPage from './register/RegisterPage.vue';
import RecoveryPage from './recovery/RecoveryPage.vue';

const view = ref<'login' | 'register' | 'recovery'>('login');

function close() {
  window.dispatchEvent(new CustomEvent('close-auth-modal'));
}

function onOpenAuth(e: Event) {
  const detail = (e as CustomEvent).detail as { view?: string } | undefined;
  if (detail?.view && ['login', 'register', 'recovery'].includes(detail.view)) {
    view.value = detail.view as 'login' | 'register' | 'recovery';
  }
}

onMounted(() => {
  window.addEventListener('open-auth-modal', onOpenAuth);
});

onUnmounted(() => {
  window.removeEventListener('open-auth-modal', onOpenAuth);
});
</script>
