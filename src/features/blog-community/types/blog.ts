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
