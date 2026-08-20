<template>
  <div class="article-comments">
    <h3 class="text-lg font-semibold mb-4">
      {{ t("blog.comments") }}
      <span v-if="comments.length" class="text-sm text-text-muted font-normal">
        ({{ comments.length }})
      </span>
    </h3>

    <!-- 评论输入表单 -->
    <BlogCommentForm
      :reply-to="replyToLabel"
      :is-logged-in="auth.isLoggedIn"
      :submitting="submitting"
      @submit="submitComment"
      @cancel="replyTarget = null"
    />

    <!-- 评论列表 -->
    <div v-if="error" class="mt-4 text-red-500 text-sm">
      {{ error }}
    </div>
    <div
      v-else-if="loading && !comments.length"
      class="text-sm text-text-muted py-4"
    >
      {{ t("blog.commentsLoading") }}
    </div>
    <div v-else-if="!comments.length" class="text-sm text-text-muted py-4">
      {{ t("blog.noComments") }}
    </div>
    <CommentNode
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
      :current-user-id="auth.user?.id ?? null"
      :on-reply="startReply"
      :on-delete="deleteComment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, type PropType } from "vue";
import BlogCommentForm from "../pages/BlogCommentForm.vue";
import {
  useArticleComments,
  type ArticleCommentNode,
} from "../composables/useArticleComments";
import { useAuthStore } from "~/stores/auth";
import { avatarUrl } from "~/lib/utils/avatars";
import { t } from "~/lib/i18n";

const props = defineProps<{ slug: string }>();

const auth = useAuthStore();
const { comments, loading, error, fetch, add, remove } = useArticleComments(
  props.slug,
);
const submitting = ref(false);
// 回复目标：仅一层 parent_id（照 blog series 惯例，不无限嵌套）
const replyTarget = ref<number | null>(null);

// 后端 ArticleCommentInfo 不含作者昵称，回复提示用一个通用文案
const replyToLabel = computed(() =>
  replyTarget.value === null ? "" : t("blog.comments"),
);

fetch();

function startReply(commentId: number) {
  replyTarget.value = commentId;
}

async function submitComment(content: string) {
  submitting.value = true;
  try {
    if (replyTarget.value !== null) {
      await add({ content, parent_id: replyTarget.value });
    } else {
      await add({ content });
    }
  } finally {
    submitting.value = false;
    replyTarget.value = null;
  }
}

async function deleteComment(commentId: number) {
  await remove(commentId);
}

// ── 递归评论节点（局部组件，沿父节点 children 向下渲染） ──
const CommentNode = {
  name: "ArticleCommentNode",
  props: {
    comment: { type: Object as PropType<ArticleCommentNode>, required: true },
    currentUserId: { type: Number, default: null },
    onReply: {
      type: Function as PropType<(id: number) => void>,
      required: true,
    },
    onDelete: {
      type: Function as PropType<(id: number) => void>,
      required: true,
    },
  },
  setup(props) {
    // 作者昵称兜底：有 profile 用 nickname，否则回退到用户 ID
    const authorName = () =>
      props.comment.profile?.nickname ?? `用户-${props.comment.user_id}`;
    // 头像 URL（复用 avatarUrl 工具把后端的 avatarKey 映射为 /api/v1/avatars/*.webp）
    const authorAvatar = () =>
      avatarUrl(props.comment.profile?.avatar ?? undefined);
    return () =>
      h("div", { class: "border-b border-border pb-4" }, [
        h("div", { class: "flex items-start gap-3" }, [
          props.comment.profile?.avatar
            ? h("img", {
                src: authorAvatar(),
                class: "w-8 h-8 rounded-full shrink-0 object-cover",
                alt: authorName(),
              })
            : h(
                "div",
                {
                  class:
                    "w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium shrink-0",
                },
                authorName()[0] ?? "?",
              ),
          h("div", { class: "flex-1" }, [
            h("div", { class: "flex items-center gap-2" }, [
              h("span", { class: "font-medium text-sm" }, authorName()),
              h(
                "span",
                { class: "text-xs text-text-muted" },
                formatDate(props.comment.created_at),
              ),
            ]),
            h("p", { class: "mt-1 text-sm" }, props.comment.content),
            h("div", { class: "flex gap-3 mt-2" }, [
              h(
                "button",
                {
                  class: "text-xs text-primary hover:underline",
                  onClick: () => props.onReply(props.comment.id),
                },
                t("blog.reply"),
              ),
              props.currentUserId !== null &&
              props.currentUserId === props.comment.user_id
                ? h(
                    "button",
                    {
                      class: "text-xs text-red-500 hover:underline",
                      onClick: () => props.onDelete(props.comment.id),
                    },
                    t("common.delete"),
                  )
                : null,
            ]),
          ]),
        ]),
        props.comment.children && props.comment.children.length > 0
          ? h(
              "div",
              { class: "ml-8 mt-3 space-y-4" },
              props.comment.children.map((child) =>
                h(CommentNode, {
                  comment: child,
                  currentUserId: props.currentUserId,
                  onReply: props.onReply,
                  onDelete: props.onDelete,
                }),
              ),
            )
          : null,
      ]);
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>
