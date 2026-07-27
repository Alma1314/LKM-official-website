<template>
  <div class="max-w-lg mx-auto">
    <!-- 信件内容 -->
    <div class="p-6 rounded-xl bg-gray-800/50 border border-amber-800/20 mb-6">
      <div class="flex flex-wrap gap-1.5 mb-3">
        <span v-for="tag in letter?.tags" :key="tag" class="text-xs px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-300">{{ tag }}</span>
      </div>
      <h3 v-if="letter?.title" class="font-medium text-gray-200 mb-2">{{ letter.title }}</h3>
      <p class="text-sm text-gray-300 leading-relaxed">{{ letter?.content }}</p>
      <div class="text-xs text-gray-500 mt-3">{{ letter ? formatTime(letter.createdAt) : '' }}</div>
    </div>

    <!-- 回信列表 -->
    <h4 class="text-sm font-medium text-gray-400 mb-3">{{ replies.length }} 封回信</h4>
    <div class="space-y-3 mb-6">
      <div v-for="r in replies" :key="r.id" class="p-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
        <p class="text-sm text-gray-300 leading-relaxed">{{ r.content }}</p>
        <div class="text-xs text-gray-500 mt-2">{{ formatTime(r.createdAt) }}</div>
      </div>
      <div v-if="replies.length === 0" class="text-center py-6 text-sm text-gray-500">还没有回信，来写第一封吧</div>
    </div>

    <!-- 回信区 -->
    <div class="flex gap-2">
      <textarea v-model="replyContent" rows="2" class="flex-1 px-3 py-2 rounded-lg bg-gray-800/50 border border-amber-800/30 text-gray-200 text-sm focus:border-amber-700/50 outline-none placeholder-gray-500 resize-none" placeholder="写下你的回信..."></textarea>
      <button class="px-4 py-2 rounded-lg bg-amber-900/40 border border-amber-800/50 text-amber-300 text-sm font-medium hover:bg-amber-900/50 transition-colors shrink-0" :disabled="!replyContent.trim()" @click="sendReply">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { mockLetters, mockReplies } from '../data/mock-letters';

const props = defineProps<{ letterId: string }>();

const letter = computed(() => mockLetters.find((l) => l.id === props.letterId));
const replies = computed(() => mockReplies.filter((r) => r.letterId === props.letterId));
const replyContent = ref('');

function sendReply() {
  if (!replyContent.value.trim()) return;
  alert('回信已发送。');
  replyContent.value = '';
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}
</script>
