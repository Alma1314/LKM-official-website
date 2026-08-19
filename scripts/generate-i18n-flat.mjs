/**
 * i18n 词典平铺生成器
 *
 * 读取 src/lib/i18n/languages/{en,zh_CN}.ts（嵌套对象），用与运行时一致的
 * flatten 平铺成扁平 Record，写到 src/lib/i18n/generated/*.flat.ts。
 *
 * 目的：
 *  - 构建期完成 flatten，削掉每次加载/水合在客户端做的 flatten 递归 CPU；
 *  - 与 runtime flatten 共用同一实现（flatten.ts），保证键序/内容天然一致；
 *  - 产出的 *.flat.ts 由 astro.config manualChunks 切成 zh/en 独立 chunk，
 *    供 i18n 按当前 locale 按需加载（默认 zh-CN 同步、en 异步）。
 *
 * 用 esbuild（Astro/Vite 自带依赖）把带 extensionless import 的 dict .ts
 * 打包成 ESM，规避 Node 原生 type-stripping 对 extensionless 相对导入的限制。
 *
 * 用法：node scripts/generate-i18n-flat.mjs（已接入 prebuild，每次构建自动运行）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "tinyglobby";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const LANGS_DIR = path.join(ROOT, "src", "lib", "i18n", "languages");
const OUT_DIR = path.join(ROOT, "src", "lib", "i18n", "generated");

// 复用与运行时一致的 flatten / forulate（flatten.ts 纯 TS，无 extensionless import，可直 import）
const { flatten, formatFlatTs } = await import(
  "file://" +
    path.join(ROOT, "src", "lib", "i18n", "flatten.ts").replaceAll("\\", "/")
);

// 定位 esbuild JS API（pnpm 不提升，需在 .pnpm store 中查找 Astro/Vite 的 esbuild）
// pnpm 不提升 esbuild 到顶层，需在 .pnpm store 中查找 Astro/Vite 的 esbuild。
// 以 node_modules/.pnpm 为 cwd（ROOT 出发会被 .gitignore 的 node_modules/ 挡掉）。
const PNPM_DIR = path.join(ROOT, "node_modules", ".pnpm");
const esbuildCandidates = globSync("**/node_modules/esbuild/lib/main.js", {
  cwd: PNPM_DIR,
  onlyFiles: true,
  absolute: true,
  ignore: ["node_modules/.cache/**"],
}).sort();
if (esbuildCandidates.length === 0) {
  throw new Error(
    "[i18n-flat] 在 node_modules 中找不到 esbuild（Astro 应已带依赖）。",
  );
}
const esbuildPath = esbuildCandidates[esbuildCandidates.length - 1];
const { build } = await import("file://" + esbuildPath.replaceAll("\\", "/"));

const LOCALES = [
  { source: "en.ts", varTs: "en", outVar: "enFlat", outFile: "en.flat.ts" },
  {
    source: "zh_CN.ts",
    varTs: "zh_CN",
    outVar: "zhFlat",
    outFile: "zh_CN.flat.ts",
  },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const loc of LOCALES) {
  const entry = path.join(LANGS_DIR, loc.source);
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "neutral",
    logLevel: "silent",
    write: false,
  });
  const code = result.outputFiles[0].text;
  const mod = await import(
    "data:text/javascript;base64," + Buffer.from(code).toString("base64")
  );
  const dict = mod[loc.varTs];
  if (!dict || typeof dict !== "object") {
    throw new Error(`[i18n-flat] ${loc.source} 未导出 \`${loc.varTs}\``);
  }
  const flat = flatten(dict);
  const tsCode = formatFlatTs(loc.outVar, flat);
  fs.writeFileSync(path.join(OUT_DIR, loc.outFile), tsCode, "utf-8");
  console.log(
    `[i18n-flat] ${loc.source} -> ${loc.outFile} (${Object.keys(flat).length} keys)`,
  );
}
