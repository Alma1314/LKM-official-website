# Claude Code Configuration

## 默认加载 Skills

在每次对话开始时，自动加载以下 skills：

1. **emil-design-eng** — Emil Kowalski 的 UI 打磨哲学：组件设计、动画决策、细节打磨
2. **frontend-layered-architecture-code-generator** — 前端分层架构代码生成器

## 后端

启动测试后端：`pnpm run dev:backend`（uvicorn + uv，端口 8000）
一键启动前后端：`pnpm run dev`（并行启动 Astro + FastAPI）
运行后端测试：`pnpm run test:backend`（含 GraphQL 测试，共 96 个）
GraphQL 端点：`http://localhost:8000/graphql`（Strawberry + FastAPI）

后端使用 uv 虚拟环境管理，首次使用需 `cd backend && uv sync` 安装依赖。
Python 版本要求：>= 3.12

---

See [AGENTS.md](./AGENTS.md) for all project documentation and AI agent instructions.
