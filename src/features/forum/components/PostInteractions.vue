<template>
  <div class="flex items-center gap-1 border-t border-surface-3 bg-card-bg/95 backdrop-blur-sm px-2 py-2">
    <button
      class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-surface-3"
      :class="liked ? 'text-red-500' : 'text-text-muted'"
      @click="toggleLike"
    >
      <Icon :icon="liked ? 'material-symbols:favorite' : 'material-symbols:favorite-outline'" class="w-5 h-5" />
      <span>{{ formatCount(likeCount) }}</span>
    </button>

    <button
      class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-surface-3"
      :class="bookmarked ? 'text-amber-500' : 'text-text-muted'"
      @click="toggleBookmark"
    >
      <Icon :icon="bookmarked ? 'material-symbols:bookmark' : 'material-symbols:bookmark-outline'" class="w-5 h-5" />
      <span>{{ formatCount(bookmarkCount) }}</span>
    </button>

    <button
      class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-text-muted transition-colors hover:bg-surface-3"
      @click="handleShare"
    >
      <Icon icon="material-symbols:share-outline" class="w-5 h-5" />
      <span class="hidden sm:inline">{{ formatCount(forwardCount) }}</span>
    </button>

    <button
      class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-text-muted transition-colors hover:bg-surface-3 ml-auto"
      @click="showReport = true"
    >
      <Icon icon="material-symbols:flag-outline" class="w-5 h-5" />
      <span class="hidden sm:inline">举报</span>
    </button>

    <!-- 举报弹窗 -->
    <Teleport to="body">
      <div
        v-if="showReport"
        class="fixed inset-0 bg-black/40 dark:bg-black/70 z-[200] flex items-center justify-center"
        @click.self="showReport = false"
      >
        <div class="bg-card-bg rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
          <h3 class="text-lg font-semibold text-deep-text mb-4">举报帖子</h3>
          <div class="space-y-2">
            <button
              v-for="reason in reportReasons"
              :key="reason"
              class="w-full text-left px-4 py-2.5 rounded-lg text-sm text-deep-text hover:bg-surface-3 transition-colors"
              @click="submitReport(reason)"
            >
              {{ reason }}
            </button>
          </div>
          <button
            class="w-full mt-4 px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-surface-3 transition-colors"
            @click="showReport = false"
          >
            取消
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  likeCount: number;
  bookmarkCount: number;
  forwardCount: number;
}>();

const liked = ref(false);
const bookmarked = ref(false);
const showReport = ref(false);

const likeCount = ref(props.likeCount);
const bookmarkCount = ref(props.bookmarkCount);
const forwardCount = ref(props.forwardCount);

const reportReasons = ['垃圾广告', '不实信息', '人身攻击', '侵权内容', '其他违规'];

function toggleLike() {
  liked.value = !liked.value;
  likeCount.value += liked.value ? 1 : -1;
}

function toggleBookmark() {
  bookmarked.value = !bookmarked.value;
  bookmarkCount.value += bookmarked.value ? 1 : -1;
}

function handleShare() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    forwardCount.value += 1;
    alert('链接已复制到剪贴板');
  });
}

function submitReport(reason: string) {
  showReport.value = false;
  alert(`已提交举报：${reason}，我们会尽快处理。`);
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
</script>
