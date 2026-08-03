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

export function useBlogApi() {
  /** 获取所有 Series 列表 */
  async function listSeries(): Promise<Result<ListData<BlogSeriesInfo>, AppError>> {
    return get<ListData<BlogSeriesInfo>>(BLOG_API.series.list);
  }

  /** 获取单个 Series 详情（含 file_tree） */
  async function getSeriesDetail(id: number): Promise<Result<BlogSeriesDetail, AppError>> {
    const result = await get<ApiResponse<BlogSeriesDetail>>(BLOG_API.series.detail(id));
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  }

  /** 获取文件内容（Markdown 原文） */
  async function getFileContent(seriesId: number, filepath: string): Promise<Result<GitFileContent, AppError>> {
    const result = await get<ApiResponse<GitFileContent>>(BLOG_API.files.get(seriesId, filepath));
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  }

  /** 获取评论列表 */
  async function listComments(seriesId: number): Promise<Result<ListData<BlogCommentInfo>, AppError>> {
    return get<ListData<BlogCommentInfo>>(BLOG_API.comments.list(seriesId));
  }

  /** 创建评论（需认证） */
  async function createComment(seriesId: number, data: BlogCommentCreate): Promise<Result<BlogCommentInfo, AppError>> {
    const result = await post<ApiResponse<BlogCommentInfo>>(BLOG_API.comments.create(seriesId), data, {
      headers: getAuthHeaders(),
    });
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  }

  /** 删除评论（需认证，仅作者可操作） */
  async function deleteComment(seriesId: number, commentId: number): Promise<Result<null, AppError>> {
    return del<null>(BLOG_API.comments.delete(seriesId, commentId), {
      headers: getAuthHeaders(),
    });
  }

  /** 获取文章列表（分页） */
  async function listArticles(page = 1): Promise<Result<PaginatedData<BlogArticleInfo>, AppError>> {
    return get<PaginatedData<BlogArticleInfo>>(`${BLOG_API.articles.list}?page=${page}`);
  }

  /** 获取文章详情 */
  async function getArticleDetail(slug: string): Promise<Result<BlogArticleDetail, AppError>> {
    const result = await get<ApiResponse<BlogArticleDetail>>(BLOG_API.articles.detail(slug));
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  }

  /** 获取分类列表 */
  async function listCategories(): Promise<Result<ListData<BlogCategoryInfo>, AppError>> {
    return get<ListData<BlogCategoryInfo>>(BLOG_API.categories.list);
  }

  /** 获取标签列表 */
  async function listTags(): Promise<Result<ListData<BlogTagInfo>, AppError>> {
    return get<ListData<BlogTagInfo>>(BLOG_API.tags.list);
  }

  /** 搜索文章 */
  async function search(q: string): Promise<Result<ListData<BlogSearchResult>, AppError>> {
    return get<ListData<BlogSearchResult>>(`${BLOG_API.search.query}?q=${encodeURIComponent(q)}`);
  }

  /** 获取关于页内容 */
  async function getAbout(): Promise<Result<BlogAboutInfo, AppError>> {
    const result = await get<ApiResponse<BlogAboutInfo>>(BLOG_API.about.get);
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  }

  /** 切换 Star 状态（需认证） */
  async function toggleStar(seriesId: number): Promise<Result<BlogStarStatus, AppError>> {
    const result = await post<ApiResponse<BlogStarStatus>>(BLOG_API.star.toggle(seriesId), undefined, {
      headers: getAuthHeaders(),
    });
    return result.match(
      (value) => ok(value.data),
      (e) => err(e)
    );
  }

  return {
    listSeries,
    getSeriesDetail,
    getFileContent,
    listComments,
    createComment,
    deleteComment,
    toggleStar,
    listArticles,
    getArticleDetail,
    listCategories,
    listTags,
    search,
    getAbout,
  };
}
