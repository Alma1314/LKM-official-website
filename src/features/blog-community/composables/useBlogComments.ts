import { ref, type Ref } from 'vue';
import { useBlogApi } from './useBlogApi';
import type { BlogCommentInfo, BlogCommentCreate } from '../types/blog';

export function useBlogComments(seriesId: number) {
  const comments: Ref<BlogCommentInfo[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const api = useBlogApi();

  async function fetch() {
    loading.value = true;
    error.value = null;
    const result = await api.listComments(seriesId);
    if (result.isErr()) {
      error.value = result.error.message;
    } else {
      comments.value = result.value.items;
    }
    loading.value = false;
  }

  async function addComment(data: BlogCommentCreate) {
    const result = await api.createComment(seriesId, data);
    if (result.isErr()) {
      return result;
    }
    await fetch();
    return result;
  }

  async function removeComment(commentId: number) {
    const result = await api.deleteComment(seriesId, commentId);
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
