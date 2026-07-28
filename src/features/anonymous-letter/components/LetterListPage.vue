<template>
  <div class="min-h-[60vh]">
    <!-- 头部 -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-amber-200">这里很安全</h1>
      <p class="text-amber-200/60 mt-2 text-sm">每一封信都会被温柔以待</p>
    </div>

    <!-- 信件流 -->
    <div class="space-y-4 max-w-lg mx-auto">
      <a
        v-for="letter in letters"
        :key="letter.id"
        :href="`${base}letters/${letter.id}`"
        class="block p-5 rounded-xl bg-gray-800/50 border border-amber-800/20 hover:border-amber-800/40 transition-colors group"
      >
        <div class="flex flex-wrap gap-1.5 mb-2">
          <span
            v-for="tag in letter.tags"
            :key="tag"
            class="text-xs px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-300"
            >{{ tag }}</span
          >
        </div>
        <h3 v-if="letter.title" class="font-medium text-gray-200 group-hover:text-amber-200 transition-colors mb-1">
          {{ letter.title }}
        </h3>
        <p class="text-sm text-gray-400 line-clamp-3 leading-relaxed">{{ letter.content }}</p>
        <div class="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>{{ formatTime(letter.createdAt) }}</span>
          <span>{{ letter.replyCount }} 封回信</span>
        </div>
      </a>
    </div>

    <!-- 写信按钮 -->
    <div class="text-center mt-8">
      <a
        :href="`${base}letters/write`"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-900/30 border border-amber-800/40 text-amber-300 hover:bg-amber-900/40 transition-colors text-sm font-medium"
      >
        <Icon icon="material-symbols:edit-outline" class="w-5 h-5" />
        写一封信
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { mockLetters } from '../data/mock-letters';

const base = import.meta.env.BASE_URL;

const letters = mockLetters;

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
