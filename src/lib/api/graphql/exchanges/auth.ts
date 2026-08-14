import { mapExchange } from '@urql/core';
import { getHttpAccessToken } from '~/lib/http/client';
import { getSsrCookie } from '~/lib/ssr-context';

/**
 * 自动附加认证信息到 GraphQL 请求头。
 *
 * 从统一的 HTTP 认证会话适配器读取 access token（默认读 localStorage 'lkm-auth-store' 的 _token 字段），
 * 附加为 Authorization: Bearer <token>。
 * SSR 阶段浏览器 localStorage 不可用，改为转发当前请求的 Cookie（B 类认证页面服务端识别用户）。
 */
export const authExchange = mapExchange({
  onOperation(operation) {
    try {
      const headers: Record<string, string> = {};
      const token = getHttpAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // SSR：无浏览器 token，转发当前请求 Cookie
      if (typeof window === 'undefined') {
        const cookie = getSsrCookie();
        if (cookie) headers['Cookie'] = cookie;
      }

      const prevFetchOptions =
        typeof operation.context.fetchOptions === 'function'
          ? operation.context.fetchOptions()
          : operation.context.fetchOptions;
      operation.context.fetchOptions = {
        ...prevFetchOptions,
        headers: {
          ...((prevFetchOptions as RequestInit)?.headers as Record<string, string>),
          ...headers,
        },
      };
    } catch {
      // ignore parse errors or missing adapter
    }
  },
});
