import { defineConfig } from 'astro/config';

import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import vue from '@astrojs/vue';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { AstroIntegration } from 'astro';
import type { RemarkPlugin } from '@astrojs/markdown-remark';

import { remarkReadingTime } from './src/core/plugins/remark-reading-time.mjs';
import { remarkExcerpt } from './src/core/plugins/remark-excerpt.js';
import remarkGithubAdmonitionsToDirectives from 'remark-github-admonitions-to-directives';
import remarkDirective from 'remark-directive';
import remarkSectionize from 'remark-sectionize';
import { parseDirectiveNode } from './src/core/plugins/remark-directive-rehype.js';
import rehypeSlug from 'rehype-slug';
import rehypeComponents from 'rehype-components';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { GithubCardComponent } from './src/core/plugins/rehype-component-github-card.mjs';
import { AdmonitionComponent } from './src/core/plugins/rehype-component-admonition.mjs';

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  devToolbar: {
    enabled: false,
  },

  site: 'https://LKM-AHZ.github.io',
  base: '/LKM-official-website',

  output: 'static',
  adapter: node({ mode: 'standalone' }),

  integrations: [
    sitemap(),
    mdx(),
    vue(),
    react({
      include: ['**/*.tsx', '**/*.jsx'],
    }),
    svelte(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    compress({
      CSS: false,
      HTML: { 'html-minifier-terser': { removeAttributeQuotes: false } },
      Image: false,
      JavaScript: false,
      SVG: false,
      Logger: 1,
    }),
  ],

  image: {
    // Astro 默认的 Sharp 服务处理本地图片。
    //
    // 大多数远程 CDN 图片（Unsplash、Cloudinary、Imgix 等）由
    // src/components/common/Image.astro 通过 `unpic` 路由，它会用 CDN 端
    // 的查询参数重写 URL 并直接从提供商提供 — Astro 从不下载它们，因此无需列出。
    //
    // `domains` 只对落入 Astro 原生 <Image /> 的远程 URL 有效
    // （即 Unpic 无法检测的提供商，如 Pixabay）。
    // 列出的条目被授权由 Sharp 处理。
    domains: ['cdn.pixabay.com'],
  },

  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkMath,
        remarkReadingTime,
        remarkExcerpt,
        remarkGithubAdmonitionsToDirectives,
        remarkDirective,
        remarkSectionize,
        parseDirectiveNode as unknown as RemarkPlugin,
      ],
      rehypePlugins: [
        rehypeKatex,
        rehypeSlug,
        [
          rehypeComponents,
          {
            components: {
              github: GithubCardComponent,
              note: (x: Parameters<typeof AdmonitionComponent>[0], y: Parameters<typeof AdmonitionComponent>[1]) =>
                AdmonitionComponent(x, y, 'note'),
              tip: (x: Parameters<typeof AdmonitionComponent>[0], y: Parameters<typeof AdmonitionComponent>[1]) =>
                AdmonitionComponent(x, y, 'tip'),
              important: (x: Parameters<typeof AdmonitionComponent>[0], y: Parameters<typeof AdmonitionComponent>[1]) =>
                AdmonitionComponent(x, y, 'important'),
              caution: (x: Parameters<typeof AdmonitionComponent>[0], y: Parameters<typeof AdmonitionComponent>[1]) =>
                AdmonitionComponent(x, y, 'caution'),
              warning: (x: Parameters<typeof AdmonitionComponent>[0], y: Parameters<typeof AdmonitionComponent>[1]) =>
                AdmonitionComponent(x, y, 'warning'),
            },
          },
        ],
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: {
              className: ['anchor'],
            },
            content: {
              type: 'element',
              tagName: 'span',
              properties: {
                className: ['anchor-icon'],
                'data-pagefind-ignore': true,
              },
              children: [
                {
                  type: 'text',
                  value: '#',
                },
              ],
            },
          },
        ],
      ],
    }),
  },

  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'exclude-yaml',
        resolveId(id) {
          if (id.endsWith('.yaml') || id.endsWith('.yml')) {
            return false; // prevent YAML from being resolved as a module
          }
        },
        load(id) {
          if (id.endsWith('.yaml') || id.endsWith('.yml')) {
            return 'export default {}';
          }
        },
      },
    ],
    // 预构建优化：将重依赖预列入 include，避免懒构建导致的并发竞态。
    // Windows + pnpm 下 Vite 的 deps 原子重命名可能失败，预列关键依赖让
    // 它们在首次启动时一次性构建完成。
    ssr: {
      noExternal: ['@iconify/svelte'],
    },
    optimizeDeps: {
      exclude: ['@iconify/svelte'],
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        '@tiptap/core',
        '@tiptap/react',
        '@tiptap/starter-kit',
        '@tiptap/extension-placeholder',
        '@tiptap/extension-character-count',
        '@tiptap/extension-link',
        '@tiptap/extension-underline',
        '@tiptap/extension-task-list',
        '@tiptap/extension-task-item',
        '@tiptap/extension-table',
        '@tiptap/extension-table-row',
        '@tiptap/extension-table-cell',
        '@tiptap/extension-table-header',
        '@tiptap/extension-image',
      ],
    },
    css: {
      transformer: 'postcss',
    },
    resolve: {
      alias: {},
    },
  },
});
