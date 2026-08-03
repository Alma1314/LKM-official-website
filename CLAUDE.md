# Claude Code Configuration

## 默认加载 Skills

在每次对话开始时，自动加载以下 skills：

1. **emil-design-eng** — Emil Kowalski 的 UI 打磨哲学：组件设计、动画决策、细节打磨
2. **frontend-layered-architecture-code-generator** — 前端分层架构代码生成器

## 后端

启动测试后端：`cd backend && python -m uvicorn main:app --reload --port 8000`
运行后端测试：`cd backend && python -m pytest tests/ -v`（88 个测试）

---

See [AGENTS.md](./AGENTS.md) for all project documentation and AI agent instructions.
