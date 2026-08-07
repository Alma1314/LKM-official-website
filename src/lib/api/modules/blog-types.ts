// src/lib/api/modules/blog-types.ts
// Blog 模块的类型定义 — 从 features/blog-community/types/blog.ts 迁移

export interface BlogSeriesInfo {
  id: number;
  owner_id: number;
  title: string;
  description: string | null;
  cover_url: string | null;
  repo_name: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  star_count: number;
  is_starred: boolean;
}

export interface BlogSeriesDetail extends BlogSeriesInfo {
  file_tree: FileTreeNode[] | null;
}

export interface FileTreeNode {
  name: string;
  type: 'blob' | 'tree';
  children?: FileTreeNode[];
}

export interface GitFileContent {
  filepath: string;
  content: string;
}

export interface BlogCommentInfo {
  id: number;
  user_id: number;
  series_id: number;
  content: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  profile: {
    nickname: string;
    avatar: string | null;
    role: string;
  };
  replies: BlogCommentInfo[];
}

export interface BlogStarStatus {
  starred: boolean;
  star_count: number;
}

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface ListData<T> {
  items: T[];
}

export interface BlogArticle {
  seriesId: number;
  seriesTitle: string;
  seriesDescription: string | null;
  seriesCover: string | null;
  filepath: string;
  filename: string;
}

export interface BlogCommentCreate {
  content: string;
  parent_id?: number | null;
}

export interface BlogArticleInfo {
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: string | null;
  tags: string[];
  published: string;
  updated: string | null;
  word_count: number;
  reading_time: number;
}

export interface BlogArticleDetail extends BlogArticleInfo {
  content: string;
  prev_article: { slug: string; title: string } | null;
  next_article: { slug: string; title: string } | null;
}

export interface BlogCategoryInfo {
  slug: string;
  name: string;
  article_count: number;
}

export interface BlogTagInfo {
  slug: string;
  name: string;
  article_count: number;
}

export interface BlogSearchResult {
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  published: string;
}

export interface BlogAboutInfo {
  content: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
