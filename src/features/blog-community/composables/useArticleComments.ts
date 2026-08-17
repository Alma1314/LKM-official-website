import { ref, type Ref } from "vue";
import { blogApi } from "~/lib/api";
import type {
  ArticleCommentInfo,
  ArticleCommentCreate,
  ListData,
} from "~/lib/api/modules/blog-types";
import type { Result } from "~/lib/errors/result";
import type { AppError } from "~/lib/errors/error-codes";

/** 组树后的评论节点：平铺项 + 子评论（children 数组）。 */
export interface ArticleCommentNode extends ArticleCommentInfo {
  children: ArticleCommentNode[];
}

/**
 * 把后端平铺的评论列表按 parent_id 组树：
 * 顶层 parent_id == null，子级放进父节点的 children。
 * 只支持一级回复（照 blog series 惯例，不无线嵌套）。
 */
function buildCommentTree(items: ArticleCommentInfo[]): ArticleCommentNode[] {
  const byId = new Map<number, ArticleCommentNode>();
  for (const item of items) {
    byId.set(item.id, { ...item, children: [] });
  }
  const roots: ArticleCommentNode[] = [];
  for (const node of byId.values()) {
    if (node.parent_id !== null && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function useArticleComments(slug: string): {
  comments: Ref<ArticleCommentNode[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetch: () => Promise<void>;
  add: (
    data: ArticleCommentCreate,
  ) => Promise<Result<ArticleCommentInfo, AppError>>;
  remove: (commentId: number) => Promise<Result<null, AppError>>;
} {
  const comments: Ref<ArticleCommentNode[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch(): Promise<void> {
    loading.value = true;
    error.value = null;
    const result =
      await blogApi.listArticleComments(slug);
    if (result.isErr()) {
      error.value = result.error.message;
    } else {
      const data = result.value as ListData<ArticleCommentInfo>;
      comments.value = buildCommentTree(data.items ?? []);
    }
    loading.value = false;
  }

  async function add(
    data: ArticleCommentCreate,
  ): Promise<Result<ArticleCommentInfo, AppError>> {
    const result = await blogApi.createArticleComment(slug, data);
    if (result.isErr()) {
      return result;
    }
    await fetch();
    return result;
  }

  async function remove(
    commentId: number,
  ): Promise<Result<null, AppError>> {
    const result = await blogApi.deleteArticleComment(commentId);
    if (result.isErr()) {
      return result;
    }
    await fetch();
    return result;
  }

  return {
    comments,
    loading,
    error,
    fetch,
    add,
    remove,
  };
}
