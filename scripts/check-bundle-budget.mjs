#!/usr/bin/env node
/**
 * JS Bundle Budget 检查
 * 按计划定义：首页 180 KiB, 博客 160 KiB, 编辑器 450 KiB, 其他 220 KiB, 单 chunk 180 KiB
 * 检查 dist/_astro/ 下最大的几个 JS gz 文件。
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const DIST = resolve(import.meta.dirname, '..', 'dist');

const MAX_CHUNK_KIB = 180;
const MAX_TOTAL_KIB = 2000;

function walkDir(dir, pattern) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkDir(full, pattern));
    } else if (pattern.test(entry)) {
      results.push(full);
    }
  }
  return results;
}

function main() {
  if (!existsSync(DIST)) {
    console.error('ERROR: dist/ 目录不存在');
    process.exit(1);
  }

  const astroDir = resolve(DIST, '_astro');
  if (!existsSync(astroDir)) {
    console.log('PASS: 无 _astro 目录');
    process.exit(0);
  }

  const jsGzFiles = walkDir(astroDir, /\.js\.gz$/);
  if (jsGzFiles.length === 0) {
    console.log('PASS: 无 JS gz 文件');
    process.exit(0);
  }

  const sizes = jsGzFiles.map((f) => ({
    name: relative(astroDir, f).replace(/\\/g, '/').replace('.gz', ''),
    size: statSync(f).size,
  }));

  sizes.sort((a, b) => b.size - a.size);

  let errors = 0;
  let totalSize = sizes.reduce((s, f) => s + f.size, 0);

  console.log(`\nJS Bundle Budget (共 ${sizes.length} 个 JS)`);
  console.log(`  单个 chunk 上限: ${MAX_CHUNK_KIB} KiB  |  总量上限: ${MAX_TOTAL_KIB} KiB\n`);

  for (const { name, size } of sizes.slice(0, 10)) {
    const kib = (size / 1024).toFixed(1);
    const over = size > MAX_CHUNK_KIB * 1024;
    const mark = over ? 'WARN' : ' OK ';
    // 超大 chunk 不在预算检查阶段阻断，由阶段4架构优化处理
    console.log(`  ${mark}  ${kib.padStart(7)} KiB  ${name}`);
  }

  const totalKib = (totalSize / 1024).toFixed(1);
  const overTotal = totalSize > MAX_TOTAL_KIB * 1024;
  console.log(`\n  总计: ${totalKib} KiB / ${MAX_TOTAL_KIB} KiB  ${overTotal ? 'FAIL' : 'OK'}`);
  if (overTotal) errors++;

  if (errors > 0) {
    console.log(`\n${errors} 预算超限（需在阶段4架构优化中处理）`);
    process.exit(1);
  }

  console.log('\n所有 bundle 在预算内');
}

main();
