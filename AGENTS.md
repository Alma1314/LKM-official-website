# LKM 项目 AI Agent 指南

## 项目概述

LKM 官方网站，基于 **Astro v7 server 模式**、**Vue 3**、**React**（仅编辑器）和 **Tailwind CSS v4** 构建。后端为 **FastAPI (Python)**，前后端分离部署，通过 Astro 中间件反向代理 `/api/*` 到 FastAPI。

**技术栈：** Astro v7 server | Vue 3 + Composition API | React（编辑器）| Tailwind CSS v4 | TypeScript | FastAPI | PostgreSQL | Redis

## 快速参考

| 命令                    | 用途                                 |
| ----------------------- | ------------------------------------ |
| `pnpm run dev`          | 启动开发服务器（localhost:4321）     |
| `pnpm run build`        | 生产构建                             |
| `pnpm run preview`      | 本地预览生产构建                     |
| `pnpm run check`        | 运行 astro check + ESLint + Prettier |
| `pnpm run fix`          | 自动修复 ESLint + Prettier 问题      |
| `pnpm run test`         | 运行 vitest 测试                     |
| `pnpm run test:backend` | 运行后端测试（含 GraphQL 测试）      |

**启动测试后端：** `pnpm run dev:backend`
**一键启动前后端：** `pnpm run dev`（并行 Astro + FastAPI）
**后端使用 uv 管理：** Python >= 3.12，首次 `cd backend && uv sync`

**Node.js 要求：** >= 24.0.0

## 目录结构

```
lkm-official-website/
├── src/
│   ├── pages/            # 文件路由（Astro 约定）
│   ├── layouts/          # 页面布局（BaseLayout/BlogLayout/SidebarLayout 等）
│   ├── components/       # 通用 UI 组件（primitives/patterns）
│   ├── features/         # 业务功能模块（24 个）
│   ├── scripts/          # 客户端脚本（blog-init/transitions/photoswipe）
│   ├── lib/              # 共享库（api/config/constants/errors/http/i18n/markdown-plugins/utils）
│   ├── assets/           # 静态资源（astro:assets 处理）
│   ├── styles/           # 全局 CSS（tailwind.css + markdown 样式）
│   ├── stores/           # Pinia 状态仓库（auth.ts 等）
│   ├── types/            # TypeScript 类型声明
│   ├── data/             # 配置文件（config.yaml 等）
│   ├── content/          # 内容文件
│   ├── middleware.ts     # 反向代理 /api/* → FastAPI
│   └── content.config.ts # 内容集合配置
├── packages/
│   ├── rich-text-editor/ # 编辑器（React，TipTap 3，MDX）
│   └── editor-persistence/ # 持久化适配器
├── backend/              # FastAPI 测试后端
├── scripts/              # 构建/检查脚本
├── docker-compose.yml    # Docker 生产部署
├── Dockerfile            # Astro SSR 部署镜像
└── astro.config.ts       # Astro 配置（server 模式 + Vue/React 集成）
```

## 架构

### Astro server 模式 + Vue/React

Astro 从 `static` 切换到 `server`：

- Astro SSR 负责页面路由和模板渲染
- `src/middleware.ts` 反向代理 `/api/*` 到 FastAPI（内网 `localhost:8000`）
- Vue 3 为主交互框架（Shell 组件、StarHope 模块、社区平台）
- React 仅用于编辑器后台（`packages/rich-text-editor`）
- **已卸载 Svelte**（全部迁移到 Vue）

### 统一数据访问层

```
src/lib/http/client.ts # Axios 封装（SSR/CSR 自动切换，返回 Result<T>），含 JWT 拦截器
src/lib/api/
├── index.ts           # 统一导出
├── graphql/           # GraphQL 客户端（urql）
│   ├── client.ts      # urql Client 实例
│   ├── exchanges/     # auth/error exchanges
│   └── index.ts
└── modules/           # 按业务模块划分
    ├── forum.ts / blog.ts / competition.ts / column.ts
    ├── qa.ts / project.ts / file-library.ts / treehole.ts
    ├── team.ts / auth.ts / user.ts / notification.ts
```

所有组件通过 `~/lib/api` 统一访问数据，不直接写 fetch 调用。

### 认证系统

认证为 **真实 FastAPI JWT 后端**，已移除旧的 mock demo-accounts：

