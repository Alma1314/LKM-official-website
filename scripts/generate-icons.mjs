/**
 * 图标离线注册 + astro include 生成器
 *
 * 1. 扫描 .vue / .ts / .yaml / .json 中的图标字面量（prefix:name），
 *    从 node_modules 中 @iconify-json 各集合包的 icons.json 提取 SVG 数据，
 *    生成 src/lib/icons/register.ts：在 vue-entry 中 addCollection 预注册，
 *    保证 @iconify/vue 组件完全离线渲染，不触发运行时 Iconify API 请求。
 * 2. 扫描 .astro / .ts / .yaml / .json 中 tabler / material-symbols 图标，
 *    生成 src/lib/icons/astro-include.ts 供 astro-icon include 精确引用，
 *    避免 `'*'` 全量打包（6214 个图标）。
 *
 * 用法：node scripts/generate-icons.mjs（已接入 prebuild，每次构建自动运行）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'tinyglobby';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC_DIR = path.join(ROOT, 'src');
const ICONS_DIR = path.join(ROOT, 'src', 'lib', 'icons');
const REGISTER_FILE = path.join(ICONS_DIR, 'register.ts');
const INCLUDE_FILE = path.join(ICONS_DIR, 'astro-include.ts');

// @iconify/vue 图标前缀 → 本地 JSON 包名
const PACKAGE_BY_PREFIX = {
  tabler: '@iconify-json/tabler',
  'material-symbols': '@iconify-json/material-symbols',
  'fa6-brands': '@iconify-json/fa6-brands',
  'fa6-regular': '@iconify-json/fa6-regular',
  'fa6-solid': '@iconify-json/fa6-solid',
  'flat-color-icons': '@iconify-json/flat-color-icons',
};

const PREFIX_RE = new RegExp(`\\b(${Object.keys(PACKAGE_BY_PREFIX).join('|')}):[a-z0-9-]+`, 'g');

/** 收集一组文件中的图标引用：prefix -> Set<name> */
async function collectIcons(patterns) {
  const files = await glob(patterns, { cwd: SRC_DIR });
  const collected = new Map();
  for (const file of files) {
    const content = fs.readFileSync(path.join(SRC_DIR, file), 'utf-8');
    for (const match of content.match(PREFIX_RE) ?? []) {
      const idx = match.indexOf(':');
      const prefix = match.slice(0, idx);
      const name = match.slice(idx + 1);
      if (!collected.has(prefix)) collected.set(prefix, new Set());
      collected.get(prefix).add(name);
    }
  }
  return collected;
}

/** 从 @iconify-json 包提取图标数据，生成 addCollection 代码行 */
function buildCollections(map) {
  const collections = [];
  let missing = 0;
  for (const [prefix, names] of map) {
    const pkg = PACKAGE_BY_PREFIX[prefix];
    const jsonPath = path.join(ROOT, 'node_modules', pkg, 'icons.json');
    if (!fs.existsSync(jsonPath)) {
      console.warn(`[icons] 找不到 ${jsonPath}，跳过 ${prefix}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const icons = {};
    for (const name of [...names].sort()) {
      const icon = data.icons[name];
      if (!icon) {
        console.warn(`[icons] ${prefix}:${name} 在 ${pkg} 中不存在，已跳过`);
        missing++;
        continue;
      }
      icons[name] = icon;
    }
    collections.push({ prefix, icons, width: data.width, height: data.height });
  }
  return { collections, missing };
}

async function main() {
  fs.mkdirSync(ICONS_DIR, { recursive: true });

  // vue 运行时注册：.vue 组件字面量 + 可能被 vue 动态引用的 data（.ts/.yaml/.json）
  const vueIcons = await collectIcons(['**/*.vue']);
  const dataIcons = await collectIcons(['**/*.ts', '**/*.yaml', '**/*.yml', '**/*.json']);
  const registerMap = new Map();
  for (const map of [vueIcons, dataIcons]) {
    for (const [prefix, names] of map) {
      if (!registerMap.has(prefix)) registerMap.set(prefix, new Set());
      for (const n of names) registerMap.get(prefix).add(n);
    }
  }

  const { collections, missing } = buildCollections(registerMap);
  const registerLines = [];
  registerLines.push('/* 本文件由 scripts/generate-icons.mjs 自动生成，请勿手动修改 */');
  registerLines.push("import { addCollection } from '@iconify/vue';");
  for (const c of collections) registerLines.push(`addCollection(${JSON.stringify(c)});`);
  registerLines.push('');
  fs.writeFileSync(REGISTER_FILE, registerLines.join('\n'), 'utf-8');
  const regTotal = collections.reduce((acc, c) => acc + Object.keys(c.icons).length, 0);

  // astro include：.astro 组件 + data（astro-icon 渲染的 tabler / material-symbols）
  const astroIcons = await collectIcons(['**/*.astro']);
  const astroMap = new Map();
  for (const map of [astroIcons, dataIcons]) {
    for (const [prefix, names] of map) {
      if (prefix !== 'tabler' && prefix !== 'material-symbols') continue;
      if (!astroMap.has(prefix)) astroMap.set(prefix, new Set());
      for (const n of names) astroMap.get(prefix).add(n);
    }
  }
  const includeLines = [];
  includeLines.push('/* 本文件由 scripts/generate-icons.mjs 自动生成，请勿手动修改 */');
  includeLines.push('export const astroIconInclude: Record<string, string[]> = {');
  for (const [prefix, names] of astroMap) {
    includeLines.push(`  '${prefix}': [${[...names].sort().map((n) => `'${n}'`).join(', ')}],`);
  }
  includeLines.push('};');
  includeLines.push('');
  fs.writeFileSync(INCLUDE_FILE, includeLines.join('\n'), 'utf-8');
  const incTotal = [...astroMap.values()].reduce((acc, s) => acc + s.size, 0);

  console.log(
    `[icons] register.ts: ${collections.length} 集合 / ${regTotal} 图标（跳过 ${missing} 缺失）` +
      `；astro-include.ts: ${incTotal} 图标`
  );
}

main().catch((err) => {
  console.error('[icons] 生成失败:', err);
  process.exit(1);
});
