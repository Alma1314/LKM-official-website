// src/lib/api/fetch.ts
// 统一 fetch wrapper — 用于需要原生 fetch 能力的场景（SSE / AbortController / 流式响应）
//
// 设计：
//  - SSR 时直连 FastAPI 内网地址
//  - CSR 时使用同域 /api
//  - 所有请求返回 Result<Response, AppError>
//  - 调用方自行处理 response.body（如 ReadableStream for SSE）
//  - 调用方可通过 init.signal 传入 AbortController 的 signal
//
// 使用场景：
//  - AI 客户端（外部 OpenAI API）→ apiFetch() with AbortController
//  - 需要 SSE 流式读取的场景
//  - 不适用于普通 REST 请求 → 请使用 ~/lib/http/client 的 get/post/put/del

import { AppError, ErrorCode } from '../errors/error-codes';
import { ok, err } from '../errors/result';
import type { Result } from '../errors/result';

const DEFAULT_TIMEOUT_MS = 15_000;

function getApiBase(): string {
  if (typeof window === 'undefined') {
    return (
      ((import.meta as unknown as { env: Record<string, unknown> }).env.API_URL as string) || 'http://localhost:8000'
    );
  }
  return '';
}

function createTimeoutSignal(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

/**
 * 合并多个 AbortSignal：任一触发则合并后的 signal 触发
 */
function mergeAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  const onAbort = () => {
    controller.abort();
    signals.forEach((s) => s.removeEventListener('abort', onAbort));
  };
  signals.forEach((s) => {
    if (s.aborted) {
      controller.abort();
      return;
    }
    s.addEventListener('abort', onAbort, { once: true });
  });
  return controller.signal;
}

/**
 * 统一 fetch wrapper。
 *
 * 自动处理 SSR/CSR base URL 拼接，添加默认 timeout。
 * 调用方通过 init.signal 传入自定义 AbortController（会与内部 timeout 合并）。
 */
export async function apiFetch(
  url: string,
  init?: RequestInit & { timeout?: number }
): Promise<Result<Response, AppError>> {
  const base = getApiBase();
  const fullUrl = base ? `${base.replace(/\/$/, '')}${url}` : url;
  const timeout = init?.timeout ?? DEFAULT_TIMEOUT_MS;

  const timeoutCtl = createTimeoutSignal(timeout);
  const externalSignal = init?.signal;
  const mergedSignal = externalSignal ? mergeAbortSignals([timeoutCtl.signal, externalSignal]) : timeoutCtl.signal;

  const { signal: _sig, timeout: _to, ...restInit } = init || {};
  void _sig;
  void _to;

  try {
    // eslint-disable-next-line no-restricted-globals
    const response = await fetch(fullUrl, {
      ...restInit,
      signal: mergedSignal,
    });
    timeoutCtl.clear();
    return ok(response);
  } catch (e: unknown) {
    timeoutCtl.clear();

    if (e instanceof DOMException && e.name === 'AbortError') {
      return err(new AppError(ErrorCode.HTTP_TIMEOUT, '请求超时或已取消'));
    }

    const message = e instanceof Error ? e.message : String(e);
    return err(new AppError(ErrorCode.NETWORK_ERROR, `网络请求失败：${message.slice(0, 300)}`));
  }
}
