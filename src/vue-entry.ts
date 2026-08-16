import { createPinia } from 'pinia';
import type { App } from 'vue';
import './lib/icons/register';

const g = globalThis as Record<string, unknown>;
if (g.__VUE_PROD_DEVTOOLS__ === undefined) g.__VUE_PROD_DEVTOOLS__ = false;

// dev 模式规避：Vite 8 (Rolldown) 的 react-refresh native 插件会误把部分 .vue 组件的
// setup 当成 React 组件，注入 `var _s = $RefreshSig$()` 包裹。SSR 环境没有 react-refresh
// runtime，会报 "ReferenceError: $RefreshSig$ is not defined"。这里补一个 no-op polyfill：
// SSR 下让它退化为透传函数；client 下 react-refresh preamble 已定义，`??` 不会覆盖。
if (g.$RefreshSig$ === undefined) {
  g.$RefreshSig$ = () => (fn: unknown) => fn;
}

// 注意：不再全局包裹 Naive UI Provider。
// 此前 withNaiveProviders 用 h(NMessageProvider,...)（Naive 的 render 以 h(Fragment,...) 包裹）
// 套到每个 Vue island 根上，会让所有 client:idle 的 SSR island 输出多余的 Fragment 注解，
// 与服务端/客户端渲染树不一致 → 大量 "Hydration node mismatch" 警告。
// 现在需要 useMessage()/useDialog() 的模块各自在组件根处按需包 Provider：
//  - 匿名信：TreeholeShell.vue（components/TreeholeShell.vue）
//  - 后台登录：AdminLogin.vue 已改为不依赖 useMessage（用 NAlert 呈现成功态），无需 Provider

export default (app: App): void => {
  app.use(createPinia());
};
