/**
 * 客户端请求缓存层
 * 用 Map + TTL 做内存缓存，减少重复 API 请求。
 * 适合文章列表、标签列表等不频繁变化的数据。
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 分钟

const store = new Map<string, CacheEntry<unknown>>();

function now(): number {
  return Date.now();
}

/** 从缓存读取，过期或无数据返回 null */
export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

/** 写入缓存 */
export function cacheSet<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  store.set(key, { data, expiresAt: now() + ttlMs });
}

/** 删除缓存 */
export function cacheDel(key: string): void {
  store.delete(key);
}

/** 清空所有缓存 */
export function cacheClear(): void {
  store.clear();
}

/**
 * SWR 风格的 fetch — 先返回缓存（秒开），后台静默更新
 * @returns 一个 ref-friendly 对象，调用者可自行赋值
 */
export async function fetchWithCache<T>(
  url: string,
  cacheKey: string,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<{ data: T | null; fromCache: boolean; error: string | null }> {
  // 先检查缓存（如果有直接返回，同时后台更新）
  const cached = cacheGet<T>(cacheKey);

  const doFetch = async (): Promise<{ data: T | null; error: string | null }> => {
    try {
      // eslint-disable-next-line no-restricted-globals
      const res = await fetch(url);
      if (!res.ok) return { data: null, error: `HTTP ${res.status}` };
      const json = await res.json();
      if (json.code === 0) {
        cacheSet(cacheKey, json.data as T, ttlMs);
        return { data: json.data as T, error: null };
      }
      return { data: null, error: json.msg || '未知错误' };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : '网络错误' };
    }
  };

  if (cached) {
    // 后台静默更新（不 await），下次访问拿到热数据
    doFetch().catch(() => {});
    return { data: cached, fromCache: true, error: null };
  }

  const result = await doFetch();
  return { ...result, fromCache: false };
}
