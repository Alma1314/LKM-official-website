# LKM Official Website · 理科迷官方网站

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Astro v7](https://img.shields.io/badge/Astro-v7-FF5D01?logo=astro)](https://astro.build)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)

**理科迷 (LKM)** 的官方网站 — 基于 [AstroWind](https://github.com/arthelokyo/astrowind) 模板，采用 Astro v7 + Tailwind CSS v4 构建的纯静态站点，部署于 GitHub Pages。LKM 是创立于 2014 年的科技爱好者社区，覆盖数学、物理、化学、生物、信息技术等多个学科。

---

## 快速开始

> **Node.js >= 24.0.0** | **pnpm >= 11.0.0**

```bash
git clone https://github.com/LKM-AHZ/LKM-official-website.git
cd LKM-official-website
pnpm install
pnpm run dev
```

浏览器访问 `http://localhost:4321/LKM-official-website`。

---

## 常用命令

| 命令                      | 说明                         |
| :------------------------ | :--------------------------- |
| `pnpm run dev`            | 启动开发服务器               |
| `pnpm run build`          | 生产构建到 `./dist/`         |
| `pnpm run preview`        | 本地预览生产构建             |
| `pnpm run check`          | 类型检查 + ESLint + Prettier |
| `pnpm run fix`            | 自动修复 ESLint + Prettier   |
| `pnpm run build:packages` | 单独构建 workspace 包        |
| `pnpm run test`           | 运行 Vitest 测试             |

---

## 项目结构

```
/
├── .github/workflows/          # CI/CD (GitHub Actions)
├── public/                     # 静态资源
├── src/
│   ├── assets/images/
│   │   ├── member/             # 原始头像图片
│   │   └── member-optimized/   # 优化后的 WebP 头像
│   ├── core/                   # 核心基础设施
│   │   ├── config/             # 站点配置
│   │   ├── constants/          # 常量定义
│   │   ├── i18n/               # 国际化（中/英/日/韩等）
│   │   ├── types/              # TypeScript 类型定义
│   │   ├── utils/              # 工具函数
│   │   ├── styles/             # 全局 CSS
│   │   └── plugins/            # Remark/Rehype 插件
│   ├── features/               # 业务功能模块
│   │   ├── blog/               # 博客组件
│   │   ├── content/            # 内容组件
│   │   ├── editor/             # 富文本编辑器
│   │   ├── team/               # 团队页面组件
│   │   ├── homepage/           # 首页组件
│   │   ├── shell/              # 顶栏/页脚/背景/通用 UI
│   │   ├── auth/               # 登录认证
│   │   └── docs/               # 文档库
│   ├── ui/                     # UI 组件
│   │   ├── primitives/         # 基础组件
│   │   └── patterns/           # 模式组件
│   ├── layouts/                # 页面布局
│   ├── pages/                  # 文件路由
│   ├── content/                # 内容（posts/、docs/）
│   └── config.yaml             # 站点主配置
├── AGENTS.md                   # AI Agent 指令
├── CLAUDE.md                   # Claude Code 配置
├── CODING_STANDARDS.md         # 代码规范
├── LICENSE.md                  # MIT 许可证
├── astro.config.ts             # Astro 配置
└── tsconfig.json               # TypeScript 配置
```

---

## 页面路由

| 路由       | 路径               | 源文件                       |
| :--------- | :----------------- | :--------------------------- |
| 首页       | `/`                | `pages/index.astro`          |
| 管理团队   | `/team`            | `pages/team.astro`           |
| 项目团队   | `/project-team`    | `pages/project-team.astro`   |
| 关于       | `/about`           | `pages/about.astro`          |
| 服务       | `/services`        | `pages/services.astro`       |
| 赞助与支持 | `/pricing`         | `pages/pricing.astro`        |
| 联系我们   | `/contact`         | `pages/contact.astro`        |
| QQ 社群    | `/communities`     | `pages/communities.astro`    |
| 登录       | `/login`           | `pages/login.astro`          |
| 文档库     | `/docs`            | `pages/docs/`                |
| 文档详情   | `/docs/<slug>`     | `pages/docs/[...slug].astro` |
| 文档管理   | `/admin/documents` | `pages/admin/documents/`     |
| 隐私政策   | `/privacy`         | `pages/privacy.md`           |
| 使用条款   | `/terms`           | `pages/terms.md`             |
| 博客       | `/blog`            | `pages/[...blog]/`           |
| 404        | `/404`             | `pages/404.astro`            |
| RSS        | `/rss.xml`         | `pages/rss.xml.ts`           |

---

## 配置系统

`src/config.yaml` 通过自定义集成注入：

```ts
import { SITE, I18N, METADATA, APP_BLOG, UI, ANALYTICS } from '~/core/config';
```

常用配置项：站点名称/URL、SEO 元数据、博客开关与分页、Google Analytics ID、主题模式等。

---

## 样式系统

**Tailwind CSS v4** — CSS-first 配置，入口 `src/core/styles/tailwind.css`，支持暗色模式、自定义主题变量、Typography 插件。部分组件使用 **CSS Modules** 实现局部作用域样式，结合 **KaTeX** 渲染数学公式。

---

## 内容管理

在 `src/content/posts/` 下创建 `.md` 或 `.mdx` 文件：

```md
---
title: 文章标题
published: 2025-01-15
description: 文章摘要
tags: [web, tutorial]
category: tutorials
draft: false
image: ~/assets/images/cover.jpg
---

文章正文...
```

---

## 构建部署

```bash
pnpm run build   # 输出到 ./dist/
```

推送 `main` 分支后，GitHub Actions 自动部署到 GitHub Pages。

---

## 团队成员

团队数据维护在 `src/features/team/data/members.ts`，按部门分组导出。`src/pages/team.astro` 通过 `MemberCard` / `DepartmentSection` 组件渲染，头像存放于 `src/assets/images/member-optimized/`。

### 添加新成员

**第 1 步：准备头像**

将原始头像图片（jpg/png）放入 `src/assets/images/member/` 目录，然后运行优化脚本：

```bash
node scripts/optimize-avatars.mjs
```

脚本会将所有原始图片缩放至 192px 并转换为 WebP，输出到 `member-optimized/` 目录。

**第 2 步：编辑数据**

在 `src/features/team/data/members.ts` 中找到对应的部门数组，按格式添加：

```ts
{ name: '七月X', avatarKey: '文件名.jpg', desc: '简短描述', dream: '梦想：xxx', quote: '—— 格言' }
```

字段说明：

| 字段        | 必填 | 说明                                                                   |
| :---------- | :--- | :--------------------------------------------------------------------- |
| `name`      | 是   | 显示名称                                                               |
| `avatarKey` | 否   | `member-optimized/` 下的文件名（写原始扩展名，运行时自动映射 `.webp`） |
| `role`      | 否   | 职务标签（卡片上显示为彩色小字）                                       |
| `desc`      | 否   | 简短描述                                                               |
| `dream`     | 否   | 梦想/目标（紫色斜体）                                                  |
| `quote`     | 否   | 一句话格言                                                             |

**部门对应关系**（`src/features/team/data/members.ts`）：

| 页面     | 部门            | 导出数组                              |
| :------- | :-------------- | :------------------------------------ |
| 管理团队 | 创始人          | `founderMembers`                      |
|          | 总务部          | `generalMembers`                      |
|          | 群务部          | `affairsSubGroups`（按子群组分组）    |
|          | 活动策划部      | `eventsMembers`                       |
|          | 新闻办          | `newsMembers` + `newsSubGroups`       |
|          | 顾问团          | `advisorMembers`                      |
|          | 专业委员会      | `professionalSubGroups`（按学科分组） |
|          | 技术委员会      | `techMembers`                         |
|          | 已离开成员      | `alumniMembers`                       |
| 项目团队 | 教材/科普项目组 | `projectSubGroups`                    |

---

## 架构概览

```
core/           配置、类型、工具函数、CSS、插件
  ↓
features/       业务功能模块（blog/team/editor/homepage/shell/auth/docs）
  ↓
ui/             UI 组件（primitives/patterns）
  ↓
layouts/        页面布局（BaseLayout/PageLayout/SidebarLayout/MarkdownLayout/BlogLayout）
  ↓
pages/          文件路由页面
```

## 特性

- **Astro v7** 纯静态生成
- **Tailwind CSS v4** 暗色模式 + 自定义主题
- **12 种可切换动态背景** — 极光、数字雨、星座、DNA（2D/3D）、星云等，自适应深浅主题
- **富文本编辑器** — 基于 Tiptap 3 的 MDX 双向编辑器，支持 AI 助手、版本历史、评论、自动保存
- **多框架支持** — React 19 + Vue 3 + Svelte 5 按需引入
- **View Transitions** SPA 风格页面切换
- **博客系统** — MD/MDX、分类/标签、分页、KaTeX 公式
- **SEO 完整** — Sitemap、RSS、Open Graph、Twitter Card
- **图片优化** — Sharp + Unpic CDN
- **Pagefind 全文搜索** — 客户端离线搜索
- **KaTeX** — 数学公式渲染
- **响应式适配** — 移动端至桌面端

## 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE.md](./LICENSE.md)。
