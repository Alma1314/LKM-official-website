<script lang="ts">
  import { onMount } from 'svelte';
  import { practiceStore } from '../stores/practice.svelte';
  import type { Question } from '../stores/db.svelte';

  onMount(() => {
    loadWrong();
  });

  let wrongQuestions = $state<Question[]>([]);

  async function loadWrong() {
    wrongQuestions = await practiceStore.loadWrongQuestions();
  }

  function handleRetry() {
    const ids = wrongQuestions.map((q) => q.id);
    practiceStore.startPractice({ questionIds: ids, mode: 'realtime', type: 'practice' });
    wrongQuestions = [];
  }
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-deep-text">错题本</h1>
    {#if wrongQuestions.length > 0}
      <button onclick={handleRetry} class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
        重新练习 ({wrongQuestions.length})
      </button>
    {/if}
  </div>

  {#if wrongQuestions.length === 0}
    <div class="text-center py-16">
      <div class="text-5xl mb-4">🎯</div>
      <h2 class="text-lg font-semibold text-deep-text mb-1">暂无错题</h2>
      <p class="text-sm text-text-muted">完成练习或考试后，错题会自动收录到这里</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each wrongQuestions as q (q.id)}
        <div class="card-base p-5">
          <div class="flex items-start gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {{ single: '单选题', multiple: '多选题', 'true-false': '判断题', fill: '填空题', essay: '问答题' }[q.type]}
                </span>
                <span class="text-xs text-amber-500">{'★'.repeat(q.difficulty)}{'☆'.repeat(5 - q.difficulty)}</span>
              </div>
              <p class="text-sm text-deep-text leading-relaxed mb-2">{q.content}</p>
              <div class="text-sm">
                <p class="text-green-600 dark:text-green-400 mb-1">
                  正确答案: {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}
                </p>
                {#if q.analysis}
                  <p class="text-text-muted text-xs bg-surface-3 rounded-lg p-3 mt-2">
                    {q.analysis}
                  </p>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
