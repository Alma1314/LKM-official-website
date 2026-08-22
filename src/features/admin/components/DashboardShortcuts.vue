<script setup lang="ts">
// 后台控制台快捷操作入口 —— 纯静态跳转，无 API 依赖。
//
// 说明：brief 图标字段是 tabler:xxx 文本占位，实际渲染不可用（本组件是 Vue SFC，
// 无 data-lucide/astro-icon 机制），故沿用 DashboardStats 的「彩色指示块」风格，
// 用带色块的几何首字符作图标位，保持 5 个入口的跳转目标与 labelKey 与 brief 一致。
import { NGrid, NGi, NButton } from "naive-ui";
import { t } from "~/lib/i18n";

interface ShortcutItem {
  to: string;
  /** 图标位占位字符（首字母/简标），配合 dotClass 色块 */
  glyph: string;
  /** 图标位：顶部小色点样式类 */
  dotClass: string;
  labelKey: string;
}

const items: ShortcutItem[] = [
  {
    to: "/admin/files",
    glyph: "F",
    dotClass: "bg-primary",
    labelKey: "admin.shortcuts.reviewFiles",
  },
  {
    to: "/admin/reports",
    glyph: "R",
    dotClass: "bg-red-500",
    labelKey: "admin.shortcuts.reviewReports",
  },
  {
    to: "/admin/users",
    glyph: "U",
    dotClass: "bg-primary",
    labelKey: "admin.shortcuts.manageUsers",
  },
  {
    to: "/admin/posts",
    glyph: "P",
    dotClass: "bg-primary",
    labelKey: "admin.shortcuts.managePosts",
  },
  {
    to: "/",
    glyph: "H",
    dotClass: "bg-yellow-500",
    labelKey: "admin.shortcuts.backToSite",
  },
];
</script>

<template>
  <n-grid
    responsive="screen"
    item-responsive
    :cols="{ xs: 2, s: 2, m: 3, l: 5 }"
    class="gap-4"
  >
    <n-gi v-for="it in items" :key="it.to" item-responsive>
      <a :href="it.to" class="no-underline">
        <n-button
          block
          size="large"
          quaternary
          class="!h-16 !text-deep-text hover:!bg-card-bg/70"
        >
          <div class="flex flex-col items-center justify-center gap-1">
            <span class="flex items-center gap-1.5 text-sm font-medium">
              <span
                class="inline-block w-2 h-2 rounded-full"
                :class="it.dotClass"
              />
              <span>{{ it.glyph }}</span>
            </span>
            <span class="text-sm text-deep-text">{{ t(it.labelKey) }}</span>
          </div>
        </n-button>
      </a>
    </n-gi>
  </n-grid>
</template>
