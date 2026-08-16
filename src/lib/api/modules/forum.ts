import { get, post, del } from "../../http/client";
import { graphqlClient } from "../graphql/client";
import {
  PostListQuery,
  PostDetailQuery,
} from "../../../features/forum/graphql";

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  authorId: number;
  authorName: string;
  categoryId: string;
  tags: string[];
  isPinned: boolean;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  floorNumber: number;
  parentId?: string;
  likeCount: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const forumApi = {
  getPosts: (page = 1, limit = 20) =>
    get<PaginatedResponse<Post>>("/api/forum/posts", { page, limit }),

  getPost: (id: string) => get<Post>(`/api/forum/posts/${id}`),

  getComments: (postId: string, page = 1) =>
    get<PaginatedResponse<Comment>>(`/api/forum/posts/${postId}/comments`, {
      page,
    }),

  createPost: (data: {
    title: string;
    content: string;
    categoryId: string;
    tags?: string[];
  }) => post<Post>("/api/forum/posts", data),

  likePost: (id: string) => post<void>(`/api/forum/posts/${id}/like`),

  deletePost: (id: string) => del<void>(`/api/forum/posts/${id}`),

  // ---- GraphQL ----
  listPostsByCategory: (categoryId: string, page = 1, pageSize = 100) =>
    graphqlClient
      .query(PostListQuery, { categoryId, page, pageSize })
      .toPromise(),

  getPostDetail: (id: number) =>
    graphqlClient.query(PostDetailQuery, { id }).toPromise(),

  listRelatedPosts: async (
    categoryId: string,
    excludeId: number,
    limit = 3,
  ) => {
    const result = await graphqlClient
      .query(PostListQuery, { categoryId, page: 1, pageSize: limit + 1 })
      .toPromise();
    if (result.data?.posts?.items) {
      result.data.posts.items = result.data.posts.items
        .filter((p: { id: number }) => p.id !== excludeId)
        .slice(0, limit);
    }
    return result;
  },
};
