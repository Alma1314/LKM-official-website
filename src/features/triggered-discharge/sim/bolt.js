/* ----------------------------------------------------------------
   闪电生命周期：播种一次新的放电、处理连接点、在两棵树之间
   追踪被击中的路径、采样声源，并为这次闪电构建回击调度表。
   ---------------------------------------------------------------- */

import { $ } from "../core/dom.js";
import { CELL_M, GH, GW, idxToWorld, LIST_CAP, N, SND_C } from "../config.js";
import { bgClear, device, listBuf, pathPosBuf, plClear, selBuf, upSelBuf } from "../core/gpu.js";
import { bolt, rt, ui } from "../core/state.js";
import { thunder } from "../audio/thunder.js";
import { writeSimU } from "../core/uniforms.js";

export function setPhase(name, label) {
  bolt.phase = name;
  bolt.phaseTR = 0;
  bolt.phaseTV = 0;
  bolt.label = label;
  $("rPhase").textContent = label;
}
export function newBolt(sx) {
  bolt.seedX = Math.max(
    14,
    Math.min(
      GW - 14,
      sx ?? Math.floor(GW * (0.25 + Math.random() * 0.5)),
    ),
  );
  bolt.seed = (Math.random() * 0xffffffff) >>> 0;
  bolt.boltSeed = Math.random();
  bolt.cells = 5;
  bolt.dim = null;
  bolt.chanLen = 0;
  bolt.tReal = 0;
  bolt.stepAcc = 0;
  bolt.growSteps = 0;
  bolt.stepGain = 6;
  bolt.tipV = 0;
  bolt.deepT = 0;
  bolt.forkIdx = 0;
  bolt.regrow = false;
  bolt.nextStroke = 0;
  bolt.schedule = [];
  bolt.strokeIdx = 0;
  bolt.ccBumps = [];
  bolt.ccDur = 0.13;
  bolt.deepY = 0;
  bolt.upOn = false;
  bolt.gidx = 0xffffffff;
  bolt.windX = 0;
  bolt.windZ = 0;
  bolt.windT = 0;
  bolt.windVX = 0;
  bolt.windVZ = 0;
  bolt.spriteV0 = -1;
  bolt.recoilN = 0;
  bolt.recoilM = -1;
  bolt.recoilT0 = 0;
  bolt.thunderPerf = -1;
  bolt.strikeW = idxToWorld(4 * GW + bolt.seedX);
  rt.needParents = false;
  device.queue.writeBuffer(
    selBuf,
    0,
    new Uint32Array([0, 0, 0, 0, 0, 0xffffffff, 0, 0]),
  );
  device.queue.writeBuffer(
    upSelBuf,
    0,
    new Uint32Array([0, 0, 0x40000000, 0, 0, 0, 0, 0]),
  );
  device.queue.writeBuffer(
    listBuf,
    0,
    new Uint32Array([0, LIST_CAP, 0, 0]),
  );
  writeSimU();
  const enc = device.createCommandEncoder();
  const p = enc.beginComputePass();
  p.setPipeline(plClear);
  p.setBindGroup(0, bgClear);
  p.dispatchWorkgroups(
    Math.ceil(GW / 8),
    Math.ceil(GH / 8),
    1,
  );
  p.end();
  device.queue.submit([enc.finish()]);
  setPhase("grow", "梯级先导");
  $("rStroke").textContent = "—";
  $("rDim").textContent = "—";
  $("rLen").textContent = "—";
  $("rThun").textContent = "—";
}
export function onStrike(sidx, gidx) {
  if (bolt.phase !== "grow" && bolt.phase !== "regrow") return;
  bolt.regrow = false;
  bolt.sidx = sidx;
  bolt.gidx = gidx === undefined ? 0xffffffff : gidx;
  bolt.strikeW = idxToWorld(sidx);
  rt.needParents = true;
  rt.needFractal = true;
  setPhase("attach", "连接中");
}
export function tracePath(parents) {
  /* 二维：在两棵树间遍历获胜路径（地面 → 云层） */
  const walk = (start) => {
    const c = [];
    let i = start,
      guard = 0;
    while (i !== 0xffffffff && guard++ < N) {
      c.push(i);
      i = parents[i];
    }
    return c;
  };
  const cloudChain = walk(bolt.sidx);
  const groundChain =
    bolt.gidx !== 0xffffffff ? walk(bolt.gidx).reverse() : [];
  const path = groundChain.concat(cloudChain);

  const cum = new Float64Array(path.length);
  for (let k = 1; k < path.length; k++) {
    const a = path[k - 1],
      b = path[k];
    const dx = (a % GW) - (b % GW);
    const dy = (((a / GW) | 0) % GH) - (((b / GW) | 0) % GH);
    cum[k] = cum[k - 1] + CELL_M * Math.sqrt(dx * dx + dy * dy);
  }
  bolt.chanLen = Math.max(cum[path.length - 1], CELL_M);
  bolt.pathCells = path;
  bolt.pathCum = cum;
  /* 声源：约 14 个通道段，按弧长均匀分布 */
  bolt.thunderSegs = [];
  const K = 14;
  for (let q = 0; q < K; q++) {
    const target = ((q + 0.5) / K) * bolt.chanLen;
    let k = 0;
    while (k < path.length - 1 && cum[k] < target) k++;
    bolt.thunderSegs.push({
      w: idxToWorld(path[k]),
      frac: target / bolt.chanLen,
    });
  }
  const pp = new Float32Array(N).fill(-1);
  for (let k = 0; k < path.length; k++)
    pp[path[k]] = cum[k] / bolt.chanLen;

  /* 反冲先导：挑选已衰亡的分支先端 */
  const isParent = new Uint8Array(N);
  for (let k = 0; k < N; k++) {
    const p = parents[k];
    if (p !== 0xffffffff) isParent[p] = 1;
  }
  let m = 0;
  for (let tries = 0; tries < 4000 && m < 5; tries++) {
    const c = (Math.random() * N) | 0;
    if (parents[c] === 0xffffffff || isParent[c] || pp[c] >= 0) continue;
    const chain = [];
    let j = c,
      g2 = 0;
    while (j !== 0xffffffff && pp[j] < 0 && g2++ < 70) {
      chain.push(j);
      j = parents[j];
    }
    if (chain.length < 7) continue;
    for (let k = 0; k < chain.length; k++)
      pp[chain[k]] = -(2 + m + 0.92 * (1 - k / chain.length));
    m++;
  }
  bolt.recoilN = m;
  device.queue.writeBuffer(pathPosBuf, 0, pp);

  /* 回击调度表 */
  if (ui.positive) {
    bolt.schedule = [
      {
        i0a: ui.I0 * 2.2 * (0.9 + Math.random() * 0.2),
        t1a: 8,
        t2a: 350,
        i0b: 0,
        t1b: 1,
        t2b: 1,
        first: true,
        gap: 0.05,
      },
    ];
    bolt.ccDur = 0.24 + Math.random() * 0.12;
    bolt.ccBumps = Array.from(
      { length: 3 + ((Math.random() * 2) | 0) },
      () => ({
        t: 0.02 + Math.random() * bolt.ccDur * 0.7,
        amp: 2 + Math.random() * 4,
      }),
    );
  } else {
    const n = Math.random() < 0.18 ? 1 : 3 + ((Math.random() * 3) | 0);
    bolt.schedule = [];
    for (let s2 = 0; s2 < n; s2++) {
      if (s2 === 0) {
        bolt.schedule.push({
          i0a: ui.I0 * (ui.storm ? 2.4 : 1) * (0.9 + Math.random() * 0.2),
          t1a: 1.8,
          t2a: 95,
          i0b: 0,
          t1b: 1,
          t2b: 1,
          first: true,
          gap: 0.03 + Math.random() * 0.035,
        });
      } else {
        const base =
          ui.I0 *
          (ui.storm ? 2.4 : 1) *
          0.42 *
          Math.pow(0.85, s2) *
          (0.8 + Math.random() * 0.4);
        bolt.schedule.push({
          i0a: base * 0.62,
          t1a: 0.25,
          t2a: 2.5,
          i0b: base * 0.38,
          t1b: 2.0,
          t2b: 230,
          first: false,
          stepped: Math.random() < 0.25,
          gap: 0.03 + Math.random() * 0.035,
        });
      }
    }
    bolt.ccDur = 0.13;
    bolt.ccBumps =
      Math.random() < 0.35
        ? Array.from({ length: 2 + ((Math.random() * 2) | 0) }, () => ({
            t: 0.015 + Math.random() * 0.09,
            amp: 1.5 + Math.random() * 3,
          }))
        : null;
  }
  bolt.dim = Math.log(bolt.cells) / Math.log(GH);
  $("rDim").textContent = bolt.dim.toFixed(2);
  $("rLen").textContent = (bolt.chanLen / 1000).toFixed(2) + " 千米";
}
export function startStroke(k) {
  bolt.strokeIdx = k;
  bolt.nextStroke = 0;
  setPhase(
    "stroke",
    k === 0
      ? ui.positive
        ? "回击 · +CG"
        : "回击"
      : `后续回击 ${k + 1}`,
  );
  $("rStroke").textContent = `${k + 1} / ${bolt.schedule.length}`;
  if (k === 0 && (ui.positive || bolt.schedule[0].i0a >= 60)) {
    bolt.spriteV0 = bolt.simTime + 0.35;
  }
  if (k === 0) {
    /* 二维：听者位于域中心正下方地面处 */
    const listenX = 0;
    const listenY = -(GH * 0.5 + 0.5) * CELL_M; // 计算域底部下方
    const segs = (
      bolt.thunderSegs && bolt.thunderSegs.length
        ? bolt.thunderSegs
        : [{ w: bolt.strikeW, frac: 0 }]
    )
      .map((sg) => {
        const d = Math.hypot(
          sg.w[0] - listenX,
          sg.w[1] - listenY,
        );
        return { d, frac: sg.frac };
      })
      .sort((x, y) => x.d - y.d);
    bolt.thunderDist = segs[0].d;
    bolt.thunderPerf = performance.now() / 1000 + segs[0].d / SND_C;
    if (ui.sound) thunder(bolt.schedule[0].i0a, segs);
  }
}
