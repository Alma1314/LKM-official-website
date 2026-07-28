import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@lkm/rich-text-editor': path.resolve(__dirname, 'packages/rich-text-editor/src'),
      '@lkm/editor-persistence': path.resolve(__dirname, 'packages/editor-persistence/src'),
    },
  },
  test: {
    exclude: ['dist/**', '.astro/**', 'coverage/**', 'node_modules/**'],
  },
  projects: [
    {
      name: 'node',
      test: {
        include: ['src/**/*.test.ts', 'packages/**/*.test.ts'],
        exclude: ['src/**/*.browser.test.ts'],
        environment: 'node',
      },
    },
    {
      name: 'jsdom',
      test: {
        include: ['src/**/*.browser.test.ts'],
        environment: 'jsdom',
      },
    },
    {
      name: 'security',
      test: {
        include: [
          'packages/**/sanitize-html.test.ts',
          'packages/**/sanitize*.test.ts',
          'packages/**/ai-client.test.ts',
          'src/**/sanitize-html.test.ts',
          'src/**/sanitize*.test.ts',
          'src/**/ai-client.test.ts',
        ],
        environment: 'node',
      },
    },
  ],
});
