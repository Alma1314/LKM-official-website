<script lang="ts">
  import type { Question } from '~/features/starhope/types';
  import { questionBankStore } from '~/features/starhope/stores/question-bank.svelte';

  interface Props {
    question: Question | null;
    onClose: () => void;
  }

  let { question, onClose }: Props = $props();

  const isNew = $derived(question === null);

  let type = $state<'single' | 'multiple' | 'true-false' | 'essay' | 'fill'>('single');
  let content = $state('');
  let options = $state<string[]>(['', '', '', '']);
  let answer = $state('');
  let analysis = $state('');
  let tags = $state<string[]>([]);
  let difficulty = $state<1 | 2 | 3 | 4 | 5>(3);
  let folderId = $state<string | undefined>(undefined);
  let tagInput = $state('');

  $effect(() => {
    type = question?.type ?? 'single';
    content = question?.content ?? '';
    options = question?.options ?? ['', '', '', ''];
    answer = Array.isArray(question?.answer) ? question.answer.join(';') : (question?.answer ?? '');
    analysis = question?.analysis ?? '';
    tags = question?.tags ?? [];
    difficulty = question?.difficulty ?? 3;
    folderId = question?.folderId;
  });

  let saving = $state(false);
  let error = $state('');

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      tags = [...tags, t];
    }
    tagInput = '';
  }

  function removeTag(tag: string) {
    tags = tags.filter((t) => t !== tag);
  }

  async function handleSave() {
    error = '';
    if (!content.trim()) { error = '请输入题目内容'; return; }

    saving = true;
    try {
      const data = {
        type,
        content: content.trim(),
        options: ['single', 'multiple'].includes(type) ? options.filter((o) => o.trim()) : undefined,
        answer: ['single', 'multiple'].includes(type) ? answer.split(';').map((s) => s.trim()) : answer.trim(),
        analysis: analysis.trim() || undefined,
        tags,
        difficulty,
        folderId: folderId || undefined,
      };

      if (isNew) {
        await questionBankStore.createQuestion(data);
      } else {
        await questionBankStore.updateQuestion(question!.id, data);
      }
      onClose();
    } catch (e) {
      error = '保存失败: ' + (e instanceof Error ? e.message : String(e));
    } finally {
      saving = false;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
  onclick={handleBackdropClick}
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="bg-card-bg rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
    onclick={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    aria-label={isNew ? '新建题目' : '编辑题目'}
    tabindex="-1"
  >
    <div class="p-6">
      <h2 class="text-xl font-bold text-deep-text mb-6">{isNew ? '新建题目' : '编辑题目'}</h2>

      <!-- 题型选择 -->
      <div class="mb-4">
        <label for="question-type" class="block text-sm font-medium mb-2 text-deep-text">题型</label>
        <div class="flex flex-wrap gap-2">
          {#each [
            { value: 'single' as const, label: '单选题' },
            { value: 'multiple' as const, label: '多选题' },
            { value: 'true-false' as const, label: '判断题' },
            { value: 'fill' as const, label: '填空题' },
            { value: 'essay' as const, label: '问答题' },
          ] as opt}
            <button
              onclick={() => {
                type = opt.value;
                if (opt.value === 'single' || opt.value === 'multiple') {
                  if (options.length === 0) options = ['', '', '', ''];
                }
              }}
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border {type === opt.value ? 'bg-primary text-white border-primary' : 'border-surface-3 text-text-muted hover:border-primary/50'}"
            >
              {opt.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- 题目内容 -->
      <div class="mb-4">
        <label for="question-content" class="block text-sm font-medium mb-2 text-deep-text">题目内容（支持 Markdown）</label>
        <textarea
          id="question-content"
          bind:value={content}
          rows={4}
          class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-y"
          placeholder="输入题目内容，支持 Markdown 格式和图片..."
        ></textarea>
      </div>

      <!-- 选项（仅选择题） -->
      {#if type === 'single' || type === 'multiple'}
        <div class="mb-4">
          <label for="question-option-0" class="block text-sm font-medium mb-2 text-deep-text">选项</label>
          {#each options as opt, i}
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs text-text-muted w-5">{String.fromCharCode(65 + i)}.</span>
              <input
                id="question-option-{i}"
                type="text"
                bind:value={options[i]}
                class="flex-1 rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="选项 {String.fromCharCode(65 + i)}"
              />
              {#if options.length > 1}
                <button
                  onclick={() => { options = options.filter((_, j) => j !== i); }}
                  class="text-red-400 hover:text-red-500 text-xs shrink-0"
                >
                  &times;
                </button>
              {/if}
            </div>
          {/each}
          <button
            onclick={() => { options = [...options, '']; }}
            class="text-xs text-primary hover:underline mt-1"
          >
            + 添加选项
          </button>
        </div>
      {/if}

      <!-- 答案 -->
      <div class="mb-4">
        <label for="question-answer" class="block text-sm font-medium mb-2 text-deep-text">
          {type === 'multiple' ? '答案（多个用分号分隔，如 A;B;C）' : '答案'}
        </label>
        <input
          id="question-answer"
          type="text"
          bind:value={answer}
          class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          placeholder={type === 'single' ? 'A' : type === 'multiple' ? 'A;B;C' : type === 'true-false' ? '正确 或 错误' : '输入答案'}
        />
      </div>

      <!-- 解析 -->
      <div class="mb-4">
        <label for="question-analysis" class="block text-sm font-medium mb-2 text-deep-text">解析（选填）</label>
        <textarea
          id="question-analysis"
          bind:value={analysis}
          rows={2}
          class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-y"
          placeholder="题目解析..."
        ></textarea>
      </div>

      <!-- 难度 -->
      <div class="mb-4">
        <label for="question-difficulty" class="block text-sm font-medium mb-2 text-deep-text">难度: {'★'.repeat(difficulty)}{'☆'.repeat(5 - difficulty)}</label>
        <input
          id="question-difficulty"
          type="range"
          min="1"
          max="5"
          bind:value={difficulty}
          class="w-full accent-primary"
        />
      </div>

      <!-- 标签 -->
      <div class="mb-4">
        <label for="question-tag-input" class="block text-sm font-medium mb-2 text-deep-text">标签</label>
        <div class="flex flex-wrap gap-1 mb-2">
          {#each tags as tag}
            <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              {tag}
              <button onclick={() => removeTag(tag)} class="hover:text-red-500">&times;</button>
            </span>
          {/each}
        </div>
        <div class="flex gap-2">
          <input
            id="question-tag-input"
            type="text"
            bind:value={tagInput}
            onkeydown={(e) => e.key === 'Enter' && addTag()}
            class="flex-1 rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="输入标签后按回车..."
          />
          <button onclick={addTag} class="btn-neutral rounded-lg px-3 py-2 text-xs">添加</button>
        </div>
      </div>

      <!-- 错误提示 -->
      {#if error}
        <p class="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2 mb-4">{error}</p>
      {/if}

      <!-- 按钮 -->
      <div class="flex justify-end gap-3 pt-4 border-t border-surface-3">
        <button onclick={onClose} class="btn-neutral rounded-lg px-4 py-2 text-sm">取消</button>
        <button onclick={handleSave} disabled={saving} class="btn-primary rounded-lg px-6 py-2 text-sm font-semibold">
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  </div>
</div>
