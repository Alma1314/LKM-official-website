/* ----------------------------------------------------------------
   回击电流的 CPU 副本。render/common.wgsl 有它自己的副本 ——
   两者必须保持一致，因为 HUD 读数与闪电亮度来自这里，
   而像素来自着色器那边。
   ---------------------------------------------------------------- */

export function heidlerJS(t, i0, t1, t2) {
  if (t <= 0 || i0 <= 0) return 0;
  const x = (t / t1) ** 2;
  const ec = Math.exp(-(t1 / t2) * Math.sqrt((2 * t2) / t1));
  return (i0 / ec) * (x / (1 + x)) * Math.exp(-t / t2);
}
export const lumOfJS = (i) => 96 * Math.pow(Math.max(i, 0) / 30, 1.4);
