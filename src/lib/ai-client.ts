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

const PROMPT_TEMPLATES: Record<string, string> = {
  续写: '请续写以下内容，保持一致的风格和语气：\n\n{context}\n\n续写：',
  总结: '请用简洁的语言总结以下内容，提取关键要点：\n\n{context}\n\n总结：',
  翻译: '请将以下内容翻译为{language}：\n\n{context}\n\n翻译：',
  改写: '请改写以下内容，使用更专业的语言表达：\n\n{context}\n\n改写：',
  修复语法: '请修复以下内容的语法和拼写错误：\n\n{context}\n\n修复后：',
  生成标题: '请根据以下内容生成一个简短的标题：\n\n{context}\n\n标题：',
};

/**
 * 从 URL 参数读取临时 API 配置。
 * 用法：访问 /admin/documents/editor?ai_endpoint=https://api.openai.com&ai_key=sk-xxx
 * 或通过 #hash 传递：#ai_endpoint=...&ai_key=...
 */
function getConfigFromQuery(): { endpoint: string; apiKey: string; model: string } | null {
  try {
    const params = new URLSearchParams(window.location.search);
    let endpoint = params.get('ai_endpoint');
    let apiKey = params.get('ai_key');
    let model = params.get('ai_model');

    // 也可从 hash 读取
    if (!endpoint && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      endpoint = hashParams.get('ai_endpoint');
      apiKey = hashParams.get('ai_key');
      model = model || hashParams.get('ai_model');
    }

    if (!endpoint) return null;
    return { endpoint, apiKey: apiKey || '', model: model || 'gpt-3.5-turbo' };
  } catch {
    return null;
  }
}

/**
 * 对 Base64 做简单混淆，避免明文存储。
 * 这不是真正的加密，只是防止扫一眼就看到明文。
 * 生产环境应使用服务端代理。
 */
function obfuscate(str: string): string {
  if (!str) return '';
  try {
    return btoa(str.split('').reverse().join(''));
  } catch {
    return '';
  }
}

function deobfuscate(str: string): string {
  if (!str) return '';
  try {
    return atob(str).split('').reverse().join('');
  } catch {
    return '';
  }
}

export async function aiRequest(req: AiRequest): Promise<AiResponse> {
  // 1) 尝试从 URL 参数获取临时配置
  const queryConfig = getConfigFromQuery();
  if (queryConfig) {
    return doAiRequest(req, queryConfig.endpoint, queryConfig.apiKey, queryConfig.model);
  }

  // 2) 尝试从 sessionStorage 获取（浏览器关闭后自动清除）
  try {
    const raw = sessionStorage.getItem('_as');
    if (raw) {
      const cfg = JSON.parse(raw);
      return doAiRequest(req, deobfuscate(cfg.e), deobfuscate(cfg.k), cfg.m || 'gpt-3.5-turbo');
    }
  } catch {
    // ignore
  }

  return {
    text: '',
    error: '请先配置 AI 接口。在 AI 面板中点击"设置"输入 API 地址和 Key，或通过 URL 参数传递临时配置。',
  };
}

async function doAiRequest(req: AiRequest, endpoint: string, apiKey: string, model: string): Promise<AiResponse> {
  let prompt = (PROMPT_TEMPLATES[req.operation] ?? '{context}').replace('{context}', req.context);
  if (req.operation === '翻译') {
    prompt = prompt.replace('{language}', req.language || '英文');
  }
  if (req.prompt) {
    prompt = req.prompt;
  }

  try {
    const response = await fetch(`${endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
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

/**
 * 存储 AI 配置到 sessionStorage（浏览器关闭后自动清除）。
 * Key 通过简单混淆存储，避免明文扫描。
 */
export function saveAiConfig(endpoint: string, apiKey: string, model: string): void {
  try {
    sessionStorage.setItem(
      '_as',
      JSON.stringify({
        e: obfuscate(endpoint),
        k: obfuscate(apiKey),
        m: model,
      })
    );
  } catch {
    // ignore storage errors
  }
}

export { PROMPT_TEMPLATES };
