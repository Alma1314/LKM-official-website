import { defineConfig } from 'astro/config';

import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import astroExpressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import compress from 'astro-compress';
import vue from '@astrojs/vue';
import react from '@astrojs/react';
import node from '@astrojs/node';
import Unfonts from 'unplugin-fonts/astro';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { RemarkPlugin } from '@astrojs/markdown-remark';

import { remarkReadingTime } from './src/lib/markdown-plugins/remark-reading-time.mjs';
import { remarkExcerpt } from './src/lib/markdown-plugins/remark-excerpt.js';
import remarkGithubAdmonitionsToDirectives from 'remark-github-admonitions-to-directives';
import remarkDirective from 'remark-directive';
import remarkSectionize from 'remark-sectionize';
import { parseDirectiveNode } from './src/lib/markdown-plugins/remark-directive-rehype.js';
import rehypeSlug from 'rehype-slug';
import rehypeComponents from 'rehype-components';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { GithubCardComponent } from './src/lib/markdown-plugins/rehype-component-github-card.mjs';
import { AdmonitionComponent } from './src/lib/markdown-plugins/rehype-component-admonition.mjs';
import { responsiveTablesRehypePlugin } from './src/lib/utils/frontmatter.js';
import fs from 'node:fs';
import yaml from 'js-yaml';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

function loadConfigYaml() {
  const raw = fs.readFileSync('src/data/config.yaml', 'utf-8');
  return yaml.load(raw) as Record<string, unknown>;
}
const configYaml = loadConfigYaml();
const siteConfig = (configYaml as Record<string, Record<string, unknown>>).site as Record<string, string>;

export default defineConfig({
  devToolbar: {
    enabled: false,
  },

  site: siteConfig.site as string,
  base: (siteConfig.base as string) || '/',

  output: 'server',
  adapter: node({ mode: 'standalone' }),

  integrations: [
    sitemap(),
    astroExpressiveCode({
      themes: ['github-dark'],
      defaultProps: { showLineNumbers: false },
      plugins: [pluginLineNumbers()],
    }),
    mdx(),
    vue({
      appEntrypoint: '/src/vue-entry',
    }),
    react({
      include: ['**/*.tsx', '**/*.jsx'],
    }),
    icon({
      include: {
        tabler: ['*'],
        'material-symbols': ['*'],
        'fa6-brands': ['creative-commons', 'github'],
        'fa6-regular': ['address-card'],
        'fa6-solid': ['arrow-rotate-left', 'arrow-up-right-from-square', 'chevron-right'],
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

    Unfonts({
      google: {
        families: [
          {
            name: 'Noto Sans SC',
            styles: 'wght@400;500;700',
          },
          {
            name: 'JetBrains Mono',
            styles: 'wght@400;500;700',
          },
        ],
      },
    }),

    compress({
      CSS: true,
      HTML: { 'html-minifier-terser': { removeAttributeQuotes: false } },
      Image: true,
      JavaScript: true,
      SVG: true,
      Logger: 1,
    }),
  ],

  image: {
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
        responsiveTablesRehypePlugin,
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
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/graphql': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    plugins: [
      tailwindcss(),
      {
        name: 'virtual-config',
        resolveId(id) {
          if (id === 'virtual:config') return '\0virtual:config';
          if (id === 'virtual:config-community') return '\0virtual:config-community';
        },
        load(id) {
          if (id === '\0virtual:config') {
            const raw = fs.readFileSync('src/data/config.yaml', 'utf-8');
            const parsed = yaml.load(raw);
            return `export default ${JSON.stringify(parsed)};`;
          }
          if (id === '\0virtual:config-community') {
            const raw = fs.readFileSync('src/data/config.community.yaml', 'utf-8');
            const parsed = yaml.load(raw);
            return `export default ${JSON.stringify(parsed)};`;
          }
        },
      },
      {
        name: 'exclude-yaml',
        resolveId(id) {
          if (id.endsWith('.yaml') || id.endsWith('.yml')) {
            return false;
          }
        },
        load(id) {
          if (id.endsWith('.yaml') || id.endsWith('.yml')) {
            return 'export default {}';
          }
        },
      },
      {
        name: 'wgsl-raw',
        transform(code, id) {
          if (id.endsWith('.wgsl')) {
            return `export default ${JSON.stringify(code)};`;
          }
        },
      },
    ],
    ssr: {
      noExternal: [],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/overlayscrollbars') || id.includes('node_modules/photoswipe')) {
              return;
            }
            if (id.includes('node_modules/three')) {
              return 'vendor-three';
            }
            if (id.includes('node_modules/katex') || id.includes('node_modules/rehype-katex')) {
              return 'vendor-katex';
            }
            if (id.includes('node_modules/vue') || id.includes('node_modules/@iconify/vue')) {
              return 'vendor-vue';
            }
          },
        },
      },
    },
    optimizeDeps: {
      exclude: ['virtual:config', 'virtual:config-community'],
      include: ['react', 'react-dom', 'react-dom/client'],
    },
    css: {
      transformer: 'postcss',
    },
    resolve: {
      alias: {
        '~': path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src'),
      },
    },
  },
});