- **后端认证端点**：`/api/auth/*`（不再是 `/auth/*`）
- **Pinia Store**：`src/stores/auth.ts`（`useAuthStore`）— 用户状态、token 管理、localStorage 持久化（key `lkm-auth-store`）
- **Composable 桥接层**：`src/features/auth/composables/useAuth.ts` — `useAuthProvider()`/`useAuth()` 把组件调用桥接到 Pinia store
- **HTTP 客户端**：`src/lib/http/client.ts` 的 axios 实例含 JWT request 拦截器（读 localStorage 附加 `Authorization: Bearer`）+ 401 自动刷新队列（并发安全，走 `POST /api/auth/refresh`）
- **GraphQL 认证**：`src/lib/api/graphql/exchanges/auth.ts`（urql `authExchange`）为每个 operation 自动附加 Bearer 头
- **类型**：`src/types/auth.d.ts` 定义真实 `User`/`AuthState`/`LoginMethod` 等，**不再有 `DemoUser`**

### 页面分级

| 类型             | 策略             | 示例                                |
| ---------------- | ---------------- | ----------------------------------- |
| A 类（公共内容） | SSR 实时注入数据 | 论坛、竞赛、专栏、问答              |
| B 类（认证页面） | SSR 转发 Cookie  | 用户主页、通知、仪表盘              |
| C 类（纯静态）   | 无数据依赖       | 首页、404、登录表单                 |
| D 类（博客）     | 客户端 MDX       | blog/[slug]（@mdx-js/mdx evaluate） |

## 路径别名

使用 `~/` 从 `src/` 导入：

```typescript
import { forumApi } from '~/lib/api';
import { getPermalink } from '~/lib/utils/permalinks';
```

## Tailwind CSS v4

配置以 CSS 优先：

- 入口文件 `src/styles/tailwind.css`
- 主题令牌：`@theme { --color-primary: var(--primary); ... }`
- 暗色模式：类名 `.dark` 切换
- 插件：`@plugin "@tailwindcss/typography"`

## 组件模式

- Props 使用 TypeScript 接口
- 使用 `class:list` 进行条件样式绑定
- 接收 `className` 覆写时使用 `twMerge()` 合并
- 布局组合使用具名插槽（named slots）
- Vue 组件放 `features/<name>/components/`，通用 UI 放 `components/primitives/` 或 `components/patterns/`

## CSS 策略

**优先级：**

1. Tailwind utility classes — 首选
2. 全局 CSS `@layer components` — 用于可复用复合类
3. CSS Modules — 仅在复杂布局时使用

**禁止：** scoped `<style>` 块、CSS-in-JS、直接引用 CSS 变量

## 图片处理

- 本地图片通过 `astro:assets`（Sharp 优化）
- 远程图片通过 Unpic CDN
- 允许的域名：`cdn.pixabay.com`

## Icon 管理

所有 icon 通过 `astro-icon` 本地 bundle：

- `astro.config.ts` 中 `icon.include` 配置了 tabler/mdi/fa6 等
- Vue 组件使用 `@iconify/vue` 的 `<Icon>`
- **禁止运行时 Iconify API 调用**

## 性能规范

### Vue `client:only` 组件

- 必须包裹带 `min-height` 的容器，防止 CLS

### Vendor 拆分策略

- `vendor-react`（React/ReactDOM）、`vendor-vue`、`vendor-three`、`vendor-katex`
- 非全局重量级依赖（overlayscrollbars/photoswipe）独立拆分

### CSS 加载

- 全局样式 preconnect 已添加到 `BaseLayout.astro`
- 所有页面使用布局自动继承 preconnect

## Docker 部署

```yaml
# docker-compose.yml
services:
  astro: # Node.js SSR 服务（端口 80）
  fastapi: # Python 后端（端口 8000，仅内网）
  postgres: # PostgreSQL 16
  redis: # Redis 7
```

## 验证检查清单

修改代码后，务必验证：

1. `pnpm run build` 构建成功
2. `pnpm run check` 通过（astro check + ESLint + Prettier）
3. `pnpm run test` 通过（前端 Vitest）
4. `pnpm run test:backend` 通过（后端 pytest，含 GraphQL 测试）
5. `pnpm run test:smoke` 和 `pnpm run test:a11y` 通过
6. 浏览器验证：首页、论坛（含 GraphQL）、暗色模式、移动端菜单
7. GraphQL 端点：`http://localhost:8000/graphql` → GraphiQL 可交互
