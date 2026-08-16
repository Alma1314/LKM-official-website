/**
 * SSR 请求上下文 — Node 专属实现（仅 middleware 引用，不进入客户端 bundle）。
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { setSsrStore, runWithRequest } from "./ssr-context";
import type { SsrRequestContext } from "./ssr-context";

const store = new AsyncLocalStorage<SsrRequestContext>();
setSsrStore(store);

export { runWithRequest };
