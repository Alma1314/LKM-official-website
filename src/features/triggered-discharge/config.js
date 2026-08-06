/* ----------------------------------------------------------------
   晶格尺寸、每个模块都需要用到的物理常数，以及
   单元格索引与以米为单位的世界坐标之间唯一的映射关系。
   ---------------------------------------------------------------- */

/* 手机 GPU 使用更粗的晶格；物理计算与分辨率无关，
   因为所有速率都通过 CELL_M 以米和秒来表达 */
export const MOBILE = matchMedia("(pointer:coarse)").matches || innerWidth < 830;
export const GW = MOBILE ? 128 : 192,
  GH = MOBILE ? 192 : 288;
export const N = GW * GH;
export const CELL_M = Math.round(4600 / GH); // 为保持分辨率无关性，计算域仍保持约 4.6 公里
export const JACOBI_ITERS = MOBILE ? 8 : 12; // 每帧迭代次数（偶数 → 结果落入 phiA）
export const LIST_CAP = 1 << 18;
export const TER_MIN = Math.floor(0.905 * GH); // 用于击穿距离判定的最低行


export const PHYS = {
  V_LEADER: 2.0e5, // 梯级先导先端速度，米/秒（由闭环保证）
  V_DSTEP: 2.0e6, // 箭式-梯级先导先端速度，米/秒
  V_DART: 1.2e7, // 箭式先导速度，米/秒
  V_RS: 1.3e8, // 回击波前速度，米/秒（c/3，MTLE）
  SLOMO: {
    grow: 150,
    regrow: 900,
    attach: 4000,
    strokeFront: 20000,
    strokeTail: 1500,
    inter: 25,
    dart: 2500,
    cc: 60,
  },
};
export const SND_C = 343; // 声速，米/秒

/* 单元格索引 -> 以米为单位的世界坐标（y 轴向上，原点位于网格中心） */
export const idxToWorld = (idx) => {
  const x = idx % GW,
    y = ((idx / GW) | 0) % GH;
  return [
    (x + 0.5 - GW / 2) * CELL_M,
    (GH * 0.5 - y - 0.5) * CELL_M,
  ];
};
