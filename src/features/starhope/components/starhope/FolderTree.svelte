<script lang="ts">
  import { onMount } from 'svelte';
  import { questionBankStore } from '../../stores/question-bank.svelte';
  import type { Folder } from '../../stores/db.svelte';

  onMount(() => {
    questionBankStore.loadFolders();
  });

  let newFolderName = $state('');
  let showNewFolder = $state(false);

  function getRootFolders(): Folder[] {
    return questionBankStore.folders.filter((f) => f.parentId === null);
  }

  function getChildren(parentId: string): Folder[] {
    return questionBankStore.folders.filter((f) => f.parentId === parentId);
  }

  async function handleCreateFolder(parentId: string | null = null) {
    if (!newFolderName.trim()) return;
    await questionBankStore.createFolder(newFolderName.trim(), parentId);
    newFolderName = '';
    showNewFolder = false;
  }

  function handleSelect(folderId: string | null) {
    questionBankStore.currentFolderId = folderId;
    questionBankStore.loadQuestions();
  }
</script>

<div class="card-base p-4">
  <div class="flex items-center justify-between mb-3">
    <h3 class="text-sm font-semibold text-deep-text">文件夹</h3>
    <button onclick={() => { showNewFolder = !showNewFolder; }} class="text-primary text-lg leading-none">&plus;</button>
  </div>

  {#if showNewFolder}
    <div class="mb-3">
      <input
        type="text"
        bind:value={newFolderName}
        onkeydown={(e) => e.key === 'Enter' && handleCreateFolder(null)}
        class="w-full rounded-lg border border-surface-3 bg-page-bg px-2 py-1.5 text-xs focus:outline-none focus:border-primary mb-1"
        placeholder="文件夹名..."
      />
      <div class="flex gap-1">
        <button onclick={() => handleCreateFolder(null)} class="text-xs text-primary hover:underline">创建</button>
        <button onclick={() => { showNewFolder = false; newFolderName = ''; }} class="text-xs text-text-muted hover:underline">取消</button>
      </div>
    </div>
  {/if}

  <div class="space-y-0.5">
    <!-- 全部题目 -->
    <button
      onclick={() => handleSelect(null)}
      class="w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center gap-2 {questionBankStore.currentFolderId === null ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-3'}"
    >
      <span class="text-base">📚</span>
      <span>全部题目</span>
    </button>

    {#each getRootFolders() as folder (folder.id)}
      <div>
        <button
          onclick={() => handleSelect(folder.id)}
          class="w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center gap-2 {questionBankStore.currentFolderId === folder.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-3'}"
        >
          <span class="text-base">📁</span>
          <span class="truncate">{folder.name}</span>
        </button>
        {#each getChildren(folder.id) as child (child.id)}
          <button
            onclick={() => handleSelect(child.id)}
            class="w-full text-left pl-8 pr-2 py-1.5 rounded text-sm transition-colors flex items-center gap-2 {questionBankStore.currentFolderId === child.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-3'}"
          >
            <span class="text-base">📄</span>
            <span class="truncate">{child.name}</span>
          </button>
        {/each}
      </div>
    {/each}

    {#if questionBankStore.folders.length === 0}
      <p class="text-xs text-text-muted px-2 py-2">暂无文件夹</p>
    {/if}
  </div>
</div>
