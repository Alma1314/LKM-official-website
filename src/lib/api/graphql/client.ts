import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { authExchange } from './exchanges/auth';
import { errorExchange } from './exchanges/error';

/**
 * 运行时获取 GraphQL URL，自动带上 BASE_URL 前缀
 */
function getGraphqlUrl(): string {
  if (import.meta.env.PUBLIC_GRAPHQL_URL) return import.meta.env.PUBLIC_GRAPHQL_URL;

  // SSR: 使用完整的内网 URL
  if (typeof window === 'undefined') {
    return (import.meta.env.API_URL || 'http://localhost:8000') + '/graphql';
  }

  // CSR: 完整 URL（urql 内部用 new URL() 解析，必须有 origin）
  const base = window.__BASE_URL__ || import.meta.env.BASE_URL || '/';
  const cleanBase = base.replace(/\/$/, '');
  return `${window.location.origin}${cleanBase}/graphql`;
}

/**
 * urql GraphQL 客户端 — SSR/CSR 共享实例
 *
 * SSR 时 fetch 到内网 FastAPI（由 Astro middleware 代理），
 * CSR 时同域 /graphql → Astro middleware → FastAPI。
 */
export const graphqlClient = new Client({
  url: getGraphqlUrl(),
  exchanges: [cacheExchange, authExchange, errorExchange, fetchExchange],
});
