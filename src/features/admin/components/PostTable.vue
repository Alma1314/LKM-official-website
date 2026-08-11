<script setup lang="ts">
// 后台帖子管理列表 —— 接真实后端 GET /forum/posts
import { ref, onMounted, computed } from 'vue';
import { adminFetch, readAdminResp } from '~/lib/api/admin';

interface AdminPostRow {
  id: number;
  title: string;
  author_name: string;
  category_id: string;
  view_count: number;
  comment_count: number;
  created_at: string;
}

const rows = ref<AdminPostRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const error = ref('');

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: String(pageSize.value) });
    const res = await adminFetch(`/api/v1/forum/posts?${params.toString()}`);
    const body = await readAdminResp(res);
    rows.value = (body.data as { items: AdminPostRow[] }).items;
    total.value = (body.data as { total: number }).total;
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

function goTo(p: number) {
  page.value = Math.min(Math.max(1, p), totalPages.value);
  void load();
}

onMounted(() => void load());
</script>

<template>
  <div>
    <div v-if="error" class="mb-4 text-sm text-red-500">{{ error }}</div>

    <div class="bg-card-bg border border-surface-3 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-surface-3/50">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-text-muted">标题</th>
            <th class="text-left px-4 py-3 font-medium text-text-muted hidden sm:table-cell">作者</th>
            <th class="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell">板块</th>
            <th class="text-left px-4 py-3 font-medium text-text-muted">浏览</th>
            <th class="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell">评论</th>
            <th class="text-left px-4 py-3 font-medium text-text-muted">时间</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-3">
          <tr v-for="p in rows" :key="p.id" class="hover:bg-page-bg transition-colors">
            <td class="px-4 py-3 font-medium text-deep-text line-clamp-1 max-w-72">{{ p.title }}</td>
            <td class="px-4 py-3 hidden sm:table-cell text-text-muted">{{ p.author_name || '—' }}</td>
            <td class="px-4 py-3 hidden md:table-cell text-text-muted">{{ p.category_id }}</td>
            <td class="px-4 py-3 text-text-muted">{{ p.view_count }}</td>
            <td class="px-4 py-3 hidden md:table-cell text-text-muted">{{ p.comment_count }}</td>
            <td class="px-4 py-3 text-text-muted">{{ p.created_at ? p.created_at.slice(0, 10) : '—' }}</td>
          </tr>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-text-muted">暂无帖子</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between mt-4 text-sm text-text-muted">
      <span>共 {{ total }} 条 · 第 {{ page }} / {{ totalPages }} 页</span>
      <div class="flex gap-2">
        <button class="px-3 py-1.5 rounded-lg bg-surface-3 text-deep-text disabled:opacity-40" :disabled="page <= 1" @click="goTo(page - 1)">
          上一页
        </button>
        <button class="px-3 py-1.5 rounded-lg bg-surface-3 text-deep-text disabled:opacity-40" :disabled="page >= totalPages" @click="goTo(page + 1)">
          下一页
        </button>
      </div>
    </div>
  </div>
</template>
