<template>
  <div class="space-y-4">
    <h3 class="font-semibold text-deep-text">
      评论 (<span>{{ comments.length }}</span
      >)
    </h3>

    <!-- 评论输入 -->
    <div class="flex gap-3">
      <div
        class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm"
      >
        我
      </div>
      <div class="flex-1">
        <div
          v-if="replyToId"
          class="text-xs text-primary bg-primary/5 px-3 py-1.5 rounded-lg mb-2 inline-flex items-center gap-1"
        >
          回复 <span class="font-medium">@{{ replyToAuthor }}</span>
          <button class="ml-1 hover:text-red-500" @click="cancelReply">&times;</button>
        </div>
        <textarea
          v-model="newComment"
          rows="3"
          class="w-full px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-colors"
          placeholder="写下你的评论..."
          @keydown.ctrl.enter="submitComment"
        ></textarea>
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-text-muted/60">Ctrl + Enter 发送</span>
          <button
            type="button"
            class="btn-primary px-4 py-1.5 rounded-lg text-sm font-medium"
            :disabled="!newComment.trim()"
            :class="!newComment.trim() ? 'opacity-50 cursor-not-allowed' : ''"
            @click="submitComment"
          >
            发表评论
          </button>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div v-if="comments.length > 0" class="space-y-3">
      <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
        <div
          class="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center shrink-0 text-text-muted font-bold text-sm"
        >
          {{ comment.authorName.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-medium text-deep-text">{{ comment.authorName }}</span>
            <span class="text-xs text-text-muted/60">#{{ comment.floorNumber }}</span>
            <span class="text-xs text-text-muted/60">{{ formatTime(comment.createdAt) }}</span>
          </div>
          <p class="text-sm text-deep-text mt-1 leading-relaxed">{{ comment.content }}</p>
          <div class="flex items-center gap-3 mt-1.5">
            <button
              class="text-xs text-text-muted/60 hover:text-primary transition-colors inline-flex items-center gap-1"
              @click="toggleCommentLike(comment.id)"
            >
              <Icon
                :icon="
                  likedComments.has(comment.id) ? 'material-symbols:favorite' : 'material-symbols:favorite-outline'
                "
                class="w-3.5 h-3.5"
                :class="likedComments.has(comment.id) ? 'text-red-500' : ''"
              />
              {{ likedComments.has(comment.id) ? comment.likeCount + 1 : comment.likeCount || '' }}
            </button>
            <button
              class="text-xs text-text-muted/60 hover:text-primary transition-colors"
              @click="startReply(comment.id, comment.authorName)"
            >
              回复
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-sm text-text-muted">暂无评论，来发表第一条评论吧</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  postId: string;
}>();

interface Comment {
  id: string;
  authorName: string;
  content: string;
  floorNumber: number;
  parentId?: string;
  likeCount: number;
  createdAt: string;
}

// Load initial mock comments — in Astro this would come from server data
// For now, we use the shared mock data via a simple import
const comments = ref<Comment[]>([]);
const likedComments = ref<Set<string>>(new Set());

// We need to load mock data. In Astro with client:load, we inject via a data attribute.
import { getCommentsByPostId } from '../data/mock-posts';

// Load initial comments on mount
comments.value = [...getCommentsByPostId(props.postId)];

const newComment = ref('');
const replyToId = ref('');
const replyToAuthor = ref('');

function submitComment() {
  if (!newComment.value.trim()) return;
  const newId = `c-new-${Date.now()}`;
  const floor = comments.value.length + 1;
  comments.value.push({
    id: newId,
    authorName: '我',
    content: newComment.value.trim(),
    floorNumber: floor,
    parentId: replyToId.value || undefined,
    likeCount: 0,
    createdAt: new Date().toISOString(),
  });
  newComment.value = '';
  replyToId.value = '';
  replyToAuthor.value = '';
}

function startReply(id: string, author: string) {
  replyToId.value = id;
  replyToAuthor.value = author;
  // Focus textarea
  setTimeout(() => {
    const textarea = document.querySelector('textarea');
    textarea?.focus();
  }, 50);
}

function cancelReply() {
  replyToId.value = '';
  replyToAuthor.value = '';
}

function toggleCommentLike(id: string) {
  if (likedComments.value.has(id)) {
    likedComments.value.delete(id);
  } else {
    likedComments.value.add(id);
  }
  likedComments.value = new Set(likedComments.value);
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}
</script>
