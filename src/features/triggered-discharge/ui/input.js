/* ----------------------------------------------------------------
   二维：点击即引雷（直接映射到网格，无摄像机）。
   ---------------------------------------------------------------- */

import { $, canvas } from "../core/dom.js";
import { CELL_M, GW } from "../config.js";
import { newBolt } from "../sim/bolt.js";

canvas.addEventListener("pointerdown", (ev) => {
  /* 将点击位置直接映射到网格列 */
  const rx = ev.clientX / innerWidth;
  const sx = Math.floor(rx * GW);
  newBolt(sx);
  $("hint").style.opacity = 0;
});
