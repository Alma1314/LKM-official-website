<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { t } from "~/lib/i18n";
import { fetchWithCache } from "~/lib/cache-client";

/** 服务端传入的已渲染条目（publishedText 由服务端格式化，避免客户端复算 mismatch） */
interface ServerArticle {
  slug: string;
  title: string;
  description: string | null;
  cover: string | null;
  publishedText: string;
}

const props = defineProps<{
  /** 服务端 SSR 传入的数据；不传则退回浏览器 fetch */
  articles?: ServerArticle[];
}>();

const fetchedArticles = ref<ServerArticle[]>([]);
const loading = ref(true);

// 受控：有 props 直接渲染；无 props 走本地 fetch
const articles = computed<ServerArticle[]>(() => props.articles ?? fetchedArticles.value);

const DEFAULT_COVER = `${import.meta.env.BASE_URL || "/"}images/article-default.png`;
const baseUrl = import.meta.env.BASE_URL || "/";
const CACHE_KEY = "articles:latest";
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

onMounted(async () => {
  // 受控模式（已有服务端数据）无需再 fetch
  if (props.articles) {
    loading.value = false;
    return;
  }
  try {
    // 响应条目含 published 原始日期字段（与 ServerArticle 渲染形状不同）
    const { data } = await fetchWithCache<{
      items: Array<Omit<ServerArticle, "publishedText"> & { published: string }>;
      total: number;
    }>("/api/v1/articles?page=1&page_size=6", CACHE_KEY, CACHE_TTL);
    if (data?.items) {
      fetchedArticles.value = data.items.map((a) => ({
        slug: a.slug,
        title: a.title,
        description: a.description ?? null,
        cover: a.cover ?? null,
        publishedText: new Date(a.published).toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }));
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading" class="text-center py-4 text-text-muted">
    {{ t("common.loading") }}
  </div>
  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <a
      v-for="article in articles"
      :key="article.slug"
      :href="`${baseUrl}official/articles/${article.slug}`"
      class="profile-card group flex flex-col"
    >
      <div class="profile-inner h-full flex flex-col">
        <img
          :src="article.cover || DEFAULT_COVER"
          :alt="article.title"
          class="w-full h-20 object-cover"
        />
        <div class="flex flex-col flex-1 p-5">
          <h3
            class="font-semibold text-deep-text mb-2 line-clamp-2 group-hover:text-primary transition-colors"
          >
            {{ article.title }}
          </h3>
          <p
            v-if="article.description"
            class="text-sm text-text-muted line-clamp-2"
          >
            {{ article.description }}
          </p>
          <span class="text-xs text-text-muted mt-auto pt-4 block">{{
            article.publishedText
          }}</span>
        </div>
      </div>
    </a>
  </div>
</template>
