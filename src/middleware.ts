// Astro 中间件 — 反向代理 /api/* 和 /graphql 到 FastAPI
//
// SSR 时 Astro 服务端拦截 /api/* 和 /graphql 请求，
// 转发到内网 FastAPI（Docker 内部 / localhost），
// 并转发客户端 Cookie 实现同域认证。

import { defineMiddleware } from 'astro:middleware';

const API_TARGET = import.meta.env.API_URL || 'http://localhost:8000';

export const onRequest = defineMiddleware(async (context, next) => {
  // 代理 /api/ 和 /graphql 路径
  const { pathname } = context.url;
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/graphql')) {
    return next();
  }

  try {
    const targetUrl = new URL(context.url.pathname + context.url.search, API_TARGET);

    // 转发客户端请求头（Cookie、Authorization 等）
    const headers = new Headers();

    // 复制客户端原始请求头
    for (const [key, value] of context.request.headers) {
      // 跳过 host 头，使用目标地址的 host
      if (key === 'host') continue;
      headers.set(key, value);
    }

    // 构建转发请求
    const body = ['GET', 'HEAD'].includes(context.request.method) ? undefined : await context.request.text();

    const response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers,
      body,
    });

    // 返回 FastAPI 的响应（保留状态码和响应头）
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch {
    return new Response(JSON.stringify({ error: { code: 'PROXY_ERROR', message: '后端服务不可用' } }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
