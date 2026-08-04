import { get, post, del } from '~/lib/http/client';
import { ok, err } from '~/lib/errors/result';
import type { Result } from '~/lib/errors/result';
import type { AppError } from '~/lib/errors/error-codes';
import type {
  ApiResponse,
  ListData,
  PaginatedData,
  BlogSeriesInfo,
  BlogSeriesDetail,
  GitFileContent,
  BlogCommentInfo,
  BlogStarStatus,
  BlogCommentCreate,
  BlogArticleInfo,
  BlogArticleDetail,
  BlogCategoryInfo,
  BlogTagInfo,
  BlogSearchResult,
  BlogAboutInfo,
} from '../types/blog';
import { BLOG_API } from '../constants/blog-api';

function getAuthHeaders(): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  const token = localStorage.getItem('lkm-auth-token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/** 博客 REST API — 纯函数对象，不包含 Vue 响应式状态 */
export const blogApi = {
  listSeries: () => get<ListData<BlogSeriesInfo>>(BLOG_API.series.list),

  getSeriesDetail: async (id: number): Promise<Result<BlogSeriesDetail, AppError>> => {
    const result = await get<ApiResponse<BlogSeriesDetail>>(BLOG_API.series.detail(id));
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  },

  getFileContent: async (seriesId: number, filepath: string): Promise<Result<GitFileContent, AppError>> => {
    const result = await get<ApiResponse<GitFileContent>>(BLOG_API.files.get(seriesId, filepath));
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  },

  listComments: (seriesId: number) => get<ListData<BlogCommentInfo>>(BLOG_API.comments.list(seriesId)),

  createComment: async (seriesId: number, data: BlogCommentCreate): Promise<Result<BlogCommentInfo, AppError>> => {
    const result = await post<ApiResponse<BlogCommentInfo>>(BLOG_API.comments.create(seriesId), data, {
      headers: getAuthHeaders(),
    });
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  },

  deleteComment: (seriesId: number, commentId: number) =>
    del<null>(BLOG_API.comments.delete(seriesId, commentId), {
      headers: getAuthHeaders(),
    }),

  listArticles: (page = 1) => get<PaginatedData<BlogArticleInfo>>(`${BLOG_API.articles.list}?page=${page}`),

  getArticleDetail: async (slug: string): Promise<Result<BlogArticleDetail, AppError>> => {
    const result = await get<ApiResponse<BlogArticleDetail>>(BLOG_API.articles.detail(slug));
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  },

  listCategories: () => get<ListData<BlogCategoryInfo>>(BLOG_API.categories.list),

  listTags: () => get<ListData<BlogTagInfo>>(BLOG_API.tags.list),

  search: (q: string) => get<ListData<BlogSearchResult>>(`${BLOG_API.search.query}?q=${encodeURIComponent(q)}`),

  getAbout: async (): Promise<Result<BlogAboutInfo, AppError>> => {
    const result = await get<ApiResponse<BlogAboutInfo>>(BLOG_API.about.get);
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  },

  toggleStar: async (seriesId: number): Promise<Result<BlogStarStatus, AppError>> => {
    const result = await post<ApiResponse<BlogStarStatus>>(BLOG_API.star.toggle(seriesId), undefined, {
      headers: getAuthHeaders(),
    });
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  },
};
