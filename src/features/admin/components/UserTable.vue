<script setup lang="ts">
// 后台用户管理列表 —— 接真实后端 GET /admin/users（adminFetch）
import { ref, onMounted, computed } from 'vue';
import { adminFetch, readAdminResp } from '~/lib/api/admin';

interface AdminUserRow {
  id: number;
  username: string;
  account_level: string;
  is_locked: boolean;
  created_at: string;
  email: string | null;
  phone: string | null;
}

const rows = ref<AdminUserRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const keyword = ref('');
const includePii = ref(false);
const loading = ref(false);
const error = ref('');

const levelMap: Record<string, string> = { local: '本地', normal: '正式', admin: '管理员' };

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      size: String(pageSize.value),
      include_pii: String(includePii.value),
    });
    if (keyword.value.trim()) params.set('keyword', keyword.value.trim());

    const res = await adminFetch(`/api/v1/admin/users?${params.toString()}`);
    const body = await readAdminResp(res);
    rows.value = (body.data as { items: AdminUserRow[] }).items;
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
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <input
        v-model="keyword"
        type="text"
        placeholder="按用户名搜索"
        class="px-3 py-1.5 rounded-lg text-sm bg-page-bg border border-surface-3 focus:outline-none focus:border-primary"
        @keyup.enter="
          page = 1;
          load();
        "
      />
      <button
        class="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-on-primary"
        :disabled="loading"
        @click="
          page = 1;
          load();
        "
      >
        搜索
      </button>
      <label class="flex items-center gap-1.5 text-sm text-text-muted ml-auto">
        <input v-model="includePii" type="checkbox" @change="load()" />
        显示邮箱/手机
      </label>
    </div>

    <div v-if="error" class="mb-4 text-sm text-red-500">{{ error }}</div>

    <div class="bg-card-bg border border-surface-3 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-surface-3/50">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-text-muted">ID</th>
            <th class="text-left px-4 py-3 font-medium text-text-muted">用户名</th>
            <th class="text-left px-4 py-3 font-medium text-text-muted">级别</th>
            <th class="text-left px-4 py-3 font-medium text-text-muted">邮箱</th>
            <th class="text-left px-4 py-3 font-medium text-text-muted">状态</th>
            <th class="text-left px-4 py-3 font-medium text-text-muted">注册时间</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-3">
          <tr v-for="u in rows" :key="u.id" class="hover:bg-page-bg transition-colors">
            <td class="px-4 py-3 text-text-muted">{{ u.id }}</td>
            <td class="px-4 py-3 font-medium text-deep-text">
              {{ u.username }}
              <span v-if="u.account_level === 'admin'" class="ml-1 text-xs text-primary">管理员</span>
            </td>
            <td class="px-4 py-3 text-text-muted">{{ levelMap[u.account_level] ?? u.account_level }}</td>
            <td class="px-4 py-3 text-text-muted">{{ u.email || '—' }}</td>
            <td class="px-4 py-3">
              <span
                v-if="u.is_locked"
                class="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 dark:bg-red-950/30 text-red-500"
              >
                已锁定
              </span>
              <span
                v-else
                class="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 dark:bg-green-950/30 text-green-500"
              >
                正常
              </span>
            </td>
            <td class="px-4 py-3 text-text-muted">
              {{ u.created_at ? u.created_at.slice(0, 10) : '—' }}
            </td>
          </tr>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-text-muted">暂无用户</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between mt-4 text-sm text-text-muted">
      <span>共 {{ total }} 条 · 第 {{ page }} / {{ totalPages }} 页</span>
      <div class="flex gap-2">
        <button
          class="px-3 py-1.5 rounded-lg bg-surface-3 text-deep-text disabled:opacity-40"
          :disabled="page <= 1"
          @click="goTo(page - 1)"
        >
          上一页
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-surface-3 text-deep-text disabled:opacity-40"
          :disabled="page >= totalPages"
          @click="goTo(page + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>
