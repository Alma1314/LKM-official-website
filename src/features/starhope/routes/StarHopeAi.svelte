<script lang="ts">
  import { onMount } from 'svelte';
  import { aiStore } from '~/features/starhope/stores/ai.svelte';
  import AgentEditor from '~/features/starhope/components/AgentEditor.svelte';
  import type { AiAgent } from '~/features/starhope/types';

  onMount(() => {
    aiStore.loadAgents();
  });

  let inputText = $state('');
  let showAgentEditor = $state(false);
  let editingAgent = $state<AiAgent | null>(null);

  async function handleSend() {
    if (!inputText.trim() || aiStore.isGenerating) return;
    await aiStore.sendMessage(inputText.trim());
    inputText = '';
  }

  function handleNewAgent() {
    editingAgent = null;
    showAgentEditor = true;
  }

  function handleEditAgent(agent: AiAgent) {
    editingAgent = agent;
    showAgentEditor = true;
  }

  function handleAgentEditorClose() {
    showAgentEditor = false;
    editingAgent = null;
  }
</script>

<div class="flex h-[calc(100vh-4rem)]">
  <!-- Agent 侧边栏 -->
  <div class="w-56 shrink-0 border-r border-surface-3 p-4 flex flex-col">
    <h3 class="text-sm font-semibold text-deep-text mb-3">AI 助手</h3>
    <div class="space-y-1 flex-1 overflow-y-auto">
      {#each aiStore.agents as agent (agent.id)}
        <div
          class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer {aiStore.currentAgentId === agent.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-3'}"
          onclick={() => aiStore.selectAgent(agent.id)}
          onkeydown={(e) => e.key === 'Enter' && aiStore.selectAgent(agent.id)}
          role="button"
          tabindex="0"
        >
          <span>{agent.name}</span>
          <span
            onclick={(e) => { e.stopPropagation(); handleEditAgent(agent); }}
            onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleEditAgent(agent); } }}
            class="ml-auto text-text-muted hover:text-primary text-xs cursor-pointer"
            role="button"
            tabindex="0"
          >✎</span>
        </div>
      {/each}
    </div>
    <button onclick={handleNewAgent} class="btn-neutral rounded-lg w-full py-2 text-sm mt-2">
      + 新建助手
    </button>
  </div>

  <!-- 对话区 -->
  <div class="flex-1 flex flex-col min-w-0">
    {#if aiStore.currentAgent}
      <!-- 对话头部 -->
      <div class="border-b border-surface-3 px-6 py-3 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-deep-text">{aiStore.currentAgent.name}</h2>
          <p class="text-xs text-text-muted">{aiStore.currentAgent.model}</p>
        </div>
        <button
          onclick={() => { if (confirm('清除当前对话？')) aiStore.clearConversation(); }}
          class="text-xs text-text-muted hover:text-red-500"
        >清除对话</button>
      </div>

      <!-- 消息列表 -->
      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {#each aiStore.messages as msg (msg.id)}
          <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[75%] rounded-2xl px-4 py-3 text-sm {msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface-3 text-deep-text'}"
            >
              <div class="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        {/each}

        {#if aiStore.isGenerating && aiStore.streamContent}
          <div class="flex justify-start">
            <div class="max-w-[75%] rounded-2xl px-4 py-3 text-sm bg-surface-3 text-deep-text">
              <span class="whitespace-pre-wrap">{aiStore.streamContent}</span>
              <span class="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle"></span>
            </div>
          </div>
        {/if}

        {#if aiStore.messages.length === 0 && !aiStore.isGenerating}
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="text-5xl mb-4">🤖</div>
              <h3 class="text-lg font-semibold text-deep-text mb-1">{aiStore.currentAgent.name}</h3>
              <p class="text-sm text-text-muted">发送消息开始对话</p>
            </div>
          </div>
        {/if}
      </div>

      <!-- 输入区 -->
      <div class="border-t border-surface-3 px-6 py-4">
        <div class="flex gap-3">
          <textarea
            bind:value={inputText}
            rows={2}
            onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            class="flex-1 rounded-xl border border-surface-3 bg-page-bg px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
            placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
            disabled={aiStore.isGenerating}
          ></textarea>
          <button
            onclick={handleSend}
            disabled={!inputText.trim() || aiStore.isGenerating}
            class="btn-primary rounded-xl px-5 py-3 text-sm font-semibold shrink-0 disabled:opacity-50"
          >
            {aiStore.isGenerating ? '...' : '发送'}
          </button>
        </div>
      </div>
    {:else}
      <div class="flex items-center justify-center h-full text-text-muted">
        <p>选择一个 AI 助手开始对话</p>
      </div>
    {/if}
  </div>
</div>

{#if showAgentEditor}
  <AgentEditor agent={editingAgent} onClose={handleAgentEditorClose} />
{/if}
