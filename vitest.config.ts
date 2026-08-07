import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      // Astro 的虚拟模块在 vitest 下不存在；用与 config.yaml 一致的 mock 顶替
      'virtual:config': path.resolve(__dirname, 'src/lib/config/__mocks__/virtual-config.ts'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', '.astro/**', 'coverage/**', 'node_modules/**', '**/node_modules/**'],
    environment: 'node',
    // 仅对 auth 目录启用 DOM 环境（组件态测试基建）
    environmentMatchGlobs: [['src/features/auth/**', 'happy-dom']],
    setupFiles: ['src/features/auth/__tests__/setup.ts'],
  },
});
