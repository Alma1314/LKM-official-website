import { ref } from 'vue';
import { blogApi } from '~/lib/api';

export function useBlogStar(seriesId: number) {
  const starred = ref(false);
  const starCount = ref(0);
  const loading = ref(false);

  function setStatus(status: { starred: boolean; star_count: number }) {
    starred.value = status.starred;
    starCount.value = status.star_count;
  }

  async function toggle() {
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
