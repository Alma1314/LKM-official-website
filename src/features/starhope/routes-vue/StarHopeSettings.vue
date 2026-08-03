<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../stores-vue/db';
import type { Question } from '~/features/starhope/types';
const exportStatus = ref('');

async function exportData() {
  try {
    const questions = await db.questions.toArray() as Question[];
    const json = JSON.stringify({ questions, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `starhope-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    exportStatus.value = '导出成功';
  } catch { exportStatus.value = '导出失败'; }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-deep-text mb-6">设置</h1>
    <div class="card-base p-6">
      <h3 class="text-sm font-semibold text-deep-text mb-3">数据管理</h3>
      <button @click="exportData" class="btn-primary rounded-lg px-4 py-2 text-sm">导出题库数据</button>
      <p v-if="exportStatus" class="text-sm text-text-muted mt-2">{{ exportStatus }}</p>
    </div>
  </div>
</template>
