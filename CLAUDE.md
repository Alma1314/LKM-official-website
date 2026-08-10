# Claude Code Configuration

## 默认加载 Skills

在每次对话开始时，自动加载以下 skills：

1. **emil-design-eng** — Emil Kowalski 的 UI 打磨哲学：组件设计、动画决策、细节打磨
2. **frontend-layered-architecture-code-generator** — 前端分层架构代码生成器

## 真实后端

仓库仅含前端，**不自带任何后端代码/测试后端**（原 `backend/` FastAPI 测试后端已移除）。运行后端服务由独立部署的真实后端承担。

- 启动前端：`pnpm run dev`（Astro，等价 `dev:frontend`）
- 运行认证前端测试：`pnpm run test:auth`（vitest run src/features/auth）
- **后端地址由 `API_URL` 环境变量驱动**（见 `.env.example`）：SSR 直连、`src/middleware.ts` 中间件转发 `/api/*` 与 `/graphql`、GraphQL 客户端目标地址均读取它。部署前务必在 `.env`/环境变量中填入真实后端 URL（如 `https://api.lkm.app`），留空则前端不请求后端。

## 认证系统

认证对接**真实后端 JWT 认证**，无任何 mock demo-accounts。

- **后端认证端点**：`/api/auth/*`，含 login/register/refresh/logout/me
- **Pinia Store**：`src/stores/auth.ts`（`useAuthStore`），用户状态、token 管理的**单一状态源**（`user`/`isLoggedIn`/`session`/`_token`/`_refreshToken`/`onboardingCompleted`），localStorage 持久化（key `lkm-auth-store`）
- **Flow Composable**：登录/注册/找回/引导走 `useLoginFlow`/`useRegisterFlow`/`useRecoveryFlow`/`useOnboardingFlow`；`useAuthProvider`/`useAuth`（`src/features/auth/composables/useAuth.ts`）仍存在作兼容桥，投影 store 状态并管理 2FA 过渡态
- **HTTP 认证适配器**：`src/lib/http/client.ts` 的 `configureHttpAuthSession(getHttpAccessToken())` 统一读写 token，含 JWT request 拦截器 + 401 自动刷新队列（走 `/api/auth/refresh`）
- **GraphQL 认证**：`src/lib/api/graphql/exchanges/auth.ts`（urql `authExchange`）经 `getHttpAccessToken()` 为操作自动附加 `Authorization: Bearer` 头
- **测试模式**：`PUBLIC_AUTH_TEST_MODE`（`src/env.d.ts`、`.env.example`）为前端测试 UI 开关；后端真实能力（OAuth/WebAuthn/2FA/找回/绑定/onboarding 等）由真实后端决定
- **共享 UI 原语**：`src/features/auth/components/shared/`（AuthShell/AuthCard/AuthField/AuthSegmentedControl/AuthMethodButton/AuthStatus/VerificationCodeField）
- **类型**：`src/types/auth.d.ts` 定义真实 `User`（已移除 `DemoUser`）

---

See [AGENTS.md](./AGENTS.md) for all project documentation and AI agent instructions.
