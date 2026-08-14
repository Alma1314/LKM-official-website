// HTTP 客户端封装 — 所有 API 请求统一入口
//
// 支持两种运行环境：
//  - SSR（Astro 服务端）：fetch 真实后端（由 API_URL 指定）
//  - 客户端（浏览器）：fetch 同域 /api/*（无跨域），携带 Cookie
//
// 原则：
//  1. 所有请求返回 Result<T, AppError>，不抛异常
//  2. SSR 和 CSR 自动切换 base URL
//  3. 错误消息不含敏感信息（token/key 等）

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { AppError, ErrorCode } from '../errors/error-codes';
import { ok, err } from '../errors/result';
import type { Result } from '../errors/result';
import { getSsrCookie } from '../ssr-context';

/** SSR 时使用真实后端直连地址，客户端时使用同域 /api */
function getApiBase(): string {
  // SSR: Astro 服务端，使用 API_URL 环境变量指向真实后端
  if (typeof window === 'undefined') {
    return process.env.API_URL ?? '';
  }
  // 客户端：同域 /api，无跨域
  return '';
}

let _instance: AxiosInstance | null = null;
let _lastBaseURL = '';

// ── 认证会话适配器：统一从这里读写 token，可被 configureHttpAuthSession 覆盖 ──
export interface HttpAuthSessionAdapter {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(a: string, r: string): void;
  clear(): void;
}

let _adapter: HttpAuthSessionAdapter | null = null;

const defaultAdapter: HttpAuthSessionAdapter = {
  getAccessToken() {
    try {
      const saved = localStorage.getItem('lkm-auth-store');
      if (saved) {
        const data = JSON.parse(saved);
        return data._token ?? null;
      }
    } catch {
      // ignore
    }
    return null;
  },
  getRefreshToken() {
    try {
      const saved = localStorage.getItem('lkm-auth-store');
      if (saved) {
        const data = JSON.parse(saved);
        return data._refreshToken ?? null;
      }
    } catch {
      // ignore
    }
    return null;
  },
  setTokens(a, r) {
    try {
      const store = JSON.parse(localStorage.getItem('lkm-auth-store') || '{}');
      store._token = a;
      store._refreshToken = r;
      localStorage.setItem('lkm-auth-store', JSON.stringify(store));
    } catch {
      // ignore
    }
  },
  clear() {
    try {
      localStorage.removeItem('lkm-auth-store');
    } catch {
      /* ignore */
    }
  },
};

function getAdapter(): HttpAuthSessionAdapter {
  return _adapter ?? defaultAdapter;
}

/** 配置全局认证会话适配器；传 null 恢复为默认 localStorage 行为。 */
export function configureHttpAuthSession(ad: HttpAuthSessionAdapter | null): void {
  _adapter = ad ?? defaultAdapter;
}

/** 只读访问令牌（GraphQL exchange 等无 axios 依赖的消费方用）。 */
export function getHttpAccessToken(): string | null {
  return getAdapter().getAccessToken();
}

/** 只读刷新令牌（供 GraphQL 等非 axios 消费方使用）。 */
export function getHttpRefreshToken(): string | null {
  return getAdapter().getRefreshToken();
}

/** 更新令牌（供 GraphQL 等非 axios 消费方在刷新成功后写入）。 */
export function setHttpTokens(accessToken: string, refreshToken: string): void {
  getAdapter().setTokens(accessToken, refreshToken);
}

/** 清除会话（供 GraphQL 等非 axios 消费方在刷新失败后登出）。 */
export function clearHttpSession(): void {
  getAdapter().clear();
}

function isAxiosError(e: unknown): e is AxiosError {
  return axios.isAxiosError(e);
}

