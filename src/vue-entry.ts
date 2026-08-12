import { createPinia } from 'pinia';
import type { App } from 'vue';

const g = globalThis as Record<string, unknown>;
if (g.__VUE_PROD_DEVTOOLS__ === undefined) g.__VUE_PROD_DEVTOOLS__ = false;

// 注意：不再全局包裹 Naive UI Provider。
// 此前 withNaiveProviders 用 h(NMessageProvider,...)（Naive 的 render 以 h(Fragment,...) 包裹）
// 套到每个 Vue island 根上，会让所有 client:idle 的 SSR island 输出多余的 Fragment 注解，
// 与服务端/客户端渲染树不一致 → 大量 "Hydration node mismatch" 警告。
// 现在需要 useMessage()/useDialog() 的模块各自在组件根处按需包 Provider：
//  - 匿名信：TreeholeShell.vue（components/TreeholeShell.vue）
//  - 后台登录：AdminLogin.vue 已改为不依赖 useMessage（用 NAlert 呈现成功态），无需 Provider

export default (app: App) => {
  app.use(createPinia());
};
