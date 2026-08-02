<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useBlogPost } from '../../composables/useBlogPost';
import { useBlogComments } from '../../composables/useBlogComments';
import { useBlogStar } from '../../composables/useBlogStar';
import { useAuth } from '~/features/auth/composables/useAuth';
import BlogCommentList from './BlogCommentList.vue';
import BlogCommentForm from './BlogCommentForm.vue';
import BlogStarButton from './BlogStarButton.vue';

const props = defineProps<{
  seriesId: number;
  filepath: string;
}>();

const { content, MDXComponent, loading: postLoading, error: postError, fetchAndCompile } = useBlogPost();
const {
  comments,
  loading: commentsLoading,
  fetch: fetchComments,
  addComment,
  removeComment,
} = useBlogComments(props.seriesId);
const { starred, starCount, loading: starLoading, setStatus, toggle: toggleStar } = useBlogStar(props.seriesId);

// Derive current user ID from auth state (persisted in localStorage)
const auth = useAuth();
const currentUserId = computed<number | null>(() => {
  if (!auth.state.isLoggedIn || !auth.state.user) return null;
  return Number(auth.state.user.id);
});

const replyParentId = ref<number | null>(null);
const submitting = ref(false);

const replyTarget = computed(() => {
  if (replyParentId.value === null) return '';
  const parent = comments.value.find((c) => c.id === replyParentId.value);
  return parent ? parent.profile.nickname : '';
});

function handleReply(parentId: number) {
  replyParentId.value = parentId;
}

async function handleDelete(commentId: number) {
  await removeComment(commentId);
}

async function handleSubmit(contentStr: string) {
  submitting.value = true;
  await addComment({
    content: contentStr,
    parent_id: replyParentId.value,
  });
  replyParentId.value = null;
  submitting.value = false;
}

async function handleStar() {
  const result = await toggleStar();
  if (result.isErr() && result.error.message.includes('401')) {
    // 引导登录
  }
}

onMounted(async () => {
  await fetchAndCompile(props.seriesId, props.filepath);
  await fetchComments();
});
</script>

<template>
  <div class="blog-post">
    <div v-if="postLoading" class="flex justify-center py-16">
      <div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>

    <div v-else-if="postError" class="text-center py-16">
      <p class="text-red-500 mb-4">{{ postError }}</p>
      <button class="btn-plain rounded-lg px-4 py-2 bg-primary text-white" @click="fetchAndCompile(seriesId, filepath)">
        重试
      </button>
    </div>

    <article v-else-if="MDXComponent" class="prose max-w-none">
      <div class="mb-6 flex items-center gap-4">
        <BlogStarButton :starred="starred" :starCount="starCount" :loading="starLoading" @toggle="handleStar" />
      </div>
      <MDXComponent />
    </article>

    <section class="mt-12 pt-8 border-t border-border">
      <h2 class="text-xl font-semibold mb-6">评论 ({{ comments.length }})</h2>
      <BlogCommentList
        v-if="comments.length > 0"
        :comments="comments"
        :onReply="handleReply"
        :onDelete="handleDelete"
        :currentUserId="currentUserId"
      />
      <p v-else-if="!commentsLoading" class="text-text-muted text-sm">暂无评论</p>
      <BlogCommentForm
        :replyTo="replyTarget"
        :isLoggedIn="!!currentUserId"
        :submitting="submitting"
        @submit="handleSubmit"
        @cancel="replyParentId = null"
      />
    </section>
  </div>
</template>
