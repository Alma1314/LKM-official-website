/* ----------------------------------------------------------------
   物理时钟与相位状态机。

   每个阶段都有自己的慢动作系数，并按真实秒数推进，而不是按帧推进 ——
   因此梯级先导确实以 2e5 米/秒 的速度缓慢爬行，回击也确实以
   c/3 的速度穿越通道，无论 GPU 有多快都保持不变。
   ---------------------------------------------------------------- */

import { CELL_M, PHYS } from '../config.js';
import { bolt, rt, ui } from '../core/state.js';
import { device, selBuf, upSelBuf } from '../core/gpu.js';
import { heidlerJS, lumOfJS } from '../physics/heidler.js';
import { newBolt, setPhase, startStroke } from './bolt.js';

export function slomoNow() {
  switch (bolt.phase) {
    case 'grow':
      return ui.storm ? 34 : PHYS.SLOMO.grow;
    case 'attach':
      return PHYS.SLOMO.attach;
    case 'regrow':
      return PHYS.SLOMO.regrow;
    case 'stroke': {
      const frontUs = bolt.chanLen / (PHYS.V_RS * 1e-6);
      return bolt.phaseTR * 1e6 < frontUs + 40 ? PHYS.SLOMO.strokeFront : PHYS.SLOMO.strokeTail;
    }
    case 'inter':
      return PHYS.SLOMO.inter;
    case 'dart':
      return PHYS.SLOMO.dart;
    case 'cc':
      return PHYS.SLOMO.cc;
    default:
      return 1;
  }
}
export function updatePhase(dt) {
  const e = bolt.env;
  e.leaderMul = 0;
  e.branchFlash = 0;
  e.strokeType = 0;
  e.tStroke = 0;
  e.tipPP = 0;
  e.flashLum = 0;
  e.curKA = 0;
  bolt.growSteps = 0;

  const slomo = slomoNow() * ui.dilation;
  bolt.slomoNow = slomo;
  const dtR = ui.paused ? 0 : dt / slomo;
  bolt.tReal += dtR;
  bolt.phaseTR += dtR;
  /* 带状闪电：旧通道在后续闪击之间及闪击过程中随风飘移
     （放大了 25 倍，以应对我们的单元格尺寸） */
  if (bolt.strokeIdx > 0 || ['inter', 'dart', 'cc'].includes(bolt.phase)) {
    bolt.windT += dtR;
    bolt.windX = bolt.windVX * bolt.windT * 25;
  }
  bolt.phaseTV += ui.paused ? 0 : dt;
  bolt.simTime += ui.paused ? 0 : dt;

  if (bolt.phase === 'grow' || bolt.phase === 'regrow') {
    e.leaderMul = 1;
    e.curKA = 0.15; // 先导电流约 100 安
    /* 对先端速度进行闭环控制：2e5 米/秒 是最深下降先端的速度，
       而不是整棵树总生长的速度。我从 deepY 回读中测得先端的实际
       下降速度，并通过调节步进速率，直到实测速度与 V_LEADER 匹配
       —— 分支数量随后正如所应的那样，完全由抽签结果决定。 */
    const vT = bolt.phase === 'regrow' ? PHYS.V_DSTEP : PHYS.V_LEADER;
    bolt.stepAcc += ((vT * dtR) / CELL_M) * bolt.stepGain;
    bolt.growSteps = Math.min(10, Math.floor(bolt.stepAcc));
    bolt.stepAcc -= bolt.growSteps;
  } else if (bolt.phase === 'attach') {
    e.leaderMul = 1.6;
    e.flashLum = 1.4;
    e.curKA = 0.9; // 向上延伸的连接先导
    if (bolt.phaseTR > 70e-6 && bolt.schedule.length) startStroke(bolt.nextStroke);
  } else if (bolt.phase === 'stroke') {
    const s = bolt.schedule[bolt.strokeIdx];
    const tUs = bolt.phaseTR * 1e6;
    const iNow = heidlerJS(tUs, s.i0a, s.t1a, s.t2a) + heidlerJS(tUs, s.i0b, s.t1b, s.t2b);
    e.strokeType = 1;
    e.tStroke = tUs;
    e.branchFlash = s.first ? 1 : 0;
    e.curKA = iNow;
    e.flashLum = lumOfJS(iNow) * 0.8;
    const frontUs = bolt.chanLen / (PHYS.V_RS * 1e-6);
    if (tUs > frontUs + 6 * Math.max(s.t2a, s.t2b)) {
      if (bolt.strokeIdx + 1 < bolt.schedule.length) setPhase('inter', '回击间隔');
      else if (bolt.ccBumps) setPhase('cc', '持续电流');
      else setPhase('fade', '恢复中');
    }
  } else if (bolt.phase === 'inter') {
    e.leaderMul = 0.09 * Math.exp(-bolt.phaseTR / 0.018); // 冷却通道的余辉
    /* 反冲先导：脉冲沿衰减的分支急速返回下方 */
    if (bolt.recoilM >= 0) {
      const rt = (bolt.phaseTV - bolt.recoilT0) / 0.13;
      if (rt >= 1) bolt.recoilM = -1;
      else {
        e.strokeType = 4;
        e.tStroke = 1 - rt;
        e.tipPP = bolt.recoilM;
      }
    } else if (bolt.recoilN > 0 && Math.random() < dt * 2.2) {
      bolt.recoilM = (Math.random() * bolt.recoilN) | 0;
      bolt.recoilT0 = bolt.phaseTV;
    }
    const dartDur = bolt.chanLen / PHYS.V_DART;
    if (bolt.phaseTR > bolt.schedule[bolt.strokeIdx].gap - dartDur) {
      const nxt = bolt.schedule[bolt.strokeIdx + 1];
      if (nxt && nxt.stepped && bolt.pathCells && bolt.pathCells.length > 20) beginFork();
      else setPhase('dart', '箭式先导');
    }
  } else if (bolt.phase === 'dart') {
    e.strokeType = 2;
    e.curKA = 1.1;
    e.flashLum = 2.5;
    e.tipPP = Math.max(0, 1 - (bolt.phaseTR * PHYS.V_DART) / bolt.chanLen);
    if (e.tipPP <= 0) startStroke(bolt.strokeIdx + 1);
  }
  // eslint-disable-next-line no-dupe-else-if
  else if (bolt.phase === 'regrow') {
    /* 箭式-梯级：先导沿旧通道潜入到分叉点，随后恢复梯级步进 ——
       生长机制从分叉单元格重新启动，并寻找新的落地点。
       若过于迟缓则退化为普通箭式先导。 */
    if (bolt.phaseTR > 0.012) {
      bolt.regrow = false;
      setPhase('dart', 'DART LEADER');
    }
  } else if (bolt.phase === 'cc') {
    let lum = 2.4,
      amps = 0.12; // 约 100 安的持续电流
    for (const b of bolt.ccBumps) {
      const d = bolt.phaseTR - b.t;
      if (d > 0) {
        lum += b.amp * 14 * Math.exp(-d / 0.004);
        amps += b.amp * Math.exp(-d / 0.004);
      }
    }
    e.strokeType = 3;
    e.tipPP = lum;
    e.flashLum = lum * 2.6;
    e.curKA = amps;
    if (bolt.phaseTR > bolt.ccDur) setPhase('fade', 'RECOVERY');
  } else if (bolt.phase === 'fade') {
    e.flashLum = Math.max(0, 0.5 - bolt.phaseTV * 0.6);
    /* 强对流风暴：接连不断的轰击 —— 下一个雷击地点已在充电 */
    const gapS = ui.storm ? 0.15 + Math.random() * 0.5 : 1.3 + Math.random() * 1.5;
    if (bolt.phaseTV > gapS) newBolt();
  }
}

