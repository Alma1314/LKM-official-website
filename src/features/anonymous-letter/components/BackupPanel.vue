<template>
  <!-- 数据备份 / 导入导出 -->
  <div class="backup glass">
    <h3>💾 数据备份</h3>
    <p class="bk-tip">导出全部本地数据为 JSON 文件，可在本机或其他浏览器导入恢复。</p>
    <div class="bk-actions">
      <button class="chip" @click="exportData">⬇️ 导出备份</button>
      <button class="chip" @click="triggerImport">⬆️ 导入备份</button>
      <input ref="fileInput" type="file" accept="application/json" hidden @change="onImport" />
    </div>
    <div v-if="msg" class="bk-msg">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as store from '../stores/storage';

const fileInput = ref(null);
const msg = ref('');

function exportData() {
  const json = store.exportAll();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shiguang-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  msg.value = '已导出备份文件 ✅';
}
function triggerImport() {
  fileInput.value?.click();
}
function onImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      store.importAll(reader.result);
      msg.value = '导入成功，刷新页面后生效 ✅';
    } catch (err) {
      msg.value = '导入失败：文件格式不正确 ❌';
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}
</script>

<style scoped>
.backup {
  padding: 18px;
  border-radius: var(--radius);
}
.backup h3 {
  margin: 0 0 6px;
  font-size: 16px;
}
.bk-tip {
  font-size: 12px;
  color: var(--text-sub);
  margin: 0 0 12px;
}
.bk-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.bk-msg {
  margin-top: 10px;
  font-size: 12px;
  color: var(--accent);
}
</style>
