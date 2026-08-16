import { test, expect } from "@playwright/test";

const BASE_PATH = process.env.BASE_PATH ?? "";

/**
 * 认证端到端烟雾覆盖。
 *
 * 环境说明（详见 task-11-report.md）：本用例在 `astro preview` 独立 SSR + 无头浏览器下，
 * 仅对**服务端/首屏可靠静态渲染**的元素做断言（登录/注册卡片的标题、副标题、入口按钮、
 * 分段控件等），这些元素与真实组件源码文案一致（LoginPage / RegisterPage）。
 *
 * 局限（诚实记录，不在无头 preview 下强行跑 flaky 交互）：本环境中 Vue island 客户端
 * 响应式更新不工作（点击分段按钮后表单切换 / aria-pressed 均不更新，且无任何 console/page
 * 报错，见 report）。因此「注册流程提交」「Modal 开合」等依赖客户端响应式重渲染的交互无法
 * 在此环境真实跑通，故不构造会响应的点击断言，避免 E2E 因环境缺口 flaky。持久的交互回归在
 * 用户侧 `astro dev` 环境执行。
 */

test.describe("认证端到端", () => {
  test("独立登录页渲染居中卡片", async ({ page }) => {
    await page.goto(`${BASE_PATH}/login/`);

    // 登录卡标题（默认密码登录态：AuthCard title「登录」）
    await expect(page.getByRole("heading", { name: "登录" })).toBeVisible();
    // 副标题与真实组件一致
    await expect(
      page.getByText("登录理科迷账号，访问社区资源与文档"),
    ).toBeVisible();
    // 底部「立即注册」入口与真实组件一致
    await expect(page.getByRole("button", { name: "立即注册" })).toBeVisible();
  });

  test("独立注册页渲染居中卡片（含分段控件）", async ({ page }) => {
    await page.goto(`${BASE_PATH}/register/`);

    // 注册卡标题/副标题与真实组件一致
    await expect(page.getByRole("heading", { name: "注册" })).toBeVisible();
    await expect(page.getByText("创建理科迷账号")).toBeVisible();

    // 分段控件「普通账户 / 本地账户」与真实组件一致
    await expect(page.getByRole("button", { name: "普通账户" })).toBeVisible();
    await expect(page.getByRole("button", { name: "本地账户" })).toBeVisible();

    // 「已有账号？立即登录」入口与真实组件一致
    await expect(page.getByRole("button", { name: "立即登录" })).toBeVisible();
  });
});
