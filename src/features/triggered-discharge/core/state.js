/* ----------------------------------------------------------------
   所有可变状态，集中存放在一处。

   `ui`   滑块和按钮各自对应的设定值
   `bolt` 当前屏幕上闪电的一切信息
   `rt`   每帧运行时标志（进行中的回读等）
   ---------------------------------------------------------------- */

import { GW, JACOBI_ITERS, PHYS } from '../config.js';

export const ui = {
  eta: 2.0,
  I0: 30,
  dilation: 1,
  exposure: 1.2,
  bloom: 0.7,
  paused: false,
  sound: false,
  positive: false,
  storm: false,
};

export const bolt = {
  phase: 'grow',
  label: 'STEPPED LEADER',
  tReal: 0,
  phaseTR: 0,
  phaseTV: 0,
  simTime: 0,
  seedX: GW >> 1,
  seed: 1,
  boltSeed: Math.random(),
  strikeW: [0, 0],
  sidx: 0,
  cells: 5,
  dim: null,
  chanLen: 0,
  stepAcc: 0,
  growSteps: 0,
  stepGain: 6,
  tipV: 0,
  deepT: 0,
  forkIdx: 0,
  regrow: false,
  nextStroke: 0,
  schedule: [],
  strokeIdx: 0,
  ccBumps: [],
  ccDur: 0.13,
  upOn: false,
  deepY: 0,
  dim2: 0,
  gidx: 0xffffffff,
  windX: 0,
  windZ: 0,
  windT: 0,
  windVX: 0,
  windVZ: 0,
  spriteV0: -1,
  recoilN: 0,
  recoilM: -1,
  recoilT0: 0,
  pathCells: [],
  pathCum: [],
  thunderSegs: [],
  thunderPerf: -1,
  thunderDist: 0,
  env: {
    leaderMul: 1,
    branchFlash: 0,
    strokeType: 0,
    tStroke: 0,
    tipPP: 0,
    flashLum: 0,
    curKA: 0,
  },
  slomoNow: PHYS.SLOMO.grow,
};

/* ----------------------------------------------------------------
   每帧运行时标志。这些原先是一个大闭包里的松散 `let` 变量；
   现在代码被拆分成多个模块，它们被装入一个可变对象，
   这样每个模块读写的是同一份副本（无法对导入的绑定进行赋值）。
   ---------------------------------------------------------------- */
export const rt = {
  selPending: false, // 选择缓冲区回读进行中
  parentPending: false, // 父节点缓冲区回读进行中
  needParents: false, // 发生回击，拉取父节点指针
  flagsPending: false, // 标志回读进行中（分形维数）
  needFractal: false, // 通道已冻结，测量维数 D
  needFork: false, // 箭式-梯级先导这一帧需要分叉
  resPending: false, // 残差探针回读进行中
  jacIters: JACOBI_ITERS, // 自适应雅可比迭代预算，由 residNow 调控
  residNow: 0, // 最近一次测得的场残差
  lastT: 0, // 上一次 requestAnimationFrame 的时间戳，毫秒
  frameNo: 0,
  pngFlag: false, // 本帧之后抓取帧缓冲区
};
