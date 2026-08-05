# LKM Official Website · 理科迷官方网站

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Astro v7](https://img.shields.io/badge/Astro-v7-FF5D01?logo=astro)](https://astro.build)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)

**理科迷 (LKM)** 的官方网站 — 基于 [AstroWind](https://github.com/arthelokyo/astrowind) 模板，采用 Astro v7 + Tailwind CSS v4 + Vue 3 构建，Astro SSR server 模式，部署于 GitHub Pages。LKM 是创立于 2014 年的科技爱好者社区，覆盖数学、物理、化学、生物、信息技术等多个学科。

---

## 前言 · 新手指导 · 环境部署

如果你有兴趣来参与理科迷的网站建设工作，在正式你的开发之旅前，我们首先建议开发工作在电脑端完成，这里以WINDOWS系统为例，你需要预备如下工具来完成对环境的部署：
Git bash（以下简称git），pnpm，NodeJS 24+，以及一个稳定可靠的网络。

下载这些前置的官网为

Gitbash：[Git - Install for Windows](https://git-scm.com/install/windows)

Pnpm：[安装 | pnpm](https://pnpm.io/zh/installation)

NodeJS： [Node.js — Download Node.js®](https://nodejs.org/en/download)

相关的安装教程可以在如CSDN或是B站上等找到教程，这里不做过多阐述。

环境部署步骤将在cmd端执行。

准备好这些工具后，打开cmd，运行

```bash
git clone https://github.com/LKM-AHZ/LKM-official-website.git
```

克隆成功后，运行

```
cd LKM-official-website
pnpm install
pnpm run dev
```

pnpm run dev 同 pnpm dev

目前为止，网站采用astro架构搭建，输入pnpm run dev命令后，此时会输出

```bash
$ astro dev
```

浏览器访问 `http://localhost:4321/LKM-official-website`

如要更新数据

确保在程序关闭的情况下

在项目目录中依次输入

```bash
git pull
pnpm install
```

不过值得注意的是，pnpm的下载也极容易受到网络干扰因素

例如在输入pnpm install后等待一段时间后会输出红色字幕警告：如

```bash
[ERR_PNPM_META_FETCH_FAIL] GET https://registry.npmjs.org/......: The operation was aborted due to timeout
```

这个时候就要尝试切换镜像源了,在更换完镜像源后，切记输入清除缓存的指令

```bash
pnpm store prune
```

如果只是中途发生错误，并不需要更换镜像源的话，输入下面这串指令以清除缓存

```bash
pnpm clean –lockfile
```

你也可以检测一下网络延迟

```bash
npm ping
```

（不过这条貌似没什么用，即便它的响应在700ms内，该下载不上的还是下载不上）

我们注意到，使用指令

```bash
set NODE_OPTIONS=--dns-result-order=ipv4first
set PNPM_NETWORK_CONCURRENCY=4
set PNPM_FETCH_TIMEOUT=60000
```

后，pnpm的下载明显要稳定很多，我们可以采用在后面加参数`--network-concurrency=1 --fetch-timeout=60000`的形式来尝试稳定下载！

不过官网的下载速度一般很慢，我们可以改为采用镜像源的形式来加快下载进度，这里以淘宝的为例

```bash
pnpm config set registry https://registry.npmmirror.com
pnpm store prune
pnpm install --network-concurrency=2 --fetch-timeout=60000
```

在后续的更新中，如要同步别人所更新的内容

依次输入

```bash
git stash
git pull
pnpm install --network-concurrency=2 --fetch-timeout=60000
```

即可完成更新

## 开发工具部署

通常情况下我们选用VScode进行开发，安装完VScode后，你需要下载如下组件

`Nodejs（extensions for nodejs）`

`Pnpm（Pnpm commands for VSCode）`

`Astro（Language support for Astro）`

`MDX （Language support for MDX）`

随后，用`VScode`打开文件夹

`（默认位置为C盘）C:\Users\<你的用户名>\LKM-official-website`

即可完成开发工具的部署。

## 开发！启动！

确保完成上述步骤后

```bash
cd LKM-official-website
pnpm dev
```

浏览器访问`http://localhost:4321/LKM-official-website/`

`VScode`进入`LKM-official-website`文件夹即可启动开发平台。

目前，`Astro`采用的是热更新的架构，这意味着你在修改源文件的同时修改能迅速反映到网页上。

## 正式加入

在做好要加入开发组（目前叫技术组）的准备后，你需要准备一个`github`账号和一个能用的邮箱，例如QQ邮箱，（确保你的账户有效且不会被盗，且保证我们能够与你取得联系），向有关部门提交申请后，如果通过，会发给你一封加入组织的邮件，首先你需要在本地中登录你的`github`账户，cmd进入`LKM-official-website`的目录下输入命令

```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

在`you@example.com`处填入你的`github`邮箱
在`Your Name`处填入你的`github`昵称

其次，在你收到邮件并同意后，确保项目的管理者已经授予了你更改仓库的权限（即write权限），可以在个人主页 [repositories](https://github.com/settings/repositories) 处查看

## 上传你的改动

确保你的改动已经在本地文件中保存完毕

输入如下命令以将你的改动上传至仓库

如果你的终端此时被astro占据

另起一个也无妨，依次运行

`（默认在LKM-official-website目录下）`

```bash
git add .
git commit -m "<请输入文本>"
git push
```

`在<请输入文本>处添加你对此次改动的命名`

以上传你的改动

## 快速开始

更新数据

```bash
cd LKM-official-website
git pull
pnpm install
```

启动

```bash
pnpm dev
```

浏览器访问 `http://localhost:4321/LKM-official-website`
---

上传改动

```bash
git add .
git commit -m "<请输入文本>"
git push
```

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
├── backend/                    # FastAPI 测试后端 (Python)
│   ├── main.py                 # 入口文件
│   ├── app/                    # 模块化后端代码
│   │   ├── core/               # 响应格式 + 分页工具
│   │   ├── data/               # Mock 数据
│   │   ├── schemas/            # Pydantic 模型
│   │   └── modules/            # 13 个 API 路由模块
│   └── tests/                  # pytest 测试 (88 个)
├── src/
│   ├── assets/images/
│   │   ├── member/             # 原始头像图片
│   │   └── member-optimized/   # 优化后的 WebP 头像
│   ├── lib/                    # 共享库
│   │   ├── api/                # 统一数据访问层 (Axios + Result<T>)
│   │   ├── config/             # 站点配置读取
│   │   ├── constants/          # 常量定义
│   │   ├── errors/             # 错误处理 (Result<T> 模式)
│   │   ├── http/               # HTTP 客户端
│   │   ├── i18n/               # 国际化（中/英/日/韩等）
│   │   ├── utils/              # 工具函数
│   │   ├── markdown-plugins/   # Remark/Rehype 插件
│   │   └── db/                 # 本地数据库 schema
│   ├── scripts/                # 客户端脚本（blog-init/transitions/photoswipe）
│   ├── features/               # 业务功能模块 (26 个)
│   │   ├── admin/              # 管理后台
│   │   ├── anonymous-letter/   # 匿名树洞
│   │   ├── auth/               # 登录认证
│   │   ├── blog-community/     # 社区博客
│   │   ├── column/             # 专栏系统
│   │   ├── competition/        # 竞赛系统
│   │   ├── content/            # 内容组件
│   │   ├── contribution/       # 贡献/积分
│   │   ├── dashboard/          # 首页仪表盘
│   │   ├── editor/             # 富文本编辑器
│   │   ├── file-library/       # 文件库
│   │   ├── forum/              # 论坛
│   │   ├── funding/            # 资助系统
│   │   ├── homepage/           # 首页组件
│   │   ├── notification/       # 消息通知
│   │   ├── profile/            # 个人主页
│   │   ├── project-hub/        # 项目广场
│   │   ├── qa/                 # 问答系统
│   │   ├── search/             # 全局搜索
│   │   ├── shell/              # 顶栏/页脚/背景/通用 UI
│   │   ├── shell-community/    # 社区站壳
│   │   ├── shell-official/     # 官方站壳
│   │   ├── starhope/           # StarHope AI 学习助手
│   │   └── team/               # 团队页面组件
│   ├── layouts/                # 页面布局
│   ├── pages/                  # 文件路由
│   ├── styles/                 # 全局样式 (tailwind.css)
│   ├── types/                  # TypeScript 类型声明
│   ├── content/                # 内容（posts/）
│   ├── data/                   # 配置文件（config.yaml 等）
│   └── middleware.ts           # Astro 中间件（反向代理 /api/* → FastAPI）
├── AGENTS.md                   # AI Agent 指令
├── CLAUDE.md                   # Claude Code 配置
├── CODING_STANDARDS.md         # 代码规范
├── LICENSE.md                  # MIT 许可证
├── astro.config.ts             # Astro 配置（server 模式 + Vue/React 集成）
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
lib/            共享库（api/config/errors/http/utils 等）
  ↓
features/       业务功能模块（26 个）
  ↓
layouts/        页面布局（BaseLayout/PageLayout/SidebarLayout/MarkdownLayout/BlogLayout）
  ↓
pages/          文件路由页面
```

## 特性

- **Astro v7** SSR server 模式
- **Tailwind CSS v4** 暗色模式 + 自定义主题
- **12 种可切换动态背景** — 极光、数字雨、星座、DNA（2D/3D）、梦幻光晕、粒子等，自适应深浅主题
- **富文本编辑器** — 基于 Tiptap 3 的 MDX 双向编辑器，支持 AI 助手、版本历史、评论、自动保存
- **多框架支持** — React 19 + Vue 3 按需引入
- **View Transitions** SPA 风格页面切换
- **博客系统** — MD/MDX、分类/标签、分页、KaTeX 公式
- **SEO 完整** — Sitemap、RSS、Open Graph、Twitter Card
- **图片优化** — Sharp + Unpic CDN
- **Pagefind 全文搜索** — 客户端离线搜索
- **KaTeX** — 数学公式渲染
- **响应式适配** — 移动端至桌面端
- **FastAPI 测试后端** — 模块化 mock 后端，88 个 pytest 测试，统一响应格式

## 致谢 · 开源项目

本项目基于以下开源项目构建：

| 项目                                                              | 许可证     | 用途             |
| :---------------------------------------------------------------- | :--------- | :--------------- |
| [Astro](https://astro.build)                                      | MIT        | Web 框架         |
| [AstroWind](https://github.com/arthelokyo/astrowind)              | MIT        | 项目模板基础     |
| [Tailwind CSS](https://tailwindcss.com)                           | MIT        | 样式系统         |
| [React](https://react.dev)                                        | MIT        | UI 组件          |
| [Vue.js](https://vuejs.org)                                       | MIT        | UI 组件          |
| [Element Plus](https://element-plus.org)                          | MIT        | UI 组件库        |
| [Tiptap](https://tiptap.dev)                                      | MIT        | 富文本编辑器引擎 |
| [Three.js](https://threejs.org)                                   | MIT        | 3D 图形渲染      |
| [KaTeX](https://katex.org)                                        | MIT        | 数学公式渲染     |
| [Mermaid](https://mermaid.js.org)                                 | MIT        | 图表渲染         |
| [Pagefind](https://pagefind.app)                                  | MIT        | 全文搜索         |
| [PhotoSwipe](https://photoswipe.com)                              | MIT        | 图片预览         |
| [Expressive Code](https://expressive-code.com)                    | MIT        | 代码高亮         |
| [Markdown-it](https://github.com/markdown-it/markdown-it)         | MIT        | Markdown 解析    |
| [sanitize-html](https://github.com/apostrophecms/sanitize-html)   | MIT        | HTML 消毒        |
| [Neverthrow](https://github.com/supermacro/neverthrow)            | MIT        | 类型安全错误处理 |
| [Dexie.js](https://dexie.org)                                     | Apache-2.0 | IndexedDB 封装   |
| [OverlayScrollbars](https://kingsora.github.io/OverlayScrollbars) | MIT        | 自定义滚动条     |
| [unpic](https://unpic.pics)                                       | MIT        | 图片优化         |
| [QRCode](https://github.com/soldair/node-qrcode)                  | MIT        | 二维码生成       |
| [sharp](https://sharp.pixelplumbing.com)                          | Apache-2.0 | 图片处理         |
| [Lighthouse](https://github.com/GoogleChrome/lighthouse)          | Apache-2.0 | 性能审计         |
| [Playwright](https://playwright.dev)                              | Apache-2.0 | E2E 测试         |
| [Vitest](https://vitest.dev)                                      | MIT        | 单元测试         |
| [ESLint](https://eslint.org)                                      | MIT        | 代码检查         |
| [Prettier](https://prettier.io)                                   | MIT        | 代码格式化       |
| [TypeScript](https://www.typescriptlang.org)                      | Apache-2.0 | 类型系统         |

---

## 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE.md](./LICENSE.md)。
