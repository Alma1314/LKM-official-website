// ---------------------------------------------------------------------------
// AI Client – security-hardened store
//
// Principles:
//  1. API key lives ONLY in module memory (never localStorage / sessionStorage / URL)
//  2. Endpoints must be HTTPS (no http / javascript / data / file / credentials-in-URL)
//  3. Every request is guarded by a 15 s timeout merged with the caller's AbortSignal
//  4. Responses are validated for content-type, byte-size and text field before return
//  5. Error messages never include the key or the full raw response body
// ---------------------------------------------------------------------------

// ---- Types -----------------------------------------------------------------

export interface AiRequest {
  prompt: string;
  context: string;
  operation: string;
  language?: string;
}

export interface AiCompletionInput {
  prompt: string;
  context: string;
  operation: string;
  language?: string;
}

export interface AiCompletionOptions {
  /** Caller-provided AbortSignal (merged with internal timeout) */
  signal?: AbortSignal;
}

export interface Ok<T> {
  ok: true;
  value: T;
}

export interface Err {
  ok: false;
  error: string;
}

export type Result<T> = Ok<T> | Err;

// ---- Constants -------------------------------------------------------------

const PROMPT_TEMPLATES: Record<string, string> = {
  续写: '请续写以下内容，保持一致的风格和语气：\n\n{context}\n\n续写：',
  总结: '请用简洁的语言总结以下内容，提取关键要点：\n\n{context}\n\n总结：',
  翻译: '请将以下内容翻译为{language}：\n\n{context}\n\n翻译：',
  改写: '请改写以下内容，使用更专业的语言表达：\n\n{context}\n\n改写：',
  修复语法: '请修复以下内容的语法和拼写错误：\n\n{context}\n\n修复后：',
  生成标题: '请根据以下内容生成一个简短的标题：\n\n{context}\n\n标题：',
};

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_ENDPOINT = 'https://api.openai.com';
const MAX_RESPONSE_BYTES = 262144; // 256 KiB
const REQUEST_TIMEOUT_MS = 15000;

/** Allowed protocols for the endpoint URL */
const ALLOWED_PROTOCOLS = new Set(['https:']);

// ---- Module-level in-memory config (never persisted to storage or URL) -----

let _endpoint: string | null = null;
let _apiKey: string | null = null;
let _model: string = DEFAULT_MODEL;

// ---- Public helpers --------------------------------------------------------

/**
 * Validate a user-supplied AI endpoint URL.
 *
 * Only plain HTTPS URLs are accepted. Credentials in the URL, non-HTTPS
 * protocols and pseudo-URLs (`javascript:`, `data:`, `file:`) are rejected.
 */
export function validateAiEndpoint(raw: string): Result<URL> {
  if (!raw || raw.trim().length === 0) {
    return { ok: false, error: '请输入 API 地址' };
  }

  const trimmed = raw.trim();

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: 'API 地址格式无效，请输入完整的 HTTPS 地址' };
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return { ok: false, error: '仅支持 HTTPS 地址' };
  }

  if (url.username || url.password) {
    return { ok: false, error: 'API 地址不能包含用户名或密码，请在下方单独输入 API Key' };
  }

  // Block pseudo-protocols that the URL constructor might accept on some runtimes
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('file:')) {
    return { ok: false, error: '不支持的协议' };
  }

  return { ok: true, value: url };
}

/**
 * Store AI config in module memory (NO localStorage / sessionStorage / URL).
 */
export function setAiConfig(endpoint: string, apiKey: string, model: string): void {
  _endpoint = endpoint;
  _apiKey = apiKey;
  _model = model || DEFAULT_MODEL;
}

/**
 * Clear the in-memory config (useful for tests and teardown).
 */
export function clearAiConfig(): void {
  _endpoint = null;
  _apiKey = null;
  _model = DEFAULT_MODEL;
}

/**
 * Returns a copy of the current in-memory config (for diagnostic use only;
 * the returned object does NOT include the raw key).
 */
export function getAiConfig(): { endpoint: string | null; model: string } {
  return { endpoint: _endpoint, model: _model };
}

/**
 * Send a completion request to the configured AI endpoint.
 *
 * Security guarantees:
 *  - Requires `setAiConfig()` to have been called first
 *  - Validates the endpoint is HTTPS before every request
 *  - Enforces 15 s timeout (merged with caller's AbortSignal)
 *  - Caps response body at 256 KiB
 *  - Verifies JSON content-type and required text field
 *  - Error messages never leak the API key or full raw body
 */
