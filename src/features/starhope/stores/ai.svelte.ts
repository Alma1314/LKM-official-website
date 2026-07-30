import { db, type AiAgent, type AiMessage } from './db.svelte';
import { authStore } from './auth.svelte';

class AiStore {
  agents = $state<AiAgent[]>([]);
  currentAgentId = $state<string | null>(null);
  messages = $state<AiMessage[]>([]);
  isGenerating = $state(false);
  streamContent = $state('');

  get currentAgent() {
    return this.agents.find((a) => a.id === this.currentAgentId) ?? null;
  }

  async loadAgents() {
    if (!authStore.currentUser) return;
    this.agents = await db.aiAgents.where('userId').equals(authStore.currentUser.id).toArray();
    // 如果没有 Agent，创建默认的
    if (this.agents.length === 0) {
      await this.createDefaultAgent();
    }
    if (!this.currentAgentId && this.agents.length > 0) {
      this.currentAgentId = this.agents[0].id;
      await this.loadMessages();
    }
  }

  async createDefaultAgent() {
    const agent: AiAgent = {
      id: crypto.randomUUID(),
      userId: authStore.currentUser!.id,
      name: '通用助手',
      systemPrompt: '你是一个有用的学习助手，帮助用户解答问题、解释概念、提供学习建议。请用中文回答。',
      service: 'openai',
      model: 'gpt-4o',
      temperature: 0.7,
      topP: 1,
      maxTokens: 4096,
      createdAt: new Date().toISOString(),
    };
    await db.aiAgents.put(agent);
    this.agents = [...this.agents, agent];
    return agent;
  }

  async createAgent(data: Omit<AiAgent, 'id' | 'userId' | 'createdAt'>) {
    const agent: AiAgent = {
      ...data,
      id: crypto.randomUUID(),
      userId: authStore.currentUser!.id,
      createdAt: new Date().toISOString(),
    };
    await db.aiAgents.put(agent);
    await this.loadAgents();
    return agent;
  }

  async updateAgent(id: string, data: Partial<AiAgent>) {
    await db.aiAgents.update(id, data);
    await this.loadAgents();
  }

  async deleteAgent(id: string) {
    await db.aiAgents.delete(id);
    await db.aiMessages.where('agentId').equals(id).delete();
    await this.loadAgents();
    if (this.currentAgentId === id) {
      this.currentAgentId = this.agents[0]?.id ?? null;
      await this.loadMessages();
    }
  }

  selectAgent(id: string) {
    this.currentAgentId = id;
    this.loadMessages();
  }

  async loadMessages() {
    if (!this.currentAgentId) {
      this.messages = [];
      return;
    }
    this.messages = await db.aiMessages.where('agentId').equals(this.currentAgentId).sortBy('timestamp');
  }

  async sendMessage(content: string, attachments?: { name: string; data: string; type: string }[]) {
    if (!this.currentAgentId || !authStore.currentUser) return;

    const userMsg: AiMessage = {
      id: crypto.randomUUID(),
      agentId: this.currentAgentId,
      role: 'user',
      content,
      attachments,
      timestamp: new Date().toISOString(),
    };
    await db.aiMessages.put(userMsg);
    this.messages = [...this.messages, userMsg];

    this.isGenerating = true;
    this.streamContent = '';

    const agent = this.currentAgent;
    if (!agent) {
      this.isGenerating = false;
      return;
    }

    try {
      // 预留 SSE 流式调用接口
      const response = await this.mockAiResponse(agent, content);
      this.streamContent = response;

      const assistantMsg: AiMessage = {
        id: crypto.randomUUID(),
        agentId: this.currentAgentId,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      await db.aiMessages.put(assistantMsg);
      this.messages = [...this.messages, assistantMsg];
      this.streamContent = '';
    } catch (e) {
      const errorMsg: AiMessage = {
        id: crypto.randomUUID(),
        agentId: this.currentAgentId,
        role: 'assistant',
        content: `错误: ${e instanceof Error ? e.message : '未知错误'}\n\n请检查 API 配置或网络连接。`,
        timestamp: new Date().toISOString(),
      };
      await db.aiMessages.put(errorMsg);
      this.messages = [...this.messages, errorMsg];
      this.streamContent = '';
    } finally {
      this.isGenerating = false;
    }
  }

  clearConversation() {
    if (!this.currentAgentId) return;
    db.aiMessages.where('agentId').equals(this.currentAgentId).delete();
    this.messages = [];
  }

  private async mockAiResponse(agent: AiAgent, userMessage: string): Promise<string> {
    // Mock 响应：模拟 AI 回复（后续对接真实 API 时替换为 fetch SSE）
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const intro = [
      `好的！作为你的**${agent.name}**，我来回答这个问题。`,
      `让我想想...这是一个很好的问题！`,
      `作为**${agent.name}**，我很乐意帮你解答。`,
      `明白了，让我来为你分析一下。`,
    ][Math.floor(Math.random() * 4)];

    const body = [
      `关于"${userMessage.slice(0, 30)}${userMessage.length > 30 ? '...' : ''}"这个问题，以下是我的回答：\n\n这是一个非常值得探讨的话题。从学习角度来看，理解核心概念比死记硬背更加重要。建议你从以下几个方面入手：\n\n1. **理解基础概念** — 确保你对相关的基础知识有清晰的认识\n2. **实践练习** — 通过做题来巩固理解\n3. **查阅资料** — 阅读相关文档或书籍加深理解\n4. **总结归纳** — 将学到的知识整理成自己的体系\n\n> 💡 提示：你可以继续追问具体的问题，或者让我出几道相关的练习题！`,
      `\`\`\`\n${userMessage}\n\`\`\`\n\n这是一个有趣的问题！我来帮你梳理一下思路：\n\n- **关键点1**: 理解问题的核心是什么\n- **关键点2**: 找到相关的知识点\n- **关键点3**: 逐步分析并得出结论\n\n如果你还有其他疑问，随时可以继续问我！`,
    ][Math.floor(Math.random() * 2)];

    return `${intro}\n\n${body}`;
  }
}

export const aiStore = new AiStore();
