import { ref, computed, type Ref, type ComputedRef } from "vue";
import { db } from "./db";
import { useAuthStore } from "./auth";
import { enqueue } from "../sync/sync";
import type { AiAgent, AiMessage } from "~/features/starhope/types";
import { t } from "~/lib/i18n";

const agents = ref<AiAgent[]>([]);
const currentAgentId = ref<string | null>(null);
const messages = ref<AiMessage[]>([]);
const isGenerating = ref(false);
const streamContent = ref("");
const error = ref<string | null>(null);

export function useAiStore(): {
  agents: Ref<AiAgent[]>;
  currentAgentId: Ref<string | null>;
  messages: Ref<AiMessage[]>;
  isGenerating: Ref<boolean>;
  streamContent: Ref<string>;
  error: Ref<string | null>;
  currentAgent: ComputedRef<AiAgent | null>;
  loadAgents: () => Promise<void>;
  createAgent: (
    data: Omit<AiAgent, "id" | "userId" | "createdAt">,
  ) => Promise<AiAgent | undefined>;
  updateAgent: (id: string, data: Partial<AiAgent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  selectAgent: (id: string) => void;
  loadMessages: () => Promise<void>;
  sendMessage: (
    content: string,
    attachments?: { name: string; data: string; type: string }[],
  ) => Promise<void>;
  clearConversation: () => void;
} {
  const auth = useAuthStore();

  const currentAgent = computed(
    () => agents.value.find((a) => a.id === currentAgentId.value) ?? null,
  );

  async function loadAgents(): Promise<void> {
    try {
      if (!auth.isLoggedIn.value) return;
      agents.value = await db.aiAgents
        .where("userId")
        .equals(auth.userId.value!)
        .toArray();
      if (agents.value.length === 0) {
        await createDefaultAgent();
      }
      if (!currentAgentId.value && agents.value.length > 0) {
        currentAgentId.value = agents.value[0].id;
        await loadMessages();
      }
    } catch (e) {
      error.value = t("starhopeData.ai.loadFail");
      console.error("loadAgents failed:", e);
    }
  }

  async function createDefaultAgent(): Promise<AiAgent> {
    const agent: AiAgent = {
      id: crypto.randomUUID(),
      userId: String(auth.userId.value!),
      name: t("starhopeData.ai.defaultAgentName"),
      systemPrompt: "你是一个有用的学习助手。请用中文回答。",
      service: "openai",
      model: "gpt-4o",
      temperature: 0.7,
      topP: 1,
      maxTokens: 4096,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.aiAgents.put(agent);
    enqueue("agents", agent.id, "upsert", agent);
    agents.value = [...agents.value, agent];
    return agent;
  }

  async function createAgent(
    data: Omit<AiAgent, "id" | "userId" | "createdAt">,
  ): Promise<AiAgent | undefined> {
    try {
      const agent: AiAgent = {
        ...data,
        id: crypto.randomUUID(),
        userId: String(auth.userId.value!),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.aiAgents.put(agent);
      enqueue("agents", agent.id, "upsert", agent);
      await loadAgents();
      return agent;
    } catch {
      error.value = t("starhopeData.ai.createFail");
    }
  }

  async function updateAgent(
    id: string,
    data: Partial<AiAgent>,
  ): Promise<void> {
    await db.aiAgents.update(id, data);
    await loadAgents();
    const updated = await db.aiAgents.get(id);
    if (updated) enqueue("agents", id, "upsert", updated);
  }

  async function deleteAgent(id: string): Promise<void> {
    await db.aiAgents.delete(id);
    enqueue("agents", id, "delete");
    await db.aiMessages.where("agentId").equals(id).delete();
    await loadAgents();
    if (currentAgentId.value === id) {
      currentAgentId.value = agents.value[0]?.id ?? null;
      await loadMessages();
    }
  }

  function selectAgent(id: string): void {
    currentAgentId.value = id;
    loadMessages();
  }

  async function loadMessages(): Promise<void> {
    if (!currentAgentId.value) {
      messages.value = [];
      return;
    }
    messages.value = await db.aiMessages
      .where("agentId")
      .equals(currentAgentId.value)
      .sortBy("timestamp");
  }

  async function sendMessage(
    content: string,
    attachments?: { name: string; data: string; type: string }[],
  ): Promise<void> {
    if (!currentAgentId.value || !auth.isLoggedIn.value) return;
    const userMsg: AiMessage = {
      id: crypto.randomUUID(),
      agentId: currentAgentId.value,
      role: "user",
      content,
      attachments,
      timestamp: new Date().toISOString(),
    };
    await db.aiMessages.put(userMsg);
    messages.value = [...messages.value, userMsg];
    isGenerating.value = true;
    streamContent.value = "";
    const agent = currentAgent.value;
    if (!agent) {
      isGenerating.value = false;
      return;
    }
    try {
      const response = await mockAiResponse(agent, content);
      streamContent.value = response;
      const assistantMsg: AiMessage = {
        id: crypto.randomUUID(),
        agentId: currentAgentId.value,
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };
      await db.aiMessages.put(assistantMsg);
      messages.value = [...messages.value, assistantMsg];
      streamContent.value = "";
    } catch (e) {
      const errorMsg: AiMessage = {
        id: crypto.randomUUID(),
        agentId: currentAgentId.value,
        role: "assistant",
        content: t("starhopeData.ai.errorPrefix", {
          message:
            e instanceof Error ? e.message : t("starhopeData.ai.unknownError"),
        }),
        timestamp: new Date().toISOString(),
      };
      await db.aiMessages.put(errorMsg);
      messages.value = [...messages.value, errorMsg];
      streamContent.value = "";
    } finally {
      isGenerating.value = false;
    }
  }

  function clearConversation(): void {
    if (!currentAgentId.value) return;
    db.aiMessages.where("agentId").equals(currentAgentId.value).delete();
    messages.value = [];
  }

  async function mockAiResponse(
    agent: AiAgent,
    userMessage: string,
  ): Promise<string> {
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
    return t("starhopeData.ai.mockResponse", {
      name: agent.name,
      question: userMessage.slice(0, 30),
    });
  }

  return {
    agents,
    currentAgentId,
    messages,
    isGenerating,
    streamContent,
    error,
    currentAgent,
    loadAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent,
    loadMessages,
    sendMessage,
    clearConversation,
  };
}
