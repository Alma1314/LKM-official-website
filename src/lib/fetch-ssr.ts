/**
 * SSR fetch 工具：超时降级 + 统一错误处理
 * 接入真实后端后，SSR 页面每次请求同步 fetch 后端 API 会成为瓶颈。
 * 此工具对所有 SSR fetch 加超时控制，超时后返回 fallback 值避免阻塞渲染。
 */

const SSR_TIMEOUT_MS = 3000; // 3 秒超时
const API_BASE = process.env.BACKEND_URL || 'http://localhost:8000';

interface FetchOptions {
  /** 超时毫秒数，默认 SSR_TIMEOUT_MS */
  timeout?: number;
  /** 超时或错误时的回退值 */
  fallback: unknown;
}

/**
 * SSR 安全的 fetch 封装，带超时和降级
 * @param path API 路径（如 /api/articles）
 * @param options 超时和 fallback 配置
 * @returns { data: T | null, error: string | null }
 */
export async function ssrFetch<T>(path: string, options: FetchOptions): Promise<{ data: T | null; error: string | null }> {
  const { timeout = SSR_TIMEOUT_MS, fallback } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: fallback as T, error: (body as Record<string, unknown>).msg as string || `HTTP ${res.status}` };
    }

    const json = await res.json();
    if (json.code === 0) {
      return { data: json.data as T, error: null };
    }

    return { data: fallback as T, error: (json.msg as string) || '未知错误' };
  } catch (err: unknown) {
    const message = err instanceof Error && err.name === 'AbortError' ? '请求超时' : (err instanceof Error ? err.message : '网络错误');
    return { data: fallback as T, error: message };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 校验返回数据，如果有错误或数据为空则在控制台记录（不抛异常，避免崩页面）
 */
export function logSsrError(context: string, error: string | null): void {
  if (error) {
    console.warn(`[SSR] ${context}: ${error}`);
  }
}