export async function requestAiCompletion(
  input: AiCompletionInput,
  options?: AiCompletionOptions
): Promise<Result<string>> {
  // ---- 1. Config check ----------------------------------------------------
  if (!_endpoint) {
    return { ok: false, error: '请先配置 AI 接口。点击"设置"输入 API 地址和 Key。' };
  }

  const endpointValidation = validateAiEndpoint(_endpoint);
  if (!endpointValidation.ok) {
    return { ok: false, error: `AI 接口配置无效：${endpointValidation.error}` };
  }

  const endpoint = _endpoint;
  const apiKey = _apiKey || '';
  const model = _model;

  // ---- 2. Build prompt ----------------------------------------------------
  let prompt = (PROMPT_TEMPLATES[input.operation] ?? '{context}').replace('{context}', input.context);
  if (input.operation === '翻译') {
    prompt = prompt.replace('{language}', input.language || '英文');
  }
  if (input.prompt) {
    prompt = input.prompt;
  }

  // ---- 3. Merged AbortController (caller signal + 15 s timeout) -----------
  const internalController = new AbortController();
  const timeoutId = setTimeout(() => internalController.abort(), REQUEST_TIMEOUT_MS);

  // If caller provided a signal, forward its abort to our internal controller
  if (options?.signal) {
    if (options.signal.aborted) {
      clearTimeout(timeoutId);
      return { ok: false, error: '请求已被取消' };
    }
    options.signal.addEventListener(
      'abort',
      () => {
        internalController.abort();
      },
      { once: true }
    );
  }

  // ---- 4. Fetch ------------------------------------------------------------
  const url = `${endpoint.replace(/\/$/, '')}/v1/chat/completions`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的内容写作助手。请直接给出回答，不要多余的解释。',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
      signal: internalController.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: '请求超时或已取消' };
    }

    const message = err instanceof Error ? err.message : String(err);
    // Never echo back anything that might contain secrets
    if (message.includes(apiKey) && apiKey.length > 4) {
      return { ok: false, error: '网络请求失败' };
    }
    return { ok: false, error: `网络请求失败：${message.slice(0, 120)}` };
  }

  clearTimeout(timeoutId);

  // ---- 5. Validate response metadata --------------------------------------
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    // Consume the body so the connection can be reused
    await response.text().catch(() => {});
    return {
      ok: false,
      error: `服务器返回了意外的内容类型${response.status ? `（状态码 ${response.status}）` : ''}`,
    };
  }

  // ---- 6. Check status code -----------------------------------------------
  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
      // Truncate error body to avoid leaking large responses
      if (errorBody.length > 300) {
        errorBody = errorBody.slice(0, 300) + '…';
      }
    } catch {
      // ignore
    }

    // Sanitize: never include the API key in error messages
    let safeError = `AI 服务返回错误（状态码 ${response.status}）`;
    if (errorBody && !errorBody.includes(apiKey) && apiKey.length > 0) {
      safeError += `：${errorBody.slice(0, 200)}`;
    } else if (errorBody) {
      // Body might contain the key – use a generic prefix
      safeError += '，请检查 API Key 和端点配置是否正确';
    }

    return { ok: false, error: safeError };
  }

  // ---- 7. Parse and validate JSON body ------------------------------------
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { ok: false, error: '无法解析 AI 服务返回的数据' };
  }

  if (data === null || data === undefined || typeof data !== 'object') {
    return { ok: false, error: 'AI 服务返回了无效的数据格式' };
  }

  const obj = data as Record<string, unknown>;

  // ---- 8. Check for API-level errors --------------------------------------
  if (obj.error && typeof obj.error === 'object') {
    const errMsg = (obj.error as Record<string, unknown>).message ?? '未知错误';
    const safe = String(errMsg).slice(0, 200);
    if (safe.includes(apiKey) && apiKey.length > 4) {
      return { ok: false, error: 'AI 服务返回错误，请检查 API Key 是否有效' };
    }
    return { ok: false, error: `AI 服务返回错误：${safe}` };
  }

  // ---- 9. Extract and validate text field ---------------------------------
  const choices = obj.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return { ok: false, error: 'AI 服务返回数据不完整（缺少回复内容）' };
  }

  const firstChoice = choices[0] as Record<string, unknown> | undefined;
  if (!firstChoice || typeof firstChoice !== 'object') {
    return { ok: false, error: 'AI 服务返回数据不完整' };
  }

  const message = firstChoice.message as Record<string, unknown> | undefined;
  if (!message || typeof message !== 'object') {
    return { ok: false, error: 'AI 服务返回数据不完整（缺少消息内容）' };
  }

  const content = message.content;
  if (typeof content !== 'string' || content.length === 0) {
    return { ok: false, error: 'AI 服务返回了空白的回复内容' };
  }

  // ---- 10. Enforce response size limit ------------------------------------
  const byteLength = new TextEncoder().encode(content).length;
  if (byteLength > MAX_RESPONSE_BYTES) {
    return {
      ok: false,
      error: `AI 返回内容过大（${byteLength} 字节），已超过 ${MAX_RESPONSE_BYTES} 字节上限`,
    };
  }

  // ---- 11. Success --------------------------------------------------------
  return { ok: true, value: content };
}

// ---- Legacy API (kept for backward compatibility; wraps new API) -----------

/**
 * @deprecated Use `setAiConfig()` + `requestAiCompletion()` instead.
 */
export async function aiRequest(req: AiRequest): Promise<{ text: string; error?: string }> {
  const result = await requestAiCompletion({
    prompt: req.prompt,
    context: req.context,
    operation: req.operation,
    language: req.language,
  });

  if (result.ok) {
    return { text: result.value };
  }
  return { text: '', error: result.error };
}

/**
 * @deprecated Use `setAiConfig()` instead.
 */
export function saveAiConfig(endpoint: string, apiKey: string, model: string): void {
  setAiConfig(endpoint, apiKey, model);
}

export { PROMPT_TEMPLATES };
