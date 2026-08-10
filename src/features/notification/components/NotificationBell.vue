<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { mockNotifications, type MockNotification } from '../data/mock-notifications';

const isOpen = ref(false);
const notifications = ref<MockNotification[]>(mockNotifications);

const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);

function toggle() {
  isOpen.value = !isOpen.value;
}

function markAsRead(id: string) {
  notifications.value = notifications.value.map((n) => (n.id === id ? { ...n, isRead: true } : n));
}

function markAllAsRead() {
  notifications.value = notifications.value.map((n) => ({ ...n, isRead: true }));
}

function getIcon(type: string): string {
  switch (type) {
    case 'reply':
      return 'material-symbols:chat-bubble-outline';
    case 'like':
      return 'material-symbols:favorite-outline';
    case 'follow':
      return 'material-symbols:person-add-outline';
    case 'system':
      return 'material-symbols:campaign-outline';
    case 'file_approved':
      return 'material-symbols:check-circle-outline';
    case 'file_rejected':
      return 'material-symbols:cancel-outline';
    default:
      return 'material-symbols:notifications-outline';
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const bell = document.getElementById('notification-bell');
  if (bell && !bell.contains(target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div id="notification-bell" class="relative">
    <!-- 铃铛触发按钮 -->
    <button
      aria-label="通知"
      class="scale-animation rounded-lg w-11 h-11 active:scale-90 relative flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      @click="toggle"
    >
      <Icon icon="material-symbols:notifications-outline" class="text-[1.25rem]" />
      <!-- 未读红点角标 -->
      <span
        v-if="unreadCount > 0"
        class="absolute top-1.5 right-1.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- 下拉通知面板 -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[oklch(0.23_0.015_var(--hue))] border border-black/5 dark:border-white/10 rounded-[var(--radius-large)] float-panel p-2 z-50 shadow-xl dark:shadow-2xl transition-all"
      @click.stop
    >
      <!-- 面板头部 -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/10 mb-1">
        <span class="font-semibold text-sm text-neutral-800 dark:text-neutral-100">通知</span>
        <button
          v-if="unreadCount > 0"
          class="text-xs text-primary hover:underline font-medium transition-colors"
          @click="markAllAsRead"
        >
          全部已读
        </button>
      </div>

      <!-- 无通知状态 -->
      <div
        v-if="notifications.length === 0"
        class="px-3 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500"
      >
        暂无通知
      </div>

      <!-- 通知列表项 -->
      <button
        v-for="n in notifications"
        :key="n.id"
        class="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors group mb-0.5"
        :class="{ 'opacity-60': n.isRead }"
        @click="markAsRead(n.id)"
      >
        <!-- 图标容器 -->
        <span
          class="shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          :class="
            n.isRead
              ? 'bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-400'
              : 'bg-primary/10 text-primary'
          "
        >
          <Icon :icon="getIcon(n.type)" class="w-4 h-4" />
        </span>

        <!-- 文本内容 -->
        <div class="flex-1 min-w-0">
          <div
            class="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate group-hover:text-primary transition-colors"
          >
            {{ n.title }}
          </div>
          <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
            {{ n.content }}
          </div>
          <div class="text-xs text-neutral-400 dark:text-neutral-500/80 mt-1">
            {{ timeAgo(n.createdAt) }}
          </div>
        </div>

        <!-- 未读原点提示 -->
        <span v-if="!n.isRead" class="shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></span>
      </button>
    </div>
  </div>
</template>
