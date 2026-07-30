<script lang="ts">
  import { onMount } from 'svelte';
  import { questionBankStore } from '~/features/starhope/stores/question-bank.svelte';
  import { practiceStore, type PracticeConfig } from '~/features/starhope/stores/practice.svelte';
  import ExamSession from '~/features/starhope/components/ExamSession.svelte';

  onMount(() => {
    questionBankStore.loadQuestions();
  });

  let questionCount = $state(20);
  let passingGrade = $state(60);
  let timeLimit = $state(30);
  let filterType = $state('');
  let filterDifficulty = $state(0);
  let started = $state(false);

  const availableQuestions = $derived(
    questionBankStore.questions.filter((q) => {
      if (filterType && q.type !== filterType) return false;
      if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
      return true;
    }),
  );

  function handleStart() {
    if (availableQuestions.length === 0) return;
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const ids = shuffled.slice(0, questionCount).map((q) => q.id);
    const config: PracticeConfig = {
      questionIds: ids,
      mode: 'batch',
      type: 'exam',
      timeLimit,
      passingGrade,
    };
    practiceStore.startPractice(config);
    started = true;
  }

  function handleFinish() {
    practiceStore.reset();
    started = false;
  }
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
  {#if started}
    <ExamSession onExit={handleFinish} />
  {:else}
    <h1 class="text-2xl font-bold text-deep-text mb-6">模拟考试</h1>

    <div class="card-base p-8">
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium mb-1 text-deep-text">题目数量</label>
          <input type="number" bind:value={questionCount} min="5" max={availableQuestions.length} class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-deep-text">及格线 (%)</label>
          <input type="number" bind:value={passingGrade} min="0" max="100" class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-deep-text">时间限制（分钟）</label>
          <input type="number" bind:value={timeLimit} min="5" max="180" class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-deep-text">题型</label>
          <select bind:value={filterType} class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm">
            <option value="">随机混合</option>
            <option value="single">单选题</option>
            <option value="multiple">多选题</option>
            <option value="true-false">判断题</option>
            <option value="fill">填空题</option>
          </select>
        </div>
      </div>

      <div class="text-sm text-text-muted mb-4">
        从 {availableQuestions.length} 道可用题目中随机选题
      </div>

      <button onclick={handleStart} class="btn-primary rounded-lg px-8 py-3 text-base font-semibold w-full">
        开始考试
      </button>
    </div>
  {/if}
</div>
