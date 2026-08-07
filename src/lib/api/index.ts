// src/lib/api — 统一数据访问层
//
// 设计：
//  - 基于 src/lib/http/client.ts 的 axios 封装
//  - SSR（Astro 服务端）和 CSR（浏览器 Vue/Svelte/React）共用
//  - SSR 时 axios 自动使用内网地址直连 FastAPI
//  - CSR 时 axios 使用同域 /api（无跨域，由 Astro 中间件代理）
//  - 每个模块的 API 返回 Result<T, AppError>

export { forumApi } from './modules/forum';
export { blogApi, blogPostApi } from './modules/blog';
export { competitionApi } from './modules/competition';
export { columnApi } from './modules/column';
export { qaApi } from './modules/qa';
export { projectApi } from './modules/project';
export { fileLibraryApi } from './modules/file-library';
export { treeholeApi } from './modules/treehole';
export { teamApi } from './modules/team';
export { authApi } from './modules/auth';
export { userApi } from './modules/user';
export { notificationApi } from './modules/notification';

// GraphQL 客户端
export { graphqlClient, graphql } from './graphql';

// 统一 fetch wrapper（用于 SSE/AbortController 场景）
export { apiFetch } from './fetch';

// Blog 类型
export type * from './modules/blog-types';
