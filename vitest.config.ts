import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@lkm/rich-text-editor': path.resolve(__dirname, 'packages/rich-text-editor/src'),
      '@lkm/editor-persistence': path.resolve(__dirname, 'packages/editor-persistence/src'),
      // Astro 的虚拟模块在 vitest 下不存在；用与 config.yaml 一致的 mock 顶替
      'virtual:config': path.resolve(__dirname, 'src/core/config/__mocks__/virtual-config.ts'),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'packages/**/*.test.ts'],
    exclude: ['dist/**', '.astro/**', 'coverage/**', 'node_modules/**', '**/node_modules/**'],
    environment: 'node',
  },
});
