/* ----------------------------------------------------------------
   着色器组装。

   这里的每一个 .wgsl 文件都是真实的着色器文件，因此编辑器能提供
   语法高亮，编译错误也能指向真实的行号。
   那些被复用的代码块（模拟头文件、Sel 结构体、渲染头文件、
   全屏三角形顶点着色器）会在导入时拼接回一起 —— WGSL 没有
   #include，所以这里就是它的 include。
   Vite 插件 wgsl-raw 自动将 .wgsl 文件作为字符串导出，无需 ?raw 后缀。
   ---------------------------------------------------------------- */

import simCommonSrc from "./compute/common.wgsl";
import selSrc from "./compute/sel-struct.wgsl";
import growMathSrc from "./compute/growth-math.wgsl";
import growResetSrc from "./compute/growth-reset.wgsl";
import growSelectSrc from "./compute/growth-select.wgsl";
import growResolveSrc from "./compute/growth-resolve.wgsl";
import upSelectSrc from "./compute/upward-select.wgsl";
import upResolveSrc from "./compute/upward-resolve.wgsl";
import jacobiSrc from "./compute/jacobi.wgsl";
import clearSrc from "./compute/clear.wgsl";
import residualSrc from "./compute/residual.wgsl";
import forkSrc from "./compute/fork.wgsl";
import renCommonSrc from "./render/common.wgsl";
import fSQuadSrc from "./render/fullscreen.wgsl";
import skySrc from "./render/sky.wgsl";
import terrainSrc from "./render/terrain.wgsl";
import splatSrc from "./render/channel.wgsl";
import downFirstSrc from "./render/bloom-down-first.wgsl";
import downSrc from "./render/bloom-down.wgsl";
import upSrc from "./render/bloom-up.wgsl";
import finalSrc from "./render/composite.wgsl";

export const wgslSimCommon = simCommonSrc;
export const wgslSel = selSrc;
export const wgslGrowMath = wgslSimCommon + wgslSel + growMathSrc;
export const wgslGrowReset = wgslSimCommon + wgslSel + growResetSrc;
export const wgslGrowSelect = wgslGrowMath + growSelectSrc;
export const wgslGrowResolve = wgslGrowMath + growResolveSrc;
export const wgslUpSelect = wgslGrowMath + upSelectSrc;
export const wgslUpResolve = wgslGrowMath + upResolveSrc;
export const wgslJacobi = wgslSimCommon + jacobiSrc;
export const wgslClear = wgslSimCommon + clearSrc;
export const wgslResidual = wgslSimCommon + residualSrc;
export const wgslFork = wgslSimCommon + forkSrc;
export const wgslRenCommon = renCommonSrc;
export const wgslFSQuad = fSQuadSrc;
export const wgslSky = wgslFSQuad + wgslRenCommon + skySrc;
export const wgslTerrain = wgslRenCommon + terrainSrc;
export const wgslSplat = wgslRenCommon + splatSrc;
export const wgslDownFirst = wgslFSQuad + downFirstSrc;
export const wgslDown = wgslFSQuad + downSrc;
export const wgslUp = wgslFSQuad + upSrc;
export const wgslFinal = wgslFSQuad + wgslRenCommon + finalSrc;
