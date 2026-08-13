/**
 * SSR 请求上下文（浏览器安全版）
 *
 * 通过 node:async_hooks 的 AsyncLocalStorage 实现，但为避免把 Node 原生模块
 * 打进浏览器 bundle（client.ts / GraphQL exchange 在 CSR 同样加载本模块），
 * 这里仅保留接口与 store 的注入点；AsyncLocalStorage 实例由
 * ssr-context.node.ts 在服务端创建并注入（仅 middleware 引用）。
 *
 * SSR 阶段数据访问层（axios / ssrFetch / urql）可跨异步边界读取当前请求的
 * Cookie，使 B 类认证页面在服务端识别登录用户。
 */
export interface SsrRequestContext {
  headers: Headers;
}

interface AsyncStore {
  run<T>(ctx: SsrRequestContext, fn: () => Promise<T> | T): Promise<T>;
  getStore(): SsrRequestContext | undefined;
}

let _store: AsyncStore | null = null;

/** 由服务端模块注入 AsyncLocalStorage 实例（仅 SSR 环境调用）。 */
export function setSsrStore(store: AsyncStore): void {
  _store = store;
}

/** 在上下文中执行回调；未注入 store（如浏览器）时直接执行。 */
export async function runWithRequest<T>(headers: Headers, callback: () => T | Promise<T>): Promise<T> {
  if (!_store) return await callback();
  return await _store.run({ headers }, () => callback());
}

/** 读取当前 SSR 请求上下文的 Cookie 头；无上下文或无 Cookie 时返回 null。 */
export function getSsrCookie(): string | null {
  const store = _store?.getStore();
  if (!store) return null;
  return store.headers.get('cookie');
}
