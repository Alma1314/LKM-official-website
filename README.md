# LKM Official Website · 理科迷官方网站

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Astro v7](https://img.shields.io/badge/Astro-v7-FF5D01?logo=astro)](https://astro.build)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)

**理科迷 (LKM)** 的官方网站 — 基于 [AstroWind](https://github.com/arthelokyo/astrowind) 模板，采用 Astro v7 + Tailwind CSS v4 + Vue 3 构建，Astro SSR server 模式部署。LKM 是创立于 2014 年的科技爱好者社区，覆盖数学、物理、化学、生物、信息技术等多个学科。

---

## 前言

就目前而言，理科迷（`LKM`）的官网是基于`github.io`的个人主页，目前为止，网站基于`Astro`架构搭建

（`Astro`：[Astro](https://astro.build/)）

整体处于测试阶段，部分功能尚有不完善之地，还请谅解，在国内部署域名可能要再很长一段时间后才能实践，如果你有兴趣来参与网站建设，欢迎报名！加入技术委员会（QQ群`1104277319`）以更深入的交流！在正式你的开发之旅前，我们首先建议开发工作在电脑端完成，以下以`WINDOWS`系统为例。

总仓库地址（你目前所处网页）为： [https://github.com/LKM-AHZ/LKM-official-website](https://github.com/LKM-AHZ/LKM-official-website)

后端仓库地址：[LKM-AHZ/LKM-service: backend](https://github.com/LKM-AHZ/LKM-service)

如果你是一名新手，我们也欢迎你的加入，在正式加入项目之前，你可以先熟悉一下项目架构后再考虑加入。

当然，我们默认你已基本会使用`github`。

[**什么？！你连GitHub都不知道是啥？！**](https://www.bilibili.com/video/BV1m4GhzEER3/?spm_id_from=333.337.search-card.all.click&vd_source=0fd643b947c80b42ab465c4ed3101244)

## 新手指导 · 环境部署

**oi！小登！**

你需要准备如下工具来完成对开发环境的部署，当然~后续的所有操作将在`cmd`（命令提示符）中执行：

`Git bash`（以下简称`git`），`pnpm，NodeJS 24+`，以及一个稳定可靠的网络。

[Git bash](https://git-scm.com/install/windows)

[Pnpm](https://pnpm.io/zh/installation)

[NodeJS](https://pnpm.io/zh/installation)

相关的安装教程可以在如`CSDN`或是`B站`上等找到教程

安装好这些工具后，打开`cmd`，输入指令

```cmd
git clone https://github.com/LKM-AHZ/LKM-official-website.git
```

克隆完成后，进入项目所在的本地目录下

```cmd
cd LKM-official-website
```

如果你不想让项目默认安装在C盘，在后续的操作中，请记得要输入参数` /d`来改变盘符。

运行命令

```cmd
pnpm install
```

后在运行

```cmd
pnpm run dev
```

此时会输出

```bash
$ astro dev
```

随后打开浏览器（默认为`Edge`）访问链接[理科迷 —— 科技爱好者](http://localhost:4321/LKM-official-website)

即可看到目前的官网。

## 开发工具部署

通常情况下我们选用[VScode](https://code.visualstudio.com/Download?_exp_download=fb315fc982)进行开发，安装完VScode后，你需要在`VScode`中的插件商店里下载如下组件

`Nodejs（extensions for nodejs）`

`Pnpm（Pnpm commands for VSCode）`

`Astro（Language support for Astro）`

`MDX （Language support for MDX）`

随后，用`VScode`打开文件夹

`（默认位置为C盘）C:\Users\<你的用户名>\LKM-official-website`

即可完成开发环境的部署。

## 下载过程中易遇到的问题

当然，你也可以直接用`cmd`的`code`命令来直接打开。

对于`github`本身，用户可用`SSL`来解决大部分在`git clone`时遇到的网络波动的问题

而对于`pnpm install`，这一步本身也极易受到网络干扰，

例如在输入`pnpm install`后等待一段时间后会输出红色字幕警告：如

```bash
[ERR_PNPM_META_FETCH_FAIL] GET https://registry.npmjs.org/......: The operation was aborted due to timeout
```

这个时候就要尝试切换镜像源了

不过要注意

在更换完镜像源后，切记输入清除缓存的指令以防干扰

```cmd
pnpm store prune
```

如果只是中途发生错误，并不需要更换镜像源的话，输入下面这串指令以清除缓存

```cmd
pnpm clean –lockfile
```

输入如下这串命令以检查网络延迟（不过这条貌似没什么用，即便它的响应在700ms内，该下载不上的还是下载不上）

```cmd
npm ping
```

我们注意到，使用指令

```cmd
set NODE_OPTIONS=--dns-result-order=ipv4first
set PNPM_NETWORK_CONCURRENCY=4
set PNPM_FETCH_TIMEOUT=60000
```

后，`pnpm`的下载明显要稳定很多

我们可以通过在后面加参数`--network-concurrency=1 --fetch-timeout=60000`的形式的形式来稳定pnpm的下载，例如

```cmd
pnpm install --network-concurrency=1 --fetch-timeout=60000
```

不过官网的下载速度一般很慢，我们可以改为采用镜像源的形式来加快下载进度，输入如下这串指令来更换链接（默认此时在`LKM-official-website`的根目录中执行，这里我们采用淘宝的镜像源）

```cmd
pnpm config set registry https://registry.npmmirror.com
pnpm store prune
pnpm install --network-concurrency=2 --fetch-timeout=60000
```

## 关于后续的更新

```cmd
cd LKM-official-website
```

输入

```cmd
git stash
```

来保留你的更改，

在后续的使用中，如要更新别人的内容，需要你手动完成，依次输入

```cmd
git stash
git pull
pnpm install --network-concurrency=2 --fetch-timeout=60000
```

如看到类似的输出

```bash
Already up to date
```

则说明更新完成

## 启动开发平台

确保完成上述步骤后，重新启用一个终端，输入

```cmd
cd LKM-official-website
pnpm dev
```

浏览器访问[理科迷 —— 科技爱好者](http://localhost:4321/LKM-official-website/)

`VScode`进入`LKM-official-website`文件夹即可启动开发平台。

（记得勾选我完全信任）

目前，`Astro`采用的是**热更新**的架构，这意味着你在修改源文件的同时修改能迅速反映到网页上。

## 嘿！你需要基本熟悉一下目前的网站的基本架构！

这里举两个例子

例如要编写团队信息，具体的位置在

`LKM-official-website\src\features\team\data\members.ts`

中。

如要编写起始页的信息，具体的位置在

`LKM-official-website\src\pages\official\index.astro`

中

其余的请详见**项目结构**。

## 正式加入

在做好要加入开发组（目前叫技术组）的准备后，你需要准备一个`github`账号和一个能用的邮箱，例如QQ邮箱，（**确保你的账户有效且不会被盗，且保证我们能够与你取得联系**），向有关部门提交申请后，如果通过，会发给你一封加入组织的邮件，首先你需要在本地中登录你的`github`账户，`cmd`在`LKM-official-website`目录下输入命令

```cmd
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

在`you@example.com`处填入你的`github`账户所绑定的邮箱
在`Your Name`处填入你的`github`账户昵称

其次，在你收到邮件后，同意并加入到组织中，并确保项目的管理者已经授予了你更改仓库的权限（即`write`权限），可以在个人主页[repositories](https://github.com/settings/repositories)处查看。

## 上传你的改动

确保你的改动已经在本地文件中保存完毕，`VScode`的快捷键是`CTRL+S`

在`cmd`终端中（默认为`LKM-official-website`目录下）输入如下命令以将你的改动上传至仓库

```cmd
git add .
git commit -m "<请输入文本>"
git push
```

不过注意，也许你注意到了，在你上传完改动到仓库后，仓库大概率会显示

**Some checks were not successful**

你可以在

[Commits · LKM-AHZ/LKM-official-website](https://github.com/LKM-AHZ/LKM-official-website/commits/main/)

中查看详情原因

如果要让改动通过`pending`并显示为`success`

首先你需要知道你改动的文件的路径，这里以src\pages\official\index.astro为例，**假设**你对这个文件做出了改动

那么`cmd`输入如下指令即可。

```cmd
pnpm exec prettier --write src\pages\official\index.astro
git add src\pages\official\index.astro
git commit -m "请输入文本"
git push
```

`pnpm run dev` 仅启动 **Astro（端口 4321）**。仓库不含后端，后端请求经 `API_URL` 代理到真实后端（见 `.env.example`），未配置则前端仅提供不依赖 API 的页面。

## 联系我们

这套教程的维护由清汉负责，如对这套教程有建议者可通过QQ`1121840744`来联系我

项目骨干：笨笨狐狸 `3674887670`

项目领导者：笨蛋千寻`1549258401`

后端 & 前端 维护与开发人员（也算作是）：

Lich|et`2869580566`

Eptazocine`3070025462`

**等**

---

## 常用命令

| 命令                    | 说明                                                            |
| :---------------------- | :-------------------------------------------------------------- |
| `pnpm run dev`          | 启动开发服务器                                                  |
| `pnpm run build`        | 生产构建到 `./dist/`                                            |
| `pnpm run preview`      | 本地预览生产构建                                                |
| `pnpm run check`        | 类型检查 + ESLint + Prettier                                    |
| `pnpm run fix`          | 自动修复 ESLint + Prettier                                      |
| `pnpm run test:smoke`   | Playwright E2E 冒烟测试                                         |
| `pnpm run test:a11y`    | Playwright 无障碍测试                                           |
| `pnpm run check:seo`    | SEO 输出检查                                                    |
| `pnpm run check:links`  | 链接有效性检查                                                  |
| `pnpm run test`         | 运行 Vitest 测试                                                |
| `pnpm run test:auth`    | 运行认证前端 Vitest 测试（`vitest run src/features/auth`）      |

---

## 项目结构

```
/
├── .github/workflows/          # CI/CD (GitHub Actions)
├── public/                     # 静态资源
├── src/
│   ├── assets/images/          # 图片资源
│   │   ├── member/             # 原始头像图片
│   │   └── member-optimized/   # 优化后的 WebP 头像
│   ├── lib/                    # 共享库（api/config/constants/errors/http/i18n/utils/markdown-plugins）
│   ├── scripts/                # 客户端脚本（blog-init/transitions/photoswipe）
│   ├── features/               # 业务功能模块 (25 个)
│   │   ├── admin/              # 管理后台
│   │   ├── anonymous-letter/   # 匿名树洞
│   │   ├── auth/               # 登录认证
│   │   ├── blog-community/     # 社区博客
│   │   ├── column/             # 专栏系统
│   │   ├── competition/        # 竞赛系统
│   │   ├── content/            # 内容组件
│   │   ├── contribution/       # 贡献/积分
│   │   ├── dashboard/          # 首页仪表盘
│   │   ├── editor/             # 富文本编辑器（TipTap 3）
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
│   │   ├── team/               # 团队页面组件
│   │   └── triggered-discharge/ # 击发队列特效
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

### 官方站点 (`/official`)

| 路由       | 路径                     | 源文件                              |
| :--------- | :----------------------- | :---------------------------------- |
| 首页       | `/official`              | `pages/official/index.astro`        |
| 管理团队   | `/official/team`         | `pages/official/team.astro`         |
| 项目团队   | `/official/project-team` | `pages/official/project-team.astro` |
| 关于       | `/official/articles`     | `pages/official/articles/`          |
| 服务       | `/official/services`     | `pages/official/services.astro`     |
| 赞助与支持 | `/official/pricing`      | `pages/official/pricing.astro`      |
| 联系我们   | `/official/contact`      | `pages/official/contact.astro`      |
| QQ 社群    | `/official/communities`  | `pages/official/communities.astro`  |
| 隐私政策   | `/official/privacy`      | `pages/official/privacy.md`         |
| 使用条款   | `/official/terms`        | `pages/official/terms.md`           |

### 社区平台 (`/community`)

| 路由     | 路径                               | 说明            |
| :------- | :--------------------------------- | :-------------- |
| 社区首页 | `/community`                       | 动态流 + 仪表盘 |
| 论坛板块 | `/community/forum`                 | 板块广场        |
| 论坛详情 | `/community/forum/<slug>`          | 板块帖子列表    |
| 帖子详情 | `/community/forum/post/<id>`       | 帖子正文 + 评论 |
| 专栏列表 | `/community/columns`               | 专栏广场        |
| 专栏详情 | `/community/columns/<slug>`        | 专栏文章列表    |
| 专栏文章 | `/community/columns/<slug>/<id>`   | 文章详情        |
| 文件库   | `/community/files`                 | 文件列表        |
| 文件详情 | `/community/files/<id>`            | 文件详情 + 下载 |
| 竞赛大厅 | `/community/competition`           | 竞赛列表        |
| 竞赛详情 | `/community/competition/<id>`      | 竞赛详情/报名   |
| 竞赛答题 | `/community/competition/<id>/exam` | 答题界面        |
| 题库中心 | `/community/competition/bank`      | 题库浏览        |
| 匿名树洞 | `/community/treehole`              | 信件流          |
| 树洞写信 | `/community/treehole/write`        | 写信页          |
| 漂流瓶   | `/community/treehole/bottle`       | 捞漂流瓶        |

### 账号系统

| 路由     | 路径                   | 说明                                                   |
| :------- | :--------------------- | :----------------------------------------------------- |
| 登录     | `/login`               | 账户/邮箱/手机 + 密码、验证码、GitHub/Passkey/2FA/找回 |
| 注册     | `/register`            | 本地账户或邮箱/手机验证码注册                          |
| 注册引导 | `/register/onboarding` | 引导流程                                               |
| 账号设置 | `/account`             | 个人设置（含 2FA/Passkey/账号绑定）                    |
| 账号找回 | `/account/recovery`    | 密码找回（邮箱/手机/验证码）                           |

### 认证与账号流程

认证前端对接真实后端 JWT 认证（无 mock 账号），经 `API_URL` 指向真实后端，单页依次支持：

- **账户登录**：账户/邮箱/手机 + 密码、短信/邮箱验证码、邮箱 Magic Link
- **高级认证**：GitHub、Passkey、2FA（二次验证）、密码找回、登录后引导（onboarding）与账号绑定
- **测试模式**：可通过环境变量 `PUBLIC_AUTH_TEST_MODE` 开启前端测试 UI；后端真实能力由真实后端决定

账号状态由 `src/stores/auth.ts`（`useAuthStore`）作为单一状态源，localStorage key `lkm-auth-store`。

### 其他

| 路由       | 路径                      | 说明             |
| :--------- | :------------------------ | :--------------- |
| 项目广场   | `/official/projects`      | 项目大厅         |
| 项目详情   | `/official/projects/<id>` | 项目详情         |
| 求助系统   | `/official/qa`            | 问答大厅         |
| 求助提问   | `/official/qa/ask`        | 提问页           |
| 求助详情   | `/official/qa/<id>`       | 问题详情         |
| 贡献系统   | `/contribution`           | 积分/成就/排行榜 |
| 资助系统   | `/official/funding`       | 资助占位页       |
| 管理后台   | `/admin`                  | 后台仪表盘       |
| 用户管理   | `/admin/users`            | 后台用户列表     |
| 帖子管理   | `/admin/posts`            | 后台帖子审核     |
| 文件审核   | `/admin/files`            | 后台文件审核     |
| 板块管理   | `/admin/categories`       | 后台板块管理     |
| 举报管理   | `/admin/reports`          | 后台举报处理     |
| 文档管理   | `/admin/documents`        | 后台文档编辑器   |
| 匿名信大厅 | `/letters`                | 匿名信列表       |
| StarHope   | `/starhope`               | AI 学习助手      |
| 团队介绍   | `/apps`                   | 应用入口         |
| 博客       | `/blog`                   | 博客列表         |
| 博客文章   | `/blog/<slug>`            | 博客文章         |
| 404        | `/404`                    | 404 页面         |
| RSS        | `/rss.xml`                | RSS 订阅         |

---

## 配置系统

`src/data/config.yaml` 通过自定义集成注入：

```ts
import { SITE, I18N, METADATA, APP_BLOG, UI, ANALYTICS } from '~/lib/config';
```

常用配置项：站点名称/URL、SEO 元数据、博客开关与分页、Google Analytics ID、主题模式等。

---

## 样式系统

**Tailwind CSS v4** — CSS-first 配置，入口 `src/styles/tailwind.css`，支持暗色模式、自定义主题变量、Typography 插件。部分组件使用 **CSS Modules** 实现局部作用域样式，结合 **KaTeX** 渲染数学公式。

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

推送 `main` 分支后，GitHub Actions 自动构建部署。

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
features/       业务功能模块（25 个）
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
- **前后端分离** — 本仓库仅前端，对接独立部署的真实后端（REST + GraphQL），经 `API_URL` 代理

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
