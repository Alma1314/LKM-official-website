import { ref, type Ref } from 'vue';
import { blogApi } from '../api/blogApi';
import type { BlogCommentInfo, BlogCommentCreate } from '../types/blog';

export function useBlogComments(seriesId: number) {
  const comments: Ref<BlogCommentInfo[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    error.value = null;
    const result = await blogApi.listComments(seriesId);
    if (result.isErr()) {
      error.value = result.error.message;
    } else {
      comments.value = result.value.items;
    }
    loading.value = false;
  }

  async function addComment(data: BlogCommentCreate) {
    const result = await blogApi.createComment(seriesId, data);
    if (result.isErr()) {
      return result;
    }
    await fetch();
    return result;
  }

  async function removeComment(commentId: number) {
    const result = await blogApi.deleteComment(seriesId, commentId);
    if (result.isErr()) {
      return result;
    }
    await fetch();
    return result;
  }

  return {
    comments,
    loading,
    error,
    fetch,
    addComment,
    removeComment,
  };
}
