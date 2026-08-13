#!/usr/bin/env node
/**
 * SEO 检查脚本（server 模式）
 * 启动/复用 astro preview，对关键页面与产物做基本 SEO 检查。
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { withPreview } from './lib/start-preview.mjs';

const DIST = resolve(import.meta.dirname, '..', 'dist', 'client');

function contains(pattern, content) {
  if (pattern instanceof RegExp) return pattern.test(content);
  return content.includes(pattern);
}

async function checkPage(base, path, checks) {
  const res = await fetch(base + path);
  if (res.status >= 400) {
    console.error(`  FAIL ${path}: HTTP ${res.status}`);
    return 1;
  }
  const content = await res.text();
  let errors = 0;
  for (const [label, pattern] of Object.entries(checks)) {
    if (!contains(pattern, content)) {
      console.error(`  FAIL ${path}: 缺少 ${label}`);
      errors++;
    }
  }
  return errors;
}

async function main() {
  if (!existsSync(resolve(import.meta.dirname, '..', 'dist'))) {
    console.error('ERROR: dist/ 目录不存在，请先运行 pnpm build');
    process.exit(1);
  }

  let errors = 0;
  await withPreview(async (base) => {
    errors += await checkPage(base, '/', {
      '<title>': /<title>[^<]+<\/title>/,
      canonical: /rel="canonical"/,
      'meta description': /name="description"/,
      '<h1>': /<h1[^>]*>/,
      '<main>': /<main[^>]*>/,
    });

    // robots.txt
    const robotsRes = await fetch(base + '/robots.txt');
    const robotsContent = robotsRes.ok ? await robotsRes.text() : '';
    if (!robotsContent.includes('Sitemap') && !robotsContent.includes('sitemap')) {
      console.error('  FAIL: robots.txt 缺失或缺少 Sitemap 声明');
      errors++;
    }

    // sitemap 静态产物
    const sitemapFile = resolve(DIST, 'sitemap-index.xml');
    if (!existsSync(sitemapFile)) {
      console.error('  FAIL: 缺少 sitemap-index.xml');
      errors++;
    } else {
      const sitemapRaw = readFileSync(sitemapFile, 'utf-8');
      const urls = [...sitemapRaw.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      console.log(`  Sitemap 包含 ${urls.length} 个条目`);
    }
  });

  console.log(`\nSEO 检查完成: ${errors} 错误`);
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
