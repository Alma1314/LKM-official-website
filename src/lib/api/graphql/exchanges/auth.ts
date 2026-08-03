import { mapExchange } from '@urql/core';

/**
 * 自动附加 JWT token 到 GraphQL 请求头。
 * Phase 1: 公开查询阶段不附加 Authorization，留空等认证模块接入。
 */
export const authExchange = mapExchange({
  onOperation(_operation) {
    // Phase 2+ 在此从 localStorage 读取 token 并设置 Authorization header
  },
});
