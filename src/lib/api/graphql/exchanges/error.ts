import { mapExchange } from '@urql/core';

/**
 * 统一 GraphQL 错误处理。
 * 将网络错误和 GraphQL errors 转换为 console.warn，
 * Phase 2+ 可接入全局 toast。
 */
export const errorExchange = mapExchange({
  onError(error, _operation) {
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
