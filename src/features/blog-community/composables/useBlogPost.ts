import { ref, shallowRef, Fragment, type Component, type Ref } from 'vue';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from '@mdx-js/vue';
import { blogApi } from '~/lib/api';
import type { GitFileContent } from '../types/blog';

export function useBlogPost(): {
  content: Ref<GitFileContent | null>;
  MDXComponent: Ref<Component | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchAndCompile: (seriesId: number, filepath: string) => Promise<void>;
} {
  const content = ref<GitFileContent | null>(null);
  const MDXComponent = shallowRef<Component | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAndCompile(seriesId: number, filepath: string): Promise<void> {
    loading.value = true;
    error.value = null;

    const fileResult = await blogApi.getFileContent(seriesId, filepath);
    if (fileResult.isErr()) {
      error.value = fileResult.error.message;
      loading.value = false;
      return;
    }

    content.value = fileResult.value;

    try {
      const compiled = await evaluate(fileResult.value.content, {
        ...runtime,
        Fragment,
      });
      MDXComponent.value = compiled.default;
    } catch (e) {
      error.value = `MDX 编译失败: ${String(e)}`;
    }

    loading.value = false;
  }

  return {
    content,
    MDXComponent,
    loading,
    error,
    fetchAndCompile,
  };
}
