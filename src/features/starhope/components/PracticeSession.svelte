<script lang="ts">
  import { practiceStore } from '~/features/starhope/stores/practice.svelte';
  import { navigation } from '~/features/starhope/stores/navigation.svelte';

  interface Props {
    onExit: () => void;
  }

  let { onExit }: Props = $props();

  const { currentQuestion, currentIndex, totalQuestions, answeredCount } = practiceStore;

  let userAnswer = $state('');
  let showResult = $state(false);
  let lastCorrect = $state(false);

  function handleNext() {
    showResult = false;
    userAnswer = '';
    lastCorrect = false;
    practiceStore.nextQuestion();
  }

  function handleAnswer() {
    if (!userAnswer.trim() || !currentQuestion) return;
    practiceStore.setAnswer(userAnswer.trim());

    if (practiceStore.currentSession?.mode === 'realtime') {
      const results = practiceStore.currentSession?.results;
      const correct = results?.[currentQuestion.id]?.correct ?? false;
      lastCorrect = correct;
      showResult = true;
    } else {
      if (practiceStore.isLastQuestion) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  }

  async function handleSubmit() {
    const session = await practiceStore.submitExam();
    if (session) {
      showResult = true;
    }
  }

  function handleExit() {
    if (practiceStore.currentSession?.status === 'ongoing') {
      practiceStore.pauseSession();
    }
    onExit();
  }

  const sessionResult = $derived(practiceStore.getSessionResult());
  const passed = $derived(practiceStore.getPassed());
</script>

<div>
  <!-- 顶部进度条 -->
  <div class="flex items-center justify-between mb-6">
    <button onclick={handleExit} class="btn-plain text-text-muted hover:text-primary text-sm">&larr; 返回</button>
    <span class="text-sm text-text-muted">
      {currentIndex + 1} / {totalQuestions}
      <span class="mx-2">|</span>
      已答: {answeredCount}
    </span>
    <div class="text-sm text-text-muted">
      {String(Math.floor(practiceStore.elapsedSeconds / 60)).padStart(2, '0')}:{String(practiceStore.elapsedSeconds % 60).padStart(2, '0')}
    </div>
  </div>

  <!-- 进度条 -->
  <div class="w-full bg-surface-3 rounded-full h-1.5 mb-8">
    <div class="bg-primary h-1.5 rounded-full transition-all" style="width: {practiceStore.progress * 100}%"></div>
  </div>

  {#if currentQuestion && !showResult}
    <!-- 题目 -->
    <div class="card-base p-6">
      <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium mb-4 inline-block">
        {{
          single: '单选题',
          multiple: '多选题',
          'true-false': '判断题',
          fill: '填空题',
          essay: '问答题',
        }[currentQuestion.type] ?? currentQuestion.type}
      </span>
      <h2 class="text-lg font-semibold text-deep-text mb-6">{currentQuestion.content}</h2>

      {#if currentQuestion.type === 'single' || currentQuestion.type === 'multiple'}
        <div class="space-y-3">
          {#each currentQuestion.options ?? [] as opt, i}
            <button
              onclick={() => {
                if (currentQuestion.type === 'single') {
                  userAnswer = String.fromCharCode(65 + i);
                } else {
                  const selected = userAnswer.split(';').filter(Boolean);
                  const letter = String.fromCharCode(65 + i);
                  const idx = selected.indexOf(letter);
                  if (idx >= 0) selected.splice(idx, 1);
                  else selected.push(letter);
                  userAnswer = selected.join(';');
                }
              }}
              class="w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm {userAnswer.includes(String.fromCharCode(65 + i)) ? 'border-primary bg-primary/5' : 'border-surface-3 hover:border-primary/30'}"
            >
              <span class="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          {/each}
        </div>
      {:else if currentQuestion.type === 'true-false'}
        <div class="flex gap-4">
          {#each ['正确', '错误'] as opt}
            <button
              onclick={() => { userAnswer = opt; }}
              class="flex-1 text-center px-4 py-3 rounded-lg border transition-colors text-sm {userAnswer === opt ? 'border-primary bg-primary/5' : 'border-surface-3 hover:border-primary/30'}"
            >
              {opt}
            </button>
          {/each}
        </div>
      {:else}
        <textarea
          bind:value={userAnswer}
          rows={4}
          class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y"
          placeholder="输入你的答案..."
        ></textarea>
      {/if}

      <div class="flex justify-end gap-3 mt-6">
        {#if !practiceStore.isLastQuestion || practiceStore.currentSession?.mode === 'batch'}
          <button
            onclick={handleAnswer}
            disabled={!userAnswer.trim()}
            class="btn-primary rounded-lg px-6 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {practiceStore.isLastQuestion ? '提交' : '下一题'}
          </button>
        {:else}
          <button onclick={handleSubmit} class="btn-primary rounded-lg px-6 py-2 text-sm font-semibold">
            提交试卷
          </button>
        {/if}
      </div>
    </div>
  {:else if showResult && sessionResult}
    <!-- 完成结果 -->
    <div class="card-base p-8 text-center">
      <div class="text-6xl mb-4">
        {sessionResult.score >= (practiceStore.currentSession?.passingGrade ?? 60) ? '🎉' : '📚'}
      </div>
      <h2 class="text-2xl font-bold text-deep-text mb-2">
        {practiceStore.currentSession?.type === 'exam'
          ? (passed ? '恭喜通过！' : '继续加油！')
          : '练习完成！'}
      </h2>
      <div class="grid grid-cols-3 gap-4 my-8">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-500">{sessionResult.correct}</div>
          <div class="text-xs text-text-muted mt-1">正确</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-red-500">{sessionResult.wrong}</div>
          <div class="text-xs text-text-muted mt-1">错误</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-primary">{sessionResult.score}</div>
          <div class="text-xs text-text-muted mt-1">得分</div>
        </div>
      </div>
      <div class="flex gap-3 justify-center">
        <button onclick={handleExit} class="btn-neutral rounded-lg px-6 py-2 text-sm">返回</button>
        <button onclick={() => navigation.navigate('wrong-book')} class="btn-primary rounded-lg px-6 py-2 text-sm font-semibold">查看错题</button>
      </div>
    </div>
  {/if}

  <!-- 实时反馈 -->
  {#if showResult && practiceStore.currentSession?.mode === 'realtime' && currentQuestion}
    <div class="mt-4 card-base p-4 {lastCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/10' : 'border-red-500 bg-red-50 dark:bg-red-950/10'}">
      <p class="text-sm font-semibold mb-1">{lastCorrect ? '✓ 回答正确！' : '✗ 回答错误'}</p>
      {#if currentQuestion.analysis}
        <p class="text-xs text-text-muted mt-2">解析：{currentQuestion.analysis}</p>
      {/if}
      <button onclick={handleNext} class="btn-primary rounded-lg px-4 py-1.5 text-xs mt-3">
        {practiceStore.isLastQuestion ? '查看结果' : '下一题'}
      </button>
    </div>
  {/if}
</div>
