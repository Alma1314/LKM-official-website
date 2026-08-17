// 专栏 API 客户端 — 对接后端 /api/v1/columns/*
//
// 后端 ColumnInfo/ColumnPostInfo 为 snake_case 字段，这里在客户端层
// 映射为前端 UI 直接使用的 camelCase 展示形状（对应原 mock-columns 结构）。

import { get } from "../../http/client";

/** 专栏展示形状（camelCase，由后端 ColumnInfo 映射而来）。 */
export interface Column {
  id: number;
  ownerId: number;
  title: string;
  description: string;
  slug: string | null;
  coverUrl: string | null;
  authorName: string | null;
  authorTitle: string | null;
  authorBio: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  followerCount: number;
  likeCount: number;
  subscribeCount: number;
  articleCount: number;
  tags: string[];
  badges: string[];
  boardTag: string | null;
}

/** 专栏文章展示形状（camelCase，由后端 ColumnPostInfo 映射而来）。 */
export interface ColumnArticle {
  id: number;
  columnId: number;
  authorId: number;
  title: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
}

interface BackendColumn {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  slug: string | null;
  cover_url: string | null;
  author_name: string | null;
  author_title: string | null;
  author_bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  follower_count: number;
  like_count: number;
  subscribe_count: number;
  article_count: number;
  tags: string[];
  badges: string[];
  board_tag: string | null;
}

interface BackendColumnPost {
  id: number;
  column_id: number;
  author_id: number;
  title: string;
  summary: string | null;
  content: string;
  cover_image: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

function mapColumn(b: BackendColumn): Column {
  return {
    id: b.id,
    ownerId: b.owner_id,
    title: b.title,
    description: b.description,
    slug: b.slug,
    coverUrl: b.cover_url,
    authorName: b.author_name,
    authorTitle: b.author_title,
    authorBio: b.author_bio,
    avatarUrl: b.avatar_url,
    isVerified: b.is_verified,
    followerCount: b.follower_count,
    likeCount: b.like_count,
    subscribeCount: b.subscribe_count,
    articleCount: b.article_count,
    tags: b.tags ?? [],
    badges: b.badges ?? [],
    boardTag: b.board_tag,
  };
}

function mapArticle(p: BackendColumnPost): ColumnArticle {
  return {
    id: p.id,
    columnId: p.column_id,
    authorId: p.author_id,
    title: p.title,
    summary: p.summary,
    content: p.content,
    coverImage: p.cover_image,
    viewCount: p.view_count,
    likeCount: p.like_count,
    commentCount: p.comment_count,
    publishedAt: p.published_at,
  };
}

export const columnApi = {
  getColumns: async (page = 1, limit = 50): Promise<Column[]> => {
    const res = await get<PaginatedResponse<BackendColumn>>("/api/v1/columns", {
      page,
      limit,
    });
    if (res.isErr()) return [];
    return (res.value.items ?? []).map(mapColumn);
  },

  getColumnBySlug: async (slug: string): Promise<Column | null> => {
    const res = await get<BackendColumn>(`/api/v1/columns/by-slug/${slug}`);
    if (res.isErr()) return null;
    return mapColumn(res.value);
  },

  getArticles: async (
    columnId: number,
    page = 1,
    limit = 50,
  ): Promise<ColumnArticle[]> => {
    const res = await get<PaginatedResponse<BackendColumnPost>>(
      `/api/v1/columns/${columnId}/posts`,
      { page, limit },
    );
    if (res.isErr()) return [];
    return (res.value.items ?? []).map(mapArticle);
  },

  // 便捷：按 slug 取文章（先查专栏拿 id，再取文章）
  getArticlesBySlug: async (
    slug: string,
    page = 1,
    limit = 50,
  ): Promise<ColumnArticle[]> => {
    const column = await columnApi.getColumnBySlug(slug);
    if (!column) return [];
    return columnApi.getArticles(column.id, page, limit);
  },

  // 按专栏 slug + 文章 id 取单篇文章详情（含 content 正文）
  getArticleById: async (
    slug: string,
    articleId: number,
  ): Promise<ColumnArticle | null> => {
    const column = await columnApi.getColumnBySlug(slug);
    if (!column) return null;
    const res = await get<BackendColumnPost>(
      `/api/v1/columns/${column.id}/posts/${articleId}`,
    );
    if (res.isErr()) return null;
    return mapArticle(res.value);
  },
};
