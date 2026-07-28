#!/usr/bin/env node
/**
 * SEO 产物检查脚本
 * 验证首页和关键页面的基本 SEO 元素。
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve(import.meta.dirname, '..', 'dist');

function contains(pattern, content) {
  if (pattern instanceof RegExp) return pattern.test(content);
  return content.includes(pattern);
}

function checkHtml(path, checks) {
  const file = resolve(DIST, path);
  if (!existsSync(file)) {
    console.error(`  FAIL: ${path} 文件不存在`);
    return 1;
  }
  const content = readFileSync(file, 'utf-8');
  let errors = 0;

  for (const [label, pattern] of Object.entries(checks)) {
    if (!contains(pattern, content)) {
      console.error(`  FAIL ${path}: 缺少 ${label}`);
      errors++;
    }
  }
  return errors;
}

function main() {
  if (!existsSync(DIST)) {
    console.error('ERROR: dist/ 目录不存在，请先运行 pnpm build');
    process.exit(1);
  }

  let errors = 0;

  errors += checkHtml('index.html', {
    '<title>': /<title>[^<]+<\/title>/,
    canonical: /rel="canonical"/,
    'meta description': /name="description"/,
    'meta robots': /name="robots"/,
    '<h1>': /<h1[^>]*>/,
    '<main>': /<main[^>]*>/,
  });

  errors += checkHtml('404.html', {
    '<title>': /<title>[^<]+<\/title>/,
  });

  // robots.txt
  const robotsFile = resolve(DIST, 'robots.txt');
  if (existsSync(robotsFile)) {
    const robotsContent = readFileSync(robotsFile, 'utf-8');
    if (!robotsContent.includes('Sitemap') && !robotsContent.includes('sitemap')) {
      console.error('  FAIL: robots.txt 缺少 Sitemap 声明');
      errors++;
    }
  } else {
    console.error('  FAIL: 缺少 robots.txt');
    errors++;
  }

  // sitemap
  const sitemapFile = resolve(DIST, 'sitemap-index.xml');
  if (!existsSync(sitemapFile)) {
    console.error('  FAIL: 缺少 sitemap-index.xml');
    errors++;
  } else {
    const sitemapRaw = readFileSync(sitemapFile, 'utf-8');
    const urls = [...sitemapRaw.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    console.log(`  Sitemap 包含 ${urls.length} 个条目`);
  }

  // demo 页面应有 noindex
  const demoPages = [
    'user/qiyue-hua/index.html',
    'user/qiyue-moran/index.html',
    'user/qiyue-o/index.html',
    'user/qiyue-youzhi/index.html',
    'user/qiyue-yuli/index.html',
  ];
  for (const dp of demoPages) {
    const file = resolve(DIST, dp);
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      if (!content.includes('noindex') && !content.includes('noindex')) {
        console.error(`  WARN: mock 用户页 ${dp} 缺少 noindex (待阶段6修复)`);
      }
    }
  }

  console.log(`\nSEO 检查完成: ${errors} 错误`);
  if (errors > 0) {
    process.exit(1);
  }
}

main();
