export interface AiConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface AiRequest {
  prompt: string;
  context: string;
  operation: string;
  language?: string;
}

export interface AiResponse {
  text: string;
  error?: string;
}

const DEFAULT_MODEL = 'gpt-3.5-turbo';

function getConfig(): AiConfig | null {
  try {
    const raw = localStorage.getItem('lkm-ai-config');
    if (!raw) return null;
    const config = JSON.parse(raw) as AiConfig;
    if (!config.endpoint) return null;
    return { ...config, model: config.model || DEFAULT_MODEL };
  } catch {
    return null;
  }
}

export function saveAiConfig(config: AiConfig): void {
  localStorage.setItem('lkm-ai-config', JSON.stringify(config));
}

const PROMPT_TEMPLATES: Record<string, string> = {
  续写: '请续写以下内容，保持一致的风格和语气：\n\n{context}\n\n续写：',
  总结: '请用简洁的语言总结以下内容，提取关键要点：\n\n{context}\n\n总结：',
  翻译: '请将以下内容翻译为{language}：\n\n{context}\n\n翻译：',
  改写: '请改写以下内容，使用更专业的语言表达：\n\n{context}\n\n改写：',
  修复语法: '请修复以下内容的语法和拼写错误：\n\n{context}\n\n修复后：',
  生成标题: '请根据以下内容生成一个简短的标题：\n\n{context}\n\n标题：',
};

export async function aiRequest(req: AiRequest): Promise<AiResponse> {
  const config = getConfig();
  if (!config) {
    return { text: '', error: '请先在右上角配置 AI 接口（打开 AI 面板 → 设置）。支持 OpenAI 兼容 API。' };
  }

  let prompt = (PROMPT_TEMPLATES[req.operation] ?? '{context}').replace('{context}', req.context);
  if (req.operation === '翻译') {
    prompt = prompt.replace('{language}', req.language || '英文');
  }
  if (req.prompt) {
    prompt = req.prompt;
  }

  try {
    const response = await fetch(`${config.endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是一个专业的内容写作助手。请直接给出回答，不要多余的解释。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { text: '', error: `API 请求失败 (${response.status}): ${err.slice(0, 200)}` };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (data.error) {
      return { text: '', error: data.error.message || '未知错误' };
    }

    const text = data.choices?.[0]?.message?.content ?? '';
    return { text };
  } catch (err) {
    return { text: '', error: `网络错误: ${(err as Error).message}` };
  }
}

export { PROMPT_TEMPLATES };