/* 进入箭式-梯级阶段：在弧线距离的 35%-75% 处选取一个分叉点，
   重置两种抽签，在 GPU 上清空并重播前缘单元格，然后继续生长 */
export function beginFork() {
  const cum = bolt.pathCum,
    path = bolt.pathCells;
  const target = (0.35 + Math.random() * 0.4) * bolt.chanLen;
  let k = 0;
  while (k < path.length - 1 && cum[k] < target) k++;
  bolt.forkIdx = path[k];
  bolt.regrow = true;
  bolt.nextStroke = bolt.strokeIdx + 1;
  bolt.upOn = false;
  bolt.deepY = 0;
  bolt.deepT = bolt.tReal;
  bolt.stepGain = 6;
  bolt.tipV = 0;
  bolt.stepAcc = 0;
  device.queue.writeBuffer(selBuf, 0, new Uint32Array([0, 0, (Math.random() * 1e9) | 0, 0, 0, 0, 0, 0]));
  device.queue.writeBuffer(
    upSelBuf,
    0,
    new Uint32Array([0, 0, 0x40000000 + ((Math.random() * 1e6) | 0), 0, 0, 0, 0, 0])
  );
  rt.needFork = true;
  setPhase('regrow', '箭式-梯级先导');
}

/* 冻结树的分形维数：对通道单元格（两棵树）做二维盒计数。
   在尺寸 2..16 范围内，拟合 log(boxes) 对 log(1/size) 的斜率。 */
