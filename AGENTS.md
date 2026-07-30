# LKM 项目 AI Agent 指令

## 项目概述

LKM 官方网站是一个基于 **Astro v7** 和 **Tailwind CSS v4** 构建的纯静态站点。所有页面均为预渲染的静态 HTML，部署于 GitHub Pages，针对性能、SEO 和无障碍访问进行了优化。

**技术栈：** Astro v7 | Tailwind CSS v4 | TypeScript 5.9 | MDX | Sharp

## 快速参考

| 命令                      | 用途                                 |
| ------------------------- | ------------------------------------ |
| `pnpm run dev`            | 启动开发服务器（localhost:4321）     |
| `pnpm run build`          | 生产构建到 `./dist/`                 |
| `pnpm run build:packages` | 单独构建两个 monorepo 包             |
| `pnpm run preview`        | 本地预览生产构建                     |
| `pnpm run check`          | 运行 astro check + ESLint + Prettier |
| `pnpm run fix`            | 自动修复 ESLint + Prettier 问题      |

**Node.js 要求：** >= 24.0.0

## 架构

### 三层架构

```
src/
  core/           # 核心基础设施（无业务逻辑）
    config/       # 站点配置
    constants/    # 常量定义
    errors/       # 错误边界与错误码
    i18n/         # 国际化（中/英/日/韩等）
    scripts/      # 客户端脚本（blog 初始化/PhotoSwipe/过渡动画）
    types/        # TypeScript 类型定义
    utils/        # 工具函数
    styles/       # 全局 CSS（tailwind.css）
    plugins/      # Remark/Rehype 插件
  features/       # 业务功能模块
    blog/         # 博客组件
    team/         # 团队页面组件
    editor/       # 编辑器薄适配层
    homepage/     # 首页组件
    shell/        # 顶栏/页脚/侧边栏/背景
    auth/         # 登录认证组件
    search/       # 搜索组件
    column/       # 专栏组件
    forum/        # 论坛组件
    dashboard/    # 仪表盘组件
    profile/      # 个人中心组件
    notification/ # 通知组件
    project-hub/  # 项目中心组件
    competition/  # 竞赛组件
    qa/           # 问答组件
    funding/      # 赞助组件
    contribution/ # 贡献组件
    file-library/ # 文件库组件
    admin/        # 管理后台组件
    anonymous-letter/ # 匿名信组件
    content/      # 内容组件
  assets/         # 静态资源（图片/图标等，由 astro:assets 处理）
  db/             # 客户端数据库适配器
  styles/         # 全局/组件级 CSS
  types/          # 全局 TypeScript 类型声明
  ui/             # 通用 UI 组件
    primitives/   # 基础组件（Button/Image/Form 等）
    patterns/     # 模式组件
  layouts/        # 页面布局（Base/Page/Sidebar/Markdown/Blog 等）
  pages/          # 文件路由（含 /admin/documents 管理后台）
  content/        # 内容文件（posts/）

packages/
  rich-text-editor/     # 编辑器核心包（engine + components + hooks + CSS）
  editor-persistence/   # 持久化插件（localStorage + IndexedDB）
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

- **主题令牌：** `@theme { --color-primary: var(--primary); ... }`
- **自定义工具类：** `@utility profile-card { ... }`
- **暗色模式：** 通过 `@custom-variant dark (&:where(.dark, .dark *))` 实现基于类的暗色模式
- **插件：** `@plugin "@tailwindcss/typography"`

Vite 插件 `@tailwindcss/vite` 在 `astro.config.ts` 中配置。

## 内容集合

内容文件：

- `src/content/posts/` — 博客文章（.md/.mdx）

文章 frontmatter 字段（与 `src/content.config.ts` 中 `posts` schema 一致）：`title`（必填）、`published`（必填）、`updated`、`draft`、`description`、`image`、`tags`、`category`、`lang`。

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

## Icon 管理

所有 icon 通过 `astro-icon` 本地 bundle，禁止运行时第三方 API 调用：

- `astro.config.ts` 中 `icon.include` 配置了 `tabler: ['*']`、`material-symbols: ['*']`、`fa6-*`、`flat-color-icons` 等全部使用的 icon 集
- `@iconify/svelte` 中的 `<Icon>` 也由 `astro-icon` 的 Vite 插件提供本地数据，不再发起 API 请求
- 新增 icon 直接使用即可，无需额外配置（通配符已覆盖）

## 性能规范

### Icon

- **禁止运行时 Iconify API 调用** — 所有 icon 必须通过 `astro-icon` 的 `include` 配置本地打包
- `astro.config.ts` 的 `icon.include` 已覆盖 `tabler`、`material-symbols`、`fa6-*`、`flat-color-icons` 四个集合
- 新增 icon 集时同步更新 `astro.config.ts` 的 `include` 列表

### Vue `client:only` 组件

- 使用 `client:only` 的 Vue 组件**必须包裹带 `min-height` 的容器**，防止挂载后内容注入造成 CLS
- 推荐值：`style="min-height: 400px"`（列表/卡片类页面）

### Vendor 拆分策略

- 非全局使用的重量级依赖（`overlayscrollbars`、`photoswipe`）**不加入** `manualChunks` 统一 vendor chunk
- 让其独立拆分为异步 chunk，仅在引用页面加载

### CSS 加载

- 全局样式的 preconnect 已添加到 `BaseLayout.astro`：Google Fonts、Iconify API、Unsplash
- 所有页面使用 `BaseLayout` 或 `BlogLayout` 自动继承 preconnect

## 验证检查清单

修改代码后，务必验证：

1. `pnpm run build` 构建成功
2. `pnpm run check` 通过（astro check + ESLint + Prettier）
3. 浏览器视觉检查：首页、博客、暗色模式、移动端菜单
