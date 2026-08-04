import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { authExchange } from './exchanges/auth';
import { errorExchange } from './exchanges/error';

/**
 * urql GraphQL 客户端 — SSR/CSR 共享实例
 *
 * SSR 时 fetch 到内网 FastAPI（由 Astro middleware 代理），
 * CSR 时同域 /graphql → Astro middleware → FastAPI。
 */
export const graphqlClient = new Client({
  url: import.meta.env.PUBLIC_GRAPHQL_URL || '/graphql',
  exchanges: [cacheExchange, authExchange, errorExchange, fetchExchange],
});
