import { mapExchange } from '@urql/core';

/**
 * 自动附加 JWT token 到 GraphQL 请求头。
 * 从 localStorage 'lkm-auth-store' 读取 _token 字段，
 * 附加为 Authorization: Bearer <token>。
 */
export const authExchange = mapExchange({
  onOperation(operation) {
    try {
      const saved = localStorage.getItem('lkm-auth-store');
      if (saved) {
        const data = JSON.parse(saved);
        const token = data._token;
        if (token) {
          const prevFetchOptions =
            typeof operation.context.fetchOptions === 'function'
              ? operation.context.fetchOptions()
              : operation.context.fetchOptions;
          operation.context.fetchOptions = {
            ...prevFetchOptions,
            headers: {
              ...((prevFetchOptions as RequestInit)?.headers as Record<string, string>),
              Authorization: `Bearer ${token}`,
            },
          };
        }
      }
    } catch {
      // ignore parse errors or missing localStorage
    }
  },
});
