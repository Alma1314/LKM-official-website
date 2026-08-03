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
    <button
      aria-label="通知"
      class="btn-plain scale-animation rounded-lg w-11 h-11 active:scale-90 relative"
      @click="toggle"
    >
      <Icon icon="material-symbols:notifications-outline" class="text-[1.25rem]" />
      <span
        v-if="unreadCount > 0"
        class="absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto card-base float-panel p-2 z-50 shadow-2xl"
      @click.stop
    >
      <div class="flex items-center justify-between px-3 py-2 border-b border-surface-3 mb-1">
        <span class="font-semibold text-sm text-deep-text">通知</span>
        <button v-if="unreadCount > 0" class="text-xs text-primary hover:underline" @click="markAllAsRead">
          全部已读
        </button>
      </div>

      <div v-if="notifications.length === 0" class="px-3 py-6 text-center text-sm text-text-muted">暂无通知</div>
      <button
        v-for="n in notifications"
        :key="n.id"
        class="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-page-bg transition-colors group"
        :class="{ 'opacity-70': n.isRead }"
        @click="markAsRead(n.id)"
      >
        <span
          class="shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center"
          :class="n.isRead ? 'bg-surface-3 text-text-muted' : 'bg-primary/10 text-primary'"
        >
          <Icon :icon="getIcon(n.type)" class="w-4 h-4" />
        </span>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-deep-text truncate">{{ n.title }}</div>
          <div class="text-xs text-text-muted mt-0.5 line-clamp-2">{{ n.content }}</div>
          <div class="text-xs text-text-muted/60 mt-1">{{ timeAgo(n.createdAt) }}</div>
        </div>
        <span v-if="!n.isRead" class="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5"></span>
      </button>
    </div>
  </div>
</template>
