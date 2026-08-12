import { ref, type Ref } from 'vue';
import { blogApi } from '~/lib/api';
import type { BlogCommentInfo, BlogCommentCreate } from '../types/blog';
import type { Result } from '~/lib/errors/result';
import type { AppError } from '~/lib/errors/error-codes';

export function useBlogComments(seriesId: number): {
  comments: Ref<BlogCommentInfo[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetch: () => Promise<void>;
  addComment: (data: BlogCommentCreate) => Promise<Result<BlogCommentInfo, AppError>>;
  removeComment: (commentId: number) => Promise<Result<null, AppError>>;
} {
  const comments: Ref<BlogCommentInfo[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch(): Promise<void> {
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

  async function addComment(data: BlogCommentCreate): Promise<Result<BlogCommentInfo, AppError>> {
    const result = await blogApi.createComment(seriesId, data);
    if (result.isErr()) {
      return result;
    }
    await fetch();
    return result;
  }

  async function removeComment(commentId: number): Promise<Result<null, AppError>> {
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
