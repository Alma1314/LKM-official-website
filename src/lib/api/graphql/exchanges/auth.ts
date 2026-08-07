import { mapExchange } from '@urql/core';
import { getHttpAccessToken } from '~/lib/http/client';

/**
 * 自动附加 JWT token 到 GraphQL 请求头。
 * 从统一的 HTTP 认证会话适配器读取 access token（默认读 localStorage 'lkm-auth-store' 的 _token 字段），
 * 附加为 Authorization: Bearer <token>。
 */
export const authExchange = mapExchange({
  onOperation(operation) {
    try {
      const token = getHttpAccessToken();
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
    } catch {
      // ignore parse errors or missing adapter
    }
  },
});
