// 官方文章（/api/v1/articles）SSR 数据访问层
//
// 官方站点文章列表/详情页使用真实后端的 /api/v1/articles 端点（经 API_URL 直连）。
// 此处提供统一的类型与聚合函数，供 文章列表 / 所有分类 / 归档 / 新闻资讯 等 SSR 页面复用。
// 与 Vue 博客（/api/v1/blog/*）相互独立。

import { ssrFetch } from '~/lib/fetch-ssr';

/** 官方文章列表项 */
export interface OfficialArticle {
  slug: string;
  title: string;
  description: string | null;
  cover: string | null;
  category: string;
  published: string;
  views: number;
  likes: number;
  comments: number;
}

/** 官方文章详情（列表项基础上含正文与互动扩展字段） */
export interface ArticleDetail extends OfficialArticle {
  bookmarks: number;
  department: string;
  publisher: string;
  content: string;
  keywords: string[];
}

/** 官方文章列表分页数据 */
export interface OfficialArticleListData {
  items: OfficialArticle[];
  total: number;
}

/** 官方文章分类 */
export interface OfficialArticleCategory {
  slug: string;
  name: string;
  article_count: number;
}

/** 后端分类 slug → 中文显示名（未知 slug 直接回退为 slug） */
export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  announcement: '公告',
  architecture: '架构',
  security: '安全',
  engineering: '工程',
  ai: 'AI',
  community: '社区',
  culture: '文化',
  news: '科技新闻',
  science: '科普相关',
};

/** 分类 slug → 显示名 */
export function categoryLabel(slug: string): string {
  return ARTICLE_CATEGORY_LABELS[slug] ?? slug;
}

/**
 * 拉取全部分页文章（用于归档 / 分类筛选等聚合场景）。
 * 最多拉取 maxPages 页，每页 pageSize 条，避免后端总文章数过多时无限请求。
 */
export async function fetchAllArticles(
  pageSize = 100,
  maxPages = 20
): Promise<{ articles: OfficialArticle[]; error: string | null }> {
  const articles: OfficialArticle[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await ssrFetch<OfficialArticleListData>(
      `/api/v1/articles?page=${page}&page_size=${pageSize}`,
      {
        fallback: null,
      }
    );

    if (error || !data) {
      return { articles, error };
    }

    articles.push(...data.items);

    if (data.items.length === 0 || articles.length >= data.total) {
      break;
    }
  }

  return { articles, error: null };
}

/**
 * 拉取官方文章分类列表。
 * 优先使用后端分类端点（/api/v1/articles/categories）；
 * 若端点不可用，则回退为根据全部文章中的 category 字段聚合统计。
 */
export async function fetchArticleCategories(): Promise<{
  categories: OfficialArticleCategory[];
  error: string | null;
}> {
  const { data, error } = await ssrFetch<{ items: OfficialArticleCategory[] } | OfficialArticleCategory[]>(
    '/api/v1/articles/categories',
    { fallback: null }
  );

  if (!error && data) {
    const items = Array.isArray(data) ? data : data.items;
    if (Array.isArray(items)) {
      return { categories: items, error: null };
    }
  }

  const { articles, error: articlesError } = await fetchAllArticles();
  if (articlesError) {
    return { categories: [], error: articlesError };
  }

  const countBySlug = new Map<string, number>();
  for (const article of articles) {
    if (!article.category) continue;
    countBySlug.set(article.category, (countBySlug.get(article.category) ?? 0) + 1);
  }

  const categories = Array.from(countBySlug.entries())
    .map(([slug, count]) => ({ slug, name: categoryLabel(slug), article_count: count }))
    .sort((a, b) => b.article_count - a.article_count);

  return { categories, error: null };
}
