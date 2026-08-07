// HTTP 客户端封装 — 所有 API 请求统一入口
//
// 支持两种运行环境：
//  - SSR（Astro 服务端）：fetch FastAPI 内网地址（Docker 内部 / localhost）
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

/** SSR 时使用内网地址直连 FastAPI，客户端时使用同域 /api */
function getApiBase(): string {
  // SSR: Astro 服务端，使用环境变量或默认内网地址
  if (typeof window === 'undefined') {
    return import.meta.env.API_URL || 'http://localhost:8000';
  }
  // 客户端：同域 /api，无跨域
  return '';
}

let _instance: AxiosInstance | null = null;
let _lastBaseURL = '';

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

    // Token 管理 — 从 localStorage 读取 Pinia 持久化的 token
    function getAccessToken(): string | null {
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
    }

    // Request interceptor: 自动附加 JWT（只给需要认证的端点且有有效 token 时附加）
    _instance.interceptors.request.use((config) => {
      const token = getAccessToken();
      if (!token) return config;
      // only attach to authenticated endpoints
      const url = config.url || '';
      const needsAuth =
        (url.startsWith('/api/auth/') && !url.startsWith('/api/auth/login') && !url.startsWith('/api/auth/reg')) ||
        url.startsWith('/graphql');
      if (needsAuth && config.headers) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });

    // --- 401 刷新队列（解决并发 401）---
    let isRefreshing = false;
    let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

    function processQueue(error: unknown, token: string | null = null) {
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
            !url.startsWith('/api/auth/login') &&
            !url.startsWith('/api/auth/reg')
          ) {
            try {
              localStorage.removeItem('lkm-auth-store');
            } catch {
              /* ignore */
            }
          }
          return Promise.reject(error);
        }

        const isRefreshRequest = url === '/api/auth/refresh';
        if (isRefreshRequest) {
          try {
            localStorage.removeItem('lkm-auth-store');
          } catch {
            /* ignore */
          }
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
          const saved = localStorage.getItem('lkm-auth-store');
          if (saved) {
            const data = JSON.parse(saved);
            const refreshToken = data._refreshToken;
            if (refreshToken) {
              const res = await _instance!.post('/api/auth/refresh', { refresh_token: refreshToken }, {
                _retry: true,
              } as Record<string, unknown>);
              const apiResp = res.data as { data?: { access_token: string; refresh_token: string } };
              if (apiResp?.data?.access_token) {
                const store = JSON.parse(localStorage.getItem('lkm-auth-store') || '{}');
                store._token = apiResp.data.access_token;
                store._refreshToken = apiResp.data.refresh_token;
                localStorage.setItem('lkm-auth-store', JSON.stringify(store));

                (error.config!.headers as Record<string, string>)['Authorization'] =
                  `Bearer ${apiResp.data.access_token}`;
                processQueue(null, apiResp.data.access_token);
                isRefreshing = false;
                return _instance!.request(error.config!);
              }
            }
          }
        } catch {
          // ignore
        }

        // Refresh failed — clear storage and reject
        try {
          localStorage.removeItem('lkm-auth-store');
        } catch {
          /* ignore */
        }
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
          const body = typeof data === 'string' ? data : JSON.stringify(data);
          detail = body.slice(0, 300);
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
