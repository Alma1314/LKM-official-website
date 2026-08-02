import { get, post, del } from '~/core/http/client';
import { ok, err } from '~/core/errors/result';
import type { Result } from '~/core/errors/result';
import type { AppError } from '~/core/errors/error-codes';
import type {
  ApiResponse,
  ListData,
  BlogSeriesInfo,
  BlogSeriesDetail,
  GitFileContent,
  BlogCommentInfo,
  BlogStarStatus,
  BlogCommentCreate,
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
  };
}
