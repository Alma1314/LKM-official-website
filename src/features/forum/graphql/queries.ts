import { graphql } from "~/lib/api/graphql";
import type { TypedDocumentNode } from "@urql/core";

export interface GqlPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  isPinned: boolean;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  forwardCount: number;
  createdAt: string;
  author: {
    id: number;
    displayName: string;
    avatar: string;
    username: string;
  } | null;
}

export interface GqlPostConnection {
  items: GqlPost[];
  total: number;
}

export const PostListQuery = graphql(`
  query PostList($categoryId: ID, $page: Int!, $pageSize: Int!) {
    posts(categoryId: $categoryId, page: $page, pageSize: $pageSize) {
      total
      items {
        id
        title
        excerpt
        categoryId
        tags
        isPinned
        isFeatured
        viewCount
        likeCount
        commentCount
        createdAt
        author {
          id
          displayName
          avatar
          username
        }
      }
    }
  }
`) as TypedDocumentNode<
  { posts: GqlPostConnection },
  { categoryId?: string; page: number; pageSize: number }
>;

export const PostDetailQuery = graphql(`
  query PostDetail($id: ID!) {
    post(id: $id) {
      id
      title
      content
      excerpt
      categoryId
      tags
      isPinned
      isFeatured
      viewCount
      likeCount
      commentCount
      bookmarkCount
      forwardCount
      createdAt
      author {
        id
        displayName
        avatar
        username
        bio
      }
    }
  }
`) as TypedDocumentNode<{ post: GqlPost | null }, { id: number }>;
