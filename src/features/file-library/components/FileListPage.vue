<template>
  <div class="space-y-6">
    <!-- 筛选器 -->
    <div class="flex flex-wrap items-center gap-3">
      <select
        v-model="filterCategory"
        class="px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary outline-none"
      >
        <option value="">全部学科</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <select
        v-model="filterType"
        class="px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary outline-none"
      >
        <option value="">全部类型</option>
        <option value="pdf">PDF</option>
        <option value="zip">压缩包</option>
        <option value="other">其他</option>
      </select>
      <select
        v-model="filterStatus"
        class="px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary outline-none"
      >
        <option value="">全部状态</option>
        <option value="approved">已通过</option>
        <option value="pending">审核中</option>
        <option value="rejected">已驳回</option>
      </select>
      <select
        v-model="sortBy"
        class="px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary outline-none"
      >
        <option value="newest">最新</option>
        <option value="downloads">最多下载</option>
      </select>
      <div class="flex gap-1 ml-auto">
        <button
          class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          :class="viewMode === 'list' ? 'bg-primary text-on-primary' : 'bg-surface-3 text-text-muted'"
          @click="viewMode = 'list'"
          title="列表视图"
        >
          <Icon icon="material-symbols:list" class="w-5 h-5" />
        </button>
        <button
          class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          :class="viewMode === 'grid' ? 'bg-primary text-on-primary' : 'bg-surface-3 text-text-muted'"
          @click="viewMode = 'grid'"
          title="卡片视图"
        >
          <Icon icon="material-symbols:grid-view" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="bg-card-bg border border-surface-3 rounded-2xl overflow-hidden">
      <div class="divide-y divide-surface-3">
        <div
          v-for="file in filteredFiles"
          :key="file.id"
          class="flex items-center gap-4 px-5 py-4 hover:bg-page-bg transition-colors"
        >
          <span class="text-2xl shrink-0">{{ fileIcon(file.mimeType) }}</span>
          <div class="flex-1 min-w-0">
            <a
              :href="`${base}files/${file.id}`"
              class="font-medium text-deep-text hover:text-primary transition-colors line-clamp-1"
            >
              {{ file.originalName }}
            </a>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-text-muted/60">
              <span>{{ file.uploaderName }}</span>
              <span>{{ formatSize(file.size) }}</span>
              <span>下载 {{ file.downloadCount }} 次</span>
              <span class="text-text-muted">{{ file.createdAt }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(file.status)">
              {{ statusLabel(file.status) }}
            </span>
            <a :href="`${base}files/${file.id}`" class="btn-primary px-3 py-1.5 rounded-lg text-xs font-medium">查看</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <a
        v-for="file in filteredFiles"
        :key="file.id"
        :href="`${base}files/${file.id}`"
        class="bg-card-bg border border-surface-3 rounded-xl p-5 hover:border-primary/30 transition-colors group flex flex-col"
      >
        <div class="flex items-start gap-3 mb-3">
          <span class="text-3xl shrink-0">{{ fileIcon(file.mimeType) }}</span>
          <div class="flex-1 min-w-0">
            <h3
              class="font-semibold text-deep-text group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug"
            >
              {{ file.originalName }}
            </h3>
          </div>
        </div>
        <div class="text-xs text-text-muted/60 space-y-1 flex-1">
          <div>{{ file.uploaderName }} · {{ formatSize(file.size) }}</div>
          <div>下载 {{ file.downloadCount }} 次 · {{ file.createdAt }}</div>
        </div>
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-surface-3">
          <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(file.status)">
            {{ statusLabel(file.status) }}
          </span>
          <span class="text-xs text-primary font-medium">查看详情 →</span>
        </div>
      </a>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredFiles.length === 0" class="text-center py-12 text-sm text-text-muted">暂无符合条件的文件</div>

    <!-- 上传按钮 -->
    <button
      class="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-40"
      @click="showUpload = true"
    >
      <Icon icon="material-symbols:add" class="w-7 h-7" />
    </button>

    <!-- 上传弹窗 -->
    <Teleport to="body">
      <div
        v-if="showUpload"
        class="fixed inset-0 bg-black/40 dark:bg-black/70 z-[150] flex items-center justify-center"
        @click.self="showUpload = false"
      >
        <div class="bg-card-bg rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-deep-text mb-4">上传文件</h3>
          <div class="space-y-4">
            <div
              class="border-2 border-dashed border-surface-3 rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
            >
              <Icon icon="material-symbols:cloud-upload-outline" class="w-10 h-10 text-text-muted/40 mx-auto mb-2" />
              <p class="text-sm text-text-muted">点击或拖拽文件到此处</p>
              <p class="text-xs text-text-muted/50 mt-1">支持 PDF、ZIP 等格式，最大 500MB</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-deep-text mb-1">所属分类</label>
              <select
                v-model="uploadCategory"
                class="w-full px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary outline-none"
              >
                <option value="">请选择分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-deep-text mb-1">简介</label>
              <textarea
                v-model="uploadDesc"
                rows="2"
                class="w-full px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary outline-none resize-none"
                placeholder="简单介绍文件内容..."
              ></textarea>
            </div>
          </div>
          <div class="flex gap-2 justify-end mt-4">
            <button class="btn-ghost px-4 py-2 rounded-lg text-sm" @click="showUpload = false">取消</button>
            <button class="btn-primary px-6 py-2 rounded-lg text-sm font-semibold" @click="doUpload">提交上传</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { mockFiles } from '../data/mock-files';
import { forumCategories } from '../../forum/data/categories';

const base = import.meta.env.BASE_URL;

const viewMode = ref<'list' | 'grid'>('list');
const filterCategory = ref('');
const filterType = ref('');
const filterStatus = ref('');
const sortBy = ref('newest');
const showUpload = ref(false);
const uploadCategory = ref('');
const uploadDesc = ref('');

const categories = forumCategories.filter((c) => !c.parentId);

const filteredFiles = computed(() => {
  let files = [...mockFiles];
  if (filterCategory.value) files = files.filter((f) => f.categoryId === filterCategory.value);
  if (filterType.value === 'pdf') files = files.filter((f) => f.mimeType === 'application/pdf');
  if (filterType.value === 'zip') files = files.filter((f) => f.mimeType === 'application/zip');
  if (filterType.value === 'other')
    files = files.filter((f) => !['application/pdf', 'application/zip'].includes(f.mimeType));
  if (filterStatus.value) files = files.filter((f) => f.status === filterStatus.value);
  if (sortBy.value === 'downloads') files.sort((a, b) => b.downloadCount - a.downloadCount);
  return files;
});

function fileIcon(mime: string): string {
  if (mime === 'application/pdf') return '📄';
  if (mime === 'application/zip') return '📦';
  return '📁';
}

function formatSize(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'approved':
      return '已通过 ✓';
    case 'pending':
      return '审核中';
    case 'rejected':
      return '已驳回 ✗';
    default:
      return status;
  }
}

function statusClass(status: string): string {
  switch (status) {
    case 'approved':
      return 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400';
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400';
    case 'rejected':
      return 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400';
    default:
      return '';
  }
}

function doUpload() {
  showUpload.value = false;
  alert('文件已提交，进入人工审核与查重队列。审核通过后会通知您。');
}
</script>
