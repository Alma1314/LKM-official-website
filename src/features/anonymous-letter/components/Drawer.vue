<template>
  <!-- 平滑滑入抽屉（右侧） -->
  <teleport to="body">
    <transition name="drawer-mask">
      <div v-if="modelValue" class="drawer-mask" @click.self="$emit('update:modelValue', false)">
        <transition name="drawer" appear>
          <aside v-if="modelValue" class="drawer glass" :class="side">
            <header class="drawer-head">
              <b>{{ title }}</b>
              <button class="drawer-close" @click="$emit('update:modelValue', false)">✕</button>
            </header>
            <div class="drawer-body">
              <slot />
            </div>
          </aside>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
defineProps({ modelValue: Boolean, title: { type: String, default: '' }, side: { type: String, default: 'right' } });
defineEmits(['update:modelValue']);
</script>

<style scoped>
.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: var(--mask);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: flex-end;
}
.drawer {
  width: min(420px, 92vw);
  height: 100%;
  border-radius: 0;
  border-top-left-radius: var(--radius);
  border-bottom-left-radius: var(--radius);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(26px);
}
.drawer.left {
  margin-right: auto;
  border-radius: 0;
  border-top-right-radius: var(--radius);
  border-bottom-right-radius: var(--radius);
}
.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--card-border);
  font-size: 16px;
}
.drawer-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  color: var(--text-main);
  font-size: 14px;
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
}
</style>
