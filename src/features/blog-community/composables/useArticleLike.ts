import { ref, type Ref } from "vue";
import { blogApi } from "~/lib/api";
import type { ArticleLikeStatus } from "~/lib/api/modules/blog-types";
import type { Result } from "~/lib/errors/result";
import type { AppError } from "~/lib/errors/error-codes";

export function useArticleLike(slug: string): {
  liked: Ref<boolean>;
  likeCount: Ref<number>;
  loading: Ref<boolean>;
  setStatus: (status: { liked: boolean; like_count: number }) => void;
  toggle: () => Promise<Result<ArticleLikeStatus, AppError>>;
} {
  const liked = ref(false);
  const likeCount = ref(0);
  const loading = ref(false);

  function setStatus(status: { liked: boolean; like_count: number }): void {
    liked.value = status.liked;
    likeCount.value = status.like_count;
  }

  async function toggle(): Promise<Result<ArticleLikeStatus, AppError>> {
    loading.value = true;
    const result = await blogApi.toggleArticleLike(slug);
    if (result.isOk()) {
      setStatus(result.value);
    }
    loading.value = false;
    return result;
  }

  return {
    liked,
    likeCount,
    loading,
    setStatus,
    toggle,
  };
}
