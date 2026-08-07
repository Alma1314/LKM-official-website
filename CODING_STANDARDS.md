# LKM 项目代码规范

## 工具链

| 工具         | 用途                                           |
| ------------ | ---------------------------------------------- |
| ESLint       | JavaScript/TypeScript/Astro 语法和最佳实践检查 |
| Prettier     | 代码风格统一格式化                             |
| EditorConfig | 编辑器基础设置（编码、换行、缩进）             |

## Prettier 格式化规则

| 规则            | 值                     |
| --------------- | ---------------------- |
| `printWidth`    | 120                    |
| `tabWidth`      | 2                      |
| `useTabs`       | false（使用空格缩进）  |
| `semi`          | true（语句末尾加分号） |
| `singleQuote`   | true（使用单引号）     |
| `trailingComma` | es5（允许尾逗号）      |

## ESLint 规则

### 未使用变量

- 变量声明后必须使用，否则报错
- 以 `_` 开头的参数和数组解构变量允许未使用（如 `_req`, `_unused`）

```js
// 允许
function handler(_req, res) { ... }

// 不允许
const base = import.meta.env.BASE_URL;  // 声明但未使用
```

### 其他规则

- `@typescript-eslint/no-non-null-assertion` — 关闭（允许使用 `!` 非空断言）
- `no-mixed-spaces-and-tabs` — 开启 `smart-tabs` 模式

## EditorConfig 规则

| 规则                       | 值                          |
| -------------------------- | --------------------------- |
| `charset`                  | utf-8                       |
| `end_of_line`              | lf（Unix 换行符）           |
| `indent_size`              | 2                           |
| `indent_style`             | space                       |
| `insert_final_newline`     | true（文件末尾插入空行）    |
| `trim_trailing_whitespace` | false（不自动删除行尾空白） |

## 常用命令

```bash
pnpm run check    # 运行所有检查：astro check + ESLint + Prettier
pnpm run fix      # 自动修复 ESLint + Prettier 问题
pnpm run build    # 生产构建（CI 会同时运行 check）
```

## CI 流程

GitHub Actions 配置了一个工作流文件：

### actions.yaml — PR 与 Push 检查 + 部署

| Job      | 触发                                   | 内容                                                            |
| -------- | -------------------------------------- | --------------------------------------------------------------- |
| `build`  | PR 到 main / Push 到 main              | `pnpm run build` 生产构建                                       |
| `check`  | PR 到 main / Push 到 main              | `pnpm run check`（check:astro + check:eslint + check:prettier） |
| `deploy` | Push 到 main（build + check 都通过后） | 构建部署至生产环境                                             |

### 部署

部署通过 `actions.yaml` 中的 `deploy` job 完成：Push 到 main 分支时（build + check 通过后）完成部署。

### 通过 CI 的门槛

1. **`pnpm run build` 必须成功** — 项目可以无错误地构建
2. **`pnpm run check` 必须通过** — 包含三项检查：
   - `astro check` — Astro 类型检查
   - `eslint .` — ESLint 代码规范检查（零 error）
   - `prettier --check .` — Prettier 格式检查（零 warn）
3. **deploy job 依赖 build 和 check 都通过** — 任一失败则不会部署

## 开发流程

**每次修改代码后，必须先通过本地 CI 检查才能提交：**

```bash
pnpm run fix     # 1. 自动修复 ESLint + Prettier 问题
pnpm run check   # 2. 运行完整检查，确认零 error 零 warn
pnpm run build   # 3. 确认生产构建成功
```

**以上三步全部通过后才能 `git commit`。** 任何一个失败都必须修复后再提交，不允许将报错推到 CI 由远端捕获。

## 语法选择

**优先使用 `.astro` 文件编写组件和页面。** Astro 模板语法是第一选择，只在以下情况引入其他框架：

| 场景                     | 使用框架 | 说明                  |
| ------------------------ | -------- | --------------------- |
| 静态页面和内容组件       | `.astro` | 默认选择              |
| 主要交互组件（社区平台） | Vue 3    | 通过 `@astrojs/vue`   |
| 富文本编辑器             | React 19 | 通过 `@astrojs/react` |

```astro
{/* 推荐：使用 Astro 语法 */}
const items = ['A', 'B', 'C'];
<ul>
  {items.map((item) => <li>{item}</li>)}
</ul>
```

```astro
{/* 避免：不必要地引入 React/Vue 框架组件 */}
<Counter client:load />
{/* 仅当确实需要客户端交互时使用 */}
```

## 组件规范

- 使用 TypeScript 类型定义
- Props 使用 TypeScript 接口
- 使用 `class:list` 进行条件样式绑定
- 接收 `className` 覆写时使用 `twMerge()` 合并
- 布局组合使用具名插槽（named slots）

## 路径别名

使用 `~/` 替代 `src/`：

```typescript
import Image from '~/ui/primitives/Image.astro';
import { siteConfig } from '~/lib/config';
```

## 运行环境

| 项目      | 要求                                                                   |
| --------- | ---------------------------------------------------------------------- |
| 包管理器  | **pnpm**（禁止使用 npm / yarn）                                        |
| 安装命令  | `pnpm install --frozen-lockfile`（CI）/ `pnpm install`（本地新增依赖） |
| Node.js   | `>= 24.0.0`                                                            |
| `.pnpmrc` | `shamefully-hoist=true`（Astro 依赖暴露）                              |

