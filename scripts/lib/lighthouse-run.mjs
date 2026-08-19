/**
 * Lighthouse 测量核心（共享给 measure-cwv.mjs / lighthouse-budget.mjs）。
 * 用已装的 lighthouse + chrome-launcher 以 headless Chrome 跑一次审计，
 * 抽取 Core Web Vitals 相关实验室指标，返回结构化的测量结果。
 *
 * 重要说明（指标语义）：
 *  - LCP / CLS 由 lab 直接给出（largest-contentful-paint / cumulative-layout-shift）。
 *  - **INP（Interaction to Next Paint）是 field metric（真实用户），实验室无法复现。**
 *    实验室代理交互响应性的是 total-blocking-time（TBT）+ interactive（TTI）。
 *    因此预算与基线的"INP 门槛"落地为 TBT（见 lighthouse-budget.mjs 的注释与阈值）。
 */
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

// 数值取整到指定精度（毫秒）
function ms(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.round(value);
}

// CLS 是相对值（无单位）
function num(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Number(value.toFixed(3));
}

/**
 * 对单个 URL 运行 Lighthouse 实验室审计，抽取 CWV 指标。
 * @param {string} url 被测完整 URL（如 http://127.0.0.1:4321/blog）
 * @param {object} [opts]
 * @param {number|undefined} [opts.port] chrome-launcher 端口（未传入则尝试复用/复用由调用方保证）
 * @param {number} [opts.runs] 测量次数（取中位数更稳；默认 1）
 * @returns {Promise<{url: string, runs: object[]}>} runs 为每次测量的指标，调用方自行聚合
 */
export async function measureLighthouse(url, { runs = 1 } = {}) {
  // 每次 run 用独立 Chrome，干净环境避免缓存/崩溃残留
  const results = [];
  for (let i = 0; i < runs; i++) {
    const chrome = await launch({
      chromeFlags: [
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
    });
    try {
      const flags = {
        port: chrome.port,
        output: "json",
        onlyCategories: ["performance"],
        logLevel: "silent",
      };
      const { lhr } = await lighthouse(url, flags);
      const a = lhr.audits;
      results.push({
        lcp: ms(a["largest-contentful-paint"]?.numericValue),
        cls: num(a["cumulative-layout-shift"]?.numericValue),
        tbt: ms(a["total-blocking-time"]?.numericValue),
        tti: ms(a["interactive"]?.numericValue),
        si: ms(a["speed-index"]?.numericValue),
        perfScore:
          typeof lhr.categories?.performance?.score === "number"
            ? Math.round(lhr.categories.performance.score * 100)
            : null,
        // 页面实际加载的 JS 传输字节（gz，Lighthouse network-requests 统计）
        totalJsBytes: a["network-requests"]
          ? (a["network-requests"].details?.items
              ?.filter((r) => r.resourceType === "Script")
              .reduce((s, r) => s + (r.transferSize || 0), 0) ?? null)
          : null,
      });
    } finally {
      // Windows 上 chrome-launcher kill 清理临时 profile 目录时偶发 EPERM
      // （Chrome 进程退出不完全，目录句柄被锁）。测量结果已取到，此清理错误
      // 不应让整个测量抛错——吞掉即可。
      // 注：chrome-launcher 的 kill() 虽标注 void，但 kill 内部的 destroyTmp()
      // 用同步 rmSync 清临时目录，Windows 上会**同步 throw EPERM**。
      // 须用同步 try/catch 捕获（Promise.resolve().catch() 只能接异步 rejection，
      // 无法接同步 throw）。类型为 void，`await` 无 effect，故直接调用。
      try {
        chrome.kill();
      } catch {
        // 忽略 kill 清理阶段的临时目录删除失败
      }
    }
  }
  return { url, runs: results };
}

/** 取中位数（对 runs 聚合），返回单一指标对象。 */
export function medianMetrics(runResults) {
  const pick = (key) => {
    const vals = runResults.map((r) => r[key]).filter((v) => v != null);
    if (vals.length === 0) return null;
    vals.sort((a, b) => a - b);
    const mid = Math.floor(vals.length / 2);
    return vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
  };
  return {
    lcp: pick("lcp"),
    cls: pick("cls"),
    tbt: pick("tbt"),
    tti: pick("tti"),
    si: pick("si"),
    perfScore: pick("perfScore"),
    totalJsBytes: pick("totalJsBytes"),
  };
}
