<template>
  <div
    class="relative rounded-2xl bg-[var(--card-bg)] shadow-2xl border border-[var(--surface-3)] p-6 sm:p-8"
    style="position: relative"
  >
    <button
      type="button"
      class="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
      aria-label="关闭"
      @click="close"
    >
      &#10005;
    </button>
    <LoginPage />
  </div>
</template>

<script setup lang="ts">
import LoginPage from './LoginPage.vue';

function close() {
  window.dispatchEvent(new CustomEvent('close-login-modal'));
}
</script>
