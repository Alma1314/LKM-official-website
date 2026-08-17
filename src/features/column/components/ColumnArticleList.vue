<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-deep-text">本专栏文章</h2>
      <div class="flex items-center gap-2">
        <div class="relative">
          <select
            :value="sortField"
            class="appearance-none bg-card-bg border border-surface-3 rounded-lg pl-3 pr-8 py-1.5 text-sm text-text-muted focus:outline-none focus:border-primary cursor-pointer"
            @change="onFieldChange"
          >
            <option value="like">赞同</option>
            <option value="time">发布时间</option>
          </select>
          <Icon
            icon="tabler:chevron-down"
            class="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted/60"
          />
        </div>
        <button
          class="p-1.5 rounded-lg border border-surface-3 text-text-muted hover:text-primary hover:border-primary transition-colors"
          :title="
            sortOrder === 'desc'
              ? '当前倒序，点击切换为正序'
              : '当前正序，点击切换为倒序'
          "
          @click="toggleOrder"
        >
          <Icon
            :icon="
              sortOrder === 'desc' ? 'tabler:arrow-down' : 'tabler:arrow-up'
            "
            class="w-4 h-4"
          />
        </button>
      </div>
    </div>

    <div v-if="sorted.length > 0" class="space-y-3">
      <a
        v-for="art in sorted"
        :key="art.id"
        :href="buildUrl(`/columns/${columnSlug}/${art.id}`)"
        class="profile-card group block"
      >
        <div class="profile-inner p-5">
          <h3
            class="font-semibold text-lg text-deep-text group-hover:text-primary transition-colors line-clamp-1"
          >
            {{ art.title }}
          </h3>
          <p class="text-sm text-text-muted mt-1 line-clamp-2">
            {{ art.summary }}
          </p>
          <div
            class="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-muted/60"
          >
            <span>{{ formatDate(art.publishedAt) }}</span>
            <span>{{ art.viewCount }} 阅读</span>
            <span>{{ art.likeCount }} 赞</span>
            <span>{{ art.commentCount }} 评论</span>
          </div>
        </div>
      </a>
    </div>
    <div v-else class="text-center py-12 text-text-muted text-sm">暂无文章</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import { columnApi } from "~/lib/api";
import type { ColumnArticle } from "~/lib/api/modules/column";
import { buildUrl } from "~/lib/utils/paths";
import { sortArticles, type SortField, type SortOrder } from "../utils";

const props = defineProps<{ columnSlug: string }>();

const sortField = ref<SortField>("time");
const sortOrder = ref<SortOrder>("desc");
const articles = ref<ColumnArticle[]>([]);

onMounted(async () => {
  articles.value = await columnApi.getArticlesBySlug(props.columnSlug);
});

const sorted = computed(() =>
  sortArticles(articles.value, sortField.value, sortOrder.value),
);

function onFieldChange(event: Event): void {
  sortField.value = (event.target as HTMLSelectElement).value as SortField;
}

function toggleOrder(): void {
  sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>
