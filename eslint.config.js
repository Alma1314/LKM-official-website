import astroEslintParser from 'astro-eslint-parser';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import typescriptParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';

export default [
  js.configs.recommended,
  ...eslintPluginAstro.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroEslintParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,jsx,astro}'],
    rules: {
      'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // 定义 `<script>` 标签的配置。
    // `<script>` 中的脚本会被分配一个带 `.js` 扩展名的虚拟文件名。
    files: ['**/*.{ts,tsx}', '**/*.astro/*.js'],
    languageOptions: {
      parser: typescriptParser,
    },
    rules: {
      // 注意：必须禁用基础规则，因为它可能报告错误的错误
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  {
    files: [
      'src/features/shell/common/components/Analytics.astro',
      'src/features/shell/common/components/Analytics.astro/**',
    ],
    rules: {
      'prefer-rest-params': 'off',
      'no-var': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx,vue,astro}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: '请使用 ~/lib/http/client (axios) 或 ~/lib/api 的 apiFetch wrapper，不要直接调用 fetch。',
        },
      ],
    },
  },
  {
    ignores: [
      'dist',
      'packages/*/dist',
      'node_modules',
      '.github',
      'reference',
      'types.generated.d.ts',
      '.astro',
      '.claude',
      '.superpowers',
      'src/layouts/BlogLayout.astro',
      'src/layouts/OfficialBlogLayout.astro',
      'src/layouts/CommunityBlogLayout.astro',
      'scripts/mock-server.mjs',
    ],
  },
];
