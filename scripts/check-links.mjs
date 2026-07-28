#!/usr/bin/env node
/**
 * 内部链接检查脚本
 * 验证关键页面的内部链接不失效（忽略 mock 动态路由）。
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve(import.meta.dirname, '..', 'dist');
const BASE = '/LKM-official-website';

const STATIC_EXT = new Set([
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.xml',
  '.gz',
  '.br',
  '.map',
  '.avif',
  '.gif',
  '.mp4',
  '.webm',
]);

const KEY_PAGES = [
  'index.html',
  'blog/index.html',
  '404.html',
  'privacy/index.html',
  'terms/index.html',
  'contact/index.html',
  'communities/index.html',
];

function extractPageHrefs(html) {
  const hrefs = [];
  const re = /href=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) {
    const val = m[1];
    if (!val) continue;
    if (val.startsWith('http://') || val.startsWith('https://')) continue;
    if (val.startsWith('mailto:') || val.startsWith('tel:')) continue;
    if (val.startsWith('#') || val.startsWith('javascript:')) continue;
    if (val.startsWith('/_astro/')) continue; // hashed assets

    const ext = val.split('?')[0].split('#')[0];
    if (STATIC_EXT.has(ext.slice(ext.lastIndexOf('.')))) continue;

    const clean = val.split('?')[0].split('#')[0];
    if (clean === '' || clean === '/' || clean === BASE + '/') continue;
    hrefs.push(clean);
  }
  return hrefs;
}

function hrefToFilePath(href) {
  let clean = href;
  if (clean.startsWith(BASE)) clean = clean.slice(BASE.length);
  if (!clean.startsWith('/')) clean = '/' + clean;

  const relPath = '.' + clean;
  const asIndex = resolve(DIST, relPath, 'index.html');
  const asFile = resolve(DIST, relPath);

  if (existsSync(asIndex)) return asIndex;
  if (existsSync(asFile) && !statSync(asFile).isDirectory()) return asFile;
  return null;
}

function main() {
  if (!existsSync(DIST)) {
    console.error('ERROR: dist/ 目录不存在，请先运行 pnpm build');
    process.exit(1);
  }

  let errors = 0;
  let totalLinks = 0;

  for (const page of KEY_PAGES) {
    const file = resolve(DIST, page);
    if (!existsSync(file)) {
      console.error(`  FAIL: ${page} 不存在`);
      errors++;
      continue;
    }
    const content = readFileSync(file, 'utf-8');
    const hrefs = extractPageHrefs(content);

    for (const href of [...new Set(hrefs)]) {
      totalLinks++;
      const target = hrefToFilePath(href);
      if (!target) {
        console.error(`  FAIL ${page}: "${href}" (目标不存在)`);
        errors++;
      }
    }
  }

  console.log(`\n链接检查完成 (${KEY_PAGES.length} 关键页面): ${totalLinks} 唯一链接, ${errors} 失效`);
  if (errors > 0) {
    process.exit(1);
  }
}

main();
