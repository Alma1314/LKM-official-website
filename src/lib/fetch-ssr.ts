import { getSsrCookie } from "./ssr-context";
import { t } from "./i18n";

/**
 * SSR fetch 工具：超时降级 + 统一错误处理
 * 接入真实后端后，SSR 页面每次请求同步 fetch 后端 API 会成为瓶颈。
 * 此工具对所有 SSR fetch 加超时控制，超时后返回 fallback 值避免阻塞渲染。
 */

const SSR_TIMEOUT_MS = 3000; // 3 秒超时

// 用 process.env 运行时读取 API_URL。import.meta.env 会在构建时被静态内联，
// 导致运行时注入的 API_URL 失效。此模块仅在 SSR 服务端使用。
const API_BASE = process.env.API_URL ?? "";

interface FetchOptions {
  /** 超时毫秒数，默认 SSR_TIMEOUT_MS */
  timeout?: number;
  /** 超时或错误时的回退值 */
  fallback: unknown;
}

/**
 * SSR 安全的 fetch 封装，带超时和降级
 * @param path API 路径（如 /api/v1/articles）
 * @param options 超时和 fallback 配置
 * @returns { data: T | null, error: string | null }
 */
export async function ssrFetch<T>(
  path: string,
  options: FetchOptions,
): Promise<{ data: T | null; error: string | null }> {
  const { timeout = SSR_TIMEOUT_MS, fallback } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    // 转发当前 SSR 请求的 Cookie，使认证类接口在服务端可用
    const cookie = getSsrCookie();
    if (cookie) headers["Cookie"] = cookie;

    // eslint-disable-next-line no-restricted-globals
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        data: fallback as T,
        error:
          ((body as Record<string, unknown>).msg as string) ||
          t("messages.httpError", { status: res.status }),
      };
    }

    const json = await res.json();
    if (json.code === 0) {
      return { data: json.data as T, error: null };
    }

    return {
      data: fallback as T,
      error: (json.msg as string) || t("messages.unknownError"),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? t("messages.requestTimeout")
        : err instanceof Error
          ? err.message
          : t("messages.networkError");
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
