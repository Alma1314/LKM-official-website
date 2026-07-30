<script lang="ts">
  import type { Question } from '~/features/starhope/types';

  interface Props {
    question: Question;
    selected: boolean;
    onToggle: (id: string) => void;
    onEdit: (q: Question) => void;
  }

  let {
    question,
    selected,
    onToggle,
    onEdit,
  }: Props = $props();

  const typeLabel: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    'true-false': '判断题',
    essay: '问答题',
    fill: '填空题',
  };

  const difficultyStars = $derived('\u2605'.repeat(question.difficulty) + '\u2606'.repeat(5 - question.difficulty));
</script>

<div
  class="card-base p-4 cursor-pointer hover:border-primary/30 transition-colors group {selected ? 'border-primary' : ''}"
  onclick={() => onToggle(question.id)}
  onkeydown={(e) => e.key === 'Enter' && onToggle(question.id)}
  role="checkbox"
  tabindex="0"
  aria-checked={selected}
>
  <div class="flex items-start gap-3">
    <input
      type="checkbox"
      checked={selected}
      onclick={(e) => e.stopPropagation()}
      onchange={() => onToggle(question.id)}
      class="mt-1 shrink-0"
    />
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1.5">
        <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          {typeLabel[question.type] ?? question.type}
        </span>
        <span class="text-xs text-amber-500">{difficultyStars}</span>
      </div>
      <p class="text-sm text-deep-text line-clamp-2 leading-relaxed">{question.content}</p>
      {#if question.tags.length > 0}
        <div class="flex flex-wrap gap-1 mt-2">
          {#each question.tags as tag}
            <span class="text-xs px-1.5 py-0.5 rounded-full bg-surface-3 text-text-muted">{tag}</span>
          {/each}
        </div>
      {/if}
    </div>
    <button
      onclick={(e) => {
        e.stopPropagation();
        onEdit(question);
      }}
      class="btn-plain text-text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1 shrink-0"
      aria-label="编辑题目"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
    </button>
  </div>
</div>
