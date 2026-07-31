<script lang="ts">
  import { db } from '~/features/starhope/stores/db.svelte';
  import { getAuthPath } from '~/features/auth/constants/auth-paths';

  let exportStatus = $state('');
  let importStatus = $state('');

  async function handleExportBackup() {
    exportStatus = '正在导出...';
    try {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        questions: await db.questions.toArray(),
        folders: await db.folders.toArray(),
        practiceSessions: await db.practiceSessions.toArray(),
        aiAgents: await db.aiAgents.toArray(),
        aiMessages: await db.aiMessages.toArray(),
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `starhope-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      exportStatus = '导出成功！';
    } catch (e) {
      exportStatus = `导出失败: ${e instanceof Error ? e.message : '未知错误'}`;
    }
  }

  async function handleImportBackup(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    importStatus = '正在导入...';
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version || !data.questions) throw new Error('无效的备份文件');

      // 清空现有数据并导入
      if (confirm('导入将替换所有现有数据，确定继续？')) {
        await db.questions.clear();
        await db.folders.clear();
        await db.practiceSessions.clear();
        await db.aiAgents.clear();
        await db.aiMessages.clear();

        if (data.questions) await db.questions.bulkPut(data.questions);
        if (data.folders) await db.folders.bulkPut(data.folders);
        if (data.practiceSessions) await db.practiceSessions.bulkPut(data.practiceSessions);
        if (data.aiAgents) await db.aiAgents.bulkPut(data.aiAgents);
        if (data.aiMessages) await db.aiMessages.bulkPut(data.aiMessages);

        importStatus = '导入成功！刷新页面后生效。';
        setTimeout(() => location.reload(), 2000);
      } else {
        importStatus = '';
      }
    } catch (e) {
      importStatus = `导入失败: ${e instanceof Error ? e.message : '未知错误'}`;
    }
  }

  async function handleClearAll() {
    if (!confirm('确定清除所有本地数据？此操作不可撤销。')) return;
    await db.questions.clear();
    await db.folders.clear();
    await db.practiceSessions.clear();
    await db.aiAgents.clear();
    await db.aiMessages.clear();
    alert('所有数据已清除');
    location.href = getAuthPath('starhope');
  }
</script>

<div class="max-w-3xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold text-deep-text mb-8">设置</h1>

  <!-- 数据管理 -->
  <div class="card-base p-6 mb-6">
    <h2 class="text-lg font-semibold text-deep-text mb-4">数据管理</h2>

    <div class="space-y-4">
      <div>
        <h3 class="text-sm font-medium text-deep-text mb-2">导出备份</h3>
        <p class="text-xs text-text-muted mb-3">将所有题目、文件夹、练习记录、AI 对话导出为 JSON 文件</p>
        <button onclick={handleExportBackup} class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">导出备份</button>
        {#if exportStatus}
          <p class="text-xs mt-2" class:text-green-500={exportStatus.includes('成功')} class:text-red-500={exportStatus.includes('失败')}>{exportStatus}</p>
        {/if}
      </div>

      <div class="border-t border-surface-3 pt-4">
        <h3 class="text-sm font-medium text-deep-text mb-2">导入备份</h3>
        <p class="text-xs text-text-muted mb-3">从之前导出的 JSON 备份文件恢复数据</p>
        <label class="btn-neutral rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer inline-block">
          选择备份文件
          <input type="file" accept=".json" onchange={handleImportBackup} class="hidden" />
        </label>
        {#if importStatus}
          <p class="text-xs mt-2" class:text-green-500={importStatus.includes('成功')} class:text-red-500={importStatus.includes('失败')}>{importStatus}</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- 危险操作 -->
  <div class="card-base p-6 border-red-200 dark:border-red-900">
    <h2 class="text-lg font-semibold text-red-500 mb-4">危险操作</h2>
    <p class="text-sm text-text-muted mb-4">清除所有本地存储的学习数据（题目、记录、对话）。此操作无法撤销。</p>
    <button onclick={handleClearAll} class="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors">
      清除所有数据
    </button>
  </div>
</div>
