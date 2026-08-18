#!/usr/bin/env node
/**
 * Lighthouse 预算门槛脚本（计划模块 0 · CI）。
 * 对关键路径页跑 Lighthouse 实验室审计，对照 CWV 预算阈值判定是否达标。
 * 任一页任一指标超阈则退出非 0，供 CI 拦截回归。
 *
 * 阈值（可被环境变量覆盖，便于先立基线再收紧）：
 *   LCP < 2500ms        （默认，对应 CWV 良好阈值）
 *   CLS < 0.1           （默认，对应 CWV 良好阈值）
 *   TBT < 200ms         （作为 INP 的实验室代理：INP 为 field metric，实验室用
 *                         total-blocking-time 近似交互响应性）
 *   Perf 得分 >= 60     （Lighthouse performance score 及格线）
 *
 * 环境变量：LIGHTHOUSE_LCP_MS / LIGHTHOUSE_CLS / LIGHTHOUSE_TBT_MS / LIGHTHOUSE_PERF
 * 用法：
 *   node scripts/lighthouse-budget.mjs            # 全量关键路径，单次测量
 *   node scripts/lighthouse-budget.mjs --runs=2   # 多测取中位数
 */
import { parseArgs } from "node:util";
import { withPreview } from "./lib/start-preview.mjs";
import { measureLighthouse, medianMetrics } from "./lib/lighthouse-run.mjs";

const PATHS = ["/", "/blog", "/editor", "/community/treehole", "/community"];

function envNum(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

// 预算阈值（可从环境变量覆盖）
const BUDGET = {
  lcpMs: envNum("LIGHTHOUSE_LCP_MS", 2500),
  cls: envNum("LIGHTHOUSE_CLS", 0.1),
  tbtMs: envNum("LIGHTHOUSE_TBT_MS", 200),
  perf: envNum("LIGHTHOUSE_PERF", 60),
};

function parseFlags() {
  const { values } = parseArgs({
    options: { runs: { type: "string", default: "1" } },
  });
  return { runs: Math.max(1, parseInt(values.runs ?? "1", 10) || 1) };
}

async function main() {
  const { runs } = parseFlags();
  process.stdout.write(
    `Lighthouse 预算门槛（LCP<${BUDGET.lcpMs}ms, CLS<${BUDGET.cls}, ` +
      `TBT<${BUDGET.tbtMs}ms[INP代理], Perf>=${BUDGET.perf}, runs=${runs}）\n`,
  );

  const results = await withPreview(async (base) => {
    const out = [];
    for (const p of PATHS) {
      const url = `${base}${p}`;
      const { runs: raw } = await measureLighthouse(url, { runs });
      out.push({ path: p, m: medianMetrics(raw) });
    }
    return out;
  });

  let errors = 0;
  for (const { path, m } of results) {
    const check = (cond) => (cond ? "PASS" : "FAIL");

    // 逐项判定并打印
    const lcpOk = m.lcp != null && m.lcp < BUDGET.lcpMs;
    const clsOk = m.cls != null && m.cls < BUDGET.cls;
    const tbtOk = m.tbt != null && m.tbt < BUDGET.tbtMs;
    const perfOk = m.perfScore != null && m.perfScore >= BUDGET.perf;
    if (!lcpOk) errors++;
    if (!clsOk) errors++;
    if (!tbtOk) errors++;
    if (!perfOk) errors++;

    process.stdout.write(
      `  [${path}] LCP=${m.lcp ?? "-"}ms ${check(lcpOk)} | ` +
        `CLS=${m.cls ?? "-"} ${check(clsOk)} | ` +
        `TBT=${m.tbt ?? "-"}ms ${check(tbtOk)} | ` +
        `Perf=${m.perfScore ?? "-"} ${check(perfOk)}\n`,
    );
  }

  if (errors > 0) {
    process.stdout.write(`\n${errors} 项预算超限（FAIL）\n`);
    process.exit(1);
  }
  process.stdout.write(`\n所有关键路径页在 Lighthouse 预算内（PASS）\n`);
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
