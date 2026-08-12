import { ref, type Ref } from 'vue';
import { blogApi } from '~/lib/api';
import type { BlogArticle, BlogSeriesInfo } from '../types/blog';

const MDX_EXTENSIONS = /\.(md|mdx)$/i;

export function useBlogArticles(): {
  articles: Ref<BlogArticle[]>;
  seriesList: Ref<BlogSeriesInfo[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchAll: () => Promise<void>;
} {
  const articles: Ref<BlogArticle[]> = ref([]);
  const seriesList: Ref<BlogSeriesInfo[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  function extractArticles(series: BlogSeriesInfo, filepath: string): BlogArticle {
    const parts = filepath.split('/');
    return {
      seriesId: series.id,
      seriesTitle: series.title,
      seriesDescription: series.description,
      seriesCover: series.cover_url,
      filepath,
      filename: parts[parts.length - 1],
    };
  }

  function flattenFileTree(
    series: BlogSeriesInfo,
    nodes: import('../types/blog').FileTreeNode[],
    prefix = ''
  ): BlogArticle[] {
    const result: BlogArticle[] = [];
    for (const node of nodes) {
      const fullPath = prefix ? `${prefix}/${node.name}` : node.name;
      if (node.type === 'blob' && MDX_EXTENSIONS.test(node.name)) {
        result.push(extractArticles(series, fullPath));
      } else if (node.type === 'tree' && node.children) {
        result.push(...flattenFileTree(series, node.children, fullPath));
      }
    }
    return result;
  }

  async function fetchAll(): Promise<void> {
    loading.value = true;
    error.value = null;

    const listResult = await blogApi.listSeries();
    if (listResult.isErr()) {
      error.value = `获取博客系列失败：${listResult.error.message}`;
      loading.value = false;
      return;
    }

    const seriesData = listResult.value.items.filter((s) => s.status === 'active');
    seriesList.value = seriesData;

    const allArticles: BlogArticle[] = [];

    for (const series of seriesData) {
      const detailResult = await blogApi.getSeriesDetail(series.id);
      if (detailResult.isErr()) continue;
      if (!detailResult.value.file_tree) continue;

      allArticles.push(...flattenFileTree(series, detailResult.value.file_tree));
    }

    // 按文件名倒序排序（假设文件名含日期前缀如 2026-01-01.md）
    allArticles.sort((a, b) => b.filename.localeCompare(a.filename));
    articles.value = allArticles;
    loading.value = false;
  }

  return {
    articles,
    seriesList,
    loading,
    error,
    fetchAll,
  };
}
