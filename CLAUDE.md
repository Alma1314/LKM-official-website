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

## 认证系统

认证已从旧的 **mock demo-accounts** 系统迁移为 **真实 FastAPI JWT 后端**，无任何 mock 账号。

- **后端认证端点**：`/api/auth/*`（不再是 `/auth/*`），含 login/register/refresh/logout/me
- **Pinia Store**：`src/stores/auth.ts`（`useAuthStore`），负责用户状态、token 管理、localStorage 持久化（key `lkm-auth-store`）
- **Composable 桥接层**：`src/features/auth/composables/useAuth.ts`，把组件调用桥接到 Pinia store
- **HTTP 客户端**：`src/lib/http/client.ts` 含 JWT request 拦截器 + 401 自动刷新队列（走 `/api/auth/refresh`）
- **GraphQL 认证**：`src/lib/api/graphql/exchanges/auth.ts` 为 urql 操作自动附加 `Authorization: Bearer` 头
- **类型**：`src/types/auth.d.ts` 定义真实 `User`（已移除 `DemoUser`）

---

See [AGENTS.md](./AGENTS.md) for all project documentation and AI agent instructions.
