<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import { blogApi } from "~/lib/api";
import type { BlogSeriesDetail } from "../types/blog";
import { t } from "~/lib/i18n";

const props = defineProps<{
  seriesId: number;
}>();

const series = ref<BlogSeriesDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const auth = useAuthStore();
const isOwner = computed<boolean>(() => {
  if (!series.value) return false;
  if (!auth.user?.id) return false;
  return Number(auth.user.id) === series.value.owner_id;
});

// 新建文章：进入 Git 系列编辑器（新建模式，无 path）
function goCreate() {
  window.location.href = `/editor?seriesId=${props.seriesId}`;
}

// 编辑指定文件：进入 Git 系列编辑器（编辑模式，带 path）
function goEdit(filepath: string) {
  window.location.href = `/editor?seriesId=${props.seriesId}&path=${encodeURIComponent(
    filepath,
  )}`;
}

async function load() {
  loading.value = true;
  error.value = null;
  const result = await blogApi.getSeriesDetail(props.seriesId);
  if (result.isErr()) {
    error.value = result.error.message;
    loading.value = false;
    return;
  }
  series.value = result.value;
  loading.value = false;
}

onMounted(load);

function isMarkdown(name: string) {
  return /\.(md|mdx)$/i.test(name);
}

function fileLink(filepath: string) {
  return `/blog/series/${props.seriesId}/${filepath}`;
}
</script>

<template>
  <div v-if="loading" class="flex justify-center py-16">
    <div
      class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
    />
  </div>

  <div v-else-if="error" class="text-center py-16">
    <p class="text-red-500 mb-4">{{ error }}</p>
    <button
      class="btn-plain rounded-lg px-4 py-2 bg-primary text-white"
      @click="load"
    >
      {{ t("common.retry") }}
    </button>
  </div>

  <div v-else-if="series" class="blog-series">
    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold">{{ series.title }}</h1>
          <p v-if="series.description" class="mt-2 text-text-muted">
            {{ series.description }}
          </p>
          <div class="flex items-center gap-4 mt-3 text-sm text-text-muted">
            <span>{{ t("blog.starCount", { count: series.star_count }) }}</span>
            <span>{{
              series.status === "active"
                ? t("blog.seriesActive")
                : t("blog.seriesArchived")
            }}</span>
          </div>
        </div>
        <button
          v-if="isOwner"
          class="btn-primary btn-sm rounded-lg px-4 py-2 bg-primary text-white whitespace-nowrap"
          @click="goCreate"
        >
          {{ t("blog.newArticle") }}
        </button>
      </div>
    </div>

    <div v-if="series.file_tree && series.file_tree.length > 0" class="mt-8">
      <h2 class="text-xl font-semibold mb-4">
        {{ t("blog.articleListTitle") }}
      </h2>
      <ul class="space-y-2">
        <li v-for="node in series.file_tree" :key="node.name">
          <div v-if="node.type === 'tree' && node.children">
            <p class="text-sm font-medium text-text-muted mb-1">
              {{ node.name }}
            </p>
            <ul class="ml-4 space-y-1">
              <li v-for="child in node.children" :key="child.name" class="flex items-center gap-2">
                <router-link
                  v-if="isMarkdown(child.name)"
                  :to="fileLink(`${node.name}/${child.name}`)"
                  class="text-primary hover:underline"
                >
                  {{ child.name.replace(/\.(md|mdx)$/i, "") }}
                </router-link>
                <span v-else class="text-text-muted">{{ child.name }}</span>
                <button
                  v-if="isOwner && isMarkdown(child.name)"
                  class="text-text-muted text-xs underline hover:text-primary"
                  @click="goEdit(`${node.name}/${child.name}`)"
                >
                  {{ t("blog.editArticle") }}
                </button>
              </li>
            </ul>
          </div>
          <router-link
            v-else-if="isMarkdown(node.name)"
            :to="fileLink(node.name)"
            class="text-primary hover:underline"
          >
            {{ node.name.replace(/\.(md|mdx)$/i, "") }}
          </router-link>
          <button
            v-if="isOwner && isMarkdown(node.name)"
            class="text-text-muted text-xs underline hover:text-primary ml-2"
            @click="goEdit(node.name)"
          >
            {{ t("blog.editArticle") }}
          </button>
        </li>
      </ul>
    </div>

    <div v-else class="mt-8 text-text-muted">
      <p>{{ t("blog.seriesEmpty") }}</p>
    </div>
  </div>
</template>
