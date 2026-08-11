import { createPinia } from 'pinia';
import type { App } from 'vue';
import { h } from 'vue';
import { NDialogProvider, NMessageProvider, NModalProvider } from 'naive-ui';

const g = globalThis as Record<string, unknown>;
if (g.__VUE_PROD_DEVTOOLS__ === undefined) g.__VUE_PROD_DEVTOOLS__ = false;

// 把 Naive UI 的 Provider 套在应用根组件外层，
// 使所有 Vue 组件（含匿名信模块）都能在 setup 中调用 useMessage()/useDialog()
function withNaiveProviders(app: App) {
  const Root = app._component;
  if (!Root) return;
  const Wrapper: App['_component'] = {
    render: () =>
      h(NMessageProvider, null, {
        default: () =>
          h(NDialogProvider, null, {
            default: () =>
              h(NModalProvider, null, {
                default: () => h(Root),
              }),
          }),
      }),
  };
  app._component = Wrapper;
}

export default (app: App) => {
  app.use(createPinia());
  withNaiveProviders(app);
};
