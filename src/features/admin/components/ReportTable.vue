<script setup lang="ts">
// 后台举报列表 —— 接真实后端 GET /api/v1/admin/reports
import { ref, onMounted, computed } from "vue";
import { adminFetch, readAdminResp } from "~/lib/api/admin";
import { t } from "~/lib/i18n";

interface AdminReportRow {
  id: number;
  type: string;
  target_id: string;
  target_title: string;
  reporter_name: string;
  reason: string;
  status: string;
  created_at: string;
}

const rows = ref<AdminReportRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const error = ref("");

const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value)),
);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      size: String(pageSize.value),
    });
    const res = await adminFetch(`/api/v1/admin/reports?${params.toString()}`);
    const body = await readAdminResp(res);
    rows.value = (body.data as { items: AdminReportRow[] }).items;
    total.value = (body.data as { total: number }).total;
  } catch (e) {
    error.value = e instanceof Error ? e.message : t("admin.loadFailed");
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
            <th class="text-left px-4 py-3 font-medium text-text-muted">
              {{ t("page.admin.reports.target") }}
            </th>
            <th
              class="text-left px-4 py-3 font-medium text-text-muted hidden sm:table-cell"
            >
              {{ t("page.admin.reports.type") }}
            </th>
            <th
              class="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell"
            >
              {{ t("page.admin.reports.reporter") }}
            </th>
            <th class="text-left px-4 py-3 font-medium text-text-muted">
              {{ t("page.admin.reports.reason") }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-3">
          <tr
            v-for="r in rows"
            :key="r.id"
            class="hover:bg-page-bg transition-colors"
          >
            <td class="px-4 py-3">
              <span class="font-medium text-deep-text">{{
                r.target_title
              }}</span>
              <div class="text-xs text-text-muted/60">
                {{ r.created_at ? r.created_at.slice(0, 10) : "—" }}
              </div>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell">
              <span
                class="text-xs px-2 py-0.5 rounded-full bg-surface-3 text-text-muted"
              >
                {{
                  r.type === "post"
                    ? t("page.admin.reports.post")
                    : r.type === "comment"
                      ? t("page.admin.reports.comment")
                      : t("page.admin.reports.file")
                }}
              </span>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-text-muted">
              {{ r.reporter_name || "—" }}
            </td>
            <td class="px-4 py-3 text-text-muted">{{ r.reason }}</td>
          </tr>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-text-muted">
              {{ t("page.admin.reports.empty") }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between mt-4 text-sm text-text-muted">
      <span>{{ t("admin.pagination", { total, page, totalPages }) }}</span>
      <div class="flex gap-2">
        <button
          class="px-3 py-1.5 rounded-lg bg-surface-3 text-deep-text disabled:opacity-40"
          :disabled="page <= 1"
          @click="goTo(page - 1)"
        >
          {{ t("admin.prevPage") }}
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-surface-3 text-deep-text disabled:opacity-40"
          :disabled="page >= totalPages"
          @click="goTo(page + 1)"
        >
          {{ t("admin.nextPage") }}
        </button>
      </div>
    </div>
  </div>
</template>
