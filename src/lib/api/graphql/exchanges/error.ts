import { mapExchange } from '@urql/core';
import type { Operation } from '@urql/core';
import { getHttpRefreshToken, setHttpTokens, clearHttpSession } from '~/lib/http/client';
// 循环依赖安全：graphqlClient 仅在异步刷新回调内访问，模块求值阶段不触碰
import { graphqlClient } from '../client';

// --- 401 刷新辅助函数 ---

/** 尝试刷新 token，成功返回 true */
async function tryRefreshToken(): Promise<boolean> {
  const rt = getHttpRefreshToken();
  if (!rt) return false;
  try {
    const base = typeof window === 'undefined' ? process.env.API_URL || '' : '';
    // eslint-disable-next-line no-restricted-globals
    const res = await fetch(`${base}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    const data = (json as { data?: { access_token: string; refresh_token: string } }).data;
    if (!data?.access_token) return false;
    // 统一通过 HTTP 会话适配器写入，与 axios 刷新路径共享同一状态源
    setHttpTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// --- 并发刷新控制 ---
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshOnce(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = tryRefreshToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });
  return refreshPromise;
}

function isUnauthorized(error: unknown): boolean {
  const netErr = error as { networkError?: { status?: number } };
  return netErr?.networkError?.status === 401;
}

/**
 * 统一 GraphQL 错误处理 + 401 自动刷新重试。
 *
 * - 网络错误和 GraphQL errors 会 console.warn（Phase 2+ 可接入全局 toast）
 * - 检测到 401 时自动刷新 token，成功后重发原操作（带 _retry 标记防循环）
 * - 刷新失败则清空会话（等同登出）
 */
export const errorExchange = mapExchange({
  onError(error, operation) {
    // 401 自动刷新 + 重发原请求
    if (isUnauthorized(error)) {
      const retried = (operation.context as Record<string, unknown>)._retry === true;
      refreshOnce().then((ok) => {
        if (ok) {
          if (retried) return; // 已重试过仍 401，不再循环
          graphqlClient.reexecuteOperation({
            ...operation,
            context: { ...operation.context, _retry: true },
          } as Operation);
        } else {
          clearHttpSession();
        }
      });
      return; // 已处理，跳过后续 console.warn
    }
    if (error.networkError) {
      console.warn('[GraphQL] Network error:', error.networkError.message);
    }
    if (error.graphQLErrors.length > 0) {
      for (const gqlErr of error.graphQLErrors) {
        console.warn(`[GraphQL] ${gqlErr.message}`);
      }
    }
  },
});
