import { ref, type Ref } from 'vue';
import { blogApi } from '~/lib/api';
import type { BlogStarStatus } from '../types/blog';
import type { Result } from '~/lib/errors/result';
import type { AppError } from '~/lib/errors/error-codes';

export function useBlogStar(seriesId: number): {
  starred: Ref<boolean>;
  starCount: Ref<number>;
  loading: Ref<boolean>;
  setStatus: (status: { starred: boolean; star_count: number }) => void;
  toggle: () => Promise<Result<BlogStarStatus, AppError>>;
} {
  const starred = ref(false);
  const starCount = ref(0);
  const loading = ref(false);

  function setStatus(status: { starred: boolean; star_count: number }): void {
    starred.value = status.starred;
    starCount.value = status.star_count;
  }

  async function toggle(): Promise<Result<BlogStarStatus, AppError>> {
    loading.value = true;
    const result = await blogApi.toggleStar(seriesId);
    if (result.isOk()) {
      setStatus(result.value);
    }
    loading.value = false;
    return result;
  }

  return {
    starred,
    starCount,
    loading,
    setStatus,
    toggle,
  };
}
