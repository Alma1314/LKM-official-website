/* ----------------------------------------------------------------
   在冻结的通道上做二维盒计数。
   ---------------------------------------------------------------- */

import { $ } from "../core/dom.js";
import { GH, GW, N } from "../config.js";
import { bolt } from "../core/state.js";

export function fractalDim(fl) {
  const sizes = [2, 4, 8, 16];
  const l2 = [],
    li = [];
  for (const bs of sizes) {
    const bx = Math.ceil(GW / bs),
      by = Math.ceil(GH / bs);
    const occ = new Uint8Array(bx * by);
    let n = 0;
    for (let i = 0; i < N; i++) {
      if ((fl[i] & 5) === 0) continue; // 不是通道（两棵树都不算）
      const x = ((i % GW) / bs) | 0,
        y = ((((i / GW) | 0) % GH) / bs) | 0;
      const k = y * bx + x;
      if (!occ[k]) {
        occ[k] = 1;
        n++;
      }
    }
    l2.push(Math.log(n));
    li.push(Math.log(1 / bs));
  }
  const n = li.length,
    mx = li.reduce((a, b) => a + b) / n,
    my = l2.reduce((a, b) => a + b) / n;
  let num = 0,
    den = 0;
  for (let i = 0; i < n; i++) {
    num += (li[i] - mx) * (l2[i] - my);
    den += (li[i] - mx) ** 2;
  }
  bolt.dim2 = num / den;
  $("rDim").textContent = bolt.dim2.toFixed(2);
}
