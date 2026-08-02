<script lang="ts">
  import { aiStore } from '~/features/starhope/stores/ai.svelte';
  import type { AiAgent } from '~/features/starhope/types';

  interface Props {
    agent: AiAgent | null;
    onClose: () => void;
  }

  let { agent, onClose }: Props = $props();

  const isNew = $derived(agent === null);

  let name = $state('');
  let systemPrompt = $state('');
  let service = $state('openai');
  let model = $state('gpt-4o');
  let temperature = $state(0.7);
  let maxTokens = $state(4096);

  $effect(() => {
    name = agent?.name ?? '';
    systemPrompt = agent?.systemPrompt ?? '';
    service = agent?.service ?? 'openai';
    model = agent?.model ?? 'gpt-4o';
    temperature = agent?.temperature ?? 0.7;
    maxTokens = agent?.maxTokens ?? 4096;
  });

  let saving = $state(false);

  async function handleSave() {
    if (!name.trim()) return;
    saving = true;
    try {
      const data = { name: name.trim(), systemPrompt: systemPrompt.trim(), service, model, temperature, maxTokens, topP: 1 as const };
      if (isNew) {
        await aiStore.createAgent(data);
        if (aiStore.agents.length === 1) aiStore.selectAgent(aiStore.agents[0].id);
      } else {
        await aiStore.updateAgent(agent!.id, data);
      }
      onClose();
    } finally {
      saving = false;
    }
  }

  async function handleDelete() {
    if (!agent || !confirm('确定删除这个助手？所有对话记录将被清除。')) return;
    await aiStore.deleteAgent(agent.id);
    onClose();
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm" role="presentation" onclick={handleBackdrop}>
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="bg-card-bg rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="p-6">
      <h2 class="text-xl font-bold text-deep-text mb-6">{isNew ? '新建 AI 助手' : '编辑 AI 助手'}</h2>

      <div class="space-y-4">
        <div>
          <label for="agent-name" class="block text-sm font-medium mb-1 text-deep-text">名称</label>
          <input id="agent-name" type="text" bind:value={name} class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="助手名称" />
        </div>
        <div>
          <label for="agent-system-prompt" class="block text-sm font-medium mb-1 text-deep-text">系统提示词</label>
          <textarea id="agent-system-prompt" bind:value={systemPrompt} rows={4} class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y" placeholder="定义 AI 助手的角色和行为..."></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="agent-service" class="block text-sm font-medium mb-1 text-deep-text">服务</label>
            <select id="agent-service" bind:value={service} class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm">
              <option value="openai">OpenAI 兼容</option>
              <option value="ollama">Ollama 本地</option>
            </select>
          </div>
          <div>
            <label for="agent-model" class="block text-sm font-medium mb-1 text-deep-text">模型</label>
            <input id="agent-model" type="text" bind:value={model} class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm" placeholder="gpt-4o / llama3..." />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="agent-temperature" class="block text-sm font-medium mb-1 text-deep-text">温度: {temperature}</label>
            <input id="agent-temperature" type="range" min="0" max="2" step="0.1" bind:value={temperature} class="w-full accent-primary" />
          </div>
          <div>
            <label for="agent-max-tokens" class="block text-sm font-medium mb-1 text-deep-text">最大 Token</label>
            <input id="agent-max-tokens" type="number" bind:value={maxTokens} min="256" max="32768" class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div class="flex justify-between pt-4 mt-6 border-t border-surface-3">
        {#if !isNew}
          <button onclick={handleDelete} class="text-red-500 hover:text-red-600 text-sm">删除助手</button>
        {:else}
          <div></div>
        {/if}
        <div class="flex gap-3">
          <button onclick={onClose} class="btn-neutral rounded-lg px-4 py-2 text-sm">取消</button>
          <button onclick={handleSave} disabled={saving} class="btn-primary rounded-lg px-6 py-2 text-sm font-semibold">{saving ? '保存中...' : '保存'}</button>
        </div>
      </div>
    </div>
  </div>
</div>
