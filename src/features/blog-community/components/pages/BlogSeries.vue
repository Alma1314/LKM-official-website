<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBlogApi } from '../../composables/useBlogApi';
import type { BlogSeriesDetail } from '../../types/blog';

const props = defineProps<{
  seriesId: number;
}>();

const api = useBlogApi();
const series = ref<BlogSeriesDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  const result = await api.getSeriesDetail(props.seriesId);
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
  return `/community/blog/series/${props.seriesId}/${filepath}`;
}
</script>

<template>
  <div v-if="loading" class="flex justify-center py-16">
    <div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>

  <div v-else-if="error" class="text-center py-16">
    <p class="text-red-500 mb-4">{{ error }}</p>
    <button class="btn-plain rounded-lg px-4 py-2 bg-primary text-white" @click="load">重试</button>
  </div>

  <div v-else-if="series" class="blog-series">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">{{ series.title }}</h1>
      <p v-if="series.description" class="mt-2 text-text-muted">{{ series.description }}</p>
      <div class="flex items-center gap-4 mt-3 text-sm text-text-muted">
        <span>{{ series.star_count }} 收藏</span>
        <span>{{ series.status === 'active' ? '活跃' : '已归档' }}</span>
      </div>
    </div>

    <div v-if="series.file_tree && series.file_tree.length > 0" class="mt-8">
      <h2 class="text-xl font-semibold mb-4">文章列表</h2>
      <ul class="space-y-2">
        <li v-for="node in series.file_tree" :key="node.name">
          <div v-if="node.type === 'tree' && node.children">
            <p class="text-sm font-medium text-text-muted mb-1">{{ node.name }}</p>
            <ul class="ml-4 space-y-1">
              <li v-for="child in node.children" :key="child.name">
                <router-link
                  v-if="isMarkdown(child.name)"
                  :to="fileLink(`${node.name}/${child.name}`)"
                  class="text-primary hover:underline"
                >
                  {{ child.name.replace(/\.(md|mdx)$/i, '') }}
                </router-link>
                <span v-else class="text-text-muted">{{ child.name }}</span>
              </li>
            </ul>
          </div>
          <router-link v-else-if="isMarkdown(node.name)" :to="fileLink(node.name)" class="text-primary hover:underline">
            {{ node.name.replace(/\.(md|mdx)$/i, '') }}
          </router-link>
        </li>
      </ul>
    </div>

    <div v-else class="mt-8 text-text-muted">
      <p>这个系列还没有文章</p>
    </div>
  </div>
</template>
