---
title: LKM 网站贡献指南
published: 2026-07-20
description: 如何为 LKM 官网撰写文章和参与开发。
image: './cover.jpeg'
tags: [指南, 贡献, Astro]
category: 教程
draft: false
---

本指南面向希望为 LKM 网站做出贡献的用户，无论是撰写技术文章还是改进网站功能。

## 文章 Frontmatter

每篇文章需要在文件顶部使用 YAML 格式声明元信息：

```yaml
---
title: 文章标题
published: 2026-07-20
description: 文章简介，会显示在列表页
image: ./cover.jpg
tags: [标签1, 标签2]
category: 分类
draft: false
---
```

| 字段          | 说明                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| `title`       | 文章标题（必填）                                                          |
| `published`   | 发布日期                                                                  |
| `description` | 文章简介，显示在列表页                                                    |
| `image`       | 封面图片路径。支持三种形式：网络图片（以 `http://` 或 `https://` 开头）、 |
|               | public 目录下的图片（以 `/` 开头）、相对于 Markdown 文件的本地图片        |
| `tags`        | 文章标签，数组格式                                                        |
| `category`    | 文章分类                                                                  |
| `draft`       | 设为 `true` 则文章为草稿，不会在正式站点显示                              |

## 文章存放位置

文章文件应放在 `src/content/posts/` 目录下。可以在其中创建子目录来组织文章和相关资源：

```
src/content/posts/
├── post-1.md
└── post-2/
    ├── cover.png
    └── index.md
```

## 环境准备

开始前请确保安装以下工具：

- **Node.js** >= 24
- **Git**
- **pnpm**（项目使用 pnpm workspace 管理依赖）

克隆项目并安装依赖：

```bash
git clone https://github.com/LKM-AHZ/LKM-official-website.git
cd LKM-official-website
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

访问 `http://localhost:4321` 即可预览网站。

## 撰写文章

使用 Markdown 语法撰写文章。项目支持：

- 标准 Markdown（标题、列表、引用、链接、图片等）
- 代码高亮（见"[代码块功能展示](/posts/expressive-code)"）
- HTML 直接嵌入（如视频 iframe）
- `.mdx` 文件中可使用 Astro 组件

## 项目结构概览

```
src/
  content/              # 内容集合
    posts/              # 博客文章（Markdown/MDX）
    docs/               # 文档页面
  pages/                # 文件路由
  components/           # 组件目录
  core/                 # 核心工具与配置
  ui/                   # UI 原语组件
  features/             # 业务 feature 模块
```

## 提交规范

提交信息建议使用以下前缀：

- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 代码重构

## 获取帮助

- 查看项目 [README](https://github.com/LKM-AHZ/LKM-official-website) 和 [AGENTS.md](https://github.com/LKM-AHZ/LKM-official-website/blob/main/AGENTS.md)
- 在 GitHub 仓库提 Issue
- 技术栈：Astro v7 + Tailwind CSS v4 + TypeScript
