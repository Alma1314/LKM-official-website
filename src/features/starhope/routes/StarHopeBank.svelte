<script lang="ts">
  import { onMount } from 'svelte';
  import { questionBankStore } from '~/features/starhope/stores/question-bank.svelte';
  import QuestionCard from '~/features/starhope/components/QuestionCard.svelte';
  import QuestionEditor from '~/features/starhope/components/QuestionEditor.svelte';
  import FolderTree from '~/features/starhope/components/FolderTree.svelte';
  import type { Question } from '~/features/starhope/types';

  onMount(() => {
    questionBankStore.loadQuestions();
    questionBankStore.loadFolders();
  });

  let showEditor = $state(false);
  let editingQuestion = $state<Question | null>(null);

  function handleCreate() {
    editingQuestion = null;
    showEditor = true;
  }

  function handleEdit(q: Question) {
    editingQuestion = q;
    showEditor = true;
  }

  function handleEditorClose() {
    showEditor = false;
    editingQuestion = null;
  }

  async function handleDelete() {
    if (questionBankStore.selectedIds.size === 0) return;
    if (!confirm(`确定删除选中的 ${questionBankStore.selectedIds.size} 道题目？`)) return;
    await questionBankStore.deleteQuestions([...questionBankStore.selectedIds]);
  }

  async function handleBatchDifficulty(e: Event) {
    const val = Number((e.target as HTMLSelectElement).value);
    if (!val) return;
    for (const id of questionBankStore.selectedIds) {
      await questionBankStore.updateQuestion(id, { difficulty: val as 1 | 2 | 3 | 4 | 5 });
    }
  }
</script>

<div class="max-w-7xl mx-auto px-4 py-8">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-deep-text">题库管理</h1>
    <button onclick={handleCreate} class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
      + 新建题目
    </button>
  </div>

  <div class="flex gap-6">
    <!-- 文件夹树 -->
    <div class="w-48 shrink-0">
      <FolderTree />
    </div>

    <!-- 题目列表区 -->
    <div class="flex-1 min-w-0">
      <!-- 搜索和排序 -->
      <div class="flex items-center gap-3 mb-4">
        <input
          type="text"
          bind:value={questionBankStore.searchQuery}
          placeholder="搜索题目或标签..."
          class="flex-1 rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
        />
        <select
          onchange={(e) => {
            const sel = e.target as HTMLSelectElement;
            questionBankStore.sortKey = sel.value as 'createdAt' | 'difficulty' | 'type';
          }}
          class="rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm"
        >
          <option value="createdAt">按时间</option>
          <option value="difficulty">按难度</option>
          <option value="type">按类型</option>
        </select>
      </div>

      <!-- 批量工具栏 -->
      {#if questionBankStore.selectedIds.size > 0}
        <div class="flex items-center gap-2 mb-4 text-sm bg-surface-2 rounded-lg px-3 py-2">
          <span class="text-text-muted">已选 {questionBankStore.selectedIds.size} 项</span>
          <span class="text-text-muted">|</span>
          <button onclick={() => questionBankStore.selectAll()} class="text-primary hover:underline">全选</button>
          <button onclick={() => questionBankStore.clearSelection()} class="text-text-muted hover:text-primary">取消</button>
          <span class="text-text-muted">|</span>
          <button onclick={handleDelete} class="text-red-500 hover:underline">删除</button>
          <select onchange={handleBatchDifficulty} class="rounded border border-surface-3 bg-page-bg px-2 py-1 text-xs">
            <option value="">批量设难度</option>
            {#each [1, 2, 3, 4, 5] as d}
              <option value={d}>难度 {d}</option>
            {/each}
          </select>
        </div>
      {/if}

      <!-- 题目列表 -->
      <div class="space-y-2">
        {#each questionBankStore.filteredQuestions as q (q.id)}
          <QuestionCard
            question={q}
            selected={questionBankStore.selectedIds.has(q.id)}
            onToggle={(id) => questionBankStore.toggleSelect(id)}
            onEdit={handleEdit}
          />
        {/each}
        {#if questionBankStore.filteredQuestions.length === 0}
          <div class="text-center py-16">
            <p class="text-4xl mb-4">📚</p>
            <p class="text-text-muted">
              {questionBankStore.searchQuery ? '没有匹配的题目' : '还没有题目，点击"新建题目"开始添加'}
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

{#if showEditor}
  <QuestionEditor question={editingQuestion} onClose={handleEditorClose} />
{/if}
