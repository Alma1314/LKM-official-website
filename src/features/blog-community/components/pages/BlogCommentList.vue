<script setup lang="ts">
import type { BlogCommentInfo } from '../../types/blog';

defineProps<{
  comments: BlogCommentInfo[];
  onReply: (parentId: number) => void;
  onDelete: (commentId: number) => void;
  currentUserId: number | null;
}>();

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<template>
  <div class="space-y-4">
    <div v-for="comment in comments" :key="comment.id" class="border-b border-border pb-4">
      <div class="flex items-start gap-3">
        <img v-if="comment.profile.avatar" :src="comment.profile.avatar" class="w-8 h-8 rounded-full" />
        <div v-else class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
          {{ comment.profile.nickname?.[0] || '?' }}
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm">{{ comment.profile.nickname }}</span>
            <span class="text-xs text-text-muted">{{ formatDate(comment.created_at) }}</span>
          </div>
          <p class="mt-1 text-sm">{{ comment.content }}</p>
          <div class="flex gap-3 mt-2">
            <button class="text-xs text-primary hover:underline" @click="onReply(comment.id)">回复</button>
            <button
              v-if="currentUserId === comment.user_id"
              class="text-xs text-red-500 hover:underline"
              @click="onDelete(comment.id)"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      <div v-if="comment.replies && comment.replies.length > 0" class="ml-8 mt-3">
        <BlogCommentList
          :comments="comment.replies"
          :onReply="onReply"
          :onDelete="onDelete"
          :currentUserId="currentUserId"
        />
      </div>
    </div>
  </div>
</template>
