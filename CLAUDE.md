# Claude Code Configuration

## 默认加载 Skills

在每次对话开始时，自动加载以下 skills：

1. **emil-design-eng** — Emil Kowalski 的 UI 打磨哲学：组件设计、动画决策、细节打磨
2. **frontend-layered-architecture-code-generator** — 前端分层架构代码生成器

## Monorepo 结构

项目使用 pnpm workspace，编辑器已隔离为独立包：

| 包 | 路径 | 说明 |
|---|---|---|
| `@lkm/rich-text-editor` | `packages/rich-text-editor/` | TipTap 编辑器核心（可独立发布） |
| `@lkm/editor-persistence` | `packages/editor-persistence/` | 浏览器端持久化插件 |

编辑器的 engine/components/hooks/stores 代码位于 packages/ 内，不在 src/features/editor/ 下。
`src/features/editor/index.ts` 是薄适配层，组装两个包导出给 Astro 页面。

`pnpm build:packages` 可单独构建两个包。

See [AGENTS.md](./AGENTS.md) for all project documentation and AI agent instructions.
