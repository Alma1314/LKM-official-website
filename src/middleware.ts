// Astro 中间件 — 反向代理 /api/* 和 /graphql 到真实后端
//
// SSR 时 Astro 服务端拦截 /api/* 和 /graphql 请求，
// 转发到由 API_URL 指向的真实后端，
// 并转发客户端 Cookie 实现同域认证。
//
// 对所有页面请求建立 SSR 请求上下文（ssr-context.ts），
// 供服务端数据访问层转发 Cookie，实现 B 类认证页面 SSR 识别用户。

import { defineMiddleware } from 'astro:middleware';
import { runWithRequest } from '~/lib/ssr-context.node';

const API_TARGET = process.env.API_URL ?? '';

// hop-by-hop 头与 body 相关头不能原样转发给 fetch，
// 否则与重写后的 body / fetch 自身的压缩协商冲突。
const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'content-length',
  'upgrade',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isProxyPath = pathname.startsWith('/api/') || pathname.startsWith('/graphql');

  // 非代理路径：建立 SSR 请求上下文，供页面 SSR 数据获取转发 Cookie
  if (!isProxyPath) {
    const response = await runWithRequest(context.request.headers, () => next());
    // 兜底：Astro SSR 生成的 HTML 可能不含 <meta charset>（或它被 vite/字体脚本
    // 挤到字节嗅探窗口之外），浏览器会按 latin1 解码中文导致 Vue 水合 mismatch。
    // 显式声明 text/html 响应头的 charset=UTF-8，确保编码确定，不依赖 <meta> 嗅探。
    const ct = response.headers.get('Content-Type');
    if (ct && ct.startsWith('text/html') && !/;\s*charset=/i.test(ct)) {
      const headers = new Headers(response.headers);
      headers.set('Content-Type', `${ct}; charset=UTF-8`);
      return new Response(response.body, { status: response.status, headers });
    }
    return response;
  }

  try {
    if (!API_TARGET) {
      return new Response(
        JSON.stringify({ error: { code: 'PROXY_NOT_CONFIGURED', message: 'API_URL 未配置，无法代理后端请求' } }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const targetUrl = new URL(context.url.pathname + context.url.search, API_TARGET);

    // 转发客户端原始请求头（Cookie、Authorization 等），跳过 hop-by-hop 头
    const headers = new Headers();
    for (const [key, value] of context.request.headers) {
      if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) continue;
      headers.set(key, value);
    }

    // 构建转发请求
    const body = ['GET', 'HEAD'].includes(context.request.method) ? undefined : await context.request.text();

    // eslint-disable-next-line no-restricted-globals
    const response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers,
      body,
    });

    // 返回真实后端的响应（保留状态码和响应头）
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
