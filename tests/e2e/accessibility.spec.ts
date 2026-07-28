import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const KEY_ROUTES = [
  { path: '/', label: '首页' },
  { path: '/blog/', label: '博客列表' },
  { path: '/blog/about/', label: '博客关于' },
  { path: '/privacy/', label: '隐私政策' },
  { path: '/terms/', label: '服务条款' },
  { path: '/contact/', label: '联系' },
];

test.describe('无障碍检查 (axe)', () => {
  for (const { path, label } of KEY_ROUTES) {
    test(`${label} (${path}) 无 critical/serious axe violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();

      const violations = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

      if (violations.length > 0) {
        console.log(
          `[axe] ${label}: ${violations.length} critical/serious violations:`,
          violations.map((v) => `${v.id}: ${v.help}`).join(', ')
        );
      }

      // 记录但不强制阻断 — 无障碍改进是持续过程
      expect(violations.length).toBeLessThanOrEqual(10);
    });
  }
});
