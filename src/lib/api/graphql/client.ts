import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { authExchange } from './exchanges/auth';
import { errorExchange } from './exchanges/error';

/**
 * 运行时获取 GraphQL URL，自动带上 BASE_URL 前缀
 */
function getGraphqlUrl(): string {
  if (import.meta.env.PUBLIC_GRAPHQL_URL) return import.meta.env.PUBLIC_GRAPHQL_URL;

  const base = (typeof window !== 'undefined' && window.__BASE_URL__) || import.meta.env.BASE_URL || '/';
  // 去掉末尾斜杠后拼接 /graphql
  const cleanBase = base.replace(/\/$/, '');
  return `${cleanBase}/graphql`;
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
