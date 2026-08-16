/* ----------------------------------------------------------------
   打包两个 uniform 缓冲区。这里的字节布局必须与
   shaders/compute/common.wgsl 中的 SimU 结构体以及
   shaders/render/common.wgsl 中的 RenU 结构体一致 —— 改一处需同时改另一处。
   ---------------------------------------------------------------- */

import { CELL_M, GH, GW } from "../config.js";
import { bolt, rt, ui } from "./state.js";
import { canvas, prefersStill } from "./dom.js";
import { device, renUBuf, simUBuf } from "./gpu.js";

export const simAB = new ArrayBuffer(64);
export const simU32 = new Uint32Array(simAB),
  simF32 = new Float32Array(simAB);
export function writeSimU() {
  simU32[0] = GW;
  simU32[1] = GH;
  simU32[2] = 1; // gd = 1（二维，为保持结构体兼容而保留）
  simU32[3] = bolt.seed;
  simU32[4] = bolt.seedX;
  simU32[5] = 0; // seedZ 在二维中未使用
  simU32[6] = rt.frameNo;
  simU32[7] = bolt.upOn ? 1 : 0;
  simF32[8] = bolt.boltSeed;
  simF32[9] = ui.eta + (ui.positive ? 0.8 : 0) - (ui.storm ? 0.35 : 0);
  simF32[10] = bolt.simTime;
  simF32[11] = 0;
  simU32[12] = bolt.forkIdx >>> 0;
  simU32[13] = bolt.regrow ? 1 : 0;
  device.queue.writeBuffer(simUBuf, 0, simAB);
}
export const renF = new Float32Array(76);
export function writeRenU(_dt) {
  /* 二维视图矩阵：单位矩阵（无摄像机） */
  const e = bolt.env,
    s = bolt.schedule[bolt.strokeIdx] || {
      i0a: ui.I0,
      t1a: 1.8,
      t2a: 95,
      i0b: 0,
      t1b: 1,
      t2b: 1,
    };
  /* viewProj：单位 4x4（二维正交投影，着色器直接映射） */
  renF.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], 0); // viewProj
  renF.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], 16); // invVP
  renF.set([1, 0, 0, 0], 32); // camRight
  renF.set([0, 1, 0, 0], 36); // camUp
  renF.set([0, 0, 0, 0], 40); // camPos（二维中未使用）
  renF.set([bolt.strikeW[0], bolt.strikeW[1], 0, e.flashLum], 44);
  renF.set([bolt.simTime, e.leaderMul, e.branchFlash, ui.exposure], 48);
  renF.set([bolt.boltSeed, prefersStill ? 0 : 0.016, ui.bloom, 0.004], 52);
  renF.set([e.strokeType, e.tStroke, bolt.chanLen, e.tipPP], 56);
  const spriteT =
    bolt.spriteV0 > 0
      ? Math.min(1, Math.max(0, (bolt.simTime - bolt.spriteV0) / 1.1))
      : 0;
  renF.set([s.i0a, s.t1a, s.t2a, 0], 60); // ha（windX 在二维中未使用）
  renF.set([s.i0b, s.t1b, s.t2b, 0], 64); // hb（windZ 在二维中未使用）
  renF.set([GW, GH, 1, CELL_M], 68); // dims（gd = 1）
  renF.set([canvas.width, canvas.height, (GH - 1) * CELL_M, spriteT], 72);
  device.queue.writeBuffer(renUBuf, 0, renF);
}