## TypeScript 配置

| 规则               | 值                          |
| ------------------ | --------------------------- |
| 继承基类           | `astro/tsconfigs/base`      |
| `strictNullChecks` | `true`                      |
| `allowJs`          | `true`                      |
| `baseUrl`          | `.`                         |
| 路径映射           | `~/*` → `src/*`             |
| 包含               | `.astro/types.d.ts`、`**/*` |
| 排除               | `dist/`、`node_modules`     |

## 站点配置

站点元数据集中在 `src/data/config.yaml` 中管理，通过 `~/lib/config` 导入：

```typescript
import { siteConfig, navBarConfig, profileConfig } from '~/lib/config';
```

| 字段        | 说明                                          |
| ----------- | --------------------------------------------- |
| `site.name` | 站点名称（理科迷）                            |
| `site.base` | 部署路径前缀（`/LKM-official-website`）                                  |
| `metadata`  | SEO 默认值（标题、描述、Open Graph、Twitter） |
| `i18n`      | 国际化（语言 `zh-cn`、文字方向 `ltr`）        |
| `apps.blog` | 博客开关、每页文章数、路径名                  |
| `ui.theme`  | 主题模式（`system`）                          |
| `analytics` | Google Analytics ID                           |

修改 `config.yaml` 后需要重启 dev server。

## 导航配置

页头和页脚链接在 `src/navigation.ts` 中统一管理：

- `headerData` — 顶部导航栏（含嵌套下拉菜单）
- `footerData` — 底部链接、社交图标、版权信息
- 所有链接必须使用 `getPermalink()` 生成，不能硬编码路径

## 内容集合（博客文章）

### 文件位置

博客文章放在 `src/content/posts/`，支持 `.md` 和 `.mdx` 格式。

### 必需字段

| 字段        | 类型     | 说明               |
| ----------- | -------- | ------------------ |
| `title`     | `string` | **必填**，文章标题 |
| `published` | `Date`   | 发布日期           |

### 可选字段

| 字段          | 类型       | 说明                     |
| ------------- | ---------- | ------------------------ |
| `updated`     | `Date`     | 更新日期                 |
| `draft`       | `boolean`  | 草稿模式（默认 `false`） |
| `description` | `string`   | 文章描述                 |
| `image`       | `string`   | 封面图路径               |
| `category`    | `string`   | 分类                     |
| `tags`        | `string[]` | 标签列表                 |
| `lang`        | `string`   | 语言                     |

### 示例

```markdown
---
title: 我的第一篇文章
published: 2026-07-04
description: 这是一篇示例文章。
category: tutorials
tags: [astro, tailwind]
---
```

## 性能规范

### Lighthouse 性能分析

项目通过 `scripts/lighthouse-report.mjs` 进行全站 Lighthouse 分析：

```bash
pnpm run build                         # 1. 确保 dist/ 是最新构建
node scripts/lighthouse-report.mjs     # 2. 运行 Lighthouse（20 个抽样页面）
# 报告输出到 reports/lighthouse/summary.md
```

**性能目标：**

| 指标                 | 目标  |
| -------------------- | ----- |
| 平均 Performance     | >= 80 |
| FAIL (<50) 页面      | 0     |
| PASS (90+) 页面      | >= 4  |
| 平均 Accessibility   | >= 90 |
| Best Practices / SEO | 100   |

### Icon 本地化

- 所有 icon 通过 `astro-icon` 的 `include` 配置本地打包，禁止运行时 Iconify API 调用
- `astro.config.ts` → `integrations.icon.include` 已覆盖 `tabler`、`material-symbols`、`fa6-brands`、`fa6-regular`、`fa6-solid`、`flat-color-icons`
- 新增 icon 集需同步更新 `include` 列表

### Vue `client:only` CLS 防护

- 使用 `client:only` 指令的组件（Vue）**必须包裹 `style="min-height: 400px"` 容器**
- 防止组件挂载后内容注入造成 Cumulative Layout Shift
- 例外：已使用全高布局（如 `MainGridLayout`、`SidebarLayout`）的页面，布局本身提供高度保障时可不额外包裹

### Vendor chunk 策略

- `astro.config.ts` → `vite.build.rollupOptions.output.manualChunks`
- 全局使用的框架和图标库加入对应 vendor chunk：
  - `react` / `react-dom` → `vendor-react`
  - `vue` / `@iconify/vue` → `vendor-vue`
  - `three` → `vendor-three`，`katex` / `rehype-katex` → `vendor-katex`
- 页面级小众依赖（overlayscrollbars、photoswipe）保持独立异步加载
- 新增全局框架依赖时需同步更新 `manualChunks`

### Preconnect

- `BaseLayout.astro` 已配置以下域名 preconnect：
  - `fonts.googleapis.com` / `fonts.gstatic.com`
  - `images.unsplash.com`
  - `api.iconify.design` / `api.simplesvg.com` / `api.unisvg.com`

## Git 规范

| 规则     | 说明                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| 主分支   | `main`（所有 push 和 PR 的目标）                                                        |
| 忽略文件 | `dist/`、`node_modules/`、`.astro/`、`.env`、`tools/`、`/scripts/`、`docs/`、`.claude/` |
| Commit   | 提交前必须通过 `pnpm run check` 和 `pnpm run build`                                     |
| 换行符   | 统一 LF（`.editorconfig` + `git config core.autocrlf`）                                 |
