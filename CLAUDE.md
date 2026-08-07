# Claude Code Configuration

## 默认加载 Skills

在每次对话开始时，自动加载以下 skills：

1. **emil-design-eng** — Emil Kowalski 的 UI 打磨哲学：组件设计、动画决策、细节打磨
2. **frontend-layered-architecture-code-generator** — 前端分层架构代码生成器

## 后端

启动测试后端：`pnpm run dev:backend`（uvicorn + uv，端口 8000）
一键启动前后端：`pnpm run dev`（并行启动 Astro + FastAPI）
运行后端测试：`pnpm run test:backend`（pytest 测试，共 112 个）
运行认证前端测试：`pnpm run test:auth`（vitest run src/features/auth）
GraphQL 端点：`http://localhost:8000/graphql`（Strawberry + FastAPI）

后端使用 uv 虚拟环境管理，首次使用需 `cd backend && uv sync` 安装依赖。
Python 版本要求：>= 3.12

## 认证系统

认证已从旧的 **mock demo-accounts** 系统迁移为 **真实 FastAPI JWT 后端**，无任何 mock 账号。

- **后端认证端点**：`/api/auth/*`（不再是 `/auth/*`），含 login/register/refresh/logout/me
- **Pinia Store**：`src/stores/auth.ts`（`useAuthStore`），用户状态、token 管理的**单一状态源**（`user`/`isLoggedIn`/`session`/`_token`/`_refreshToken`/`onboardingCompleted`），localStorage 持久化（key `lkm-auth-store`）
- **Flow Composable**：登录/注册/找回/引导走 `useLoginFlow`/`useRegisterFlow`/`useRecoveryFlow`/`useOnboardingFlow`；`useAuthProvider`/`useAuth`（`src/features/auth/composables/useAuth.ts`）仍存在作兼容桥，投影 store 状态并管理 2FA 过渡态
- **HTTP 认证适配器**：`src/lib/http/client.ts` 的 `configureHttpAuthSession(getHttpAccessToken())` 统一读写 token，含 JWT request 拦截器 + 401 自动刷新队列（走 `/api/auth/refresh`）
- **GraphQL 认证**：`src/lib/api/graphql/exchanges/auth.ts`（urql `authExchange`）经 `getHttpAccessToken()` 为操作自动附加 `Authorization: Bearer` 头
- **测试模式**：`PUBLIC_AUTH_TEST_MODE`（`src/env.d.ts`、`.env.example`）；后端仅模拟高级认证（GitHub/Passkey/2FA/找回/绑定/onboarding，走 `simulation.py`），不接真实 OAuth/WebAuthn/邮件/短信/TOTP
- **共享 UI 原语**：`src/features/auth/components/shared/`（AuthShell/AuthCard/AuthField/AuthSegmentedControl/AuthMethodButton/AuthStatus/VerificationCodeField）
- **类型**：`src/types/auth.d.ts` 定义真实 `User`（已移除 `DemoUser`）

---

See [AGENTS.md](./AGENTS.md) for all project documentation and AI agent instructions.
