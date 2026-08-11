import { mapExchange } from '@urql/core';

// --- 401 刷新辅助函数 ---

function getRefreshToken(): string | null {
  try {
    const saved = localStorage.getItem('lkm-auth-store');
    if (saved) {
      const data = JSON.parse(saved);
      return data._refreshToken ?? null;
    }
  } catch {
    // ignore
  }
  return null;
}

/** 尝试刷新 token，成功返回 true */
async function tryRefreshToken(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const base =
      typeof window === 'undefined'
        ? ((import.meta as unknown as { env: Record<string, unknown> }).env.API_URL as string) || ''
        : '';
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
    const saved = JSON.parse(localStorage.getItem('lkm-auth-store') || '{}');
    saved._token = data.access_token;
    saved._refreshToken = data.refresh_token;
    localStorage.setItem('lkm-auth-store', JSON.stringify(saved));
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

/**
 * 统一 GraphQL 错误处理 + 401 自动刷新。
 *
 * - 网络错误和 GraphQL errors 会 console.warn（Phase 2+ 可接入全局 toast）
 * - 检测到 401 时自动尝试 refresh token
 * - refresh 失败则清空 localStorage（等同登出）
 */
export const errorExchange = mapExchange({
  onError(error, _operation) {
    // 401 自动刷新
    if (error.networkError) {
      const netErr = error.networkError as { status?: number };
      if (netErr?.status === 401) {
        refreshOnce().then((ok) => {
          if (!ok) {
            try {
              localStorage.removeItem('lkm-auth-store');
            } catch {
              // ignore
            }
          }
        });
        return; // 已处理，跳过后续 console.warn
      }
      console.warn('[GraphQL] Network error:', error.networkError.message);
    }
    if (error.graphQLErrors.length > 0) {
      for (const gqlErr of error.graphQLErrors) {
        console.warn(`[GraphQL] ${gqlErr.message}`);
      }
    }
  },
});
