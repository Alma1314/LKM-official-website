<script lang="ts">
  import { practiceStore } from '../../stores/practice.svelte';
  import { navigation } from '../../stores/navigation.svelte';

  interface Props {
    onExit: () => void;
  }

  let { onExit }: Props = $props();

  const { currentQuestion, currentIndex, totalQuestions, answeredCount } = practiceStore;

  let userAnswer = $state('');
  let showResult = $state(false);
  let showAnswerCard = $state(false);

  function handleSelectAnswer(letter: string) {
    if (currentQuestion?.type === 'single') {
      userAnswer = letter;
    } else if (currentQuestion?.type === 'multiple') {
      const selected = userAnswer.split(';').filter(Boolean);
      const idx = selected.indexOf(letter);
      if (idx >= 0) selected.splice(idx, 1);
      else selected.push(letter);
      userAnswer = selected.sort().join(';');
    }
    practiceStore.setAnswer(userAnswer);
  }

  function handleTFAnswer(val: string) {
    userAnswer = val;
    practiceStore.setAnswer(val);
  }

  function handleEssayAnswer() {
    practiceStore.setAnswer(userAnswer);
  }

  async function handleSubmit() {
    const session = await practiceStore.submitExam();
    if (session) showResult = true;
  }

  function handleExit() {
    if (!showResult && !confirm('确定退出考试？未提交的答卷将会丢失。')) return;
    practiceStore.reset();
    onExit();
  }

  const sessionResult = $derived(practiceStore.getSessionResult());
  const passed = $derived(practiceStore.getPassed());
  const remainingMinutes = $derived(
    Math.max(0, (practiceStore.currentSession?.timeLimit ?? 0) - Math.floor(practiceStore.elapsedSeconds / 60)),
  );
  const remainingSeconds = $derived(Math.max(0, 59 - (practiceStore.elapsedSeconds % 60)));
</script>

<div>
  {#if !showResult}
    <!-- 考试顶部栏 -->
    <div class="flex items-center justify-between mb-4 card-base px-4 py-3">
      <div class="flex items-center gap-4 text-sm">
        <span class="text-deep-text font-medium">{currentIndex + 1}/{totalQuestions}</span>
        <span class="text-text-muted">已答: {answeredCount}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm font-mono {remainingMinutes < 5 ? 'text-red-500' : 'text-text-muted'}">
          {String(remainingMinutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
        </span>
        <button onclick={() => { showAnswerCard = !showAnswerCard; }} class="btn-plain text-sm text-primary">
          答题卡
        </button>
        <button onclick={handleSubmit} class="btn-primary rounded-lg px-4 py-1.5 text-xs font-semibold">
          交卷
        </button>
      </div>
    </div>

    <div class="flex gap-4">
      <!-- 题目区 (4/5 宽度) -->
      <div class="flex-1">
        {#if currentQuestion}
          <div class="card-base p-6">
            <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium mb-4 inline-block">
              {{ single: '单选题', multiple: '多选题', 'true-false': '判断题', fill: '填空题', essay: '问答题' }[currentQuestion.type]}
            </span>
            <h2 class="text-lg font-semibold text-deep-text mb-6">{currentQuestion.content}</h2>

            {#if currentQuestion.type === 'single' || currentQuestion.type === 'multiple'}
              <div class="space-y-3">
                {#each currentQuestion.options ?? [] as opt, i}
                  <button
                    onclick={() => handleSelectAnswer(String.fromCharCode(65 + i))}
                    class="w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm {userAnswer.includes(String.fromCharCode(65 + i)) ? 'border-primary bg-primary/5' : 'border-surface-3'}"
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
                    onclick={() => handleTFAnswer(opt)}
                    class="flex-1 text-center px-4 py-3 rounded-lg border transition-colors text-sm {userAnswer === opt ? 'border-primary bg-primary/5' : 'border-surface-3'}"
                  >{opt}</button>
                {/each}
              </div>
            {:else}
              <textarea
                bind:value={userAnswer}
                rows={4}
                oninput={handleEssayAnswer}
                class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y"
                placeholder="输入答案..."
              ></textarea>
            {/if}
          </div>
        {/if}
      </div>

      <!-- 答题卡侧边栏 -->
      {#if showAnswerCard}
        <div class="w-48 shrink-0 card-base p-4">
          <h3 class="text-sm font-semibold text-deep-text mb-3">答题卡</h3>
          <div class="grid grid-cols-5 gap-1.5">
            {#each practiceStore.questions as q, i}
              <button
                onclick={() => practiceStore.goToQuestion(i)}
                class="w-8 h-8 rounded text-xs font-medium transition-colors {practiceStore.currentSession?.answers[q.id] !== undefined ? 'bg-primary text-white' : 'bg-surface-3 text-text-muted'} {currentIndex === i ? 'ring-2 ring-primary' : ''}"
              >
                {i + 1}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- 底部导航 -->
    <div class="flex justify-between mt-6">
      <button
        onclick={() => practiceStore.prevQuestion()}
        disabled={practiceStore.isFirstQuestion}
        class="btn-neutral rounded-lg px-4 py-2 text-sm disabled:opacity-30"
      >上一题</button>
      <button
        onclick={() => practiceStore.nextQuestion()}
        disabled={practiceStore.isLastQuestion}
        class="btn-neutral rounded-lg px-4 py-2 text-sm disabled:opacity-30"
      >下一题</button>
    </div>
  {:else if sessionResult}
    <!-- 考试结果 -->
    <div class="card-base p-8 text-center max-w-lg mx-auto mt-16">
      <div class="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
      <h2 class="text-2xl font-bold text-deep-text mb-2">{passed ? '恭喜通过！' : '继续加油！'}</h2>
      <p class="text-sm text-text-muted mb-8">及格线: {practiceStore.currentSession?.passingGrade ?? 60}%</p>

      <div class="grid grid-cols-3 gap-6 mb-8">
        <div>
          <div class="text-3xl font-bold text-green-500">{sessionResult.correct}</div>
          <div class="text-xs text-text-muted mt-1">正确</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-red-500">{sessionResult.wrong}</div>
          <div class="text-xs text-text-muted mt-1">错误</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-primary">{sessionResult.score}</div>
          <div class="text-xs text-text-muted mt-1">得分</div>
        </div>
      </div>

      <div class="flex gap-3 justify-center">
        <button onclick={handleExit} class="btn-neutral rounded-lg px-6 py-2 text-sm">返回</button>
        <button onclick={() => { handleExit(); navigation.navigate('wrong-book'); }} class="btn-primary rounded-lg px-6 py-2 text-sm font-semibold">错题本</button>
      </div>
    </div>
  {/if}
</div>
