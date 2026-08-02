<script lang="ts">
  import { onMount } from 'svelte';
  import { questionBankStore } from '~/features/starhope/stores/question-bank.svelte';
  import { practiceStore, type PracticeConfig } from '~/features/starhope/stores/practice.svelte';
  import { navigation } from '~/features/starhope/stores/navigation.svelte';
  import PracticeSession from '~/features/starhope/components/PracticeSession.svelte';

  onMount(() => {
    questionBankStore.loadQuestions();
    questionBankStore.loadFolders();
  });

  let selectedIds = $state<string[]>([]);
  let mode = $state<'realtime' | 'batch'>('realtime');
  let questionCount = $state(10);
  let filterType = $state('');
  let filterDifficulty = $state(0);
  let filterFolderId = $state<string | null>(null);
  let started = $state(false);

  const availableQuestions = $derived(
    questionBankStore.questions.filter((q) => {
      if (filterType && q.type !== filterType) return false;
      if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
      if (filterFolderId && q.folderId !== filterFolderId) return false;
      return true;
    }),
  );

  function handleSelectAll() {
    selectedIds = availableQuestions.map((q) => q.id);
  }

  function handleRandomSelect() {
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    selectedIds = shuffled.slice(0, questionCount).map((q) => q.id);
  }

  function handleStart() {
    if (selectedIds.length === 0) return;
    const config: PracticeConfig = {
      questionIds: selectedIds,
      mode,
      type: 'practice',
    };
    practiceStore.startPractice(config);
    started = true;
  }

  function handleFinish() {
    practiceStore.reset();
    started = false;
    selectedIds = [];
  }
</script>

<div class="max-w-7xl mx-auto px-4 py-8">
  {#if started}
    <PracticeSession onExit={handleFinish} />
  {:else}
    <h1 class="text-2xl font-bold text-deep-text mb-6">练习模式</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 左侧配置 -->
      <div class="lg:col-span-2">
        <div class="card-base p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">选题设置</h2>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-deep-text">批改模式</label>
              <select id="practice-mode" bind:value={mode} class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm">
                <option value="realtime">实时批改（每道题立即出结果）</option>
                <option value="batch">批量批改（全部做完后统一出分）</option>
              </select>
            </div>
            <div>
              <label for="practice-count" class="block text-sm font-medium mb-1 text-deep-text">题目数量</label>
              <input id="practice-count" type="number" bind:value={questionCount} min="1" max={availableQuestions.length} class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label for="practice-filter-type" class="block text-sm font-medium mb-1 text-deep-text">题型筛选</label>
              <select id="practice-filter-type" bind:value={filterType} class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm">
                <option value="">全部题型</option>
                <option value="single">单选题</option>
                <option value="multiple">多选题</option>
                <option value="true-false">判断题</option>
                <option value="fill">填空题</option>
                <option value="essay">问答题</option>
              </select>
            </div>
            <div>
              <label for="practice-filter-difficulty" class="block text-sm font-medium mb-1 text-deep-text">难度筛选</label>
              <select id="practice-filter-difficulty" bind:value={filterDifficulty} class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm">
                <option value="0">全部难度</option>
                {#each [1, 2, 3, 4, 5] as d}
                  <option value={d}>难度 {d} {'★'.repeat(d)}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="flex gap-3">
            <button onclick={handleSelectAll} class="btn-neutral rounded-lg px-4 py-2 text-sm">全选 ({availableQuestions.length})</button>
            <button onclick={handleRandomSelect} class="btn-neutral rounded-lg px-4 py-2 text-sm">随机 {questionCount} 题</button>
          </div>
        </div>

        <!-- 题目列表 -->
        <div class="text-sm text-text-muted mb-4">已选 {selectedIds.length} 道题目</div>
        {#if selectedIds.length > 0}
          <button onclick={handleStart} class="btn-primary rounded-lg px-6 py-3 text-base font-semibold w-full">
            开始练习 ({selectedIds.length} 题)
          </button>
        {:else}
          <p class="text-text-muted text-center py-8">请选择至少一道题目</p>
        {/if}
      </div>

      <!-- 右侧历史记录 -->
      <div>
        <h3 class="text-sm font-semibold text-deep-text mb-3">最近练习记录</h3>
        {#if availableQuestions.length > 0}
          <p class="text-xs text-text-muted">可用题目: {availableQuestions.length}</p>
        {/if}
      </div>
    </div>
  {/if}
</div>
