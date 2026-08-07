<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAiStore } from '../stores-vue/ai';
import type { AiAgent } from '~/features/starhope/types';

const ai = useAiStore();
const inputText = ref('');
const _showAgentEditor = ref(false);
const _editingAgent = ref<AiAgent | null>(null);

onMounted(() => {
  ai.loadAgents();
});

async function handleSend() {
  if (!inputText.value.trim() || ai.isGenerating.value) return;
  await ai.sendMessage(inputText.value.trim());
  inputText.value = '';
}
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)]">
    <div class="w-56 shrink-0 border-r border-surface-3 p-4 flex flex-col">
      <h3 class="text-sm font-semibold text-deep-text mb-3">AI 助手</h3>
      <div class="space-y-1 flex-1 overflow-y-auto">
        <div
          v-for="agent in ai.agents.value"
          :key="agent.id"
          class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
          :class="
            ai.currentAgentId.value === agent.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-3'
          "
          @click="ai.selectAgent(agent.id)"
        >
          <span>{{ agent.name }}</span>
        </div>
      </div>
      <button class="btn-neutral rounded-lg w-full py-2 text-sm mt-2">+ 新建助手</button>
    </div>
    <div class="flex-1 flex flex-col min-w-0">
      <div v-if="ai.currentAgent.value" class="flex-1 flex flex-col">
        <div class="border-b border-surface-3 px-6 py-3 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-deep-text">{{ ai.currentAgent.value.name }}</h2>
            <p class="text-xs text-text-muted">{{ ai.currentAgent.value.model }}</p>
          </div>
          <button @click="ai.clearConversation()" class="text-xs text-text-muted hover:text-red-500">清除对话</button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div
            v-for="msg in ai.messages.value"
            :key="msg.id"
            class="flex"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[75%] rounded-2xl px-4 py-3 text-sm"
              :class="msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface-3 text-deep-text'"
            >
              <div class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</div>
            </div>
          </div>
          <div
            v-if="ai.messages.value.length === 0 && !ai.isGenerating.value"
            class="flex items-center justify-center h-full"
          >
            <div class="text-center">
              <div class="text-5xl mb-4">🤖</div>
              <h3 class="text-lg font-semibold text-deep-text">{{ ai.currentAgent.value.name }}</h3>
              <p class="text-sm text-text-muted">发送消息开始对话</p>
            </div>
          </div>
        </div>
        <div class="border-t border-surface-3 px-6 py-4">
          <div class="flex gap-3">
            <textarea
              v-model="inputText"
              rows="2"
              @keydown.enter.exact.prevent="handleSend"
              class="flex-1 rounded-xl border border-surface-3 bg-page-bg px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
              :disabled="ai.isGenerating.value"
            ></textarea>
            <button
              @click="handleSend"
              :disabled="!inputText.trim() || ai.isGenerating.value"
              class="btn-primary rounded-xl px-5 py-3 text-sm font-semibold shrink-0 disabled:opacity-50"
            >
              {{ ai.isGenerating.value ? '...' : '发送' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center h-full text-text-muted"><p>选择一个 AI 助手开始对话</p></div>
    </div>
  </div>
</template>
