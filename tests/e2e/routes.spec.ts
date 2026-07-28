import { test, expect } from '@playwright/test';

const PUBLIC_ROUTES = [
  { path: '/', label: '首页' },
  { path: '/blog/', label: '博客列表' },
  { path: '/blog/about/', label: '博客关于' },
  { path: '/privacy/', label: '隐私政策' },
  { path: '/terms/', label: '服务条款' },
];

const DEMO_ROUTES = [
  { path: '/login/', label: '登录' },
  { path: '/register/', label: '注册' },
  { path: '/contact/', label: '联系' },
  { path: '/communities/', label: '社群' },
];

test.describe('关键路由烟雾测试', () => {
  for (const { path, label } of PUBLIC_ROUTES) {
    test(`${label} (${path}) 返回 200 且有主内容`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);

      await expect(page.locator('main')).not.toBeEmpty();
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }

  for (const { path, label } of DEMO_ROUTES) {
    test(`${label} (${path}) 返回 200`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
    });
  }

  test('不存在的路径返回 404', async ({ page }) => {
    const res = await page.goto('/this-route-must-not-exist');
    expect(res?.status()).toBe(404);
  });

  test('首页无未捕获错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    expect(errors).toEqual([]);
  });

  test('博客文章页无未捕获错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/blog/');
    expect(errors).toEqual([]);
  });
});
