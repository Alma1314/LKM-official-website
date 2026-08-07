import { createPinia } from 'pinia';
import type { App } from 'vue';

const g = globalThis as Record<string, unknown>;
if (g.__VUE_PROD_DEVTOOLS__ === undefined) g.__VUE_PROD_DEVTOOLS__ = false;

export default (app: App) => {
  app.use(createPinia());
};