function getInstance(): AxiosInstance {
  const baseURL = getApiBase();

  // baseURL 变化时重建实例（SSR/CSR 切换场景）
  if (_instance && _lastBaseURL !== baseURL) {
    _instance = null;
  }

  if (!_instance) {
    _lastBaseURL = baseURL;
    _instance = axios.create({
      baseURL: baseURL || undefined,
      timeout: 15_000,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true, // 自动携带同域 Cookie
    });

    // Request interceptor: 自动附加 JWT（只给需要认证的端点且有有效 token 时附加）
    _instance.interceptors.request.use((config) => {
      // SSR：转发当前请求携带的 Cookie（B 类认证页面服务端识别用户）
      if (typeof window === 'undefined') {
        const cookie = getSsrCookie();
        if (cookie && config.headers) {
          (config.headers as Record<string, string>)['Cookie'] = cookie;
        }
      }

      const token = getAdapter().getAccessToken();
      if (!token) return config;
      // only attach to authenticated endpoints
      const url = config.url || '';
      const needsAuth =
        (url.startsWith('/api/v1/auth/') &&
          !url.startsWith('/api/v1/auth/login') &&
          !url.startsWith('/api/v1/auth/reg')) ||
        url.startsWith('/graphql');
      if (needsAuth && config.headers) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });

    // --- 401 刷新队列（解决并发 401）---
    let isRefreshing = false;
    let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

    function processQueue(error: unknown, token: string | null = null): void {
      failedQueue.forEach((p) => {
        if (error) p.reject(error);
        else p.resolve(token);
      });
      failedQueue = [];
    }

    // --- JWT 自动刷新拦截器（先注册 = 后执行 reject，确保拿到原始 AxiosError）---
    _instance.interceptors.response.use(
      (res) => res,
      async (error: unknown) => {
        if (!isAxiosError(error) || error.response?.status !== 401) {
          return Promise.reject(error);
        }

        const url = error.config?.url || '';

        if (!error.config || (error.config as unknown as Record<string, unknown>)._retry) {
          // If _retry already set and still 401, token/refresh both invalid — clear and reject silently
          if (
            (error.config as unknown as Record<string, unknown>)._retry &&
            !url.startsWith('/api/v1/auth/login') &&
            !url.startsWith('/api/v1/auth/reg')
          ) {
            getAdapter().clear();
          }
          return Promise.reject(error);
        }

        const isRefreshRequest = url === '/api/v1/auth/refresh';
        if (isRefreshRequest) {
          getAdapter().clear();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            if (token) {
              (error.config!.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
              return _instance!.request(error.config!);
            }
            return Promise.reject(error);
          });
        }

        (error.config as unknown as Record<string, unknown>)._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = getAdapter().getRefreshToken();
          if (refreshToken) {
            const res = await _instance!.post('/api/v1/auth/refresh', { refresh_token: refreshToken }, {
              _retry: true,
            } as Record<string, unknown>);
            const apiResp = res.data as { data?: { access_token: string; refresh_token: string } };
            if (apiResp?.data?.access_token) {
              getAdapter().setTokens(apiResp.data.access_token, apiResp.data.refresh_token);

              (error.config!.headers as Record<string, string>)['Authorization'] =
                `Bearer ${apiResp.data.access_token}`;
              processQueue(null, apiResp.data.access_token);
              isRefreshing = false;
              return _instance!.request(error.config!);
            }
          }
        } catch {
          // ignore
        }

        // Refresh failed — clear storage and reject
        getAdapter().clear();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }
    );

    // --- 通用错误拦截器（后注册 = 先执行 reject，但 401 已被上面的 JWT 拦截器处理）---
    _instance.interceptors.response.use(
      (res) => res,
      (error: unknown) => {
        if (!isAxiosError(error)) {
          return Promise.reject(new AppError(ErrorCode.UNKNOWN_ERROR, '未知错误', error));
        }

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          return Promise.reject(new AppError(ErrorCode.HTTP_TIMEOUT, '请求超时'));
        }

        if (!error.response) {
          return Promise.reject(new AppError(ErrorCode.NETWORK_ERROR, '网络连接失败'));
        }

        const status = error.response.status;
        const code = status >= 500 ? ErrorCode.HTTP_SERVER_ERROR : ErrorCode.HTTP_CLIENT_ERROR;

        let detail = '';
        try {
          const data = error.response.data as unknown;
          if (typeof data === 'string') {
            detail = data.slice(0, 160);
          } else if (data && typeof data === 'object') {
            // 仅暴露后端返回的用户可读 msg/message，避免把完整响应体/内部细节透传
            const body = data as Record<string, unknown>;
            const msg =
              typeof body.msg === 'string' ? body.msg : typeof body.message === 'string' ? body.message : null;
            if (msg) detail = msg.slice(0, 160);
          }
        } catch {
          // ignore
        }

        return Promise.reject(new AppError(code, `请求失败 (${status})${detail ? `：${detail}` : ''}`, error));
      }
    );
  }
  return _instance;
}

/** 配置全局 axios 实例（timeout 等） */
export function configure(config: { baseURL?: string; timeout?: number }): void {
  const instance = getInstance();
  if (config.timeout !== undefined) {
    instance.defaults.timeout = config.timeout;
  }
}

/** 通用请求 */
export async function request<T>(config: AxiosRequestConfig): Promise<Result<T, AppError>> {
  try {
    const res = await getInstance().request<T>(config);
    // unpack {code, msg, data} → return inner data
    const body = res.data as Record<string, unknown> | null;
    if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
      return ok(body.data as T);
    }
    return ok(res.data);
  } catch (e) {
    if (e instanceof AppError) return err(e);
    return err(new AppError(ErrorCode.NETWORK_ERROR, '未知网络错误', e));
  }
}

/** GET 请求 */
export function get<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<Result<T, AppError>> {
  return request<T>({ ...config, url, params, method: 'GET' });
}

/** POST 请求 */
export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<Result<T, AppError>> {
  return request<T>({ ...config, url, data, method: 'POST' });
}

/** PUT 请求 */
export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<Result<T, AppError>> {
  return request<T>({ ...config, url, data, method: 'PUT' });
}

/** PATCH 请求 */
export function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<Result<T, AppError>> {
  return request<T>({ ...config, url, data, method: 'PATCH' });
}

/** DELETE 请求 */
export function del<T>(url: string, config?: AxiosRequestConfig): Promise<Result<T, AppError>> {
  return request<T>({ ...config, url, method: 'DELETE' });
}
