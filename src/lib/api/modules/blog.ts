import { get, post, del } from "../../http/client";
import { ok, err } from "../../errors/result";
import type { Result } from "../../errors/result";
import type { AppError } from "../../errors/error-codes";
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
  ArticleCommentInfo,
  ArticleLikeStatus,
  ArticleCommentCreate,
  BlogArticleInfo,
  BlogArticleDetail,
  BlogCategoryInfo,
  BlogTagInfo,
  BlogSearchResult,
  BlogAboutInfo,
} from "./blog-types";
import { BLOG_API } from "./blog-constants";

export type {
  BlogSeriesInfo,
  BlogSeriesDetail,
  GitFileContent,
  BlogCommentInfo,
  BlogStarStatus,
  BlogCommentCreate,
  ArticleCommentInfo,
  ArticleLikeStatus,
  ArticleCommentCreate,
  BlogArticleInfo,
  BlogArticleDetail,
  BlogCategoryInfo,
  BlogTagInfo,
  BlogSearchResult,
  BlogAboutInfo,
  FileTreeNode,
  BlogArticle,
  ApiResponse,
  ListData,
  PaginatedData,
} from "./blog-types";

// ---- 原有 simple blog API ----

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  lang: string;
  published: string;
  updated?: string;
  draft?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const blogPostApi = {
  getPosts: (page = 1, limit = 20) =>
    get<PaginatedResponse<BlogPost>>("/api/blog/posts", { page, limit }),

  getPostBySlug: (slug: string) => get<BlogPost>(`/api/blog/posts/${slug}`),
};

// ---- 合并后的完整 blogApi（从 feature-local blogApi 迁移） ----

/** 博客 REST API — 纯函数对象，不包含 Vue 响应式状态 */
export const blogApi = {
  // ── 系列 ──
  listSeries: () => get<ListData<BlogSeriesInfo>>(BLOG_API.series.list),

  getSeriesDetail: async (
    id: number,
  ): Promise<Result<BlogSeriesDetail, AppError>> => {
    const result = await get<ApiResponse<BlogSeriesDetail>>(
      BLOG_API.series.detail(id),
    );
    return result.match(
      (value) => ok(value.data),
      (e) => err(e),
    );
  },

  // ── 文件 ──
  getFileContent: async (
    seriesId: number,
    filepath: string,
  ): Promise<Result<GitFileContent, AppError>> => {
    const result = await get<ApiResponse<GitFileContent>>(
      BLOG_API.files.get(seriesId, filepath),
    );
    return result.match(
      (value) => ok(value.data),
      (e) => err(e),
    );
  },

  // ── 评论 ──
  listComments: (seriesId: number) =>
    get<ListData<BlogCommentInfo>>(BLOG_API.comments.list(seriesId)),

  createComment: async (
    seriesId: number,
    data: BlogCommentCreate,
  ): Promise<Result<BlogCommentInfo, AppError>> => {
    const result = await post<ApiResponse<BlogCommentInfo>>(
      BLOG_API.comments.create(seriesId),
      data,
    );
    return result.match(
      (value) => ok(value.data),
      (e) => err(e),
    );
  },

  deleteComment: (seriesId: number, commentId: number) =>
    del<null>(BLOG_API.comments.delete(seriesId, commentId)),

  // ── 文章（对齐后端真实 /api/v1/articles，返回契约沿用 BlogArticleInfo）──
  listArticles: (page = 1, pageSize = 20) =>
    get<PaginatedData<BlogArticleInfo>>(BLOG_API.articles.list, {
      page,
      page_size: pageSize,
    }),

  getArticleDetail: async (
    slug: string,
  ): Promise<Result<BlogArticleDetail, AppError>> => {
    const result = await get<ApiResponse<BlogArticleDetail>>(
      BLOG_API.articles.detail(slug),
    );
    return result.match(
      (value) => ok(value.data),
      (e) => err(e),
    );
  },

  // ── 分类 & 标签 ──
  listCategories: () =>
    get<ListData<BlogCategoryInfo>>(BLOG_API.categories.list),

  listTags: () => get<ListData<BlogTagInfo>>(BLOG_API.tags.list),

  // ── 搜索 ──
  searchArticles: (q: string) =>
    get<ListData<BlogSearchResult>>(
      `${BLOG_API.search.query}?q=${encodeURIComponent(q)}`,
    ),

  // ── 关于 ──
  getAbout: async (): Promise<Result<BlogAboutInfo, AppError>> => {
    const result = await get<ApiResponse<BlogAboutInfo>>(BLOG_API.about.get);
    return result.match(
      (value) => ok(value.data),
      (e) => err(e),
    );
  },

  // ── 收藏 ──
  toggleStar: async (
    seriesId: number,
  ): Promise<Result<BlogStarStatus, AppError>> => {
    const result = await post<ApiResponse<BlogStarStatus>>(
      BLOG_API.star.toggle(seriesId),
    );
    return result.match(
      (value) => ok(value.data),
      (e) => err(e),
    );
  },

  // ── 文章评论与点赞（/api/v1/articles/*）──
  listArticleComments: (slug: string) =>
    get<ListData<ArticleCommentInfo>>(BLOG_API.articles.comments.list(slug)),

  createArticleComment: async (
    slug: string,
    data: ArticleCommentCreate,
  ): Promise<Result<ArticleCommentInfo, AppError>> => {
    const result = await post<ApiResponse<ArticleCommentInfo>>(
      BLOG_API.articles.comments.create(slug),
      data,
    );
    return result.match(
      (value) => ok(value.data),
      (e) => err(e),
    );
  },

  deleteArticleComment: (commentId: number) =>
    del<null>(BLOG_API.articles.comments.delete(commentId)),

  toggleArticleLike: async (
    slug: string,
  ): Promise<Result<ArticleLikeStatus, AppError>> => {
    const result = await post<ApiResponse<ArticleLikeStatus>>(
      BLOG_API.articles.like(slug),
    );
    return result.match(
      (value) => ok(value.data),
      (e) => err(e),
    );
  },
};
