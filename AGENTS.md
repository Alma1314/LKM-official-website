# LKM 项目 AI Agent 指令

## 项目概述

LKM 官方网站是一个基于 **Astro v7** 和 **Tailwind CSS v4** 构建的网站。它以静态生成为主（`output: 'static'`），管理后台通过 `@astrojs/node` 保留服务器渲染能力，针对性能、SEO 和无障碍访问进行了优化。

**技术栈：** Astro v7 | Tailwind CSS v4 | TypeScript 5.9 | MDX | Sharp

## 快速参考

| 命令                   | 用途                                         |
| ---------------------- | -------------------------------------------- |
| `pnpm run dev`         | 启动开发服务器（localhost:4321）             |
| `pnpm run build`       | 生产构建到 `./dist/`                          |
| `pnpm run build:packages` | 单独构建两个 monorepo 包                  |
| `pnpm run preview`     | 本地预览生产构建                             |
| `pnpm run check`       | 运行 astro check + ESLint + Prettier         |
| `pnpm run fix`         | 自动修复 ESLint + Prettier 问题              |

**Node.js 要求：** >= 24.0.0

## 架构

### 三层架构

```
src/
  core/           # 核心基础设施（无业务逻辑）
    config/       # 站点配置
    constants/    # 常量定义
    i18n/         # 国际化（中/英/日/韩等 13 种语言）
    types/        # TypeScript 类型定义
    utils/        # 工具函数（blog/images/permalinks/settings 等）
    styles/       # 全局 CSS（tailwind.css, variables.css, main.css）
    plugins/      # Remark/Rehype 插件
  features/       # 业务功能模块
    blog/         # 博客组件
    content/      # 内容组件
    editor/       # 编辑器的薄适配层（组装 @lkm/rich-text-editor + @lkm/editor-persistence）
    team/         # 团队页面组件
    homepage/     # 首页 Widget（Hero/Features/Pricing 等）
    shell/        # 顶栏/页脚/侧边栏/背景/通用 UI
    auth/         # 登录认证组件
    docs/         # 文档库
  ui/             # 通用 UI 组件
    primitives/   # 基础组件（Button/Image/Form 等）
    patterns/     # 模式组件（TableOfContents/Timeline 等）
  layouts/        # 页面布局（Base/Page/Sidebar/Markdown/Blog 等）
  pages/          # 文件路由（含 /admin/documents 管理后台）
  content/        # 内容文件（docs/、post/）

packages/
  rich-text-editor/     # 编辑器核心包（engine + components + hooks + CSS，零外部 UI 依赖）
  editor-persistence/   # 持久化插件（localStorage + IndexedDB，实现 PersistenceAdapter 接口）
```

### pnpm Workspace Monorepo

项目使用 pnpm workspace 管理多包：

- `@lkm/rich-text-editor` — 基于 TipTap 3 的 MDX 富文本编辑器，可独立发布
- `@lkm/editor-persistence` — 浏览器端持久化适配器，通过 `PersistenceAdapter` 接口注入

主项目通过 `src/features/editor/index.ts` 组装两个包并导出给 Astro 页面使用。

### 路径别名

使用 `~/` 从 `src/` 导入：

```typescript
import Image from '~/ui/primitives/Image.astro';
import { siteConfig } from '~/core/config';
```

## Tailwind CSS v4

配置以 CSS 优先，入口文件 `src/core/styles/tailwind.css`：

- **主题令牌：** `@theme { --color-primary: var(--aw-color-primary); ... }`
- **自定义工具类：** `@utility bg-page { ... }`
- **暗色模式：** 通过 `@variant dark (&:where(.dark, .dark *))` 实现基于类的暗色模式
- **插件：** `@plugin "@tailwindcss/typography"`

Vite 插件 `@tailwindcss/vite` 在 `astro.config.ts` 中配置。

## 内容集合

内容文件：

- `src/content/post/` — 博客文章（.md/.mdx）
- `src/content/docs/` — 文档（.md/.mdx）

文章 frontmatter 字段：`title`（必填）、`publishDate`、`updateDate`、`draft`、`excerpt`、`image`、`category`、`tags`、`author`、`metadata`。

## 组件模式

- Props 继承自 `~/core/types` 中的接口
- 使用 `class:list` 进行条件样式绑定
- 接收 `className` 覆写时使用 `twMerge()` 合并
- 布局组合使用具名插槽（named slots）
- 新组件应放在对应的 feature 目录或 ui 层

## 图片处理

`src/ui/primitives/Image.astro` 支持：

- 本地图片通过 `astro:assets`（由 Sharp 优化）
- 远程图片通过 Unpic CDN
- 允许的域名（用于 Unpic 无法检测的提供商，由 Sharp 处理）：`cdn.pixabay.com`

Hero 图片使用 `loading="eager"` 和 `fetchpriority="high"`。

## 验证检查清单

修改代码后，务必验证：

1. `pnpm run build` 构建成功
2. `pnpm run check` 通过（astro check + ESLint + Prettier）
3. 浏览器视觉检查：首页、博客、暗色模式、移动端菜单
