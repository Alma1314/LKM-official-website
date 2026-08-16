<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Authentication dialog"
      @keydown.esc="close"
    >
      <!-- 遮罩：点击关闭 -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        data-auth-close
        @click="close"
      ></div>

      <!-- 定位容器（居中卡片，模态卡片直接内嵌，无「卡中套卡」） -->
      <div class="relative z-10 w-full max-w-md mx-4">
        <!-- 关闭按钮：由 AuthModal 负责，不侵入卡片内部 -->
        <button
          type="button"
          class="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle z-10"
          :aria-label="t('common.close')"
          @click="close"
        >
          &#10005;
        </button>
        <slot>
          <LoginPage v-if="view === 'login'" mode="modal" />
          <RegisterPage v-else-if="view === 'register'" mode="modal" />
          <RecoveryPage v-else-if="view === 'recovery'" mode="modal" />
        </slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { t } from "~/lib/i18n";
import LoginPage from "./login/LoginPage.vue";
import RegisterPage from "./register/RegisterPage.vue";
import RecoveryPage from "./recovery/RecoveryPage.vue";

type View = "login" | "register" | "recovery";

const isOpen = ref(false);
const view = ref<View>("login");

// 触发元素：关闭后恢复焦点
let triggerElement: HTMLElement | null = null;

const VALID_VIEWS: View[] = ["login", "register", "recovery"];

function open(nextView: View = "login") {
  triggerElement =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  view.value = nextView;
  isOpen.value = true;
  // 滚动锁定
  document.body.style.overflow = "hidden";
  // 打开后聚焦首个可聚焦元素
  nextTickFocus();
}

function close() {
  if (!isOpen.value) return;
  isOpen.value = false;
  // 复原滚动
  document.body.style.overflow = "";
  // 焦点还原到触发元素
  triggerElement?.focus?.();
  triggerElement = null;
}

function nextTickFocus() {
  requestAnimationFrame(() => {
    const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
    const focusable = modal?.querySelector<HTMLElement>(
      "input, button, select, textarea, a[href], [tabindex]",
    );
    if (focusable) focusable.focus();
  });
}

function onOpenAuth(e: Event) {
  const detail = (e as CustomEvent).detail as { view?: string } | undefined;
  const target =
    detail?.view && VALID_VIEWS.includes(detail.view as View)
      ? (detail.view as View)
      : "login";
  open(target);
}

function onCloseAuth() {
  close();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value) {
    close();
  }
}

onMounted(() => {
  window.addEventListener("open-auth-modal", onOpenAuth);
  window.addEventListener("close-auth-modal", onCloseAuth);
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("open-auth-modal", onOpenAuth);
  window.removeEventListener("close-auth-modal", onCloseAuth);
  document.removeEventListener("keydown", onKeydown);
  // 卸载时确保滚动解锁
  document.body.style.overflow = "";
});
</script>
