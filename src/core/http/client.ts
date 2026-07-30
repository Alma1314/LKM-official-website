// axios 封装 — 所有 HTTP 请求统一入口
//
// 原则：
//  1. 所有请求返回 Result<T, AppError>，不抛异常
//  2. 拦截器统一将 AxiosError 转为 AppError
//  3. 错误消息不含敏感信息（token/key 等）
//  4. 支持全局 baseURL、默认超时、请求头

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { AppError, ErrorCode } from '../errors/error-codes';
import { ok, err } from '../errors/result';
import type { Result } from '../errors/result';

let _instance: AxiosInstance | null = null;

function isAxiosError(e: unknown): e is AxiosError {
  return axios.isAxiosError(e);
}

function getInstance(): AxiosInstance {
  if (!_instance) {
    _instance = axios.create({
      timeout: 15_000,
      headers: { 'Content-Type': 'application/json' },
    });

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

        // 错误体截断，避免泄露敏感信息
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

/** 配置全局 axios 实例（baseURL、默认 headers 等） */
export function configure(config: { baseURL?: string; timeout?: number }): void {
  const instance = getInstance();
  if (config.baseURL !== undefined) {
    instance.defaults.baseURL = config.baseURL;
  }
  if (config.timeout !== undefined) {
    instance.defaults.timeout = config.timeout;
  }
}

/** 通用请求 */
export async function request<T>(config: AxiosRequestConfig): Promise<Result<T, AppError>> {
  try {
    const res = await getInstance().request<T>(config);
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
