/**
 * astro-icon include 生成器
 *
 * 扫描 .astro / .ts / .yaml / .json 中 tabler / material-symbols 图标，
 * 生成 src/lib/icons/astro-include.ts 供 astro-icon include 精确引用，
 * 避免 `'*'` 全量打包（6214 个图标）。
 *
 * 用法：node scripts/generate-icons.mjs（已接入 prebuild，每次构建自动运行）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "tinyglobby";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC_DIR = path.join(ROOT, "src");
const ICONS_DIR = path.join(ROOT, "src", "lib", "icons");
const INCLUDE_FILE = path.join(ICONS_DIR, "astro-include.ts");

// 扫描用图标前缀（对应本地 @iconify-json 包；astro-icon 运行时仅读这些本地资源）
const PREFIX_SET = new Set([
  "tabler",
  "material-symbols",
  "fa6-brands",
  "fa6-regular",
  "fa6-solid",
  "flat-color-icons",
]);

const PREFIX_RE = new RegExp(
  `\\b(${[...PREFIX_SET].join("|")}):[a-z0-9-]+`,
  "g",
);

/** 收集一组文件中的图标引用：prefix -> Set<name> */
async function collectIcons(patterns) {
  const files = await glob(patterns, { cwd: SRC_DIR });
  const collected = new Map();
  for (const file of files) {
    const content = fs.readFileSync(path.join(SRC_DIR, file), "utf-8");
    for (const match of content.match(PREFIX_RE) ?? []) {
      const idx = match.indexOf(":");
      const prefix = match.slice(0, idx);
      const name = match.slice(idx + 1);
      if (!collected.has(prefix)) collected.set(prefix, new Set());
      collected.get(prefix).add(name);
    }
  }
  return collected;
}

async function main() {
  fs.mkdirSync(ICONS_DIR, { recursive: true });

  // astro include：.astro 组件 + data（astro-icon 渲染的 tabler / material-symbols）
  const astroIcons = await collectIcons(["**/*.astro"]);
  const dataIcons = await collectIcons([
    "**/*.ts",
    "**/*.yaml",
    "**/*.yml",
    "**/*.json",
  ]);
  const astroMap = new Map();
  for (const map of [astroIcons, dataIcons]) {
    for (const [prefix, names] of map) {
      if (prefix !== "tabler" && prefix !== "material-symbols") continue;
      if (!astroMap.has(prefix)) astroMap.set(prefix, new Set());
      for (const n of names) astroMap.get(prefix).add(n);
    }
  }

  const includeLines = [];
  includeLines.push(
    "/* 本文件由 scripts/generate-icons.mjs 自动生成，请勿手动修改 */",
  );
  includeLines.push(
    "export const astroIconInclude: Record<string, string[]> = {",
  );
  for (const [prefix, names] of astroMap) {
    includeLines.push(
      `  '${prefix}': [${[...names]
        .sort()
        .map((n) => `'${n}'`)
        .join(", ")}],`,
    );
  }
  includeLines.push("};");
  includeLines.push("");
  fs.writeFileSync(INCLUDE_FILE, includeLines.join("\n"), "utf-8");
  const incTotal = [...astroMap.values()].reduce((acc, s) => acc + s.size, 0);

  console.log(`[icons] astro-include.ts: ${incTotal} 图标`);
}

main().catch((err) => {
  console.error("[icons] 生成失败:", err);
  process.exit(1);
});
