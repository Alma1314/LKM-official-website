<template>
  <Teleport to="body">
    <Transition name="cd-fade">
      <div
        v-if="open"
        ref="overlayRef"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="handleCancel"
      >
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/40" aria-hidden="true"></div>

        <!-- 对话框 -->
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :class="[
            'relative z-10 w-full max-w-sm rounded-2xl bg-card-bg border border-surface-3 shadow-xl p-6',
            danger ? 'border-error/30' : '',
          ]"
          tabindex="-1"
        >
          <h3 class="text-lg font-semibold mb-1">{{ title }}</h3>
          <p v-if="message" class="text-sm text-text-muted mb-5">{{ message }}</p>

          <div class="flex gap-3 justify-end">
            <button type="button" class="btn btn-ghost btn-sm" @click="handleCancel">取消</button>
            <button
              type="button"
              data-testid="confirm"
              class="btn btn-sm"
              :class="danger ? 'btn-error text-white' : 'btn-primary'"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount, nextTick, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
  }>(),
  { title: '确认操作', message: '', confirmText: '确认', cancelText: '取消', danger: false }
);

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const overlayRef = ref<HTMLElement | null>(null);

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) handleCancel();
}

// 打开后聚焦到对话框（供键盘/读屏访问），并监听 Escape 关闭
watch(
  () => props.open,
  async (val) => {
    if (val) {
      await nextTick();
      overlayRef.value?.focus();
    }
  }
);

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.cd-fade-enter-active,
.cd-fade-leave-active {
  transition: opacity 0.2s ease;
}
.cd-fade-enter-from,
.cd-fade-leave-to {
  opacity: 0;
}
</style>
